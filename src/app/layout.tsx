import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  // Remove preload: true as next/font handles this automatically
  fallback: ["system-ui", "arial"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4ed8" },
  ],
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://www.workspan.io"
  ),
  title: {
    default:
      "WorkSpan - Professional Project Management & Client Collaboration Platform",
    template: "%s | WorkSpan",
  },
  description:
    "Transform your project delivery with Smart Feedback Portal. Track milestones, collect client feedback, manage revisions, and streamline collaboration. Trusted by 10,000+ agencies worldwide. Start your free trial today!",
  applicationName: "WorkSpan",
  authors: [
    {
      name: "WorkSpan Team",
      url: "https://www.workspan.io",
    },
  ],
  generator: "Next.js",
  keywords: [
    "project management software",
    "client feedback platform",
    "milestone tracking",
    "project collaboration",
    "agency management tool",
    "client portal",
    "project delivery",
    "feedback collection",
    "revision management",
    "real-time collaboration",
    "project analytics",
    "client communication",
    "freelancer tools",
    "project tracking",
    "team collaboration",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Smart Feedback Portal",
  publisher: "Smart Feedback Portal",
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
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
      "en-GB": "/en-GB",
      "en-CA": "/en-CA",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "WorkSpan",
    title: "WorkSpan - Professional Project Management Platform",
    description:
      "Transform your project delivery with intelligent milestone tracking, seamless client feedback, and real-time collaboration. Join 10,000+ successful agencies.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Smart Feedback Portal - Project Management Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@WorkSpan",
    creator: "@WorkSpan",
    title: "WorkSpan - Professional Project Management Platform",
    description:
      "Transform your project delivery with intelligent milestone tracking and seamless client feedback. Trusted by 10,000+ agencies worldwide.",
    images: ["/twitter-image.jpg"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
    other: {
      "msvalidate.01": process.env.BING_VERIFICATION || "",
    },
  },
  category: "Business Software",
  classification: "Project Management Platform",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Smart Feedback Portal",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#2563eb",
    "msapplication-config": "/browserconfig.xml",
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="apple-mobile-web-app-title"
          content="Smart Feedback Portal"
        />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* REMOVED the manual font preload - next/font handles this automatically */}

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

        {/* Rich snippets and structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Smart Feedback Portal",
              url: process.env.NEXT_PUBLIC_SITE_URL,
              description:
                "Professional project management and client feedback platform for agencies and freelancers.",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "29",
                priceCurrency: "USD",
                category: "SaaS",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                reviewCount: "2847",
              },
            }),
          }}
        />
        
        {/* Remove the manual style injection - next/font handles this */}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">         
        <Providers>
          {children}
           <Toaster />
        </Providers>
      </body>
    </html>
  );
}