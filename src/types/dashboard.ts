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

