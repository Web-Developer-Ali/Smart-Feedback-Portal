import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReviewsFiltersProps } from "@/types/dashboard";

export function ReviewsFilters({
  ratingFilter,
  onRatingFilterChange,
}: Pick<ReviewsFiltersProps, "ratingFilter" | "onRatingFilterChange">) {
  return (
    <Card className="mb-6 shadow-lg border border-gray-100 bg-white/90 backdrop-blur-sm rounded-2xl">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Rating Filter */}
          <Select value={ratingFilter} onValueChange={onRatingFilterChange}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">⭐ 5 Stars</SelectItem>
              <SelectItem value="4">⭐ 4 Stars</SelectItem>
              <SelectItem value="3">⭐ 3 Stars</SelectItem>
              <SelectItem value="2">⭐ 2 Stars</SelectItem>
              <SelectItem value="1">⭐ 1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
