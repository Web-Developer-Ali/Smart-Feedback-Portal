export interface RevenueMetrics {
  avg_revenue_per_project: number
  projects_with_cleared_payments: number
  total_actual_revenue: number
  total_potential_revenue: number
}

export interface AnalyticsData {
  total_projects: number
  avg_rating: number
  happy_clients: number
  revenue_metrics: RevenueMetrics
}

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
  totalPotentialRevenue: number
  avgRating: number
  happyClients: number
}