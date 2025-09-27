// app/api/dashboard/projects/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction } from "@/lib/db";
import { createProjectSchema } from "@/lib/validations/create_project";
import { z } from "zod";

export async function POST(request: Request) {
  let projectId: string | null = null;

  try {
    // Run request parsing + auth in parallel
    const [reqResult, sessionResult] = await Promise.allSettled([
      request.json(),
      getServerSession(authOptions),
    ]);

    if (reqResult.status === "rejected") {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    if (sessionResult.status === "rejected" || !sessionResult.value?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = sessionResult.value.user.id;

    // Validate request body
    const validated = createProjectSchema.safeParse(reqResult.value);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 422 }
      );
    }

    const data = validated.data;

    // Transaction block
    await withTransaction(async (client) => {
    // Ensure user exists
    const userCheck = await client.query("SELECT 1 FROM users WHERE id = $1", [userId]);
    if (!userCheck.rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

      // Insert project
      const projectResult = await client.query<{ id: string }>(
        `INSERT INTO project (
          name, type, agency_id, status, project_price, 
          project_duration_days, description, client_name, client_email,
          created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
        RETURNING id`,
        [
          data.name,
          data.type,
          userId,
          "pending",
          data.project_budget,
          data.estimated_days,
          data.description,
          data.client_name,
          data.client_email,
        ]
      );

      projectId = projectResult.rows[0]?.id;
      if (!projectId) throw new Error("Project creation failed: No ID returned");

      // Insert milestones (bulk insert if provided)
      if (data.milestones?.length) {
        const values = data.milestones
          .map(
            (_, i) =>
              `($${i * 9 + 1},$${i * 9 + 2},$${i * 9 + 3},$${i * 9 + 4},$${i * 9 + 5},$${i * 9 + 6},$${i * 9 + 7},$${i * 9 + 8},$${i * 9 + 9},NOW(),NOW())`
          )
          .join(",");

        const params = data.milestones.flatMap((m, i) => [
          projectId,
          m.name,
          m.duration_days,
          "not_started",
          m.milestone_price,
          m.free_revisions,
          m.revision_rate,
          m.description ?? "",
          i + 1,
        ]);

        await client.query(
          `INSERT INTO milestones (
            project_id, title, duration_days, status, milestone_price, 
            free_revisions, revision_rate, description, priority, created_at, updated_at
          ) VALUES ${values}`,
          params
        );
      }

      // Activity log (don’t block commit)
      client
        .query(
          `INSERT INTO project_activities (
            project_id, activity_type, description, performed_by, metadata, created_at
          ) VALUES ($1,$2,$3,$4,$5,NOW())`,
          [
            projectId,
            "project_created",
            `Project "${data.name}" created with ${data.milestones?.length || 0} milestones`,
            userId,
            JSON.stringify({
              client_name: data.client_name,
              client_email: data.client_email,
              total_budget: data.project_budget,
              duration_days: data.estimated_days,
              milestone_count: data.milestones?.length || 0,
            }),
          ]
        )
        .catch((err) => console.error("Activity log failed (non-critical):", err));
    });

    return NextResponse.json({
      success: true,
      project_id: projectId,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Project Creation API Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
}
