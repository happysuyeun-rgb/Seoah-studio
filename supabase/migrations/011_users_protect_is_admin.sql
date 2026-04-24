-- v2.1 보안: is_admin 필드는 일반 UPDATE로 변경 불가 (트리거로 보호)
CREATE OR REPLACE FUNCTION public.users_protect_is_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    NEW.is_admin := OLD.is_admin;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_protect_is_admin_trigger ON public.users;
CREATE TRIGGER users_protect_is_admin_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.users_protect_is_admin();
