import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request) {
  try {
    const supabase = createClient();
    
    // 1. Authenticate user first (most important check)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get user's agency ID from profile (single query)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();
    if (profileError || !profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const agencyId = profile.id;
    if (!agencyId) {
      return NextResponse.json({ error: "User is not associated with an agency" }, { status: 403 });
    }

    // 3. Single RPC call for all analytics data
    const { data, error } = await supabase.rpc("get_agency_analytics", {
      agency_id: agencyId,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

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