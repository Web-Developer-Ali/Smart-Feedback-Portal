export interface DashboardStatsProps {
  stats: {
    totalProjects: number
    totalReviews: number
    averageRating: number
    growthThisMonth: number
    activeProjects: number
  }
  loading?: boolean
}

export interface DashboardContentProps {
  userStats: UserStats | null
  statsLoading: boolean
  statsError: string | null
  onRetryStats: () => void
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "agency"
  company_name: string | null
  created_at: string
}

export interface UserStats {
  total_projects: number
  total_reviews: number
  avg_rating: number
  growth_this_month: number
  recent_projects: {
    id: string
    name: string
    created_at: string
    status: string
    type: string
    price: number
    duration: number
    total_reviews: number
    avg_rating: number
  }[]
}
