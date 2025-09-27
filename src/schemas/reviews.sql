-- =============================================
-- Reviews Table
-- =============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,

  -- Content
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  review TEXT NOT NULL CHECK (char_length(trim(review)) BETWEEN 10 AND 100),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_milestone_review UNIQUE NULLS NOT DISTINCT (project_id, milestone_id)
);

-- =============================================
-- Trigger: Validate milestone belongs to project
-- =============================================
CREATE OR REPLACE FUNCTION validate_milestone_project()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.milestone_id IS NOT NULL THEN
    PERFORM 1 FROM milestones 
    WHERE id = NEW.milestone_id AND project_id = NEW.project_id
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Milestone % does not belong to project %', NEW.milestone_id, NEW.project_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_milestone_project
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION validate_milestone_project();

-- =============================================
-- Auto-update updated_at
-- =============================================
CREATE TRIGGER trg_update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Indexes
-- =============================================

-- 1. Project-wide reviews (milestone not linked)
CREATE INDEX idx_reviews_project_milestone_null 
  ON reviews(project_id) 
  WHERE milestone_id IS NULL;

-- 2. Milestone-specific reviews
CREATE INDEX idx_reviews_project_milestone_not_null 
  ON reviews(project_id, milestone_id) 
  WHERE milestone_id IS NOT NULL;

-- 3. Compound index for rating analysis
CREATE INDEX idx_reviews_rating_compound 
  ON reviews(project_id, stars, created_at DESC);

-- 4. Covering index for timeline queries
CREATE INDEX idx_reviews_created_covering 
  ON reviews(created_at DESC) 
  INCLUDE (project_id, stars);