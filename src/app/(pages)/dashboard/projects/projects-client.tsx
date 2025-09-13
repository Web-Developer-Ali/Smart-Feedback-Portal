"use client"

import { useState, useEffect } from "react"
import axios, { type AxiosError } from "axios"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ProjectsHeader } from "@/components/dashboard/projects/projects-header"
import { ProjectsStats } from "@/components/dashboard/projects/projects-stats"
import { ProjectsGrid } from "@/components/dashboard/projects/projects-grid"
import type { DashboardProject } from "@/types/dashboard"
import { Loader2 } from "lucide-react"

export default function ProjectsClient() {
  const [projects, setProjects] = useState<DashboardProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get<DashboardProject[]>("/api/dashboard/projects")
      setProjects(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ message?: string }>
        if (axiosError.response) {
          setError(axiosError.response.data?.message || `Request failed with status ${axiosError.response.status}`)
        } else if (axiosError.request) {
          setError("No response from server. Please check your connection.")
        } else {
          setError(axiosError.message || "Unexpected error occurred.")
        }
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesType = typeFilter === "all" || (project.type && project.type === typeFilter)

    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "in_progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
    pending: projects.filter((p) => p.status === "pending").length,
  }

  // Mock user data
  const mockUser = {
    id: "1",
    email: "user@example.com",
    full_name: "John Doe",
    avatar_url: null,
    role: "agency" as const,
    company_name: "Design Agency",
    created_at: new Date().toISOString(),
  }

  if (loading) {
    return (
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <div className="flex flex-col justify-center items-center h-screen bg-background dark:bg-gray-900">
            <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-gray-200 mb-4" />
            <p className="text-muted-foreground dark:text-gray-400">Loading your projects...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error) {
    return (
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Projects</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchProjects}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                aria-label="Retry loading projects"
              >
                Try Again
              </button>
            </div>
          </section>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="min-h-screen min-w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto p-4 sm:p-6">
            <header>
              <ProjectsHeader />
            </header>

            <section aria-labelledby="projects-stats">
              <h2 id="projects-stats" className="sr-only">
                Project Statistics
              </h2>
              <ProjectsStats stats={stats} />
            </section>

            <section aria-labelledby="projects-grid">
              <h2 id="projects-grid" className="sr-only">
                Projects List
              </h2>
              <ProjectsGrid
                projects={filteredProjects}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
              />
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
