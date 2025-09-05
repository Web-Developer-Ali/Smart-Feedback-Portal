// app/api/dashboard/projects/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Response type
interface DashboardProject {
  id: string;
  name: string;
  type: string | null;
  status: string;
  client_name: string;
  project_price: number | null;
  project_duration_days: number | null;
  created_at: string;
  average_rating: number | null;
  total_reviews: number;
}

// Enable dynamic rendering for fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(_request: Request) {
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

    // Use optimized SQL query with RPC for best performance
    const { data: projectsWithStats, error: rpcError } = await supabase.rpc(
      'get_dashboard_projects',
      { user_id: user.id }
    );

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      // Fallback to manual query if RPC fails
      return await getProjectsWithManualQuery(supabase, user.id);
    }

    return NextResponse.json(projectsWithStats || [], {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });

  } catch (error: unknown) {
    console.error("Dashboard API Error:", error);
    
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// Fallback function if RPC is not available
async function getProjectsWithManualQuery(supabase: ReturnType<typeof createClient>, userId: string) {
  try {
    // Get projects with required fields
    const { data: projects, error: projectsError } = await supabase
      .from("project")
      .select(`
        id,
        name,
        type,
        status,
        client_name,
        project_price,
        project_duration_days,
        created_at
      `)
      .eq("agency_id", userId)
      .order("created_at", { ascending: false });

    if (projectsError) {
      throw projectsError;
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json([]);
    }

    const projectIds = projects.map(p => p.id);

    // Get review statistics in a single query
    const { data: reviewStats, error: reviewsError } = await supabase
      .from("reviews")
      .select("project_id, stars")
      .in("project_id", projectIds);

    if (reviewsError) {
      console.error("Review stats error:", reviewsError);
    }

    // Calculate statistics
    const statsMap = new Map<string, { totalReviews: number; totalStars: number }>();
    
    if (reviewStats) {
      reviewStats.forEach(review => {
        if (!statsMap.has(review.project_id)) {
          statsMap.set(review.project_id, { totalReviews: 0, totalStars: 0 });
        }
        const stats = statsMap.get(review.project_id)!;
        stats.totalReviews += 1;
        stats.totalStars += review.stars;
      });
    }

    // Format response
    const dashboardProjects: DashboardProject[] = projects.map(project => {
      const stats = statsMap.get(project.id) || { totalReviews: 0, totalStars: 0 };
      const averageRating = stats.totalReviews > 0 
        ? Math.round((stats.totalStars / stats.totalReviews) * 10) / 10
        : null;

      return {
        id: project.id,
        name: project.name,
        type: project.type,
        status: project.status,
        client_name: project.client_name,
        project_price: project.project_price,
        project_duration_days: project.project_duration_days,
        created_at: project.created_at,
        average_rating: averageRating,
        total_reviews: stats.totalReviews
      };
    });

    return NextResponse.json(dashboardProjects, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error("Manual query fallback error:", error);
    throw error;
  }
}