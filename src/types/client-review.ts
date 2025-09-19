export interface Milestone {
  id: string
  title: string
  description: string
  status: "pending" |  "approved" | "rejected" | "submitted" | "Not Started"
  deliverables: string[]
  dueDate: string
  submittedDate?: string
  price: number
  duration: string
  freeRevisions: number
  usedRevisions: number
  revisionRate: number
}

export interface Project {
  id: string
  title: string
  freelancerName: string
  freelancerAvatar: string
  totalAmount: number
  milestones: Milestone[]
  description: string
  type: string
  status: string
}

export interface ProjectOverviewProps {
  title: string
  totalAmount: number
  description: string
  type: string
  status: string
}