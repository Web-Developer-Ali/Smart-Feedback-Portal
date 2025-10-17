import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, Download, Trash2, RefreshCw } from "lucide-react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// ✅ Define a type for deliverable instead of using `any`
interface Deliverable {
  id: string;
  name: string;
  uploaded_at: string;
  file_count: number;
  public_ids: string[];
  file_names?: string[];
}

interface DeliverableItemProps {
  deliverable: Deliverable;
  milestoneId: string;
  onRefreshProject?: () => void;
}

export default function DeliverableItem({
  deliverable,
  milestoneId,
  onRefreshProject,
}: DeliverableItemProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    files: Array<{ publicId: string; fileName: string }>;
  }>({
    open: false,
    files: [],
  });

  // ✅ Specify proper error type for axios
  const handleDownload = async (publicId: string, fileName: string) => {
    try {
      setDownloading(publicId);
      const response = await axios.post("/api/file_handling/get_presignUrl", {
        filename: fileName,
        type: "application/octet-stream",
        size: 0,
        mode: "read",
        key: publicId,
      });

      const { data } = response.data;
      if (!data?.url) throw new Error("Failed to get download URL");
      window.open(data.url, "_blank");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error?: string }>;
      console.error("Download error:", axiosError);
      toast.error(
        axiosError.response?.data?.error || "Failed to download file"
      );
    } finally {
      setDownloading(null);
    }
  };

  const openDeleteDialog = () => {
    const validFiles = generateFileList().filter((file) => file.isDeletable);
    setDeleteDialog({
      open: true,
      files: validFiles,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      files: [],
    });
  };

  // ✅ Handle error type properly
  const handleDeleteAllFiles = async () => {
    try {
      setDeleting(true);
      const response = await axios.post(
        "/api/file_handling/delete_milestone_files",
        {
          milestoneId,
          deliverableId: deliverable.id,
          deleteAll: true,
          deliverableName: deliverable.name,
        }
      );

      if (response.data.success) {
        toast.success(
          `All files from “${deliverable.name}” deleted successfully`
        );
        onRefreshProject?.();
      } else {
        throw new Error(response.data.error || "Failed to delete files");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error?: string }>;
      console.error("Delete error:", axiosError);
      toast.error(
        axiosError.response?.data?.error ||
          axiosError.message ||
          "Failed to delete files"
      );
    } finally {
      setDeleting(false);
      closeDeleteDialog();
    }
  };

  const generateFileList = () => {
    if (!deliverable.public_ids || deliverable.public_ids.length === 0)
      return [];

    return deliverable.public_ids.map((publicId, index) => {
      const fileName =
        deliverable.file_names?.[index] ||
        publicId.split("/").pop() ||
        `file_${index + 1}`;
      const isDeletable =
        fileName !== "File Not Submitted" &&
        fileName.trim().length > 0 &&
        publicId.trim().length > 0;

      return { publicId, fileName, isDeletable };
    });
  };

  const fileList = generateFileList();

  return (
    <>
      <div className="flex flex-col p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-900 block truncate">
                {deliverable.name}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>
                  Uploaded{" "}
                  {new Date(deliverable.uploaded_at).toLocaleDateString()}
                </span>
                {deliverable.file_count > 1 && (
                  <Badge variant="outline" className="text-xs">
                    {deliverable.file_count} files
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-red-100 flex-shrink-0 h-8 w-8 p-0 ml-2"
            onClick={openDeleteDialog}
            disabled={deleting}
            title={`Delete all files from ${deliverable.name}`}
          >
            {deleting ? (
              <span className="text-red-600 text-xs animate-pulse">...</span>
            ) : (
              <Trash2 className="h-4 w-4 text-red-600" />
            )}
          </Button>
        </div>

        <div className="space-y-2">
          {fileList.map(
            (
              { publicId, fileName }: { publicId: string; fileName: string },
              index: number
            ) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-2 rounded-lg border"
              >
                <span className="text-xs text-gray-600 truncate flex-1 mr-2">
                  {fileName}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-100 flex-shrink-0 h-7 w-7 p-0"
                    onClick={() => handleDownload(publicId, fileName)}
                    disabled={downloading === publicId}
                    title="Download file"
                  >
                    {downloading === publicId ? (
                      <span className="text-blue-600 text-xs animate-pulse">
                        ...
                      </span>
                    ) : (
                      <Download className="h-3 w-3 text-blue-600" />
                    )}
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete All Files
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="sr-only">
                Confirmation to delete all files from {deliverable.name}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-2">
            <p className="text-base text-gray-700 mb-3">
              {/* ✅ Escape quotes using &quot; */}
              Are you sure you want to delete all files from{" "}
              <strong>&quot;{deliverable.name}&quot;</strong>?
            </p>

            <div className="text-sm text-amber-600 mb-3">
              This will permanently delete {deleteDialog.files.length} file(s):
            </div>

            <ul className="text-sm text-gray-700 mt-2 mb-4 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {deleteDialog.files.map((file, index) => (
                <li key={index} className="truncate py-1">
                  • {file.fileName}
                </li>
              ))}
            </ul>

            <div className="text-sm text-red-600 font-medium">
              This action cannot be undone!
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllFiles}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Files
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
