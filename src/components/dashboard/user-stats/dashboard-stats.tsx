import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, MessageSquare, Star, TrendingUp, Target, Users, Award, Clock } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalProjects: number
    totalReviews: number
    averageRating: number
    growthThisMonth: number
    activeProjects: number
  }
  loading?: boolean
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        aria-label="Dashboard statistics loading"
      >
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    )
  }

  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
      aria-label="Dashboard statistics"
    >
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-100">Total Projects</CardTitle>
          <div className="p-2 bg-white/20 rounded-lg" aria-hidden="true">
            <Briefcase className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" aria-label={`${stats.totalProjects} total projects`}>
            {stats.totalProjects}
          </div>
          <p className="text-xs text-blue-100 flex items-center gap-1 mt-1">
            <Target className="h-3 w-3" aria-hidden="true" />
            {stats.activeProjects} active projects
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-100">Total Reviews</CardTitle>
          <div className="p-2 bg-white/20 rounded-lg" aria-hidden="true">
            <MessageSquare className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" aria-label={`${stats.totalReviews} total reviews`}>
            {stats.totalReviews}
          </div>
          <p className="text-xs text-emerald-100 flex items-center gap-1 mt-1">
            <Users className="h-3 w-3" aria-hidden="true" />
            From satisfied clients
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500 to-orange-500 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-100">Average Rating</CardTitle>
          <div className="p-2 bg-white/20 rounded-lg" aria-hidden="true">
            <Star className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="text-3xl font-bold flex items-center gap-1"
            aria-label={`${stats.averageRating.toFixed(1)} out of 5 stars average rating`}
          >
            {stats.averageRating.toFixed(1)}
            <Star className="h-6 w-6 fill-current" aria-hidden="true" />
          </div>
          <p className="text-xs text-amber-100 flex items-center gap-1 mt-1">
            <Award className="h-3 w-3" aria-hidden="true" />
            Out of 5 stars
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-100">This Month</CardTitle>
          <div className="p-2 bg-white/20 rounded-lg" aria-hidden="true">
            <TrendingUp className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold ${stats.growthThisMonth >= 0 ? "text-green-100" : "text-red-100"}`}
            aria-label={`${stats.growthThisMonth}% growth this month`}
          >
            {stats.growthThisMonth >= 0 ? "+" : ""}
            {stats.growthThisMonth}%
          </div>
          <p className="text-xs text-purple-100 flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Project growth
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
