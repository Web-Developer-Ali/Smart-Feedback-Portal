import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectOverviewProps } from "@/types/client-review"

export function ProjectOverview({ title, totalAmount, description, type, status }: ProjectOverviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200"
      case "in_progress":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="mb-8">
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <CardTitle className="text-2xl lg:text-3xl text-gray-900">{title}</CardTitle>
                <div className="flex gap-2">
                  <span className="px-3 py-1 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-full">
                    {type}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium border rounded-full ${getStatusColor(status)}`}>
                    {formatStatus(status)}
                  </span>
                </div>
              </div>
              <CardDescription className="text-gray-600 text-base leading-relaxed">{description}</CardDescription>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ${totalAmount}
              </p>
              <p className="text-sm text-gray-600">Total Project Value</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
