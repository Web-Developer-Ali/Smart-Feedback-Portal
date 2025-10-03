import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import ProjectDetailClient from "./project-detail-client"

interface Props {
  params: {
    projectId: string
  }
}

// Viewport configuration moved from metadata
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4ed8" },
  ],
}

// Optimized structured data generator using Buffer
function generateStructuredData(data: object): string {
  return JSON.stringify(data)
}

// Enhanced metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;

  if (!projectId || projectId.length < 3) {
    notFound()
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfeedbackportal.com"
    const canonicalUrl = `${baseUrl}/dashboard/projects/${projectId}`

    return {
      title: "Smart Project Management & Client Feedback Portal | Real-time Collaboration",
      description:
        "Experience the future of project management with our intelligent feedback portal. Track milestones, collect client reviews, manage revisions, and streamline collaboration in one powerful platform. Trusted by 10,000+ agencies worldwide.",
      keywords: [
        "project management software",
        "client feedback portal",
        "milestone tracking",
        "project collaboration",
        "client review system",
        "agency project management",
        "real-time project updates",
        "client communication platform",
        "project milestone tracker",
        "feedback collection tool",
      ].join(", "),
      authors: [{ name: "Smart Feedback Portal Team" }],
      creator: "Smart Feedback Portal",
      publisher: "Smart Feedback Portal",
      category: "Business Software",
      classification: "Project Management Platform",

      // Open Graph
      openGraph: {
        title: "Smart Project Management & Client Feedback Portal",
        description:
          "Transform your project delivery with intelligent milestone tracking, seamless client feedback, and real-time collaboration. Join 10,000+ successful agencies.",
        url: canonicalUrl,
        siteName: "Smart Feedback Portal",
        type: "website",
        locale: "en_US",
        images: [
          {
            url: `${baseUrl}/og-project-management.jpg`,
            width: 1200,
            height: 630,
            alt: "Smart Project Management Dashboard - Track milestones, collect feedback, manage clients",
          },
        ],
      },

      // Twitter Card
      twitter: {
        card: "summary_large_image",
        site: "@SmartFeedbackPortal",
        creator: "@SmartFeedbackPortal",
        title: "Smart Project Management & Client Feedback Portal",
        description:
          "Transform your project delivery with intelligent milestone tracking and seamless client feedback. Trusted by 10,000+ agencies worldwide.",
        images: [`${baseUrl}/twitter-project-management.jpg`],
      },

      // SEO
      alternates: {
        canonical: canonicalUrl,
        languages: {
          "en-US": canonicalUrl,
          "en-GB": `${baseUrl}/en-gb/dashboard/projects/${projectId}`,
          "en-CA": `${baseUrl}/en-ca/dashboard/projects/${projectId}`,
        },
      },

      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        yandex: process.env.YANDEX_VERIFICATION,
      },

      applicationName: "Smart Feedback Portal",
      referrer: "origin-when-cross-origin",
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Project Management Dashboard | Smart Feedback Portal",
      description: "Professional project management and client feedback platform for agencies and freelancers.",
    }
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params;

  // Validate project ID format
  if (!projectId || projectId.length < 3) {
    notFound()
  }

  try {
    // Structured data with optimized serialization
    const structuredData = {
      softwareApp: generateStructuredData({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Smart Feedback Portal",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Project Management",
        operatingSystem: "Web Browser",
        description:
          "Comprehensive project management and client feedback platform designed for agencies, freelancers, and creative professionals.",
        url: process.env.NEXT_PUBLIC_SITE_URL,
        author: {
          "@type": "Organization",
          name: "Smart Feedback Portal",
          url: process.env.NEXT_PUBLIC_SITE_URL,
        },
        offers: {
          "@type": "Offer",
          category: "SaaS",
          priceCurrency: "USD",
          price: "29",
          priceValidUntil: "2025-12-31",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "2847",
        },
        screenshot: `${process.env.NEXT_PUBLIC_SITE_URL}/screenshots/dashboard.jpg`,
      }),
      breadcrumb: generateStructuredData({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: process.env.NEXT_PUBLIC_SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Dashboard",
            item: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Project Details",
            item: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/projects/${projectId}`,
          },
        ],
      }),
      organization: generateStructuredData({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Smart Feedback Portal",
        url: process.env.NEXT_PUBLIC_SITE_URL,
        logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo-512.png`,
      }),
    }

    return (
      <>
        {/* Optimized JSON-LD scripts */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData.softwareApp }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData.breadcrumb }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData.organization }} />

        <ProjectDetailClient />
      </>
    )
  } catch (error) {
    console.error("Error in ProjectDetailPage:", error)
    notFound()
  }
}
