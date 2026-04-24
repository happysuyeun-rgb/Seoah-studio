-- v2.1 보안: html_template 비공개. 비로그인/일반 사용자는 templates_public만 조회.
CREATE OR REPLACE VIEW public.templates_public AS
SELECT
  id,
  name,
  category,
  thumbnail_url,
  variables,
  tags,
  is_active,
  created_at
FROM public.templates
WHERE is_active = true;

-- 프로젝트 소유자만 해당 프로젝트의 템플릿 html_template 조회 (CustomizePage "다시 적용"용)
CREATE OR REPLACE FUNCTION public.get_project_template_html(p_project_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.html_template
  FROM templates t
  JOIN projects p ON p.template_id = t.id
  WHERE p.id = p_project_id
    AND p.user_id = auth.uid()
    AND p.deleted_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_project_template_html(uuid) TO authenticated;
