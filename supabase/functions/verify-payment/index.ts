// Supabase Edge Function: 결제 검증 (PortOne REST API 연동 시 imp_uid로 검증, v2.1 traceId)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' }
type ApiError = { code: string; message: string; detail?: unknown }
type ApiResponse = { success: boolean; data?: { orderId?: string }; error?: ApiError; traceId?: string }
function jsonResponse(obj: ApiResponse, status: number, traceId: string) {
  return new Response(JSON.stringify({ ...obj, traceId }), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  const traceId = crypto.randomUUID()
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    let body: { imp_uid?: string; merchant_uid?: string; amount?: number; projectId?: string; planType?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return jsonResponse({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid request body' } }, 400, traceId)
    }
    const { imp_uid, merchant_uid, amount, projectId, planType } = body
    if (!imp_uid || !projectId) return jsonResponse({ success: false, error: { code: 'MISSING_PARAMS', message: 'imp_uid, projectId required' } }, 400, traceId)

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

    const { data: proj } = await supabase.from('projects').select('id, user_id').eq('id', projectId).single()
    if (!proj || proj.user_id !== user.id) return jsonResponse({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404, traceId)

    // 결제 중복 방지: 이미 해당 프로젝트로 paid 주문이 있으면 409
    const { data: existingOrder } = await supabase.from('orders').select('id').eq('project_id', projectId).eq('user_id', user.id).eq('status', 'paid').maybeSingle()
    if (existingOrder) return jsonResponse({ success: false, error: { code: 'ALREADY_PAID', message: '이미 결제가 완료된 주문입니다.' } }, 409, traceId)

    // PortOne(아임포트) REST API로 imp_uid 검증 및 금액 일치 확인
    const impKey = Deno.env.get('PORTONE_IMP_KEY') ?? Deno.env.get('IMP_KEY')
    const impSecret = Deno.env.get('PORTONE_IMP_SECRET') ?? Deno.env.get('IMP_SECRET')
    let payMethod: string | null = null
    if (impKey && impSecret) {
      const tokenRes = await fetch('https://api.iamport.kr/users/getToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imp_key: impKey, imp_secret: impSecret }),
      })
      const tokenData = (await tokenRes.json()) as { response?: { access_token?: string }; code?: number }
      const accessToken = tokenData.response?.access_token
      if (!accessToken) {
        console.error('verify-payment PortOne token failed')
        return jsonResponse({ success: false, error: { code: 'PAYMENT_SERVICE_ERROR', message: '결제 서비스 인증에 실패했습니다.' } }, 502, traceId)
      }
      const payRes = await fetch(`https://api.iamport.kr/payments/${imp_uid}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const payData = (await payRes.json()) as { response?: { status?: string; amount?: number; pay_method?: string }; code?: number }
      const payment = payData.response
      if (payData.code !== 0 || !payment) {
        return jsonResponse({ success: false, error: { code: 'PAYMENT_INVALID', message: '결제 정보를 찾을 수 없거나 유효하지 않습니다.' } }, 400, traceId)
      }
      if (payment.status !== 'paid') {
        return jsonResponse({ success: false, error: { code: 'PAYMENT_NOT_COMPLETED', message: '결제가 완료되지 않았습니다.' } }, 402, traceId)
      }
      const paidAmount = Number(payment.amount)
      if (Number.isNaN(paidAmount) || paidAmount !== amount) {
        console.error('verify-payment AMOUNT_MISMATCH', { paidAmount, amount })
        return jsonResponse({ success: false, error: { code: 'AMOUNT_MISMATCH', message: '결제 금액이 일치하지 않습니다. 환불이 필요할 수 있습니다.' }, detail: { paidAmount, amount } }, 402, traceId)
      }
      payMethod = payment?.pay_method ?? null
    }

    const { data: order, error: orderErr } = await supabase.from('orders').insert({
      user_id: user.id,
      project_id: projectId,
      plan_type: planType,
      amount,
      imp_uid,
      payment_key: merchant_uid,
      status: 'paid',
      payment_method: payMethod,
    }).select('id').single()

    if (orderErr) {
      console.error('verify-payment order insert', orderErr)
      return jsonResponse({ success: false, error: { code: 'ORDER_FAILED', message: orderErr.message } }, 500, traceId)
    }

    await supabase.from('projects').update({ status: 'paid' }).eq('id', projectId)

    let downloadUrl = ''
    let delivered = false
    const { data: projRow } = await supabase.from('projects').select('output_html').eq('id', projectId).single()
    if (projRow?.output_html) {
      try {
        const JSZip = (await import('https://esm.sh/jszip')).default
        const zip = new JSZip()
        zip.file('index.html', projRow.output_html)
        const zipBlob = await zip.generateAsync({ type: 'uint8array' })
        const path = `${projectId}/website.zip`
        const { error: upErr } = await supabase.storage.from('project-outputs').upload(path, zipBlob, { contentType: 'application/zip', upsert: true })
        if (!upErr) {
          const { data: signed } = await supabase.storage.from('project-outputs').createSignedUrl(path, 604800)
          if (signed?.signedUrl) {
            downloadUrl = signed.signedUrl
            if (order?.id) {
              const { error: dlErr } = await supabase.from('downloads').insert({ order_id: order.id, file_type: 'html', file_url: downloadUrl })
              if (!dlErr) delivered = true
            }
          }
        }
      } catch (_) {}
    }

    if (delivered) {
      await supabase.from('projects').update({ status: 'fulfilled' }).eq('id', projectId)
    }

    const { data: userRow } = await supabase.from('users').select('email, name').eq('id', user.id).single()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (userRow?.email && supabaseUrl && serviceKey) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
          body: JSON.stringify({
            to: userRow.email,
            userName: userRow.name || user.user_metadata?.name || '고객',
            projectId,
            planType,
            downloadUrl,
          }),
        })
      } catch (_) {}
    }

    return jsonResponse({ success: true, data: { orderId: order?.id } }, 200, traceId)
  } catch (e) {
    const err = e as Error
    console.error('verify-payment Critical', err?.message ?? e)
    return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: err?.message ?? '서버 오류' } }, 500, traceId)
  }
})
