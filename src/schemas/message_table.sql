CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  type TEXT NOT NULL CHECK (type IN ('conversational', 'rejection')),

  content TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  project_id UUID NOT NULL,

  milestone_id UUID,

  CONSTRAINT milestone_required_for_rejection
    CHECK (
      (type = 'rejection' AND milestone_id IS NOT NULL)
      OR (type = 'conversational')
    )
);



-- Fast lookup by project
CREATE INDEX idx_messages_project_id ON messages(project_id);

-- Filter by milestone (especially for rejection messages)
CREATE INDEX idx_messages_milestone_id ON messages(milestone_id);

-- Filter by type (e.g. conversational vs rejection)
CREATE INDEX idx_messages_type ON messages(type);

-- Sort by creation time (chat history, recent activity)
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);