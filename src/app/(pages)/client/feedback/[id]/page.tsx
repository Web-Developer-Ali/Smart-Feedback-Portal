"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Star,
  Loader2,
  CheckCircle,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { z } from "zod";
import axios from "axios";

// Zod validation schema - milestoneId is now optional
const feedbackSchema = z.object({
  rating: z
    .number()
    .min(1, "Please select a rating")
    .max(5, "Rating must be between 1 and 5 stars"),
  review: z
    .string()
    .max(2000, "Review must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
  milestoneId: z.string().uuid("Invalid milestone").optional().nullable(),
  projectId: z.string().uuid("Invalid project"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

// Type for API validation errors
type ApiValidationError = {
  fieldErrors?: {
    rating?: string[];
    review?: string[];
    milestoneId?: string[];
    projectId?: string[];
  };
  formErrors?: string[];
};

type ApiErrorResponse = {
  error?: string;
  details?: ApiValidationError;
};

export default function FeedbackForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [apiValidationErrors, setApiValidationErrors] = useState<
    Record<string, string>
  >({});
  const [formData, setFormData] = useState({
    review: "",
  });

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const projectId = params.id as string;
  const milestoneId = searchParams.get("milestoneId");

  const validateForm = (): boolean => {
    try {
      feedbackSchema.parse({
        rating,
        review: formData.review,
        milestoneId: milestoneId || undefined,
        projectId,
      });
      setValidationErrors({});
      setApiValidationErrors({}); // Clear API errors on client-side validation success
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(errors);

        // Show the first error in toast
        const firstError = error.errors[0];
        if (firstError) {
          toast.error(firstError.message);
        }
      }
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiValidationErrors[name]) {
      setApiValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);

    // Clear validation errors when user selects a rating
    if (validationErrors.rating) {
      setValidationErrors((prev) => ({ ...prev, rating: "" }));
    }
    if (apiValidationErrors.rating) {
      setApiValidationErrors((prev) => ({ ...prev, rating: "" }));
    }
  };

  // Helper function to extract and display API validation errors
  const handleApiValidationErrors = (errorDetails: ApiValidationError) => {
    const errors: Record<string, string> = {};

    // Handle field errors
    if (errorDetails.fieldErrors) {
      Object.entries(errorDetails.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          errors[field] = messages[0]; // Show first error for each field
        }
      });
    }

    // Handle form errors
    if (errorDetails.formErrors && errorDetails.formErrors.length > 0) {
      toast.error(errorDetails.formErrors[0]);
    }

    setApiValidationErrors(errors);

    // If there are field errors, show the first one in toast
    const firstFieldError = Object.values(errors)[0];
    if (firstFieldError) {
      toast.error(firstFieldError);
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setApiValidationErrors({}); // Clear previous API errors

    try {
      const payload: FeedbackFormData = {
        projectId,
        review: formData.review,
        rating,
        ...(milestoneId && { milestoneId }),
      };

      const response = await axios.post("/api/client/submit_review", payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      setSubmitted(true);

      if (milestoneId) {
        toast.success("Thank you for your milestone feedback!");
      } else {
        toast.success("Thank you for your project feedback!");
      }

      setTimeout(() => {
        router.push(`/client/client-review/${projectId}`);
      }, 2000);
    } catch (error) {
      console.error("Submit feedback error:", error);

      let errorMessage = "Something went wrong";
      let shouldShowValidationErrors = false;

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const serverError: ApiErrorResponse = error.response.data;

          // Check if it's a validation error with details
          if (error.response.status === 400 && serverError.details) {
            shouldShowValidationErrors = true;
            handleApiValidationErrors(serverError.details);
            errorMessage =
              serverError.error || "Please check the form for errors";
          } else {
            errorMessage = serverError.error || "Failed to submit review";
          }
        } else if (error.request) {
          errorMessage = "Network error - please check your connection";
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Only show toast if we're not showing field-level validation errors
      if (!shouldShowValidationErrors) {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Combine client-side and API validation errors for display
  const getFieldError = (fieldName: string): string | undefined => {
    return apiValidationErrors[fieldName] || validationErrors[fieldName];
  };

  // Get appropriate title and description based on whether it's a project or milestone review
  const getFormTitle = () => {
    if (milestoneId) {
      return "Milestone Feedback";
    }
    return "Project Feedback";
  };

  const getFormDescription = () => {
    if (milestoneId) {
      return "We'd love to hear about your experience with this specific milestone.";
    }
    return "We'd love to hear about your overall experience with this project.";
  };

  const getPlaceholderText = () => {
    if (milestoneId) {
      return "Share your thoughts about this specific milestone...";
    }
    return "Share your overall thoughts about the project...";
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              {milestoneId
                ? "Your milestone feedback has been submitted successfully."
                : "Your project feedback has been submitted successfully."}
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/client/client-review/${projectId}`)
                }
                className="flex-1"
              >
                Back to Project
              </Button>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setRating(0);
                  setFormData({ review: "" });
                  setApiValidationErrors({});
                }}
                className="flex-1"
              >
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">
              {getFormTitle()}
            </CardTitle>
            <CardDescription className="text-lg">
              {getFormDescription()}
            </CardDescription>
            {milestoneId && (
              <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                Reviewing specific milestone
              </div>
            )}
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
                {getFieldError("rating") && (
                  <div className="flex items-center justify-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{getFieldError("rating")}</span>
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
                <Label htmlFor="review">
                  Tell us more (optional)
                  {milestoneId && " - about this milestone"}
                </Label>
                <Textarea
                  id="review"
                  name="review"
                  value={formData.review}
                  onChange={handleInputChange}
                  className="mt-2 min-h-[120px] resize-none"
                  placeholder={getPlaceholderText()}
                  disabled={submitting}
                />
                {getFieldError("review") && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{getFieldError("review")}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.review.length}/2000 characters
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
                  `Submit ${milestoneId ? "Milestone" : "Project"} Feedback`
                )}
              </Button>

              {/* Loading overlay */}
              {submitting && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-gray-700">
                      Submitting your feedback...
                    </span>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
