// Edge Function: 환불 요청 제출 [v2.2]
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { isOwnedRefundAttachment } from './attachment.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' }
type ApiError = { code: string; message: string; detail?: unknown }
type ApiResponse = { success: boolean; data?: unknown; error?: ApiError; traceId?: string }
function jsonResponse(obj: ApiResponse, status: number, traceId: string) {
  return new Response(JSON.stringify({ ...obj, traceId }), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  const traceId = crypto.randomUUID()
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    let body: { orderId?: string; reason?: string; attachmentPath?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return jsonResponse({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid request body' } }, 400, traceId)
    }
    const { orderId, reason, attachmentPath } = body
    if (!orderId || !reason || reason.trim().length < 10) {
      return jsonResponse({ success: false, error: { code: 'INVALID_PARAMS', message: 'orderId and reason (min 10 chars) required' } }, 400, traceId)
    }

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

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, user_id, status, amount')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderErr || !order) return jsonResponse({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } }, 404, traceId)
    if (order.status === 'refunded' || order.status === 'refund_rejected') {
      return jsonResponse({ success: false, error: { code: 'ALREADY_PROCESSED', message: '이미 환불 처리된 주문입니다.' } }, 409, traceId)
    }

    const { data: existing } = await supabase.from('refund_requests').select('id').eq('order_id', orderId).maybeSingle()
    if (existing) return jsonResponse({ success: false, error: { code: 'DUPLICATE_REQUEST', message: '이미 환불 요청이 접수되었습니다.' } }, 409, traceId)
    if (!isOwnedRefundAttachment(attachmentPath, user.id, orderId)) {
      return jsonResponse({ success: false, error: { code: 'INVALID_ATTACHMENT', message: '첨부 경로가 올바르지 않습니다.' } }, 400, traceId)
    }

    const { error: insertErr } = await supabase.from('refund_requests').insert({
      order_id: orderId,
      user_id: user.id,
      reason: reason.trim(),
      attachment_url: attachmentPath || null,
      status: 'requested',
    })
    if (insertErr) {
      console.error('submit-refund-request insert', insertErr)
      return jsonResponse({ success: false, error: { code: 'DB_ERROR', message: '환불 요청 저장에 실패했습니다.' } }, 500, traceId)
    }

    await supabase.from('orders').update({ status: 'refund_requested' }).eq('id', orderId)

    // 관리자 알림 이메일 (실패해도 환불 요청은 유지)
    const adminEmail = Deno.env.get('ADMIN_EMAIL')
    if (adminEmail) {
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'refund_alert',
            orderId,
            userId: user.id,
            reason: reason.trim(),
            amount: order.amount,
          },
        })
      } catch (e) {
        console.warn('관리자 환불 알림 이메일 발송 실패:', e)
      }
    }

    return jsonResponse({ success: true, data: { orderId } }, 200, traceId)
  } catch (e) {
    console.error('submit-refund-request', e)
    return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: '처리 중 오류가 발생했습니다.' } }, 500, traceId)
  }
})
