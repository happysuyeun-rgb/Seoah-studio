// Edge Function: 회원탈퇴 [v2.2] — projects·inquiries 비식별화, Auth 사용자 삭제
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' }
type ApiError = { code: string; message: string; detail?: unknown }
type ApiResponse = { success: boolean; data?: unknown; error?: ApiError; traceId?: string }
function jsonResponse(obj: ApiResponse, status: number, traceId: string) {
  return new Response(JSON.stringify({ ...obj, traceId }), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

// 비식별화용 시스템 UUID (고정값, users에 레코드 필요)
const DELETED_USER_PLACEHOLDER = '00000000-0000-0000-0000-000000000001'

Deno.serve(async (req) => {
  const traceId = crypto.randomUUID()
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    let body: { userId?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return jsonResponse({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid request body' } }, 400, traceId)
    }
    const { userId } = body
    if (!userId) return jsonResponse({ success: false, error: { code: 'INVALID_PARAMS', message: 'userId required' } }, 400, traceId)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authorization required' } }, 401, traceId)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ success: false, error: { code: 'ENV_MISSING', message: '서버 환경 설정 오류' } }, 500, traceId)
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !user) return jsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401, traceId)
    if (user.id !== userId) return jsonResponse({ success: false, error: { code: 'FORBIDDEN', message: '본인 계정만 탈퇴할 수 있습니다.' } }, 403, traceId)

    // 삭제용 placeholder 사용자 (비식별화 대상 FK용)
    const { data: placeholder } = await supabase.from('users').select('id').eq('id', DELETED_USER_PLACEHOLDER).maybeSingle()
    if (!placeholder) {
      const { error: createErr } = await supabase.auth.admin.createUser({
        id: DELETED_USER_PLACEHOLDER,
        email: 'deleted-placeholder@seoah.studio',
        password: crypto.randomUUID(),
        email_confirm: true,
      })
      if (createErr) console.warn('delete-account placeholder create', createErr)
    }

    // projects 비식별화 (user_id → placeholder)
    await supabase.from('projects').update({ user_id: DELETED_USER_PLACEHOLDER }).eq('user_id', userId)

    // inquiries 비식별화
    await supabase.from('inquiries').update({ user_id: DELETED_USER_PLACEHOLDER }).eq('user_id', userId)

    // policy_agreements 삭제 (본인 동의 기록)
    await supabase.from('policy_agreements').delete().eq('user_id', userId)

    // Auth 사용자 삭제 (admin API)
    const { error: deleteErr } = await supabase.auth.admin.deleteUser(userId)
    if (deleteErr) {
      console.error('delete-account auth delete', deleteErr)
      return jsonResponse({ success: false, error: { code: 'AUTH_ERROR', message: '계정 삭제에 실패했습니다. 고객센터에 문의해 주세요.' } }, 500, traceId)
    }

    return jsonResponse({ success: true, data: {} }, 200, traceId)
  } catch (e) {
    console.error('delete-account', e)
    return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: '처리 중 오류가 발생했습니다.' } }, 500, traceId)
  }
})
