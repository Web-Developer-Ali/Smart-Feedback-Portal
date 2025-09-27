import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction } from "@/lib/db";
import { z } from "zod";
import { Milestone, Review, ProjectResponse } from "@/types/ProjectDetailPage";

// --- Dynamic rendering and cache bypass ---
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// --- Input validation schema ---
const querySchema = z.object({
  projectId: z.string().uuid({ message: "Invalid project ID format" }),
});

// --- Helper: map DB milestone row -> API response ---
const mapMilestoneToResponse = (m: Milestone, reviews: Review[] = []) => ({
  milestone_id: m.id,
  milestone_price: m.milestone_price,
  duration_days: m.duration_days,
  free_revisions: m.free_revisions,
  title: m.title,
  description: m.description ?? "",
  status: m.status ?? "not_started",
  revision_rate: m.revision_rate ?? 0,
  used_revisions: m.used_revisions,
  reviews,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    // --- Validate query param ---
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const validated = querySchema.safeParse({ projectId });
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    // --- Authenticate user ---
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // --- Use pooled client with transaction ---
    const response = await withTransaction<ProjectResponse>(async (client) => {
      // --- Fetch project ---
      const projectResult = await client.query(
        `
        SELECT id, name, type, project_price, created_at, client_name, client_email, 
               project_duration_days, agency_id
        FROM project 
        WHERE id = $1
        `,
        [validated.data.projectId]
      );

      if (!projectResult.rows.length) {
        throw Object.assign(new Error("Project not found"), { status: 404 });
      }

      const project = projectResult.rows[0];

      // --- Authorization check ---
      if (project.agency_id !== userId) {
        throw Object.assign(new Error("Unauthorized access to project"), {
          status: 403,
        });
      }

      // --- Fetch milestones & reviews in parallel ---
      const [milestonesResult, reviewsResult] = await Promise.all([
        client.query(
          `
          SELECT id, milestone_price, duration_days, free_revisions, title, 
                 description, status, revision_rate, used_revisions
          FROM milestones 
          WHERE project_id = $1 
          ORDER BY created_at ASC
          `,
          [project.id]
        ),
        client.query(
          `
          SELECT stars, review, created_at, milestone_id 
          FROM reviews 
          WHERE project_id = $1
          `,
          [project.id]
        ),
      ]);

      // --- Group reviews by milestone ---
      const reviewsByMilestone = new Map<string, Review[]>();
      for (const review of reviewsResult.rows) {
        const list = reviewsByMilestone.get(review.milestone_id) ?? [];
        reviewsByMilestone.set(review.milestone_id, [...list, review]);
      }

      // --- Shape response (⚠️ contract unchanged) ---
      return {
        id: project.id,
        name: project.name,
        type: project.type,
        project_budget: project.project_price,
        created_at: project.created_at,
        client_name: project.client_name,
        client_email: project.client_email,
        project_duration_days: project.project_duration_days,
        milestones: milestonesResult.rows.map((m: Milestone) =>
          mapMilestoneToResponse(m, reviewsByMilestone.get(m.id) ?? [])
        ),
      };
    });

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Project Detail API Error:", error);

    const status = error?.status ?? 500;
    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      {
        error: message,
        ...(process.env.NODE_ENV === "development" &&
          error instanceof Error && { stack: error.stack }),
      },
      { status }
    );
  }
}
