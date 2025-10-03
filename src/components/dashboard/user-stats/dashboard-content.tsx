"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, MessageSquare, Star, TrendingUp, AlertCircle } from "lucide-react"
import { DashboardContentProps } from "@/types/user-stats"

export function DashboardContent({ userStats, statsLoading, statsError, onRetryStats }: DashboardContentProps) {
  const stats = {
    totalProjects: userStats?.total_projects || 0,
    totalReviews: userStats?.total_reviews || 0,
    averageRating: userStats?.avg_rating || 0,
    growthThisMonth: userStats?.growth_this_month || 0,
    completion_rate: userStats?.completion_rate || 0,
  }

  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-6" aria-label="Dashboard content">
      {/* Recent Projects */}
      <Card className="xl:col-span-2 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-slate-800 text-lg sm:text-xl">
            <div className="p-2 bg-blue-500 text-white rounded-lg" aria-hidden="true">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            Recent Projects
          </CardTitle>
          <CardDescription className="text-slate-600 text-sm sm:text-base">
            Your most recent projects with performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          {statsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error loading projects</span>
              </div>
              <p className="text-sm text-red-700 mb-3">{statsError}</p>
              <Button
                onClick={onRetryStats}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
              >
                Retry
              </Button>
            </div>
          )}

          {statsLoading ? (
            <div aria-label="Loading recent projects">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : userStats?.recent_projects && userStats.recent_projects.length > 0 ? (
            <div role="list" aria-label="Recent projects list">
              {userStats.recent_projects.map((project) => (
                <article
                  key={project.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  role="listitem"
                >
                  <header className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        project.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : project.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status.replace("_", " ")}
                    </span>
                  </header>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span> {project.type || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> ${project.price}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {project.duration} days
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" aria-hidden="true" />
                      <span className="font-medium">{project.avg_rating.toFixed(1)}</span>
                      <span className="text-gray-500 ml-1">({project.total_reviews} reviews)</span>
                    </div>
                  </div>
                  <time className="text-xs text-gray-500 mt-2 block" dateTime={project.created_at}>
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </time>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500" role="status" aria-label="No projects available">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl inline-block mb-4">
                <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-blue-400" aria-hidden="true" />
              </div>
              <p className="text-base sm:text-lg font-medium">No projects yet</p>
              <p className="text-xs sm:text-sm text-gray-400">Create your first project to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-slate-800 text-lg sm:text-xl">
            <div className="p-2 bg-amber-500 text-white rounded-lg" aria-hidden="true">
              <Star className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            Performance Summary
          </CardTitle>
          <CardDescription className="text-slate-600 text-sm sm:text-base">
            Your overall agency performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          {statsLoading ? (
            <div className="animate-pulse space-y-4" aria-label="Loading performance metrics">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : userStats ? (
            <div role="list" aria-label="Performance metrics">
              {/* Completion Rate */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg" role="listitem">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Project Completion Rate</span>
                  <span
                    className="text-2xl font-bold text-blue-600"
                    aria-label={`${stats.completion_rate}% completion rate`}
                  >
                    {stats.completion_rate}%
                  </span>
                </div>
                <div
                  className="w-full bg-blue-200 rounded-full h-2 mt-2"
                  role="progressbar"
                  aria-valuenow={stats.completion_rate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.completion_rate}%` }}
                  ></div>
                </div>
              </div>

              {/* Client Satisfaction */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg" role="listitem">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Client Satisfaction</span>
                  <span
                    className="text-2xl font-bold text-green-600"
                    aria-label={`${stats.averageRating.toFixed(1)} out of 5 stars`}
                  >
                    {stats.averageRating.toFixed(1)}/5
                  </span>
                </div>
                <div className="flex items-center mt-1" role="img" aria-label={`${stats.averageRating} star rating`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(stats.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>

              {/* Monthly Growth */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg" role="listitem">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Monthly Growth</span>
                  <span
                    className={`text-2xl font-bold ${stats.growthThisMonth >= 0 ? "text-green-600" : "text-red-600"}`}
                    aria-label={`${stats.growthThisMonth}% monthly growth`}
                  >
                    {stats.growthThisMonth >= 0 ? "+" : ""}
                    {stats.growthThisMonth}%
                  </span>
                </div>
                <TrendingUp
                  className={`h-6 w-6 mt-1 ${stats.growthThisMonth >= 0 ? "text-green-500" : "text-red-500"}`}
                  aria-hidden="true"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500" role="status" aria-label="No performance data available">
              <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl inline-block mb-4">
                <MessageSquare className="h-12 w-12 mx-auto text-amber-400" aria-hidden="true" />
              </div>
              <p className="text-base font-medium">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
