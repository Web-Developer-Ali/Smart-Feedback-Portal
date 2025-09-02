"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Save, X } from "lucide-react"
import axios from "axios"
import type { Milestone } from "@/types/api-projectDetails"

interface EditMilestoneDialogProps {
  milestone: Milestone | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (milestoneId: string, updatedData: Partial<Milestone>) => void
  projectId: string
}

interface MilestoneFormData {
  title: string
  description: string
  milestone_price: number
  duration_days: number
  free_revisions: number
  revision_rate: number
}

async function updateMilestone(milestoneId: string, projectId: string, data: Partial<MilestoneFormData>) {
  try {
    const response = await axios.put(
      `/api/project/update_milestone`,
      {
        id: milestoneId,
        project_id: projectId,
        ...data,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || "Failed to update milestone"
      throw new Error(errorMessage)
    }
    throw new Error("Failed to update milestone")
  }
}

export default function EditMilestoneDialog({
  milestone,
  open,
  onOpenChange,
  onSuccess,
  projectId,
}: EditMilestoneDialogProps) {
  const [formData, setFormData] = useState<MilestoneFormData>({
    title: "",
    description: "",
    milestone_price: 0,
    duration_days: 0,
    free_revisions: 0,
    revision_rate: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof MilestoneFormData, string>>>({})

  useEffect(() => {
    if (milestone && open) {
      setFormData({
        title: milestone.name || "",
        description: milestone.description || "",
        milestone_price: milestone.milestone_price || 0,
        duration_days: milestone.duration_days || 0,
        free_revisions: milestone.free_revisions || 0,
        revision_rate: milestone.revision_rate || 0,
      })
      setErrors({})
    }
  }, [milestone, open])

  useEffect(() => {
    if (!open) {
      setIsLoading(false)
      setErrors({})
    }
  }, [open])

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof MilestoneFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Milestone title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (formData.milestone_price <= 0) {
      newErrors.milestone_price = "Price must be greater than 0"
    }

    if (formData.duration_days <= 0) {
      newErrors.duration_days = "Duration must be greater than 0"
    }

    if (formData.free_revisions < 0) {
      newErrors.free_revisions = "Free revisions cannot be negative"
    }

    if (formData.revision_rate < 0) {
      newErrors.revision_rate = "Revision rate cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleInputChange = useCallback(
    (field: keyof MilestoneFormData, value: string | number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }))
      }
    },
    [errors],
  )

  const handleSave = useCallback(async () => {
    if (!milestone || !validateForm()) {
      toast.error("Please fix the errors before saving")
      return
    }

    setIsLoading(true)
    try {
      const result = await updateMilestone(milestone.id, projectId, formData)

      // Call the parent's onSuccess with the updated data
      if (onSuccess) {
        onSuccess(milestone.id, {
          name: formData.title, // Convert back to 'name' for the parent component
          description: formData.description,
          milestone_price: formData.milestone_price,
          duration_days: formData.duration_days,
          free_revisions: formData.free_revisions,
          revision_rate: formData.revision_rate,
        })
      }

      toast.success("Milestone updated successfully!")
      onOpenChange(false)
    } catch (error) {
      let errorMessage = "Failed to update milestone"

      if (error instanceof Error) {
        errorMessage = error.message

        // Handle specific API error cases
        if (error.message.includes("exceed project budget")) {
          errorMessage = "The milestone price would exceed the project budget. Please reduce the price."
        } else if (error.message.includes("exceed project timeline")) {
          errorMessage = "The milestone duration would exceed the project timeline. Please reduce the duration."
        } else if (error.message.includes("Validation failed")) {
          errorMessage = "Please check your input values and try again."
        }
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [milestone, formData, validateForm, onSuccess, onOpenChange, projectId])

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  if (!milestone) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">Edit Milestone</DialogTitle>
          <DialogDescription>Update the milestone details below. All fields are required.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Milestone Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter milestone title"
              className={errors.title ? "border-red-500 focus:border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what will be delivered in this milestone"
              rows={3}
              className={errors.description ? "border-red-500 focus:border-red-500" : ""}
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Price and Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Price ($) *
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.milestone_price}
                onChange={(e) => handleInputChange("milestone_price", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.milestone_price ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.milestone_price && <p className="text-sm text-red-600">{errors.milestone_price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">
                Duration (Days) *
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration_days}
                onChange={(e) => handleInputChange("duration_days", Number.parseInt(e.target.value) || 0)}
                placeholder="7"
                className={errors.duration_days ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.duration_days && <p className="text-sm text-red-600">{errors.duration_days}</p>}
            </div>
          </div>

          {/* Revision Settings */}
          <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800">Revision Settings</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="free-revisions" className="text-sm font-medium">
                  Free Revisions *
                </Label>
                <Input
                  id="free-revisions"
                  type="number"
                  min="0"
                  value={formData.free_revisions}
                  onChange={(e) => handleInputChange("free_revisions", Number.parseInt(e.target.value) || 0)}
                  placeholder="3"
                  className={errors.free_revisions ? "border-red-500 focus:border-red-500" : ""}
                />
                {errors.free_revisions && <p className="text-sm text-red-600">{errors.free_revisions}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="revision-rate" className="text-sm font-medium">
                  Rate After Limit ($) *
                </Label>
                <Input
                  id="revision-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.revision_rate}
                  onChange={(e) => handleInputChange("revision_rate", Number.parseFloat(e.target.value) || 0)}
                  placeholder="50.00"
                  className={errors.revision_rate ? "border-red-500 focus:border-red-500" : ""}
                />
                {errors.revision_rate && <p className="text-sm text-red-600">{errors.revision_rate}</p>}
              </div>
            </div>

            <p className="text-sm text-amber-700">
              Clients will be charged the revision rate for each revision beyond the free limit.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto bg-transparent"
            type="button"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            type="button"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
