"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
import axios from "axios";
import { DashboardStats } from "@/components/dashboard/user-stats/dashboard-stats";
import { DashboardContent } from "@/components/dashboard/user-stats/dashboard-content";
import { UserStats } from "@/types/user-stats";
import { useUser } from "@/components/user-provider";

export function DashboardClient() {
  const { user } = useUser();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ memoize API call
  const fetchUserStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/dashboard/user-stats");
      setUserStats(response.data);
    } catch (err: any) {
      console.error("Failed to fetch user stats:", err);
      setError(err.response?.data?.error || "Unable to load dashboard statistics. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  if (loading) {
    return (
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <div className="flex flex-col justify-center items-center h-screen bg-background dark:bg-gray-900">
            <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-gray-200 mb-4" />
            <p className="text-muted-foreground dark:text-gray-400">Loading your Dashboard...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <Card className="border-amber-200 shadow-lg max-w-md w-full">
          <CardContent className="flex items-center gap-3 p-6 text-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Dashboard Error</p>
              <p className="text-sm">{error}</p>
              <Button onClick={fetchUserStats} variant="outline" className="mt-3">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Derived stats
  const stats = {
    totalProjects: userStats?.total_projects ?? 0,
    totalReviews: userStats?.total_reviews ?? 0,
    averageRating: userStats?.avg_rating ?? 0,
    growthThisMonth: userStats?.growth_this_month ?? 0,
    activeProjects: userStats?.recent_projects?.filter((p) => p.status === "in_progress").length ?? 0,
  };

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white shadow-lg">
          <SidebarTrigger className="-ml-1 text-black hover:bg-black/10" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-gray-300" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Smart Feedback Portal</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto p-4 sm:p-6">
            {/* Welcome card */}
            <section className="mb-6 sm:mb-8">
              <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-0 text-white shadow-2xl">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div className="text-center lg:text-left">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                        Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
                      </h1>
                      <p className="text-indigo-100 text-base sm:text-lg">
                        Here’s what’s happening with your projects today
                      </p>
                    </div>
                    <Button
                      asChild
                      className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg px-6 py-3 font-semibold"
                    >
                      <Link href="/dashboard/create-projects" className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        New Project
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <DashboardStats stats={stats} loading={loading} />

            <DashboardContent
              userStats={userStats}
              statsLoading={loading}
              statsError={error}
              onRetryStats={fetchUserStats}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
