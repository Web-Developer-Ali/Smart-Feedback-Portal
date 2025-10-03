import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star, Award } from "lucide-react";
import type { Review } from "@/types/api-projectDetails";

interface ReviewsTabProps {
  reviews: Review[];
}

export default function ReviewsTab({ reviews }: ReviewsTabProps) {
  if (reviews.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600">
            Reviews will appear here once clients provide feedback on milestones.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="shadow-lg border-0 bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 bg-blue-100 border-2 border-blue-200">
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
              {review.client_name}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {review.client_name}
                </h3>
                <p className="text-sm text-gray-600">{review.created_at}</p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.stars
                        ? "fill-current text-amber-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm font-bold ml-2 text-amber-700">
                  {review.stars}.0
                </span>
              </div>
            </div>
            <blockquote className="text-gray-700 leading-relaxed border-l-4 border-blue-400 pl-4 italic bg-gray-50 p-4 rounded-r-lg">
              &quot;{review.review}&quot;
            </blockquote>

            {review.milestone_id && (
              <Badge className="mt-4 bg-blue-100 text-blue-700 border-blue-200">
                <Award className="h-3 w-3 mr-1" />
                Milestone Review
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}