import { Metadata } from "next";
import { ReviewsPageClient } from "./ReviewsPageClient";

export const metadata: Metadata = {
  title: "Client Reviews Dashboard | Your Agency Name",
  description: "View and manage client reviews, ratings, and feedback for your projects. Track your agency's performance and client satisfaction.",
  keywords: "client reviews, ratings, feedback, customer satisfaction, agency performance",
  openGraph: {
    title: "Client Reviews Dashboard",
    description: "Manage and view client reviews for your agency projects",
    type: "website",
  },
};

export default function ReviewsPage() {
  return <ReviewsPageClient />;
}