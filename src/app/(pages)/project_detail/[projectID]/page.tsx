"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  User,
  Mail,
  Phone,
  Building,
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
  Settings,
  Share,
  Menu,
} from "lucide-react"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  description: string
  type: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  client_name: string
  client_email: string
  client_phone: string
  client_company: string
  project_budget: number
  estimated_days: number
  created_at: string
  updated_at: string
  review_count: number
  average_rating: number
  progress: number
}

interface Milestone {
  id: string
  name: string
  description: string
  duration_days: number
  milestone_price: number
  status: "pending" | "in_progress" | "submitted" | "approved" | "rejected"
  created_at: string
  due_date: string
  submitted_at?: string
  approved_at?: string
  submission_notes?: string
  feedback?: string
  deliverables: Deliverable[]
}

interface Deliverable {
  id: string
  name: string
  type: "file" | "link" | "text"
  url?: string
  content?: string
  uploaded_at: string
}

interface Review {
  id: string
  client_name: string
  stars: number
  review: string
  created_at: string
  milestone_id?: string
}

// Mock data
const mockProject: Project = {
  id: "1",
  name: "E-commerce Website Redesign",
  description:
    "Complete redesign of the existing e-commerce platform with modern UI/UX, improved performance, and mobile responsiveness. The project includes user research, wireframing, design system creation, and full development implementation.",
  type: "Web Development",
  status: "in_progress",
  client_name: "John Smith",
  client_email: "john@techcorp.com",
  client_phone: "+1 (555) 123-4567",
  client_company: "TechCorp Inc.",
  project_budget: 15000,
  estimated_days: 45,
  created_at: "Jan 15, 2024",
  updated_at: "Jan 20, 2024",
  review_count: 3,
  average_rating: 4.7,
  progress: 65,
}

const mockMilestones: Milestone[] = [
  {
    id: "1",
    name: "Research & Planning",
    description: "User research, competitor analysis, and project planning phase",
    duration_days: 7,
    milestone_price: 2500,
    status: "approved",
    created_at: "Jan 15, 2024",
    due_date: "Jan 22, 2024",
    submitted_at: "Jan 21, 2024",
    approved_at: "Jan 22, 2024",
    submission_notes:
      "Completed comprehensive user research and competitive analysis. All deliverables are ready for review.",
    deliverables: [
      { id: "1", name: "User Research Report", type: "file", url: "#", uploaded_at: "Jan 21, 2024" },
      { id: "2", name: "Competitor Analysis", type: "file", url: "#", uploaded_at: "Jan 21, 2024" },
    ],
  },
  {
    id: "2",
    name: "Wireframing & Prototyping",
    description: "Create wireframes and interactive prototypes for all key pages",
    duration_days: 10,
    milestone_price: 3500,
    status: "submitted",
    created_at: "Jan 22, 2024",
    due_date: "Feb 1, 2024",
    submitted_at: "Jan 31, 2024",
    submission_notes: "All wireframes and prototypes completed. Interactive prototype is available for testing.",
    deliverables: [
      { id: "3", name: "Wireframes", type: "file", url: "#", uploaded_at: "Jan 31, 2024" },
      {
        id: "4",
        name: "Interactive Prototype",
        type: "link",
        url: "https://figma.com/proto/...",
        uploaded_at: "Jan 31, 2024",
      },
    ],
  },
  {
    id: "3",
    name: "UI Design",
    description: "Complete visual design for all pages including design system",
    duration_days: 12,
    milestone_price: 4000,
    status: "in_progress",
    created_at: "Feb 1, 2024",
    due_date: "Feb 13, 2024",
    deliverables: [],
  },
  {
    id: "4",
    name: "Frontend Development",
    description: "Implement the designs with responsive frontend development",
    duration_days: 16,
    milestone_price: 5000,
    status: "pending",
    created_at: "Feb 13, 2024",
    due_date: "Mar 1, 2024",
    deliverables: [],
  },
]

