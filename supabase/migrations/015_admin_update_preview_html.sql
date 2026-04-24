-- SC-04 운영 편의: 관리자 전용 preview_html 갱신 RPC
CREATE OR REPLACE FUNCTION public.admin_update_template_preview_html(
  p_id uuid,
  p_preview_html text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.is_admin = true
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.templates
  SET preview_html = p_preview_html
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_template_preview_html(uuid, text) TO authenticated;

