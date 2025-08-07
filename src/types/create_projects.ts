import { Milestone, ProjectFormData } from "@/lib/validations/create_project"

export interface FormStepProps {
  formData: ProjectFormData
  onInputChange: (field: keyof ProjectFormData, value: any) => void
  errors: Record<string, string>
}

export interface MilestoneStepProps extends FormStepProps {
  onMilestoneChange: (index: number, field: keyof Milestone, value: any) => void
  onAddMilestone: () => void
  onRemoveMilestone: (index: number) => void
}