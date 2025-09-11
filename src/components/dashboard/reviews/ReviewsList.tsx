import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Calendar, Loader2 } from "lucide-react";
import { Star } from "lucide-react";
import { Pagination, Review } from "@/types/dashboard";

interface ReviewsListProps {
  reviews: Review[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  hasDataFetched: boolean;
}

export function ReviewsList({ 
  reviews, 
  pagination, 
  loading, 
  error, 
  onPageChange,
  hasDataFetched 
}: ReviewsListProps) {
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "bg-gradient-to-br from-red-400 to-red-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getRatingColor = (stars: number) => {
    if (stars >= 5) return "text-green-500";
    if (stars >= 4) return "text-blue-500";
    if (stars >= 3) return "text-amber-500";
    return "text-red-500";
  };

  // Show loader on initial load
  if (loading && !hasDataFetched) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-10 w-10 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="text-center py-12 text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  // Only show "No reviews found" after data has been fetched and there are no results
  if (hasDataFetched && reviews.length === 0) {
    return (
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No reviews found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filters
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show loader for subsequent loads (filter changes, pagination)
  if (loading && hasDataFetched) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {/* Show existing reviews faded out */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className="shadow-xl border-0 bg-white/90 backdrop-blur-sm"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <Avatar
                      className={`h-12 w-12 ${getAvatarColor(
                        review.client_name
                      )} text-white shadow-lg flex-shrink-0`}
                    >
                      <AvatarFallback className="bg-transparent text-white font-semibold">
                        {review.client_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      {/* Skeleton content */}
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-gray-500 animate-spin" />
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="space-y-6">
        {reviews.map((review) => (
          <Card
            key={review.id}
            className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <Avatar
                  className={`h-12 w-12 ${getAvatarColor(
                    review.client_name
                  )} text-white shadow-lg flex-shrink-0`}
                >
                  <AvatarFallback className="bg-transparent text-white font-semibold">
                    {review.client_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">
                        {review.client_name}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {review.project_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.stars
                                ? `fill-current ${getRatingColor(
                                    review.stars
                                  )}`
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span
                          className={`text-sm font-medium ml-1 ${getRatingColor(
                            review.stars
                          )}`}
                        >
                          {review.stars}.0
                        </span>
                      </div>
                    </div>
                  </div>

                  <blockquote className="text-slate-700 text-base leading-relaxed mb-4 border-l-4 border-amber-400 pl-4 italic">
                    "{review.review}"
                  </blockquote>

                  <div className="flex items-center gap-1 text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full w-fit">
                    <Calendar className="h-4 w-4" />
                    <span>{review.created_at}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            disabled={!pagination.has_prev || loading}
            onClick={() => onPageChange(Math.max(1, pagination.current_page - 1))}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700 flex items-center">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          <button
            disabled={!pagination.has_next || loading}
            onClick={() => onPageChange(pagination.current_page + 1)}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}