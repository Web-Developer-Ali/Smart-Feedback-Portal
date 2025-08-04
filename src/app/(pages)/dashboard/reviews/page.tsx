"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Search, MessageSquare, Calendar, Award } from "lucide-react";
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

interface Review {
  id: string;
  project_name: string;
  client_name: string;
  stars: number;
  review: string;
  created_at: string;
  milestone_id: string | null;
  project_type: string;
}

const mockReviews: Review[] = [
  {
    id: "1",
    project_name: "E-commerce Website Redesign",
    client_name: "John Smith",
    stars: 5,
    review:
      "Excellent work! The team delivered exactly what we needed and more. The attention to detail was outstanding and the communication throughout the project was perfect.",
    created_at: "Jan 18, 2024",
    milestone_id: null,
    project_type: "Web Development",
  },
  {
    id: "2",
    project_name: "Mobile App Development",
    client_name: "Sarah Johnson",
    stars: 4,
    review:
      "Great communication throughout the project. Very professional team and delivered on time. Would definitely work with them again.",
    created_at: "Jan 16, 2024",
    milestone_id: "milestone-1",
    project_type: "Mobile Development",
  },
  {
    id: "3",
    project_name: "Brand Identity Package",
    client_name: "Mike Davis",
    stars: 5,
    review:
      "Outstanding quality and attention to detail. The branding package exceeded our expectations and really captured our company's vision.",
    created_at: "Jan 14, 2024",
    milestone_id: null,
    project_type: "Branding",
  },
  {
    id: "4",
    project_name: "Marketing Website",
    client_name: "Emily Chen",
    stars: 4,
    review:
      "Professional work and good results. The website looks great and has improved our conversion rates significantly.",
    created_at: "Jan 12, 2024",
    milestone_id: "milestone-2",
    project_type: "Web Development",
  },
  {
    id: "5",
    project_name: "Logo Design",
    client_name: "Robert Wilson",
    stars: 5,
    review:
      "Perfect logo design that captures our brand essence. Quick turnaround and excellent communication throughout the process.",
    created_at: "Jan 10, 2024",
    milestone_id: null,
    project_type: "Design",
  },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

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

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "bg-gradient-to-br from-red-400 to-red-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getRatingColor = (stars: number) => {
    if (stars >= 5) return "text-green-500";
    if (stars >= 4) return "text-blue-500";
    if (stars >= 3) return "text-amber-500";
    return "text-red-500";
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "web development":
        return "bg-blue-100 text-blue-700";
      case "mobile development":
        return "bg-green-100 text-green-700";
      case "design":
        return "bg-purple-100 text-purple-700";
      case "branding":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-indigo-100 text-indigo-700";
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating =
      ratingFilter === "all" || review.stars.toString() === ratingFilter;
    const matchesType =
      typeFilter === "all" || review.project_type === typeFilter;

    return matchesSearch && matchesRating && matchesType;
  });

  const stats = {
    total: reviews.length,
    averageRating: (
      reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
    ).toFixed(1),
    fiveStars: reviews.filter((r) => r.stars === 5).length,
    thisMonth: 3, // Static value to avoid hydration issues
  };

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
                  Reviews
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto p-4 sm:p-6">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
              <Card className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 border-0 text-white shadow-2xl">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                        <Star className="h-8 w-8 sm:h-10 sm:w-10 fill-current" />
                        Client Reviews
                      </h1>
                      <p className="text-amber-100 text-base sm:text-lg">
                        See what your clients are saying about your work
                      </p>
                    </div>
                    <div className="text-center lg:text-right">
                      <div className="text-3xl sm:text-4xl font-bold">
                        {stats.averageRating}
                      </div>
                      <p className="text-amber-100">Average Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-blue-100 text-sm">Total Reviews</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold flex items-center gap-1">
                    {stats.averageRating}
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <p className="text-amber-100 text-sm">Avg Rating</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.fiveStars}</div>
                  <p className="text-emerald-100 text-sm">5-Star Reviews</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.thisMonth}</div>
                  <p className="text-purple-100 text-sm">This Month</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search reviews, projects, or clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Web Development">
                        Web Development
                      </SelectItem>
                      <SelectItem value="Mobile Development">
                        Mobile Development
                      </SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Branding">Branding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <Card
                  key={review.id}
                  className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      <Avatar
                        className={`h-12 w-12 ${getAvatarColor(
                          review.client_name
                        )} text-white shadow-lg flex-shrink-0`}
                      >
                        <AvatarFallback className="bg-transparent text-white font-semibold">
                          {review.client_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-800 text-lg">
                              {review.client_name}
                            </h3>
                            <p className="text-slate-600 text-sm">
                              {review.project_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.stars
                                      ? `fill-current ${getRatingColor(
                                          review.stars
                                        )}`
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span
                                className={`text-sm font-medium ml-1 ${getRatingColor(
                                  review.stars
                                )}`}
                              >
                                {review.stars}.0
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className={getTypeColor(review.project_type)}>
                            {review.project_type}
                          </Badge>
                          {review.milestone_id && (
                            <Badge className="bg-blue-50 text-blue-600">
                              <Award className="h-3 w-3 mr-1" />
                              Milestone Review
                            </Badge>
                          )}
                        </div>

                        <blockquote className="text-slate-700 text-base leading-relaxed mb-4 border-l-4 border-amber-400 pl-4 italic">
                          "{review.review}"
                        </blockquote>

                        <div className="flex items-center gap-1 text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full w-fit">
                          <Calendar className="h-4 w-4" />
                          <span>{review.created_at}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredReviews.length === 0 && (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No reviews found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filters
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
