// Supabase Edge Function: 결제 완료 이메일 (Resend API 연동) — v2 S1-P3
// Payment, refund, and chatbot mail are sent only by other Edge Functions with the service role.
// A browser may request only its own inquiry alert, or an admin reply whose recipient comes from the database.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { classifyCaller, decideMail } from './access.ts'
import { resolveOutboundMail } from './mail.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' }
type ApiError = { code: string; message: string; detail?: unknown }
type ApiResponse = { success: boolean; data?: { skipped?: boolean }; error?: ApiError; traceId?: string }
function jsonResponse(obj: ApiResponse, status: number, traceId: string) {
  return new Response(JSON.stringify({ ...obj, traceId }), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  const traceId = crypto.randomUUID()
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    let body: {
      to?: string
      userName?: string
      projectId?: string
      planType?: string
      downloadUrl?: string
      type?: string
      inquiryId?: string
      subject?: string
      body?: string
      userEmail?: string
      inquirySubject?: string
      adminReply?: string
      refundAmount?: number
      reviewNote?: string
      category?: string
      content?: string
      name?: string
      orderId?: string
      reason?: string
      amount?: number
    }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return jsonResponse({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid request body' } }, 400, traceId)
    }

    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const caller = await classifyCaller(token, serviceKey, async (jwt) => {
      if (!supabaseUrl || !serviceKey) return null
      const supabase = createClient(supabaseUrl, serviceKey)
      const { data, error } = await supabase.auth.getUser(jwt)
      if (error || !data.user?.id) return null
      return { id: data.user.id }
    })
    if (caller.kind === 'anonymous') {
      return jsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authorization required' } }, 401, traceId)
    }
    if (caller.kind === 'user') {
      if (!supabaseUrl || !serviceKey) {
        return jsonResponse({ success: false, error: { code: 'ENV_MISSING', message: '서버 환경 설정 오류' } }, 500, traceId)
      }
      const supabase = createClient(supabaseUrl, serviceKey)
      const clientTo = body.to
      body.to = undefined
      let ownsInquiry = false
      let isAdmin = false
      let customerEmail: string | null = null
      if (body.type === 'inquiry_alert' && body.inquiryId) {
        const { data: inquiry } = await supabase.from('inquiries').select('id, user_id, subject, body').eq('id', body.inquiryId).maybeSingle()
        ownsInquiry = Boolean(inquiry && inquiry.user_id === caller.userId)
        if (ownsInquiry && inquiry) {
          body.subject = inquiry.subject
          body.body = inquiry.body
          const { data: profile } = await supabase.from('users').select('email').eq('id', caller.userId).maybeSingle()
          body.userEmail = profile?.email ?? ''
        }
      }
      if (body.type === 'inquiry_answered' && body.inquiryId) {
        const { data: admin } = await supabase.from('users').select('is_admin').eq('id', caller.userId).maybeSingle()
        isAdmin = admin?.is_admin === true
        const { data: inquiry } = await supabase.from('inquiries').select('id, user_id, subject').eq('id', body.inquiryId).maybeSingle()
        if (inquiry?.user_id) {
          const { data: owner } = await supabase.from('users').select('email').eq('id', inquiry.user_id).maybeSingle()
          customerEmail = owner?.email ?? null
          if (isAdmin) body.inquirySubject = inquiry.subject
        }
      }
      const decision = decideMail({
        caller: 'user',
        type: body.type,
        isAdmin,
        ownsInquiry,
        hasInquiryId: Boolean(body.inquiryId),
        clientTo,
        customerEmail,
        adminEmail: Deno.env.get('ADMIN_EMAIL') ?? 'support@seoah.studio',
      })
      if (!decision.ok) {
        const message = decision.code === 'MISSING_INQUIRY'
          ? 'inquiryId required'
          : decision.code === 'MISSING_TO'
            ? '수신 이메일이 없습니다.'
            : '이 메일 종류는 서버에서만 보낼 수 있습니다.'
        return jsonResponse({ success: false, error: { code: decision.code, message } }, decision.status, traceId)
      }
      body.to = decision.to
    }

    const apiKey = Deno.env.get('RESEND_API_KEY')
    if (!apiKey) {
      console.warn('RESEND_API_KEY not set, skipping email send')
      return jsonResponse({ success: true, data: { skipped: true } }, 200, traceId)
    }

    let to: string
    let subject: string
    let html: string

    if (body.type === 'inquiry_alert' && body.inquiryId && body.subject != null) {
      const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'support@seoah.studio'
      to = adminEmail
      subject = '[SEOAH.STUDIO] 1:1 문의 접수: ' + (body.subject?.slice(0, 50) || '')
      html = `
        <p>새 1:1 문의가 접수되었습니다.</p>
        <p>문의 ID: ${body.inquiryId}</p>
        <p>제목: ${body.subject}</p>
        <p>내용:</p>
        <pre>${(body.body ?? '').replace(/</g, '&lt;')}</pre>
        <p>문의자: ${body.userEmail ?? '-'}</p>
        <p>— SEOAH.STUDIO</p>
      `
    } else if (body.type === 'chatbot_alert' && body.category != null && body.content != null) {
      const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'support@seoah.studio'
      to = adminEmail
      subject = '[SEOAH.STUDIO] 챗봇 문의: ' + (body.category?.slice(0, 30) || '')
      html = `
        <p>챗봇에서 새 문의가 접수되었습니다.</p>
        <p>카테고리: ${body.category ?? '-'}</p>
        <p>이름: ${body.name ?? '-'}</p>
        <p>이메일: ${body.userEmail ?? body.to ?? '-'}</p>
        <p>내용:</p>
        <pre>${(body.content ?? '').replace(/</g, '&lt;')}</pre>
        <p>— SEOAH.STUDIO</p>
      `
    } else if (body.type === 'inquiry_answered' && body.to && body.inquirySubject != null && body.adminReply != null) {
      to = body.to
      subject = '[SEOAH.STUDIO] 1:1 문의에 답변이 등록되었습니다.'
      html = `
        <p>문의하신 내용에 답변이 등록되었습니다.</p>
        <p><strong>문의 제목:</strong> ${body.inquirySubject}</p>
        <p><strong>답변:</strong></p>
        <pre>${(body.adminReply ?? '').replace(/</g, '&lt;')}</pre>
        <p>— SEOAH.STUDIO</p>
      `
    } else if (body.type === 'refund_alert' && body.orderId != null) {
      const adminEmail = Deno.env.get('ADMIN_EMAIL')
      if (!adminEmail) {
        console.warn('ADMIN_EMAIL not set, skipping refund alert email')
        return jsonResponse({ success: true, data: { skipped: true } }, 200, traceId)
      }
      to = adminEmail
      subject = '[SEOAH.STUDIO] 환불 요청이 접수되었습니다'
      html = `
        <p>환불 요청이 접수되었습니다.</p>
        <p><strong>주문번호:</strong> ${String(body.orderId).replace(/</g, '&lt;')}</p>
        <p><strong>요청 사유:</strong></p>
        <pre>${String(body.reason ?? '').replace(/</g, '&lt;')}</pre>
        <p><strong>결제 금액:</strong> ${((body.amount ?? 0) as number).toLocaleString()}원</p>
        <p>— SEOAH.STUDIO</p>
      `
    } else if (body.type === 'refund_approved' && body.to) {
      to = body.to
      subject = '[SEOAH.STUDIO] 환불이 승인되었습니다.'
      html = `
        <p>요청하신 환불이 승인되었습니다.</p>
        <p>환불 금액: ${(body.refundAmount ?? 0).toLocaleString()}원</p>
        ${body.reviewNote ? `<p>메모: ${String(body.reviewNote).replace(/</g, '&lt;')}</p>` : ''}
        <p>— SEOAH.STUDIO</p>
      `
    } else if (body.type === 'refund_rejected' && body.to) {
      to = body.to
      subject = '[SEOAH.STUDIO] 환불 요청이 거절되었습니다.'
      html = `
        <p>요청하신 환불이 검토 결과 거절되었습니다.</p>
        ${body.reviewNote ? `<p>사유: ${String(body.reviewNote).replace(/</g, '&lt;')}</p>` : '<p>자세한 내용은 고객센터로 문의해 주세요.</p>'}
        <p>문의: <a href="mailto:support@seoah.studio">support@seoah.studio</a></p>
        <p>— SEOAH.STUDIO</p>
      `
    } else {
      const { to: toAddr, userName, planType, downloadUrl } = body
      if (!toAddr) return jsonResponse({ success: false, error: { code: 'MISSING_TO', message: 'to required' } }, 400, traceId)
      to = toAddr
      subject = '[SEOAH.STUDIO] 결제가 완료되었습니다.'
      html = `
        <p>${userName || '고객'}님, 결제가 완료되었습니다.</p>
        <p>선택하신 상품: ${planType || 'HTML 다운로드'}</p>
        ${downloadUrl ? `<p><a href="${downloadUrl}">다운로드 링크</a></p>` : '<p>마이페이지에서 다시 다운로드할 수 있습니다.</p>'}
        <p>문의: <a href="mailto:support@seoah.studio">support@seoah.studio</a></p>
        <p>— SEOAH.STUDIO</p>
      `
    }

    const outbound = resolveOutboundMail({
      apiKey,
      resendFrom: Deno.env.get('RESEND_FROM'),
      bodyFrom: (body as { from?: string }).from,
    })
    if (!outbound.send) {
      if (outbound.code === 'SKIPPED') {
        return jsonResponse({ success: true, data: { skipped: true } }, 200, traceId)
      }
      return jsonResponse({ success: false, error: { code: 'EMAIL_NOT_CONFIGURED', message: '발신 주소가 설정되지 않았습니다.' } }, outbound.status, traceId)
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: outbound.from,
        to: [to],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('send-email RESEND_ERROR', res.status, err)
      return jsonResponse({ success: false, error: { code: 'RESEND_ERROR', message: err || `Resend ${res.status}` } }, 500, traceId)
    }

    return jsonResponse({ success: true }, 200, traceId)
  } catch (e) {
    const err = e as Error
    console.error('send-email Critical', err?.message ?? e)
    return jsonResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: err?.message ?? '서버 오류' } }, 500, traceId)
  }
})
