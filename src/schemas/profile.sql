-- =============================================
-- Main profiles table with optimized structure
-- =============================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  is_agency boolean NOT NULL DEFAULT false,
  company_name text,
  bio text,
  website text,
  location text,
  email_verified boolean DEFAULT false,
  ADD COLUMN email_otp TEXT,
  ADD COLUMN otp_expires_at TIMESTAMPTZ;
  is_active boolean DEFAULT true,
  auth_provider text, -- Stores the authentication provider (e.g., 'google', 'email')
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
-- Enable Row Level Security
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies (same as before)
-- =============================================
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Public can view active agency profiles" 
  ON public.profiles FOR SELECT 
  USING (is_agency = true AND is_active = true);

-- =============================================
-- Optimized Indexes (same as before)
-- =============================================
CREATE UNIQUE INDEX profiles_email_unique_idx 
  ON public.profiles(LOWER(email));

CREATE INDEX profiles_agency_active_idx 
  ON public.profiles(is_agency, is_active) 
  WHERE is_agency = true AND is_active = true;

CREATE INDEX profiles_agency_covering_idx 
  ON public.profiles(is_agency) 
  INCLUDE (company_name, avatar_url, website, location, email_verified)
  WHERE is_agency = true AND is_active = true;

CREATE INDEX profiles_created_at_desc_idx 
  ON public.profiles(created_at DESC);

CREATE INDEX profiles_search_idx 
  ON public.profiles USING GIN(search_vector) 
  WHERE is_agency = true AND is_active = true;

CREATE INDEX profiles_id_idx ON public.profiles(id);

-- =============================================
-- Timestamp update function (same as before)
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Enhanced Profile Creation Function
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  provider text;
  is_google boolean;
BEGIN
  -- Determine auth provider
  provider := NEW.raw_user_meta_data->>'provider';
  is_google := (provider = 'google');
  
  -- For Google OAuth or other providers that pre-verify emails
  IF is_google OR (NEW.email_confirmed_at IS NOT NULL) THEN
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      is_agency,
      company_name,
      email_verified,
      auth_provider,
      avatar_url
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      COALESCE((NEW.raw_user_meta_data->>'is_agency')::boolean, false),
      COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
      true, -- Email automatically verified for Google/OAuth
      provider,
      CASE 
        WHEN is_google THEN NEW.raw_user_meta_data->>'avatar_url'
        ELSE NULL
      END
    )
    ON CONFLICT (id) DO NOTHING;
  
  -- For email/password signups (requires verification)
  ELSIF provider IS NULL OR provider = 'email' THEN
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      is_agency,
      company_name,
      email_verified,
      auth_provider
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE((NEW.raw_user_meta_data->>'is_agency')::boolean, false),
      COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
      false, -- Email not verified yet
      'email'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Enhanced Triggers
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Trigger for new user creation (OAuth or email)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for email verification (email/password users)
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW 
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Additional function to update email_verified when Google user is created
-- =============================================
CREATE OR REPLACE FUNCTION public.sync_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'provider' = 'google' THEN
    UPDATE public.profiles 
    SET email_verified = true, 
        auth_provider = 'google',
        avatar_url = NEW.raw_user_meta_data->>'avatar_url'
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_google_sync
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'provider' = 'google')
  EXECUTE FUNCTION public.sync_email_verified();

-- =============================================
-- Enable Realtime for profiles (optional)
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;