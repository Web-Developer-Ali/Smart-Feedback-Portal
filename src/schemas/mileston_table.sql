-- Create the table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES project(id) NOT NULL,
  title TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'submitted', 'approved', 'rejected')),
  milestone_price NUMERIC(10,2) NOT NULL,
  is_payment_cleared BOOLEAN DEFAULT FALSE,
  free_revisions INTEGER DEFAULT 0,
  revision_rate NUMERIC(10,2),
  used_revisions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for optimal query performance
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_payment_cleared ON milestones(is_payment_cleared);
CREATE INDEX idx_milestones_created_at ON milestones(created_at);

-- Partial indexes for common query patterns
CREATE INDEX idx_milestones_uncleared_payments ON milestones(project_id) 
  WHERE is_payment_cleared = FALSE;
  
CREATE INDEX idx_milestones_pending_status ON milestones(project_id, status) 
  WHERE status IN ('not_started', 'submitted');

-- Composite index for status and payment queries
CREATE INDEX idx_milestones_status_payment ON milestones(status, is_payment_cleared);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_milestones_updated_at
BEFORE UPDATE ON milestones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();