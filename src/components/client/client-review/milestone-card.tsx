"use client";

import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign,
  Timer,
  Calendar,
  MessageSquare,
  User,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Milestone } from "@/types/client-review";

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  onMilestoneAction: (
    milestoneId: string,
    action: "approve" | "reject",
    revisionNotes?: string
  ) => Promise<void>;
  projectId: string;
}

const getStatusBadge = (status: Milestone["status"]) => {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          Rejected
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Pending
        </Badge>
      );
    case "Not Started":
      return (
        <Badge className="bg-gray-200 text-gray-800 border-gray-300">
          Not Started
        </Badge>
      );
    case "submitted":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          Submitted
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-100 text-slate-800 border-slate-200">
          Unknown
        </Badge>
      );
  }
};

export const MilestoneCard = memo(function MilestoneCard({
  milestone,
  index,
  onMilestoneAction,
  projectId,
}: MilestoneCardProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");

  const handleApprove = useCallback(() => {
    onMilestoneAction(milestone.id, "approve");
  }, [milestone.id, onMilestoneAction]);

  const handleRejectSubmit = useCallback(async () => {
    if (!revisionNotes.trim()) return;
    await onMilestoneAction(milestone.id, "reject", revisionNotes);
    setRevisionNotes("");
    setIsRejectDialogOpen(false);
  }, [milestone.id, revisionNotes, onMilestoneAction]);

  const handleGiveFeedback = useCallback(() => {
    window.location.href = `/client/feedback/${projectId}?milestoneId=${milestone.id}`;
  }, [projectId, milestone.id]);

  const handleFileClick = useCallback((url: string, event: React.MouseEvent) => {
    event.preventDefault();
    if (url && !url.startsWith('#file-not-available')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  // check revision policy
  const hasFreeRevisionsLeft =
    milestone.usedRevisions < milestone.freeRevisions;

  return (
    <>
      <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 border-2 border-blue-200 text-blue-700 font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg lg:text-xl text-gray-900">
                  {milestone.title}
                </CardTitle>
                <CardDescription className="mt-1 text-gray-600">
                  {milestone.description}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(milestone.status)}
          </div>

          {/* Price, Duration, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-600 mb-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">Price</span>
              </div>
              <p className="text-xl font-bold text-green-700">
                ${milestone.price}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <Timer className="h-5 w-5" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <p className="text-xl font-bold text-blue-700">
                {milestone.duration}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-600 mb-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">Due Date</span>
              </div>
              <p className="text-xl font-bold text-purple-700">
                {milestone.dueDate}
              </p>
            </div>
          </div>

          {/* Revision Policy */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 text-orange-600 mb-3">
              <RefreshCw className="h-5 w-5" />
              <span className="font-medium">Revision Policy</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-orange-600 font-medium">Free Revisions:</p>
                <p className="text-orange-800 font-bold text-xl">
                  {milestone.freeRevisions}
                </p>
              </div>
              <div>
                <p className="text-orange-600 font-medium">Used Revisions:</p>
                <p className="text-orange-800 font-bold text-xl">
                  {milestone.usedRevisions}
                </p>
              </div>
              <div>
                <p className="text-orange-600 font-medium">Rate After Limit:</p>
                <p className="text-orange-800 font-bold text-xl">
                  ${milestone.revisionRate}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Deliverables */}
            {(milestone.status === "submitted" ||
              milestone.status === "approved") && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">
                  Deliverables:
                </h4>
                {milestone.deliverables && milestone.deliverables.length > 0 ? (
                  <ul className="space-y-2">
                    {milestone.deliverables.map((deliverable, index) => {
                      const isClickable = deliverable.url && !deliverable.url.startsWith('#file-not-available');
                      return (
                        <li
                          key={index}
                          className="text-sm flex items-center space-x-2 group"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {isClickable ? (
                            <a
                              href={deliverable.url}
                              onClick={(e) => handleFileClick(deliverable.url, e)}
                              className="text-blue-600 hover:text-blue-800 underline cursor-pointer flex items-center space-x-1 group-hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText className="h-3 w-3" />
                              <span>{deliverable.name}</span>
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ) : (
                            <span className="text-gray-700 flex items-center space-x-1">
                              <FileText className="h-3 w-3" />
                              <span>{deliverable.name}</span>
                            </span>
                          )}
                          {deliverable.notes && (
                            <span className="text-gray-500 text-xs">- {deliverable.notes}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No deliverables available.
                  </p>
                )}
              </div>
            )}

            {milestone.submittedDate && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Submitted: {milestone.submittedDate}</span>
              </div>
            )}

            {/* Approve/Reject when submitted */}
            {milestone.status === "submitted" && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => setIsRejectDialogOpen(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
              </div>
            )}

            {/* Feedback after approval */}
            {milestone.status === "approved" && (
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={handleGiveFeedback}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Give Feedback for this Milestone
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              {hasFreeRevisionsLeft
                ? "Please provide notes to let the freelancer know why this milestone is being rejected."
                : `⚠️ You have used all free revisions. Rejecting this milestone will cost you $${milestone.revisionRate}.`}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Write your rejection notes here..."
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!revisionNotes.trim()}
            >
              {hasFreeRevisionsLeft
                ? "Submit Rejection"
                : `Reject (Cost $${milestone.revisionRate})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});