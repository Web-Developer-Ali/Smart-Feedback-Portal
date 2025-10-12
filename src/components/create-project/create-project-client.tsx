"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ProjectDetailsStep,
  BudgetTimelineStep,
  ClientInfoStep,
} from "./form-steps";
import {
  type ProjectFormData,
  type Milestone,
  validateFormStep,
  createProjectSchema,
} from "@/lib/validations/create_project";
import { z } from "zod";
import { MilestonesStep } from "@/components/create-project/milestones-step";

interface HandleInputChange {
  (field: string | number | symbol, value: unknown): void;
}

interface HandleMilestoneChange {
  (index: number, field: keyof Milestone, value: unknown): void;
}
const TOTAL_STEPS = 4;

export function CreateProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
    name: "",
    type: undefined,
    description: "",
    project_budget: 0,
    estimated_days: 0,
    client_name: "",
    client_email: "",
    milestones: [
      {
        name: "",
        duration_days: 0,
        milestone_price: 0,
        description: "",
        free_revisions: 2,
        revision_rate: 50,
      },
    ],
  });

  // Calculate total milestone price
  const totalMilestonePrice =
    formData.milestones?.reduce(
      (sum, m) => sum + (m.milestone_price || 0),
      0
    ) || 0;
  const budgetDifference = formData.project_budget
    ? Math.abs(totalMilestonePrice - formData.project_budget)
    : 0;
  const isWithinBudget = formData.project_budget
    ? budgetDifference <= formData.project_budget * 0.1
    : true;

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleInputChange: HandleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear field-specific errors when user starts typing
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleMilestoneChange: HandleMilestoneChange = useCallback(
    (index, field, value) => {
      setFormData((prev) => {
        const updatedMilestones = [...(prev.milestones || [])];
        updatedMilestones[index] = {
          ...updatedMilestones[index],
          [field]: value,
        };
        return {
          ...prev,
          milestones: updatedMilestones,
        };
      });

      // Clear milestone-specific errors
      const errorKey = `milestones.${index}.${field}`;
      if (errors[errorKey]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const addMilestone = useCallback(() => {
    if (formData.milestones && formData.milestones.length >= 10) {
      toast.error("Maximum 10 milestones allowed");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...(prev.milestones || []),
        {
          name: "",
          duration_days: 0,
          milestone_price: 0,
          description: "",
          free_revisions: 1,
          revision_rate: 20,
        },
      ],
    }));
  }, [formData.milestones]);

  const removeMilestone = useCallback(
    (index: number) => {
      if (!formData.milestones || formData.milestones.length <= 1) {
        toast.error("At least one milestone is required");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        milestones: prev.milestones?.filter((_, i) => i !== index) || [],
      }));

      // Clear errors for removed milestone
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith(`milestones.${index}.`)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    },
    [formData.milestones]
  );

  const nextStep = useCallback(() => {
    const validation = validateFormStep(currentStep, formData);

    if (!validation.success) {
      setErrors(validation.errors);

      // Show the first error in toast
      const firstError = Object.values(validation.errors)[0];
      if (firstError) {
        toast.error("Please fix the following issue:", {
          description: firstError,
        });
      }

      return;
    }

    setErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }, [currentStep, formData]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({}); // Clear errors when going back
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      // Final validation
      const validatedData = createProjectSchema.parse(formData);
      setLoading(true);
      setErrors({});

      // Call the API endpoint using Axios
      const { data } = await axios.post(
        "/api/project/create_project",
        validatedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Project created successfully!", {
        action: {
          label: "View Project",
          onClick: () => router.push(`/project_detail/${data.project_id}`),
        },
      });

      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error creating project:", error);

      if (axios.isAxiosError(error)) {
        // Handle API errors
        const errorData = error.response?.data;

        if (error.response?.status === 422 && errorData?.details) {
          // Handle Zod validation errors from API
          const flattenedErrors = errorData.details.fieldErrors;
          const errorMessages = Object.values(flattenedErrors).flat();

          toast.error("Validation errors occurred", {
            description: errorMessages.join("\n"),
          });

          setErrors(flattenedErrors);
        } else {
          // Handle other API errors
          toast.error(errorData?.error || "Failed to create project");
        }
      } else if (error instanceof z.ZodError) {
        // Handle client-side validation errors
        const errorMessages = error.errors.map((err) => err.message);

        toast.error("Please fix the following issues:", {
          description: errorMessages.join("\n"),
        });

        const newErrors = error.errors.reduce((acc, err) => {
          const path = err.path.join(".");
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>);

        setErrors(newErrors);
      } else if (error instanceof Error) {
        toast.error(`Failed to create project: ${error.message}`);
      } else {
        toast.error("Failed to create project. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [formData, router]);

  const renderStepContent = () => {
    const commonProps = {
      formData: formData as ProjectFormData,
      onInputChange: handleInputChange,
      errors,
    };

    switch (currentStep) {
      case 1:
        return <ProjectDetailsStep {...commonProps} />;
      case 2:
        return <BudgetTimelineStep {...commonProps} />;
      case 3:
        return <ClientInfoStep {...commonProps} />;
      case 4:
        return (
          <MilestonesStep
            {...commonProps}
            onMilestoneChange={handleMilestoneChange}
            onAddMilestone={addMilestone}
            onRemoveMilestone={removeMilestone}
            totalMilestonePrice={totalMilestonePrice}
            isWithinBudget={isWithinBudget}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Create New Project",
            description:
              "Create a new project with milestones, budget tracking, and client collaboration features.",
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/create_projects`,
            isPartOf: {
              "@type": "WebSite",
              name: "Smart Feedback Portal",
              url: process.env.NEXT_PUBLIC_SITE_URL,
            },
          }),
        }}
      />

      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard/projects">
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create Project</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
              {/* Progress Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/projects")}
                    className="flex items-center gap-2 hover:bg-white/50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back to Projects</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                  <div className="text-sm text-gray-600 font-medium">
                    Step {currentStep} of {TOTAL_STEPS}
                  </div>
                </div>
                <Progress
                  value={progress}
                  className="h-2 bg-gray-200"
                  aria-label={`Progress: Step ${currentStep} of ${TOTAL_STEPS}`}
                />
              </div>

              {/* Main Content */}
              <Card className="w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  {renderStepContent()}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 bg-white/50 hover:bg-white/70 order-2 sm:order-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentStep < TOTAL_STEPS ? (
                  <Button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 order-1 sm:order-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Create Project
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
