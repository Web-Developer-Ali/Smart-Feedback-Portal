// app/api/dashboard/user-stats/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createClient();
  
  try {
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is an agency and get their profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    if (!profile.id) {
      return NextResponse.json(
        { error: "User is not registered as an agency" },
        { status: 403 }
      );
    }

    // Use the user's ID as the agency_id (since agency_id in project table references profiles.id)
    const agencyId = user.id;

    // Single RPC call to get all data
    const { data, error } = await supabase.rpc('get_complete_user_stats', {
      agency_id: agencyId // Pass the correct parameter name
    });

    if (error) {
      console.error("RPC error:", error);
      return NextResponse.json(
        { error: "Failed to fetch user statistics" },
        { status: 500 }
      );
    }

    // Format dates in the response
    if (data && data.recent_projects) {
      data.recent_projects = data.recent_projects.map((project: any) => ({
        ...project,
        created_at: new Date(project.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }));
    }
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });

  } catch (error: unknown) {
    console.error('User Stats API Error:', error);
    
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}