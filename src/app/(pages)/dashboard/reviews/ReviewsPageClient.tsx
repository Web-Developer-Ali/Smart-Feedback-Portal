"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
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
import { toast } from "sonner";
import { ReviewsStats } from "@/components/dashboard/reviews/ReviewsStats";
import { ReviewsFilters } from "@/components/dashboard/reviews/ReviewsFilters";
import { ReviewsList } from "@/components/dashboard/reviews/ReviewsList";
import { Pagination, Review, ReviewStats } from "@/types/dashboard";

export function ReviewsPageClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDataFetched, setHasDataFetched] = useState(false); // Track if data has been fetched

  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("/api/dashboard/reviews", {
          params: {
            page,
            limit: 10,
            rating: ratingFilter,
            type: typeFilter,
            search: searchTerm,
          },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          const data = response.data;
          setStats(data.stats);
          setReviews(data.reviews);
          setPagination(data.pagination);
          setHasDataFetched(true); // Mark that data has been fetched
        }
      } catch (err: any) {
        if (axios.isCancel(err)) {
          console.log("Request canceled:", err.message);
          return;
        } else if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
          console.log("Request aborted");
          return;
        } else {
          console.error("Failed to load reviews:", err);
          setError("Unable to load reviews. Please try again.");
          toast.error("Error loading reviews");
          setHasDataFetched(true); // Even on error, mark as fetched
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [page, ratingFilter, typeFilter, searchTerm]);

  const mockUser = {
    id: "1",
    email: "user@example.com",
    full_name: "John Doe",
    avatar_url: null,
    role: "agency" as const,
    company_name: "Design Agency",
    created_at: new Date().toISOString(),
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
            <ReviewsStats stats={stats} />
            
            <ReviewsFilters
              ratingFilter={ratingFilter}
              onRatingFilterChange={(val) => {
                setRatingFilter(val);
                setPage(1);
              }}
            />

            <ReviewsList
              reviews={reviews}
              pagination={pagination}
              loading={loading}
              error={error}
              onPageChange={setPage}
              hasDataFetched={hasDataFetched} // Pass this prop
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}