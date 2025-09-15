import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { updateMilestoneSchema } from "@/lib/validations/create_project";
import { UpdateData } from "@/types/api-projectDetails";

const nullToUndefined = <T>(value: T | null | undefined): T | undefined =>
  value === null ? undefined : value;

export async function PUT(request: Request) {
  const supabase = createClient();

  try {
    const [requestData, authResult] = await Promise.allSettled([
      request.json(),
      supabase.auth.getUser(),
    ]);

    if (requestData.status === "rejected") {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    if (authResult.status === "rejected" || !authResult.value.data?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = authResult.value.data.user;
    const validated = updateMilestoneSchema.safeParse(requestData.value);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 422 }
      );
    }

    const { data: milestone, error: milestoneError } = await supabase
      .from("milestones")
      .select(
        `
        *,
        project:project_id (
          id,
          project_price,
          project_duration_days,
          agency_id,
          name
        )
      `
      )
      .eq("id", validated.data.id)
      .single();

    if (milestoneError || !milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    if (milestone.status !== "not_started") {
      return NextResponse.json(
        {
          error: "Milestone cannot be updated once started",
          current_status: milestone.status,
        },
        { status: 403 }
      );
    }

    if (milestone.project.agency_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to milestone" },
        { status: 403 }
      );
    }

    const updateData: UpdateData = { updated_at: new Date().toISOString() };

    if (validated.data.title !== undefined && validated.data.title !== milestone.title) {
      updateData.title = nullToUndefined(validated.data.title);
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
      updateData.status = nullToUndefined(validated.data.status);
    }

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

    if (needsBudgetValidation || needsDurationValidation) {
      const { data: allMilestones, error: milestonesError } = await supabase
        .from("milestones")
        .select("id, milestone_price, duration_days")
        .eq("project_id", milestone.project_id);

      if (milestonesError) {
        return NextResponse.json({ error: "Failed to fetch project milestones" }, { status: 500 });
      }

      const currentTotalPrice = allMilestones
        .filter((m) => m.id !== validated.data.id)
        .reduce((sum: number, m) => sum + (m.milestone_price || 0), 0);

      const currentTotalDuration = allMilestones
        .filter((m) => m.id !== validated.data.id)
        .reduce((sum: number, m) => sum + (m.duration_days || 0), 0);

      if (needsBudgetValidation) {
        const newPrice = validated.data.milestone_price ?? 0;
        const newTotalPrice = currentTotalPrice + newPrice;

        if (newTotalPrice > milestone.project.project_price) {
          return NextResponse.json(
            {
              error: "Milestone price update would exceed project budget",
            },
            { status: 422 }
          );
        }
      }

      if (needsDurationValidation) {
        const newDuration = validated.data.duration_days ?? 0;
        const newTotalDuration = currentTotalDuration + newDuration;

        if (newTotalDuration > milestone.project.project_duration_days) {
          return NextResponse.json(
            {
              error: "Milestone duration update would exceed project timeline",
            },
            { status: 422 }
          );
        }
      }
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({
        success: true,
        message: "No changes detected",
      });
    }

    const { error: updateError } = await supabase
      .from("milestones")
      .update(updateData)
      .eq("id", validated.data.id);

    if (updateError) {
      throw new Error(`Milestone update failed: ${updateError.message}`);
    }

    try {
      revalidatePath(`/dashboard/projects/${milestone.project_id}`);
      revalidatePath("/dashboard/projects");
    } catch (cacheError) {
      console.error("Cache revalidation failed:", cacheError);
    }

    return NextResponse.json({
      success: true,
      message: "Milestone updated successfully",
    });
  } catch (error: unknown) {
    console.error("API Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten() }, { status: 422 });
    }

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
