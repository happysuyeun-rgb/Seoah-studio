-- 027 legacy Data API grants
-- New Supabase projects no longer expose public tables automatically.
-- Grants match existing RLS policies and current client calls.
-- templates stays revoked for anon and authenticated. Use templates_public.
-- service_role keeps ALL because Edge Functions bypass the browser.
-- Draft SQL. Do not apply until a separate integration instruction.

REVOKE ALL ON TABLE
  public.users,
  public.templates,
  public.projects,
  public.orders,
  public.downloads,
  public.faqs,
  public.inquiries,
  public.chatbot_inquiries,
  public.policy_agreements,
  public.refund_requests
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.faqs TO anon;
GRANT SELECT ON TABLE public.templates_public TO anon, authenticated;

GRANT SELECT, UPDATE, DELETE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.projects TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.orders TO authenticated;
GRANT SELECT, INSERT ON TABLE public.downloads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.faqs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.inquiries TO authenticated;
GRANT SELECT ON TABLE public.chatbot_inquiries TO authenticated;
GRANT SELECT, INSERT ON TABLE public.policy_agreements TO authenticated;
GRANT SELECT, INSERT ON TABLE public.refund_requests TO authenticated;

GRANT ALL ON TABLE
  public.users,
  public.templates,
  public.projects,
  public.orders,
  public.downloads,
  public.faqs,
  public.inquiries,
  public.chatbot_inquiries,
  public.policy_agreements,
  public.refund_requests
TO service_role;

GRANT SELECT ON TABLE public.templates_public TO service_role;
