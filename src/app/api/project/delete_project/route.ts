import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction, pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PoolClient } from "pg";

// Validation schema
const deleteProjectSchema = z.object({
  projectId: z.string().uuid(),
});

// Database types
interface Project {
  id: string;
  agency_id: string;
  name: string;
  status: string;
  client_name: string;
}

interface ProjectStats {
  milestones: number;
  reviews: number;
  media_attachments: number;
}

interface DeletionResult {
  table: string;
  success: boolean;
  deleted?: number;
  error?: string;
}

interface MilestoneSubmissionStatus {
  has_submissions: boolean;
  submitted_milestones: Array<{
    id: string;
    title: string;
    status: string;
    submission_count: number;
  }>;
}

export async function DELETE(request: Request) {
  let projectDetails: Project | null = null;

  try {
    // Parse request body
    const body = await request.json();
    const { projectId } = body;

    // Validate input
    const validated = deleteProjectSchema.safeParse({ projectId });
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // Check milestone submissions before starting transaction
    const submissionStatus = await checkMilestoneSubmissions(projectId);
    // If there are submissions, return error
    if (submissionStatus.has_submissions) {
      return NextResponse.json(
        {
          error:
            "Project cannot be deleted because it has milestone submissions. Please delete all milestone submissions first.",
          details: {
            submitted_milestones: submissionStatus.submitted_milestones,
            message:
              "Please delete all milestone submissions with uploaded files first.",
          },
          code: "HAS_SUBMISSIONS",
        },
        { status: 409 }
      );
    }

    // Transaction block
    const deletionResults = await withTransaction(async (client) => {
      // Get project
      const projectResult = await client.query<Project>(
        `SELECT id, agency_id, name, status, client_name FROM project WHERE id = $1`,
        [projectId]
      );

      if (!projectResult.rows.length) {
        throw new Error("Project not found");
      }

      projectDetails = projectResult.rows[0];

      // Authorization check
      if (projectDetails.agency_id !== userId) {
        throw new Error("Unauthorized access to project");
      }

      // Double-check submission status within transaction (for safety)
      const finalSubmissionStatus =
        await checkMilestoneSubmissionsInTransaction(client, projectId);

      if (finalSubmissionStatus.has_submissions) {
        throw new Error(
          "Project has milestone submissions. Delete submissions first."
        );
      }

      // Gather stats
      const stats = await getProjectStats(client, projectId);

      // Log deletion activity
      await logProjectDeletion(client, projectDetails, userId, stats).catch(
        (err) => console.error("Logging failed:", err)
      );

      // Perform deletion
      return deleteProjectManually(client, projectId);
    });

    // Revalidate cache (non-blocking)
    revalidateProjectCache(projectId).catch((err) =>
      console.error("Cache revalidation failed:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
      deletion_results: deletionResults,
    });
  } catch (error: unknown) {
    console.error("Project Deletion API Error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      {
        status:
          error instanceof Error &&
          error.message === "Unauthorized access to project"
            ? 403
            : error instanceof Error && error.message === "Project not found"
            ? 404
            : 500,
      }
    );
  }
}

// Check if project has milestone submissions with ACTUAL FILES
async function checkMilestoneSubmissions(
  projectId: string
): Promise<MilestoneSubmissionStatus> {
  const client = await pool.connect();

  try {
    // Only consider milestones that have ACTUAL media attachments (files)
    const result = await client.query(
      `
      SELECT 
        m.id,
        m.title,
        m.status,
        COUNT(ma.id) as submission_count
      FROM milestones m
      LEFT JOIN media_attachments ma ON m.id = ma.milestone_id
      WHERE m.project_id = $1
      GROUP BY m.id, m.title, m.status
      HAVING COUNT(ma.id) > 0  -- ONLY count milestones that have actual media attachments
      `,
      [projectId]
    );

    const submittedMilestones = result.rows;

    return {
      has_submissions: submittedMilestones.length > 0,
      submitted_milestones: submittedMilestones,
    };
  } catch (error) {
    console.error("Error checking milestone submissions:", error);
    // Return safe default in case of error
    return {
      has_submissions: false,
      submitted_milestones: [],
    };
  } finally {
    client.release();
  }
}

