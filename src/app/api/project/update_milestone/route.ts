// app/api/milestones/update/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Validation schema for updating a milestone - all fields optional
const updateMilestoneSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional().nullable(),
  description: z.string().optional().nullable(),
  duration_days: z.number().int().positive().optional().nullable(),
  milestone_price: z.number().positive().optional().nullable(),
  free_revisions: z.number().int().nonnegative().optional().nullable(),
  revision_rate: z.number().nonnegative().optional().nullable(),
  status: z.enum(["not_started", "in_progress", "completed", "revision"]).optional().nullable(),
});

export async function PUT(request: Request) {
  let originalMilestone: any = null;
  
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
    const validated = updateMilestoneSchema.safeParse(requestData.value);

    if (!validated.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validated.error.flatten() 
        },
        { status: 422 }
      );
    }

    // Get the current milestone and its project details
    const { data: milestone, error: milestoneError } = await supabase
      .from("milestones")
      .select(`
        *,
        project:project_id (
          id,
          project_price,
          project_duration_days,
          agency_id,
          name
        )
      `)
      .eq("id", validated.data.id)
      .single();

    if (milestoneError) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    originalMilestone = milestone;

    // Check authorization
    if (milestone.project.agency_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to milestone" },
        { status: 403 }
      );
    }

    // Prepare update data - only include fields that are provided and changed
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided AND different from current values
    if (validated.data.title !== undefined && validated.data.title !== milestone.title) {
      updateData.title = validated.data.title;
    }
    if (validated.data.description !== undefined && validated.data.description !== milestone.description) {
      updateData.description = validated.data.description;
    }
    if (validated.data.free_revisions !== undefined && validated.data.free_revisions !== milestone.free_revisions) {
      updateData.free_revisions = validated.data.free_revisions;
    }
    if (validated.data.revision_rate !== undefined && validated.data.revision_rate !== milestone.revision_rate) {
      updateData.revision_rate = validated.data.revision_rate;
    }
    if (validated.data.status !== undefined && validated.data.status !== milestone.status) {
      updateData.status = validated.data.status;
    }

    // Handle price and duration updates with validation
    let needsBudgetValidation = false;
    let needsDurationValidation = false;

    if (validated.data.milestone_price !== undefined && validated.data.milestone_price !== milestone.milestone_price) {
      updateData.milestone_price = validated.data.milestone_price;
      needsBudgetValidation = true;
    }

    if (validated.data.duration_days !== undefined && validated.data.duration_days !== milestone.duration_days) {
      updateData.duration_days = validated.data.duration_days;
      needsDurationValidation = true;
    }

    // Validate budget and duration constraints if needed
    if (needsBudgetValidation || needsDurationValidation) {
      // Get all milestones for the project to calculate totals
      const { data: allMilestones, error: milestonesError } = await supabase
        .from("milestones")
        .select("id, milestone_price, duration_days")
        .eq("project_id", milestone.project_id);

      if (milestonesError) {
        return NextResponse.json(
          { error: "Failed to fetch project milestones" },
          { status: 500 }
        );
      }

      // Calculate current totals excluding the milestone being updated
      const currentTotalPrice = allMilestones
        .filter(m => m.id !== validated.data.id)
        .reduce((sum, m) => sum + (m.milestone_price || 0), 0);

      const currentTotalDuration = allMilestones
        .filter(m => m.id !== validated.data.id)
        .reduce((sum, m) => sum + (m.duration_days || 0), 0);

      // Check price constraint
      if (needsBudgetValidation) {
        const newPrice = validated.data.milestone_price ?? 0;
        const newTotalPrice = currentTotalPrice + newPrice;
        
        if (newTotalPrice > milestone.project.project_price) {
          return NextResponse.json(
            { 
              error: "Milestone price update would exceed project budget",
              details: {
                current_project_budget: milestone.project.project_price,
                proposed_total: newTotalPrice,
                available_budget: milestone.project.project_price - currentTotalPrice,
                current_milestone_price: milestone.milestone_price,
                new_milestone_price: newPrice
              }
            },
            { status: 422 }
          );
        }
      }

      // Check duration constraint
      if (needsDurationValidation) {
        const newDuration = validated.data.duration_days ?? 0;
        const newTotalDuration = currentTotalDuration + newDuration;
        
        if (newTotalDuration > milestone.project.project_duration_days) {
          return NextResponse.json(
            { 
              error: "Milestone duration update would exceed project timeline",
              details: {
                current_project_duration: milestone.project.project_duration_days,
                proposed_total_days: newTotalDuration,
                available_days: milestone.project.project_duration_days - currentTotalDuration,
                current_milestone_duration: milestone.duration_days,
                new_milestone_duration: newDuration
              }
            },
            { status: 422 }
          );
        }
      }
    }

    // If no fields are being updated, return early
    if (Object.keys(updateData).length === 1) { // Only updated_at
      return NextResponse.json({
        success: true,
        message: "No changes detected",
        milestone: milestone,
      });
    }

    // Update the milestone with only the changed fields
    const { data: updatedMilestone, error: updateError } = await supabase
      .from("milestones")
      .update(updateData)
      .eq("id", validated.data.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Milestone update failed: ${updateError.message}`);
    }

    // Log activity and revalidate cache in parallel (non-blocking)
    await Promise.allSettled([
      // Log activity
      supabase
        .from("project_activities")
        .insert({
          project_id: milestone.project_id,
          milestone_id: validated.data.id,
          activity_type: "milestone_updated",
          description: `Milestone "${milestone.title}" updated`,
          performed_by: user.id,
          metadata: {
            updated_fields: Object.keys(updateData).filter(key => key !== 'updated_at'),
            previous_values: {
              title: milestone.title,
              description: milestone.description,
              milestone_price: milestone.milestone_price,
              duration_days: milestone.duration_days,
              status: milestone.status
            },
            new_values: updateData
          }
        })
    ]);

    return NextResponse.json({
      success: true,
      message: "Milestone updated successfully",
    });

  } catch (error: any) {
    console.error("API Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { 
          stack: error.stack,
          ...(originalMilestone && { milestone_name: originalMilestone.title })
        }),
      },
      { status: 500 }
    );
  }
}
