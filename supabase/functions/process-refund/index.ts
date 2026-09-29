// Edge Function: 환불 승인/거절 [v2.2]
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { approveAfterCancel, approvePreconditions, cancelSucceeded, rejectDecision } from './decision.ts'

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

    const impKey = Deno.env.get('PORTONE_IMP_KEY') ?? Deno.env.get('IMP_KEY')
    const impSecret = Deno.env.get('PORTONE_IMP_SECRET') ?? Deno.env.get('IMP_SECRET')
    let dbAction: 'approve' | 'reject' = 'reject'

    if (action === 'approve') {
      const ready = approvePreconditions({
        impUid: order.imp_uid,
        hasKey: Boolean(impKey),
        hasSecret: Boolean(impSecret),
      })
      if (ready.code !== 'READY') {
        return jsonResponse({ success: false, error: { code: ready.code, message: '환불 승인에 필요한 결제 정보가 없습니다.' } }, ready.status, traceId)
      }
      let tokenOk = false
      let cancelOk = false
      try {
        const tokenRes = await fetch('https://api.iamport.kr/users/getToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imp_key: impKey, imp_secret: impSecret }),
        })
        const tokenData = (await tokenRes.json()) as { response?: { access_token?: string } }
        const accessToken = tokenData.response?.access_token
        tokenOk = Boolean(accessToken)
        if (accessToken) {
          const cancelRes = await fetch('https://api.iamport.kr/payments/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ imp_uid: order.imp_uid, amount: order.amount, reason: '고객 환불 요청' }),
          })
          const cancelData = (await cancelRes.json()) as { code?: number; response?: { status?: string } | null }
          cancelOk = cancelSucceeded(cancelData)
        }
      } catch (e) {
        console.error('process-refund cancel', e)
        return jsonResponse({ success: false, error: { code: 'REFUND_ERROR', message: '환불 API 호출 중 오류가 발생했습니다.' } }, 500, traceId)
      }
      const cancelled = approveAfterCancel({ tokenOk, cancelOk })
      if (!cancelled.updateDatabase) {
        return jsonResponse({ success: false, error: { code: cancelled.code, message: '환불 처리에 실패했습니다. PortOne 설정을 확인하세요.' } }, cancelled.status, traceId)
      }
      dbAction = 'approve'
    } else if (!rejectDecision().updateDatabase) {
      return jsonResponse({ success: false, error: { code: 'REFUND_ERROR', message: '환불 거절에 실패했습니다.' } }, 500, traceId)
    }

    const { error: decisionErr } = await supabase.rpc('apply_refund_decision', {
      p_request_id: requestId,
      p_order_id: reqRow.order_id,
      p_reviewer: user.id,
      p_review_note: reviewNote ?? null,
      p_action: dbAction,
      p_amount: order.amount,
    })
    if (decisionErr) {
      console.error('process-refund db', decisionErr.code)
      const code = dbAction === 'approve' ? 'REFUND_DB_CRITICAL' : 'DB_ERROR'
      const message = dbAction === 'approve'
        ? '결제는 취소되었지만 주문 상태 저장에 실패했습니다. 고객센터에 문의해 주세요.'
        : '환불 상태 저장에 실패했습니다.'
      return jsonResponse({ success: false, error: { code, message } }, 500, traceId)
    }

    if (customerEmail) {
      await supabase.functions.invoke('send-email', {
        body: dbAction === 'approve'
          ? { type: 'refund_approved', to: customerEmail, refundAmount: order.amount, reviewNote: reviewNote ?? '' }
          : { type: 'refund_rejected', to: customerEmail, reviewNote: reviewNote ?? '' },
      })
    }

    return jsonResponse({ success: true, data: { requestId, action } }, 200, traceId)
  } catch (e) {
    console.error('process-refund', e)
    return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: '처리 중 오류가 발생했습니다.' } }, 500, traceId)
  }
})
