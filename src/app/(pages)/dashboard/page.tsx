"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Briefcase, Loader2, AlertCircle, Plus, Star, TrendingUp, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { CreateProjectDialog } from "@/components/dashboard/project-card"
import { ReviewCard } from "@/components/dashboard/review-card"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "agency"
  company_name: string | null
  created_at: string
}

interface Project {
  id: string
  name: string
  type: string | null
  agency_user_id: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  project_budget: number | null
  estimated_days: number | null
  review_token: string
  review_link: string
  created_at: string
  updated_at: string
  review_count: number
  average_rating: number
}

interface Review {
  id: string
  project_id: string
  milestone_id: string | null
  stars: number
  review: string
  created_at: string
  project_name: string
  client_name: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("User fetch error:", userError)
          router.push("/login")
          return
        }

        if (!user) {
          router.push("/login")
          return
        }

        setUser(user)

        // Get user profile
        const { data: profile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileFetchError) {
          console.error("Profile fetch error:", profileFetchError)
          if (profileFetchError.code === "PGRST116") {
            setProfileError("Profile not found. Creating basic profile...")
            const { error: createError } = await supabase.from("profiles").insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || "",
              role: "agency",
            })

            if (createError) {
              console.error("Profile creation error:", createError)
              setProfileError("Failed to create profile. Please try refreshing the page.")
            } else {
              const { data: newProfile, error: retryError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

              if (retryError) {
                setProfileError("Failed to load profile after creation.")
              } else {
                setProfile(newProfile)
                setProfileError(null)
              }
            }
          } else {
            setProfileError(`Profile error: ${profileFetchError.message}`)
          }
        } else {
          setProfile(profile)
          setProfileError(null)
        }

        // Load mock data for now (replace with actual Supabase queries)
        loadMockData()
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase, router])

  const loadMockData = () => {
    // Mock projects data based on your schema
    setProjects([
      {
        id: "1",
        name: "E-commerce Website Redesign",
        type: "Web Development",
        agency_user_id: "user-1",
        status: "in_progress",
        project_budget: 15000,
        estimated_days: 45,
        review_token: "abc123",
        review_link: "https://feedback.com/review/abc123",
        created_at: "2024-01-15",
        updated_at: "2024-01-18",
        review_count: 3,
        average_rating: 4.7,
      },
      {
        id: "2",
        name: "Mobile App Development",
        type: "Mobile Development",
        agency_user_id: "user-1",
        status: "completed",
        project_budget: 25000,
        estimated_days: 60,
        review_token: "def456",
        review_link: "https://feedback.com/review/def456",
        created_at: "2024-01-10",
        updated_at: "2024-01-20",
        review_count: 5,
        average_rating: 4.9,
      },
      {
        id: "3",
        name: "Brand Identity Package",
        type: "Design",
        agency_user_id: "user-1",
        status: "pending",
        project_budget: 8000,
        estimated_days: 30,
        review_token: "ghi789",
        review_link: "https://feedback.com/review/ghi789",
        created_at: "2024-01-20",
        updated_at: "2024-01-20",
        review_count: 0,
        average_rating: 0,
      },
    ])

    // Mock reviews data
    setReviews([
      {
        id: "1",
        project_id: "1",
        milestone_id: null,
        stars: 5,
        review: "Excellent work! The team delivered exactly what we needed and more.",
        created_at: "2024-01-18",
        project_name: "E-commerce Website Redesign",
        client_name: "John Smith",
      },
      {
        id: "2",
        project_id: "2",
        milestone_id: "milestone-1",
        stars: 4,
        review: "Great communication throughout the project. Very professional.",
        created_at: "2024-01-16",
        project_name: "Mobile App Development",
        client_name: "Sarah Johnson",
      },
      {
        id: "3",
        project_id: "1",
        milestone_id: null,
        stars: 5,
        review: "Outstanding quality and attention to detail. Highly recommend!",
        created_at: "2024-01-14",
        project_name: "E-commerce Website Redesign",
        client_name: "Mike Davis",
      },
    ])
  }

  const handleSignOut = async () => {
    try {
      const result = await signOut()
      if (!result.success) {
        throw new Error(result.message || "Unknown error during sign out")
      }
      setUser(null)
      setProfile(null)
      router.push("/login")
      toast.success(result.message)
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (profileError && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Profile Error
            </CardTitle>
            <CardDescription>{profileError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
            <Button onClick={handleSignOut} variant="outline" className="w-full bg-transparent">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayProfile = profile || {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    role: "agency" as const,
    company_name: null,
    created_at: user.created_at,
  }

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "in_progress").length,
    totalReviews: reviews.length,
    averageRating:
      reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1) : "0",
  }

  return (
    <SidebarProvider>
      <DashboardSidebar user={displayProfile} onSignOut={handleSignOut} />
      <SidebarInset>
        {/* Fixed Header with Sidebar Trigger */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Smart Feedback Portal</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {displayProfile.full_name || displayProfile.email}</p>
              </div>
              <Button asChild className="flex items-center gap-2">
                <Link href="/add-projects">
                  <Plus className="h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>

            {profileError && (
              <Card className="mb-6 border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{profileError}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProjects}</div>
                  <p className="text-xs text-muted-foreground">{stats.activeProjects} active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReviews}</div>
                  <p className="text-xs text-muted-foreground">From satisfied clients</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageRating}</div>
                  <p className="text-xs text-muted-foreground">Out of 5 stars</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12%</div>
                  <p className="text-xs text-muted-foreground">Growth in reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Projects */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Recent Projects
                  </CardTitle>
                  <CardDescription>Manage your ongoing and completed projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    // Replace CreateProjectDialog with a suitable ProjectCard or similar component
                    <Card key={project.id} className="border">
                      <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">{project.status.replace("_", " ")}</span>
                          <span className="text-xs text-muted-foreground">{project.created_at}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Budget: ${project.project_budget?.toLocaleString() ?? "N/A"} | Est. {project.estimated_days ?? "?"} days
                        </div>
                        <div className="mt-2">
                          <a href={project.review_link} className="text-blue-600 underline text-xs" target="_blank" rel="noopener noreferrer">
                            Review Link
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No projects yet. Create your first project to get started!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Recent Reviews
                  </CardTitle>
                  <CardDescription>Latest feedback from your clients</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No reviews yet. Complete projects to receive feedback!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
