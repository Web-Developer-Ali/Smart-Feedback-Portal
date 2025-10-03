-- =============================================
-- Project Activities Table
-- =============================================
CREATE TABLE project_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  project_id   UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  performed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Activity details
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
  description TEXT NOT NULL CHECK (char_length(trim(description)) BETWEEN 5 AND 1000),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_project_activities_project_id 
  ON project_activities(project_id);

CREATE INDEX idx_project_activities_milestone_id 
  ON project_activities(milestone_id);

CREATE INDEX idx_project_activities_activity_type 
  ON project_activities(activity_type);

CREATE INDEX idx_project_activities_performed_by 
  ON project_activities(performed_by);

CREATE INDEX idx_project_activities_created_at 
  ON project_activities(created_at DESC);

-- JSONB index for flexible queries
CREATE INDEX idx_project_activities_metadata 
  ON project_activities USING GIN (metadata);

-- =============================================
-- Trigger: Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_project_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_project_activities_updated_at
BEFORE UPDATE ON project_activities
FOR EACH ROW
EXECUTE FUNCTION update_project_activities_updated_at();
