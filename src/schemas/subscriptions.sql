-- =============================================
-- subscriptions Table
-- =============================================
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name text NOT NULL CHECK (plan_name IN ('free','pro','agency')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (profile_id, is_active)
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_subscriptions_profile ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_plan_name ON subscriptions(plan_name);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active);

-- =============================================
-- Auto-update updated_at
-- =============================================
CREATE TRIGGER trg_set_timestamp_subscriptions
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();