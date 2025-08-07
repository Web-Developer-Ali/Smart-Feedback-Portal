import { Metadata } from 'next'
import { CreateProjectPage } from '@/components/create-project/create-project-client'

export const metadata: Metadata = {
  title: "Create New Project | Smart Feedback Portal",
  description: "Create a new project with milestones, budget tracking, and client collaboration features. Streamline your project management workflow.",
  keywords: "project creation, project management, client collaboration, milestones, budget tracking",
  openGraph: {
    title: "Create New Project | Smart Feedback Portal",
    description: "Create a new project with milestones, budget tracking, and client collaboration features.",
    type: "website",
  },
}

export default function Page() {
  return <CreateProjectPage />
}