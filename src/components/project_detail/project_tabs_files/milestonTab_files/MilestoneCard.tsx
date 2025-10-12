import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Clock, 
  Calendar, 
  FileText, 
  Upload, 
  Target, 
  CheckCircle, 
  MessageSquare, 
  RefreshCw,
  Edit,
  Trash2
} from "lucide-react";
import type { Milestone } from "@/types/api-projectDetails";
import { JSX } from "react";
import { startMilestone } from "../supportive_functions";
import DeliverableItem from "./DeliverableItem";


interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  displayOrder: number;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestone: Milestone) => void;
  onSubmitMilestone: (milestone: Milestone) => void;
  onRefreshProject?: () => void;
}

export default function MilestoneCard({
  milestone,
  displayOrder,
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
              {displayOrder}
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
        <DeliverablesSection milestone={milestone} onRefreshProject={onRefreshProject} />
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

// Sub-components for MilestoneCard
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

function DeliverablesSection({ milestone, onRefreshProject }: { milestone: Milestone; onRefreshProject?: () => void }) {
  if (!milestone.deliverables || milestone.deliverables.length === 0) {
    return (
      <div className="mb-6 p-6 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h4 className="font-semibold text-gray-700 mb-1">No Deliverables Yet</h4>
        <p className="text-sm text-gray-500">
          Files will appear here once they are submitted for this milestone.
        </p>
      </div>
    );
  }

  const totalFiles = milestone.deliverables.reduce(
    (total, deliverable) => total + (deliverable.file_count || 1), 
    0
  );

  return (
    <div className="mb-6">
      <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
        <FileText className="h-5 w-5 text-blue-600" />
        Deliverables ({milestone.deliverables.length} items, {totalFiles} files)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {milestone.deliverables.map((deliverable) => (
          <DeliverableItem
            key={deliverable.id} 
            deliverable={deliverable}
            milestoneId={milestone.id}
            onRefreshProject={onRefreshProject}
          />
        ))}
      </div>
    </div>
  );
}

function SubmissionNotes({ milestone }: { milestone: Milestone }) {
  const deliverablesWithNotes = milestone.deliverables?.filter(
    deliverable => deliverable.submission_notes?.trim()
  ) || [];

  if (deliverablesWithNotes.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <h4 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Submission Notes ({deliverablesWithNotes.length})
      </h4>
      <div className="space-y-3">
        {deliverablesWithNotes.map((deliverable, index) => (
          <div key={deliverable.id} className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-blue-900 text-sm truncate">
                  {deliverable.name}
                </div>
                {deliverablesWithNotes.length > 1 && (
                  <div className="text-xs text-blue-600">Note {index + 1}</div>
                )}
              </div>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed pl-6">
              {deliverable.submission_notes}
            </p>
          </div>
        ))}
      </div>
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