import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

// Validation schema
const rejectMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
  projectId: z.string().uuid(),
  revisionNotes: z.string().min(1, "Revision notes are required for rejection").max(1000)
});

// Supabase types
interface Database {
  public: {
    Tables: {
      milestones: {
        Row: {
          id: string;
          project_id: string;
          status: string;
          used_revisions: number;
          free_revisions: number;
          revision_rate: number;
          milestone_price: number;
        };
      };
      project: {
        Row: {
          id: string;
          agency_id: string;
          client_email: string;
          project_price: number;
        };
      };
      messages: {
        Insert: {
          type: 'rejection';
          content: string;
          project_id: string;
          milestone_id: string;
        };
      };
    };
  };
}

type Supabase = SupabaseClient<Database>;

export async function POST(request: Request) {
  const supabase = createClient() as Supabase;
  
  try {
    const body = await request.json();
    const { milestoneId, projectId, revisionNotes } = body;

    // Validate input
    const validated = rejectMilestoneSchema.safeParse({
      milestoneId,
      projectId,
      revisionNotes
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

    // Get milestone data with pricing information
    const { data: milestone, error: milestoneError } = await supabase
      .from("milestones")
      .select(`
        id, 
        project_id, 
        status, 
        used_revisions,
        free_revisions,
        revision_rate,
        milestone_price
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

    // Check if milestone is already rejected
    if (milestone.status === 'rejected') {
      return NextResponse.json(
        { error: "Milestone is already rejected" },
        { status: 400 }
      );
    }

    // Check if milestone is in a rejectable state
    const validStatuses = 'submitted';
    if (!validStatuses.includes(milestone.status)) {
      return NextResponse.json(
        { 
          error: "Cannot reject milestone in current status",
          currentStatus: milestone.status
        },
        { status: 400 }
      );
    }

    // Use transaction to handle revision pricing logic
    const { data: result, error: transactionError } = await supabase.rpc('reject_milestone_with_message', {
      p_milestone_id: milestoneId,
      p_project_id: projectId,
      p_revision_notes: revisionNotes,
      p_current_used_revisions: milestone.used_revisions || 0,
      p_free_revisions: milestone.free_revisions || 0,
      p_revision_rate: milestone.revision_rate || 0,
      p_current_milestone_price: milestone.milestone_price || 0
    });

    if (transactionError) {
      throw new Error(`Transaction failed: ${transactionError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Milestone rejected successfully",
      data: {
        hasFreeRevisions: result.has_free_revisions,
        revisionCharge: result.revision_charge,
        newMilestonePrice: result.new_milestone_price,
        newProjectPrice: result.new_project_price
      }
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