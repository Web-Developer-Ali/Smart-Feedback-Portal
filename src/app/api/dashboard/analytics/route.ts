import { z } from "zod";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // 1. Authenticate user using NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Get user's agency status from users table
    const profileResult = await query(
      "SELECT id, is_agency FROM users WHERE id = $1",
      [userId]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const profile = profileResult.rows[0];

    const agencyId = profile.id;

    // 3. Call the PostgreSQL function for analytics data
    const result = await query(
      "SELECT get_agency_analytics($1) as analytics",
      [agencyId]
    );

    if (!result.rows.length || !result.rows[0].analytics) {
      return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
    }

    const data = result.rows[0].analytics;

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
      },
    });
    
  } catch (error) {
    console.error("Analytics API error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}