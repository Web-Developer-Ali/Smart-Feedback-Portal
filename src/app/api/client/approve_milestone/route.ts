import { withTransaction } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const approveMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get("milestoneId");

    if (!milestoneId) {
      return NextResponse.json(
        { error: "MilestoneId query parameter is required" },
        { status: 400 }
      );
    }

    // Validate input
    const validated = approveMilestoneSchema.safeParse({ milestoneId });

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Use withTransaction for proper transaction handling
    const result = await withTransaction(async (client) => {
      // 1. First, get the project_id for this milestone
      const projectResult = await client.query(
        `SELECT project_id FROM milestones WHERE id = $1`,
        [milestoneId]
      );

      if (!projectResult.rows.length) {
        throw new Error("Milestone not found");
      }

      const projectId = projectResult.rows[0].project_id;

      // 2. Update milestone status and set is_archived to true
      const updateResult = await client.query(
        `UPDATE milestones 
         SET status = $1, is_archived = $2, updated_at = $3
         WHERE id = $4
         RETURNING *`,
        ["approved", true, new Date().toISOString(), milestoneId]
      );

      if (!updateResult.rows.length) {
        throw new Error("Milestone approval failed");
      }

      // 3. Check if all milestones for this project are approved
      const milestonesCheck = await client.query(
        `SELECT 
           COUNT(*) as total_milestones,
           COUNT(*) FILTER (WHERE status = 'approved') as approved_milestones,
           COUNT(*) FILTER (WHERE status != 'approved' AND status != 'cancelled') as pending_milestones
         FROM milestones 
         WHERE project_id = $1 AND is_archived = false`,
        [projectId]
      );

      const { total_milestones, approved_milestones, pending_milestones } =
        milestonesCheck.rows[0];

      let projectUpdated = false;

      // 4. If all milestones are approved, update project status to "completed"
      if (
        parseInt(approved_milestones) === parseInt(total_milestones) &&
        parseInt(pending_milestones) === 0
      ) {
        await client.query(
          `UPDATE project 
           SET status = $1, updated_at = $2
           WHERE id = $3`,
          ["completed", new Date().toISOString(), projectId]
        );
        projectUpdated = true;
      }

      return {
        milestone: updateResult.rows[0],
        projectId,
        projectUpdated,
        milestones: {
          total: parseInt(total_milestones),
          approved: parseInt(approved_milestones),
          pending: parseInt(pending_milestones),
        },
      };
    });

    return NextResponse.json({
      success: true,
      message: result.projectUpdated
        ? "Milestone approved successfully and project marked as completed"
        : "Milestone approved successfully",
      data: {
        milestone: result.milestone,
        projectUpdated: result.projectUpdated,
        milestones: result.milestones,
      },
    });
  } catch (error: unknown) {
    console.error("API Error:", error);

    if (error instanceof Error) {
      if (error.message === "Milestone not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Milestone approval failed") {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
