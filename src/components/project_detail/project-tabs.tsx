"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Calendar,
  DollarSign,
  Clock,
  Star,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  Eye,
  Download,
  MoreHorizontal,
  Send,
  Edit,
  Target,
  TrendingUp,
  Award,
  Briefcase,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import type { Project, Milestone, Review } from "@/types/api-projectDetails"

interface ProjectTabsProps {
  project: Project
  milestones: Milestone[]
  reviews: Review[]
  projectStats: {
    completed: number
    total: number
    progress: number
  }
  onMilestoneUpdate: (milestoneId: string, status: Milestone["status"], notes?: string) => void
}

export default function ProjectTabs({
  project,
  milestones,
  reviews,
  projectStats,
  onMilestoneUpdate,
}: ProjectTabsProps) {
  const [submissionNotes, setSubmissionNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in_progress":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }, [])

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "submitted":
        return <Upload className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "rejected":
        return <AlertCircle className="h-4 w-4" />
      case "pending":
        return <Target className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }, [])

  const handleSubmitMilestone = useCallback(
    async (milestoneId: string) => {
      if (!submissionNotes.trim()) {
        toast.error("Please add submission notes")
        return
      }

      setIsSubmitting(true)
      try {
        await onMilestoneUpdate(milestoneId, "submitted", submissionNotes)
        setSubmissionNotes("")
        toast.success("Milestone submitted successfully!")
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to submit milestone"
        toast.error(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
    },
    [submissionNotes, onMilestoneUpdate],
  )

  const handleStartMilestone = useCallback(
    (milestoneId: string) => {
      onMilestoneUpdate(milestoneId, "in_progress")
      toast.success("Milestone started!")
    },
    [onMilestoneUpdate],
  )

  return (
    <Tabs defaultValue="milestones" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-white border border-gray-200 shadow-sm">
        <TabsTrigger
          value="milestones"
          className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
        >
          <Target className="h-4 w-4" />
          <span className="hidden sm:inline">Milestones</span>
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Reviews</span>
        </TabsTrigger>
        <TabsTrigger
          value="overview"
          className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
        >
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
      </TabsList>

      {/* Enhanced Milestones Tab */}
      <TabsContent value="milestones" className="space-y-6">
        <div className="grid gap-6">
          {milestones.length > 0 ? (
            milestones.map((milestone, index) => (
              <Card
                key={milestone.id}
                className="shadow-lg border-0 bg-white overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 border-2 border-blue-200 text-blue-700 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">{milestone.name}</CardTitle>
                        <CardDescription className="mt-1 text-gray-600">{milestone.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(milestone.status)} flex items-center gap-1 px-3 py-1`}>
                        {getStatusIcon(milestone.status)}
                        {milestone.status.replace("_", " ")}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Milestone
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
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
                      <div className="text-xl font-bold text-blue-800">{milestone.duration_days} days</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Due Date</span>
                      </div>
                      <div className="text-xl font-bold text-purple-800">{milestone.due_date}</div>
                    </div>
                  </div>

                  {/* Revision Information */}
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

                  {/* Enhanced Deliverables */}
                  {milestone.deliverables.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Deliverables ({milestone.deliverables.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {milestone.deliverables.map((deliverable) => (
                          <div
                            key={deliverable.id}
                            className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-900 block">{deliverable.name}</span>
                                <span className="text-xs text-gray-500">Uploaded {deliverable.uploaded_at}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                              <Download className="h-4 w-4 text-blue-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Submission Notes */}
                  {milestone.submission_notes && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <h4 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Submission Notes
                      </h4>
                      <p className="text-sm text-blue-700 leading-relaxed">{milestone.submission_notes}</p>
                    </div>
                  )}

                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {milestone.status === "in_progress" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                            <Upload className="h-4 w-4 mr-2" />
                            Submit Milestone
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Submit Milestone: {milestone.name}</DialogTitle>
                            <DialogDescription>
                              Add your submission notes and deliverables for client review.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="notes">Submission Notes</Label>
                              <Textarea
                                id="notes"
                                placeholder="Describe what you've completed and any important notes for the client..."
                                value={submissionNotes}
                                onChange={(e) => setSubmissionNotes(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <div>
                              <Label>Upload Deliverables</Label>
                              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600 mb-2">
                                  Drag and drop files here, or click to browse
                                </p>
                                <Button variant="outline" className="bg-transparent">
                                  Choose Files
                                </Button>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => handleSubmitMilestone(milestone.id)}
                              disabled={isSubmitting || !submissionNotes.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
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
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    {milestone.status === "pending" && (
                      <Button
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                        onClick={() => handleStartMilestone(milestone.id)}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Start Milestone
                      </Button>
                    )}

                    {milestone.status === "submitted" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Awaiting Client Review</span>
                      </div>
                    )}

                    {milestone.status === "approved" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Approved on {milestone.approved_at}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="shadow-lg border-0 bg-white overflow-hidden">
              <CardContent className="p-12 text-center">
                <Target className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Milestones Yet</h3>
                <p className="text-gray-600">Milestones will appear here once they are added to the project.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      {/* Enhanced Reviews Tab */}
      <TabsContent value="reviews" className="space-y-6">
        {reviews.length === 0 ? (
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">Reviews will appear here once clients provide feedback on milestones.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="shadow-lg border-0 bg-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 bg-blue-100 border-2 border-blue-200">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                        {review.client_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{review.client_name}</h3>
                          <p className="text-sm text-gray-600">{review.created_at}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.stars ? "fill-current text-amber-500" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm font-bold ml-2 text-amber-700">{review.stars}.0</span>
                        </div>
                      </div>
                      <blockquote className="text-gray-700 leading-relaxed border-l-4 border-blue-400 pl-4 italic bg-gray-50 p-4 rounded-r-lg">
                        "{review.review}"
                      </blockquote>
                      {review.milestone_id && (
                        <Badge className="mt-4 bg-blue-100 text-blue-700 border-blue-200">
                          <Award className="h-3 w-3 mr-1" />
                          Milestone Review
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Enhanced Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Project Statistics
              </CardTitle>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">{projectStats.completed}</div>
                  <div className="text-sm font-medium text-blue-700">Completed</div>
                </div>
                <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-3xl font-bold text-amber-600">{projectStats.total - projectStats.completed}</div>
                  <div className="text-sm font-medium text-amber-700">Remaining</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">Overall Progress</span>
                  <span className="font-bold text-gray-900">{projectStats.progress}%</span>
                </div>
                <Progress value={projectStats.progress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5 text-green-600" />
                Project Timeline
              </CardTitle>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Project Started</span>
                  <span className="font-bold text-gray-900">{project.created_at}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Last Updated</span>
                  <span className="font-bold text-gray-900">{project.updated_at}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Estimated Duration</span>
                  <span className="font-bold text-gray-900">{project.estimated_days} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
