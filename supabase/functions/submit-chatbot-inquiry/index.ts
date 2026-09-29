// Supabase Edge Function: 챗봇 문의 접수 (v2.1 Rate Limit + traceId)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CHATBOT_RATE_LIMIT, CHATBOT_RATE_WINDOW_MS, validateChatbotInput } from './validate.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' }

type ApiError = { code: string; message: string; detail?: unknown }
type ApiResponse = { success: boolean; data?: Record<string, never>; error?: ApiError; traceId?: string }
function jsonResponse(obj: ApiResponse, status: number, traceId: string) {
  return new Response(JSON.stringify({ ...obj, traceId }), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

function getClientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for') ?? req.headers.get('X-Forwarded-For') ?? ''
  const first = xf.split(',')[0]?.trim()
  return first || 'unknown'
}

Deno.serve(async (req) => {
  const traceId = crypto.randomUUID()
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    let body: { category?: string; content?: string; name?: string; email?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return jsonResponse({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid request body' } }, 400, traceId)
    }

    const parsed = validateChatbotInput(body)
    if (!parsed.ok) {
      const message = parsed.code === 'MISSING_PARAMS' ? 'content, name, email required' : '입력 내용을 확인해 주세요.'
      return jsonResponse({ success: false, error: { code: parsed.code, message } }, parsed.status, traceId)
    }
    const { category, content, name, email } = parsed

    const ip = getClientIp(req)
    const ua = req.headers.get('user-agent') ?? ''

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ success: false, error: { code: 'ENV_MISSING', message: '서버 환경 설정 오류' } }, 500, traceId)
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Rate limit: IP당 1분 5건
    const oneMinuteAgo = new Date(Date.now() - CHATBOT_RATE_WINDOW_MS).toISOString()
    const { count: recentCount, error: countErr } = await supabase
      .from('chatbot_inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', oneMinuteAgo)

    if (countErr) {
      console.error('submit-chatbot-inquiry rate count failed', countErr)
      return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: 'rate limit check failed' } }, 500, traceId)
    }

    if ((recentCount ?? 0) >= CHATBOT_RATE_LIMIT) {
      return jsonResponse({ success: false, error: { code: 'RATE_LIMITED', message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' } }, 429, traceId)
    }

    const { error: insErr } = await supabase.from('chatbot_inquiries').insert({
      category: category || null,
      content,
      name,
      email,
      ip,
      user_agent: ua,
    })
    if (insErr) {
      console.error('submit-chatbot-inquiry insert failed', insErr)
      return jsonResponse({ success: false, error: { code: 'DB_ERROR', message: '저장에 실패했습니다.' } }, 500, traceId)
    }

    // 관리자 알림 이메일 (실패해도 접수는 유지)
    try {
      if (supabaseUrl && serviceRoleKey) {
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceRoleKey}` },
          body: JSON.stringify({
            type: 'chatbot_alert',
            category,
            content,
            name,
            userEmail: email,
          }),
        })
      }
    } catch (_) {}

    return jsonResponse({ success: true }, 200, traceId)
  } catch (e) {
    const err = e as Error
    console.error('submit-chatbot-inquiry Critical', err?.message ?? e)
    return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: err?.message ?? '서버 오류' } }, 500, traceId)
  }
})

