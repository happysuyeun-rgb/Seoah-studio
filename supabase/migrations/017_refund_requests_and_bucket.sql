-- refund_requests [v2.2] — 환불 요청 상세
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  attachment_url text,
  status text NOT NULL DEFAULT 'requested',  -- requested / approved / rejected
  reviewed_by uuid REFERENCES public.users(id),
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT refund_reason_min_length CHECK (char_length(reason) >= 10)
);

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

-- 본인만 SELECT (자신의 환불 요청만) + 관리자 전체 SELECT
CREATE POLICY "refund_requests_select_own" ON public.refund_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "refund_requests_select_admin" ON public.refund_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- 본인만 INSERT
CREATE POLICY "refund_requests_insert_own" ON public.refund_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE는 관리자만 (검토/승인/거절)
-- 서비스 역할로 처리하므로 별도 정책은 없음. RPC 또는 Edge Function 사용.

CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id ON public.refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON public.refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests(status);

-- orders.status 확장용 값 추가 (refund_requested, refunded, refund_rejected)
-- CHECK 제약이 있으면 마이그레이션 018에서 처리
