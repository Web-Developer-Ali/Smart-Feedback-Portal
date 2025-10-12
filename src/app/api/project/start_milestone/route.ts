import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PoolClient } from "pg";

const startMilestoneSchema = z.object({
  milestone_id: z.string().uuid("Valid milestone ID is required"),
  notes: z.string().optional().nullable(),
});

type MilestoneWithProject = {
  id: string;
  project_id: string;
  agency_id: string;
  title?: string;
  status?: string;
  duration_days?: number;
  milestone_price?: number;
  project_status?: string;
  project_name?: string;
  started_at?: string | null;
  updated_at?: string | null;
  starting_notes?: string | null;
};

export async function POST(request: Request) {
  let milestoneDetails: MilestoneWithProject | null = null;

  try {
    // parse body + session in parallel
    const [bodyResult, sessionResult] = await Promise.allSettled([
      request.json(),
      getServerSession(authOptions),
    ]);

    if (bodyResult.status === "rejected") {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (sessionResult.status === "rejected" || !sessionResult.value?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = sessionResult.value.user.id;
    const validated = startMilestoneSchema.safeParse(bodyResult.value);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { milestone_id, notes } = validated.data;

    // Run the DB operations inside a single transaction
    const result = await withTransaction(async (client: PoolClient) => {
      // fetch milestone + project
      const milestoneRes = await client.query<MilestoneWithProject>(
        `
        SELECT m.*, p.id as project_id, p.agency_id, p.status as project_status, p.name as project_name
        FROM milestones m
        JOIN project p ON m.project_id = p.id
        WHERE m.id = $1
        `,
        [milestone_id]
      );

      if (!milestoneRes.rows.length) {
        const err = Object.assign(new Error("Milestone not found"), {
          status: 404,
        });
        throw err;
      }

      milestoneDetails = milestoneRes.rows[0];

      // authorization
      if (milestoneDetails.agency_id !== userId) {
        const err = Object.assign(
          new Error("Unauthorized access to milestone"),
          { status: 403 }
        );
        throw err;
      }

      // validate project status
      const validProjectStatuses = ["active", "in_progress", "pending"];
      if (
        !validProjectStatuses.includes(milestoneDetails.project_status || "")
      ) {
        const err = Object.assign(
          new Error(
            `Cannot start milestones for project with status "${milestoneDetails.project_status}"`
          ),
          {
            status: 400,
            details: { project_status: milestoneDetails.project_status },
          }
        );
        throw err;
      }

      // milestone must be not_started
      if (milestoneDetails.status !== "not_started") {
        const err = Object.assign(
          new Error(
            `Milestone cannot be started; current status "${milestoneDetails.status}"`
          ),
          {
            status: 400,
            details: {
              current_status: milestoneDetails.status,
              allowed_status: "not_started",
            },
          }
        );
        throw err;
      }

      // ensure no other milestone is in_progress for the same project
      const inProgressRes = await client.query(
        `SELECT id, title, status FROM milestones WHERE project_id = $1 AND status = 'in_progress'`,
        [milestoneDetails.project_id]
      );

      if (inProgressRes.rows.length > 0) {
        const err = Object.assign(
          new Error("Another milestone is already in progress"),
          { status: 400 }
        );
        throw err;
      }

      const now = new Date().toISOString();

      // update milestone
      const updateRes = await client.query<MilestoneWithProject>(
        `
        UPDATE milestones
        SET status = $1, started_at = $2, updated_at = $3, starting_notes = $4
        WHERE id = $5
        RETURNING *
        `,
        ["in_progress", now, now, notes ?? null, milestone_id]
      );

      if (!updateRes.rows.length) {
        throw new Error("Milestone status update failed");
      }

      const updatedMilestone = updateRes.rows[0];

      // update project status to in_progress if it was pending
      let projectUpdated = false;
      if (milestoneDetails.project_status === "pending") {
        const projectUpdateRes = await client.query(
          `UPDATE project SET status = $1, updated_at = $2 WHERE id = $3`,
          ["in_progress", now, milestoneDetails.project_id]
        );
        projectUpdated = (projectUpdateRes.rowCount ?? 0) > 0;
      }

      // log activity (non-blocking)
      try {
        await client.query(
          `
          INSERT INTO project_activities (
            project_id, milestone_id, activity_type, description, performed_by, metadata, created_at
          ) VALUES ($1,$2,$3,$4,$5,$6,NOW())
          RETURNING id
          `,
          [
            milestoneDetails.project_id,
            milestone_id,
            "milestone_started",
            `Milestone "${milestoneDetails.title ?? milestone_id}" started`,
            userId,
            JSON.stringify({
              previous_status: "not_started",
              new_status: "in_progress",
              notes: notes ?? null,
              project_name: milestoneDetails.project_name ?? null,
            }),
          ]
        );
      } catch (logErr) {
        console.error("Activity log failed (non-critical):", logErr);
      }

      return {
        updatedMilestone,
        projectUpdated,
        projectId: milestoneDetails.project_id,
      };
    });

    // revalidate cache (non-blocking)
    try {
      revalidatePath(`/dashboard/project/${result.projectId}`);
      revalidatePath("/dashboard/project");
    } catch (cacheErr) {
      console.error("Cache revalidation failed:", cacheErr);
    }

    return NextResponse.json({
      success: true,
      message: "Milestone started successfully",
      data: {
        milestone: result.updatedMilestone,
        project_updated: result.projectUpdated,
        activity_logged: true,
      },
    });
  } catch (error: unknown) {
  console.error("Start Milestone API Error:", error);

  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: number }).status === "number"
      ? (error as { status: number }).status
      : 500;

  const message =
    error instanceof Error ? error.message : "Internal server error";

  return NextResponse.json({ error: message }, { status });
}
}