// Check submissions within transaction
async function checkMilestoneSubmissionsInTransaction(
  client: PoolClient,
  projectId: string
): Promise<MilestoneSubmissionStatus> {
  const result = await client.query(
    `
    SELECT 
      m.id,
      m.title,
      m.status,
      COUNT(ma.id) as submission_count
    FROM milestones m
    LEFT JOIN media_attachments ma ON m.id = ma.milestone_id
    WHERE m.project_id = $1
    GROUP BY m.id, m.title, m.status
    HAVING COUNT(ma.id) > 0  -- ONLY count milestones that have actual media attachments
    `,
    [projectId]
  );

  const submittedMilestones = result.rows;

  return {
    has_submissions: submittedMilestones.length > 0,
    submitted_milestones: submittedMilestones,
  };
}

// Get project statistics before deletion
async function getProjectStats(
  client: PoolClient,
  projectId: string
): Promise<ProjectStats> {
  try {
    const [milestones, reviews, media] = await Promise.all([
      client.query(
        `SELECT COUNT(*) as count FROM milestones WHERE project_id = $1`,
        [projectId]
      ),
      client.query(
        `SELECT COUNT(*) as count FROM reviews WHERE project_id = $1`,
        [projectId]
      ),
      client.query(
        `SELECT COUNT(*) as count FROM media_attachments WHERE project_id = $1`,
        [projectId]
      ),
    ]);

    return {
      milestones: parseInt(milestones.rows[0].count) || 0,
      reviews: parseInt(reviews.rows[0].count) || 0,
      media_attachments: parseInt(media.rows[0].count) || 0,
    };
  } catch (error) {
    console.error("Error getting project stats:", error);
    return {
      milestones: 0,
      reviews: 0,
      media_attachments: 0,
    };
  }
}

// Manual deletion function
async function deleteProjectManually(
  client: PoolClient,
  projectId: string
): Promise<DeletionResult[]> {
  const tablesToDelete = [
    { table: "media_attachments", column: "project_id" },
    { table: "reviews", column: "project_id" },
    { table: "milestones", column: "project_id" },
    { table: "project_activities", column: "project_id" },
  ];

  const results: DeletionResult[] = [];

  for (const { table, column } of tablesToDelete) {
    try {
      const res = await client.query(
        `DELETE FROM ${table} WHERE ${column} = $1`,
        [projectId]
      );
      results.push({ table, success: true, deleted: res.rowCount || 0 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to delete from ${table}: ${message}`);
    }
  }

  const projectRes = await client.query(`DELETE FROM project WHERE id = $1`, [
    projectId,
  ]);
  if (projectRes.rowCount === 0) {
    throw new Error("Project deletion failed: No rows affected");
  }
  results.push({
    table: "project",
    success: true,
    deleted: projectRes.rowCount ?? 0,
  });

  return results;
}

// Log project deletion
async function logProjectDeletion(
  client: PoolClient,
  project: Project,
  userId: string,
  stats: ProjectStats
): Promise<void> {
  await client.query(
    `INSERT INTO project_activities (
      project_id, activity_type, description, performed_by, metadata, created_at
    ) VALUES ($1,$2,$3,$4,$5,NOW())`,
    [
      project.id,
      "project_deleted",
      `Project "${project.name}" deleted by user`,
      userId,
      JSON.stringify({
        project_name: project.name,
        client_name: project.client_name,
        project_status: project.status,
        deletion_method: "manual",
        stats,
        deleted_at: new Date().toISOString(),
      }),
    ]
  );
}

// Revalidate cache paths
async function revalidateProjectCache(projectId: string): Promise<void> {
  try {
    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath(`/api/projects/${projectId}`);
  } catch (error) {
    console.error("Cache revalidation failed:", error);
  }
}
