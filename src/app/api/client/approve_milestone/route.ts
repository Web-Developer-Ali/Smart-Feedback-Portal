import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const approveMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get('milestoneId');
    
    if (!milestoneId) {
      return NextResponse.json(
        { error: "MilestoneId query parameter is required" },
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

    // Update milestone status using your query function
    const updateResult = await query
    (
      `UPDATE milestones 
       SET status = $1, updated_at = $2
       WHERE id = $3
       RETURNING *`,
      ["approved", new Date().toISOString(), milestoneId]
    );

    if (!updateResult.rows.length) {
      return NextResponse.json(
        { error: "Milestone approval failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Milestone approved successfully",
      milestone: updateResult.rows[0]
    });

  } catch (error: unknown) {
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}