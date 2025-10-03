-- =============================================
-- Media Attachments Table
-- =============================================
CREATE TABLE media_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  project_id  UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- File metadata
  public_ids TEXT[] DEFAULT '{}', -- store multiple external IDs (e.g., Cloudinary, S3)
  file_names TEXT[] DEFAULT '{}', -- original filenames

  -- Submission notes
  submission_notes TEXT NOT NULL CHECK (char_length(trim(submission_notes)) BETWEEN 5 AND 500),

  -- Timestamps
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_media_attachments_milestone 
  ON media_attachments(milestone_id);

CREATE INDEX idx_media_attachments_project 
  ON media_attachments(project_id);

CREATE INDEX idx_media_attachments_uploaded_by 
  ON media_attachments(uploaded_by);

CREATE INDEX idx_media_attachments_uploaded_at 
  ON media_attachments(uploaded_at DESC);
