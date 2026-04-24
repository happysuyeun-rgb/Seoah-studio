-- refund-attachments Storage bucket [v2.2]
-- 환불 요청 시 첨부파일(스크린샷 등) 업로드용

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'refund-attachments',
  'refund-attachments',
  false,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS: 본인 폴더만 업로드/읽기 (경로: user_id/request_id/filename)
DROP POLICY IF EXISTS "refund_attachments_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "refund_attachments_select_own" ON storage.objects;

CREATE POLICY "refund_attachments_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'refund-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "refund_attachments_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'refund-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
