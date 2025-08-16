import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>

          <p className="text-gray-600 mb-6 leading-relaxed">
            The project you're looking for doesn't exist or you don't have permission to view it.
          </p>

          <Link href="/dashboard/projects">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
