-- 023 studio delivery domain
-- Engagements are not foreign keys of public.projects.
-- studio_payments.engagement_id FK is added only after engagements exists.
-- Draft SQL. Do not apply until a separate integration instruction.
--
-- Delete policy: engagements are not deleted in normal operation.
-- Operational children use ON DELETE RESTRICT so a delete fails closed.
-- engagement_admin_state is the exception and cascades.

CREATE TABLE IF NOT EXISTS public.engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lead_id uuid NOT NULL,
  proposal_id uuid NOT NULL,
  contract_id uuid NOT NULL,
  name text NOT NULL,
  project_type text,
  status text NOT NULL DEFAULT 'WAITING_CONTENT',
  progress_stage text NOT NULL DEFAULT '준비',
  progress integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  expected_completion date,
  action_kind text,
  action_due_date date,
  current_milestone_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT engagements_contract_id_key UNIQUE (contract_id),
  CONSTRAINT engagements_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE RESTRICT,
  CONSTRAINT engagements_lead_id_fkey
    FOREIGN KEY (lead_id) REFERENCES public.leads (id) ON DELETE RESTRICT,
  CONSTRAINT engagements_proposal_id_fkey
    FOREIGN KEY (proposal_id) REFERENCES public.proposals (id) ON DELETE RESTRICT,
  CONSTRAINT engagements_contract_id_fkey
    FOREIGN KEY (contract_id) REFERENCES public.contracts (id) ON DELETE RESTRICT,
  CONSTRAINT engagements_status_check
    CHECK (status IN (
      'DRAFT',
      'AWAITING_CONTRACT',
      'AWAITING_DEPOSIT',
      'WAITING_CONTENT',
      'READY_TO_START',
      'PLANNING',
      'DESIGN',
      'DEVELOPMENT',
      'QA',
      'AWAITING_REVIEW',
      'REVISION',
      'READY_TO_LAUNCH',
      'LAUNCHING',
      'COMPLETED',
      'PAUSED',
      'CANCELLED'
    )),
  CONSTRAINT engagements_progress_stage_check
    CHECK (progress_stage IN ('준비', '기획', '디자인', '제작', '검토', '완료')),
  CONSTRAINT engagements_progress_check
    CHECK (progress >= 0 AND progress <= 100),
  CONSTRAINT engagements_action_kind_check
    CHECK (
      action_kind IS NULL
      OR action_kind IN (
        'CONTENT_REQUIRED',
        'REVIEW_REQUIRED',
        'APPROVAL_REQUIRED',
        'PAYMENT_REQUIRED',
        'CHANGE_REQUEST_APPROVAL',
        'INFORMATION_REQUIRED'
      )
    )
);

COMMENT ON TABLE public.engagements IS
  'Studio project. Not a template customization session. DRAFT, AWAITING_CONTRACT, and AWAITING_DEPOSIT remain valid for UI compatibility but are not the normal status written by create_engagement_from_contract.';

COMMENT ON COLUMN public.engagements.current_milestone_id IS
  'FK is added after engagement_milestones. The database does not prove the milestone belongs to this engagement. The service must check engagement_id.';

CREATE INDEX IF NOT EXISTS engagements_user_id_idx ON public.engagements (user_id);
CREATE INDEX IF NOT EXISTS engagements_status_idx ON public.engagements (status);

DROP TRIGGER IF EXISTS engagements_set_updated_at ON public.engagements;
CREATE TRIGGER engagements_set_updated_at
  BEFORE UPDATE ON public.engagements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.engagement_admin_state (
  engagement_id uuid PRIMARY KEY,
  blocked_reason text,
  internal_notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT engagement_admin_state_engagement_id_fkey
    FOREIGN KEY (engagement_id) REFERENCES public.engagements (id) ON DELETE CASCADE
);

COMMENT ON TABLE public.engagement_admin_state IS
  'Admin-only hold reason and notes. Not selected with the customer engagement row.';

