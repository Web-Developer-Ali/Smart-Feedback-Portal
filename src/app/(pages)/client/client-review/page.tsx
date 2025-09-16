"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Star,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  User,
  Calendar,
  DollarSign,
  Timer,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Milestone {
  id: string
  title: string
  description: string
  status: "pending" | "approved" | "rejected" | "in_progress"
  deliverables: string[]
  dueDate: string
  submittedDate?: string
  price: number
  duration: string
  freeRevisions: number
  usedRevisions: number
  revisionRate: number
}

interface Project {
  id: string
  title: string
  freelancerName: string
  freelancerAvatar: string
  totalAmount: number
  milestones: Milestone[]
}

export default function ClientReviewPage() {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [review, setReview] = useState("")
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)

  const project: Project = {
    id: "1",
    title: "E-commerce Website Development",
    freelancerName: "Sarah Johnson",
    freelancerAvatar: "/professional-woman-developer.png",
    totalAmount: 2500,
    milestones: [
      {
        id: "1",
        title: "Homepage Design & Development",
        description: "Complete homepage with responsive design, hero section, and product showcase",
        status: "approved",
        deliverables: ["Homepage HTML/CSS", "Responsive design", "Product showcase section"],
        dueDate: "2024-01-15",
        submittedDate: "2024-01-14",
        price: 800,
        duration: "10 days",
        freeRevisions: 2,
        usedRevisions: 1,
        revisionRate: 25,
      },
      {
        id: "2",
        title: "Product Catalog & Search",
        description: "Product listing pages with search functionality and filtering options",
        status: "pending",
        deliverables: ["Product listing page", "Search functionality", "Filter system", "Product detail pages"],
        dueDate: "2024-01-25",
        submittedDate: "2024-01-24",
        price: 1200,
        duration: "15 days",
        freeRevisions: 1,
        usedRevisions: 0,
        revisionRate: 30,
      },
      {
        id: "3",
        title: "Shopping Cart & Checkout",
        description: "Complete shopping cart system with secure checkout process",
        status: "in_progress",
        deliverables: ["Shopping cart functionality", "Checkout process", "Payment integration", "Order confirmation"],
        dueDate: "2024-02-05",
        price: 500,
        duration: "8 days",
        freeRevisions: 1,
        usedRevisions: 0,
        revisionRate: 20,
      },
    ],
  }

  const handleMilestoneAction = (milestoneId: string, action: "approve" | "reject") => {
    console.log(`${action} milestone ${milestoneId}`)
    // Here you would typically make an API call to update the milestone status
  }

  const handleSubmitReview = () => {
    if (selectedMilestone && review && rating > 0) {
      console.log("Submitting review:", { milestoneId: selectedMilestone, review, rating })
      // Here you would typically make an API call to submit the review
      setReview("")
      setRating(0)
      setSelectedMilestone(null)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">FP</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FreelancePortal</h1>
                <p className="text-gray-600 text-sm">Project Review Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <img
                src={project.freelancerAvatar || "/placeholder.svg"}
                alt={project.freelancerName}
                className="w-10 h-10 rounded-full border-2 border-gray-200"
              />
              <div className="text-right">
                <p className="text-gray-900 font-medium">{project.freelancerName}</p>
                <p className="text-gray-600 text-sm">Freelancer</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {/* Project Overview */}
        <div className="mb-8">
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl lg:text-3xl text-gray-900">{project.title}</CardTitle>
                  <CardDescription className="text-gray-600 mt-2 text-base">
                    Review and approve project milestones
                  </CardDescription>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    ${project.totalAmount}
                  </p>
                  <p className="text-sm text-gray-600">Total Project Value</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Milestones */}
        <div className="grid gap-8 xl:grid-cols-3 lg:grid-cols-2">
          <div className="xl:col-span-2 space-y-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Project Milestones</h2>
            {project.milestones.map((milestone) => (
              <Card
                key={milestone.id}
                className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-lg">{milestone.id}</span>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg lg:text-xl text-gray-900">{milestone.title}</CardTitle>
                        <CardDescription className="mt-1 text-gray-600">{milestone.description}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(milestone.status)}
                  </div>

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
                        <Button
                          onClick={() => handleMilestoneAction(milestone.id, "approve")}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleMilestoneAction(milestone.id, "reject")}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Request Changes
                        </Button>
                        <Button
                          onClick={() => setSelectedMilestone(milestone.id)}
                          variant="outline"
                          className="flex-1 border-gray-300"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Review Section */}
          <div className="space-y-6 xl:sticky xl:top-8 xl:h-fit">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Leave a Review</h2>
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <MessageSquare className="h-5 w-5" />
                  <span>Milestone Review</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {selectedMilestone
                    ? `Reviewing: ${project.milestones.find((m) => m.id === selectedMilestone)?.title}`
                    : "Select a milestone to review"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedMilestone && (
                  <>
                    {/* Star Rating */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Rating</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                          >
                            <Star
                              className={cn(
                                "h-8 w-8 transition-colors",
                                hoveredStar >= star || rating >= star
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 hover:text-gray-400",
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Your Review</label>
                      <Textarea
                        placeholder="Share your thoughts about this milestone delivery..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        rows={4}
                        className="resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmitReview}
                      disabled={!review || rating === 0}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Submit Review
                    </Button>
                  </>
                )}

                {!selectedMilestone && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a milestone above to leave a review</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <p className="text-gray-600">
                    Having issues with a milestone? Contact support or communicate directly with your freelancer.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                    >
                      Contact Support
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                    >
                      Message Freelancer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
