import { Calendar, Trash2, Settings } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MilestoneStepProps } from "@/types/create_projects";

export function MilestonesStep({
  formData,
  onMilestoneChange,
  onAddMilestone,
  onRemoveMilestone,
  errors,
  totalMilestonePrice,
  isWithinBudget
}: MilestoneStepProps & {
  totalMilestonePrice: number
  isWithinBudget: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Project Milestones</h2>
        <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
          Break down your project into manageable milestones
        </p>
      </div>

      {/* Budget Summary */}
      {formData.project_budget && (
        <Card className={`p-4 ${!isWithinBudget ? "border-amber-300 bg-amber-50" : "border-green-300 bg-green-50"}`}>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {/* Budget Section */}
            <div className="font-medium">Total Milestone Prices:</div>
            <div className="font-bold text-right">
              ${totalMilestonePrice.toLocaleString()}
            </div>
            
            <div className="font-medium">Project Budget:</div>
            <div className="font-bold text-right">
              ${formData.project_budget?.toLocaleString() ?? '0'}
            </div>
            
            <div className="font-medium">Budget Difference:</div>
            <div className={`font-bold text-right ${
              totalMilestonePrice > (formData.project_budget ?? 0) 
                ? "text-red-600" 
                : !isWithinBudget 
                  ? "text-amber-600" 
                  : "text-green-600"
            }`}>
              ${Math.abs(totalMilestonePrice - (formData.project_budget ?? 0)).toLocaleString()}
              {totalMilestonePrice > (formData.project_budget ?? 0) ? " over" : " under"}
            </div>
            
            <div className="font-medium">Allowed Budget Range:</div>
            <div className="font-bold text-right">
              $0 - ${formData.project_budget.toLocaleString()}
            </div>

            {/* Duration Section */}
            <div className="font-medium">Total Milestone Days:</div>
            <div className="font-bold text-right">
              {formData.milestones?.reduce((sum, m) => sum + (m.duration_days ?? 0), 0) ?? 0} days
            </div>
            
            <div className="font-medium">Project Duration:</div>
            <div className="font-bold text-right">
              {formData.estimated_days?.toLocaleString() ?? '0'} days
            </div>
            
            <div className="font-medium">Duration Remaining:</div>
            <div className={`font-bold text-right ${
              (formData.milestones?.reduce((sum, m) => sum + (m.duration_days ?? 0), 0) ?? 0) > (formData.estimated_days ?? 0)
                ? "text-red-600"
                : "text-green-600"
            }`}>
              {Math.abs(
                (formData.estimated_days ?? 0) - 
                (formData.milestones?.reduce((sum, m) => sum + (m.duration_days ?? 0), 0) ?? 0)
              )} days
              {(formData.milestones?.reduce((sum, m) => sum + (m.duration_days ?? 0), 0) ?? 0) > (formData.estimated_days ?? 0)
                ? " over"
                : " under"}
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {formData.milestones?.map((milestone, index) => (
          <Card key={index} className="p-6 border-2 border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Milestone {index + 1}
              </h3>
              {formData.milestones && formData.milestones.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onRemoveMilestone(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Milestone Name *
                </Label>
                <Input
                  value={milestone.name || ""}
                  onChange={(e) => onMilestoneChange(index, "name", e.target.value)}
                  placeholder="e.g., Design Phase"
                  className={`mt-2 ${errors[`milestones.${index}.name`] ? "border-red-500" : ""}`}
                  maxLength={100}
                />
                {errors[`milestones.${index}.name`] && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors[`milestones.${index}.name`]}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Duration (Days) *
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="90"
                  step="1"
                  value={milestone.duration_days || ""}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : 0
                    onMilestoneChange(index, "duration_days", value)
                  }}
                  placeholder="7"
                  className={`mt-2 ${errors[`milestones.${index}.duration_days`] ? "border-red-500" : ""}`}
                />
                {errors[`milestones.${index}.duration_days`] && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors[`milestones.${index}.duration_days`]}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Price (USD) *
                </Label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    type="number"
                    min="50"
                    max="100000"
                    step="50"
                    value={milestone.milestone_price || ""}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : 0
                      onMilestoneChange(index, "milestone_price", value)
                    }}
                    placeholder="2500"
                    className={`pl-8 ${errors[`milestones.${index}.milestone_price`] ? "border-red-500" : ""}`}
                  />
                </div>
                {errors[`milestones.${index}.milestone_price`] && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors[`milestones.${index}.milestone_price`]}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">
                  Description (Optional)
                </Label>
                <Textarea
                  value={milestone.description || ""}
                  onChange={(e) => onMilestoneChange(index, "description", e.target.value)}
                  placeholder="Describe what will be delivered in this milestone"
                  rows={2}
                  className="mt-2 resize-none"
                  maxLength={500}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">
                    {(milestone.description || "").length}/500
                  </span>
                </div>
              </div>

              {/* Revision Settings - Always Visible */}
              <div className="md:col-span-2 mt-4">
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Revision Policy for this Milestone
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-blue-700" htmlFor={`free-revisions-${index}`}>
                        Free Revisions
                      </Label>
                      <Input
                        id={`free-revisions-${index}`}
                        type="number"
                        min="0"
                        max="10"
                        value={milestone.free_revisions ?? 2}
                        onChange={(e) => onMilestoneChange(index, "free_revisions", Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700" htmlFor={`revision-rate-${index}`}>
                        Rate After Limit ($)
                      </Label>
                      <Input
                        id={`revision-rate-${index}`}
                        type="number"
                        min="0"
                        max="1000"
                        value={milestone.revision_rate ?? 50}
                        onChange={(e) => onMilestoneChange(index, "revision_rate", Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    Client gets {milestone.free_revisions ?? 2} free revisions for this milestone, 
                    then ${milestone.revision_rate ?? 50} per additional change.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {errors.milestones && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {errors.milestones}
          </p>
        )}

        <Button 
          variant="outline" 
          onClick={onAddMilestone} 
          className="w-full bg-transparent border-dashed border-2 hover:bg-gray-50"
          disabled={formData.milestones && formData.milestones.length >= 10}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Add Another Milestone
          {formData.milestones && formData.milestones.length >= 10 && (
            <span className="ml-2 text-xs text-gray-500">(Max 10)</span>
          )}
        </Button>
      </div>
    </div>
  )
}
