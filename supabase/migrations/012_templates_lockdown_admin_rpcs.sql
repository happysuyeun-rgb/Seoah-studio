-- v2.1 P0 보안-B: templates.html_template 직접 노출 차단
-- - anon/authenticated는 templates 테이블 직접 SELECT 불가
-- - 공개 영역은 templates_public 뷰만 SELECT
-- - 관리자는 SECURITY DEFINER RPC로 templates CRUD 수행

-- 1) templates 테이블 직접 접근 차단
REVOKE ALL ON TABLE public.templates FROM anon, authenticated;

-- 2) 공개 뷰 접근 허용
GRANT SELECT ON TABLE public.templates_public TO anon, authenticated;

-- 3) 관리자 전용 RPC (템플릿 목록/저장/비활성화)
CREATE OR REPLACE FUNCTION public.admin_list_templates()
RETURNS SETOF public.templates
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.*
  FROM public.templates t
  WHERE EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.is_admin = true
  )
  ORDER BY t.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_template(
  p_id uuid,
  p_name text,
  p_category text,
  p_tags text[],
  p_variables jsonb,
  p_html_template text,
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
    INSERT INTO public.templates (name, category, tags, variables, html_template, thumbnail_url, is_active)
    VALUES (p_name, p_category, p_tags, p_variables, p_html_template, p_thumbnail_url, COALESCE(p_is_active, true))
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
    thumbnail_url = p_thumbnail_url,
    is_active = COALESCE(p_is_active, is_active)
  WHERE id = p_id;

  RETURN p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_template_active(p_id uuid, p_is_active boolean)
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

  UPDATE public.templates SET is_active = p_is_active WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_templates() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_template(uuid, text, text, text[], jsonb, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_template_active(uuid, boolean) TO authenticated;

