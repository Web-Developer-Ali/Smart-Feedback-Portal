import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PoolClient } from "pg";
import { updateMilestoneSchema } from "@/lib/validations/create_project";


const nullToUndefined = <T>(value: T | null | undefined): T | undefined =>
  value === null ? undefined : value;

export async function PUT(request: Request) {
  let client: PoolClient | null = null;

  try {
    const [requestData, session] = await Promise.allSettled([
      request.json(),
      getServerSession(authOptions),
    ]);

    if (requestData.status === "rejected") {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    if (session.status === "rejected" || !session.value?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session.value.user.id;
    const validated = updateMilestoneSchema.safeParse(requestData.value);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 422 }
      );
    }

    // Connect client
    client = await pool.connect();

    // Fetch milestone with project details
    const milestoneResult = await client.query(
      `SELECT m.*, p.project_price, p.project_duration_days, 
              p.agency_id, p.name as project_name
       FROM milestones m
       JOIN project p ON m.project_id = p.id
       WHERE m.id = $1 AND m.project_id = $2`,
      [validated.data.id, validated.data.project_id]
    );

    if (!milestoneResult.rows.length) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const milestone = milestoneResult.rows[0];

    // Block update if milestone already started
    if (milestone.status !== "not_started") {
      return NextResponse.json(
        { error: "Milestone cannot be updated once started", current_status: milestone.status },
        { status: 403 }
      );
    }

    // Check authorization (agency must own the project)
    if (milestone.agency_id !== userId) {
      return NextResponse.json({ error: "Unauthorized access to milestone" }, { status: 403 });
    }

    // Build update fields
    const updateFields: string[] = ["updated_at = $1"];
   const updateValues: (string | number | boolean | null | undefined)[] = [new Date().toISOString()];
    let paramCount = 2;

   const addField = (
       field: string,
       newValue: string | number | boolean | null | undefined,
       oldValue: string | number | boolean | null | undefined
 ) => {
  if (newValue !== undefined && newValue !== oldValue) {
    updateFields.push(`${field} = $${paramCount}`);
    updateValues.push(nullToUndefined(newValue));
    paramCount++;
  }
};

    addField("title", validated.data.title, milestone.title);
    addField("description", validated.data.description, milestone.description);
    addField("free_revisions", validated.data.free_revisions, milestone.free_revisions);
    addField("revision_rate", validated.data.revision_rate, milestone.revision_rate);
    addField("status", validated.data.status, milestone.status);

    let priceDelta = 0;
    let durationDelta = 0;

    if (
      validated.data.milestone_price !== undefined &&
      validated.data.milestone_price !== milestone.milestone_price
    ) {
      addField("milestone_price", validated.data.milestone_price, milestone.milestone_price);
      priceDelta = Number(validated.data.milestone_price) - Number(milestone.milestone_price);
    }

    if (
      validated.data.duration_days !== undefined &&
      validated.data.duration_days !== milestone.duration_days
    ) {
      addField("duration_days", validated.data.duration_days, milestone.duration_days);
      durationDelta = Number(validated.data.duration_days) - Number(milestone.duration_days);
    }

    if (updateFields.length <= 1) {
      return NextResponse.json({ success: true, message: "No changes detected" });
    }

    // Start transaction
    await client.query("BEGIN");

    // Update milestone
    updateValues.push(validated.data.id);
    const updateRes = await client.query(
      `UPDATE milestones 
       SET ${updateFields.join(", ")}
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    if ((updateRes.rowCount ?? 0) === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Milestone update failed" }, { status: 500 });
    }

    // 🔹 Sync project totals (delta update)
    if (priceDelta !== 0 || durationDelta !== 0) {
      await client.query(
        `UPDATE project
         SET project_price = project_price + $1,
             project_duration_days = project_duration_days + $2
         WHERE id = $3`,
        [priceDelta, durationDelta, milestone.project_id]
      );
    }

    // Log activity
    await client.query(
      `INSERT INTO project_activities (
        project_id, milestone_id, activity_type, description, performed_by, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        milestone.project_id,
        validated.data.id,
        "milestone_updated",
        `Milestone "${milestone.title}" updated`,
        userId,
        JSON.stringify({
          updated_fields: updateFields.filter(f => !f.includes("updated_at")),
          previous_milestone_price: milestone.milestone_price,
          new_milestone_price: validated.data.milestone_price,
          previous_duration: milestone.duration_days,
          new_duration: validated.data.duration_days,
        }),
      ]
    );

    await client.query("COMMIT");

    // Revalidate cache
    revalidatePath(`/dashboard/projects/${milestone.project_id}`);
    revalidatePath("/dashboard/projects");

    return NextResponse.json({ success: true, message: "Milestone updated successfully" });
  } catch (error: unknown) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten() }, { status: 422 });
    }

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    client?.release();
  }
}
