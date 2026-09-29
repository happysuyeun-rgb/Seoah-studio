-- Local-only checks after migrations 001-030. Not applied to official Supabase.

DO $$
DECLARE
  migration_count integer;
  imp_null text;
  key_null text;
BEGIN
  SELECT count(*) INTO migration_count FROM supabase_migrations.schema_migrations;
  IF migration_count <> 30 THEN
    RAISE EXCEPTION 'check 1 migration count %', migration_count;
  END IF;

  SELECT is_nullable INTO imp_null FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'imp_uid';
  IF imp_null <> 'NO' THEN RAISE EXCEPTION 'check 2 imp_uid nullable'; END IF;

  SELECT is_nullable INTO key_null FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_key';
  IF key_null <> 'NO' THEN RAISE EXCEPTION 'check 3 payment_key nullable'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_imp_uid_key' AND contype = 'u'
  ) THEN RAISE EXCEPTION 'check 4 imp_uid unique missing'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_key_key' AND contype = 'u'
  ) THEN RAISE EXCEPTION 'check 5 payment_key unique missing'; END IF;

  IF has_table_privilege('anon', 'public.templates', 'INSERT') THEN
    RAISE EXCEPTION 'check 6 anon templates insert';
  END IF;
  IF NOT has_table_privilege('anon', 'public.templates_public', 'SELECT') THEN
    RAISE EXCEPTION 'check 7 anon templates_public select';
  END IF;
  IF has_function_privilege('anon', 'public.admin_list_templates()', 'EXECUTE') THEN
    RAISE EXCEPTION 'check 8 anon admin_list_templates';
  END IF;
  IF has_function_privilege('anon', 'public.is_admin()', 'EXECUTE') THEN
    RAISE EXCEPTION 'check 9 anon is_admin';
  END IF;
  IF NOT has_function_privilege('authenticated', 'public.is_admin()', 'EXECUTE') THEN
    RAISE EXCEPTION 'check 10 authenticated is_admin';
  END IF;
  IF has_function_privilege('anon', 'public.create_engagement_from_contract(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'check 11 anon create_engagement';
  END IF;
  IF has_function_privilege('authenticated', 'public.create_engagement_from_contract(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'check 12 authenticated create_engagement';
  END IF;
  IF NOT has_function_privilege('service_role', 'public.create_engagement_from_contract(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'check 13 service_role create_engagement';
  END IF;
  IF has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE') THEN
    RAISE EXCEPTION 'check 14 anon handle_new_user';
  END IF;
  IF has_function_privilege('anon', 'public.users_protect_is_admin()', 'EXECUTE') THEN
    RAISE EXCEPTION 'check 15 anon users_protect_is_admin';
  END IF;
  IF has_function_privilege('anon', 'public.apply_refund_decision(uuid,uuid,uuid,text,text,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'check 16 anon apply_refund_decision';
  END IF;
  IF NOT has_function_privilege('service_role', 'public.apply_refund_decision(uuid,uuid,uuid,text,text,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'check 17 service_role apply_refund_decision';
  END IF;
  IF has_function_privilege('authenticated', 'public.apply_refund_decision(uuid,uuid,uuid,text,text,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'check 18 authenticated apply_refund_decision';
  END IF;
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'project-uploads' AND public) THEN
    RAISE EXCEPTION 'check 19 project-uploads public';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'thumbnails' AND public) THEN
    RAISE EXCEPTION 'check 20 thumbnails not public';
  END IF;
END $$;
