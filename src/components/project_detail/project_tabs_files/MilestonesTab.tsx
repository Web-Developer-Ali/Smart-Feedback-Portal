import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Clock, 
  Calendar, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Upload, 
  Target, 
  CheckCircle, 
  MessageSquare, 
  RefreshCw 
} from "lucide-react";
import type { Milestone } from "@/types/api-projectDetails";
import { startMilestone, useStatusColor } from "./supportive_functions";
import { JSX } from "react";

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
console.log(milestones)
  const getStatusIcon = (status: string) => {
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
      {milestones.map((milestone, index) => (
        <MilestoneCard
          key={`milestone-${milestone.id}-${index}`}
          milestone={milestone}
          index={index}
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

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestone: Milestone) => void;
  onSubmitMilestone: (milestone: Milestone) => void;
  onRefreshProject?: () => void;
}

function MilestoneCard({
  milestone,
  index,
  getStatusColor,
  getStatusIcon,
  onEditMilestone,
  onDeleteMilestone,
  onSubmitMilestone,
  onRefreshProject,
}: MilestoneCardProps) {
  return (
    <Card className="shadow-lg border-0 bg-white overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 border-2 border-blue-200 text-blue-700 font-bold">
              {index + 1}
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">
                {milestone.name}
              </CardTitle>
              <CardDescription className="mt-1 text-gray-600">
                {milestone.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={`${getStatusColor(milestone.status)} flex items-center gap-1 px-3 py-1`}
            >
              {getStatusIcon(milestone.status)}
              {milestone.status.replace("_", " ")}
            </Badge>

            <div className="flex items-center gap-2">
              {milestone.status === "pending" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-50 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditMilestone(milestone);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-50 hover:text-red-600 text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMilestone(milestone);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <MilestoneStats milestone={milestone} />
        <RevisionInfo milestone={milestone} />
        <DeliverablesSection milestone={milestone} />
        <SubmissionNotes milestone={milestone} />
        <ActionButtons 
          milestone={milestone}
          onSubmitMilestone={onSubmitMilestone}
          onRefreshProject={onRefreshProject}
        />
      </CardContent>
    </Card>
  );
}

function MilestoneStats({ milestone }: { milestone: Milestone }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">Price</span>
        </div>
        <div className="text-xl font-bold text-green-800">
          ${milestone.milestone_price.toLocaleString()}
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Duration</span>
        </div>
        <div className="text-xl font-bold text-blue-800">
          {milestone.duration_days} days
        </div>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Due Date</span>
        </div>
        <div className="text-xl font-bold text-purple-800">
          {milestone.due_date}
        </div>
      </div>
    </div>
  );
}

function RevisionInfo({ milestone }: { milestone: Milestone }) {
  return (
    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <h4 className="font-semibold mb-2 text-amber-800 flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Revision Policy
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-amber-700">Free Revisions:</span>
          <div className="text-amber-800 font-bold">{milestone.free_revisions}</div>
        </div>
        <div>
          <span className="font-medium text-amber-700">Used Revisions:</span>
          <div className="text-amber-800 font-bold">{milestone.used_revisions}</div>
        </div>
        <div>
          <span className="font-medium text-amber-700">Rate After Limit:</span>
          <div className="text-amber-800 font-bold">${milestone.revision_rate}</div>
        </div>
      </div>
    </div>
  );
}

function DeliverablesSection({ milestone }: { milestone: Milestone }) {
  if (!milestone.deliverables || milestone.deliverables.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
        <FileText className="h-5 w-5 text-blue-600" />
        Deliverables ({milestone.deliverables.length})
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {milestone.deliverables.map((deliverable) => (
          <div
            key={deliverable.id}
            className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900 block">
                  {deliverable.name}
                </span>
                <span className="text-xs text-gray-500">
                  Uploaded {deliverable.uploaded_at}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="hover:bg-blue-100">
              <Download className="h-4 w-4 text-blue-600" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmissionNotes({ milestone }: { milestone: Milestone }) {
  if (!milestone.submission_notes) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <h4 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Submission Notes
      </h4>
      <p className="text-sm text-blue-700 leading-relaxed">
        {milestone.submission_notes}
      </p>
    </div>
  );
}

function ActionButtons({ 
  milestone, 
  onSubmitMilestone, 
  onRefreshProject 
}: { 
  milestone: Milestone;
  onSubmitMilestone: (milestone: Milestone) => void;
  onRefreshProject?: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {milestone.status === "in_progress" && (
        <Button
          className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all duration-200 hover:scale-105"
          onClick={() => onSubmitMilestone(milestone)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Submit Milestone
        </Button>
      )}

      {milestone.status === "pending" && (
        <Button
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
          onClick={() => startMilestone(milestone.id, onRefreshProject)}
        >
          <Target className="h-4 w-4 mr-2" />
          Start Milestone
        </Button>
      )}

      {milestone.status === "submitted" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Awaiting Client Review
          </span>
        </div>
      )}

      {milestone.status === "approved" && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Approved on {milestone.approved_at}
          </span>
        </div>
      )}
    </div>
  );
}