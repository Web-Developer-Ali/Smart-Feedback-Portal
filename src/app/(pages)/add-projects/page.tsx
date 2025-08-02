"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Briefcase, DollarSign, Calendar, FileText } from "lucide-react"
import { toast } from "sonner"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface ProjectFormData {
  name: string
  type: string
  description: string
  project_budget: number | null
  estimated_days: number | null
  client_name: string
  client_email: string
  milestones: Milestone[]
}

interface Milestone {
  name: string
  duration_days: number
  milestone_price: number
  description: string
}

const PROJECT_TYPES = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Branding",
  "Digital Marketing",
  "E-commerce",
  "Custom Software",
  "Other",
]

export default function CreateProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    type: "",
    description: "",
    project_budget: null,
    estimated_days: null,
    client_name: "",
    client_email: "",
    milestones: [
      {
        name: "",
        duration_days: 0,
        milestone_price: 0,
        description: "",
      },
    ],
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: any) => {
    const updatedMilestones = [...formData.milestones]
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    }
    setFormData((prev) => ({
      ...prev,
      milestones: updatedMilestones,
    }))
  }

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          name: "",
          duration_days: 0,
          milestone_price: 0,
          description: "",
        },
      ],
    }))
  }

  const removeMilestone = (index: number) => {
    if (formData.milestones.length > 1) {
      setFormData((prev) => ({
        ...prev,
        milestones: prev.milestones.filter((_, i) => i !== index),
      }))
    }
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.type && formData.description
      case 2:
        return formData.project_budget && formData.estimated_days
      case 3:
        return formData.client_name && formData.client_email
      case 4:
        return formData.milestones.every((m) => m.name && m.duration_days > 0 && m.milestone_price > 0)
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    } else {
      toast.error("Please fill in all required fields")
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error("Please complete all fields")
      return
    }

    setLoading(true)
    try {
      // Simulate API call - replace with actual Supabase insert
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate review token and link
      const reviewToken = Math.random().toString(36).substring(2, 15)
      const reviewLink = `${window.location.origin}/review/${reviewToken}`

      const projectData = {
        ...formData,
        review_token: reviewToken,
        review_link: reviewLink,
        status: "pending",
      }

      console.log("Creating project:", projectData)

      toast.success("Project created successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating project:", error)
      toast.error("Failed to create project. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Mock user data for sidebar
  const mockUser = {
    id: "1",
    email: "user@example.com",
    full_name: "John Doe",
    avatar_url: null,
    role: "agency" as const,
    company_name: "Design Agency",
    created_at: new Date().toISOString(),
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Project Details</h2>
              <p className="text-gray-600">Let's start with the basic information about your project</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter project name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type">Project Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your project in detail"
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Budget & Timeline</h2>
              <p className="text-gray-600">Set your project budget and estimated timeline</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="budget">Project Budget ($) *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.project_budget || ""}
                  onChange={(e) => handleInputChange("project_budget", Number.parseFloat(e.target.value) || null)}
                  placeholder="Enter total budget"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="days">Estimated Days *</Label>
                <Input
                  id="days"
                  type="number"
                  value={formData.estimated_days || ""}
                  onChange={(e) => handleInputChange("estimated_days", Number.parseInt(e.target.value) || null)}
                  placeholder="Enter estimated days to complete"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Client Information</h2>
              <p className="text-gray-600">Add your client's contact information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange("client_name", e.target.value)}
                  placeholder="Enter client name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="client_email">Client Email *</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => handleInputChange("client_email", e.target.value)}
                  placeholder="Enter client email"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Project Milestones</h2>
              <p className="text-gray-600">Break down your project into manageable milestones</p>
            </div>

            <div className="space-y-6">
              {formData.milestones.map((milestone, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Milestone {index + 1}</h3>
                    {formData.milestones.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => removeMilestone(index)}>
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Milestone Name *</Label>
                      <Input
                        value={milestone.name}
                        onChange={(e) => handleMilestoneChange(index, "name", e.target.value)}
                        placeholder="Enter milestone name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Duration (Days) *</Label>
                      <Input
                        type="number"
                        value={milestone.duration_days || ""}
                        onChange={(e) =>
                          handleMilestoneChange(index, "duration_days", Number.parseInt(e.target.value) || 0)
                        }
                        placeholder="Days to complete"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        value={milestone.milestone_price || ""}
                        onChange={(e) =>
                          handleMilestoneChange(index, "milestone_price", Number.parseFloat(e.target.value) || 0)
                        }
                        placeholder="Milestone price"
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(index, "description", e.target.value)}
                        placeholder="Describe this milestone"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </Card>
              ))}

              <Button variant="outline" onClick={addMilestone} className="w-full bg-transparent">
                Add Another Milestone
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <SidebarProvider>
      <DashboardSidebar user={mockUser} onSignOut={() => router.push("/login")} />
      <SidebarInset>
        {/* Fixed Header with Sidebar Trigger */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard/projects">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Project</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto p-6 max-w-4xl">
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <div className="text-sm text-gray-600">
                  Step {currentStep} of {totalSteps}
                </div>
              </div>

              <Progress value={progress} className="h-2" />
            </div>

            {/* Main Content */}
            <Card className="w-full">
              <CardContent className="p-8">{renderStepContent()}</CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="flex items-center gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2">
                  {loading ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Create Project
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
