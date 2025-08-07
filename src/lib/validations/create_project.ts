import { z } from "zod"

// Project form validation schemas
export const projectDetailsSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_&.]+$/, "Project name contains invalid characters"),
  type: z.enum([
    "Web Development",
    "Mobile Development", 
    "UI/UX Design",
    "Branding",
    "Digital Marketing",
    "E-commerce",
    "Custom Software",
    "Other"
  ], {
    required_error: "Please select a project type",
    invalid_type_error: "Invalid project type selected"
  }),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters")
    .trim()
})

export const budgetTimelineSchema = z.object({
  project_budget: z
    .number({
      required_error: "Project budget is required",
      invalid_type_error: "Budget must be a valid number"
    })
    .min(100, "Budget must be at least $100")
    .max(1000000, "Budget cannot exceed $1,000,000")
    .positive("Budget must be a positive number"),
  estimated_days: z
    .number({
      required_error: "Estimated days is required", 
      invalid_type_error: "Days must be a valid number"
    })
    .min(1, "Project must take at least 1 day")
    .max(365, "Project cannot exceed 365 days")
    .int("Days must be a whole number")
})

export const clientInfoSchema = z.object({
  client_name: z
    .string()
    .min(2, "Client name must be at least 2 characters")
    .max(50, "Client name must be less than 50 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Client name contains invalid characters")
    .trim(),
  client_email: z
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters")
    .toLowerCase()
    .trim()
})

export const milestoneSchema = z.object({
  name: z
    .string()
    .min(3, "Milestone name must be at least 3 characters")
    .max(100, "Milestone name must be less than 100 characters")
    .trim(),
  duration_days: z
    .number({
      required_error: "Duration is required",
      invalid_type_error: "Duration must be a valid number"
    })
    .min(1, "Duration must be at least 1 day")
    .max(90, "Duration cannot exceed 90 days")
    .int("Duration must be a whole number"),
  milestone_price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a valid number"
    })
    .min(50, "Price must be at least $50")
    .max(100000, "Price cannot exceed $100,000")
    .positive("Price must be a positive number"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .default("")
})

export const milestonesSchema = z.object({
  milestones: z
    .array(milestoneSchema)
    .min(1, "At least one milestone is required")
    .max(10, "Cannot have more than 10 milestones")
    .refine(
      (milestones) => {
        const totalPrice = milestones.reduce((sum, m) => sum + m.milestone_price, 0)
        return totalPrice >= 100
      },
      {
        message: "The total of all milestone prices must be at least $100",
        path: ["milestones"]
      }
    )
})

// Complete project form schema
export const createProjectSchema = projectDetailsSchema
  .merge(budgetTimelineSchema)
  .merge(clientInfoSchema)
  .merge(milestonesSchema)
  .refine(
    (data) => {
      const totalMilestonePrice = data.milestones.reduce((sum, m) => sum + m.milestone_price, 0)
      const budgetRange = data.project_budget * 0.1
      return Math.abs(totalMilestonePrice - data.project_budget) <= budgetRange
    },
    {
      message: "Total milestone prices must be within 10% of project budget",
      path: ["milestones"]
    }
  )

// TypeScript types
export type ProjectFormData = z.infer<typeof createProjectSchema>
export type ProjectDetails = z.infer<typeof projectDetailsSchema>
export type BudgetTimeline = z.infer<typeof budgetTimelineSchema>
export type ClientInfo = z.infer<typeof clientInfoSchema>
export type Milestone = z.infer<typeof milestoneSchema>
export type MilestonesData = z.infer<typeof milestonesSchema>

// Constants
export const PROJECT_TYPES = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design", 
  "Branding",
  "Digital Marketing",
  "E-commerce",
  "Custom Software",
  "Other"
] as const

// Form step validation
export const validateFormStep = (step: number, data: Partial<ProjectFormData>) => {
  try {
    switch (step) {
      case 1:
        projectDetailsSchema.parse({
          name: data.name,
          type: data.type,
          description: data.description
        })
        return { success: true, errors: {} }
      case 2:
        budgetTimelineSchema.parse({
          project_budget: data.project_budget,
          estimated_days: data.estimated_days
        })
        return { success: true, errors: {} }
      case 3:
        clientInfoSchema.parse({
          client_name: data.client_name,
          client_email: data.client_email
        })
        return { success: true, errors: {} }
      case 4:
        milestonesSchema.parse({
          milestones: data.milestones || []
        })
        return { success: true, errors: {} }
      default:
        return { success: false, errors: { general: "Invalid step" } }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.')
        acc[path] = err.message
        return acc
      }, {} as Record<string, string>)
      return { success: false, errors }
    }
    return { success: false, errors: { general: "Validation failed" } }
  }
}