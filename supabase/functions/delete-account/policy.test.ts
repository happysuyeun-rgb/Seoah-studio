import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { DELETED_USER_PLACEHOLDER, deletionSql, userFkPolicy } from './policy.ts'

const docker = `${process.env.LOCALAPPDATA}\\Programs\\DockerDesktop\\resources\\bin\\docker.exe`

function psql(sql: string) {
  const result = spawnSync(docker, [
    'exec', '-i', 'supabase_db_seoah-local-supabase',
    'psql', '-U', 'supabase_admin', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-A', '-t',
  ], { input: sql, encoding: 'utf8' })
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout)
    process.exit(1)
  }
  return result.stdout
}

const catalog = psql(`
SELECT c.conrelid::regclass::text || '|' || a.attname || '|' ||
       CASE c.confdeltype WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT' WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' ELSE c.confdeltype::text END || '|' ||
       CASE WHEN a.attnotnull THEN 'false' ELSE 'true' END
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
WHERE c.contype = 'f' AND c.confrelid = 'public.users'::regclass
ORDER BY 1;
`)

const found = catalog.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
assert.equal(found.length, userFkPolicy.length)
const expected = new Set(userFkPolicy.map((fk) => `${fk.table}|${fk.column}|${fk.onDelete}|${fk.nullable}`))
for (const line of found) {
  const [table, column, onDelete, nullable] = line.split('|')
  const key = `${table}|${column}|${onDelete}|${nullable}`
  assert.equal(expected.has(key), true, key)
}

const ids = {
  empty: '00000000-0000-0000-0000-0000000000a1',
  legacy: '00000000-0000-0000-0000-0000000000a2',
  refund: '00000000-0000-0000-0000-0000000000a3',
  studio: '00000000-0000-0000-0000-0000000000a4',
  other: '00000000-0000-0000-0000-0000000000a5',
  template: '00000000-0000-0000-0000-0000000000b1',
  project: '00000000-0000-0000-0000-0000000000b2',
  order: '00000000-0000-0000-0000-0000000000b3',
  download: '00000000-0000-0000-0000-0000000000b4',
  refundProject: '00000000-0000-0000-0000-0000000000b5',
  refundOrder: '00000000-0000-0000-0000-0000000000b6',
  refundRequest: '00000000-0000-0000-0000-0000000000b7',
  otherProject: '00000000-0000-0000-0000-0000000000b8',
  otherOrder: '00000000-0000-0000-0000-0000000000b9',
  otherRefund: '00000000-0000-0000-0000-0000000000ba',
  lead: '00000000-0000-0000-0000-0000000000c1',
  proposal: '00000000-0000-0000-0000-0000000000c2',
  contract: '00000000-0000-0000-0000-0000000000c3',
  version: '00000000-0000-0000-0000-0000000000c4',
  agreement: '00000000-0000-0000-0000-0000000000c5',
  payment: '00000000-0000-0000-0000-0000000000c6',
  engagement: '00000000-0000-0000-0000-0000000000c7',
  otherLead: '00000000-0000-0000-0000-0000000000c8',
}

function insertUser(id: string, email: string) {
  return `
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000', '${id}', 'authenticated', 'authenticated', '${email}',
  '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"${email}"}'::jsonb,
  now(), now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;`
}

