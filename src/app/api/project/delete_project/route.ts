import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

export async function DELETE(request: Request) {
  let projectDetails: Project | null = null;

  try {
    // Parse request body
    const { projectId } = await request.json();

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
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.user.id;

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

      // Gather stats
      const stats = await getProjectStats(client, projectId);

      // Log deletion activity (don't block if fails)
      await logProjectDeletion(client, projectDetails, userId, stats, "manual").catch(
        (err) => console.error("Logging failed:", err)
      );

      // Perform manual deletion
      return deleteProjectManually(client, projectId);
    });

    // Cleanup and cache revalidation (non-blocking)
    Promise.allSettled([
      cleanupProjectFiles(projectId),
      revalidateProjectCache(projectId),
    ]);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
      deletion_results: deletionResults
    });
  } catch (error: unknown) {
    console.error("Project Deletion API Error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: error instanceof Error && error.message === "Unauthorized access to project" ? 403 :
               error instanceof Error && error.message === "Project not found" ? 404 : 500 }
    );
  }
}

// Get project statistics before deletion
async function getProjectStats(client: any, projectId: string): Promise<ProjectStats> {
  try {
    const [milestones, reviews, media] = await Promise.all([
      client.query(`SELECT COUNT(*) as count FROM milestones WHERE project_id = $1`, [projectId]),
      client.query(`SELECT COUNT(*) as count FROM reviews WHERE project_id = $1`, [projectId]),
      client.query(`SELECT COUNT(*) as count FROM media_attachments WHERE project_id = $1`, [projectId]),
    ]);

    return {
      milestones: parseInt(milestones.rows[0].count) || 0,
      reviews: parseInt(reviews.rows[0].count) || 0,
      media_attachments: parseInt(media.rows[0].count) || 0,
    };
  } catch (error) {
    console.error("Error getting project stats:", error);
    return { milestones: 0, reviews: 0, media_attachments: 0 };
  }
}

// Manual deletion function - FIXED: Don't continue if a table deletion fails
async function deleteProjectManually(client: any, projectId: string): Promise<DeletionResult[]> {
  const tablesToDelete = [
    { table: "media_attachments", column: "project_id" },
    { table: "reviews", column: "project_id" },
    { table: "milestones", column: "project_id" },
    { table: "project_activities", column: "project_id" },
  ];

  const results: DeletionResult[] = [];

  for (const { table, column } of tablesToDelete) {
    try {
      const res = await client.query(`DELETE FROM ${table} WHERE ${column} = $1`, [projectId]);
      results.push({ table, success: true, deleted: res.rowCount || 0 });
    } catch (error) {
      // If any table deletion fails, throw immediately to abort transaction
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to delete from ${table}: ${message}`);
    }
  }

  // Finally delete project
  const projectRes = await client.query(`DELETE FROM project WHERE id = $1`, [projectId]);
  if (projectRes.rowCount === 0) {
    throw new Error("Project deletion failed: No rows affected");
  }
  results.push({ table: "project", success: true, deleted: projectRes.rowCount });

  return results;
}

// Log project deletion
async function logProjectDeletion(
  client: any,
  project: Project,
  userId: string,
  stats: ProjectStats,
  method: string
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
        deletion_method: method,
        stats,
        deleted_at: new Date().toISOString(),
      }),
    ]
  );
}

// Cleanup project files (placeholder for Cloudinary etc.)
async function cleanupProjectFiles(projectId: string): Promise<void> {
  try {
    console.log(`Would cleanup files for project: ${projectId}`);
  } catch (error) {
    console.error("File cleanup failed:", error);
  }
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