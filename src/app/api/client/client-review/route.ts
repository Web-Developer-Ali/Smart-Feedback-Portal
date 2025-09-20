import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

// Validation schema
const ProjectSchema = z.object({
  projectId: z.string().uuid(),
})

// Type definitions matching your component
interface Deliverable {
  name: string;
  url: string;
  notes: string;
}

interface Milestone {
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

interface ProjectResponse {
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

// Supabase types
interface Database {
  public: {
    Tables: {
      milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: string;
          milestone_price: number;
          duration_days: number | null;
          free_revisions: number;
          used_revisions: number;
          revision_rate: number;
          created_at: string;
          submitted_at: string | null;
        };
      };
      project: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: string | null;
          status: string;
          client_name: string;
          project_price: number;
          agency_id: string;
          client_email: string;
        };
      };
      media_attachments: {
        Row: {
          id: string;
          milestone_id: string;
          project_id: string;
          submission_notes: string;
          public_ids: string[];
          file_name: string[];
          uploaded_at: string;
        };
      };
    };
  };
}

type Supabase = SupabaseClient<Database>;

export async function GET(request: Request) {
  const supabase = createClient() as Supabase
  
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Validate input format
    const validated = ProjectSchema.safeParse({ projectId })
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid project ID format" },
        { status: 400 }
      )
    }

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get project details with single query
    const { data: project, error: projectError } = await supabase
      .from("project")
      .select("*")
      .eq("id", projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check authorization
    if (project.agency_id !== user.id && project.client_email !== user.email) {
      return NextResponse.json({ error: "Unauthorized access to project" }, { status: 403 })
    }

    // Get milestones with media attachments in parallel for better performance
    const [milestonesResult, mediaResult] = await Promise.all([
      supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at"),
      
      supabase
        .from("media_attachments")
        .select("milestone_id, submission_notes, public_ids, file_name")
        .eq("project_id", projectId)
    ]);

    if (milestonesResult.error) {
      return NextResponse.json({ error: "Error fetching milestones" }, { status: 500 })
    }

    const milestones = milestonesResult.data || [];
    const mediaAttachments = mediaResult.data || [];

    // Group media attachments by milestone_id for efficient lookup
    const mediaByMilestone = mediaAttachments.reduce((acc, media) => {
      if (!acc[media.milestone_id]) {
        acc[media.milestone_id] = [];
      }
      acc[media.milestone_id].push(media);
      return acc;
    }, {} as Record<string, typeof mediaAttachments>);

    // Transform data to match component expectations with file URLs
    const transformedProject: ProjectResponse = {
      id: project.id,
      title: project.name,
      status: project.status,
      description: project.description || "",
      type: project.type || "",
      freelancerName: project.client_name,
      freelancerAvatar: "/professional-woman-developer.png",
      totalAmount: project.project_price,
      milestones: milestones.map((milestone) => {
        const milestoneMedia = mediaByMilestone[milestone.id] || [];
        
        // Create deliverables with proper file URLs
        const deliverables: Deliverable[] = [];
        
        milestoneMedia.forEach(media => {
          if (media.public_ids && media.public_ids.length > 0) {
            media.public_ids.forEach((publicId:string, index:number) => {
              const fileName = media.file_name?.[index] || `file-${index + 1}`;
              const fileUrl = publicId;
              
              deliverables.push({
                name: fileName,
                url: fileUrl,
                notes: media.submission_notes || ''
              });
            });
          } else if (media.file_name && media.file_name.length > 0) {
            // Fallback if public_ids are missing but file_names exist
            media.file_name.forEach((fileName:string, index:number) => {
              deliverables.push({
                name: fileName,
                url: `#file-not-available-${index}`, // Placeholder URL
                notes: media.submission_notes || `File available upon request - ${fileName}`
              });
            });
          }
        });

        return {
          id: milestone.id,
          title: milestone.title,
          description: milestone.description || "",
          status: mapStatusToFrontend(milestone.status),
          deliverables: deliverables,
          dueDate: milestone.created_at && milestone.duration_days
            ? calculateDueDate(milestone.created_at, milestone.duration_days)
            : null,
          submittedDate: milestone.submitted_at
            ? new Date(milestone.submitted_at).toISOString().split("T")[0]
            : undefined,
          price: milestone.milestone_price,
          duration: milestone.duration_days ? `${milestone.duration_days} days` : null,
          freeRevisions: milestone.free_revisions || 0,
          usedRevisions: milestone.used_revisions || 0,
          revisionRate: milestone.revision_rate || 0,
        };
      }),
    };

    return NextResponse.json(transformedProject)

  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function mapStatusToFrontend(
  status: string
): "pending" | "submitted" | "approved" | "rejected" | "Not Started" | "in_progress" {
  const statusMap: Record<string, Milestone["status"]> = {
    submitted: "submitted",
    approved: "approved",
    rejected: "rejected",
    in_progress: "pending",
    not_started: "Not Started"
  };
  return statusMap[status.toLowerCase()] || "Not Started";
}

function calculateDueDate(createdAt: string, durationDays: number): string {
  const date = new Date(createdAt)
  date.setDate(date.getDate() + durationDays)
  return date.toISOString().split("T")[0]
}

// Add caching headers for better performance
export const config = {
  runtime: 'nodejs',
};

// Optional: Add revalidation for incremental static regeneration
export const revalidation = 60; // 60 seconds