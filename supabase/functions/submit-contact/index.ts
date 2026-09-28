// Guest and signed-in contact intake.
// Deploy with JWT verification disabled, same as submit-chatbot-inquiry.
// The function checks a user JWT itself and never trusts a client user_id.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
}

const inquiryTypes = ['ready', 'studio', 'care', 'saas', 'payment', 'partnership', 'other'] as const
type InquiryType = (typeof inquiryTypes)[number]

const legacyType: Record<InquiryType, string> = {
  ready: '서비스 문의',
  studio: '서비스 문의',
  care: '서비스 문의',
  saas: '서비스 문의',
  payment: '결제 / 환불',
  partnership: '서비스 문의',
  other: '기타',
}

const labels: Record<InquiryType, string> = {
  ready: 'Ready',
  studio: 'Studio',
  care: 'Care',
  saas: 'SaaS',
  payment: 'Payment',
  partnership: 'Partnership',
  other: 'Other',
}

type ApiError = { code: string; message: string }
type ApiResponse = { success: boolean; error?: ApiError }

function jsonResponse(obj: ApiResponse, status: number) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function getClientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for') ?? ''
  const first = xf.split(',')[0]?.trim()
  return first || 'unknown'
}

function isInquiryType(value: string): value is InquiryType {
  return (inquiryTypes as readonly string[]).includes(value)
}

async function resolveUserId(req: Request, supabaseUrl: string, anonKey: string): Promise<string | null> {
  const header = req.headers.get('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token || token === anonKey) return null
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) return null
  return data.user.id
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ success: false, error: { code: 'METHOD', message: '문의 접수에 실패했습니다.' } }, 405)

  try {
    let body: {
      name?: string
      email?: string
      phone?: string
      inquiry_type?: string
      message?: string
      website?: string
    }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return jsonResponse({ success: false, error: { code: 'INVALID', message: '입력 내용을 확인해 주세요.' } }, 400)
    }

    if ((body.website ?? '').trim()) {
      return jsonResponse({ success: true }, 200)
    }

    const name = (body.name ?? '').trim()
    const email = (body.email ?? '').trim()
    const phone = (body.phone ?? '').trim()
    const inquiryType = (body.inquiry_type ?? '').trim()
    const message = (body.message ?? '').trim()

    if (name.length < 2 || name.length > 50 || !email.includes('@') || email.length > 200 || !isInquiryType(inquiryType) || message.length < 10 || message.length > 3000) {
      return jsonResponse({ success: false, error: { code: 'INVALID', message: '입력 내용을 확인해 주세요.' } }, 400)
    }
    if (phone && (phone.length > 30 || !/^[0-9+\-()\s]{8,30}$/.test(phone))) {
      return jsonResponse({ success: false, error: { code: 'INVALID', message: '입력 내용을 확인해 주세요.' } }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ success: false, error: { code: 'UNAVAILABLE', message: '문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.' } }, 500)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const ip = getClientIp(req)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60_000).toISOString()
    const { count, error: countErr } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', tenMinutesAgo)

    if (countErr) {
      console.error('submit-contact rate count failed', countErr)
      return jsonResponse({ success: false, error: { code: 'UNAVAILABLE', message: '문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.' } }, 500)
    }
    if ((count ?? 0) >= 3) {
      return jsonResponse({ success: false, error: { code: 'RATE_LIMITED', message: '잠시 후 다시 시도해 주세요.' } }, 429)
    }

    const userId = anonKey ? await resolveUserId(req, supabaseUrl, anonKey) : null
    const { error: insertErr } = await supabase.from('inquiries').insert({
      user_id: userId,
      subject: `${labels[inquiryType]} 문의`.slice(0, 120),
      body: message,
      type: legacyType[inquiryType],
      inquiry_type: inquiryType,
      name,
      email,
      phone: phone || null,
      attachment_url: null,
      status: 'new',
      ip,
    })

    if (insertErr) {
      console.error('submit-contact insert failed', insertErr)
      return jsonResponse({ success: false, error: { code: 'UNAVAILABLE', message: '문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.' } }, 500)
    }

    return jsonResponse({ success: true }, 200)
  } catch (error) {
    console.error('submit-contact failed', error)
    return jsonResponse({ success: false, error: { code: 'UNAVAILABLE', message: '문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.' } }, 500)
  }
})
