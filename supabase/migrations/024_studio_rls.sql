-- 024 studio RLS
-- Draft SQL. Do not apply until a separate integration instruction.
--
-- public.is_admin() is SECURITY DEFINER so it reads users as the owner and
-- does not re-enter users RLS. Policies below do not query back into the
-- table they protect, so they do not recurse.
-- Customer writes for review, intake, and change approval are omitted.
-- Those belong in a later service function, not a broad UPDATE grant.
-- No DELETE policies. Sales and activity rows are retained.
-- contract_agreements has admin SELECT only. Inserts are service role.
-- anon has no policies.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = (SELECT auth.uid())
      AND is_admin IS TRUE
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'True only for the current auth user whose users.is_admin is true. Returns a boolean, not a row.';

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_admin_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_item_admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_activities ENABLE ROW LEVEL SECURITY;

-- Customer read

CREATE POLICY leads_select_owner ON public.leads
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY proposals_select_owner ON public.proposals
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) AND status <> 'DRAFT');

CREATE POLICY proposal_versions_select_owner ON public.proposal_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.proposals AS parent
      WHERE parent.id = proposal_id
        AND parent.user_id = (SELECT auth.uid())
        AND parent.status <> 'DRAFT'
    )
  );

CREATE POLICY contracts_select_owner ON public.contracts
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) AND status <> 'DRAFT');

CREATE POLICY contract_versions_select_owner ON public.contract_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.contracts AS parent
      WHERE parent.id = contract_id
        AND parent.user_id = (SELECT auth.uid())
        AND parent.status <> 'DRAFT'
    )
  );

