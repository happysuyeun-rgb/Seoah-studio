-- orders 테이블 확장 [v2.2] — 결제 수단, 환불 관련 컬럼
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS refunded_amount integer,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS receipt_url text;

-- status에 refund 관련 값 허용 (기존 CHECK가 있으면 제거 후 재생성)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_status_check'
    AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;
  END IF;
END $$;

-- status 허용 값: pending, paid, failed, cancelled, refund_requested, refunded, refund_rejected
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  status IN ('pending', 'paid', 'failed', 'cancelled', 'refund_requested', 'refunded', 'refund_rejected')
);
