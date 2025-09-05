// app/api/project/start_milestone/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Milestone, Project } from "@/types/api-projectDetails";

// Validation schema
const startMilestoneSchema = z.object({
  milestone_id: z.string().uuid("Valid milestone ID is required"),
  notes: z.string().optional().nullable(),
});


interface MilestoneWithProject extends Milestone {
  project: Project;
  title: string;
}

export async function POST(request: Request) {
  let milestoneDetails: MilestoneWithProject | null = null;
  const supabase = createClient();
  
  try {
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
    if (authResult.status === 'rejected' || !authResult.value.data?.user) {
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

    // Get milestone with basic project details (remove current_milestone_id reference)
    const { data: milestone, error: milestoneError } = await supabase
      .from("milestones")
      .select(`
        *,
        project:project_id (
          id,
          agency_id,
          status,
          name
        )
      `)
      .eq("id", milestone_id)
      .single();

    if (milestoneError || !milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    milestoneDetails = milestone as MilestoneWithProject;

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

    // Check if any other milestones are in progress for this project
    const { data: inProgressMilestones, error: progressError } = await supabase
      .from("milestones")
      .select("id, title, status")
      .eq("project_id", milestone.project_id)
      .eq("status", "in_progress");

    if (progressError) {
      console.error("Error checking in-progress milestones:", progressError);
    }

    // Don't allow starting a new milestone if another is already in progress
    if (inProgressMilestones && inProgressMilestones.length > 0) {
      return NextResponse.json(
        { 
          error: "Another milestone is already in progress",
          details: "Please complete the current milestone before starting a new one.",
          in_progress_milestones: inProgressMilestones.map(m => ({
            id: m.id,
            title: m.title
          }))
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updateData = {
      status: "in_progress",
      started_at: now,
      updated_at: now,
      ...(notes && { starting_notes: notes }),
    };

    // Update milestone status
    const { data: updatedMilestone, error: updateError } = await supabase
      .from("milestones")
      .update(updateData)
      .eq("id", milestone_id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Milestone status update failed: ${updateError.message}`);
    }

    // Update project status to in_progress if it's pending
    let projectUpdated = false;
    if (milestone.project.status === "pending") {
      const { error: projectUpdateError } = await supabase
        .from("project")
        .update({
          status: "in_progress",
          updated_at: now
        })
        .eq("id", milestone.project.id);

      projectUpdated = !projectUpdateError;
    }

    // Log activity
    const { error: activityError } = await supabase
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
        },
        created_at: now
      });

    // Revalidate cache
    try {
      revalidatePath(`/dashboard/projects/${milestone.project_id}`);
      revalidatePath("/dashboard/projects");
    } catch (cacheError) {
      console.error("Cache revalidation failed:", cacheError);
    }

    return NextResponse.json({
      success: true,
      message: "Milestone started successfully",
      data: {
        milestone: updatedMilestone,
        project_updated: projectUpdated,
        activity_logged: !activityError
      }
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