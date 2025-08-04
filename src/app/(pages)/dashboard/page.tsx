"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Loader2,
  AlertCircle,
  Plus,
  Star,
  TrendingUp,
  MessageSquare,
  Target,
  Clock,
  Award,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ProjectCard } from "@/components/dashboard/project-card";
import { ReviewCard } from "@/components/dashboard/review-card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "client" | "agency";
  company_name: string | null;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  type: string | null;
  agency_user_id: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  project_budget: number | null;
  estimated_days: number | null;
  review_token: string;
  review_link: string;
  created_at: string;
  updated_at: string;
  review_count: number;
  average_rating: number;
}

interface Review {
  id: string;
  project_id: string;
  milestone_id: string | null;
  stars: number;
  review: string;
  created_at: string;
  project_name: string;
  client_name: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("User fetch error:", userError);
          router.push("/login");
          return;
        }

        if (!user) {
          router.push("/login");
          return;
        }

        setUser(user);

        // Get user profile
        const { data: profile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileFetchError) {
          console.error("Profile fetch error:", profileFetchError);
          if (profileFetchError.code === "PGRST116") {
            setProfileError("Profile not found. Creating basic profile...");
            const { error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                email: user.email!,
                full_name: user.user_metadata?.full_name || "",
                role: "agency",
              });

            if (createError) {
              console.error("Profile creation error:", createError);
              setProfileError(
                "Failed to create profile. Please try refreshing the page."
              );
            } else {
              const { data: newProfile, error: retryError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

              if (retryError) {
                setProfileError("Failed to load profile after creation.");
              } else {
                setProfile(newProfile);
                setProfileError(null);
              }
            }
          } else {
            setProfileError(`Profile error: ${profileFetchError.message}`);
          }
        } else {
          setProfile(profile);
          setProfileError(null);
        }

        // Load mock data for now (replace with actual Supabase queries)
        loadMockData();
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase, router]);

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
    ]);

    // Mock reviews data
    setReviews([
      {
        id: "1",
        project_id: "1",
        milestone_id: null,
        stars: 5,
        review:
          "Excellent work! The team delivered exactly what we needed and more.",
        created_at: "2024-01-18",
        project_name: "E-commerce Website Redesign",
        client_name: "John Smith",
      },
      {
        id: "2",
        project_id: "2",
        milestone_id: "milestone-1",
        stars: 4,
        review:
          "Great communication throughout the project. Very professional.",
        created_at: "2024-01-16",
        project_name: "Mobile App Development",
        client_name: "Sarah Johnson",
      },
      {
        id: "3",
        project_id: "1",
        milestone_id: null,
        stars: 5,
        review:
          "Outstanding quality and attention to detail. Highly recommend!",
        created_at: "2024-01-14",
        project_name: "E-commerce Website Redesign",
        client_name: "Mike Davis",
      },
    ]);
  };

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (!result.success) {
        throw new Error(result.message || "Unknown error during sign out");
      }
      setUser(null);
      setProfile(null);
      router.push("/login");
      toast.success(result.message);
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-indigo-400 opacity-20"></div>
          </div>
          <span className="text-lg font-medium text-gray-700">
            Loading your dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (profileError && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Profile Error
            </CardTitle>
            <CardDescription>{profileError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Retry
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full bg-transparent"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayProfile = profile || {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    role: "agency" as const,
    company_name: null,
    created_at: user.created_at,
  };

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "in_progress").length,
    totalReviews: reviews.length,
    averageRating:
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
          ).toFixed(1)
        : "0",
  };

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
                <BreadcrumbLink
                  href="/dashboard"
                  className="text-black/90 hover:text-black"
                >
                  Smart Feedback Portal
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block text-gray-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-black font-medium">
                  Dashboard
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto p-4 sm:p-6">
            {/* Enhanced Header with Welcome Card - Mobile Optimized */}
            <div className="mb-6 sm:mb-8">
              <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-0 text-white shadow-2xl">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-0">
                    <div className="text-center lg:text-left">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                        Welcome back,{" "}
                        {displayProfile.full_name?.split(" ")[0] || "there"}! 👋
                      </h1>
                      <p className="text-indigo-100 text-base sm:text-lg">
                        Here's what's happening with your projects today
                      </p>
                    </div>
                    <Button
                      asChild
                      className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg border-0 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-semibold w-full sm:w-auto"
                    >
                      <Link
                        href="/dashboard/projects/create"
                        className="flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        New Project
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {profileError && (
              <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{profileError}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Stats Cards with Better Mobile Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">
                    Total Projects
                  </CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Briefcase className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalProjects}
                  </div>
                  <p className="text-xs text-blue-100 flex items-center gap-1 mt-1">
                    <Target className="h-3 w-3" />
                    {stats.activeProjects} active projects
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-100">
                    Total Reviews
                  </CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalReviews}</div>
                  <p className="text-xs text-emerald-100 flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    From satisfied clients
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-100">
                    Average Rating
                  </CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Star className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold flex items-center gap-1">
                    {stats.averageRating}
                    <Star className="h-6 w-6 fill-current" />
                  </div>
                  <p className="text-xs text-amber-100 flex items-center gap-1 mt-1">
                    <Award className="h-3 w-3" />
                    Out of 5 stars
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">
                    This Month
                  </CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-100">+12%</div>
                  <p className="text-xs text-purple-100 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    Growth in reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Main Content Grid - Improved Responsiveness */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Recent Projects with Enhanced Design */}
              <Card className="xl:col-span-2 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-slate-800 text-lg sm:text-xl">
                    <div className="p-2 bg-blue-500 text-white rounded-lg">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    Recent Projects
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-sm sm:text-base">
                    Manage your ongoing and completed projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {projects.slice(0, 3).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl inline-block mb-4">
                        <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-blue-400" />
                      </div>
                      <p className="text-base sm:text-lg font-medium">
                        No projects yet
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Create your first project to get started!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reviews with Enhanced Design - Improved Mobile */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-slate-800 text-lg sm:text-xl">
                    <div className="p-2 bg-amber-500 text-white rounded-lg">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    Recent Reviews
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-sm sm:text-base">
                    Latest feedback from your clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 max-h-[600px] overflow-y-auto">
                  {reviews.slice(0, 3).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl inline-block mb-4">
                        <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-amber-400" />
                      </div>
                      <p className="text-base sm:text-lg font-medium">
                        No reviews yet
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Complete projects to receive feedback!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
