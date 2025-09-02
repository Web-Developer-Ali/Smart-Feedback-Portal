// app/api/project/delete_milestone/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const deleteMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
  projectId: z.string().uuid(),
});

export async function DELETE(request: Request) {
  let milestoneDetails: any = null;
  
  try {
    const supabase = createClient();
    
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

    // Verify user session and get milestone data in parallel
    const [authResult, milestoneResult] = await Promise.allSettled([
      supabase.auth.getUser(),
      supabase
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

    // Handle milestone fetch
    if (milestoneResult.status === 'rejected') {
      console.error("Milestone fetch error:", milestoneResult.reason);
      return NextResponse.json(
        { error: "Milestone not found or does not belong to the specified project" },
        { status: 404 }
      );
    }

    const milestone = milestoneResult.value.data;
    milestoneDetails = milestone;

    // Check authorization
    if (milestone.project.agency_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to milestone" },
        { status: 403 }
      );
    }

    // Execute deletion and recalculation in parallel with activity logging
    const [deleteResult, recalcResult, activityResult] = await Promise.allSettled([
      // Delete the milestone
      supabase
        .from("milestones")
        .delete()
        .eq("id", milestoneId)
        .eq("project_id", projectId),

      // Recalculate project totals
      recalculateProjectTotals(projectId),

      // Log activity (non-blocking)
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
          }
        })
    ]);

    // Check deletion result
    if (deleteResult.status === 'rejected') {
      throw new Error(`Milestone deletion failed: ${deleteResult.reason.message}`);
    }

    // Update project status if this was the last milestone
    await updateProjectStatusIfNeeded(projectId, supabase);

    return NextResponse.json({
      success: true,
      message: "Milestone deleted successfully",
      deleted_milestone_id: milestoneId,
      recalculated: recalcResult.status === 'fulfilled',
      activity_logged: activityResult.status === 'fulfilled'
    });

  } catch (error: any) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { 
          stack: error.stack,
          ...(milestoneDetails && { milestone_name: milestoneDetails.title })
        }),
      },
      { status: 500 }
    );
  }
}

// Helper function to recalculate project totals
async function recalculateProjectTotals(projectId: string) {
  const supabase = createClient();
  
  try {
    const { data: milestones, error } = await supabase
      .from("milestones")
      .select("milestone_price, duration_days")
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching milestones for recalculation:", error);
      return null;
    }

    const totalPrice = milestones.reduce((sum, m) => sum + (m.milestone_price || 0), 0);
    const totalDuration = milestones.reduce((sum, m) => sum + (m.duration_days || 0), 0);

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
async function updateProjectStatusIfNeeded(projectId: string, supabase: any) {
  try {
    // Check if any milestones remain
    const { data: remainingMilestones, error } = await supabase
      .from("milestones")
      .select("id")
      .eq("project_id", projectId)
      .limit(1);

    if (error) {
      console.error("Error checking remaining milestones:", error);
      return;
    }

    // If no milestones remain, update project status to pending
    if (!remainingMilestones || remainingMilestones.length === 0) {
      await supabase
        .from("project")
        .update({
          status: "pending",
          updated_at: new Date().toISOString()
        })
        .eq("id", projectId);
    }
  } catch (error) {
    console.error("Error updating project status:", error);
  }
}