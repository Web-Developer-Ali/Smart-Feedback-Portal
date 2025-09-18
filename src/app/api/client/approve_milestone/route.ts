import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

// Validation schema
const approveMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
  projectId: z.string().uuid()
});

// Supabase types
interface Database {
  public: {
    Tables: {
      milestones: {
        Row: any;
      };
      project: {
        Row: any;
      };
    };
  };
}

type Supabase = SupabaseClient<Database>;

export async function POST(request: Request) {
  const supabase = createClient() as Supabase;
  
  try {
    const body = await request.json();
    const { milestoneId, projectId } = body;

    // Validate input
    const validated = approveMilestoneSchema.safeParse({
      milestoneId,
      projectId
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
          client_email
        )
      `)
      .eq("id", milestoneId)
      .eq("project_id", projectId)
      .single();

    if (milestoneError || !milestone) {
      return NextResponse.json(
        { error: "Milestone not found or does not belong to the specified project" },
        { status: 404 }
      );
    }

    // Check authorization - user must be the client
    if (milestone.project.client_email !== user.email) {
      return NextResponse.json(
        { error: "Unauthorized access to milestone" },
        { status: 403 }
      );
    }

    // Update milestone status to approved
    const { data, error: updateError } = await supabase
      .from("milestones")
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq("id", milestoneId)
      .eq("project_id", projectId)
      .select();

    if (updateError) {
      throw new Error(`Milestone approval failed: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Milestone approved successfully",
      milestone: data[0]
    });

  } catch (error: unknown) {
    console.error("API Error:", error);

    const errorMessage = error instanceof Error 
      ? error.message 
      : "Internal server error";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}