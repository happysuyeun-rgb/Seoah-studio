-- 029 security hardening
-- Additive only. Does not change 001-028.
--
-- templates_public stays a security definer projection. Anon and authenticated
-- receive no privilege on public.templates, so html_template is not a Data API
-- column. The view is simple, so Postgres marks it updatable, but these grants
-- leave SELECT only.
--
-- PUBLIC execute is revoked explicitly. A later GRANT to authenticated does not
-- remove the default PUBLIC or anon execute privilege.

REVOKE ALL ON TABLE public.templates_public FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.templates_public TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_list_templates() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_template_active(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_template_preview_html(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_upsert_template(uuid, text, text, text[], jsonb, text, text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_upsert_template_v2(uuid, text, text, text[], jsonb, text, text, text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_project_template_html(uuid) FROM PUBLIC, anon;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.users_protect_is_admin() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_list_templates() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_set_template_active(uuid, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_template_preview_html(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_upsert_template(uuid, text, text, text[], jsonb, text, text, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_upsert_template_v2(uuid, text, text, text[], jsonb, text, text, text, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_project_template_html(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
