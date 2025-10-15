import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction } from "@/lib/db";
import { z } from "zod";
import { Deliverable, Milestone } from "@/types/api-projectDetails";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const querySchema = z.object({
  projectId: z.string().uuid({ message: "Invalid project ID format" }),
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

    const validated = querySchema.safeParse({ projectId });
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid project ID format" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const response = await withTransaction(async (client) => {
      const projectResult = await client.query(
        `
        SELECT 
          p.id, p.name, p.type, p.project_price, p.created_at, 
          p.client_name, p.client_email, p.project_duration_days, p.agency_id,
          COALESCE(
            json_agg(
              json_build_object(
                'id', m.id,
                'milestone_price', m.milestone_price,
                'duration_days', m.duration_days,
                'free_revisions', m.free_revisions,
                'title', m.title,
                'description', m.description,
                'status', m.status,
                'revision_rate', m.revision_rate,
                'used_revisions', m.used_revisions,
                'priority', m.priority,
                'reviews', COALESCE(milestone_reviews.reviews, '[]'::json),
                'deliverables', COALESCE(milestone_deliverables.deliverables, '[]'::json)
              ) ORDER BY m.priority ASC, m.created_at ASC
            ) FILTER (WHERE m.id IS NOT NULL),
            '[]'::json
          ) as milestones
        FROM project p
        LEFT JOIN milestones m ON m.project_id = p.id AND m.is_archived = false
        LEFT JOIN LATERAL (
          SELECT 
            r.milestone_id,
            json_agg(
              json_build_object(
                'stars', r.stars,
                'review', r.review,
                'created_at', r.created_at,
                'milestone_id', r.milestone_id
              )
            ) as reviews
          FROM reviews r
          WHERE r.milestone_id = m.id
          GROUP BY r.milestone_id
        ) milestone_reviews ON true
        LEFT JOIN LATERAL (
          SELECT 
            ma.milestone_id,
            json_agg(
              json_build_object(
                'id', ma.id,
                'file_names', ma.file_names,
                'public_ids', ma.public_ids,
                'uploaded_at', ma.uploaded_at,
                'submission_notes', ma.submission_notes,
                'submission_status', ma.submission_status,
                'uploaded_by', ma.uploaded_by
              )
            ) as deliverables
          FROM media_attachments ma
          WHERE ma.milestone_id = m.id AND ma.project_id = p.id
          GROUP BY ma.milestone_id
        ) milestone_deliverables ON true
        WHERE p.id = $1 AND p.agency_id = $2
        GROUP BY p.id
        `,
        [validated.data.projectId, userId]
      );

      if (!projectResult.rows.length) {
        throw Object.assign(new Error("Project not found"), { status: 404 });
      }

      const project = projectResult.rows[0];

      return {
        id: project.id,
        name: project.name,
        type: project.type,
        project_budget: project.project_price,
        created_at: project.created_at,
        client_name: project.client_name,
        client_email: project.client_email,
        project_duration_days: project.project_duration_days,
        milestones: project.milestones.map((m: Milestone) => ({
          milestone_id: m.id,
          milestone_price: m.milestone_price,
          duration_days: m.duration_days,
          free_revisions: m.free_revisions,
          title: m.title,
          description: m.description || "",
          status: m.status || "not_started",
          revision_rate: m.revision_rate || 0,
          used_revisions: m.used_revisions,
          priority: m.priority || 0,
          reviews: m.reviews || [],
          deliverables: (m.deliverables || []).map((d: Deliverable) => ({
            id: d.id,
            name: d.file_names?.[0] || "File Not Submitted",
            uploaded_at: d.uploaded_at,
            submission_notes: d.submission_notes,
            uploaded_by: d.uploaded_by,
            submission_status: d.submission_status,
            file_count: d.file_names?.length || 0,
            public_ids: d.public_ids || [],
          })),
        })),
      };
    });

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Project Detail API Error:", error);

    const status =
      error && typeof error === "object" && "status" in error
        ? error.status
        : 500;
    const message =
      status === 500
        ? "Internal server error"
        : error instanceof Error
        ? error.message
        : "An error occurred";

    return NextResponse.json(
      {
        error: message,
        ...(process.env.NODE_ENV === "development" &&
          error instanceof Error && { stack: error.stack }),
      },
      { status: typeof status === "number" ? status : 500 }
    );
  }
}
