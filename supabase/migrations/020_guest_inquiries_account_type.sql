-- Step 3: guest contact + signup account type
-- Additive only. No drops, renames, or updates of existing rows.
-- Legacy commerce tables are untouched.

-- Existing users stay NULL. New signups write individual or business.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS account_type text,
  ADD COLUMN IF NOT EXISTS company_name text;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_account_type_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_account_type_check
  CHECK (account_type IS NULL OR account_type IN ('individual', 'business'));

-- Guest inquiries: keep subject/body/type/status. user_id may be null.
-- status default stays 'pending' so existing support inserts are unchanged.
-- Contact inserts set status to 'new' explicitly.
ALTER TABLE public.inquiries
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS inquiry_type text,
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS ip text;

ALTER TABLE public.inquiries
  DROP CONSTRAINT IF EXISTS inquiries_inquiry_type_check;

ALTER TABLE public.inquiries
  ADD CONSTRAINT inquiries_inquiry_type_check
  CHECK (
    inquiry_type IS NULL
    OR inquiry_type IN ('ready', 'studio', 'care', 'saas', 'payment', 'partnership', 'other')
  );

CREATE INDEX IF NOT EXISTS idx_inquiries_email
  ON public.inquiries (lower(email));

CREATE INDEX IF NOT EXISTS idx_inquiries_ip_created_at
  ON public.inquiries (ip, created_at DESC);

-- No anon INSERT/SELECT/UPDATE/DELETE policy.
-- Guest writes go through the submit-contact Edge Function (service role).
-- Existing policies stay:
--   inquiries_select_own: auth.uid() = user_id (null user_id does not match)
--   inquiries_select_admin / update_admin / delete_admin
--   inquiries_insert_own: auth.uid() = user_id (blocks guest and user_id null)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_account_type text;
  next_company_name text;
BEGIN
  next_account_type := NULLIF(NEW.raw_user_meta_data->>'account_type', '');
  IF next_account_type IS NOT NULL AND next_account_type NOT IN ('individual', 'business') THEN
    next_account_type := NULL;
  END IF;
  next_company_name := NULLIF(NEW.raw_user_meta_data->>'company_name', '');

  INSERT INTO public.users (id, email, name, avatar_url, provider, account_type, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider',
    next_account_type,
    CASE WHEN next_account_type = 'business' THEN next_company_name ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    provider = COALESCE(EXCLUDED.provider, public.users.provider),
    account_type = COALESCE(EXCLUDED.account_type, public.users.account_type),
    company_name = COALESCE(EXCLUDED.company_name, public.users.company_name);
  RETURN NEW;
END;
$$;
