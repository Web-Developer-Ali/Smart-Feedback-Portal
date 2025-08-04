import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Calendar, Award } from "lucide-react"

interface Review {
  id: string
  project_id: string
  milestone_id: string | null
  stars: number
  review: string
  created_at: string
  project_name: string
  client_name: string
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "bg-gradient-to-br from-red-400 to-red-600",
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const getRatingColor = (stars: number) => {
    if (stars >= 5) return "text-green-500"
    if (stars >= 4) return "text-blue-500"
    if (stars >= 3) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50 shadow-md">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Avatar
            className={`h-8 w-8 sm:h-10 sm:w-10 ${getAvatarColor(review.client_name)} text-white shadow-lg flex-shrink-0`}
          >
            <AvatarFallback className="bg-transparent text-white font-semibold text-xs sm:text-sm">
              {review.client_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
              <span className="font-semibold text-slate-800 text-sm sm:text-base truncate">{review.client_name}</span>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full w-fit">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                      i < review.stars ? `fill-current ${getRatingColor(review.stars)}` : "text-gray-300"
                    }`}
                  />
                ))}
                <span className={`text-xs font-medium ml-1 ${getRatingColor(review.stars)}`}>{review.stars}.0</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
              <p className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full truncate max-w-full sm:max-w-[200px]">
                {review.project_name}
              </p>
              {review.milestone_id && (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full w-fit">
                  <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="text-xs font-medium">Milestone</span>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 line-clamp-3 sm:line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
              "{review.review}"
            </p>

            <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full w-fit">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
