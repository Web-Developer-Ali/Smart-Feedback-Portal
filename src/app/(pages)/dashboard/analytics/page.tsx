"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Star,
  Users,
  Award,
  Target,
  DollarSign,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AnalyticsPage() {
  // Mock user data
  const mockUser = {
    id: "1",
    email: "user@example.com",
    full_name: "John Doe",
    avatar_url: null,
    role: "agency" as const,
    company_name: "Design Agency",
    created_at: new Date().toISOString(),
  };

  const monthlyData = [
    { month: "Jan", projects: 4, reviews: 12, revenue: 45000, rating: 4.8 },
    { month: "Feb", projects: 6, reviews: 18, revenue: 62000, rating: 4.7 },
    { month: "Mar", projects: 5, reviews: 15, revenue: 58000, rating: 4.9 },
    { month: "Apr", projects: 8, reviews: 24, revenue: 78000, rating: 4.8 },
    { month: "May", projects: 7, reviews: 21, revenue: 69000, rating: 4.9 },
    { month: "Jun", projects: 9, reviews: 27, revenue: 85000, rating: 4.8 },
  ];

  const projectTypes = [
    {
      type: "Web Development",
      count: 15,
      percentage: 45,
      color: "bg-blue-500",
    },
    {
      type: "Mobile Development",
      count: 8,
      percentage: 24,
      color: "bg-green-500",
    },
    { type: "Design", count: 6, percentage: 18, color: "bg-purple-500" },
    { type: "Branding", count: 4, percentage: 13, color: "bg-pink-500" },
  ];

  const clientSatisfaction = [
    { rating: 5, count: 45, percentage: 60 },
    { rating: 4, count: 22, percentage: 29 },
    { rating: 3, count: 6, percentage: 8 },
    { rating: 2, count: 2, percentage: 3 },
    { rating: 1, count: 0, percentage: 0 },
  ];

  return (
    <SidebarProvider>
      <DashboardSidebar user={mockUser} onSignOut={() => {}} />
      <SidebarInset>
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
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block text-gray-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-black font-medium">
                  Analytics
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto p-4 sm:p-6">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
              <Card className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-0 text-white shadow-2xl">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10" />
                        Analytics Dashboard
                      </h1>
                      <p className="text-emerald-100 text-base sm:text-lg">
                        Track your business performance and growth metrics
                      </p>
                    </div>
                    <div className="text-center lg:text-right">
                      <div className="text-3xl sm:text-4xl font-bold">+24%</div>
                      <p className="text-emerald-100">Growth This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">39</div>
                      <p className="text-blue-100 text-sm">Total Projects</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">$397K</div>
                      <p className="text-emerald-100 text-sm">Total Revenue</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">4.8</div>
                      <p className="text-amber-100 text-sm">Avg Rating</p>
                    </div>
                    <Star className="h-8 w-8 text-amber-200 fill-current" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">28</div>
                      <p className="text-purple-100 text-sm">Happy Clients</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Performance */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Monthly Performance
                  </CardTitle>
                  <CardDescription>
                    Projects and revenue over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((data) => (
                      <div
                        key={data.month}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {data.month}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {data.projects} Projects
                            </div>
                            <div className="text-sm text-slate-600">
                              {data.reviews} Reviews
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            ${data.revenue.toLocaleString()}
                          </div>
                          <div className="text-sm text-amber-600 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            {data.rating}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Types Distribution */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Project Types
                  </CardTitle>
                  <CardDescription>
                    Distribution of project types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectTypes.map((type) => (
                      <div key={type.type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-700">
                            {type.type}
                          </span>
                          <span className="text-sm text-slate-600">
                            {type.count} projects
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`${type.color} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${type.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                          {type.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Client Satisfaction */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Client Satisfaction
                </CardTitle>
                <CardDescription>
                  Rating distribution from client reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {clientSatisfaction.map((item) => (
                    <div key={item.rating} className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <span className="font-semibold">{item.rating}</span>
                        <Star className="h-4 w-4 fill-current text-amber-500" />
                      </div>
                      <div className="text-2xl font-bold text-slate-800 mb-1">
                        {item.count}
                      </div>
                      <div className="text-sm text-slate-600">
                        {item.percentage}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Top Rated Agency</h3>
                  <p className="text-green-100">Achieved 4.8+ average rating</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl">
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Project Milestone</h3>
                  <p className="text-blue-100">Completed 35+ projects</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Client Growth</h3>
                  <p className="text-purple-100">25+ satisfied clients</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
