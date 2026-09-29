-- v2.1 SC-04 미리보기: 공개용 preview_html 분리 (html_template은 계속 비공개)
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS preview_html text;

-- templates_public 뷰에 preview_html 포함
CREATE OR REPLACE VIEW public.templates_public AS
SELECT
  id,
  name,
  category,
  thumbnail_url,
  variables,
  tags,
  is_active,
  created_at,
  preview_html
FROM public.templates
WHERE is_active = true;

-- Admin RPC v2: preview_html까지 함께 저장
CREATE OR REPLACE FUNCTION public.admin_upsert_template_v2(
  p_id uuid,
  p_name text,
  p_category text,
  p_tags text[],
  p_variables jsonb,
  p_html_template text,
  p_preview_html text,
  p_thumbnail_url text,
  p_is_active boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_id uuid;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.is_admin = true
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.templates (name, category, tags, variables, html_template, preview_html, thumbnail_url, is_active)
    VALUES (p_name, p_category, p_tags, p_variables, p_html_template, p_preview_html, p_thumbnail_url, COALESCE(p_is_active, true))
    RETURNING id INTO v_id;
    RETURN v_id;
  END IF;

  UPDATE public.templates
  SET
    name = p_name,
    category = p_category,
    tags = p_tags,
    variables = p_variables,
    html_template = p_html_template,
    preview_html = p_preview_html,
    thumbnail_url = p_thumbnail_url,
    is_active = COALESCE(p_is_active, is_active)
  WHERE id = p_id;

  RETURN p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_upsert_template_v2(uuid, text, text, text[], jsonb, text, text, text, boolean) TO authenticated;

