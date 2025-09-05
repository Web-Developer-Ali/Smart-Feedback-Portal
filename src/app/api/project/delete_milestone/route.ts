import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";
import { Project } from "@/types/api-projectDetails";
import { Milestone } from "@/types/ProjectDetailPage";

// Validation schema
const deleteMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
  projectId: z.string().uuid(),
});

interface MilestoneWithProject extends Milestone {
  project: Project;
}

interface ProjectActivity {
  project_id: string;
  milestone_id: string;
  activity_type: string;
  description: string;
  performed_by: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Supabase types (you should generate these from your database)
interface Database {
  public: {
    Tables: {
      milestones: {
        Row: Milestone;
      };
      project: {
        Row: Project;
      };
      project_activities: {
        Row: ProjectActivity;
      };
    };
  };
}

type Supabase = SupabaseClient<Database>;

export async function DELETE(request: Request) {
  let milestoneDetails: MilestoneWithProject | null = null;
  const supabase = createClient() as Supabase;
  
  try {
    // Parse URL parameters
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get("milestoneId");
    const projectId = searchParams.get("projectId");

    // Validate required parameters
    if (!milestoneId || !projectId) {
      return NextResponse.json(
        { error: "Missing required parameters: milestoneId and projectId" },
        { status: 400 }
      );
    }

    // Validate input format
    const validated = deleteMilestoneSchema.safeParse({
      milestoneId,
      projectId,
    });

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

    // Get milestone data with project info
    const { data: milestone, error: milestoneError } = await supabase
      .from("milestones")
      .select(`
        *,
        project:project_id (
          id,
          agency_id,
          name,
          status
        )
      `)
      .eq("id", milestoneId)
      .eq("project_id", projectId)
      .single();

    if (milestoneError || !milestone) {
      console.error("Milestone fetch error:", milestoneError);
      return NextResponse.json(
        { error: "Milestone not found or does not belong to the specified project" },
        { status: 404 }
      );
    }

    milestoneDetails = milestone as MilestoneWithProject;

    // Check authorization - user must own the project
    if (milestone.project.agency_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to milestone" },
        { status: 403 }
      );
    }

    // Delete the milestone
    const { error: deleteError } = await supabase
      .from("milestones")
      .delete()
      .eq("id", milestoneId)
      .eq("project_id", projectId);

    if (deleteError) {
      throw new Error(`Milestone deletion failed: ${deleteError.message}`);
    }

    // Execute recalculation and activity logging in parallel
    const [recalcResult, activityResult] = await Promise.allSettled([
      // Recalculate project totals
      recalculateProjectTotals(projectId, supabase),
      
      // Log activity
      supabase
        .from("project_activities")
        .insert({
          project_id: projectId,
          milestone_id: milestoneId,
          activity_type: "milestone_deleted",
          description: `Milestone "${milestone.title}" deleted`,
          performed_by: user.id,
          metadata: {
            milestone_name: milestone.title,
            milestone_price: milestone.milestone_price,
            duration_days: milestone.duration_days,
            status: milestone.status
          },
          created_at: new Date().toISOString()
        } as ProjectActivity)
    ]);

    // Update project status if this was the last milestone
    await updateProjectStatusIfNeeded(projectId, supabase);

    return NextResponse.json({
      success: true,
      message: "Milestone deleted successfully",
      deleted_milestone_id: milestoneId,
      recalculated: recalcResult.status === 'fulfilled',
      activity_logged: activityResult.status === 'fulfilled'
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
          ...(milestoneDetails && { milestone_name: milestoneDetails.title })
        }),
      },
      { status: 500 }
    );
  }
}

// Helper function to recalculate project totals
async function recalculateProjectTotals(projectId: string, supabase: Supabase) {
  try {
    const { data: milestones, error } = await supabase
      .from("milestones")
      .select("milestone_price, duration_days")
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching milestones for recalculation:", error);
      return null;
    }

    const totalPrice = milestones?.reduce((sum: number, m) => sum + (m.milestone_price || 0), 0) || 0;
    const totalDuration = milestones?.reduce((sum: number, m) => sum + (m.duration_days || 0), 0) || 0;

    const { error: updateError } = await supabase
      .from("project")
      .update({
        project_price: totalPrice,
        project_duration_days: totalDuration,
        updated_at: new Date().toISOString()
      })
      .eq("id", projectId);

    if (updateError) {
      console.error("Failed to update project totals:", updateError);
      return null;
    }

    return { totalPrice, totalDuration };
  } catch (error) {
    console.error("Error recalculating project totals:", error);
    return null;
  }
}

// Helper function to update project status if no milestones remain
async function updateProjectStatusIfNeeded(projectId: string, supabase: Supabase) {
  try {
    // Check if any milestones remain
    const { data: remainingMilestones, error } = await supabase
      .from("milestones")
      .select("id")
      .eq("project_id", projectId);

    if (error) {
      console.error("Error checking remaining milestones:", error);
      return;
    }

    // If no milestones remain, update project status to pending
    if (!remainingMilestones || remainingMilestones.length === 0) {
      const { error: updateError } = await supabase
        .from("project")
        .update({
          status: "pending",
          updated_at: new Date().toISOString()
        })
        .eq("id", projectId);

      if (updateError) {
        console.error("Error updating project status:", updateError);
      }
    }
  } catch (error) {
    console.error("Error updating project status:", error);
  }
}