-- =============================================
-- users Table
-- =============================================
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  password_hash text,
  avatar_url text,
  is_agency boolean NOT NULL DEFAULT false,
  company_name text,
  bio text,
  website text,
  location text,
  email_verified boolean DEFAULT false,
  email_otp text,
  otp_expires_at timestamptz,
  is_active boolean DEFAULT true,
  auth_provider text DEFAULT 'email',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      COALESCE(full_name, '') || ' ' ||
      COALESCE(company_name, '') || ' ' ||
      COALESCE(bio, '') || ' ' ||
      COALESCE(location, '')
    )
  ) STORED
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_search ON users USING GIN(search_vector);

-- =============================================
-- Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();