const sql = `
BEGIN;
SET LOCAL ROLE supabase_auth_admin;
${insertUser(DELETED_USER_PLACEHOLDER, 'deleted-placeholder@seoah.studio')}
${insertUser(ids.empty, 'p3a1-empty@example.test')}
${insertUser(ids.legacy, 'p3a1-legacy@example.test')}
${insertUser(ids.refund, 'p3a1-refund@example.test')}
${insertUser(ids.studio, 'p3a1-studio@example.test')}
${insertUser(ids.other, 'p3a1-other@example.test')}
RESET ROLE;

INSERT INTO public.templates (id, name, category, html_template)
VALUES ('${ids.template}', 'p3a1', 'test', '<p>x</p>');

INSERT INTO public.projects (id, user_id, template_id, input_data)
VALUES ('${ids.project}', '${ids.legacy}', '${ids.template}', '{"name":"Legacy"}'::jsonb);
INSERT INTO public.orders (id, user_id, project_id, amount, status, imp_uid, payment_key)
VALUES ('${ids.order}', '${ids.legacy}', '${ids.project}', 10000, 'paid', 'imp-legacy', 'pay-legacy');
INSERT INTO public.downloads (id, order_id, file_type)
VALUES ('${ids.download}', '${ids.order}', 'html');
INSERT INTO public.inquiries (user_id, subject, body, name, email, phone, ip)
VALUES ('${ids.legacy}', 'hello', 'body', 'Legacy', 'p3a1-legacy@example.test', '010', '127.0.0.1');
INSERT INTO public.policy_agreements (user_id, policy_type, version)
VALUES ('${ids.legacy}', 'terms', '2026-09');

INSERT INTO public.projects (id, user_id, template_id)
VALUES ('${ids.refundProject}', '${ids.refund}', '${ids.template}');
INSERT INTO public.orders (id, user_id, project_id, amount, status, imp_uid, payment_key)
VALUES ('${ids.refundOrder}', '${ids.refund}', '${ids.refundProject}', 5000, 'refund_requested', 'imp-refund', 'pay-refund');
INSERT INTO public.refund_requests (id, order_id, user_id, reason, status, reviewed_by)
VALUES ('${ids.refundRequest}', '${ids.refundOrder}', '${ids.refund}', 'need refund', 'requested', '${ids.refund}');

INSERT INTO public.projects (id, user_id, template_id)
VALUES ('${ids.otherProject}', '${ids.other}', '${ids.template}');
INSERT INTO public.orders (id, user_id, project_id, amount, status, imp_uid, payment_key)
VALUES ('${ids.otherOrder}', '${ids.other}', '${ids.otherProject}', 7000, 'paid', 'imp-other', 'pay-other');
INSERT INTO public.refund_requests (id, order_id, user_id, reason, reviewed_by)
VALUES ('${ids.otherRefund}', '${ids.otherOrder}', '${ids.other}', 'other refund', '${ids.refund}');
INSERT INTO public.leads (id, user_id, name, email, phone)
VALUES ('${ids.otherLead}', '${ids.other}', 'Other', 'p3a1-other@example.test', '010999');

INSERT INTO public.leads (id, user_id, name, email, phone, company)
VALUES ('${ids.lead}', '${ids.studio}', 'Studio', 'p3a1-studio@example.test', '010123', 'Acme');
INSERT INTO public.proposals (id, lead_id, user_id, status)
VALUES ('${ids.proposal}', '${ids.lead}', '${ids.studio}', 'APPROVED');
INSERT INTO public.contracts (id, proposal_id, user_id, status)
VALUES ('${ids.contract}', '${ids.proposal}', '${ids.studio}', 'AGREED');
INSERT INTO public.contract_versions (id, contract_id, version)
VALUES ('${ids.version}', '${ids.contract}', 1);
INSERT INTO public.contract_agreements (id, contract_id, contract_version_id, agreed_by, agreed_ip)
VALUES ('${ids.agreement}', '${ids.contract}', '${ids.version}', '${ids.studio}', '203.0.113.8');
INSERT INTO public.studio_payments (id, contract_id, type, amount, status)
VALUES ('${ids.payment}', '${ids.contract}', 'DEPOSIT', 30000, 'PAID');
INSERT INTO public.engagements (id, user_id, lead_id, proposal_id, contract_id, name)
VALUES ('${ids.engagement}', '${ids.studio}', '${ids.lead}', '${ids.proposal}', '${ids.contract}', 'Studio job');
UPDATE public.studio_payments SET engagement_id = '${ids.engagement}' WHERE id = '${ids.payment}';

${deletionSql(ids.legacy)}
${deletionSql(ids.refund)}
${deletionSql(ids.studio)}
DELETE FROM auth.users WHERE id IN ('${ids.empty}', '${ids.legacy}', '${ids.refund}', '${ids.studio}');

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id IN ('${ids.empty}', '${ids.legacy}', '${ids.refund}', '${ids.studio}')) THEN
    RAISE EXCEPTION 'deleted auth user remains';
  END IF;
  IF EXISTS (SELECT 1 FROM public.users WHERE id IN ('${ids.empty}', '${ids.legacy}', '${ids.refund}', '${ids.studio}')) THEN
    RAISE EXCEPTION 'deleted public user remains';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = '${DELETED_USER_PLACEHOLDER}') THEN
    RAISE EXCEPTION 'placeholder missing';
  END IF;
  IF (SELECT user_id FROM public.projects WHERE id = '${ids.project}') <> '${DELETED_USER_PLACEHOLDER}'
     OR (SELECT input_data FROM public.projects WHERE id = '${ids.project}') IS NOT NULL THEN
    RAISE EXCEPTION 'legacy project not preserved';
  END IF;
  IF (SELECT user_id FROM public.orders WHERE id = '${ids.order}') <> '${DELETED_USER_PLACEHOLDER}' THEN
    RAISE EXCEPTION 'legacy order not preserved';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.downloads WHERE id = '${ids.download}') THEN
    RAISE EXCEPTION 'download deleted';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.inquiries
    WHERE user_id = '${ids.legacy}' OR name = 'Legacy' OR email = 'p3a1-legacy@example.test'
  ) THEN
    RAISE EXCEPTION 'inquiry identity remains';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.inquiries
    WHERE user_id = '${DELETED_USER_PLACEHOLDER}' AND subject = 'hello' AND name IS NULL AND email IS NULL
  ) THEN
    RAISE EXCEPTION 'inquiry not preserved';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.policy_agreements WHERE user_id = '${DELETED_USER_PLACEHOLDER}' AND version = '2026-09') THEN
    RAISE EXCEPTION 'policy agreement deleted';
  END IF;
  IF (SELECT user_id FROM public.refund_requests WHERE id = '${ids.refundRequest}') <> '${DELETED_USER_PLACEHOLDER}'
     OR (SELECT reviewed_by FROM public.refund_requests WHERE id = '${ids.refundRequest}') IS NOT NULL THEN
    RAISE EXCEPTION 'refund request not preserved';
  END IF;
  IF (SELECT user_id FROM public.orders WHERE id = '${ids.refundOrder}') <> '${DELETED_USER_PLACEHOLDER}' THEN
    RAISE EXCEPTION 'refund order deleted';
  END IF;
  IF (SELECT user_id FROM public.engagements WHERE id = '${ids.engagement}') <> '${DELETED_USER_PLACEHOLDER}' THEN
    RAISE EXCEPTION 'engagement not preserved';
  END IF;
  IF (SELECT agreed_by FROM public.contract_agreements WHERE id = '${ids.agreement}') <> '${DELETED_USER_PLACEHOLDER}'
     OR (SELECT agreed_ip FROM public.contract_agreements WHERE id = '${ids.agreement}') IS NOT NULL THEN
    RAISE EXCEPTION 'agreement not preserved';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.contracts WHERE id = '${ids.contract}' AND user_id IS NULL) THEN
    RAISE EXCEPTION 'contract missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.proposals WHERE id = '${ids.proposal}' AND user_id IS NULL) THEN
    RAISE EXCEPTION 'proposal missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.leads
    WHERE id = '${ids.lead}' AND user_id IS NULL AND email = 'deleted@seoah.studio' AND phone IS NULL
  ) THEN
    RAISE EXCEPTION 'lead not deidentified';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.studio_payments WHERE id = '${ids.payment}' AND status = 'PAID' AND amount = 30000) THEN
    RAISE EXCEPTION 'studio payment missing';
  END IF;
  IF (SELECT user_id FROM public.orders WHERE id = '${ids.otherOrder}') <> '${ids.other}' THEN
    RAISE EXCEPTION 'other order changed';
  END IF;
  IF (SELECT user_id FROM public.refund_requests WHERE id = '${ids.otherRefund}') <> '${ids.other}'
     OR (SELECT reviewed_by FROM public.refund_requests WHERE id = '${ids.otherRefund}') IS NOT NULL THEN
    RAISE EXCEPTION 'other refund changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.leads WHERE id = '${ids.otherLead}' AND email = 'p3a1-other@example.test' AND user_id = '${ids.other}') THEN
    RAISE EXCEPTION 'other lead changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '${ids.other}') THEN
    RAISE EXCEPTION 'other auth user deleted';
  END IF;
END $$;
ROLLBACK;
`

psql(sql)
console.log(`delete-account scenarios passed (${userFkPolicy.length} user FKs)`)
