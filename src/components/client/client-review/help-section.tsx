import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageSquare } from "lucide-react";

interface HelpSectionProps {
  projectId: string;
}

export function HelpSection({ projectId }: HelpSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HelpCircle className="h-5 w-5" />
          <span>Need Help?</span>
        </CardTitle>
        <CardDescription>Have questions about this project?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">
          If you have any questions or concerns about the milestones,
          deliverables, or project progress, please reach out to the freelancer
          or contact support.
        </p>
        <Button variant="outline" className="w-full bg-transparent" asChild>
          <a href={`/client/messages/${projectId}`}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Freelancer
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