CREATE POLICY studio_payments_select_owner ON public.studio_payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.contracts AS parent
      WHERE parent.id = contract_id
        AND parent.user_id = (SELECT auth.uid())
        AND parent.status <> 'DRAFT'
    )
    OR EXISTS (
      SELECT 1
      FROM public.engagements AS parent
      WHERE parent.id = engagement_id
        AND parent.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY engagements_select_owner ON public.engagements
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY engagement_milestones_select_owner ON public.engagement_milestones
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.engagements AS parent
      WHERE parent.id = engagement_id
        AND parent.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY engagement_reviews_select_owner ON public.engagement_reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.engagements AS parent
      WHERE parent.id = engagement_id
        AND parent.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY intakes_select_owner ON public.intakes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.engagements AS parent
      WHERE parent.id = engagement_id
        AND parent.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY intake_items_select_owner ON public.intake_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.intakes AS intake
      JOIN public.engagements AS parent ON parent.id = intake.engagement_id
      WHERE intake.id = intake_id
        AND parent.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY engagement_files_select_owner ON public.engagement_files
  FOR SELECT TO authenticated
  USING (
    audience = 'customer'
    AND EXISTS (
      SELECT 1
      FROM public.engagements AS parent
      WHERE parent.id = engagement_id
        AND parent.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY engagement_messages_select_owner ON public.engagement_messages
  FOR SELECT TO authenticated
  USING (
    is_internal = false
    AND EXISTS (
      SELECT 1
      FROM public.engagements AS parent
      WHERE parent.id = engagement_id
        AND parent.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY engagement_change_requests_select_owner ON public.engagement_change_requests
  FOR SELECT TO authenticated
  USING (
    audience = 'customer'
    AND status IN (
      'AWAITING_CUSTOMER_APPROVAL',
      'APPROVED',
      'REJECTED',
      'IN_PROGRESS',
      'COMPLETED'
    )
    AND EXISTS (
      SELECT 1
      FROM public.engagements AS parent
      WHERE parent.id = engagement_id
        AND parent.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY engagement_activities_select_owner ON public.engagement_activities
  FOR SELECT TO authenticated
  USING (
    audience = 'customer'
    AND EXISTS (
      SELECT 1
      FROM public.engagements AS parent
      WHERE parent.id = engagement_id
        AND parent.user_id = (SELECT auth.uid())
    )
  );

-- Admin read and write. No DELETE policy on any studio table.

CREATE POLICY leads_admin_select ON public.leads
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY leads_admin_insert ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY leads_admin_update ON public.leads
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY lead_assessments_admin_select ON public.lead_assessments
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY lead_assessments_admin_insert ON public.lead_assessments
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY lead_assessments_admin_update ON public.lead_assessments
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY proposals_admin_select ON public.proposals
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY proposals_admin_insert ON public.proposals
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY proposals_admin_update ON public.proposals
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY proposal_versions_admin_select ON public.proposal_versions
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY proposal_versions_admin_insert ON public.proposal_versions
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY proposal_versions_admin_update ON public.proposal_versions
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY proposal_internal_notes_admin_select ON public.proposal_internal_notes
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY proposal_internal_notes_admin_insert ON public.proposal_internal_notes
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY proposal_internal_notes_admin_update ON public.proposal_internal_notes
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY contracts_admin_select ON public.contracts
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY contracts_admin_insert ON public.contracts
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY contracts_admin_update ON public.contracts
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY contract_versions_admin_select ON public.contract_versions
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY contract_versions_admin_insert ON public.contract_versions
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY contract_versions_admin_update ON public.contract_versions
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY contract_agreements_admin_select ON public.contract_agreements
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY studio_payments_admin_select ON public.studio_payments
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY studio_payments_admin_update ON public.studio_payments
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY engagements_admin_select ON public.engagements
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY engagements_admin_update ON public.engagements
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY engagement_admin_state_admin_select ON public.engagement_admin_state
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY engagement_admin_state_admin_insert ON public.engagement_admin_state
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY engagement_admin_state_admin_update ON public.engagement_admin_state
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY engagement_milestones_admin_select ON public.engagement_milestones
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY engagement_milestones_admin_insert ON public.engagement_milestones
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY engagement_milestones_admin_update ON public.engagement_milestones
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY engagement_reviews_admin_select ON public.engagement_reviews
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY engagement_reviews_admin_insert ON public.engagement_reviews
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY engagement_reviews_admin_update ON public.engagement_reviews
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY intakes_admin_select ON public.intakes
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY intakes_admin_insert ON public.intakes
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY intakes_admin_update ON public.intakes
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY intake_items_admin_select ON public.intake_items
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY intake_items_admin_insert ON public.intake_items
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY intake_items_admin_update ON public.intake_items
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY intake_item_admin_notes_admin_select ON public.intake_item_admin_notes
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY intake_item_admin_notes_admin_insert ON public.intake_item_admin_notes
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY intake_item_admin_notes_admin_update ON public.intake_item_admin_notes
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY engagement_files_admin_select ON public.engagement_files
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY engagement_files_admin_insert ON public.engagement_files
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY engagement_files_admin_update ON public.engagement_files
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY engagement_messages_admin_select ON public.engagement_messages
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY engagement_messages_admin_insert ON public.engagement_messages
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY engagement_messages_admin_update ON public.engagement_messages
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY engagement_change_requests_admin_select ON public.engagement_change_requests
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY engagement_change_requests_admin_insert ON public.engagement_change_requests
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY engagement_change_requests_admin_update ON public.engagement_change_requests
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY engagement_activities_admin_select ON public.engagement_activities
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));
CREATE POLICY engagement_activities_admin_insert ON public.engagement_activities
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

-- Table grants follow the policies above. DELETE is not granted.
-- engagements: no authenticated INSERT. Creation is create_engagement_from_contract.
-- contract_agreements: admin SELECT only. Inserts stay on service_role.
-- studio_payments: no authenticated INSERT. Updates are admin-only by policy.
-- engagement_activities: no authenticated UPDATE.

REVOKE ALL ON TABLE
  public.leads,
  public.lead_assessments,
  public.proposals,
  public.proposal_versions,
  public.proposal_internal_notes,
  public.contracts,
  public.contract_versions,
  public.contract_agreements,
  public.studio_payments,
  public.engagements,
  public.engagement_admin_state,
  public.engagement_milestones,
  public.engagement_reviews,
  public.intakes,
  public.intake_items,
  public.intake_item_admin_notes,
  public.engagement_files,
  public.engagement_messages,
  public.engagement_change_requests,
  public.engagement_activities
FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE
  public.leads,
  public.lead_assessments,
  public.proposals,
  public.proposal_versions,
  public.proposal_internal_notes,
  public.contracts,
  public.contract_versions,
  public.engagement_admin_state,
  public.engagement_milestones,
  public.engagement_reviews,
  public.intakes,
  public.intake_items,
  public.intake_item_admin_notes,
  public.engagement_files,
  public.engagement_messages,
  public.engagement_change_requests
TO authenticated;

GRANT SELECT, UPDATE ON TABLE public.engagements TO authenticated;
GRANT SELECT ON TABLE public.contract_agreements TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.studio_payments TO authenticated;
GRANT SELECT, INSERT ON TABLE public.engagement_activities TO authenticated;

GRANT ALL ON TABLE
  public.leads,
  public.lead_assessments,
  public.proposals,
  public.proposal_versions,
  public.proposal_internal_notes,
  public.contracts,
  public.contract_versions,
  public.contract_agreements,
  public.studio_payments,
  public.engagements,
  public.engagement_admin_state,
  public.engagement_milestones,
  public.engagement_reviews,
  public.intakes,
  public.intake_items,
  public.intake_item_admin_notes,
  public.engagement_files,
  public.engagement_messages,
  public.engagement_change_requests,
  public.engagement_activities
TO service_role;
