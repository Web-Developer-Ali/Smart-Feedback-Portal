"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Plus } from "lucide-react"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
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
import Link from "next/link"
import axios from "axios"
import { DashboardStats } from "@/components/dashboard/user-stats/dashboard-stats"
import { DashboardContent } from "@/components/dashboard/user-stats/dashboard-content"

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "agency"
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

// Interface for API response
interface UserStats {
  total_projects: number
  total_reviews: number
  avg_rating: number
  growth_this_month: number
  recent_projects: {
    id: string
    name: string
    created_at: string
    status: string
    type: string
    price: number
    duration: number
    total_reviews: number
    avg_rating: number
  }[]
}

export function DashboardClient() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
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
                // Fetch user stats after profile is created
                fetchUserStats()
              }
            }
          } else {
            setProfileError(`Profile error: ${profileFetchError.message}`)
          }
        } else {
          setProfile(profile)
          setProfileError(null)
          // Fetch user stats
          fetchUserStats()
        }
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase, router])

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true)
      setStatsError(null)

      const response = await axios.get("/api/dashboard/user-stats")

      // The response now includes agency_info
      setUserStats(response.data)
    } catch (error: any) {
      console.error("Failed to fetch user stats:", error)
      setStatsError(error.response?.data?.error || "Unable to load dashboard statistics. Please try again later.")
    } finally {
      setStatsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const result = await signOut()
      if (!result.success) {
        throw new Error(result.message || "Unknown error during sign out")
      }
      setUser(null)
      setProfile(null)
      setUserStats(null)
      router.push("/login")
      toast.success(result.message)
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-indigo-400 opacity-20"></div>
          </div>
          <span className="text-lg font-medium text-gray-700">Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
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

  // Calculate stats from API data
  const stats = {
    totalProjects: userStats?.total_projects || 0,
    totalReviews: userStats?.total_reviews || 0,
    averageRating: userStats?.avg_rating || 0,
    growthThisMonth: userStats?.growth_this_month || 0,
    activeProjects: userStats?.recent_projects?.filter((p) => p.status === "in_progress").length || 0,
  }

  return (
    <SidebarProvider>
      <DashboardSidebar user={displayProfile} onSignOut={handleSignOut} />
      <SidebarInset>
        {/* Enhanced Header with Gradient */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white text-black shadow-lg">
          <SidebarTrigger className="-ml-1 text-black hover:bg-black/10" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-gray-300" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard" className="text-black/90 hover:text-black">
                  Smart Feedback Portal
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block text-gray-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-black font-medium">Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto p-4 sm:p-6">
            {/* Enhanced Header with Welcome Card - Mobile Optimized */}
            <section className="mb-6 sm:mb-8" aria-labelledby="welcome-heading">
              <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-0 text-white shadow-2xl">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-0">
                    <div className="text-center lg:text-left">
                      <h1 id="welcome-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                        Welcome back, {displayProfile.full_name?.split(" ")[0] || "there"}! 👋
                      </h1>
                      <p className="text-indigo-100 text-base sm:text-lg">
                        Here&rsquo;s what&rsquo;s happening with your projects today
                      </p>
                    </div>
                    <Button
                      asChild
                      className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg border-0 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-semibold w-full sm:w-auto"
                    >
                      <Link href="/dashboard/create-projects" className="flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        New Project
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {profileError && (
              <Card
                className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg"
                role="alert"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{profileError}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <DashboardStats
              stats={{
                totalProjects: stats.totalProjects,
                totalReviews: stats.totalReviews,
                averageRating: stats.averageRating,
                growthThisMonth: stats.growthThisMonth,
                activeProjects: stats.activeProjects,
              }}
              loading={statsLoading}
            />

            <DashboardContent
              userStats={userStats}
              statsLoading={statsLoading}
              statsError={statsError}
              onRetryStats={fetchUserStats}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
