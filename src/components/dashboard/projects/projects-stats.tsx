"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ProjectsStatsProps } from "@/types/dashboard";

export function ProjectsStats({ stats }: ProjectsStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-blue-100 text-sm">Total Projects</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl">
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.inProgress}</div>
          <p className="text-amber-100 text-sm">In Progress</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl">
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.completed}</div>
          <p className="text-emerald-100 text-sm">Completed</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl">
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.pending}</div>
          <p className="text-purple-100 text-sm">Pending</p>
        </CardContent>
      </Card>
    </div>
  );
}