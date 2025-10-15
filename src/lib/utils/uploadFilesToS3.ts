import axios, { AxiosError } from "axios";

export type UploadProgress = {
  total: number;
  completed: number;
  status: "preparing" | "uploading" | "recording" | "completed" | "error";
  currentFile?: string;
  currentFileProgress?: number;
  failedFiles: Array<{ file: File; error: string }>;
  timeRemaining?: number; // Time remaining before token expiry in seconds
};

export type UploadResult = {
  success: boolean;
  uploaded: Array<{ key: string; name: string; file: File }>;
  totalFiles: number;
  successful: number;
  failed: number;
  failedFiles: Array<{ file: File; error: string }>;
  error?: string;
  totalTime: number; // Total upload time in milliseconds
};

export type PresignedResponse = {
  data: {
    expiresAt: string;
    expiresIn: number;
    key: string;
    url: string;
  };
  success: boolean;
};

// Configuration
const UPLOAD_CONFIG = {
  maxRetries: 3,
  timeout: 30000, // 30 seconds
  maxConcurrentUploads: 3, // Limit concurrent uploads
  retryDelay: 1000, // 1 second base delay
  bufferTime: 120, // 2 minutes buffer before token expiry
  maxFileSize: 100 * 1024 * 1024, // 100MB limit
} as const;

