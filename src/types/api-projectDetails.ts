// API Response Types (exactly matching your API and frontend expectations)
export interface ApiProject {
  id: string
  name: string
  type: string
  created_at: string
  client_name: string
  client_email: string
  project_duration_days: number
  milestones: ApiMilestone[]
  jwt_token?: string
}

export interface ApiMilestone {
  milestone_id: string
  milestone_price: number
  duration_days: number
  free_revisions: number
  title: string
  description: string
  status: "not_started" | "in_progress" | "submitted" | "approved" | "rejected"
  revision_rate: number
  used_revisions: number
  reviews: ApiReview[]
}

export interface ApiReview {
  id: string
  client_name: string
  rating: number
  review: string
  stars: number
  created_at: string
  milestone_id?: string
}

// UI Types (transformed for frontend use)
export interface Project {
  id: string
  name: string
  description: string
  type: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  client_name: string
  client_email: string
  project_budget: number
  estimated_days: number
  created_at: string
  updated_at: string
  review_count: number
  average_rating: number
  progress: number
  jwt_token?: string
}

export interface Milestone {
  id: string
  name: string
  description: string
  duration_days: number
  milestone_price: number
  status: "pending" | "in_progress" | "submitted" | "approved" | "rejected"
  created_at: string
  due_date: string
  submitted_at?: string
  approved_at?: string
  submission_notes?: string
  feedback?: string
  free_revisions: number
  revision_rate: number
  used_revisions: number
  deliverables: Deliverable[]
}

export interface Deliverable {
  id: string
  name: string
  type: "file" | "link" | "text"
  url?: string
  content?: string
  uploaded_at: string
}

export interface Review {
  id: string
  client_name: string
  stars: number
  review: string
  created_at: string
  milestone_id?: string
}

export interface updatedMilestone{
  id: string
  milestone_price: number
  duration_days: number
  free_revisions: number
  name: string
  description: string
   status: "pending" | "in_progress" | "submitted" | "approved" | "rejected"
  revision_rate: number
  used_revisions: number
}

export interface MilestoneWithProject extends Milestone {
  project: Project;
  title: string;
}

export interface UpdateData {
  updated_at: string;
  title?: string;
  description?: string | null;
  duration_days?: number | null;
  milestone_price?: number | null;
  free_revisions?: number | null;
  revision_rate?: number | null;
  status?: string;
}
