"use client"

import { memo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, Clock, DollarSign, Timer, Calendar, MessageSquare, User } from "lucide-react"
import { Milestone } from "@/types/client-review"

interface MilestoneCardProps {
  milestone: Milestone
  onMilestoneAction: (milestoneId: string, action: "approve" | "reject") => Promise<void>
  projectId: string
}

const getStatusIcon = (status: Milestone["status"]) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case "rejected":
      return <XCircle className="h-5 w-5 text-red-600" />
    case "in_progress":
      return <RefreshCw className="h-5 w-5 text-orange-600" />
    default:
      return <Clock className="h-5 w-5 text-blue-600" />
  }
}

const getStatusBadge = (status: Milestone["status"]) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
    case "rejected":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
    case "in_progress":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">In Progress</Badge>
    default:
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Pending Review</Badge>
  }
}

export const MilestoneCard = memo(function MilestoneCard({
  milestone,
  onMilestoneAction,
  projectId,
}: MilestoneCardProps) {
  const handleApprove = useCallback(() => {
    onMilestoneAction(milestone.id, "approve")
  }, [milestone.id, onMilestoneAction])

  const handleReject = useCallback(() => {
    onMilestoneAction(milestone.id, "reject")
  }, [milestone.id, onMilestoneAction])

  const handleGiveFeedback = useCallback(() => {
    window.location.href = `/client/feedback/${projectId}?milestoneId=${milestone.id}`
  }, [projectId, milestone.id])

  return (
    <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-bold text-lg">{milestone.id.slice(-1)}</span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg lg:text-xl text-gray-900">{milestone.title}</CardTitle>
              <CardDescription className="mt-1 text-gray-600">{milestone.description}</CardDescription>
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
            <p className="text-xl font-bold text-green-700">${milestone.price}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-600 mb-2">
              <Timer className="h-5 w-5" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-xl font-bold text-blue-700">{milestone.duration}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-purple-600 mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Due Date</span>
            </div>
            <p className="text-xl font-bold text-purple-700">{milestone.dueDate}</p>
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
              <p className="text-orange-800 font-bold text-xl">{milestone.freeRevisions}</p>
            </div>
            <div>
              <p className="text-orange-600 font-medium">Used Revisions:</p>
              <p className="text-orange-800 font-bold text-xl">{milestone.usedRevisions}</p>
            </div>
            <div>
              <p className="text-orange-600 font-medium">Rate After Limit:</p>
              <p className="text-orange-800 font-bold text-xl">${milestone.revisionRate}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-2">Deliverables:</h4>
            <ul className="space-y-2">
              {milestone.deliverables.map((deliverable, index) => (
                <li key={index} className="text-sm flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{deliverable}</span>
                </li>
              ))}
            </ul>
          </div>

          {milestone.submittedDate && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Submitted: {milestone.submittedDate}</span>
            </div>
          )}

          {milestone.status === "pending" && milestone.submittedDate && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <Button onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button onClick={handleReject} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <XCircle className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
            </div>
          )}

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
  )
})
