-- =============================================
-- Milestones Table
-- =============================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  -- Core fields
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  description TEXT,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  priority INTEGER DEFAULT 0 CHECK (priority >= 0);
  starting_notes TEXT;
    -- Pricing
  milestone_price NUMERIC(10,2) NOT NULL CHECK (milestone_price >= 0),
  is_payment_cleared BOOLEAN NOT NULL DEFAULT FALSE,
  free_revisions INTEGER NOT NULL DEFAULT 0 CHECK (free_revisions >= 0),
  revision_rate NUMERIC(10,2) DEFAULT 0 CHECK (revision_rate >= 0),
  used_revisions INTEGER NOT NULL DEFAULT 0 CHECK (used_revisions >= 0),

  -- Status
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started','in_progress','submitted','approved','rejected')),

  -- Soft delete
  is_archived BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Optional full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      COALESCE(title, '') || ' ' ||
      COALESCE(description, '')
    )
  ) STORED
);

-- =============================================
-- Indexes
-- =============================================

-- General foreign key lookup
CREATE INDEX idx_milestones_project_id ON milestones(project_id);

-- Common filters
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_payment_cleared ON milestones(is_payment_cleared);
CREATE INDEX idx_milestones_archived ON milestones(is_archived);

-- Partial indexes for frequent queries
CREATE INDEX idx_milestones_uncleared_payments 
  ON milestones(project_id) 
  WHERE is_payment_cleared = FALSE;

CREATE INDEX idx_milestones_pending_status 
  ON milestones(project_id, status) 
  WHERE status IN ('not_started', 'submitted');

-- Composite for status + payment filtering
CREATE INDEX idx_milestones_status_payment 
  ON milestones(status, is_payment_cleared);

-- Full-text search
CREATE INDEX idx_milestones_search ON milestones USING GIN(search_vector);

-- =============================================
-- Auto-update updated_at
-- =============================================
CREATE TRIGGER trg_update_milestones_updated_at
BEFORE UPDATE ON milestones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();