-- SEOAH.STUDIO v2: 챗봇 문의 (CB-P1)
CREATE TABLE IF NOT EXISTS public.chatbot_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text,
  content text,
  name text,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.chatbot_inquiries ENABLE ROW LEVEL SECURITY;

-- INSERT: 누구나 (비로그인 포함)
CREATE POLICY "chatbot_inquiries_insert_all" ON public.chatbot_inquiries FOR INSERT WITH CHECK (true);
-- SELECT: 관리자만
CREATE POLICY "chatbot_inquiries_select_admin" ON public.chatbot_inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

CREATE INDEX IF NOT EXISTS idx_chatbot_inquiries_created_at ON public.chatbot_inquiries(created_at DESC);
