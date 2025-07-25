"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star, Upload, X, Loader2, CheckCircle, MessageSquare } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string | null
  client_name: string | null
  agency_id: string
}

export default function FeedbackForm() {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [files, setFiles] = useState<File[]>([])

  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const loadProject = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("feedback_link_id", params.id)
        .single()

      if (error || !data) {
        toast.error("Invalid feedback link")
        router.push("/")
        return
      }

      setProject(data)
    } catch (error) {
      console.error("Load project error:", error)
      toast.error("Failed to load project")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }, [params.id, router, supabase])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter((file) => {
      const isValidType = file.type.startsWith("image/") || file.type === "application/pdf"
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      return isValidType && isValidSize
    })

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Some files were rejected. Only images and PDFs under 5MB are allowed.")
    }

    setFiles((prev) => [...prev, ...validFiles].slice(0, 5)) // Max 5 files
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (feedbackId: string) => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split(".").pop()
      const fileName = `${feedbackId}/${Date.now()}.${fileExt}`

      const { error } = await supabase.storage.from("feedback-attachments").upload(fileName, file)

      if (error) {
        console.error("File upload error:", error)
        return null
      }

      const { data: { publicUrl } } = supabase.storage.from("feedback-attachments").getPublicUrl(fileName)

      return {
        feedback_id: feedbackId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
      }
    })

    const uploadResults = await Promise.all(uploadPromises)
    return uploadResults.filter((result) => result !== null)
  }

  const submitFeedback = async (formData: FormData) => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setSubmitting(true)

    try {
      const feedbackData = {
        project_id: project!.id,
        rating,
        message: formData.get("message") as string,
        client_name: formData.get("client_name") as string,
        client_email: formData.get("client_email") as string,
        sentiment: rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "negative",
      }

      const { data: feedback, error } = await supabase
        .from("feedback")
        .insert(feedbackData)
        .select()
        .single()

      if (error) {
        toast.error("Failed to submit feedback")
        console.error("Submit feedback error:", error)
        return
      }

      if (files.length > 0) {
        await uploadFiles(feedback.id)
      }

      setSubmitted(true)
      toast.success("Thank you for your feedback!")
    } catch (error) {
      console.error("Submit feedback error:", error)
      toast.error("Failed to submit feedback")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading feedback form...</span>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your feedback has been submitted successfully.</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Share Your Feedback
            </CardTitle>
            <CardDescription className="text-lg">
              We&apos;d love to hear about your experience with <strong>{project?.name}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form action={submitFeedback} className="space-y-6">
              {/* Rating Section */}
              <div className="text-center">
                <Label className="text-lg font-semibold mb-4 block">How would you rate your experience?</Label>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoveredRating || rating)
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {rating === 0 && "Click to rate"}
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>

              {/* Message Section */}
              <div>
                <Label htmlFor="message" className="text-base font-medium">
                  Tell us more about your experience (optional)
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Share your thoughts, suggestions, or any specific feedback..."
                  className="mt-2 min-h-[120px]"
                />
              </div>

              {/* File Upload Section */}
              <div>
                <Label className="text-base font-medium mb-2 block">Attach files (optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload images or PDFs
                      <br />
                      <span className="text-xs text-gray-500">Max 5 files, 5MB each</span>
                    </p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name">Your Name (optional)</Label>
                  <Input
                    id="client_name"
                    name="client_name"
                    placeholder="John Doe"
                    defaultValue={project?.client_name || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="client_email">Your Email (optional)</Label>
                  <Input
                    id="client_email"
                    name="client_email"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || rating === 0}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