DROP TRIGGER IF EXISTS engagement_admin_state_set_updated_at ON public.engagement_admin_state;
CREATE TRIGGER engagement_admin_state_set_updated_at
  BEFORE UPDATE ON public.engagement_admin_state
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.engagement_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'NOT_STARTED',
  position integer NOT NULL DEFAULT 0,
  due_date date,
  completed_at timestamptz,
  requires_approval boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT engagement_milestones_engagement_id_fkey
    FOREIGN KEY (engagement_id) REFERENCES public.engagements (id) ON DELETE RESTRICT,
  CONSTRAINT engagement_milestones_status_check
    CHECK (status IN (
      'NOT_STARTED',
      'IN_PROGRESS',
      'AWAITING_REVIEW',
      'REVISION',
      'APPROVED',
      'COMPLETED',
      'BLOCKED'
    ))
);

CREATE INDEX IF NOT EXISTS engagement_milestones_engagement_id_idx
  ON public.engagement_milestones (engagement_id);
CREATE INDEX IF NOT EXISTS engagement_milestones_engagement_position_idx
  ON public.engagement_milestones (engagement_id, position);

DROP TRIGGER IF EXISTS engagement_milestones_set_updated_at ON public.engagement_milestones;
CREATE TRIGGER engagement_milestones_set_updated_at
  BEFORE UPDATE ON public.engagement_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.engagements
  ADD CONSTRAINT engagements_current_milestone_id_fkey
  FOREIGN KEY (current_milestone_id) REFERENCES public.engagement_milestones (id)
  ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.engagement_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL,
  milestone_id uuid,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  requested_at timestamptz,
  reviewed_at timestamptz,
  feedback text,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT engagement_reviews_engagement_id_fkey
    FOREIGN KEY (engagement_id) REFERENCES public.engagements (id) ON DELETE RESTRICT,
  CONSTRAINT engagement_reviews_milestone_id_fkey
    FOREIGN KEY (milestone_id) REFERENCES public.engagement_milestones (id) ON DELETE RESTRICT,
  CONSTRAINT engagement_reviews_status_check
    CHECK (status IN ('PENDING', 'APPROVED', 'REVISION_REQUESTED'))
);

CREATE INDEX IF NOT EXISTS engagement_reviews_engagement_id_idx
  ON public.engagement_reviews (engagement_id);

CREATE TABLE IF NOT EXISTS public.intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'NOT_STARTED',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT intakes_engagement_id_key UNIQUE (engagement_id),
  CONSTRAINT intakes_engagement_id_fkey
    FOREIGN KEY (engagement_id) REFERENCES public.engagements (id) ON DELETE RESTRICT,
  CONSTRAINT intakes_status_check
    CHECK (status IN (
      'NOT_STARTED', 'IN_PROGRESS', 'AWAITING_REVIEW', 'NEEDS_REVISION', 'COMPLETED'
    ))
);

DROP TRIGGER IF EXISTS intakes_set_updated_at ON public.intakes;
CREATE TRIGGER intakes_set_updated_at
  BEFORE UPDATE ON public.intakes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.intake_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid NOT NULL,
  category text,
  title text NOT NULL,
  description text,
  required boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'NOT_STARTED',
  customer_response text,
  reference_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT intake_items_intake_id_fkey
    FOREIGN KEY (intake_id) REFERENCES public.intakes (id) ON DELETE RESTRICT,
  CONSTRAINT intake_items_status_check
    CHECK (status IN (
      'NOT_STARTED', 'UPLOADED', 'UNDER_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'OPTIONAL'
    ))
);

COMMENT ON TABLE public.intake_items IS
  'Customer-visible intake fields only. Admin feedback is intake_item_admin_notes.';

CREATE INDEX IF NOT EXISTS intake_items_intake_id_idx ON public.intake_items (intake_id);

DROP TRIGGER IF EXISTS intake_items_set_updated_at ON public.intake_items;
CREATE TRIGGER intake_items_set_updated_at
  BEFORE UPDATE ON public.intake_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.intake_item_admin_notes (
  intake_item_id uuid PRIMARY KEY,
  note text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT intake_item_admin_notes_item_id_fkey
    FOREIGN KEY (intake_item_id) REFERENCES public.intake_items (id) ON DELETE CASCADE
);

COMMENT ON TABLE public.intake_item_admin_notes IS
  'Admin-only feedback. Kept off intake_items because RLS cannot hide one column.';

