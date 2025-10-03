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
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { Milestone } from "@/types/api-projectDetails";
import { submitMilestoneSchema } from "./validation-schemas";
import { uploadFilesToS3WithRetry, type UploadProgress } from "@/lib/utils/uploadFilesToS3"; // Adjust import path as needed
import z from "zod";

interface SubmitMilestoneDialogProps {
  milestone: Milestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FileUploadProgress {
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf", "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", 
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip", "text/plain",
];

export default function SubmitMilestoneDialog({
  milestone,
  open,
  onOpenChange,
  onSuccess
}: SubmitMilestoneDialogProps) {
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileProgress, setFileProgress] = useState<Map<string, FileUploadProgress>>(new Map());
  const [overallProgress, setOverallProgress] = useState<UploadProgress | null>(null);
  const [errors, setErrors] = useState<{ notes?: string; files?: string }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{success: boolean; successful: number; failed: number} | null>(null);

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
        setFileProgress(prev => new Map(prev.set(file.name, {
          file,
          status: 'pending'
        })));
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
    event.target.value = "";
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
    const fileToRemove = selectedFiles[index];
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFileProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileToRemove.name);
      return newMap;
    });
    if (errors.files) {
      setErrors((prev) => ({ ...prev, files: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
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
      setUploading(true);
      setUploadResult(null);
      setOverallProgress({ total: selectedFiles.length, completed: 0, status: 'preparing', failedFiles: []});

      // Use the imported upload function
      const result = await uploadFilesToS3WithRetry(
        milestone.id,
        selectedFiles,
        submissionNotes,
        3, // maxRetries
        (progress) => {
          setOverallProgress(progress);

          // Update individual file status based on overall progress
          if (progress.status === 'completed') {
            setFileProgress(prev => {
              const newMap = new Map();
              selectedFiles.forEach(file => {
                newMap.set(file.name, { file, status: 'completed' });
              });
              return newMap;
            });
          }
        }
      );
      setUploadResult({
        success: result.success,
        successful: result.successful,
        failed: result.failed
      });

      if (result.success) {
        onSuccess?.();
        // TODO: Submit milestone with notes if needed
        setTimeout(() => handleClose(), 2000);
      } else {
        setErrors(prev => ({ 
          ...prev, 
          files: `Upload failed: ${result.error}` 
        }));
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setErrors((prev) => ({ 
        ...prev, 
        files: error instanceof Error ? error.message : "Upload failed" 
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
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
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: FileUploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'uploading':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOverallStatusText = () => {
    if (!overallProgress) return null;
    
    switch (overallProgress.status) {
      case 'preparing':
        return 'Preparing files...';
      case 'recording':
        return `Recording files... (${overallProgress.completed}/${overallProgress.total})`;
      case 'completed':
        return 'Upload completed!';
      case 'error':
        return 'Upload failed';
      default:
        return null;
    }
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
            <Label htmlFor="submission-notes">Submission Notes</Label>
            <Textarea
              id="submission-notes"
              placeholder="Describe what you're submitting for this milestone..."
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              className="min-h-[100px] resize-vertical"
            />
            {errors.notes && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.notes}
              </p>
            )}
          </div>

          {/* File Upload Area */}
          <div className="space-y-3">
            <Label>Attach Files</Label>
            
            {/* Drag & Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept={ACCEPTED_FILE_TYPES.join(",")}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Drag and drop files here, or click to select
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: 20MB • Supported formats: Images, PDF, Word, Excel, ZIP, Text
              </p>
            </div>

            {/* Overall Progress */}
            {overallProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{getOverallStatusText()}</span>
                  <span>{overallProgress.completed}/{overallProgress.total} files</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(overallProgress.completed / overallProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Result */}
            {uploadResult && (
              <div className={`p-3 rounded-lg ${
                uploadResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  uploadResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {uploadResult.success 
                    ? `✅ Successfully uploaded ${uploadResult.successful} file(s)`
                    : `❌ Upload failed: ${uploadResult.successful} successful, ${uploadResult.failed} failed`
                  }
                </p>
              </div>
            )}

            {/* Error Message */}
            {errors.files && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.files}
              </p>
            )}

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Selected Files:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedFiles.map((file, index) => {
                    const progress = fileProgress.get(file.name);
                    
                    return (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getStatusIcon(progress?.status || 'pending')}
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          {!uploading && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading || !submissionNotes.trim() || selectedFiles.length === 0}
            className="bg-blue-600 hover:bg-blue-700 min-w-32 relative"
          >
            {uploading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
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