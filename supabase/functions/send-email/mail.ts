export type OutboundMail =
  | { send: false; status: 200; code: 'SKIPPED' }
  | { send: false; status: 503; code: 'EMAIL_NOT_CONFIGURED' }
  | { send: true; from: string }

export function resolveOutboundMail(input: {
  apiKey?: string
  resendFrom?: string
  bodyFrom?: string
}): OutboundMail {
  if (!input.apiKey) return { send: false, status: 200, code: 'SKIPPED' }
  const from = (input.resendFrom ?? '').trim()
  if (!from) return { send: false, status: 503, code: 'EMAIL_NOT_CONFIGURED' }
  return { send: true, from }
}
