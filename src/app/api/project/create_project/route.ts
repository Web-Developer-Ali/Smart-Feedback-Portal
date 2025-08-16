import { NextResponse } from "next/server";
import { createProjectSchema } from "@/lib/validations/create_project";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateProjectToken } from "@/lib/utils/tokens";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const requestData = await request.json();
    // Validate input
    const validated = createProjectSchema.safeParse(requestData);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 422 }
      );
    }
    // Verify user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

      const jwtToken = await generateProjectToken({
      clientName: validated.data.client_name,
      clientEmail: validated.data.client_email,
      projectBudget: validated.data.project_budget,
      projectDuration: validated.data.estimated_days,
    });

    // First create project without JWT (temporarily empty)
    const { data: project, error: projectError } = await supabase
      .from("project")
      .insert({
        name: validated.data.name,
        type: validated.data.type,
        agency_id: user.id,
        status: "pending",
        jwt_token: jwtToken, // Temporary empty value
        project_price: validated.data.project_budget,
        project_duration_days: validated.data.estimated_days,
        description: validated.data.description,
        client_name: validated.data.client_name,
        client_email: validated.data.client_email,
      })
      .select("id")
      .single();

    if (projectError)
      throw new Error(`Project creation failed: ${projectError.message}`);

    // Create milestones
    const milestones = validated.data.milestones.map((m) => ({
      project_id: project.id,
      title: m.name,
      duration_days: m.duration_days,
      status: "not_started",
      milestone_price: m.milestone_price,
      free_revisions: m.free_revisions,
      revision_rate: m.revision_rate,
      description: m.description || "",
    }));

    const { error: milestonesError } = await supabase
      .from("milestones")
      .insert(milestones);

    if (milestonesError) {
      // Rollback everything if milestones fail
      await supabase.from("project").delete().eq("id", project.id);
      throw new Error(`Milestones creation failed: ${milestonesError.message}`);
    }

    revalidatePath("/dashboard/projects");

    return NextResponse.json({
      success: true,
      project_id: project.id,
      jwt_token: jwtToken,
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
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
      { status: 500 }
    );
  }
}
