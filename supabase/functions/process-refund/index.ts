// Edge Function: 환불 승인/거절 [v2.2]
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    let body: { requestId?: string; action?: 'approve' | 'reject'; reviewNote?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return jsonResponse({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid request body' } }, 400, traceId)
    }
    const { requestId, action, reviewNote } = body
    if (!requestId || !action || !['approve', 'reject'].includes(action)) {
      return jsonResponse({ success: false, error: { code: 'INVALID_PARAMS', message: 'requestId and action(approve|reject) required' } }, 400, traceId)
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

    const { data: adminUser } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
    if (!adminUser?.is_admin) return jsonResponse({ success: false, error: { code: 'FORBIDDEN', message: 'Admin only' } }, 403, traceId)

    const { data: reqRow, error: reqErr } = await supabase
      .from('refund_requests')
      .select('id, order_id, user_id, status')
      .eq('id', requestId)
      .single()

    if (reqErr || !reqRow) return jsonResponse({ success: false, error: { code: 'NOT_FOUND', message: 'Refund request not found' } }, 404, traceId)
    if (reqRow.status !== 'requested') return jsonResponse({ success: false, error: { code: 'ALREADY_PROCESSED', message: 'Already processed' } }, 409, traceId)

    const { data: order } = await supabase.from('orders').select('id, amount, imp_uid, user_id').eq('id', reqRow.order_id).single()
    if (!order) return jsonResponse({ success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } }, 404, traceId)

    const { data: customer } = await supabase.from('users').select('email').eq('id', reqRow.user_id).single()
    const customerEmail = (customer as { email?: string })?.email ?? ''

    if (action === 'approve') {
      // PortOne 환불 API 호출 (구현 시 환경변수 필요)
      const impKey = Deno.env.get('PORTONE_IMP_KEY') ?? Deno.env.get('IMP_KEY')
      const impSecret = Deno.env.get('PORTONE_IMP_SECRET') ?? Deno.env.get('IMP_SECRET')
      if (impKey && impSecret && order.imp_uid) {
        try {
          const tokenRes = await fetch('https://api.iamport.kr/users/getToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imp_key: impKey, imp_secret: impSecret }),
          })
          const tokenData = (await tokenRes.json()) as { response?: { access_token?: string } }
          const accessToken = tokenData.response?.access_token
          if (accessToken) {
            const cancelRes = await fetch('https://api.iamport.kr/payments/cancel', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify({ imp_uid: order.imp_uid, amount: order.amount, reason: '고객 환불 요청' }),
            })
            const cancelData = (await cancelRes.json()) as { code?: number }
            if (cancelData.code !== 0) {
              console.error('process-refund PortOne cancel failed', await cancelRes.text())
              return jsonResponse({ success: false, error: { code: 'PORTONE_CANCEL_FAILED', message: '환불 처리에 실패했습니다. PortOne 설정을 확인하세요.' } }, 502, traceId)
            }
          }
        } catch (e) {
          console.error('process-refund cancel', e)
          return jsonResponse({ success: false, error: { code: 'REFUND_ERROR', message: '환불 API 호출 중 오류가 발생했습니다.' } }, 500, traceId)
        }
      }

      await supabase.from('refund_requests').update({
        status: 'approved',
        reviewed_by: user.id,
        review_note: reviewNote ?? null,
        reviewed_at: new Date().toISOString(),
      }).eq('id', requestId)

      await supabase.from('orders').update({
        status: 'refunded',
        refunded_amount: order.amount,
        refunded_at: new Date().toISOString(),
      }).eq('id', reqRow.order_id)

      if (customerEmail) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'refund_approved',
            to: customerEmail,
            refundAmount: order.amount,
            reviewNote: reviewNote ?? '',
          },
        })
      }
    } else {
      await supabase.from('refund_requests').update({
        status: 'rejected',
        reviewed_by: user.id,
        review_note: reviewNote ?? null,
        reviewed_at: new Date().toISOString(),
      }).eq('id', requestId)

      await supabase.from('orders').update({ status: 'refund_rejected' }).eq('id', reqRow.order_id)

      if (customerEmail) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'refund_rejected',
            to: customerEmail,
            reviewNote: reviewNote ?? '',
          },
        })
      }
    }

    return jsonResponse({ success: true, data: { requestId, action } }, 200, traceId)
  } catch (e) {
    console.error('process-refund', e)
    return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: '처리 중 오류가 발생했습니다.' } }, 500, traceId)
  }
})
