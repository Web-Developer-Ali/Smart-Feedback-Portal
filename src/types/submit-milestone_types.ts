import z from "zod";
import type { Milestone } from "@/types/api-projectDetails";
import { submitMilestoneSchema } from "@/components/project_detail/project_tabs_files/validation-schemas";

// Import the actual UploadProgress type from the upload function
import type { UploadProgress as UploadFunctionProgress } from "@/lib/utils/uploadFilesToS3";

export interface SubmitMilestoneDialogProps {
  milestone: Milestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface FileUploadProgress {
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

// Use the actual UploadProgress type from the upload function
export type UploadProgress = UploadFunctionProgress;

export interface UploadSectionProps {
  selectedFiles: File[];
  fileProgress: Map<string, FileUploadProgress>;
  overallProgress: UploadProgress | null;
  errors: { files?: string };
  isDragging: boolean;
  uploading: boolean;
  uploadResult: { success: boolean; successful: number; failed: number } | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onRemoveFile: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

// Constants
export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "text/plain",
];

// Validation schema
export const getValidationSchema = () =>
  submitMilestoneSchema.extend({
    files: z
      .array(
        z.object({
          name: z.string(),
          size: z.number(),
          type: z.string(),
        })
      )
      .optional(),
    notes: z.string().min(1, "Submission notes are required"),
  });
