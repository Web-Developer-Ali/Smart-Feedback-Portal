import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

// Validation schema
const ProjectSchema = z.object({
  projectId: z.string().uuid(),
})

// Supabase types (simplified)
interface Database {
  public: {
    Tables: {
      milestones: { Row: any }
      project: { Row: any }
      reviews: { Row: any }
    }
  }
}

type Supabase = SupabaseClient<Database>

export async function GET(request: Request) {
  const supabase = createClient() as Supabase
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      console.warn("⚠️ No projectId provided")
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Validate input format
    const validated = ProjectSchema.safeParse({ projectId })
    if (!validated.success) {
      console.warn("⚠️ Validation failed:", validated.error.flatten())
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.warn("⚠️ Auth failed:", authError?.message)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from("project")
      .select("*")
      .eq("id", projectId)
      .single()

if (!project) {
  return NextResponse.json({ error: "Project not found" }, { status: 400 })
}

    if (projectError) {
      console.error("❌ Project query error:", projectError.message)
      return NextResponse.json({ error: "Error fetching project" }, { status: 500 })
    }

    if (!project) {
      console.warn("⚠️ Project not found:", projectId)
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check authorization
    if (project.agency_id !== user.id && project.client_email !== user.email) {
      console.warn("⚠️ Unauthorized access. User:", user.id, "Project:", project)
      return NextResponse.json({ error: "Unauthorized access to project" }, { status: 403 })
    }

    // Get milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from("milestones")
      .select(
        `
        *,
        media_attachments (
          id,
          public_ids,
          file_name,
          submission_notes,
          uploaded_at
        )
      `
      )
      .eq("project_id", projectId)
      .order("created_at")

    if (milestonesError) {
      console.error("❌ Milestones query error:", milestonesError.message)
      return NextResponse.json({ error: "Error fetching milestones" }, { status: 500 })
    }

    // Transform data
  const transformedProject = {
  id: project.id,
  title: project.name,
  status: project.status,
  description: project.description,
  type: project.type,
  freelancerName: project.client_name,
  freelancerAvatar: "/professional-woman-developer.png",
  totalAmount: project.project_price,
  milestones: (milestones || []).map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description || "",
    status: mapStatusToFrontend(m.status),
    deliverables: [],
    dueDate: m.created_at && m.duration_days
      ? calculateDueDate(m.created_at, m.duration_days)
      : null,
    submittedDate: m.submitted_at
      ? new Date(m.submitted_at).toISOString().split("T")[0]
      : undefined,
    price: m.milestone_price,
    duration: m.duration_days ? `${m.duration_days} days` : null,
    freeRevisions: m.free_revisions,
    usedRevisions: m.used_revisions,
    revisionRate: m.revision_rate,
  })),
}
    return NextResponse.json(transformedProject)
  } catch (error) {
    console.error("💥 API Unexpected Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

function mapStatusToFrontend(
  status: string
): "pending" | "submitted" | "approved" | "rejected" | "in_progress" | "Not Started" {
  const statusMap = {
    submitted: "submitted",
    approved: "approved",
    rejected: "rejected",
    in_progress: "pending",
    not_started: "Not Started",
  } as const
  return statusMap[status as keyof typeof statusMap] || "in_progress"
}

function calculateDueDate(createdAt: string, durationDays: number): string {
  const date = new Date(createdAt)
  date.setDate(date.getDate() + durationDays)
  return date.toISOString().split("T")[0]
}
