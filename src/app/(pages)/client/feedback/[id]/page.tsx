"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Star, Loader2, CheckCircle, MessageSquare, AlertCircle } from "lucide-react"
import { z } from "zod"

// Zod validation schema - match the API expected format
const feedbackSchema = z.object({
  rating: z.number()
    .min(1, "Please select a rating")
    .max(5, "Rating must be between 1 and 5 stars"),
  review: z.string()  // Changed from 'message' to 'review' to match API
    .max(2000, "Review must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  milestoneId: z.string().uuid("Invalid milestone"),
  projectId: z.string().uuid("Invalid project")
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

export default function FeedbackForm() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    review: ""  // Changed from 'message' to 'review'
  })

  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const projectId = params.id as string
  const milestoneId = searchParams.get("milestoneId")

  const validateForm = (): boolean => {
    try {
      feedbackSchema.parse({
        rating,
        review: formData.review,  // Changed from message to review
        milestoneId,
        projectId
      })
      setValidationErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message
          }
        })
        setValidationErrors(errors)
        
        // Show the first error in toast
        const firstError = error.errors[0]
        if (firstError) {
          toast.error(firstError.message)
        }
      }
      return false
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
    
    // Clear rating validation error when user selects a rating
    if (validationErrors.rating) {
      setValidationErrors(prev => ({ ...prev, rating: "" }))
    }
  }

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const payload: FeedbackFormData = {
        milestoneId: milestoneId!,
        projectId,
        review: formData.review,  // Changed from message to review
        rating,
      }

      const res = await fetch("/api/client/submit_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.details?.rating?.[0] || "Failed to submit review")
      }

      setSubmitted(true)
      toast.success("Thank you for your feedback!")
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push(`/client/client-review/${projectId}`)
      }, 2000)

    } catch (error) {
      console.error("Submit feedback error:", error)
      const errorMessage = error instanceof Error ? error.message : "Something went wrong"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your feedback has been submitted successfully.</p>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/client/client-review/${projectId}`)}
                className="flex-1"
              >
                Back to Project
              </Button>
              <Button 
                onClick={() => {
                  setSubmitted(false)
                  setRating(0)
                  setFormData({ review: "" })  // Changed from message to review
                }}
                className="flex-1"
              >
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Share Your Feedback</CardTitle>
            <CardDescription className="text-lg">
              We&apos;d love to hear about your experience with this freelancer.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={submitFeedback} className="space-y-6">
              {/* Rating Section */}
              <div className="text-center">
                <Label className="text-lg font-semibold mb-4 block">
                  How would you rate your experience?
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                      disabled={submitting}
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoveredRating || rating)
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300 hover:text-yellow-400"
                        } ${submitting ? "opacity-50" : ""}`}
                      />
                    </button>
                  ))}
                </div>
                {validationErrors.rating && (
                  <div className="flex items-center justify-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.rating}</span>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {rating === 0 && "Click to rate (required)"}
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>

              {/* Message Section */}
              <div>
                <Label htmlFor="review">Tell us more (optional)</Label>
                <Textarea 
                  id="review" 
                  name="review"  // Changed from message to review
                  value={formData.review}  // Changed from message to review
                  onChange={handleInputChange}
                  className="mt-2 min-h-[120px] resize-none"
                  placeholder="Share your thoughts about the work delivered..."
                  disabled={submitting}
                />
                {validationErrors.review && (  // Changed from message to review
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.review}</span>  {/* Changed from message to review */}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.review.length}/100 characters  {/* Changed from message to review */}
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={submitting || rating === 0} 
                className="w-full h-12 text-lg relative"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                    <div className="absolute inset-0 bg-white/20 rounded-md"></div>
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>

              {/* Loading overlay */}
              {submitting && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-gray-700">Submitting your feedback...</span>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}