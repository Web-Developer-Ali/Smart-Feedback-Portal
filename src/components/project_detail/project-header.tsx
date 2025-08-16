"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Menu, RefreshCw, Share, Edit, Copy, Mail, Check } from "lucide-react"
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
  const [copied, setCopied] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  // Generate the feedback link using the actual review token from project data
  const feedbackLink = `${window.location.origin}/feedback/${project.review_token || "default-token"}/${project.id}`

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
      await navigator.clipboard.writeText(feedbackLink)
      setCopied(true)
      toast.success("Feedback link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleSendEmail = async () => {
    setSendingEmail(true)
    try {
      // You can implement this API endpoint to send email
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
        throw new Error("Failed to send email")
      }

      toast.success(`Feedback link sent to ${project.client_email}`)
      setShareDialogOpen(false)
    } catch (error) {
      toast.error("Failed to send email. Please try again.")
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="min-w-full bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 md:hidden">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/projects")}
              className="hover:bg-gray-100 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h1>
              <p className="text-xs text-gray-500 truncate">{project.client_name}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                <Share className="h-4 w-4 mr-2" />
                Share Project
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/projects")} className="hover:bg-gray-100">
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
            <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
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
                        className="flex items-center gap-2 bg-transparent"
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

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-blue-900">Send to Client</h4>
                        <p className="text-sm text-blue-700">{project.client_email}</p>
                      </div>
                      <Button
                        onClick={handleSendEmail}
                        disabled={sendingEmail}
                        className="bg-blue-600 hover:bg-blue-700"
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Mobile Status Badge */}
        <div className="md:hidden pb-3">
          <Badge className={getProjectStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
        </div>
      </div>

      {/* Share Dialog for Mobile (same as desktop but triggered from dropdown) */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Project Feedback</DialogTitle>
            <DialogDescription>
              Share this feedback link with your client to collect reviews and feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback-link-mobile">Feedback Link</Label>
              <div className="flex gap-2 mt-2">
                <Input id="feedback-link-mobile" value={feedbackLink} readOnly className="flex-1 text-sm" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 bg-transparent"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-blue-900">Send to Client</h4>
                  <p className="text-sm text-blue-700 truncate">{project.client_email}</p>
                </div>
                <Button
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