const mockReviews: Review[] = [
  {
    id: "1",
    client_name: "John Smith",
    stars: 5,
    review: "Excellent research phase! The team provided comprehensive insights that will guide our project perfectly.",
    created_at: "Jan 22, 2024",
    milestone_id: "1",
  },
  {
    id: "2",
    client_name: "John Smith",
    stars: 4,
    review: "Great wireframes and prototypes. Very professional work and good communication throughout.",
    created_at: "Feb 1, 2024",
    milestone_id: "2",
  },
]

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project] = useState<Project>(mockProject)
  const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones)
  const [reviews] = useState<Review[]>(mockReviews)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [submissionNotes, setSubmissionNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getStatusColor = (status: string) => {
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
  }

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

  const getStatusIcon = (status: string) => {
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
  }

  const handleSubmitMilestone = async (milestoneId: string) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId
            ? {
                ...m,
                status: "submitted" as const,
                submitted_at: new Date().toLocaleDateString(),
                submission_notes: submissionNotes,
              }
            : m,
        ),
      )

      setSubmissionNotes("")
      setSelectedMilestone(null)
      toast.success("Milestone submitted successfully!")
    } catch (error) {
      toast.error("Failed to submit milestone. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const completedMilestones = milestones.filter((m) => m.status === "approved").length
  const totalMilestones = milestones.length
  const projectProgress = (completedMilestones / totalMilestones) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Responsive Header */}
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
                <p className="text-xs text-gray-500 truncate">{project.client_company}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Share className="h-4 w-4 mr-2" />
                  Share Project
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Project Settings
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
                <p className="text-sm text-gray-500">{project.client_company}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getProjectStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Mobile Status Badge */}
          <div className="md:hidden pb-3">
            <Badge className={getProjectStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6">
        {/* Enhanced Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Enhanced Project Info */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{project.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium">{project.type}</Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Started {project.created_at}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(projectProgress)}%</div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <CardDescription className="text-base leading-relaxed text-gray-700 mb-6">
                  {project.description}
                </CardDescription>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Budget</span>
                    </div>
                    <div className="text-xl font-bold text-green-800">${project.project_budget.toLocaleString()}</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Duration</span>
                    </div>
                    <div className="text-xl font-bold text-blue-800">{project.estimated_days} days</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-amber-600 fill-current" />
                      <span className="text-sm font-medium text-amber-700">Rating</span>
                    </div>
                    <div className="text-xl font-bold text-amber-800">{project.average_rating}</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Reviews</span>
                    </div>
                    <div className="text-xl font-bold text-purple-800">{project.review_count}</div>
                  </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Project Progress</span>
                    <span className="text-sm font-bold text-gray-900">{Math.round(projectProgress)}%</span>
                  </div>
                  <Progress value={projectProgress} className="h-3 bg-gray-200" />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>
                      {completedMilestones} of {totalMilestones} milestones completed
                    </span>
                    <span>{totalMilestones - completedMilestones} remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Client Info */}
          <Card className="shadow-lg border-0 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5 text-blue-600" />
                Client Information
              </CardTitle>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 bg-blue-100 border-2 border-blue-200">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-lg">
                    {project.client_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-lg text-gray-900">{project.client_name}</div>
                  <div className="text-sm text-gray-600">{project.client_company}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{project.client_email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{project.client_phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{project.client_company}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{project.review_count}</div>
                    <div className="text-xs text-gray-600">Reviews</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">{project.average_rating}</div>
                    <div className="text-xs text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
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
              {milestones.map((milestone, index) => (
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
                                  <>Submitting...</>
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
                          onClick={() => {
                            setMilestones((prev) =>
                              prev.map((m) => (m.id === milestone.id ? { ...m, status: "in_progress" as const } : m)),
                            )
                            toast.success("Milestone started!")
                          }}
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
                          <span className="text-sm font-medium text-green-800">
                            Approved on {milestone.approved_at}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Enhanced Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
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
                      <div className="text-3xl font-bold text-blue-600">{completedMilestones}</div>
                      <div className="text-sm font-medium text-blue-700">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="text-3xl font-bold text-amber-600">{totalMilestones - completedMilestones}</div>
                      <div className="text-sm font-medium text-amber-700">Remaining</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">Overall Progress</span>
                      <span className="font-bold text-gray-900">{Math.round(projectProgress)}%</span>
                    </div>
                    <Progress value={projectProgress} className="h-3" />
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
      </div>
    </div>
  )
}
