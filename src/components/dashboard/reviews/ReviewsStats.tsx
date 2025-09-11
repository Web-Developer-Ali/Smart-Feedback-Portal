import { Card, CardContent } from "@/components/ui/card";
import { ReviewStats } from "@/types/dashboard";
import { Star } from "lucide-react";


interface ReviewsStatsProps {
  stats: ReviewStats | null;
}

export function ReviewsStats({ stats }: ReviewsStatsProps) {
  if (!stats) return null;

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <Card className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 border-0 text-white shadow-2xl">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                  <Star className="h-8 w-8 sm:h-10 sm:w-10 fill-current" />
                  Client Reviews
                </h1>
                <p className="text-amber-100 text-base sm:text-lg">
                  See what your clients are saying about your work
                </p>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-3xl sm:text-4xl font-bold">
                  {stats.averageRating}
                </div>
                <p className="text-amber-100">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-blue-100 text-sm">Total Reviews</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl">
          <CardContent className="p-4">
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.averageRating}
              <Star className="h-5 w-5 fill-current" />
            </div>
            <p className="text-amber-100 text-sm">Avg Rating</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.fiveStars}</div>
            <p className="text-emerald-100 text-sm">5-Star Reviews</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-purple-100 text-sm">This Month</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}