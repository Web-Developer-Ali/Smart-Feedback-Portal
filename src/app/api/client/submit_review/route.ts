import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction } from "@/lib/db";
import { z } from "zod";

// Updated validation schema - milestoneId is now optional
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

    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const now = new Date().toISOString();

    // Use transaction wrapper
    await withTransaction(async (client) => {
      if (milestoneId) {
        // MILESTONE REVIEW FLOW
        // Verify milestone + project
        const milestoneRes = await client.query(
          `
          SELECT m.*, p.agency_id, p.client_email, p.name as project_name
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

        // Authorization: must be agency owner OR client
        if (
          milestone.agency_id !== userId &&
          milestone.client_email !== session.user.email
        ) {
          throw new Error("Unauthorized access to milestone");
        }

        // Ensure review doesn't already exist for this milestone
        const existingReviewRes = await client.query(
          `SELECT id FROM reviews WHERE milestone_id = $1 AND project_id = $2`,
          [milestoneId, projectId]
        );
        if (existingReviewRes.rows.length > 0) {
          throw new Error("Review already exists for this milestone");
        }

        // Insert milestone review
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
        const newReview = insertReviewRes.rows[0];

        // Log milestone review activity - use existing activity type
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
            "review_submitted", // Use existing activity type
            `Review submitted for milestone "${milestone.title}"`,
            userId,
            JSON.stringify({
              review_id: newReview.id,
              rating,
              project_name: milestone.project_name,
              milestone_title: milestone.title,
              review_preview:
                review.trim().substring(0, 100) +
                (review.length > 100 ? "..." : ""),
              review_type: "milestone",
            }),
          ]
        );

        return {
          review: {
            id: newReview.id,
            project_id: newReview.project_id,
            milestone_id: newReview.milestone_id,
            review: newReview.review,
            stars: newReview.stars,
            created_at: newReview.created_at,
          },
          activityLogged: activityRes.rows.length > 0,
          reviewType: "milestone" as const,
        };
      } else {
        // PROJECT REVIEW FLOW
        // Verify project exists and user has access
        const projectRes = await client.query(
          `
          SELECT p.*, p.agency_id, p.client_email, p.name as project_name
          FROM project p
          WHERE p.id = $1
          `,
          [projectId]
        );

        if (!projectRes.rows.length) {
          throw new Error("Project not found");
        }
        const project = projectRes.rows[0];

        // Authorization: must be agency owner OR client
        if (
          project.agency_id !== userId &&
          project.client_email !== session.user.email
        ) {
          throw new Error("Unauthorized access to project");
        }

        // Ensure review doesn't already exist for this project (without milestone)
        const existingReviewRes = await client.query(
          `SELECT id FROM reviews WHERE project_id = $1 AND milestone_id IS NULL`,
          [projectId]
        );
        if (existingReviewRes.rows.length > 0) {
          throw new Error("Review already exists for this project");
        }

        // Insert project review (milestone_id will be NULL)
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
        const newReview = insertReviewRes.rows[0];

        // Log project review activity - use existing activity type
        const activityRes = await client.query(
          `
          INSERT INTO project_activities (
            project_id, milestone_id, activity_type, description, performed_by, metadata, created_at
          )
          VALUES ($1, NULL, $2, $3, $4, $5, NOW())
          RETURNING id
          `,
          [
            projectId,
            "review_submitted", // Use existing activity type instead of "project_review_submitted"
            `Review submitted for project "${project.name}"`,
            userId,
            JSON.stringify({
              review_id: newReview.id,
              rating,
              project_name: project.name,
              review_preview:
                review.trim().substring(0, 100) +
                (review.length > 100 ? "..." : ""),
              review_type: "project",
            }),
          ]
        );

        return {
          review: {
            id: newReview.id,
            project_id: newReview.project_id,
            milestone_id: newReview.milestone_id, // This will be null
            review: newReview.review,
            stars: newReview.stars,
            created_at: newReview.created_at,
          },
          activityLogged: activityRes.rows.length > 0,
          reviewType: "project" as const,
        };
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

    // Handle specific error types with appropriate status codes
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
