import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

// =====================
//  S3 Configuration
// =====================
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// =====================
//  Validation Schema
// =====================
const presignedUrlSchema = z.object({
  filename: z.string().min(1, "Filename is required")
    .max(255, "Filename too long")
    .refine(name => !name.includes("/") && !name.includes("\\"), "Invalid filename"),
  type: z.string().min(1, "File type is required"),
  size: z.number().min(0, "File size must be non-negative"),
  milestoneId: z.string().uuid().optional(),
  mode: z.enum(["read", "write"]).default("write"),
  key: z.string().optional() // ✅ for read mode
});

// =====================
//  Allowed Types & Limits
// =====================
const ALLOWED_FILE_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", "text/csv",
  "application/zip", "application/x-rar-compressed"
];

const FILE_SIZE_LIMITS = {
  IMAGE: 20 * 1024 * 1024,
  DOCUMENT: 50 * 1024 * 1024,
  OTHER: 100 * 1024 * 1024,
};

// =====================
//  Helpers
// =====================
function getExpiryForFile(size: number, filetype: string) {
  if (size > 50 * 1024 * 1024) return 300;
  if (size > 10 * 1024 * 1024) return 600;
  if (filetype.startsWith("image/")) return 1800;
  return 900;
}

function getSizeLimitForFileType(filetype: string): number {
  if (filetype.startsWith("image/")) return FILE_SIZE_LIMITS.IMAGE;
  if (filetype.startsWith("application/") || filetype.startsWith("text/")) return FILE_SIZE_LIMITS.DOCUMENT;
  return FILE_SIZE_LIMITS.OTHER;
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, "")
    .replace(/[\\/]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .substring(0, 100);
}

// =====================
//  POST Handler
// =====================
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    const body = await req.json();
    const parsed = presignedUrlSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { filename, type, size, milestoneId, mode, key: providedKey } = parsed.data;

    if (mode === "write" && !ALLOWED_FILE_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "File type not allowed", allowedTypes: ALLOWED_FILE_TYPES },
        { status: 400 }
      );
    }

    const sanitizedFilename = sanitizeFilename(filename);
    const timestamp = Date.now();
    const expiresIn = getExpiryForFile(size, type);

    // ✅ Determine key
    const key =
      mode === "read"
        ? providedKey || ""
        : `uploads/${userId}/${milestoneId || "general"}/${timestamp}-${sanitizedFilename}`;

    if (mode === "read" && !key) {
      return NextResponse.json({ error: "Missing file key for read mode" }, { status: 400 });
    }

    let url: string;

    if (mode === "write") {
      const sizeLimit = getSizeLimitForFileType(type);
      if (size > sizeLimit) {
        return NextResponse.json(
          {
            error: `File too large for ${type.split("/")[0]} files`,
            maxSize: `${Math.round(sizeLimit / (1024 * 1024))}MB`,
            currentSize: `${Math.round(size / (1024 * 1024))}MB`,
          },
          { status: 400 }
        );
      }

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        ContentType: type,
        ContentLength: size ?? 0,
        Metadata: {
          "uploaded-by": userId ?? "",
          "original-filename": filename ?? "",
          "upload-timestamp": timestamp.toString(),
          "milestone-id": milestoneId || "",
        },
      });

      url = await getSignedUrl(s3, command, { expiresIn });
    } else {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      });
      url = await getSignedUrl(s3, command, { expiresIn });
    }

    return NextResponse.json({
      success: true,
      data: {
        url,
        key,
        mode,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Presign URL Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
