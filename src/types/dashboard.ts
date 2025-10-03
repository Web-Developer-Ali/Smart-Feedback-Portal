export interface DashboardProject {
  id: string;
  name: string;
  type: string | null;
  status: string;
  client_name: string;
  project_price: number | null;
  project_duration_days: number | null;
  created_at: string;
  average_rating: number | null;
  total_reviews: number;
}

export interface ProjectsGridProps {
  projects: DashboardProject[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  typeFilter: string;
  setTypeFilter: (filter: string) => void;
  onProjectDelete?: () => void;
}

export interface ProjectsStatsProps {
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    pending: number;
  };
}

export interface Review {
  milestone_id?: string | null;
  id: string;
  project_name: string;
  client_name: string;
  stars: number;
  review: string;
  created_at: string;
  project_type: string;
}

export interface ReviewStats {
  total: number;
  averageRating: string;
  fiveStars: number;
  thisMonth: number;
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  total_reviews: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ReviewsFiltersProps {
  searchTerm: string;
  ratingFilter: string;
  typeFilter: string;
  onSearchChange: (value: string) => void;
  onRatingFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  debounceDelay?: number;
}

export interface ReviewsResponse {
  stats: ReviewStats;
  reviews: Review[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_reviews: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
export interface SupabaseReview {
  id: string;
  stars: number;
  review: string;
  created_at: string;
  milestone_id: string | null;
  project: {
    name: string;
    type: string;
    client_name: string;
  } | null;
}