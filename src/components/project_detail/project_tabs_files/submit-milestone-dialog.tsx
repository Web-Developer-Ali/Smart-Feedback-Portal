"use client";

import { useState, useCallback } from "react";
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
  FileText,
  X,
  AlertCircle,
} from "lucide-react";
import type { Milestone } from "@/types/api-projectDetails";
import {
  submitMilestoneSchema,
} from "./validation-schemas";
import z from "zod";

interface SubmitMilestoneDialogProps {
  milestone: Milestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_FILE_TYPES = [
     'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain'
];

export default function SubmitMilestoneDialog({
  milestone,
  open,
  onOpenChange,
  isSubmitting,
}: SubmitMilestoneDialogProps) {
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ notes?: string; files?: string }>({});
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File ${file.name} exceeds 20MB limit` };
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: `File type not supported: ${file.name}` };
    }

    return { valid: true };
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
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
    }

    if (newErrors.length > 0) {
      setErrors((prev) => ({ ...prev, files: newErrors.join(", ") }));
    } else {
      setErrors((prev) => ({ ...prev, files: undefined }));
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    event.target.value = ""; // Reset input to allow selecting same files again
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (errors.files) {
      setErrors((prev) => ({ ...prev, files: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      // Convert File objects to validation schema format
      const filesForValidation = selectedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      submitMilestoneSchema.parse({
        notes: submissionNotes,
        files: filesForValidation,
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
  };

  const handleSubmit = async () => {
    if (!validateForm() || !milestone) return;

    try {
      // Pass the actual File objects to the onSubmit handler

      handleClose();
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmissionNotes("");
      setSelectedFiles([]);
      setErrors({});
      setIsDragging(false);
    }, 300);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Milestone: {milestone?.name}
          </DialogTitle>
          <DialogDescription>
            Add your submission notes and upload deliverables for client review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-1">
              Submission Notes <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Describe what you've completed, include any important notes for the client, and summarize the deliverables..."
              value={submissionNotes}
              onChange={(e) => {
                setSubmissionNotes(e.target.value);
                if (errors.notes)
                  setErrors((prev) => ({ ...prev, notes: undefined }));
              }}
              rows={4}
              className="resize-none"
              aria-invalid={!!errors.notes}
            />
            {errors.notes && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.notes}
              </p>
            )}
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <Label>Upload Deliverables (Optional)</Label>

            {/* File Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                isDragging
                  ? "border-blue-400 bg-blue-50 scale-105"
                  : errors.files
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
              }`}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload
                className={`h-12 w-12 mx-auto mb-3 ${
                  isDragging
                    ? "text-blue-500"
                    : errors.files
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              />

              <div className="space-y-1">
                <p
                  className={`text-sm font-medium ${
                    isDragging
                      ? "text-blue-700"
                      : errors.files
                      ? "text-red-700"
                      : "text-gray-700"
                  }`}
                >
                  {isDragging ? "Drop files here" : "Drag and drop files here"}
                </p>
                <p className="text-xs text-gray-500">
                  or click to browse your files
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Max file size: 30MB • Supported formats: JPG, PNG, GIF, WebP,
                  PDF, DOC, DOCX, XLS, XLSX, ZIP, TXT
                </p>
              </div>

              <input
                id="file-input"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png,.gif,.txt"
              />
            </div>

            {errors.files && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.files}
              </p>
            )}

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                <Label className="flex items-center gap-2">
                  Selected Files
                  <span className="text-sm font-normal text-gray-500">
                    ({selectedFiles.length} file
                    {selectedFiles.length !== 1 ? "s" : ""})
                  </span>
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}-${file.lastModified}`}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg group hover:border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} •{" "}
                            {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !submissionNotes.trim()}
            className="bg-blue-600 hover:bg-blue-700 min-w-32 relative"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
                {selectedFiles.length > 0 && (
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
