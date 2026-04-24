// Supabase Edge Function: 만료된 signed URL 재발급 (마이페이지 재다운로드)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' }
const BUCKET = 'project-outputs'
const SIGNED_EXPIRY_SEC = 604800 // 7일

type ApiError = { code: string; message: string; detail?: unknown }
type ApiResponse = { success: boolean; data?: { downloadUrl: string }; error?: ApiError; traceId?: string }
function jsonResponse(obj: ApiResponse, status: number, traceId: string) {
  return new Response(JSON.stringify({ ...obj, traceId }), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  const traceId = crypto.randomUUID()
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    let body: { projectId?: string }
    try {
      body = (await req.json()) as { projectId?: string }
    } catch {
      return jsonResponse({ success: false, error: { code: 'INVALID_PARAMS', message: 'Invalid request body' } }, 400, traceId)
    }
    const projectId = body?.projectId
    if (!projectId || typeof projectId !== 'string') {
      return jsonResponse({ success: false, error: { code: 'INVALID_PARAMS', message: 'projectId required' } }, 400, traceId)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authorization required' } }, 401, traceId)
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ success: false, error: { code: 'ENV_MISSING', message: '서버 환경 설정 오류' } }, 500, traceId)
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !user) {
      return jsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401, traceId)
    }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (orderErr) {
      return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: orderErr.message } }, 500, traceId)
    }
    if (!order) {
      return jsonResponse({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, 403, traceId)
    }
    if (order.status !== 'paid') {
      return jsonResponse({ success: false, error: { code: 'NOT_PAID', message: 'Order is not paid' } }, 402, traceId)
    }

    const path = `${projectId}/website.zip`
    const { data: signedData, error: signedErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_EXPIRY_SEC)

    if (signedErr || !signedData?.signedUrl) {
      return jsonResponse({ success: false, error: { code: 'FILE_NOT_FOUND', message: 'File not found or unavailable' } }, 404, traceId)
    }

    const { error: insertErr } = await supabase.from('downloads').insert({
      order_id: order.id,
      file_type: 'html',
      file_url: signedData.signedUrl,
    })
    if (insertErr) {
      console.error('get-download-url downloads insert', insertErr)
      return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: insertErr.message } }, 500, traceId)
    }

    return jsonResponse({ success: true, data: { downloadUrl: signedData.signedUrl } }, 200, traceId)
  } catch (e) {
    const err = e as Error
    console.error('get-download-url Critical', err?.message ?? e)
    return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: err?.message ?? 'Internal error' } }, 500, traceId)
  }
})
