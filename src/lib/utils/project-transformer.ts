import type { ApiProject, ApiMilestone, Project, Milestone, Review } from "@/types/api-projectDetails"

export function transformApiProject(apiProject: ApiProject): Project {
  // Calculate total budget from milestones
  const totalBudget = apiProject.milestones.reduce((sum, milestone) => sum + milestone.milestone_price, 0)

  // Calculate total reviews and average rating
  const allReviews = apiProject.milestones.flatMap((m) => m.reviews)
  const reviewCount = allReviews.length
  const averageRating = reviewCount > 0 ? allReviews.reduce((sum, review) => sum + review.stars, 0) / reviewCount : 0

  // Determine project status based on milestones
  const milestoneStatuses = apiProject.milestones.map((m) => m.status)
  let projectStatus: Project["status"] = "pending"

  if (milestoneStatuses.every((status) => status === "approved")) {
    projectStatus = "completed"
  } else if (milestoneStatuses.some((status) => status === "in_progress" || status === "submitted")) {
    projectStatus = "in_progress"
  }

  return {
    id: apiProject.id,
    name: apiProject.name,
    description: `${apiProject.type} project for ${apiProject.client_name}`,
    type: apiProject.type,
    status: projectStatus,
    client_name: apiProject.client_name,
    client_email: apiProject.client_email,
    client_phone: "N/A", // Not provided in API
    client_company: "N/A", // Not provided in API
    project_budget: totalBudget,
    estimated_days: apiProject.project_duration_days,
    created_at: new Date(apiProject.created_at).toLocaleDateString(),
    updated_at: new Date(apiProject.created_at).toLocaleDateString(),
    review_count: reviewCount,
    average_rating: Math.round(averageRating * 10) / 10,
    progress: 0, // Will be calculated separately
    review_token: apiProject.review_token || "default-token", // Add review token support
  }
}

export function transformApiMilestone(apiMilestone: ApiMilestone, index: number): Milestone {
  // Transform status from API to UI format
  const statusMap: Record<string, Milestone["status"]> = {
    not_started: "pending",
    in_progress: "in_progress",
    submitted: "submitted",
    approved: "approved",
    rejected: "rejected",
  }

  // Calculate due date (rough estimate)
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + apiMilestone.duration_days)

  return {
    id: `milestone-${index}`,
    name: apiMilestone.title,
    description: apiMilestone.description,
    duration_days: apiMilestone.duration_days,
    milestone_price: apiMilestone.milestone_price,
    status: statusMap[apiMilestone.status] || "pending",
    created_at: new Date().toLocaleDateString(),
    due_date: dueDate.toLocaleDateString(),
    free_revisions: apiMilestone.free_revisions,
    used_revisions: apiMilestone.used_revisions,
    revision_rate: apiMilestone.revision_rate,
    deliverables: [], // Empty for now, can be populated later
  }
}

export function transformApiReviews(apiProject: ApiProject): Review[] {
  const reviews: Review[] = []

  apiProject.milestones.forEach((milestone, milestoneIndex) => {
    milestone.reviews.forEach((review, reviewIndex) => {
      reviews.push({
        id: `review-${milestoneIndex}-${reviewIndex}`,
        client_name: review.client_name,
        stars: review.stars,
        review: review.review,
        created_at: new Date(review.created_at).toLocaleDateString(),
        milestone_id: `milestone-${milestoneIndex}`,
      })
    })
  })

  return reviews
}
