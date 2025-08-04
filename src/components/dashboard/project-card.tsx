import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Eye, MessageSquare, MoreHorizontal, DollarSign, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Project {
  id: string
  name: string
  type: string | null
  agency_user_id: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  project_budget: number | null
  estimated_days: number | null
  review_token: string
  review_link: string
  created_at: string
  updated_at: string
  review_count: number
  average_rating: number
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
      case "completed":
        return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
      case "pending":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "pending":
        return "Pending"
      case "cancelled":
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  const getTypeColor = (type: string | null) => {
    if (!type) return "bg-gray-100 text-gray-600"

    switch (type.toLowerCase()) {
      case "web development":
        return "bg-blue-100 text-blue-700"
      case "mobile development":
        return "bg-green-100 text-green-700"
      case "design":
        return "bg-purple-100 text-purple-700"
      case "branding":
        return "bg-pink-100 text-pink-700"
      default:
        return "bg-indigo-100 text-indigo-700"
    }
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-white to-slate-50 shadow-lg">
      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <CardTitle className="text-base sm:text-lg text-slate-800 truncate">{project.name}</CardTitle>
              {project.type && (
                <Badge className={`text-xs px-2 py-1 ${getTypeColor(project.type)} w-fit`}>{project.type}</Badge>
              )}
            </div>
            <CardDescription className="text-slate-600 text-sm">
              Created {new Date(project.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-slate-100 self-start sm:self-auto">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm">
              <DropdownMenuItem className="hover:bg-blue-50">
                <Eye className="h-4 w-4 mr-2 text-blue-500" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-green-50">
                <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
                View Reviews
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-purple-50">Edit Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {project.project_budget && (
              <div className="flex items-center gap-1 text-xs sm:text-sm bg-green-50 text-green-700 px-2 sm:px-3 py-1 rounded-full">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-semibold">${project.project_budget.toLocaleString()}</span>
              </div>
            )}
            {project.estimated_days && (
              <div className="flex items-center gap-1 text-xs sm:text-sm bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-full">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-semibold">{project.estimated_days} days</span>
              </div>
            )}
          </div>
          <Badge className={`${getStatusColor(project.status)} text-xs sm:text-sm w-fit`}>
            {getStatusText(project.status)}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 text-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
              <span className="font-medium text-xs sm:text-sm">
                {project.average_rating > 0 ? project.average_rating.toFixed(1) : "No rating"}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 text-slate-700 px-2 py-1 rounded-full">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="font-medium text-xs sm:text-sm">{project.review_count} reviews</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
