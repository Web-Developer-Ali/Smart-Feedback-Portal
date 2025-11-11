import type { Metadata } from "next"
import { DashboardClient } from "./dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard - WorkSpan",
  description:
    "Manage your projects, track performance metrics, and view client feedback in your comprehensive agency dashboard.",
  keywords: ["dashboard", "project management", "client feedback", "analytics", "agency portal"],
  openGraph: {
    title: "Dashboard - WorkSpan",
    description:
      "Manage your projects, track performance metrics, and view client feedback in your comprehensive agency dashboard.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard - WorkSpan",
    description:
      "Manage your projects, track performance metrics, and view client feedback in your comprehensive agency dashboard.",
  },
}

export default function DashboardPage() {
  return (
    <main>
      <DashboardClient />
    </main>
  )
}
