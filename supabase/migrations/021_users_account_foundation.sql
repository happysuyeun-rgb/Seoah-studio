-- 021 users account foundation
-- Additive only. Does not replace handle_new_user or users_protect_is_admin.
-- Draft SQL. Do not apply until a separate integration instruction.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS
  'BEFORE UPDATE trigger. Not SECURITY DEFINER. Does not read or write other rows.';

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.users
SET updated_at = COALESCE(updated_at, created_at, now())
WHERE updated_at IS NULL;

ALTER TABLE public.users
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.users
  ALTER COLUMN updated_at SET NOT NULL;

DROP TRIGGER IF EXISTS users_set_updated_at ON public.users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
