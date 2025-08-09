CREATE TABLE "project" (
  -- Core project fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  ADD COLUMN client_name TEXT;
  ADD COLUMN client_email TEXT;
  -- Relationships
  agency_id UUID NOT NULL REFERENCES "profiles"(id) ON DELETE CASCADE,
  
  -- Project details
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  project_price NUMERIC(12, 2) CHECK (project_price >= 0),
  project_duration_days INTEGER CHECK (project_duration_days > 0),
  
  -- JWT token field
  jwt_token TEXT UNIQUE NOT NULL CHECK (
    jwt_token ~ '^[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]*$'
  ),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Client information
  client_name TEXT,
  client_email TEXT
);

-- Indexes for performance
CREATE INDEX idx_project_agency_id ON "project" (agency_id);
CREATE INDEX idx_project_status ON "project" (status);
CREATE INDEX idx_project_created_at ON "project" (created_at);
CREATE INDEX idx_project_jwt_token ON "project" (jwt_token);

-- Auto-update trigger for timestamps
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