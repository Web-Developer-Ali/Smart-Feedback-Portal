import { NextResponse } from "next/server"; 
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";
import { Project } from "@/types/api-projectDetails";
import { Milestone } from "@/types/ProjectDetailPage";

// Validation schema
const deleteMilestoneSchema = z.object({
  milestoneId: z.string().uuid()
});

interface MilestoneWithProject extends Milestone {
  project: Project;
}

// Supabase types
interface Database {
  public: {
    Tables: {
      milestones: {
        Row: Milestone;
      };
      project: {
        Row: Project;
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

    // 🚨 Prevent deletion if milestone has started
    if (milestone.status !== "not_started") {
      return NextResponse.json(
        {
          success: false,
          message: `Milestone cannot be deleted because it is already "${milestone.status}".`
        },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      message: "Milestone deleted successfully"
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