// Create axios instance with default config
const apiClient = axios.create({
  timeout: UPLOAD_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function uploadFilesToS3WithRetry(
  milestoneId: string,
  files: File[],
  submissionNotes?: string,
  maxRetries = UPLOAD_CONFIG.maxRetries,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const startTime = Date.now();
  const failedFiles: Array<{ file: File; error: string }> = [];
  let completedCount = 0;
  let currentFileProgress = 0;
  let globalExpiryTime: Date | null = null;

  const updateProgress = (
    status: UploadProgress["status"],
    currentFile?: string
  ) => {
    let timeRemaining: number | undefined;

    if (globalExpiryTime) {
      const now = new Date();
      const remainingMs = globalExpiryTime.getTime() - now.getTime();
      timeRemaining = Math.max(0, Math.floor(remainingMs / 1000));
    }

    onProgress?.({
      total: files.length,
      completed: completedCount,
      status,
      currentFile,
      currentFileProgress,
      failedFiles,
      timeRemaining,
    });
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      if (
        error.code === "NETWORK_ERROR" ||
        error.message.includes("CORS") ||
        error.message.includes("Failed to fetch")
      ) {
        return "CORS error: Check S3 bucket CORS configuration";
      }
      return error.response?.data?.message || error.message || "Network error";
    }
    return error instanceof Error ? error.message : "Unknown error occurred";
  };

  const checkTimeRemaining = (): number => {
    if (!globalExpiryTime) return Infinity;

    const now = new Date();
    const remainingMs = globalExpiryTime.getTime() - now.getTime();
    return Math.floor(remainingMs / 1000);
  };

  const isTimeCritical = (): boolean => {
    const remaining = checkTimeRemaining();
    return remaining < UPLOAD_CONFIG.bufferTime;
  };

  const getPresignedUrl = async (
    file: File
  ): Promise<PresignedResponse["data"]> => {
    try {
      const response = await apiClient.post<PresignedResponse>(
        "/api/file_handling/get_presignUrl",
        {
          filename: file.name,
          type: file.type,
          size: file.size,
          milestoneId,
          mode: "write",
        }
      );

      if (!response.data.success || !response.data.data?.url) {
        throw new Error("Invalid presigned URL response");
      }

      // Set global expiry time if not set (use the first presigned URL's expiry)
      if (!globalExpiryTime) {
        globalExpiryTime = new Date(response.data.data.expiresAt);
      }

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get presigned URL: ${getErrorMessage(error)}`);
    }
  };

  const uploadToS3 = async (
    file: File,
    uploadUrl: string,
    fileName: string
  ): Promise<void> => {
    // Check if we have enough time before starting upload
    const timeRemaining = checkTimeRemaining();
    if (timeRemaining < UPLOAD_CONFIG.bufferTime) {
      throw new Error(
        `Insufficient time remaining (${timeRemaining}s) to upload file. Token expiring soon.`
      );
    }

    try {
      // Use fetch instead of axios to avoid unsafe header issues and better CORS handling
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        // No custom headers - let browser set them automatically to avoid preflight
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details");
        console.error("S3 upload failed:", {
          status: response.status,
          statusText: response.statusText,
          details: errorText,
        });
        throw new Error(`S3 upload failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Upload error for ${fileName}:`, error);
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "CORS error: Check S3 bucket CORS configuration. Make sure CORS is properly set for your domain."
        );
      }
      throw error;
    }
  };

  const recordUploads = async (
    successfulUploads: Array<{ key: string; name: string; file: File }>
  ) => {
    const response = await apiClient.post(
      "/api/file_handling/update_file_uploaded",
      {
        milestoneId,
        files: successfulUploads.map(({ key, name, file }) => ({
          key,
          name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        })),
        submissionNotes,
      }
    );

    if (response.status !== 200) {
      throw new Error(
        `Database recording failed with status: ${response.status}`
      );
    }
  };

  const processFile = async (
    file: File
  ): Promise<{ key: string; name: string; file: File } | null> => {
    try {
      // Validate file before upload
      if (!file.name || file.size === 0) {
        throw new Error("Invalid file");
      }

      if (file.size > UPLOAD_CONFIG.maxFileSize) {
        throw new Error(
          `File size exceeds ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB limit`
        );
      }

      updateProgress("uploading", file.name);
      currentFileProgress = 0;

      // Get presigned URL with retry logic
      let presignedData;
      let retries: number = maxRetries;

      while (retries >= 0) {
        try {
          presignedData = await getPresignedUrl(file);
          break;
        } catch (error) {
          if (retries === 0) throw error;
          retries--;
          await delay(UPLOAD_CONFIG.retryDelay * (maxRetries - retries));
        }
      }

      if (!presignedData) {
        throw new Error("Failed to get presigned URL after retries");
      }

      // Upload to S3 with retry logic
      retries = maxRetries as number;

      while (retries >= 0) {
        try {
          await uploadToS3(file, presignedData.url, file.name);
          break;
        } catch (error) {
          // Don't retry if we're running out of time or it's a CORS error
          if (isTimeCritical() || getErrorMessage(error).includes("CORS")) {
            throw error;
          }

          if (retries === 0) throw error;
          retries--;
          await delay(UPLOAD_CONFIG.retryDelay * (maxRetries - retries));
        }
      }

      completedCount++;
      currentFileProgress = 100;
      updateProgress("uploading", file.name);

      return {
        key: presignedData.key,
        name: file.name,
        file,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      failedFiles.push({ file, error: errorMessage });
      console.error(`Failed to upload ${file.name}:`, errorMessage);
      return null;
    }
  };

  try {
    // Validate input
    if (!milestoneId || !files.length) {
      throw new Error("Invalid input: milestoneId and files are required");
    }

    updateProgress("preparing");

    // Process files with concurrency control and time awareness
    const successfulUploads: Array<{ key: string; name: string; file: File }> =
      [];
    const queue = [...files];

    while (queue.length > 0 && !isTimeCritical()) {
      const batch = queue.splice(0, UPLOAD_CONFIG.maxConcurrentUploads);
      const batchResults = await Promise.all(
        batch.map((file) => processFile(file))
      );

      successfulUploads.push(
        ...batchResults.filter(
          (result): result is NonNullable<typeof result> => result !== null
        )
      );

      // Check if we need to stop due to time constraints
      if (isTimeCritical() && queue.length > 0) {
        console.warn(
          `Stopping uploads due to time constraints. ${queue.length} files remaining.`
        );
        // Mark remaining files as failed due to time constraints
        queue.forEach((file) => {
          failedFiles.push({
            file,
            error: `Upload cancelled - insufficient time remaining (${checkTimeRemaining()}s)`,
          });
        });
        break;
      }
    }

    // Record successful uploads in database if we have time
    if (successfulUploads.length > 0 && !isTimeCritical()) {
      updateProgress("recording");
      await recordUploads(successfulUploads);
    }

    updateProgress("completed");

    const totalTime = Date.now() - startTime;

    return {
      success: failedFiles.length === 0,
      uploaded: successfulUploads,
      totalFiles: files.length,
      successful: successfulUploads.length,
      failed: failedFiles.length,
      failedFiles,
      totalTime,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Upload process failed:", error);

    updateProgress("error");

    const totalTime = Date.now() - startTime;

    return {
      success: false,
      error: errorMessage,
      uploaded: [],
      totalFiles: files.length,
      successful: 0,
      failed: files.length,
      failedFiles,
      totalTime,
    };
  }
}

// Utility function to estimate upload time based on file sizes and network speed
export function estimateUploadTime(
  files: File[],
  networkSpeedMbps: number = 5
): number {
  const totalSizeBytes = files.reduce((sum, file) => sum + file.size, 0);
  const totalSizeBits = totalSizeBytes * 8;
  const timeSeconds = totalSizeBits / (networkSpeedMbps * 1024 * 1024);
  return Math.ceil(timeSeconds);
}

// Utility to check if upload is feasible within token expiry
export function canUploadWithinTime(
  files: File[],
  tokenExpiresIn: number, // seconds
  networkSpeedMbps: number = 5
): {
  feasible: boolean;
  estimatedTime: number;
  timeRemaining: number;
  margin: number;
} {
  const estimatedTime = estimateUploadTime(files, networkSpeedMbps);
  const margin = tokenExpiresIn - estimatedTime - UPLOAD_CONFIG.bufferTime;

  return {
    feasible: margin > 0,
    estimatedTime,
    timeRemaining: tokenExpiresIn,
    margin,
  };
}
