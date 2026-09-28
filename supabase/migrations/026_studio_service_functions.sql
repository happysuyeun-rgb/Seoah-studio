-- 026 studio service functions
-- Only create_engagement_from_contract. Payment provider RPCs are later.
-- Draft SQL. Do not apply until a separate integration instruction.
--
-- EXECUTE is limited to service_role.
-- The body also accepts an admin JWT so a later GRANT to authenticated
-- would still reject customers. anon and authenticated cannot execute it now.
-- SECURITY DEFINER with search_path = public. The function bypasses RLS,
-- which is required to insert the engagement and link the deposit.

CREATE OR REPLACE FUNCTION public.create_engagement_from_contract(p_contract_id uuid)
RETURNS public.engagements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contract public.contracts%ROWTYPE;
  v_proposal public.proposals%ROWTYPE;
  v_user_id uuid;
  v_name text;
  v_project_type text;
  v_engagement public.engagements%ROWTYPE;
  v_deposit_count integer;
BEGIN
  IF COALESCE(auth.role(), '') IS DISTINCT FROM 'service_role' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'create_engagement_from_contract requires admin or service role';
  END IF;

  SELECT *
  INTO v_contract
  FROM public.contracts
  WHERE id = p_contract_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'contract not found';
  END IF;

  IF v_contract.status IS DISTINCT FROM 'AGREED' THEN
    RAISE EXCEPTION 'contract is not AGREED';
  END IF;

  SELECT *
  INTO v_proposal
  FROM public.proposals
  WHERE id = v_contract.proposal_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'proposal not found';
  END IF;

  IF v_proposal.status IS DISTINCT FROM 'APPROVED' THEN
    RAISE EXCEPTION 'proposal is not APPROVED';
  END IF;

  PERFORM 1
  FROM public.studio_payments
  WHERE contract_id = p_contract_id
    AND type = 'DEPOSIT'
    AND status = 'PAID'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'paid deposit not found';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.engagements
    WHERE contract_id = p_contract_id
  ) THEN
    RAISE EXCEPTION 'engagement already exists for contract';
  END IF;

  SELECT user_id, COALESCE(NULLIF(btrim(company), ''), NULLIF(btrim(name), '')), project_type
  INTO v_user_id, v_name, v_project_type
  FROM public.leads
  WHERE id = v_proposal.lead_id;

  v_user_id := COALESCE(v_contract.user_id, v_proposal.user_id, v_user_id);

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'engagement requires a user';
  END IF;

  INSERT INTO public.engagements (
    user_id,
    lead_id,
    proposal_id,
    contract_id,
    name,
    project_type,
    status,
    progress_stage,
    progress
  )
  VALUES (
    v_user_id,
    v_proposal.lead_id,
    v_proposal.id,
    v_contract.id,
    COALESCE(v_name, 'Project'),
    v_project_type,
    'WAITING_CONTENT',
    '준비',
    0
  )
  RETURNING * INTO v_engagement;

  INSERT INTO public.engagement_admin_state (engagement_id)
  VALUES (v_engagement.id);

  UPDATE public.studio_payments
  SET engagement_id = v_engagement.id
  WHERE contract_id = p_contract_id
    AND type = 'DEPOSIT'
    AND status = 'PAID'
    AND engagement_id IS NULL;

  GET DIAGNOSTICS v_deposit_count = ROW_COUNT;

  IF v_deposit_count < 1 THEN
    RAISE EXCEPTION 'paid deposit was not linked';
  END IF;

  RETURN v_engagement;
END;
$$;

COMMENT ON FUNCTION public.create_engagement_from_contract(uuid) IS
  'Creates one WAITING_CONTENT engagement after proposal approval, contract agreement, and a paid deposit. engagements.contract_id is unique. Does not call a payment provider.';

REVOKE ALL ON FUNCTION public.create_engagement_from_contract(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_engagement_from_contract(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_engagement_from_contract(uuid) TO service_role;
