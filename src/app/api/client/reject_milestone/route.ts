// app/api/milestones/reject/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction } from "@/lib/db";
import { z } from "zod";

// Validation schema
const rejectMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
  projectId: z.string().uuid(),
  revisionNotes: z
    .string()
    .min(1, "Revision notes are required for rejection")
    .max(1000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = rejectMilestoneSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { milestoneId, projectId, revisionNotes } = validated.data;

    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.user.id;

    const now = new Date().toISOString();

    // Transaction block
    const result = await withTransaction(async (client) => {
      // Fetch milestone + project
      const milestoneRes = await client.query(
        `
        SELECT m.*, p.agency_id, p.project_price AS current_project_price, p.name AS project_name
        FROM milestones m
        JOIN project p ON m.project_id = p.id
        WHERE m.id = $1 AND m.project_id = $2
        `,
        [milestoneId, projectId]
      );

      if (!milestoneRes.rows.length) {
        throw new Error("Milestone not found or does not belong to the specified project");
      }

      const milestone = milestoneRes.rows[0];

      // Authorization
      if (milestone.agency_id !== userId) {
        throw new Error("Unauthorized access to milestone");
      }

      // Validation on status
      if (milestone.status === "rejected") {
        throw new Error("Milestone is already rejected");
      }
      if (milestone.status !== "submitted") {
        throw new Error(
          `Cannot reject milestone in current status: ${milestone.status} (only 'submitted' allowed)`
        );
      }

      // Revision logic
      const hasFreeRevisions = milestone.used_revisions < milestone.free_revisions;
      let revisionCharge = 0;
      let newMilestonePrice = milestone.milestone_price;
      let newProjectPrice = milestone.current_project_price;

      if (!hasFreeRevisions && milestone.revision_rate > 0) {
        revisionCharge = milestone.milestone_price * (milestone.revision_rate / 100);
        newMilestonePrice += revisionCharge;
        newProjectPrice += revisionCharge;
      }

      // Update milestone
      const updateRes = await client.query(
        `
        UPDATE milestones
        SET status = 'rejected',
            updated_at = $1,
            used_revisions = used_revisions + 1,
            milestone_price = $2
        WHERE id = $3
        RETURNING *
        `,
        [now, newMilestonePrice, milestoneId]
      );

      if (!updateRes.rows.length) {
        throw new Error("Failed to update milestone");
      }

      // Update project price if revision charge applied
      if (revisionCharge > 0) {
        await client.query(
          `UPDATE project SET project_price = $1, updated_at = $2 WHERE id = $3`,
          [newProjectPrice, now, projectId]
        );
      }

      // Insert rejection message
      const messageRes = await client.query(
        `
        INSERT INTO messages (type, content, project_id, milestone_id, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        `,
        ["rejection", revisionNotes, projectId, milestoneId, userId, now]
      );

      // Insert activity log
      const activityRes = await client.query(
        `
        INSERT INTO project_activities (
          project_id, milestone_id, activity_type, description, performed_by, metadata, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id
        `,
        [
          projectId,
          milestoneId,
          "milestone_rejected",
          `Milestone "${milestone.title}" rejected with revision notes`,
          userId,
          JSON.stringify({
            previous_status: "submitted",
            new_status: "rejected",
            revision_notes: revisionNotes,
            has_free_revisions: hasFreeRevisions,
            revision_charge: revisionCharge,
            new_milestone_price: newMilestonePrice,
            new_project_price: newProjectPrice,
            used_revisions: milestone.used_revisions + 1,
            free_revisions: milestone.free_revisions,
          }),
        ]
      );

      return {
        hasFreeRevisions,
        revisionCharge,
        newMilestonePrice,
        newProjectPrice,
        messageCreated: messageRes.rows.length > 0,
        activityLogged: activityRes.rows.length > 0,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Milestone rejected successfully",
      data: result,
    });
  } catch (error: unknown) {
    console.error("Reject Milestone API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
