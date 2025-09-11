import type { Metadata } from "next"
import AnalyticsPageClient from "./analytics-client"

export const metadata: Metadata = {
  title: "Analytics Dashboard | Business Performance Metrics",
  description:
    "Track your business performance, growth metrics, project analytics, and client satisfaction ratings with comprehensive dashboard insights.",
  keywords: ["analytics", "dashboard", "business metrics", "performance tracking", "project analytics"],
  openGraph: {
    title: "Analytics Dashboard | Business Performance Metrics",
    description: "Track your business performance and growth metrics with comprehensive analytics.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Analytics Dashboard | Business Performance Metrics",
    description: "Track your business performance and growth metrics with comprehensive analytics.",
  },
}

export default function AnalyticsPage() {
  return <AnalyticsPageClient />
}
