-- 025 storage bootstrap
-- 003 created storage policies without creating project-uploads, project-outputs, or thumbnails.
-- 019 already creates refund-attachments. Do not insert that bucket again.
-- Do not recreate the policy names from 003 or 019.
-- Draft SQL. Do not apply until a separate integration instruction.
--
-- engagement-files has no authenticated policy in this version.
-- Anon and authenticated therefore cannot read or write objects there.
-- Service role bypasses storage RLS. A later Edge Function may issue a signed URL
-- only after checking engagement_files.audience and engagement ownership.
-- Customer upload is intentionally closed.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('project-uploads', 'project-uploads', false, 52428800, NULL),
  ('project-outputs', 'project-outputs', false, 52428800, NULL),
  ('thumbnails', 'thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('engagement-files', 'engagement-files', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;
