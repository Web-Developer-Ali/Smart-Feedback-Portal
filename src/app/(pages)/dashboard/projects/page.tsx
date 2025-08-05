"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Briefcase,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star,
  MessageSquare,
  DollarSign,
  Clock,
  Calendar,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  type: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  client_name: string;
  project_budget: number;
  estimated_days: number;
  created_at: string;
  review_count: number;
  average_rating: number;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Website Redesign",
    type: "Web Development",
    status: "in_progress",
    client_name: "TechCorp Inc.",
    project_budget: 15000,
    estimated_days: 45,
    created_at: "Jan 15, 2024",
    review_count: 3,
    average_rating: 4.7,
  },
  {
    id: "2",
    name: "Mobile App Development",
    type: "Mobile Development",
    status: "completed",
    client_name: "StartupXYZ",
    project_budget: 25000,
    estimated_days: 60,
    created_at: "Jan 10, 2024",
    review_count: 5,
    average_rating: 4.9,
  },
  {
    id: "3",
    name: "Brand Identity Package",
    type: "Design",
    status: "pending",
    client_name: "Creative Agency",
    project_budget: 8000,
    estimated_days: 30,
    created_at: "Jan 20, 2024",
    review_count: 0,
    average_rating: 0,
  },
  {
    id: "4",
    name: "Marketing Website",
    type: "Web Development",
    status: "in_progress",
    client_name: "Marketing Pro",
    project_budget: 12000,
    estimated_days: 35,
    created_at: "Jan 18, 2024",
    review_count: 2,
    average_rating: 4.5,
  },
  {
    id: "5",
    name: "Logo Design",
    type: "Branding",
    status: "completed",
    client_name: "Small Business",
    project_budget: 3000,
    estimated_days: 14,
    created_at: "Jan 5, 2024",
    review_count: 1,
    average_rating: 5.0,
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Mock user data
  const mockUser = {
    id: "1",
    email: "user@example.com",
    full_name: "John Doe",
    avatar_url: null,
    role: "agency" as const,
    company_name: "Design Agency",
    created_at: new Date().toISOString(),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "completed":
        return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white";
      case "pending":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "web development":
        return "bg-blue-100 text-blue-700";
      case "mobile development":
        return "bg-green-100 text-green-700";
      case "design":
        return "bg-purple-100 text-purple-700";
      case "branding":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-indigo-100 text-indigo-700";
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    const matchesType = typeFilter === "all" || project.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "in_progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
    pending: projects.filter((p) => p.status === "pending").length,
  };

  return (
    <SidebarProvider>
      <DashboardSidebar user={mockUser} onSignOut={() => {}} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white text-black shadow-lg">
          <SidebarTrigger className="-ml-1 text-black hover:bg-black/10" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-gray-300" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href="/dashboard"
                  className="text-black/90 hover:text-black"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block text-gray-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-black font-medium">
                  Projects
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto p-4 sm:p-6">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
              <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-0 text-white shadow-2xl">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                        <Briefcase className="h-8 w-8 sm:h-10 sm:w-10" />
                        Projects Management
                      </h1>
                      <p className="text-blue-100 text-base sm:text-lg">
                        Manage all your projects and track their progress
                      </p>
                    </div>
                    <Button
                      asChild
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg border-0 px-4 sm:px-6 py-2 sm:py-3 text-base font-semibold"
                    >
                      <Link
                        href="/dashboard/projects/create"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        New Project
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-blue-100 text-sm">Total Projects</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                  <p className="text-amber-100 text-sm">In Progress</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <p className="text-emerald-100 text-sm">Completed</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-purple-100 text-sm">Pending</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search projects or clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Web Development">
                        Web Development
                      </SelectItem>
                      <SelectItem value="Mobile Development">
                        Mobile Development
                      </SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Branding">Branding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight">
                          {project.name}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={getTypeColor(project.type)}>
                            {project.type}
                          </Badge>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <CardDescription className="text-slate-600 truncate">
                          Client: {project.client_name}
                        </CardDescription>
                      </div>
                      <div className="flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-semibold">
                            ${project.project_budget.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          <span className="font-semibold">
                            {project.estimated_days} days
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-sm font-medium">
                            {project.average_rating > 0
                              ? project.average_rating.toFixed(1)
                              : "No rating"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 text-slate-700 px-2 py-1 rounded-full">
                          <MessageSquare className="h-3 w-3" />
                          <span className="text-sm font-medium">
                            {project.review_count} reviews
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                        <Calendar className="h-3 w-3" />
                        <span>Created {project.created_at}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Briefcase className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/projects/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Project
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
