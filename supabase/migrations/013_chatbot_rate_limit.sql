-- v2.1 P0 보안-D: 챗봇 스팸 방지 (IP Rate Limit)
-- - chatbot_inquiries는 클라이언트 직접 INSERT 금지 (Edge Function만)
-- - IP 저장용 컬럼 추가 + 1분 5건 제한을 Edge Function에서 적용

ALTER TABLE public.chatbot_inquiries
  ADD COLUMN IF NOT EXISTS ip text,
  ADD COLUMN IF NOT EXISTS user_agent text;

CREATE INDEX IF NOT EXISTS idx_chatbot_inquiries_ip_created_at
  ON public.chatbot_inquiries(ip, created_at DESC);

-- 기존 "누구나 INSERT" 정책 제거 → 기본 거부(정책 없음)
DROP POLICY IF EXISTS "chatbot_inquiries_insert_all" ON public.chatbot_inquiries;

