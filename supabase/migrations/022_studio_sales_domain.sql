-- 022 studio sales domain
-- Legacy public.projects and public.orders are not referenced.
-- studio_payments.engagement_id has no FK yet. 023 adds it after engagements exists.
-- Draft SQL. Do not apply until a separate integration instruction.
--
-- Delete policy: sales records are retained.
-- FKs use RESTRICT except a lead assessment, which exists only for that lead.

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  account_type text,
  project_type text,
  current_status text,
  goals text[] NOT NULL DEFAULT '{}',
  target_users text[] NOT NULL DEFAULT '{}',
  features text[] NOT NULL DEFAULT '{}',
  description text,
  timeline text,
  budget text,
  reference_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'NEW',
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leads_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT leads_account_type_check
    CHECK (account_type IS NULL OR account_type IN ('individual', 'business')),
  CONSTRAINT leads_status_check
    CHECK (status IN ('NEW', 'CONTACTED', 'CONSULTATION', 'PROPOSAL', 'WON', 'LOST'))
);

COMMENT ON TABLE public.leads IS
  'Studio project request. Guest rows keep user_id null. No trigger links them to a new account.';

CREATE INDEX IF NOT EXISTS leads_user_id_idx ON public.leads (user_id);
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (lower(email));
CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status);

DROP TRIGGER IF EXISTS leads_set_updated_at ON public.leads;
CREATE TRIGGER leads_set_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.lead_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  qualification text,
  recommended_path text,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lead_assessments_lead_id_key UNIQUE (lead_id),
  CONSTRAINT lead_assessments_lead_id_fkey
    FOREIGN KEY (lead_id) REFERENCES public.leads (id) ON DELETE CASCADE
);

COMMENT ON TABLE public.lead_assessments IS
  'Admin-only lead evaluation. Customers must not receive this table.';

DROP TRIGGER IF EXISTS lead_assessments_set_updated_at ON public.lead_assessments;
CREATE TRIGGER lead_assessments_set_updated_at
  BEFORE UPDATE ON public.lead_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  user_id uuid,
  status text NOT NULL DEFAULT 'DRAFT',
  current_version integer NOT NULL DEFAULT 1,
  valid_until date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT proposals_id_lead_id_key UNIQUE (id, lead_id),
  CONSTRAINT proposals_lead_id_fkey
    FOREIGN KEY (lead_id) REFERENCES public.leads (id) ON DELETE RESTRICT,
  CONSTRAINT proposals_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT proposals_status_check
    CHECK (status IN (
      'DRAFT', 'SENT', 'VIEWED', 'REVISION_REQUESTED', 'APPROVED', 'REJECTED', 'EXPIRED'
    ))
);

COMMENT ON TABLE public.proposals IS
  'Proposal header only. Body lives in proposal_versions. Do not overwrite versions.';

CREATE INDEX IF NOT EXISTS proposals_lead_id_idx ON public.proposals (lead_id);
CREATE INDEX IF NOT EXISTS proposals_user_id_idx ON public.proposals (user_id);
CREATE INDEX IF NOT EXISTS proposals_status_idx ON public.proposals (status);

DROP TRIGGER IF EXISTS proposals_set_updated_at ON public.proposals;
CREATE TRIGGER proposals_set_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.proposal_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL,
  version integer NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  subtotal integer NOT NULL DEFAULT 0,
  vat integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT proposal_versions_id_proposal_id_key UNIQUE (id, proposal_id),
  CONSTRAINT proposal_versions_proposal_id_version_key UNIQUE (proposal_id, version),
  CONSTRAINT proposal_versions_proposal_id_fkey
    FOREIGN KEY (proposal_id) REFERENCES public.proposals (id) ON DELETE RESTRICT,
  CONSTRAINT proposal_versions_money_check
    CHECK (subtotal >= 0 AND vat >= 0 AND total >= 0)
);

COMMENT ON TABLE public.proposal_versions IS
  'Customer-safe snapshot. Internal notes are not stored in content or on this row.';

CREATE TABLE IF NOT EXISTS public.proposal_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL,
  proposal_version_id uuid,
  note text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT proposal_internal_notes_proposal_id_fkey
    FOREIGN KEY (proposal_id) REFERENCES public.proposals (id) ON DELETE RESTRICT,
  CONSTRAINT proposal_internal_notes_version_proposal_fkey
    FOREIGN KEY (proposal_version_id, proposal_id)
    REFERENCES public.proposal_versions (id, proposal_id) ON DELETE RESTRICT,
  CONSTRAINT proposal_internal_notes_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.users (id) ON DELETE SET NULL
);

COMMENT ON TABLE public.proposal_internal_notes IS
  'Admin-only. Separate from proposal_versions so RLS can hide the whole row.';

CREATE INDEX IF NOT EXISTS proposal_internal_notes_proposal_id_idx
  ON public.proposal_internal_notes (proposal_id);
CREATE INDEX IF NOT EXISTS proposal_internal_notes_version_id_idx
  ON public.proposal_internal_notes (proposal_version_id);