DROP TRIGGER IF EXISTS intake_item_admin_notes_set_updated_at ON public.intake_item_admin_notes;
CREATE TRIGGER intake_item_admin_notes_set_updated_at
  BEFORE UPDATE ON public.intake_item_admin_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.engagement_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL,
  name text NOT NULL,
  storage_path text NOT NULL,
  category text,
  uploaded_by uuid,
  audience text NOT NULL DEFAULT 'customer',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT engagement_files_engagement_id_fkey
    FOREIGN KEY (engagement_id) REFERENCES public.engagements (id) ON DELETE RESTRICT,
  CONSTRAINT engagement_files_uploaded_by_fkey
    FOREIGN KEY (uploaded_by) REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT engagement_files_audience_check
    CHECK (audience IN ('customer', 'admin'))
);

CREATE INDEX IF NOT EXISTS engagement_files_engagement_id_idx
  ON public.engagement_files (engagement_id);

CREATE TABLE IF NOT EXISTS public.engagement_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL,
  sender_user_id uuid,
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT engagement_messages_engagement_id_fkey
    FOREIGN KEY (engagement_id) REFERENCES public.engagements (id) ON DELETE RESTRICT,
  CONSTRAINT engagement_messages_sender_user_id_fkey
    FOREIGN KEY (sender_user_id) REFERENCES public.users (id) ON DELETE SET NULL
);

COMMENT ON COLUMN public.engagement_messages.is_internal IS
  'Default false matches a customer-visible message. Internal rows must set true at insert time.';

CREATE INDEX IF NOT EXISTS engagement_messages_engagement_id_idx
  ON public.engagement_messages (engagement_id);

CREATE TABLE IF NOT EXISTS public.engagement_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  classification text NOT NULL,
  status text NOT NULL,
  cost_impact integer,
  schedule_impact text,
  audience text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT engagement_change_requests_engagement_id_fkey
    FOREIGN KEY (engagement_id) REFERENCES public.engagements (id) ON DELETE RESTRICT,
  CONSTRAINT engagement_change_requests_classification_check
    CHECK (classification IN ('SCOPE_IN', 'MINOR_CHANGE', 'CHANGE_REQUEST', 'BUG')),
  CONSTRAINT engagement_change_requests_status_check
    CHECK (status IN (
      'DRAFT',
      'UNDER_REVIEW',
      'AWAITING_CUSTOMER_APPROVAL',
      'APPROVED',
      'REJECTED',
      'IN_PROGRESS',
      'COMPLETED'
    )),
  CONSTRAINT engagement_change_requests_audience_check
    CHECK (audience IN ('customer', 'admin')),
  CONSTRAINT engagement_change_requests_cost_impact_check
    CHECK (cost_impact IS NULL OR cost_impact >= 0)
);

CREATE INDEX IF NOT EXISTS engagement_change_requests_engagement_id_idx
  ON public.engagement_change_requests (engagement_id);

DROP TRIGGER IF EXISTS engagement_change_requests_set_updated_at ON public.engagement_change_requests;
CREATE TRIGGER engagement_change_requests_set_updated_at
  BEFORE UPDATE ON public.engagement_change_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.engagement_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL,
  type text NOT NULL,
  actor_user_id uuid,
  actor_label text,
  description text NOT NULL,
  audience text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT engagement_activities_engagement_id_fkey
    FOREIGN KEY (engagement_id) REFERENCES public.engagements (id) ON DELETE RESTRICT,
  CONSTRAINT engagement_activities_actor_user_id_fkey
    FOREIGN KEY (actor_user_id) REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT engagement_activities_type_check
    CHECK (type IN (
      'STATUS_CHANGED',
      'MILESTONE_UPDATED',
      'REVIEW_REQUESTED',
      'APPROVED',
      'FILE_ADDED',
      'CHANGE_REQUEST_CREATED',
      'PAYMENT_UPDATED'
    )),
  CONSTRAINT engagement_activities_audience_check
    CHECK (audience IN ('customer', 'admin'))
);

CREATE INDEX IF NOT EXISTS engagement_activities_engagement_id_idx
  ON public.engagement_activities (engagement_id);

ALTER TABLE public.studio_payments
  ADD CONSTRAINT studio_payments_engagement_id_fkey
  FOREIGN KEY (engagement_id) REFERENCES public.engagements (id)
  ON DELETE RESTRICT;
