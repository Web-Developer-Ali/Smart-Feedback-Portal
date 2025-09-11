export interface MonthlyPerformance {
  month: string
  projects: number
  revenue: number
  avg_rating: number
}

export interface ProjectType {
  type: string
  count: number
  percentage: number
  color: string
}

export interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}

export interface AnalyticsChartsProps {
  monthlyPerformance: MonthlyPerformance[]
  projectTypes: ProjectType[]
  ratingDistribution: RatingDistribution[]
}

export interface AnalyticsMetricsProps {
  totalProjects: number
  totalRevenue: number
  avgRating: number
  happyClients: number
}