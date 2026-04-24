-- SEOAH.STUDIO v2: Storage RLS (S1-P4)
-- project-uploads: 본인 폴더만 업로드/읽기
-- project-outputs: service_role만 업로드 (읽기는 signed URL로만)
-- thumbnails: 관리자 업로드, 공개 읽기

-- storage.objects에 RLS 활성화 (이미 되어 있을 수 있음)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- project-uploads: 본인 폴더만 (경로 첫 세그먼트 = user_id)
DROP POLICY IF EXISTS "project_uploads_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "project_uploads_select_own" ON storage.objects;
CREATE POLICY "project_uploads_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "project_uploads_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- project-outputs: anon/authenticated INSERT·SELECT 차단 (service_role만 사용)
-- 별도 정책 없음 = 클라이언트 접근 불가. Edge Function(service_role)만 업로드·signed URL 생성.

-- thumbnails: 관리자 업로드, 모든 사용자 읽기
DROP POLICY IF EXISTS "thumbnails_insert_admin" ON storage.objects;
DROP POLICY IF EXISTS "thumbnails_select_public" ON storage.objects;
CREATE POLICY "thumbnails_insert_admin" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'thumbnails'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "thumbnails_select_public" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'thumbnails');
