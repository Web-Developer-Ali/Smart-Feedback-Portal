"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, MessageSquare, Briefcase } from "lucide-react";
import type { Project, Milestone, Review } from "@/types/api-projectDetails";
import EditMilestoneDialog from "./project_tabs_files/edit-milestone-dialog";
import DeleteMilestoneDialog from "./project_tabs_files/delete-milestone-dialog";
import SubmitMilestoneDialog from "./project_tabs_files/submit-milestone-dialog";
import MilestonesTab from "./project_tabs_files/MilestonesTab";
import ReviewsTab from "./project_tabs_files/ReviewsTab";
import OverviewTab from "./project_tabs_files/OverviewTab";

interface ProjectTabsProps {
  project: Project;
  milestones: Milestone[];
  reviews: Review[];
  projectStats: {
    completed: number;
    total: number;
    progress: number;
  };
  onRefreshProject?: () => void;
}

export default function ProjectTabs({
  project,
  milestones = [],
  reviews = [],
  projectStats,
  onRefreshProject,
}: ProjectTabsProps) {
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(null);
  const [submittingMilestone, setSubmittingMilestone] = useState<Milestone | null>(null);

  const handleCloseEditDialog = useCallback((open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setEditingMilestone(null);
      }, 100);
    }
  }, []);

  const handleCloseDeleteDialog = useCallback((open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setDeletingMilestone(null);
      }, 100);
    }
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    onRefreshProject?.();
    setDeletingMilestone(null);
  }, [onRefreshProject]);

  const handleCloseSubmitDialog = useCallback((open: boolean) => {
    if (!open) {
      setSubmittingMilestone(null);
    }
  }, []);

  return (
    <>
      <Tabs defaultValue="milestones" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-white border border-gray-200 shadow-sm">
          <TabsTrigger
            value="milestones"
            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Milestones</span>
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Reviews</span>
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="milestones">
          <MilestonesTab
            milestones={milestones}
            onEditMilestone={setEditingMilestone}
            onDeleteMilestone={setDeletingMilestone}
            onSubmitMilestone={setSubmittingMilestone}
            onRefreshProject={onRefreshProject}
          />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTab reviews={reviews} />
        </TabsContent>

        <TabsContent value="overview">
          <OverviewTab project={project} projectStats={projectStats} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SubmitMilestoneDialog
        milestone={submittingMilestone}
        open={!!submittingMilestone}
        onOpenChange={handleCloseSubmitDialog}
        onSuccess={onRefreshProject}
      />

      {editingMilestone && (
        <EditMilestoneDialog
          milestone={editingMilestone}
          open={!!editingMilestone}
          onOpenChange={handleCloseEditDialog}
          onSuccess={onRefreshProject}
          projectId={project.id}
        />
      )}

      {deletingMilestone && (
        <DeleteMilestoneDialog
          milestoneId={deletingMilestone.id}
          totalMilestones={milestones.length}
          milestoneName={deletingMilestone.name}
          projectId={project.id}
          open={!!deletingMilestone}
          onOpenChange={handleCloseDeleteDialog}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}