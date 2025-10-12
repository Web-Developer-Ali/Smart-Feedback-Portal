import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  AlertCircle,
} from "lucide-react";
import { ACCEPTED_FILE_TYPES, FileUploadProgress, UploadSectionProps } from "@/types/submit-milestone_types";

export default function FileUploadSection({
  selectedFiles,
  fileProgress,
  overallProgress,
  errors,
  isDragging,
  uploading,
  uploadResult,
  onFileSelect,
  onFileDrop,
  onDragOver,
  onDragLeave,
  onRemoveFile,
  fileInputRef,
}: UploadSectionProps) {
  
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const getStatusIcon = useCallback((status: FileUploadProgress['status']) => {
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
  }, []);

  const getOverallStatusText = useCallback(() => {
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
  }, [overallProgress]);

  const hasFiles = useMemo(() => selectedFiles.length > 0, [selectedFiles.length]);

  const successMessage = useMemo(() => {
    if (!uploadResult?.success) return null;
    
    if (uploadResult.successful > 0) {
      return `Successfully uploaded ${uploadResult.successful} file(s)`;
    }
    return 'Submission completed successfully';
  }, [uploadResult]);

  const fileList = useMemo(() => 
    selectedFiles.map((file , index) => {
      const progress = fileProgress.get(file.name);
      
      return (
        <div
          key={`${file.name}-${file.lastModified}-${index}`}
          className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getStatusIcon(progress?.status || 'pending')}
            <div className="min-w-0 flex-1">
              <div className="text-sm truncate">{file.name}</div>
              <div className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </div>
            </div>
          </div>
          {!uploading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile(index);
              }}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 flex-shrink-0 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }),
    [selectedFiles, fileProgress, getStatusIcon, formatFileSize, uploading, onRemoveFile]
  );

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        Attach Files
        <span className="text-xs font-normal text-gray-500">(Optional)</span>
      </Label>
      
      {/* File Type Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Supported file types:</p>
            <p className="text-xs mt-1">
              Images (JPEG, PNG, GIF, WebP), PDF, Word, Excel, ZIP, Text files
            </p>
            <p className="text-xs mt-1">
              Maximum file size: 20MB per file
            </p>
          </div>
        </div>
      </div>
      
      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={onFileDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          id="file-input"
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES.join(",")}
          onChange={onFileSelect}
          className="hidden"
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          Drag and drop files here, or click to select
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Optional • Max 20MB per file • Supported formats listed above
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
              ? `✅ ${successMessage}`
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
      {hasFiles && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Selected Files ({selectedFiles.length}):</p>
          <div className="space-y-2">
            {fileList}
          </div>
        </div>
      )}
    </div>
  );
}