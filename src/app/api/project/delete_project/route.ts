import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema
const deleteProjectSchema = z.object({
  projectId: z.string().uuid(),
});

export async function DELETE(request: Request) {
  let projectDetails: any = null;
  
  try {
    const supabase = createClient();
    
    // Parse request body
    const requestBody = await request.json();
    const projectId = requestBody.projectId;

    // Validate input
    const validated = deleteProjectSchema.safeParse({ projectId });

    if (!validated.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validated.error.flatten() 
        },
        { status: 400 }
      );
    }

    // Verify user session and get project data in parallel
    const [authResult, projectResult] = await Promise.allSettled([
      supabase.auth.getUser(),
      supabase
        .from("project")
        .select("id, agency_id, name, status, client_name")
        .eq("id", projectId)
        .single()
    ]);

    // Handle authentication
    if (authResult.status === 'rejected' || !authResult.value.data.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = authResult.value.data.user;

    // Handle project fetch
    if (projectResult.status === 'rejected') {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const project = projectResult.value.data;
    projectDetails = project;

    // Check authorization
    if (project?.agency_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to project" },
        { status: 403 }
      );
    }

    // Get project stats before deletion for activity logging
    const projectStats = await getProjectStats(supabase, projectId);

    // Attempt cascading deletion with stored procedure first
    let deletionMethod = 'stored_procedure';

    try {
      const { error: procedureError } = await supabase.rpc('delete_project_cascade', {
        project_id: projectId
      });

      if (procedureError) {
        deletionMethod = 'manual';
        throw procedureError;
      }
    } catch (procedureError) {
      console.log('Stored procedure not available, using manual deletion');
      await deleteProjectManually(supabase, projectId);
    }

    // Log activity and cleanup in parallel (non-blocking)
    await Promise.allSettled([
      // Log project deletion activity
      logProjectDeletion(supabase, project, user.id, projectStats, deletionMethod),
      
      // Cleanup related files from Cloudinary (if needed)
      cleanupProjectFiles(projectId),
      
      // Revalidate cache
      revalidateProjectCache(projectId)
    ]);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
      deleted_project_id: projectId,
      project_name: project.name
    });

  } catch (error: any) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { 
          stack: error.stack,
          ...(projectDetails && { project_name: projectDetails.name })
        }),
      },
      { status: 500 }
    );
  }
}

// Get project statistics before deletion
async function getProjectStats(supabase: any, projectId: string) {
  try {
    const [milestonesResult, reviewsResult, mediaResult] = await Promise.allSettled([
      supabase
        .from("milestones")
        .select("id, status", { count: 'exact' })
        .eq("project_id", projectId),
      
      supabase
        .from("reviews")
        .select("id", { count: 'exact' })
        .eq("project_id", projectId),
      
      supabase
        .from("media_attachments")
        .select("id", { count: 'exact' })
        .eq("project_id", projectId)
    ]);

    return {
      milestones: milestonesResult.status === 'fulfilled' ? milestonesResult.value.count : 0,
      reviews: reviewsResult.status === 'fulfilled' ? reviewsResult.value.count : 0,
      media_attachments: mediaResult.status === 'fulfilled' ? mediaResult.value.count : 0,
    };
  } catch (error) {
    console.error("Error getting project stats:", error);
    return { milestones: 0, reviews: 0, media_attachments: 0 };
  }
}

// Manual deletion function with proper error handling
async function deleteProjectManually(supabase: any, projectId: string) {
  const tablesToDelete = [
    // Order matters - delete child tables first
    { table: 'project_activities', column: 'project_id', description: 'Project activities' },
    { table: 'media_attachments', column: 'project_id', description: 'Media attachments' },
    { table: 'reviews', column: 'project_id', description: 'Reviews' },
    { table: 'milestones', column: 'project_id', description: 'Milestones' },
    { table: 'project_invitations', column: 'project_id', description: 'Project invitations' },
    { table: 'project_members', column: 'project_id', description: 'Project members' },
  ];

  const deletionResults = [];

  for (const { table, column, description } of tablesToDelete) {
    try {
      const { error, count } = await supabase
        .from(table)
        .delete({ count: 'estimated' })
        .eq(column, projectId);

      if (error) {
        console.warn(`Failed to delete ${description}:`, error.message);
        deletionResults.push({ table, success: false, error: error.message });
      } else {
        deletionResults.push({ table, success: true, deleted: count });
      }
    } catch (error) {
      console.warn(`Error deleting ${description}:`, error);
      deletionResults.push({ table, success: false, error: error });
    }
  }

  // Finally delete the project itself
  try {
    const { error: projectDeleteError } = await supabase
      .from("project")
      .delete()
      .eq("id", projectId);

    if (projectDeleteError) {
      throw new Error(`Project deletion failed: ${projectDeleteError.message}`);
    }

    deletionResults.push({ table: 'project', success: true });

  } catch (error) {
    console.error("Project deletion failed:", error);
    throw error;
  }

  return deletionResults;
}

// Log project deletion activity
async function logProjectDeletion(supabase: any, project: any, userId: string, stats: any, method: string) {
  try {
    await supabase
      .from("project_activities")
      .insert({
        project_id: project.id,
        activity_type: "project_deleted",
        description: `Project "${project.name}" deleted`,
        performed_by: userId,
        metadata: {
          project_name: project.name,
          client_name: project.client_name,
          project_status: project.status,
          deletion_method: method,
          stats: stats
        }
      });
  } catch (error) {
    console.error("Failed to log project deletion activity:", error);
  }
}

// Cleanup project files from Cloudinary (optional)
async function cleanupProjectFiles(projectId: string) {
  try {
    // This would be implemented if you store files in Cloudinary
    // with project-specific folders
    console.log(`Would cleanup files for project: ${projectId}`);
    // await cloudinary.api.delete_resources_by_prefix(`projects/${projectId}/`);
  } catch (error) {
    console.error("File cleanup failed:", error);
  }
}

// Revalidate cache paths
async function revalidateProjectCache(projectId: string) {
  try {
    await Promise.allSettled([
      revalidatePath("/dashboard/projects"),
      revalidatePath("/dashboard"),
      revalidatePath(`/dashboard/projects/${projectId}`)
    ]);
  } catch (error) {
    console.error("Cache revalidation failed:", error);
  }
}

// Optional: Add GET method for project deletion preview
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId parameter" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from("project")
      .select("id, name, agency_id, status, client_name")
      .eq("id", projectId)
      .single();

    if (projectError) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (project.agency_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to project" },
        { status: 403 }
      );
    }

    // Get deletion impact analysis
    const stats = await getProjectStats(supabase, projectId);

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        client_name: project.client_name
      },
      deletion_impact: stats,
      will_delete: {
        milestones: stats.milestones,
        reviews: stats.reviews,
        media_files: stats.media_attachments
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}