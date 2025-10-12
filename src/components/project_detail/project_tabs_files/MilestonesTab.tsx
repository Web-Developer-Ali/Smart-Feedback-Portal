import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Target, Upload } from "lucide-react";
import type { Milestone } from "@/types/api-projectDetails";
import { useStatusColor } from "./supportive_functions";
import { JSX, useMemo } from "react";
import MilestoneCard from "./milestonTab_files/MilestoneCard";

interface MilestonesTabProps {
  milestones: Milestone[];
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestone: Milestone) => void;
  onSubmitMilestone: (milestone: Milestone) => void;
  onRefreshProject?: () => void;
}

export default function MilestonesTab({
  milestones,
  onEditMilestone,
  onDeleteMilestone,
  onSubmitMilestone,
  onRefreshProject,
}: MilestonesTabProps) {
  const getStatusColor = useStatusColor();
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => {
      const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER;
      const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER;
      return priorityA - priorityB;
    });
  }, [milestones]);

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "submitted":
        return <Upload className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Target className="h-4 w-4" />;
      case "not_started":
        return <Target className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  if (milestones.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white overflow-hidden">
        <CardContent className="p-12 text-center">
          <Target className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Milestones Yet
          </h3>
          <p className="text-gray-600">
            Milestones will appear here once they are added to the project.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {sortedMilestones.map((milestone, index) => (
        <MilestoneCard
          key={`milestone-${milestone.id}-${milestone.priority}`}
          milestone={milestone}
          index={index}
          displayOrder={milestone.priority ?? index + 1}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          onEditMilestone={onEditMilestone}
          onDeleteMilestone={onDeleteMilestone}
          onSubmitMilestone={onSubmitMilestone}
          onRefreshProject={onRefreshProject}
        />
      ))}
    </div>
  );
}