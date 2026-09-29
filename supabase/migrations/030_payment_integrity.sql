-- 030 payment integrity
-- Additive only. Does not change 001-029.
-- Official orders are empty, so NOT NULL does not rewrite existing rows.

ALTER TABLE public.orders
  ALTER COLUMN imp_uid SET NOT NULL;

ALTER TABLE public.orders
  ALTER COLUMN payment_key SET NOT NULL;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_imp_uid_key;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_imp_uid_key UNIQUE (imp_uid);

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_key_key;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_key_key UNIQUE (payment_key);

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_imp_uid_not_blank;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_imp_uid_not_blank CHECK (char_length(imp_uid) > 0);

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_key_not_blank;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_key_not_blank CHECK (char_length(payment_key) > 0);

-- Refund status changes stay in one transaction after PortOne cancel succeeds.
CREATE OR REPLACE FUNCTION public.apply_refund_decision(
  p_request_id uuid,
  p_order_id uuid,
  p_reviewer uuid,
  p_review_note text,
  p_action text,
  p_amount integer
) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  updated_request uuid;
  updated_order uuid;
BEGIN
  IF p_action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'invalid refund action';
  END IF;

  UPDATE public.refund_requests
  SET
    status = CASE WHEN p_action = 'approve' THEN 'approved' ELSE 'rejected' END,
    reviewed_by = p_reviewer,
    review_note = p_review_note,
    reviewed_at = now()
  WHERE id = p_request_id AND status = 'requested'
  RETURNING id INTO updated_request;

  IF updated_request IS NULL THEN
    RAISE EXCEPTION 'refund request was not updated';
  END IF;

  UPDATE public.orders
  SET
    status = CASE WHEN p_action = 'approve' THEN 'refunded' ELSE 'refund_rejected' END,
    refunded_amount = CASE WHEN p_action = 'approve' THEN p_amount ELSE refunded_amount END,
    refunded_at = CASE WHEN p_action = 'approve' THEN now() ELSE refunded_at END
  WHERE id = p_order_id
  RETURNING id INTO updated_order;

  IF updated_order IS NULL THEN
    RAISE EXCEPTION 'order was not updated';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_refund_decision(uuid, uuid, uuid, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_refund_decision(uuid, uuid, uuid, text, text, integer) TO service_role;

-- Owner can remove only their own private uploads after a failed draft upload.
DROP POLICY IF EXISTS "project_uploads_delete_own" ON storage.objects;
CREATE POLICY "project_uploads_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
