-- Create project_activities table
CREATE TABLE project_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'project_created',
    'project_updated',
    'project_deleted',
    'milestone_created',
    'milestone_updated',
    'milestone_deleted',
    'milestone_started',
    'milestone_submitted',
    'milestone_approved',
    'milestone_rejected',
    'review_submitted',
    'file_uploaded',
    'status_changed',
    'payment_processed',
    'client_notified',
    'comment_added'
  )),
  description TEXT NOT NULL,
  performed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_project_activities_project_id ON project_activities(project_id);
CREATE INDEX idx_project_activities_milestone_id ON project_activities(milestone_id);
CREATE INDEX idx_project_activities_activity_type ON project_activities(activity_type);
CREATE INDEX idx_project_activities_performed_by ON project_activities(performed_by);
CREATE INDEX idx_project_activities_created_at ON project_activities(created_at);

-- Create index for metadata if you need to query specific fields
CREATE INDEX idx_project_activities_metadata ON project_activities USING GIN (metadata);

-- Enable Row Level Security (RLS) if needed
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see activities for projects they own
CREATE POLICY "Users can view activities for their projects" 
ON project_activities 
FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM project WHERE agency_id = auth.uid()
  )
);

-- Create policy to allow system to insert activities
CREATE POLICY "System can insert activities" 
ON project_activities 
FOR INSERT 
WITH CHECK (true);

-- Create policy to prevent updates and deletes (activities are append-only)
CREATE POLICY "Activities are append-only" 
ON project_activities 
FOR UPDATE 
USING (false);

CREATE POLICY "Activities cannot be deleted" 
ON project_activities 
FOR DELETE 
USING (false);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_activities_updated_at
  BEFORE UPDATE ON project_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();