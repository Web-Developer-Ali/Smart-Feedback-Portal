"use client"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, Clock, User, Mail, Phone, Building, Star, MessageSquare } from "lucide-react"
import type { Project } from "@/types/api-projectDetails"

interface ProjectOverviewProps {
  project: Project
  projectStats: {
    completed: number
    total: number
    progress: number
  }
}

export default function ProjectOverview({ project, projectStats }: ProjectOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Enhanced Project Info */}
      <div className="lg:col-span-2">
        <Card className="shadow-lg border-0 bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{project.name}</CardTitle>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium">{project.type}</Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Started {project.created_at}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{projectStats.progress}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <CardDescription className="text-base leading-relaxed text-gray-700 mb-6">
              {project.description}
            </CardDescription>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Budget</span>
                </div>
                <div className="text-xl font-bold text-green-800">${project.project_budget.toLocaleString()}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Duration</span>
                </div>
                <div className="text-xl font-bold text-blue-800">{project.estimated_days} days</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-amber-600 fill-current" />
                  <span className="text-sm font-medium text-amber-700">Rating</span>
                </div>
                <div className="text-xl font-bold text-amber-800">
                  {project.average_rating > 0 ? project.average_rating : "N/A"}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Reviews</span>
                </div>
                <div className="text-xl font-bold text-purple-800">{project.review_count}</div>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Project Progress</span>
                <span className="text-sm font-bold text-gray-900">{projectStats.progress}%</span>
              </div>
              <Progress value={projectStats.progress} className="h-3 bg-gray-200" />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>
                  {projectStats.completed} of {projectStats.total} milestones completed
                </span>
                <span>{projectStats.total - projectStats.completed} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Client Info */}
      <Card className="shadow-lg border-0 bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <User className="h-5 w-5 text-blue-600" />
            Client Information
          </CardTitle>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 bg-blue-100 border-2 border-blue-200">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-lg">
                {project.client_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-lg text-gray-900">{project.client_name}</div>
              <div className="text-sm text-gray-600">{project.client_company}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">{project.client_email}</span>
            </div>
            {project.client_phone !== "N/A" && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{project.client_phone}</span>
              </div>
            )}
            {project.client_company !== "N/A" && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{project.client_company}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{project.review_count}</div>
                <div className="text-xs text-gray-600">Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {project.average_rating > 0 ? project.average_rating : "N/A"}
                </div>
                <div className="text-xs text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
