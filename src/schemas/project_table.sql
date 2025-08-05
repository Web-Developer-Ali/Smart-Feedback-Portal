CREATE TABLE "project" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  agency_id UUID NOT NULL REFERENCES "profiles"(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  project_price NUMERIC(12, 2) CHECK (project_price >= 0),
  project_duration_days INTEGER CHECK (project_duration_days > 0),
  review_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_review_token CHECK (review_token ~ '^[a-zA-Z0-9]{20,}$')
);

-- Create index for frequently queried columns
CREATE INDEX idx_project_agency_id ON "project" (agency_id);
CREATE INDEX idx_project_status ON "project" (status);
CREATE INDEX idx_project_created_at ON "project" (created_at);

-- Update trigger
CREATE OR REPLACE FUNCTION update_project_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_updated_at
BEFORE UPDATE ON "project"
FOR EACH ROW
EXECUTE FUNCTION update_project_updated_at();