import { z } from "zod"

export const PROJECT_TYPES = [
  "Web Development",
  "Mobile App",
  "E-commerce",
  "Branding",
  "UI/UX Design",
  "Marketing Campaign",
  "Content Creation",
  "SEO Optimization",
  "Other"
] as const

export const milestoneSchema = z.object({
  name: z.string().min(1, "Milestone name is required").max(100, "Name must be less than 100 characters"),
  duration_days: z.number().min(1, "Duration must be at least 1 day").max(90, "Duration cannot exceed 90 days"),
  milestone_price: z.number().min(50, "Minimum milestone price is $50").max(100000, "Maximum milestone price is $100,000"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  free_revisions: z.number().min(0, "Free revisions cannot be negative").max(10, "Maximum 10 free revisions").default(2),
  revision_rate: z.number().min(0, "Revision rate cannot be negative").max(1000, "Maximum revision rate is $1000").default(50),
})

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Name must be less than 100 characters"),
  type: z.enum(PROJECT_TYPES, { required_error: "Please select a project type" }),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  project_budget: z.number().min(100, "Minimum budget is $100").max(1000000, "Maximum budget is $1,000,000"),
  estimated_days: z.number().min(1, "Minimum duration is 1 day").max(365, "Maximum duration is 365 days"),
  client_name: z.string().min(1, "Client name is required").max(50, "Name must be less than 50 characters"),
  client_email: z.string().email("Please enter a valid email address").max(100, "Email must be less than 100 characters"),
  milestones: z.array(milestoneSchema).min(1, "At least one milestone is required").max(10, "Maximum 10 milestones allowed"),
}).refine((data) => {
  const totalMilestonePrice = data.milestones.reduce((sum, m) => sum + m.milestone_price, 0)
  return totalMilestonePrice <= data.project_budget
}, {
  message: "Total milestone prices cannot exceed project budget",
  path: ["milestones"]
})

export type ProjectFormData = z.infer<typeof createProjectSchema>
export type Milestone = z.infer<typeof milestoneSchema>

export function validateFormStep(step: number, formData: Partial<ProjectFormData>) {
  const errors: Record<string, string> = {}

  switch (step) {
    case 1:
      if (!formData.name?.trim()) {
        errors.name = "Project name is required"
      } else if (formData.name.length > 100) {
        errors.name = "Name must be less than 100 characters"
      }

      if (!formData.type) {
        errors.type = "Please select a project type"
      }

      if (!formData.description?.trim()) {
        errors.description = "Description is required"
      } else if (formData.description.length < 10) {
        errors.description = "Description must be at least 10 characters"
      } else if (formData.description.length > 1000) {
        errors.description = "Description must be less than 1000 characters"
      }
      break

    case 2:
      if (!formData.project_budget || formData.project_budget < 100) {
        errors.project_budget = "Minimum budget is $100"
      } else if (formData.project_budget > 1000000) {
        errors.project_budget = "Maximum budget is $1,000,000"
      }

      if (!formData.estimated_days || formData.estimated_days < 1) {
        errors.estimated_days = "Minimum duration is 1 day"
      } else if (formData.estimated_days > 365) {
        errors.estimated_days = "Maximum duration is 365 days"
      }
      break

    case 3:
      if (!formData.client_name?.trim()) {
        errors.client_name = "Client name is required"
      } else if (formData.client_name.length > 50) {
        errors.client_name = "Name must be less than 50 characters"
      }

      if (!formData.client_email?.trim()) {
        errors.client_email = "Client email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
        errors.client_email = "Please enter a valid email address"
      } else if (formData.client_email.length > 100) {
        errors.client_email = "Email must be less than 100 characters"
      }
      break

    case 4:
      if (!formData.milestones || formData.milestones.length === 0) {
        errors.milestones = "At least one milestone is required"
      } else {
        formData.milestones.forEach((milestone, index) => {
          if (!milestone.name?.trim()) {
            errors[`milestones.${index}.name`] = "Milestone name is required"
          } else if (milestone.name.length > 100) {
            errors[`milestones.${index}.name`] = "Name must be less than 100 characters"
          }

          if (!milestone.duration_days || milestone.duration_days < 1) {
            errors[`milestones.${index}.duration_days`] = "Duration must be at least 1 day"
          } else if (milestone.duration_days > 90) {
            errors[`milestones.${index}.duration_days`] = "Duration cannot exceed 90 days"
          }

          if (!milestone.milestone_price || milestone.milestone_price < 50) {
            errors[`milestones.${index}.milestone_price`] = "Minimum milestone price is $50"
          } else if (milestone.milestone_price > 100000) {
            errors[`milestones.${index}.milestone_price`] = "Maximum milestone price is $100,000"
          }

          if (milestone.description && milestone.description.length > 500) {
            errors[`milestones.${index}.description`] = "Description must be less than 500 characters"
          }
        })

        // Check total milestone price vs budget
        if (formData.project_budget) {
          const totalMilestonePrice = formData.milestones.reduce((sum, m) => sum + (m.milestone_price || 0), 0)
          if (totalMilestonePrice > formData.project_budget) {
            errors.milestones = "Total milestone prices cannot exceed project budget"
          }
        }
      }
      break
  }

  return {
    success: Object.keys(errors).length === 0,
    errors
  }
}


// Schema for updating a milestone - all fields optional
export const updateMilestoneSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional().nullable(),
  description: z.string().optional().nullable(),
  duration_days: z.number().int().positive().optional().nullable(),
  milestone_price: z.number().positive().optional().nullable(),
  free_revisions: z.number().int().nonnegative().optional().nullable(),
  revision_rate: z.number().nonnegative().optional().nullable(),
  status: z.enum(["not_started", "in_progress", "completed", "revision"]).optional().nullable(),
});
