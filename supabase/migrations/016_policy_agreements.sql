-- policy_agreements [v2.2] — 정책 동의 로그
CREATE TABLE IF NOT EXISTS public.policy_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  policy_type text NOT NULL,  -- terms / privacy / refund / marketing
  version text NOT NULL,     -- e.g. 2026-03
  is_required boolean NOT NULL DEFAULT true,
  agreed boolean NOT NULL DEFAULT true,
  source text,               -- checkout / settings / signup
  agreed_at timestamptz DEFAULT now()
);

ALTER TABLE public.policy_agreements ENABLE ROW LEVEL SECURITY;

-- 본인만 SELECT
CREATE POLICY "policy_agreements_select_own" ON public.policy_agreements
  FOR SELECT USING (auth.uid() = user_id);

-- 본인만 INSERT (결제 시 동의 기록)
CREATE POLICY "policy_agreements_insert_own" ON public.policy_agreements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE/DELETE는 관리자만 (정정 필요 시)
-- 기본적으로 보존 필수

CREATE INDEX IF NOT EXISTS idx_policy_agreements_user_id ON public.policy_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_agreements_policy_type ON public.policy_agreements(policy_type);
