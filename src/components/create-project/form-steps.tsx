"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, DollarSign, FileText } from 'lucide-react'
import { PROJECT_TYPES } from "@/lib/validations/create_project"
import { FormStepProps } from "@/types/create_projects"

export function ProjectDetailsStep({ formData, onInputChange, errors }: FormStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Briefcase className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Project Details</h2>
        <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
          Let's start with the basic information about your project
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Project Name *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={(e) => onInputChange("name", e.target.value)}
            placeholder="Enter a descriptive project name"
            className={`mt-2 ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
            aria-describedby={errors.name ? "name-error" : undefined}
            maxLength={100}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="type" className="text-sm font-medium text-gray-700">
            Project Type *
          </Label>
          <Select 
            value={formData.type || ""} 
            onValueChange={(value) => onInputChange("type", value)}
          >
            <SelectTrigger 
              className={`mt-2 ${errors.type ? "border-red-500 focus:border-red-500" : ""}`}
              aria-describedby={errors.type ? "type-error" : undefined}
            >
              <SelectValue placeholder="Select the type of project" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p id="type-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.type}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Project Description *
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={(e) => onInputChange("description", e.target.value)}
            placeholder="Provide a detailed description of your project goals, requirements, and expectations"
            rows={4}
            className={`mt-2 resize-none ${errors.description ? "border-red-500 focus:border-red-500" : ""}`}
            aria-describedby={errors.description ? "description-error" : undefined}
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p id="description-error" className="text-sm text-red-600" role="alert">
                {errors.description}
              </p>
            ) : (
              <div />
            )}
            <span className="text-xs text-gray-500">
              {(formData.description || "").length}/1000
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BudgetTimelineStep({ formData, onInputChange, errors }: FormStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <DollarSign className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Budget & Timeline</h2>
        <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
          Set your project budget and estimated timeline
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
            Project Budget (USD) *
          </Label>
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <Input
              id="budget"
              name="budget"
              type="number"
              min="100"
              max="1000000"
              step="50"
              value={formData.project_budget || ""}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : null
                onInputChange("project_budget", value)
              }}
              placeholder="10000"
              className={`pl-8 ${errors.project_budget ? "border-red-500 focus:border-red-500" : ""}`}
              aria-describedby={errors.project_budget ? "budget-error" : undefined}
            />
          </div>
          {errors.project_budget && (
            <p id="budget-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.project_budget}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter the total project budget (minimum $100)
          </p>
        </div>

        <div>
          <Label htmlFor="days" className="text-sm font-medium text-gray-700">
            Estimated Duration (Days) *
          </Label>
          <Input
            id="days"
            name="days"
            type="number"
            min="1"
            max="365"
            step="1"
            value={formData.estimated_days || ""}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null
              onInputChange("estimated_days", value)
            }}
            placeholder="30"
            className={`mt-2 ${errors.estimated_days ? "border-red-500 focus:border-red-500" : ""}`}
            aria-describedby={errors.estimated_days ? "days-error" : undefined}
          />
          {errors.estimated_days && (
            <p id="days-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.estimated_days}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Estimated number of days to complete the project
          </p>
        </div>
      </div>
    </div>
  )
}

export function ClientInfoStep({ formData, onInputChange, errors }: FormStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <FileText className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Client Information</h2>
        <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
          Add your client's contact information
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="client_name" className="text-sm font-medium text-gray-700">
            Client Name *
          </Label>
          <Input
            id="client_name"
            name="client_name"
            value={formData.client_name || ""}
            onChange={(e) => onInputChange("client_name", e.target.value)}
            placeholder="John Smith"
            className={`mt-2 ${errors.client_name ? "border-red-500 focus:border-red-500" : ""}`}
            aria-describedby={errors.client_name ? "client-name-error" : undefined}
            maxLength={50}
          />
          {errors.client_name && (
            <p id="client-name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.client_name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="client_email" className="text-sm font-medium text-gray-700">
            Client Email *
          </Label>
          <Input
            id="client_email"
            name="client_email"
            type="email"
            value={formData.client_email || ""}
            onChange={(e) => onInputChange("client_email", e.target.value)}
            placeholder="john@company.com"
            className={`mt-2 ${errors.client_email ? "border-red-500 focus:border-red-500" : ""}`}
            aria-describedby={errors.client_email ? "client-email-error" : undefined}
            maxLength={100}
          />
          {errors.client_email && (
            <p id="client-email-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.client_email}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This email will be used to send project updates and review requests
          </p>
        </div>
      </div>
    </div>
  )
}
