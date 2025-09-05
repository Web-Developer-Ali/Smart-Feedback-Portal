import { NextResponse } from "next/server";
import { createProjectSchema } from "@/lib/validations/create_project";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateProjectToken } from "@/lib/utils/tokens";

export async function POST(request: Request) {
  let projectId: string | null = null;
  const supabase = createClient(); // Moved outside try block for rollback access
  
  try {    
    // Parse and validate input in parallel with auth check
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

    // Handle authentication error
    if (authResult.status === 'rejected' || !authResult.value.data?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = authResult.value.data.user;
    const validated = createProjectSchema.safeParse(requestData.value);

    if (!validated.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validated.error.flatten() 
        },
        { status: 422 }
      );
    }

    const { data } = validated;

    // Generate JWT token
    const jwtToken = await generateProjectToken({
      clientName: data.client_name,
      clientEmail: data.client_email,
      projectBudget: data.project_budget,
      projectDuration: data.estimated_days,
    });

    // Prepare project data
    const projectData = {
      name: data.name,
      type: data.type,
      agency_id: user.id,
      status: "pending",
      jwt_token: jwtToken,
      project_price: data.project_budget,
      project_duration_days: data.estimated_days,
      description: data.description,
      client_name: data.client_name,
      client_email: data.client_email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Create project
    const { data: project, error: projectError } = await supabase
      .from("project")
      .insert(projectData)
      .select("id")
      .single();

    if (projectError) {
      throw new Error(`Project creation failed: ${projectError.message}`);
    }

    projectId = project.id;

    // Prepare milestones data
    const milestones = data.milestones.map((m) => ({
      project_id: project.id,
      title: m.name,
      duration_days: m.duration_days,
      status: "not_started",
      milestone_price: m.milestone_price,
      free_revisions: m.free_revisions,
      revision_rate: m.revision_rate,
      description: m.description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Create milestones
    const { error: milestonesError } = await supabase
      .from("milestones")
      .insert(milestones);

    if (milestonesError) {
      throw new Error(`Milestones creation failed: ${milestonesError.message}`);
    }

    // Create project activity log (non-blocking with error handling)
    const activityPromise = supabase
      .from("project_activities")
      .insert({
        project_id: project.id,
        activity_type: "project_created",
        description: `Project "${data.name}" created with ${data.milestones.length} milestones`,
        performed_by: user.id,
        metadata: {
          client_name: data.client_name,
          client_email: data.client_email,
          total_budget: data.project_budget,
          duration_days: data.estimated_days,
          milestone_count: data.milestones.length,
        },
        created_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) {
          console.error("Activity log failed:", error);
        }
      });

    // Wait for non-critical operations to complete (with timeout)
    await Promise.race([
      activityPromise,
      new Promise(resolve => setTimeout(resolve, 3000)) // 3s timeout
    ]);

    return NextResponse.json({
      success: true,
      project_id: project.id,
      message: "Project created successfully",
    });

  } catch (error) {
    console.error("API Error:", error);

    // Rollback project creation if milestones failed
    if (projectId) {
      try {
        await supabase.from("project").delete().eq("id", projectId);
        console.log("Project rollback completed due to error");
      } catch (rollbackError) {
        console.error("Project rollback failed:", rollbackError);
      }
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: (error instanceof Error ? error.message : "Internal server error"),
        ...(process.env.NODE_ENV === "development" && { 
          stack: error instanceof Error ? error.stack : undefined 
        }),
      },
      { status: 500 }
    );
  }
}