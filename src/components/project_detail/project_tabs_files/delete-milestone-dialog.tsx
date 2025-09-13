"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface DeleteMilestoneDialogProps {
  milestoneId: string;
  milestoneName: string;
  projectId: string;
  totalMilestones: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function DeleteMilestoneDialog({
  milestoneId,
  milestoneName,
  projectId,
  totalMilestones,
  open,
  onOpenChange,
  onSuccess,
}: DeleteMilestoneDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isLastMilestone = totalMilestones <= 1;
  const handleDelete = async () => {
    if (isLastMilestone) {
      toast.error(
        "Cannot delete the last milestone. A project must contain at least one milestone."
      );
      return;
    }

    setIsDeleting(true);

    try {
      const response = await axios.delete(
        `/api/project/delete_milestone?milestoneId=${milestoneId}&projectId=${projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Milestone deleted successfully!");
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error deleting milestone:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to delete milestone";
        toast.error(errorMessage);
      } else {
        toast.error(
          "An unexpected error occurred while deleting the milestone"
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Milestone
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isLastMilestone
              ? "This is the last milestone in your project. Projects must contain at least one milestone."
              : "This action cannot be undone. This will permanently delete the milestone and all associated data."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLastMilestone ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Cannot Delete Last Milestone
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Every project must have at least one milestone. Add another
                    milestone before deleting this one.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Milestone to delete:</strong> {milestoneName}
              </p>
              <p className="text-xs text-red-600 mt-2">
                All deliverables, submission notes, and progress will be
                permanently lost.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
            className="border-gray-300 bg-transparent"
          >
            {isLastMilestone ? "Close" : "Cancel"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || isLastMilestone}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Milestone
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
