import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";
import { z } from "zod";

const submitReviewSchema = z.object({
  milestoneId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid(),
  review: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review must be less than 2000 characters"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = submitReviewSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { milestoneId, projectId, review, rating } = validated.data;
    const now = new Date().toISOString();

    await withTransaction(async (client) => {
      if (milestoneId) {
        // --- Milestone Review Flow ---
        const milestoneRes = await client.query(
          `
          SELECT m.*, p.name as project_name
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

        const existingReviewRes = await client.query(
          `SELECT id FROM reviews WHERE milestone_id = $1 AND project_id = $2`,
          [milestoneId, projectId]
        );
        if (existingReviewRes.rows.length > 0) {
          throw new Error("Review already exists for this milestone");
        }

        const insertReviewRes = await client.query(
          `
          INSERT INTO reviews (project_id, milestone_id, review, stars, created_at)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
          `,
          [projectId, milestoneId, review.trim(), rating, now]
        );

        if (!insertReviewRes.rows.length) {
          throw new Error("Milestone review submission failed");
        }

      } else {
        // --- Project Review Flow ---
        const projectRes = await client.query(
          `SELECT p.* FROM project p WHERE p.id = $1`,
          [projectId]
        );

        if (!projectRes.rows.length) {
          throw new Error("Project not found");
        }

        const existingReviewRes = await client.query(
          `SELECT id FROM reviews WHERE project_id = $1 AND milestone_id IS NULL`,
          [projectId]
        );
        if (existingReviewRes.rows.length > 0) {
          throw new Error("Review already exists for this project");
        }

        const insertReviewRes = await client.query(
          `
          INSERT INTO reviews (project_id, milestone_id, review, stars, created_at)
          VALUES ($1, NULL, $2, $3, $4)
          RETURNING *
          `,
          [projectId, review.trim(), rating, now]
        );

        if (!insertReviewRes.rows.length) {
          throw new Error("Project review submission failed");
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: milestoneId
        ? "Milestone review submitted successfully"
        : "Project review submitted successfully",
    });
  } catch (error: unknown) {
    console.error("Submit Review API Error:", error);
    let statusCode = 500;
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    if (errorMessage === "Authentication required") statusCode = 401;
    else if (errorMessage.includes("Unauthorized")) statusCode = 403;
    else if (errorMessage.includes("not found")) statusCode = 404;
    else if (
      errorMessage.includes("already exists") ||
      errorMessage.includes("Validation failed")
    )
      statusCode = 400;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
