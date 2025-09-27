import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { query } from "@/lib/db"
import { authOptions } from "../../auth/[...nextauth]/options"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Call Postgres function directly
    const { rows } = await query(
      `SELECT * FROM get_dashboard_projects($1)`,
      [userId]
    )

    return NextResponse.json(rows, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    })
  } catch (error: unknown) {
    console.error("Dashboard API Error:", error)
    const message =
      error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
