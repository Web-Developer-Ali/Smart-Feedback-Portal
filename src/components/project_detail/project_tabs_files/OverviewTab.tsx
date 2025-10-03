import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Calendar } from "lucide-react";
import type { Project } from "@/types/api-projectDetails";

interface OverviewTabProps {
  project: Project;
  projectStats: {
    completed: number;
    total: number;
    progress: number;
  };
}

export default function OverviewTab({ project, projectStats }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProjectStatisticsCard projectStats={projectStats} />
      <ProjectTimelineCard project={project} />
    </div>
  );
}

function ProjectStatisticsCard({ projectStats }: { projectStats: OverviewTabProps['projectStats'] }) {
  return (
    <Card className="shadow-lg border-0 bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Project Statistics
        </CardTitle>
      </div>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="text-3xl font-bold text-blue-600">
              {projectStats.completed}
            </div>
            <div className="text-sm font-medium text-blue-700">Completed</div>
          </div>
          <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="text-3xl font-bold text-amber-600">
              {projectStats.total - projectStats.completed}
            </div>
            <div className="text-sm font-medium text-amber-700">Remaining</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-600">Overall Progress</span>
            <span className="font-bold text-gray-900">{projectStats.progress}%</span>
          </div>
          <Progress value={projectStats.progress} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectTimelineCard({ project }: { project: Project }) {
  return (
    <Card className="shadow-lg border-0 bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Calendar className="h-5 w-5 text-green-600" />
          Project Timeline
        </CardTitle>
      </div>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Project Started</span>
            <span className="font-bold text-gray-900">{project.created_at}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Last Updated</span>
            <span className="font-bold text-gray-900">{project.updated_at}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Estimated Duration</span>
            <span className="font-bold text-gray-900">{project.estimated_days} days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}