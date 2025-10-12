export interface Deliverable {
  name: string;
  url: string;
  notes: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: "pending" | "submitted" | "approved" | "rejected" | "in_progress" | "Not Started";
  deliverables: Deliverable[];
  dueDate: string | null;
  submittedDate: string | undefined;
  price: number;
  duration: string | null;
  freeRevisions: number;
  usedRevisions: number;
  revisionRate: number;
}

export interface MediaAttachment {
  milestone_id: string;
  submission_notes?: string;
  public_ids?: string[];
  file_names?: string[];
}

export interface ProjectResponse {
  id: string;
  title: string;
  status: string;
  description: string;
  type: string;
  freelancerName: string;
  freelancerAvatar: string;
  totalAmount: number;
  milestones: Milestone[];
}