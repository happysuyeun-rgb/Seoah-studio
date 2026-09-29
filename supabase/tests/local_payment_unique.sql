BEGIN;
SET LOCAL ROLE supabase_auth_admin;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000d1',
  'authenticated', 'authenticated', 'p3a2-pay@example.test', '', now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', ''
);
RESET ROLE;

INSERT INTO public.templates (id, name, category, html_template)
VALUES ('00000000-0000-0000-0000-0000000000d2', 'p3a2', 'test', '<p>x</p>');
INSERT INTO public.projects (id, user_id, template_id)
VALUES ('00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000d2');
INSERT INTO public.orders (id, user_id, project_id, amount, status, imp_uid, payment_key)
VALUES ('00000000-0000-0000-0000-0000000000d4', '00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000d3', 49000, 'paid', 'imp-dup', 'merchant-1');

DO $$
BEGIN
  INSERT INTO public.orders (user_id, project_id, amount, status, imp_uid, payment_key)
  VALUES ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000d3', 49000, 'paid', 'imp-dup', 'merchant-2');
  RAISE EXCEPTION 'duplicate imp_uid accepted';
EXCEPTION WHEN unique_violation THEN
  NULL;
END $$;

DO $$
BEGIN
  INSERT INTO public.orders (user_id, project_id, amount, status, imp_uid, payment_key)
  VALUES ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000d3', 49000, 'paid', 'imp-other', 'merchant-1');
  RAISE EXCEPTION 'duplicate payment_key accepted';
EXCEPTION WHEN unique_violation THEN
  NULL;
END $$;

ROLLBACK;
