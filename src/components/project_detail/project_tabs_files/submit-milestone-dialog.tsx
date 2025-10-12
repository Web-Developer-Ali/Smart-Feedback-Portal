"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Send,
  RefreshCw,
  AlertCircle,
  AlertOctagon,
} from "lucide-react";
import { uploadFilesToS3WithRetry } from "@/lib/utils/uploadFilesToS3";
import z from "zod";
import {
  ACCEPTED_FILE_TYPES,
  FileUploadProgress,
  getValidationSchema,
  MAX_FILE_SIZE,
  SubmitMilestoneDialogProps,
  UploadProgress,
} from "@/types/submit-milestone_types";
import FileUploadSection from "./submit-milestone_files/FileUploadSection";

export default function SubmitMilestoneDialog({
  milestone,
  open,
  onOpenChange,
  onSuccess,
}: SubmitMilestoneDialogProps) {
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileProgress, setFileProgress] = useState<
    Map<string, FileUploadProgress>
  >(new Map());
  const [overallProgress, setOverallProgress] = useState<UploadProgress | null>(
    null
  );
  const [errors, setErrors] = useState<{ notes?: string; files?: string }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    successful: number;
    failed: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `File ${file.name} exceeds 20MB limit` };
      }
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        return { valid: false, error: `File type not supported: ${file.name}` };
      }
      return { valid: true };
    },
    []
  );

  // File handling
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const newFiles = Array.from(files);
      const validFiles: File[] = [];
      const newErrors: string[] = [];

      newFiles.forEach((file) => {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else if (validation.error) {
          newErrors.push(validation.error);
        }
      });

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);

        setFileProgress((prev) => {
          const newMap = new Map(prev);
          validFiles.forEach((file) => {
            newMap.set(file.name, { file, status: "pending" });
          });
          return newMap;
        });
      }

      if (newErrors.length > 0) {
        setErrors((prev) => ({ ...prev, files: newErrors.join(", ") }));
      } else if (errors.files) {
        setErrors((prev) => ({ ...prev, files: undefined }));
      }
    },
    [validateFile, errors.files]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files?.length) {
        handleFiles(files);
      }
      event.target.value = "";
    },
    [handleFiles]
  );

  const handleFileDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const files = event.dataTransfer.files;
      if (files?.length) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
    },
    []
  );

  const removeFile = useCallback(
    (index: number) => {
      setSelectedFiles((prev) => {
        const newFiles = prev.filter((_, i) => i !== index);
        const fileToRemove = prev[index];

        setFileProgress((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.delete(fileToRemove.name);
          return newMap;
        });

        return newFiles;
      });

      if (errors.files) {
        setErrors((prev) => ({ ...prev, files: undefined }));
      }
    },
    [errors.files]
  );

  // Form validation and submission
  const validateForm = useCallback((): boolean => {
    try {
      const filesForValidation = selectedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      const validationSchema = getValidationSchema();
      validationSchema.parse({
        notes: submissionNotes,
        files: filesForValidation.length > 0 ? filesForValidation : undefined,
      });

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { notes?: string; files?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "notes") {
            newErrors.notes = err.message;
          } else if (err.path[0] === "files") {
            newErrors.files = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [selectedFiles, submissionNotes]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmissionNotes("");
      setSelectedFiles([]);
      setFileProgress(new Map());
      setOverallProgress(null);
      setErrors({});
      setIsDragging(false);
      setUploading(false);
      setUploadResult(null);
    }, 300);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !milestone) return;

    try {
      setUploading(true);
      setUploadResult(null);
      setErrors({});

      if (selectedFiles.length > 0) {
        setOverallProgress({
          total: selectedFiles.length,
          completed: 0,
          status: "preparing",
          failedFiles: [],
        });
      }

      let result;

      if (selectedFiles.length > 0) {
        result = await uploadFilesToS3WithRetry(
          milestone.id,
          selectedFiles,
          submissionNotes,
          3,
          (progress) => {
            setOverallProgress(progress);

            if (progress.status === "completed") {
              setFileProgress(() => {
                const newMap = new Map();
                selectedFiles.forEach((file) => {
                  newMap.set(file.name, { file, status: "completed" });
                });
                return newMap;
              });
            }
          }
        );
      } else {
        const response = await fetch(
          "/api/file_handling/update_file_uploaded",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              milestoneId: milestone.id,
              files: [],
              submissionNotes: submissionNotes,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to submit milestone");
        }

        result = {
          success: true,
          successful: 0,
          failed: 0,
          error: null,
        };
      }

      setUploadResult({
        success: result.success,
        successful: result.successful,
        failed: result.failed,
      });

      if (result.success) {
        onSuccess?.();
        setTimeout(() => handleClose(), 2000);
      } else {
        setErrors((prev) => ({
          ...prev,
          files: `Submission failed: ${result.error}`,
        }));
      }
    } catch (error) {
      console.error("Submission failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Submission failed";
      setErrors((prev) => ({
        ...prev,
        files: errorMessage,
      }));
    } finally {
      setUploading(false);
    }
  }, [
    milestone,
    selectedFiles,
    submissionNotes,
    validateForm,
    onSuccess,
    handleClose,
  ]);

  // Memoized computed values
  const hasFiles = useMemo(
    () => selectedFiles.length > 0,
    [selectedFiles.length]
  );
  const isSubmitDisabled = useMemo(
    () => uploading || !submissionNotes.trim(),
    [uploading, submissionNotes]
  );

  const submitButtonText = useMemo(() => {
    if (uploading) {
      return hasFiles ? "Uploading..." : "Submitting...";
    }
    return "Submit Milestone";
  }, [uploading, hasFiles]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Milestone: {milestone?.name}
          </DialogTitle>
          <DialogDescription>
            Add your submission notes and upload deliverables for client review.
          </DialogDescription>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
            <div className="flex items-start gap-2">
              <AlertOctagon className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">Important Notice</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>
                    You can only submit this milestone <strong>once</strong>
                  </li>
                  <li>
                    Make sure to include <strong>all deliverables</strong> in
                    this submission
                  </li>
                  <li>
                    Files are <strong>optional</strong> - you can submit with
                    notes only
                  </li>
                  <li>
                    Unsupported file types? Include download links in your notes
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Submission Notes */}
          <div className="space-y-2">
            <Label
              htmlFor="submission-notes"
              className="flex items-center gap-2"
            >
              Submission Notes
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="submission-notes"
              placeholder="Describe what you're submitting for this milestone. Include any important details or links to external files..."
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              className="min-h-[120px] resize-vertical"
            />
            {errors.notes && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.notes}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Required. Describe your work, progress, and any important
              information for the client.
            </p>
          </div>

          {/* File Upload Section */}
          <FileUploadSection
            selectedFiles={selectedFiles}
            fileProgress={fileProgress}
            overallProgress={overallProgress}
            errors={errors}
            isDragging={isDragging}
            uploading={uploading}
            uploadResult={uploadResult}
            onFileSelect={handleFileSelect}
            onFileDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onRemoveFile={removeFile}
            fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
          />
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0 pt-4 border-t mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="bg-blue-600 hover:bg-blue-700 min-w-32 relative flex-1 sm:flex-none"
          >
            {uploading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {submitButtonText}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {submitButtonText}
                {hasFiles && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {selectedFiles.length}
                  </span>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
