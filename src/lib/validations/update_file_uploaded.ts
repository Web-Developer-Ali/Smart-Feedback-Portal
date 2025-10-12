import z from "zod";

export const recordFilesSchema = z.object({
  milestoneId: z.string().uuid("Valid milestone ID is required"),
  files: z
    .array(
      z.object({
        key: z.string().min(1, "File key is required"),
        name: z.string().min(1, "Filename is required"),
        size: z.number().min(1, "File size must be positive"),
        type: z.string().min(1, "File type is required"),
        lastModified: z.number().optional(),
      })
    )
    .optional()
    .default([]), // Files are now optional with empty array as default
  submissionNotes: z
    .string()
    .min(5, "Submission notes must be at least 5 characters")
    .max(500, "Submission notes must not exceed 500 characters")
    .refine(
      (notes) => notes.trim().length >= 5,
      "Submission notes cannot be empty or just whitespace"
    ),
});
