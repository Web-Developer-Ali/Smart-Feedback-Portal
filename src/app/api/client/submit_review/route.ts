import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

// Validation schema
const submitReviewSchema = z.object({
  milestoneId: z.string().uuid(),
  projectId: z.string().uuid(),
  review: z.string().min(10).max(2000),
  rating: z.number().min(1).max(5)
});

// Supabase types
interface Database {
  public: {
    Tables: {
      reviews: {
        Row: any;
      };
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
    const { milestoneId, projectId, review, rating } = body;

    // Validate input
    const validated = submitReviewSchema.safeParse({
      milestoneId,
      projectId,
      review,
      rating
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

    // Get project info to verify authorization
    const { data: project, error: projectError } = await supabase
      .from("project")
      .select("id, client_email")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check authorization - user must be the client
    if (project.client_email !== user.email) {
      return NextResponse.json(
        { error: "Unauthorized to submit review" },
        { status: 403 }
      );
    }

    // Check if review already exists for this milestone
    const { data: existingReview, error: checkError } = await supabase
      .from("reviews")
      .select("id")
      .eq("milestone_id", milestoneId)
      .eq("project_id", projectId)
      .single();

    if (existingReview && !checkError) {
      return NextResponse.json(
        { error: "Review already exists for this milestone" },
        { status: 409 }
      );
    }

    // Store review in database
    const { data, error: insertError } = await supabase
      .from("reviews")
      .insert({
        project_id: projectId,
        milestone_id: milestoneId,
        review: review.trim(),
        stars: rating
      })
      .select();

    if (insertError) {
      throw new Error(`Review submission failed: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      review: data[0]
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