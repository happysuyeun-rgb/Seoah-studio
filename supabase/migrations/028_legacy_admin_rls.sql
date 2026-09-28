-- 028 legacy admin RLS
-- Draft SQL. Do not apply until a separate integration instruction.
-- Depends on public.is_admin() from 024. Does not modify 001-020.
--
-- AdminPage reads every users, non-deleted projects, and orders row.
-- inquiries_select_admin, chatbot_inquiries_select_admin, and
-- refund_requests_select_admin already exist, so they are not recreated.
-- 027 already grants authenticated SELECT on these tables.

DROP POLICY IF EXISTS "users_select_admin" ON public.users;
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "projects_select_admin" ON public.projects;
CREATE POLICY "projects_select_admin" ON public.projects
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
CREATE POLICY "orders_select_admin" ON public.orders
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
