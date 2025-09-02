"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, RefreshCw, Share, Copy, Mail, Check, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Project } from "@/types/api-projectDetails"

interface ProjectHeaderProps {
  project: Project
  onRetry: () => void
  isRetrying: boolean
}

export default function ProjectHeader({ project, onRetry, isRetrying }: ProjectHeaderProps) {
  const router = useRouter()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://yoursite.com")
  const feedbackToken = project.jwt_token || `fallback-${project.id}`
  const feedbackLink = `${siteUrl}/feedback/${feedbackToken}&id:${project.id}`

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(feedbackLink)
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea")
        textArea.value = feedbackLink
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }

      setCopied(true)
      toast.success("Feedback link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
      toast.error("Failed to copy link")
    }
  }

  const handleSendEmail = async () => {
    setSendingEmail(true)
    try {
      if (!project.client_email || project.client_email === "N/A") {
        throw new Error("Client email is not available")
      }

      const response = await fetch("/api/project/send-feedback-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
          clientEmail: project.client_email,
          clientName: project.client_name,
          projectName: project.name,
          feedbackLink: feedbackLink,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to send email")
      }

      toast.success(`Feedback link sent to ${project.client_email}`)
      setShareDialogOpen(false)
    } catch (error) {
      console.error("Error sending email:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to send email. Please try again."
      toast.error(errorMessage)
    } finally {
      setSendingEmail(false)
    }
  }

  const handleDeleteProject = async () => {
    setIsDeleting(true)
    try {
      // Show immediate feedback that deletion has started
      toast.loading(`Deleting project "${project.name}"...`, {
        id: 'delete-project',
      })

      const response = await fetch("/api/project/delete_project", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete project")
      }

      // Dismiss loading toast and show success
      toast.dismiss('delete-project')
      toast.success(`Project "${project.name}" deleted successfully!`)
      
      // Redirect to projects list
      router.replace("/dashboard/projects")
    } catch (error) {
      console.error("Error deleting project:", error)
      // Dismiss loading toast and show error
      toast.dismiss('delete-project')
      const errorMessage = error instanceof Error ? error.message : "Failed to delete project. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <div className="min-w-full bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between py-3 md:hidden">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/projects")}
              className="hover:bg-gray-100 flex-shrink-0 h-9 w-9"
              disabled={isDeleting} // Disable during deletion
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold text-gray-900 truncate">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500 truncate">{project.client_name}</p>
                <span className="text-gray-300">•</span>
                <Badge className={`${getProjectStatusColor(project.status)} text-xs`}>
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRetry}
              disabled={isRetrying || isDeleting}
              className="h-9 w-9"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShareDialogOpen(true)}
              className="h-9 w-9"
              title="Share Project"
              disabled={isDeleting} // Disable during deletion
            >
              <Share className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 hover:bg-red-50 hover:text-red-600" 
              title="Delete Project"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting} // Disable during deletion
            >
              {isDeleting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/dashboard/projects")} 
              className="hover:bg-gray-100"
              disabled={isDeleting} // Disable during deletion
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-500">{project.client_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getProjectStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
            <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying || isDeleting}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isDeleting}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Share Project Feedback</DialogTitle>
                  <DialogDescription>
                    Share this feedback link with your client to collect reviews and feedback.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="feedback-link">Feedback Link</Label>
                    <div className="flex gap-2 mt-2">
                      <Input id="feedback-link" value={feedbackLink} readOnly className="flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 bg-transparent whitespace-nowrap"
                        disabled={isDeleting}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {project.client_email && project.client_email !== "N/A" && (
                    <div className="border-t pt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-blue-50 rounded-lg">
                        <div className="min-w-0">
                          <h4 className="font-medium text-blue-900">Send to Client</h4>
                          <p className="text-sm text-blue-700 truncate">{project.client_email}</p>
                        </div>
                        <Button
                          onClick={handleSendEmail}
                          disabled={sendingEmail || isDeleting}
                          className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                        >
                          {sendingEmail ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShareDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Delete Project Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Share Dialog for Mobile */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="max-w-[95vw] rounded-lg sm:max-w-[500px]">
            <DialogHeader className="px-1">
              <DialogTitle className="text-lg">Share Project Feedback</DialogTitle>
              <DialogDescription className="text-sm">
                Share this feedback link with your client to collect reviews and feedback.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 px-1">
              <div>
                <Label htmlFor="feedback-link-mobile" className="text-sm">
                  Feedback Link
                </Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input id="feedback-link-mobile" value={feedbackLink} readOnly className="flex-1 text-sm min-w-0" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 bg-transparent whitespace-nowrap"
                    disabled={isDeleting}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {project.client_email && project.client_email !== "N/A" && (
                <div className="border-t pt-4">
                  <div className="flex flex-col gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="min-w-0">
                      <h4 className="font-medium text-blue-900 text-sm">Send to Client</h4>
                      <p className="text-xs text-blue-700 truncate">{project.client_email}</p>
                    </div>
                    <Button
                      onClick={handleSendEmail}
                      disabled={sendingEmail || isDeleting}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                      size="sm"
                    >
                      {sendingEmail ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="px-1">
              <Button
                variant="outline"
                onClick={() => setShareDialogOpen(false)}
                className="w-full sm:w-auto"
                size="sm"
                disabled={isDeleting}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="max-w-[95vw] sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete Project
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the project "{project.name}"? This action cannot be undone and will
                permanently delete all project data, including milestones, reviews, and client feedback.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}