CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  milestone_id UUID NULL,
  stars SMALLINT NOT NULL,
  review TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Foreign key constraints
  CONSTRAINT fk_reviews_project 
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_milestone 
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    
  -- Data validation
  CONSTRAINT valid_stars CHECK (stars BETWEEN 1 AND 5),
  CONSTRAINT valid_review_length CHECK (length(trim(review)) BETWEEN 10 AND 2000),
  
  -- Unique constraint to prevent duplicate milestone reviews
  CONSTRAINT unique_milestone_review UNIQUE NULLS NOT DISTINCT (project_id, milestone_id)
) WITH (
  autovacuum_enabled = true,
  autovacuum_vacuum_scale_factor = 0.05,
  toast.autovacuum_enabled = true
);
COMMIT;
-- Run second
BEGIN;
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
COMMIT;
 -- Run third run these indexes separately to avoid lock contention
 -- 1. Index for project-wide reviews
CREATE INDEX CONCURRENTLY idx_reviews_project_milestone_null 
ON reviews(project_id) 
WHERE milestone_id IS NULL;

-- 2. Index for milestone-specific reviews
CREATE INDEX CONCURRENTLY idx_reviews_project_milestone_not_null 
ON reviews(project_id, milestone_id) 
WHERE milestone_id IS NOT NULL;

-- 3. Compound index for rating analysis
CREATE INDEX CONCURRENTLY idx_reviews_rating_compound 
ON reviews(project_id, stars, created_at DESC);

-- 4. Covering index for timeline queries
CREATE INDEX CONCURRENTLY idx_reviews_created_covering 
ON reviews(created_at DESC) 
INCLUDE (project_id, stars);