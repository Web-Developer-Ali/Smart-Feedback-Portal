import type { Metadata } from "next"
import ProjectsClient from "./projects-client"

export const metadata: Metadata = {
  title: "Projects Dashboard | Manage Your Projects",
  description:
    "View and manage all your projects in one place. Track project status, filter by type, and monitor progress with comprehensive project analytics.",
  keywords: ["projects", "dashboard", "project management", "analytics", "business"],
  openGraph: {
    title: "Projects Dashboard | Manage Your Projects",
    description:
      "View and manage all your projects in one place. Track project status, filter by type, and monitor progress with comprehensive project analytics.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects Dashboard | Manage Your Projects",
    description:
      "View and manage all your projects in one place. Track project status, filter by type, and monitor progress with comprehensive project analytics.",
  },
}

export default function ProjectsPage() {
  return (
    <main>
      <ProjectsClient />
    </main>
  )
}
