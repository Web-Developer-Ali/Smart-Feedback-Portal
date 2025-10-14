import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction } from "@/lib/db";
import { z } from "zod";
import {
  Deliverable,
  MediaAttachment,
  Milestone,
  ProjectResponse,
} from "@/types/client-review_api";

const ProjectSchema = z.object({
  projectId: z.string().uuid(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const validated = ProjectSchema.safeParse({ projectId });
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid project ID format" },
        { status: 400 }
      );
    }

    const projectData = await withTransaction(async (client) => {
      // Fetch project
      const projectResult = await client.query(
        `SELECT id, name, description, type, status, client_name, project_price, agency_id, client_email
         FROM project WHERE id = $1`,
        [projectId]
      );

      if (!projectResult.rows.length) {
        return null;
      }

      const project = projectResult.rows[0];

      // Fetch milestones + media + reviews in parallel with same client
      const [milestonesResult, mediaResult, reviewsResult] = await Promise.all([
        client.query(
          `SELECT id, title, description, status, milestone_price, duration_days, 
                  free_revisions, used_revisions, revision_rate, created_at, submitted_at
           FROM milestones 
           WHERE project_id = $1 
           ORDER BY created_at`,
          [projectId]
        ),
        client.query(
          `SELECT milestone_id, submission_notes, public_ids, file_names
           FROM media_attachments WHERE project_id = $1`,
          [projectId]
        ),
        client.query(
          `SELECT milestone_id
           FROM reviews 
           WHERE project_id = $1`,
          [projectId]
        ),
      ]);

      const milestones = milestonesResult.rows || [];
      const mediaAttachments = mediaResult.rows || [];
      const reviews = reviewsResult.rows || [];

      // Check for project review (milestone_id IS NULL)
      const hasProjectReview = reviews.some(
        (review: any) => review.milestone_id === null
      );

      // Create a set of milestone IDs that have reviews for quick lookup
      const milestoneIdsWithReviews = new Set(
        reviews
          .filter((review: any) => review.milestone_id !== null)
          .map((review: any) => review.milestone_id)
      );

      // Group media by milestone
      const mediaByMilestone = mediaAttachments.reduce(
        (acc: Record<string, MediaAttachment[]>, media: MediaAttachment) => {
          (acc[media.milestone_id] ||= []).push(media);
          return acc;
        },
        {}
      );

      const transformed: ProjectResponse = {
        id: project.id,
        title: project.name,
        status: project.status,
        description: project.description || "",
        type: project.type || "",
        freelancerName: project.client_name,
        freelancerAvatar: "/professional-woman-developer.png",
        totalAmount: project.project_price,
        hasProjectReview,
        milestones: milestones.map((m) => {
          const milestoneMedia = mediaByMilestone[m.id] || [];

          const deliverables: Deliverable[] = [];

          milestoneMedia.forEach((media: MediaAttachment) => {
            if (
              Array.isArray(media.public_ids) &&
              media.public_ids.length > 0
            ) {
              media.public_ids.forEach((publicId: string, idx: number) => {
                deliverables.push({
                  name: Array.isArray(media.file_names)
                    ? media.file_names[idx] || `file-${idx + 1}`
                    : `file-${idx + 1}`,
                  url: publicId,
                  notes: media.submission_notes || "",
                });
              });
            } else if (
              Array.isArray(media.file_names) &&
              media.file_names.length > 0
            ) {
              media.file_names.forEach((fileName: string, idx: number) => {
                deliverables.push({
                  name: fileName,
                  url: `#file-not-available-${idx}`,
                  notes:
                    media.submission_notes ||
                    `File available upon request - ${fileName}`,
                });
              });
            }
          });

          return {
            id: m.id,
            title: m.title,
            description: m.description || "",
            status: mapStatusToFrontend(m.status),
            deliverables,
            dueDate:
              m.created_at && m.duration_days
                ? calculateDueDate(m.created_at, m.duration_days)
                : null,
            submittedDate: m.submitted_at
              ? new Date(m.submitted_at).toISOString().split("T")[0]
              : undefined,
            price: m.milestone_price,
            duration: m.duration_days ? `${m.duration_days} days` : null,
            freeRevisions: m.free_revisions || 0,
            usedRevisions: m.used_revisions || 0,
            revisionRate: m.revision_rate || 0,
            // Milestone review flag only (no detailed review object)
            hasReview: milestoneIdsWithReviews.has(m.id),
          };
        }),
      };

      return transformed;
    });

    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(projectData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json(
          { error: "Unauthorized access to project" },
          { status: 403 }
        );
      }
      console.error("Project Details API Error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function mapStatusToFrontend(
  status: string
):
  | "pending"
  | "submitted"
  | "approved"
  | "rejected"
  | "Not Started"
  | "in_progress" {
  const statusMap: Record<string, Milestone["status"]> = {
    submitted: "submitted",
    approved: "approved",
    rejected: "rejected",
    in_progress: "pending",
    not_started: "Not Started",
  };
  return statusMap[status.toLowerCase()] || "Not Started";
}

function calculateDueDate(createdAt: string, durationDays: number): string {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + durationDays);
  return date.toISOString().split("T")[0];
}

export const dynamic = "force-dynamic";
