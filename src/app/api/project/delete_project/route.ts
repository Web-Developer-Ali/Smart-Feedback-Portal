import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = createClient();
  
  try {
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

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get project data
    const { data: project, error: projectError } = await supabase
      .from("project")
      .select("id, agency_id, name, status, client_name")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    projectDetails = project;

    // Check authorization
    if (project.agency_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to project" },
        { status: 403 }
      );
    }

    // Get project stats before deletion for activity logging
    const projectStats = await getProjectStats(supabase, projectId);

    // LOG THE DELETION ACTIVITY FIRST - BEFORE ANY DELETION HAPPENS
    await logProjectDeletion(supabase, project, user.id, projectStats, 'manual');

    // Attempt cascading deletion with stored procedure first
    let deletionMethod = 'stored_procedure';
    let deletionResults: DeletionResult[] = [];

    try {
      const { error: procedureError } = await supabase.rpc('delete_project_cascade', {
        project_id: projectId
      });

      if (procedureError) {
        deletionMethod = 'manual';
        throw procedureError;
      }
    } catch {
      console.log('Stored procedure not available, using manual deletion');
      deletionResults = await deleteProjectManually(supabase, projectId);
    }

    // Cleanup and revalidate cache in parallel (non-blocking)
    await Promise.allSettled([
      // Cleanup related files from Cloudinary (if needed)
      cleanupProjectFiles(projectId),
      
      // Revalidate cache
      revalidateProjectCache(projectId)
    ]);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
      deletion_method: deletionMethod,
      ...(deletionMethod === 'manual' && { deletion_results: deletionResults })
    });

  } catch (error: unknown) {
    console.error("API Error:", error);

    const errorMessage = error instanceof Error 
      ? error.message 
      : "Internal server error";
    
    const errorStack = error instanceof Error 
      ? error.stack 
      : undefined;

    return NextResponse.json(
      {
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && { 
          stack: errorStack,
          ...(projectDetails && { project_name: projectDetails.name })
        }),
      },
      { status: 500 }
    );
  }
}

// Get project statistics before deletion
async function getProjectStats(supabase: ReturnType<typeof createClient>, projectId: string): Promise<ProjectStats> {
  try {
    const [milestonesResult, reviewsResult, mediaResult] = await Promise.allSettled([
      supabase
        .from("milestones")
        .select("id", { count: 'exact' })
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

    let milestones = 0;
    let reviews = 0;
    let media_attachments = 0;

    // Handle milestones result
    if (milestonesResult.status === 'fulfilled' && milestonesResult.value.data) {
      milestones = milestonesResult.value.count || 0;
    }

    // Handle reviews result
    if (reviewsResult.status === 'fulfilled' && reviewsResult.value.data) {
      reviews = reviewsResult.value.count || 0;
    }

    // Handle media attachments result
    if (mediaResult.status === 'fulfilled' && mediaResult.value.data) {
      media_attachments = mediaResult.value.count || 0;
    }

    return { milestones, reviews, media_attachments };
  } catch (error) {
    console.error("Error getting project stats:", error);
    return { milestones: 0, reviews: 0, media_attachments: 0 };
  }
}

// Manual deletion function with proper error handling
async function deleteProjectManually(supabase: ReturnType<typeof createClient>, projectId: string): Promise<DeletionResult[]> {
  const tablesToDelete = [
    // Order matters - delete child tables first
    // REMOVED: project_activities - we want to preserve activity logs
    { table: 'media_attachments', column: 'project_id', description: 'Media attachments' },
    { table: 'reviews', column: 'project_id', description: 'Reviews' },
    { table: 'milestones', column: 'project_id', description: 'Milestones' },
    { table: 'project_invitations', column: 'project_id', description: 'Project invitations' },
    { table: 'project_members', column: 'project_id', description: 'Project members' },
  ];

  const deletionResults: DeletionResult[] = [];

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
        deletionResults.push({ table, success: true, deleted: count || 0 });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Error deleting ${description}:`, errorMessage);
      deletionResults.push({ table, success: false, error: errorMessage });
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Project deletion failed:", errorMessage);
    throw new Error(`Project deletion failed: ${errorMessage}`);
  }

  return deletionResults;
}

// Log project deletion activity - NOW CALLED BEFORE DELETION
async function logProjectDeletion(
  supabase: ReturnType<typeof createClient>, 
  project: Project, 
  userId: string, 
  stats: ProjectStats, 
  method: string
): Promise<void> {
  try {
    await supabase
      .from("project_activities")
      .insert({
        project_id: project.id,
        activity_type: "project_deleted",
        description: `Project "${project.name}" deleted by user`,
        performed_by: userId,
        metadata: {
          project_name: project.name,
          client_name: project.client_name,
          project_status: project.status,
          deletion_method: method,
          stats: stats,
          deleted_at: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Failed to log project deletion activity:", error);
    // Don't throw here - we want the deletion to proceed even if logging fails
  }
}

// Cleanup project files from Cloudinary (optional)
async function cleanupProjectFiles(projectId: string): Promise<void> {
  try {
    console.log(`Would cleanup files for project: ${projectId}`);
    // Cloudinary cleanup logic here
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