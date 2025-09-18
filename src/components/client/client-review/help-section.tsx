import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HelpSection() {
  return (
    <Card className="bg-white border border-gray-200 shadow-lg w-full max-w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-gray-900">Need Help?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm md:text-base">
          <p className="text-gray-600 leading-relaxed">
            Having issues with a milestone? Contact support or communicate directly with your freelancer.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-0 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent transition-colors duration-200"
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-0 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent transition-colors duration-200"
            >
              Message Freelancer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
