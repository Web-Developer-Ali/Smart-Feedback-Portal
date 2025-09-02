CREATE TABLE media_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- File metadata (optional arrays)
  public_ids TEXT[],
  secure_urls TEXT[],

  -- Required submission notes
  submission_notes TEXT NOT NULL,

  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_attachments_milestone ON media_attachments(milestone_id);
CREATE INDEX idx_media_attachments_project ON media_attachments(project_id);
CREATE INDEX idx_media_attachments_uploaded_by ON media_attachments(uploaded_by);
CREATE INDEX idx_media_attachments_uploaded_at ON media_attachments(uploaded_at);