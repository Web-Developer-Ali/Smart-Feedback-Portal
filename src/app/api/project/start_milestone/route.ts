// app/api/project/start_milestone/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Validation schema
const startMilestoneSchema = z.object({
  milestone_id: z.string().uuid("Valid milestone ID is required"),
  notes: z.string().optional().nullable(), // Optional starting notes
});

export async function POST(request: Request) {
  let milestoneDetails: any = null;
  
  try {
    const supabase = createClient();
    
    // Parse request body and verify user session in parallel
    const [requestData, authResult] = await Promise.allSettled([
      request.json(),
      supabase.auth.getUser()
    ]);

    // Handle request parsing error
    if (requestData.status === 'rejected') {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Handle authentication
    if (authResult.status === 'rejected' || !authResult.value.data.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = authResult.value.data.user;
    const validated = startMilestoneSchema.safeParse(requestData.value);

    if (!validated.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validated.error.flatten() 
        },
        { status: 400 }
      );
    }

    const { milestone_id, notes } = validated.data;

    // Get milestone with project details and check previous milestones in parallel
    const [milestoneResult, previousMilestonesResult] = await Promise.allSettled([
      supabase
        .from("milestones")
        .select(`
          *,
          project:project_id (
            id,
            agency_id,
            status,
            current_milestone_id,
            name
          )
        `)
        .eq("id", milestone_id)
        .single(),

      // Check if previous milestones are completed (optional business rule)
      supabase
        .from("milestones")
        .select("id, status, title")
        .eq("project_id", milestone_id) // This will be updated after we get the project_id
        .neq("id", milestone_id)
        .in("status", ["not_started", "in_progress"])
    ]);

    // Handle milestone fetch
    if (milestoneResult.status === 'rejected') {
      return NextResponse.json(
        { error: "Milestone not found" },
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

    // Validate project status
    const validProjectStatuses = ["active", "in_progress", "pending"];
    if (!validProjectStatuses.includes(milestone.project.status)) {
      return NextResponse.json(
        { 
          error: "Project is not active",
          details: `Cannot start milestones for projects with status "${milestone.project.status}"`,
          project_status: milestone.project.status
        },
        { status: 400 }
      );
    }

    // Validate that milestone is in "not_started" status
    if (milestone.status !== "not_started") {
      return NextResponse.json(
        { 
          error: "Milestone cannot be started",
          details: `Milestone is currently in "${milestone.status}" status. Only "not_started" milestones can be started.`,
          current_status: milestone.status,
          allowed_status: "not_started"
        },
        { status: 400 }
      );
    }

    // Check if previous milestones are completed (if this is not the first milestone)
    if (previousMilestonesResult.status === 'fulfilled' && 
        previousMilestonesResult.value.data && 
        previousMilestonesResult.value.data.length > 0) {
      
      const incompleteMilestones = previousMilestonesResult.value.data
        .filter(m => m.status !== "completed" && m.status !== "approved");

      if (incompleteMilestones.length > 0) {
        return NextResponse.json(
          { 
            error: "Previous milestones not completed",
            details: "Please complete previous milestones before starting this one.",
            incomplete_milestones: incompleteMilestones.map(m => ({
              id: m.id,
              title: m.title,
              status: m.status
            }))
          },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();
    const updateData = {
      status: "in_progress",
      started_at: now,
      updated_at: now,
      ...(notes && { starting_notes: notes }),
    };

    // Execute milestone update and project update in parallel
    const [updateResult, projectUpdateResult, activityResult] = await Promise.allSettled([
      // Update milestone status
      supabase
        .from("milestones")
        .update(updateData)
        .eq("id", milestone_id)
        .select()
        .single(),

      // Update project's current milestone if this is the first one being started
      milestone.project.current_milestone_id ? Promise.resolve(null) : 
        supabase
          .from("project")
          .update({
            current_milestone_id: milestone_id,
            status: "in_progress",
            updated_at: now
          })
          .eq("id", milestone.project.id),

      // Log activity (non-blocking)
      supabase
        .from("project_activities")
        .insert({
          project_id: milestone.project_id,
          milestone_id: milestone_id,
          activity_type: "milestone_started",
          description: `Milestone "${milestone.title}" started`,
          performed_by: user.id,
          metadata: {
            previous_status: "not_started",
            new_status: "in_progress",
            notes: notes,
            project_name: milestone.project.name
          }
        })
    ]);

    // Check update result
    if (updateResult.status === 'rejected') {
      throw new Error(`Milestone status update failed: ${updateResult.reason.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Milestone started successfully",
      data: {
        milestone: updateResult.value.data,
        project_updated: projectUpdateResult.status === 'fulfilled',
        activity_logged: activityResult.status === 'fulfilled'
      }
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