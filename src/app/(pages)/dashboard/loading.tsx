import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-indigo-400 opacity-20"></div>
        </div>
        <span className="text-lg font-medium text-gray-700">Loading your dashboard...</span>
      </div>
    </main>
  )
}
