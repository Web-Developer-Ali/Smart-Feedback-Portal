"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Loader2 } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AnalyticsMetrics } from "@/components/dashboard/Analytics/analytics-metrics"
import { AnalyticsCharts } from "@/components/dashboard/Analytics/analytics-charts"

// Define API response type based on your actual API response
interface AnalyticsData {
  total_projects: number
  total_revenue: number
  avg_rating: number
  happy_clients: number
  growth_percentage: number
  monthly_performance: {
    month: string
    projects: number
    revenue: number
    avg_rating: number
  }[]
  project_types: Record<string, number>
  rating_distribution: Record<
    string,
    {
      count: number
      percentage: number
    }
  >
}

// Define colors for project types
const PROJECT_TYPE_COLORS: Record<string, string> = {
  "Web Development": "bg-blue-500",
  "Mobile App": "bg-purple-500",
  "UI/UX Design": "bg-pink-500",
  Branding: "bg-orange-500",
  Marketing: "bg-green-500",
  Other: "bg-gray-500",
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        // Replace with your backend endpoint that calls get_agency_analytics
        const res = await axios.get(`/api/dashboard/analytics`)
        setAnalytics(res.data)
      } catch (err: any) {
        console.error("Failed to fetch analytics:", err)
        setError("Unable to load analytics. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

   if (loading) {
    return (
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <div className="flex flex-col justify-center items-center h-screen bg-background dark:bg-gray-900">
            <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-gray-200 mb-4" />
            <p className="text-muted-foreground dark:text-gray-400">Loading your analytics...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <p className="text-slate-600">No analytics data available.</p>
      </div>
    )
  }

  // Convert project_types object to array for rendering
  const projectTypesArray = Object.entries(analytics.project_types || {}).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / analytics.total_projects) * 100),
    color: PROJECT_TYPE_COLORS[type] || "bg-gray-500",
  }))

  // Convert rating_distribution object to array for rendering
  const ratingDistributionArray = Object.entries(analytics.rating_distribution || {})
    .map(([rating, data]) => ({
      rating: Number.parseInt(rating),
      count: data.count,
      percentage: data.percentage,
    }))
    .sort((a, b) => b.rating - a.rating)

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white text-black shadow-lg">
          <SidebarTrigger className="-ml-1 text-black hover:bg-black/10" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-gray-300" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard" className="text-black/90 hover:text-black">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block text-gray-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-black font-medium">Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Page Content */}
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto p-4 sm:p-6">
            {/* Header Section */}
            <header className="mb-6 sm:mb-8">
              <Card className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-0 text-white shadow-2xl">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
                        Analytics Dashboard
                      </h1>
                      <p className="text-emerald-100 text-base sm:text-lg">
                        Track your business performance and growth metrics
                      </p>
                    </div>
                    <div className="text-center lg:text-right">
                      <div
                        className="text-3xl sm:text-4xl font-bold"
                        aria-label={`Growth this month: ${analytics.growth_percentage}%`}
                      >
                        {analytics.growth_percentage}%
                      </div>
                      <p className="text-emerald-100">Growth This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </header>

            {/* Key Metrics */}
            <AnalyticsMetrics
              totalProjects={analytics.total_projects}
              totalRevenue={analytics.total_revenue}
              avgRating={analytics.avg_rating}
              happyClients={analytics.happy_clients}
            />

            {/* Charts and Analytics */}
            <AnalyticsCharts
              monthlyPerformance={analytics.monthly_performance}
              projectTypes={projectTypesArray}
              ratingDistribution={ratingDistributionArray}
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