CREATE INDEX IF NOT EXISTS proposal_internal_notes_created_by_idx
  ON public.proposal_internal_notes (created_by);

DROP TRIGGER IF EXISTS proposal_internal_notes_set_updated_at ON public.proposal_internal_notes;
CREATE TRIGGER proposal_internal_notes_set_updated_at
  BEFORE UPDATE ON public.proposal_internal_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL,
  user_id uuid,
  status text NOT NULL DEFAULT 'DRAFT',
  current_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contracts_id_proposal_id_key UNIQUE (id, proposal_id),
  CONSTRAINT contracts_proposal_id_fkey
    FOREIGN KEY (proposal_id) REFERENCES public.proposals (id) ON DELETE RESTRICT,
  CONSTRAINT contracts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT contracts_status_check
    CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'AGREED', 'DECLINED', 'EXPIRED'))
);

COMMENT ON TABLE public.contracts IS
  'No agreement IP on this row. Agreement audit is contract_agreements.';

CREATE INDEX IF NOT EXISTS contracts_proposal_id_idx ON public.contracts (proposal_id);
CREATE INDEX IF NOT EXISTS contracts_user_id_idx ON public.contracts (user_id);
CREATE INDEX IF NOT EXISTS contracts_status_idx ON public.contracts (status);

DROP TRIGGER IF EXISTS contracts_set_updated_at ON public.contracts;
CREATE TRIGGER contracts_set_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.contract_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  version integer NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contract_versions_id_contract_id_key UNIQUE (id, contract_id),
  CONSTRAINT contract_versions_contract_id_version_key UNIQUE (contract_id, version),
  CONSTRAINT contract_versions_contract_id_fkey
    FOREIGN KEY (contract_id) REFERENCES public.contracts (id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.contract_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  contract_version_id uuid NOT NULL,
  agreed_by uuid NOT NULL,
  agreed_at timestamptz NOT NULL DEFAULT now(),
  agreed_ip text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contract_agreements_contract_id_key UNIQUE (contract_id),
  CONSTRAINT contract_agreements_contract_id_fkey
    FOREIGN KEY (contract_id) REFERENCES public.contracts (id) ON DELETE RESTRICT,
  CONSTRAINT contract_agreements_version_contract_fkey
    FOREIGN KEY (contract_version_id, contract_id)
    REFERENCES public.contract_versions (id, contract_id) ON DELETE RESTRICT,
  CONSTRAINT contract_agreements_agreed_by_fkey
    FOREIGN KEY (agreed_by) REFERENCES public.users (id) ON DELETE RESTRICT
);

COMMENT ON TABLE public.contract_agreements IS
  'One agreement row per contract. agreed_ip stays off the customer-visible contract row. Not an e-sign provider.';

CREATE INDEX IF NOT EXISTS contract_agreements_contract_version_id_idx
  ON public.contract_agreements (contract_version_id);
CREATE INDEX IF NOT EXISTS contract_agreements_agreed_by_idx
  ON public.contract_agreements (agreed_by);

CREATE TABLE IF NOT EXISTS public.studio_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  engagement_id uuid,
  type text NOT NULL,
  amount integer NOT NULL,
  due_date date,
  paid_at timestamptz,
  status text NOT NULL DEFAULT 'PENDING',
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT studio_payments_contract_id_fkey
    FOREIGN KEY (contract_id) REFERENCES public.contracts (id) ON DELETE RESTRICT,
  CONSTRAINT studio_payments_type_check
    CHECK (type IN ('DEPOSIT', 'INTERIM', 'FINAL')),
  CONSTRAINT studio_payments_status_check
    CHECK (status IN (
      'PENDING', 'PAID', 'FAILED', 'OVERDUE', 'REFUNDED', 'PARTIAL_REFUND', 'CANCELLED'
    )),
  CONSTRAINT studio_payments_amount_check
    CHECK (amount >= 0)
);

COMMENT ON COLUMN public.studio_payments.engagement_id IS
  'Nullable until 023 adds the engagements FK. A DEPOSIT may exist before an engagement.';

COMMENT ON TABLE public.studio_payments IS
  'Studio contract payments. Not linked to legacy public.orders.';

CREATE INDEX IF NOT EXISTS studio_payments_contract_id_idx ON public.studio_payments (contract_id);
CREATE INDEX IF NOT EXISTS studio_payments_engagement_id_idx ON public.studio_payments (engagement_id);
CREATE INDEX IF NOT EXISTS studio_payments_status_idx ON public.studio_payments (status);
CREATE UNIQUE INDEX IF NOT EXISTS studio_payments_one_deposit_per_contract_idx
  ON public.studio_payments (contract_id)
  WHERE type = 'DEPOSIT';

DROP TRIGGER IF EXISTS studio_payments_set_updated_at ON public.studio_payments;
CREATE TRIGGER studio_payments_set_updated_at
  BEFORE UPDATE ON public.studio_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
