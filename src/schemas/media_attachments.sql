CREATE TABLE media_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  public_id TEXT NOT NULL CHECK (public_id <> ''),
  secure_url TEXT NOT NULL CHECK (secure_url ~ '^https://'),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
  CONSTRAINT unique_public_id_per_project UNIQUE (project_id, public_id)
);

-- Keep these indexes for query performance
CREATE INDEX idx_media_attachments_milestone ON media_attachments(milestone_id);
CREATE INDEX idx_media_attachments_project ON media_attachments(project_id);