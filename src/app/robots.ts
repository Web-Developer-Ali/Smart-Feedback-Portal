import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfeedbackportal.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/dashboard",
          "/features",
          "/pricing",
          "/about",
          "/contact",
          "/help",
          "/docs",
          "/blog",
          "/login",
          "/register",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/dashboard/settings",
          "/dashboard/profile",
          "/feedback/", // Private feedback pages
          "*.json",
          "*.xml",
          "/tmp/",
          "/private/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/dashboard", "/features", "/pricing", "/about", "/contact", "/help", "/docs", "/blog"],
        disallow: ["/api/", "/admin/", "/dashboard/settings", "/dashboard/profile", "/feedback/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/dashboard", "/features", "/pricing", "/about", "/contact", "/help", "/docs", "/blog"],
        disallow: ["/api/", "/admin/", "/dashboard/settings", "/dashboard/profile", "/feedback/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
