export interface Project {
  id: string
  name: string
  type: string
  description: string
  created_at: string
  client_name: string
  client_email: string
  project_duration_days: number
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  milestone_price: number
  duration_days: number
  free_revisions: number
  revision_rate: number
  used_revisions: number
  status?: "not_started" | "in_progress" | "submitted" | "approved" | "rejected"
  reviews?: Review[]
}

export interface Review {
  id?: string
  client_name?: string
  stars: number
  review: string
  created_at: string
  milestone_id?: string
}

export interface ProjectResponse {
  id: string;
  name: string;
  type: string;
  created_at: string;
  client_name: string;
  client_email: string;
  project_duration_days: number | null;
  jwt_token: string | null;
  milestones: {
    milestone_id: string;
    milestone_price: number | null;
    duration_days: number | null;
    free_revisions: number | null;
    title: string;
    description: string;
    status: string;
    revision_rate: number;
    used_revisions: number | null;
    reviews: Review[];
  }[];
}

