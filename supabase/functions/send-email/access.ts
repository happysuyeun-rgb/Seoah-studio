export type Caller = 'service' | 'user' | 'anonymous'

export type ClassifiedCaller =
  | { kind: 'service' }
  | { kind: 'user'; userId: string }
  | { kind: 'anonymous' }

export type MailDecision =
  | { ok: false; status: 401 | 403 | 400; code: string }
  | { ok: true; scope: 'service' }
  | { ok: true; scope: 'inquiry_alert'; to: string }
  | { ok: true; scope: 'inquiry_answered'; to: string }

export function tokensMatch(left: string, right: string): boolean {
  if (!left || !right || left.length !== right.length) return false
  let diff = 0
  for (let i = 0; i < left.length; i++) diff |= left.charCodeAt(i) ^ right.charCodeAt(i)
  return diff === 0
}

export async function classifyCaller(
  token: string,
  serviceKey: string,
  lookupUser: (token: string) => Promise<{ id: string } | null>,
): Promise<ClassifiedCaller> {
  if (serviceKey && token && tokensMatch(token, serviceKey)) return { kind: 'service' }
  if (!token) return { kind: 'anonymous' }
  try {
    const user = await lookupUser(token)
    if (user?.id) return { kind: 'user', userId: user.id }
  } catch {
    return { kind: 'anonymous' }
  }
  return { kind: 'anonymous' }
}

export function userMayRequest(type: string | undefined): boolean {
  return type === 'inquiry_alert' || type === 'inquiry_answered'
}

export function decideMail(input: {
  caller: Caller
  type?: string
  isAdmin?: boolean
  ownsInquiry?: boolean
  hasInquiryId?: boolean
  clientTo?: string
  customerEmail?: string | null
  adminEmail?: string | null
}): MailDecision {
  if (input.caller === 'anonymous') return { ok: false, status: 401, code: 'UNAUTHORIZED' }
  if (input.caller === 'service') return { ok: true, scope: 'service' }
  if (!userMayRequest(input.type)) return { ok: false, status: 403, code: 'FORBIDDEN' }
  if (!input.hasInquiryId) return { ok: false, status: 400, code: 'MISSING_INQUIRY' }
  if (input.type === 'inquiry_alert') {
    if (!input.ownsInquiry) return { ok: false, status: 403, code: 'FORBIDDEN' }
    const to = input.adminEmail ?? 'support@seoah.studio'
    return { ok: true, scope: 'inquiry_alert', to }
  }
  if (!input.isAdmin) return { ok: false, status: 403, code: 'FORBIDDEN' }
  if (!input.customerEmail) return { ok: false, status: 400, code: 'MISSING_TO' }
  return { ok: true, scope: 'inquiry_answered', to: input.customerEmail }
}
