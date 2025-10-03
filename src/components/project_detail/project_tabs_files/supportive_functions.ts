"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import type { Milestone } from "@/types/api-projectDetails"
import axios from "axios"

// 🎨 Status color utility
export const useStatusColor = () => {
  return useCallback((status: string) => {
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
}

// 🚀 Submit milestone with API call
export const useHandleSubmitMilestone = (
  submissionNotes: string,
  setSubmissionNotes: (v: string) => void,
  setIsSubmitting: (v: boolean) => void,
  onMilestoneUpdate?: (id: string, status: Milestone["status"], notes?: string) => Promise<void>
) => {
  return useCallback(
    async (milestoneId: string, files: File[] = []) => {
      if (!submissionNotes.trim()) {
        toast.error("Please add submission notes")
        return
      }

      setIsSubmitting(true)
      const toastId = toast.loading("Submitting milestone...")

      try {
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('milestone_id', milestoneId)
        formData.append('submission_notes', submissionNotes)
        
        // Append files if any
        files.forEach((file, index) => {
          formData.append(`files[${index}]`, file)
        })

        // Call API to submit milestone
        const response = await axios.post('/api/project/submit_milestone', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.data.success) {
          toast.success("Milestone submitted successfully!", { id: toastId })
          setSubmissionNotes("")
          
          // Update local state if callback provided
          if (onMilestoneUpdate) {
            await onMilestoneUpdate(milestoneId, "submitted", submissionNotes)
          }
          
          return response.data
        } else {
          throw new Error(response.data.error || "Failed to submit milestone")
        }
      } catch (error) {
        console.error("Error submitting milestone:", error)

        let errorMessage = "Failed to submit milestone"
        
        if (axios.isAxiosError(error)) {
          errorMessage =
            error.response?.data?.error ||
            error.response?.data?.details ||
            error.message ||
            "Failed to submit milestone"
        } else if (error instanceof Error) {
          errorMessage = error.message
        }

        toast.error(errorMessage, { id: toastId })
        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [submissionNotes, setSubmissionNotes, setIsSubmitting, onMilestoneUpdate],
  )
}

// ✅ Success after edit
export const useHandleMilestoneSuccess = (
  onRefreshProject?: () => void,
  setEditingMilestone?: (m: Milestone | null) => void
) => {
  return useCallback(() => {
    if (onRefreshProject) {
      onRefreshProject()
    }
    if (setEditingMilestone) {
      setEditingMilestone(null)
    }
  }, [onRefreshProject, setEditingMilestone])
}

export const startMilestone = async (milestoneId: string, onRefreshProject?: () => void) => {
  const toastId = toast.loading("Starting milestone...")

  try {
    const response = await axios.post('/api/project/start_milestone', {
      milestone_id: milestoneId
    })

    if (response.data.success) {
      toast.success("Milestone started successfully!", { id: toastId })
      if (onRefreshProject) {
        onRefreshProject()
      }
      return response.data
    } else {
      throw new Error(response.data.error || "Failed to start milestone")
    }
  } catch (error) {
    console.error("Error starting milestone:", error)

    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message ||
        "Failed to start milestone"

      toast.error(errorMessage, { id: toastId })
    } else {
      toast.error(
        error instanceof Error ? error.message : "Failed to start milestone",
        { id: toastId }
      )
    }

    throw error
  }
}