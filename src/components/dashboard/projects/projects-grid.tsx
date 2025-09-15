"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Star,
  MessageSquare,
  DollarSign,
  Clock,
  Calendar,
  Briefcase,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { DashboardProject, ProjectsGridProps } from "@/types/dashboard";

export function ProjectsGrid({
  projects,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  onProjectDelete,
}: ProjectsGridProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] =
    useState<DashboardProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );
  const [localProjects, setLocalProjects] =
    useState<DashboardProject[]>(projects);

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

  const getTypeColor = (type: string | null) => {
    if (!type) return "bg-indigo-100 text-indigo-700";

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewDetails = (projectId: string) => {
    router.push(`/project_detail/${projectId}`);
  };

  const openDeleteDialog = (project: DashboardProject) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    setDeletingProjectId(projectToDelete.id);

    // Show loading toast
    const toastId = toast.loading(
      `Deleting project "${projectToDelete.name}"...`
    );

    try {
      await axios.delete("/api/project/delete_project", {
        data: { projectId: projectToDelete.id },
        timeout: 30000,
      });

      // Update local state immediately to remove the project card
      setLocalProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectToDelete.id)
      );

      // Update toast to success
      toast.success(
        `"${projectToDelete.name}" has been successfully deleted.`,
        {
          id: toastId,
          duration: 4000,
        }
      );

      // Call the parent callback to refresh the complete project list
      if (onProjectDelete) {
        onProjectDelete();
      }

      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error: unknown) {
      console.error("Delete project error:", error);

      let errorMessage = "Failed to delete project. Please try again.";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.error || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        id: toastId,
        duration: 6000,
      });
    } finally {
      setIsDeleting(false);
      setDeletingProjectId(null);
    }
  };

  // Individual project card loading state
  const isProjectDeleting = (projectId: string) =>
    deletingProjectId === projectId;

  // Filter projects based on search and filters
  const filteredProjects = localProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    const matchesType =
      typeFilter === "all" || (project.type && project.type === typeFilter);

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Project
            </AlertDialogTitle>
            <div className="text-base text-muted-foreground">
              {`Are you sure you want to delete the project "${projectToDelete?.name}"? This action cannot be undone and will permanently delete:`}
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>All project milestones and tasks</li>
                <li>Client reviews and feedback</li>
                <li>Project files and attachments</li>
                <li>Activity history and timeline</li>
              </ul>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={isDeleting}
              className="mt-2 mr-8 sm:mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 px-6"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Deleting Project...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Project</span>
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                <SelectItem value="Web Development">Web Development</SelectItem>
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
            className={`shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group relative overflow-hidden ${
              isProjectDeleting(project.id)
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
            onClick={() =>
              !isProjectDeleting(project.id) && handleViewDetails(project.id)
            }
          >
            {/* Loading overlay for individual project */}
            {isProjectDeleting(project.id) && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm font-medium text-gray-600">
                    Deleting project...
                  </p>
                </div>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getTypeColor(project.type)}>
                      {project.type || "Unknown"}
                    </Badge>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-600 truncate">
                    Client: {project.client_name}
                  </CardDescription>
                </div>
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={(e) => e.stopPropagation()}
                        disabled={isProjectDeleting(project.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewDetails(project.id)}
                        disabled={isProjectDeleting(project.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => openDeleteDialog(project)}
                        disabled={isProjectDeleting(project.id)}
                      >
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
                      ${project.project_price?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3" />
                    <span className="font-semibold">
                      {project.project_duration_days || 0} days
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-sm font-medium">
                      {project.average_rating && project.average_rating > 0
                        ? project.average_rating.toFixed(1)
                        : "No rating"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 text-slate-700 px-2 py-1 rounded-full">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-sm font-medium">
                      {project.total_reviews} reviews
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                  <Calendar className="h-3 w-3" />
                  <span>Created {formatDate(project.created_at)}</span>
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
              <Link href="/dashboard/create-projects">
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
