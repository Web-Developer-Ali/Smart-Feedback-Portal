"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { RefreshCw, XCircle } from "lucide-react"
import { toast } from "sonner"
import axios, { AxiosError } from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/client/client-review/page-header"
import { ProjectOverview } from "@/components/client/client-review/project-overview"
import { MilestoneCard } from "@/components/client/client-review/milestone-card"
import { HelpSection } from "@/components/client/client-review/help-section"
import { Project } from "@/types/client-review"

export default function ClientReviewPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const params = useParams()
  const projectId = params?.projectId as string

  const projectData = useMemo(() => project, [project])
  const router = useRouter();
  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setError("Project ID is required")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data } = await axios.get(`/api/client/client-review`, {
        params: { projectId },
      })
      setProject(data)
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.message ||
        "Failed to fetch project"

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const allMilestonesApproved = useMemo(() => {
    if (!project?.milestones) return false
    return project.milestones.every((milestone) => milestone.status === "approved")
  }, [project?.milestones])

 const handleMilestoneAction = useCallback(
  async (milestoneId: string, action: "approve" | "reject" , revisionNotes?: string) => {
    try {
      if (action === "approve") {
        await axios.post(`/api/client/approve_milestone?milestoneId=${milestoneId}`)
      } else if (action === "reject") {
        await axios.post(`/api/client/reject_milestone`, {
          projectId,
          milestoneId,
          revisionNotes,
        })
      }

      toast.success(`Milestone ${action}d successfully`)
      await fetchProject()
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.message ||
        `Failed to ${action} milestone`

      toast.error(errorMessage)
    }
  },
  [fetchProject, projectId],
)


  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading project data...</p>
        </div>
      </div>
    )
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Project</h2>
          <p className="text-gray-600 mb-4">{error || "Failed to load project data"}</p>
          <button
            onClick={fetchProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <PageHeader freelancerName={projectData.freelancerName} freelancerAvatar={projectData.freelancerAvatar} />

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <ProjectOverview
          title={projectData.title}
          totalAmount={projectData.totalAmount}
          description={projectData.description}
          type={projectData.type}
          status={projectData.status}
        />

        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Project Milestones</h2>

            {projectData.milestones.map((milestone , index) => (
              <MilestoneCard
                index={index}
                key={milestone.id}
                milestone={milestone}
                onMilestoneAction={handleMilestoneAction}
                projectId={projectData.id}
              />
            ))}

            {allMilestonesApproved && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center space-x-2">
                    <span>🎉</span>
                    <span>All Milestones Completed!</span>
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Great work! All project milestones have been approved. We'd love to hear your overall feedback about
                    this project.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => (router.push(`/client/feedback/${projectData.id}`))}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Give Project Feedback
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="max-w-md">
            <HelpSection
             projectId={projectData.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
