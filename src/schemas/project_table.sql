-- =============================================
-- Project Table
-- =============================================
CREATE TABLE project (
  -- Core project fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 3),
  type TEXT,
  description TEXT,
  client_name TEXT,
  client_email TEXT CHECK (
    client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),

  -- Relationships
  agency_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Project details
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  project_price NUMERIC(12, 2) CHECK (project_price >= 0),
  project_duration_days INTEGER CHECK (project_duration_days > 0),
  deadline TIMESTAMPTZ, -- optional deadline support
  is_archived BOOLEAN DEFAULT FALSE, -- soft delete flag

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Optional full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      COALESCE(name, '') || ' ' ||
      COALESCE(description, '') || ' ' ||
      COALESCE(client_name, '')
    )
  ) STORED
);

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX idx_project_agency_id ON project (agency_id);
CREATE INDEX idx_project_created_at ON project (created_at DESC);
CREATE INDEX idx_project_status ON project (status);
CREATE INDEX idx_project_created_at ON project (created_at DESC);
CREATE INDEX idx_project_search ON project USING GIN(search_vector);
CREATE INDEX idx_project_archived ON project (is_archived);

-- =============================================
-- Reusable Auto-update Trigger for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_project_updated_at
BEFORE UPDATE ON project
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();