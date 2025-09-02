import { z } from "zod"

// Schema for file validation (for form validation)
export const fileValidationSchema = z.object({
  name: z.string(),
  size: z.number().max(20 * 1024 * 1024, "File size must be less than 20MB"),
  type: z.string().refine(
    (type) => [
       'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain'
    ].includes(type),
    "File type not supported"
  )
})

// Schema for form submission
export const submitMilestoneSchema = z.object({
  notes: z.string().min(1, "Submission notes are required"),
  files: z.array(fileValidationSchema).optional(),
})

// Type for form data (what the dialog expects to receive)
export type SubmitMilestoneFormData = z.infer<typeof submitMilestoneSchema>

// Type for the actual submission (what the parent component will handle)
export interface SubmitMilestoneSubmission {
  notes: string;
  files: File[]; // Actual File objects, not just metadata
}