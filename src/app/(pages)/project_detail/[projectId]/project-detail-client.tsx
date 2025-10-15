"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import ProjectDetailSkeleton from "@/components/project_detail/project-detail-skeleton";
import ProjectDetailError from "@/components/project_detail/project-detail-error";
import ProjectHeader from "@/components/project_detail/project-header";
import ProjectOverview from "@/components/project_detail/project-overview";
import ProjectTabs from "@/components/project_detail/project-tabs";
import {
  transformApiProject,
  transformApiMilestone,
  transformApiReviews,
} from "@/lib/utils/project-transformer";
import type {
  ApiProject,
  Project,
  Milestone,
  Review,
} from "@/types/api-projectDetails";

export default function ProjectDetailClient() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const projectId = params.projectId as string;
  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!projectId) {
        throw new Error("Project ID is required");
      }
      // Use your actual API endpoint
      const response = await fetch(
        `/api/project/get_project_details?projectId=${projectId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Project not found");
        }
        if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        }
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }

      const apiProject: ApiProject = await response.json();
      if (!apiProject || !apiProject.id) {
        throw new Error("Invalid project data received");
      }
      // Transform the API data to match your UI
      const transformedProject = transformApiProject(apiProject);
      const transformedMilestones = (apiProject.milestones || []).map(
        (milestone) => transformApiMilestone(milestone)
      );
      const transformedReviews = transformApiReviews(apiProject);

      setProject(transformedProject);
      setMilestones(transformedMilestones);
      setReviews(transformedReviews);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch project data";
      setError(errorMessage);
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [projectId]);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    fetchProjectData();
  }, [fetchProjectData]);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, fetchProjectData]);

  const projectStats = useMemo(() => {
    if (!milestones.length) return { completed: 0, total: 0, progress: 0 };

    const completed = milestones.filter((m) => m.status === "approved").length;
    const total = milestones.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, progress: Math.round(progress) };
  }, [milestones]);

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <ProjectDetailError
        error={error || "Project not found"}
        onRetry={handleRetry}
        isRetrying={retrying}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader
        project={project}
        onRetry={handleRetry}
        isRetrying={retrying}
      />

      <div className="container mx-auto p-4 sm:p-6">
        <ProjectOverview project={project} projectStats={projectStats} />

        <ProjectTabs
          project={project}
          milestones={milestones}
          reviews={reviews}
          projectStats={projectStats}
          onRefreshProject={fetchProjectData}
        />
      </div>
    </div>
  );
}
