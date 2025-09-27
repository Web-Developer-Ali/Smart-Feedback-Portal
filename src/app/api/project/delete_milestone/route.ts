import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction } from "@/lib/db";
import { z } from "zod";

// --- Validation schema ---
const deleteMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
  projectId: z.string().uuid(),
});

export async function DELETE(request: Request) {
  try {
    // --- Parse and validate query params ---
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get("milestoneId");
    const projectId = searchParams.get("projectId");

    if (!milestoneId || !projectId) {
      return NextResponse.json(
        { error: "Missing required parameters: milestoneId and projectId" },
        { status: 400 }
      );
    }

    const validated = deleteMilestoneSchema.safeParse({ milestoneId, projectId });
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
    const userId = session.user.id as string;

    // --- Run inside transaction ---
    await withTransaction(async (client) => {
      // --- Fetch milestone + project ---
      const { rows: milestoneRows } = await client.query(
        `
        SELECT m.*, p.agency_id, p.name AS project_name, p.status AS project_status, 
               p.project_price AS current_project_price
        FROM milestones m
        JOIN project p ON m.project_id = p.id
        WHERE m.id = $1 AND m.project_id = $2
        `,
        [milestoneId, projectId]
      );

      if (milestoneRows.length === 0) {
        throw new Error("Milestone not found or does not belong to the specified project");
      }

      const milestone = milestoneRows[0];

      // --- Authorization check ---
      if (milestone.agency_id !== userId) {
        throw new Error("Unauthorized access to milestone");
      }

      // --- Prevent deletion if milestone already started ---
      if (milestone.status !== "not_started") {
        throw new Error(
          `Milestone cannot be deleted because it is already "${milestone.status}".`
        );
      }

      // --- Calculate new project price (excluding this milestone) ---
      const { rows: priceRows } = await client.query(
        `
        SELECT COALESCE(SUM(milestone_price), 0) AS remaining_total
        FROM milestones 
        WHERE project_id = $1 AND id != $2 AND status != 'deleted'
        `,
        [projectId, milestoneId]
      );

      const newProjectPrice = parseFloat(priceRows[0].remaining_total);

      // --- Log activity BEFORE deletion ---
      await client.query(
        `
        INSERT INTO project_activities (
          project_id, milestone_id, activity_type, description, performed_by, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `,
        [
          projectId,
          milestoneId,
          "milestone_deleted",
          `Milestone "${milestone.title}" ($${milestone.milestone_price}) deleted from project "${milestone.project_name}". Project price updated from $${milestone.current_project_price} to $${newProjectPrice}.`,
          userId,
          JSON.stringify({
            milestone_title: milestone.title,
            milestone_price: milestone.milestone_price,
            milestone_status: milestone.status,
            milestone_duration: milestone.duration_days,
            previous_project_price: milestone.current_project_price,
            new_project_price: newProjectPrice,
            price_difference: milestone.milestone_price,
            deleted_by: userId,
            deleted_at: new Date().toISOString(),
          }),
        ]
      );

      // --- Delete milestone ---
      const { rowCount: deletedCount } = await client.query(
        `DELETE FROM milestones WHERE id = $1 AND project_id = $2`,
        [milestoneId, projectId]
      );

      if (deletedCount === 0) {
        throw new Error("Failed to delete milestone");
      }

      // --- Update project price ---
      await client.query(
        `
        UPDATE project 
        SET project_price = $1, updated_at = NOW()
        WHERE id = $2
        `,
        [newProjectPrice, projectId]
      );
    });

    return NextResponse.json({
      success: true,
      message: "Milestone deleted successfully",
    });
  } catch (err: unknown) {
    console.error("Milestone Deletion API Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
