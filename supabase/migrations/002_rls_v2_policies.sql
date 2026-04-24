-- SEOAH.STUDIO v2: RLS 정책 보완 (cursor_guide_v2 S1-P4)

-- 1. users
-- DELETE: 관리자만
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_delete_admin" ON public.users FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = true)
);
-- INSERT: 트리거로만 (클라이언트 직접 INSERT 없음, 정책 미부여 = 차단)

-- 2. templates
-- SELECT: is_active = true (전체 공개)
DROP POLICY IF EXISTS "templates_select_all" ON public.templates;

CREATE POLICY "templates_select_active" ON public.templates FOR SELECT USING (is_active = true);
-- INSERT/UPDATE/DELETE: 기존 admin 정책 유지
-- (templates_insert_admin, templates_update_admin, templates_delete_admin)

-- 3. projects
-- SELECT/INSERT/UPDATE: 본인만, DELETE 차단(정책 없음)
DROP POLICY IF EXISTS "projects_all_own" ON public.projects;

CREATE POLICY "projects_select_own" ON public.projects FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);
-- DELETE: 정책 없음 → 차단 (soft delete만 허용)

-- 4. orders
-- INSERT: service_role만 (Edge Function에서만). 클라이언트 INSERT 차단
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
-- SELECT: 본인만 유지
-- UPDATE: 관리자만 (명시)
CREATE POLICY "orders_update_admin" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);
-- DELETE: 정책 없음 → 차단

-- 5. downloads
-- SELECT: orders.user_id = auth.uid() 유지
-- INSERT: 로그인 사용자 (본인 order일 때만 안전하게 유지)
DROP POLICY IF EXISTS "downloads_insert_own" ON public.downloads;
CREATE POLICY "downloads_insert_logged_in" ON public.downloads FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );
-- UPDATE/DELETE: 정책 없음 → 차단
