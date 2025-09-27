import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Authenticate user using NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Ensure user profile exists
    const profileResult = await query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);

    if (profileResult.rowCount === 0) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const profile = profileResult.rows[0];

    if (!profile?.id) {
      return NextResponse.json(
        { error: "User is not registered as an agency" },
        { status: 403 }
      );
    }

    // Use the user's ID as the agency_id
    const agencyId = userId;

    // Call the PostgreSQL function
    const result = await query(
      "SELECT get_complete_user_stats($1) as stats",
      [agencyId]
    );

    if (result.rowCount === 0 || !result.rows[0]?.stats) {
      return NextResponse.json(
        { error: "Failed to fetch user statistics" },
        { status: 500 }
      );
    }

    const data = result.rows[0].stats;

    // Format dates safely in recent projects
    if (data?.recent_projects) {
      data.recent_projects = data.recent_projects.map(
        (project: { created_at: string | number | Date }) => ({
          ...project,
          created_at: new Date(project.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        })
      );
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error: unknown) {
    console.error("User Stats API Error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
