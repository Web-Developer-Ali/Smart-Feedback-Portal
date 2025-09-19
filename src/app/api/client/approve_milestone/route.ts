import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const approveMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = createClient();
  
  try {
  const { searchParams } = new URL(request.url);
  const milestoneId = searchParams.get('milestoneId');
    if (!milestoneId) {
      return NextResponse.json(
        { error: "milestoneId query parameter is required" },
        { status: 400 }
      );
    }

    // Validate input
    const validated = approveMilestoneSchema.safeParse({ milestoneId });

    if (!validated.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validated.error.flatten() 
        },
        { status: 400 }
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
      .single();

    if (milestoneError) {
      console.error("Milestone fetch error:", milestoneError);
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    // Update milestone status to approved
    const { data: updatedMilestone, error: updateError } = await supabase
      .from("milestones")
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq("id", milestoneId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Milestone approval failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Milestone approved successfully",
      milestone: updatedMilestone
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