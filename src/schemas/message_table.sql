-- =============================================
-- Messages Table
-- =============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Message type: conversational or rejection
  type TEXT NOT NULL CHECK (type IN ('conversational', 'rejection')),

  -- Message content
  content TEXT NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 2000),

  -- Relationships
  project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT milestone_required_for_rejection
    CHECK (
      (type = 'rejection' AND milestone_id IS NOT NULL)
      OR (type = 'conversational')
    )
);

-- =============================================
-- Indexes
-- =============================================

-- Fast lookup by project
CREATE INDEX idx_messages_project_id ON messages(project_id);

-- Filter by milestone (especially for rejection messages)
CREATE INDEX idx_messages_milestone_id ON messages(milestone_id);

-- Filter by type (conversational vs rejection)
CREATE INDEX idx_messages_type ON messages(type);

-- Sort by creation time (chat history, recent activity)
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
