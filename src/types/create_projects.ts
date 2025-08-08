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

// Additional interfaces for revision management
export interface RevisionSettings {
  free_revisions: number
  revision_rate: number
}

export interface MilestoneWithRevisions extends Milestone {
  free_revisions: number
  revision_rate: number
}

// Form validation result interface
export interface ValidationResult {
  success: boolean
  errors: Record<string, string>
}

// Project creation status
export interface ProjectCreationStatus {
  isLoading: boolean
  isSuccess: boolean
  error: string | null
}

// Step navigation interface
export interface StepNavigation {
  currentStep: number
  totalSteps: number
  canGoNext: boolean
  canGoPrevious: boolean
}

// Milestone summary interface for display
export interface MilestoneSummary {
  totalPrice: number
  totalDays: number
  averageRevisions: number
  totalRevisionCost: number
}
