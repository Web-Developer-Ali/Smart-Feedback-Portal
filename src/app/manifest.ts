import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Smart Feedback Portal - Project Management & Client Collaboration",
    short_name: "Smart Feedback Portal",
    description:
      "Professional project management platform with intelligent client feedback, milestone tracking, and seamless collaboration tools for agencies and freelancers.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en-US",
    categories: ["business", "productivity", "collaboration"],

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],

    screenshots: [
      {
        src: "/screenshots/dashboard-wide.jpg",
        sizes: "1280x720",
        type: "image/jpeg",
        form_factor: "wide",
        label: "Smart Feedback Portal Dashboard - Desktop View",
      },
      {
        src: "/screenshots/dashboard-narrow.jpg",
        sizes: "750x1334",
        type: "image/jpeg",
        form_factor: "narrow",
        label: "Smart Feedback Portal Dashboard - Mobile View",
      },
      {
        src: "/screenshots/projects-wide.jpg",
        sizes: "1280x720",
        type: "image/jpeg",
        form_factor: "wide",
        label: "Project Management Interface - Desktop",
      },
      {
        src: "/screenshots/projects-narrow.jpg",
        sizes: "750x1334",
        type: "image/jpeg",
        form_factor: "narrow",
        label: "Project Management Interface - Mobile",
      },
    ],

    shortcuts: [
      {
        name: "Create New Project",
        short_name: "New Project",
        description: "Quickly create a new project with milestones",
        url: "/dashboard/projects/create",
        icons: [{ src: "/shortcuts/new-project.png", sizes: "96x96" }],
      },
      {
        name: "View Projects",
        short_name: "Projects",
        description: "View and manage all your projects",
        url: "/dashboard/projects",
        icons: [{ src: "/shortcuts/projects.png", sizes: "96x96" }],
      },
      {
        name: "Client Reviews",
        short_name: "Reviews",
        description: "Check latest client feedback and reviews",
        url: "/dashboard/reviews",
        icons: [{ src: "/shortcuts/reviews.png", sizes: "96x96" }],
      },
      {
        name: "Analytics",
        short_name: "Analytics",
        description: "View project analytics and performance metrics",
        url: "/dashboard/analytics",
        icons: [{ src: "/shortcuts/analytics.png", sizes: "96x96" }],
      },
    ],

    related_applications: [
      {
        platform: "webapp",
        url: "https://smartfeedbackportal.com/manifest.json",
      },
    ],

    prefer_related_applications: false,

    launch_handler: {
      client_mode: "navigate-existing",
    },
  }
}
