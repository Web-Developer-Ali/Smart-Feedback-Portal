import { NextResponse } from "next/server";
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

    const now = new Date().toISOString();

    // Transaction block
    await withTransaction(async (client) => {
      // Fetch milestone
      const milestoneRes = await client.query(
        `
        SELECT m.*, p.project_price AS current_project_price
        FROM milestones m
        JOIN project p ON m.project_id = p.id
        WHERE m.id = $1 AND m.project_id = $2
        `,
        [milestoneId, projectId]
      );

      if (!milestoneRes.rows.length) {
        throw new Error(
          "Milestone not found or does not belong to the specified project"
        );
      }

      const milestone = milestoneRes.rows[0];

      // Validation on status
      if (milestone.status === "rejected") {
        throw new Error("Milestone is already rejected");
      }
      if (milestone.status !== "submitted") {
        throw new Error(
          `Cannot reject milestone in current status: ${milestone.status} (only 'submitted' allowed)`
        );
      }

      // Revision logic - Check if free revisions limit is reached
      const freeRevisionsRemaining =
        milestone.free_revisions - milestone.used_revisions;
      const hasFreeRevisions = freeRevisionsRemaining > 0;

      let revisionCharge = 0;
      let newMilestonePrice = parseFloat(milestone.milestone_price);
      let newProjectPrice = parseFloat(milestone.current_project_price);

      // Apply fixed revision charge from revision_rate ONLY when free revisions limit is reached
      if (!hasFreeRevisions && milestone.revision_rate > 0) {
        // Use the fixed revision_rate amount (e.g., $20) from the database
        revisionCharge = parseFloat(milestone.revision_rate);
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

      // Update media_attachments - set submission_status to 'rejected' and update submission_notes with revision notes
      await client.query(
        `
        UPDATE media_attachments 
        SET submission_status = 'rejected',
            submission_notes = $1
        WHERE milestone_id = $2 AND project_id = $3
        `,
        [revisionNotes, milestoneId, projectId]
      );

      // Update project price if revision charge applied
      if (revisionCharge > 0) {
        await client.query(
          `UPDATE project SET project_price = $1, updated_at = $2 WHERE id = $3`,
          [newProjectPrice, now, projectId]
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: "Milestone rejected successfully",
    });
  } catch (error: unknown) {
    console.error("Reject Milestone API Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
