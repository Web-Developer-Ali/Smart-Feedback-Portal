// components/projects/projects-header.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, TrendingUp, Users, Calendar } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function ProjectsHeader() {
  return (
    <>
      {/* Mobile First Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white text-black shadow-lg">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <SidebarTrigger className="text-black hover:bg-black/10 flex-shrink-0" />
          <Separator orientation="vertical" className="h-4 bg-gray-300 mx-1" />
          <div className="flex-1 min-w-0">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink
                    href="/dashboard"
                    className="text-black/90 hover:text-black text-sm sm:text-base"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block text-gray-500" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-black font-medium text-sm sm:text-base truncate">
                    Projects
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="mb-6 sm:mb-8">
        <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-0 text-white shadow-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-6 lg:p-8 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.2)_1px,_transparent_0)] bg-[size:20px_20px]"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                {/* Left Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Projects Management
                    </h1>
                  </div>
                  
                  <p className="text-blue-100 text-base sm:text-lg mb-4 max-w-2xl">
                    Manage all your projects, track progress, and collaborate with your team in one place
                  </p>

                  {/* Quick Stats - Mobile */}
                  <div className="flex flex-wrap gap-3 lg:hidden mb-4">
                    <div className="flex items-center gap-2 text-blue-100 text-sm bg-white/10 px-3 py-1 rounded-full">
                      <TrendingUp className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100 text-sm bg-white/10 px-3 py-1 rounded-full">
                      <Users className="h-3 w-3" />
                      <span>Clients</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100 text-sm bg-white/10 px-3 py-1 rounded-full">
                      <Calendar className="h-3 w-3" />
                      <span>Timeline</span>
                    </div>
                  </div>
                </div>

                {/* Right Content - CTA Button */}
                <div className="flex-shrink-0">
                  <Button
                    asChild
                    className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg border-0 px-4 sm:px-6 py-3 sm:py-4 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-xl group w-full lg:w-auto"
                  >
                    <Link
                      href="/dashboard/create-projects"
                      className="flex items-center gap-2 justify-center"
                    >
                      <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                      <span className="whitespace-nowrap">New Project</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Quick Stats - Desktop */}
              <div className="hidden lg:flex items-center gap-6 mt-6 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 text-blue-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Track project progress</span>
                </div>
                <div className="w-px h-4 bg-white/30"></div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Manage client relationships</span>
                </div>
                <div className="w-px h-4 bg-white/30"></div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Monitor timelines</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-purple-400/20 rounded-full blur-lg"></div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}