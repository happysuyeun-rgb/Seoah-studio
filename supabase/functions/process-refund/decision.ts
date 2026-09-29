export type RefundDecision = {
  updateDatabase: boolean
  status: number
  code: string
}

export function approvePreconditions(input: {
  impUid?: string | null
  hasKey: boolean
  hasSecret: boolean
}): RefundDecision {
  if (!input.impUid) return { updateDatabase: false, status: 400, code: 'MISSING_IMP_UID' }
  if (!input.hasKey || !input.hasSecret) return { updateDatabase: false, status: 503, code: 'REFUND_NOT_CONFIGURED' }
  return { updateDatabase: false, status: 200, code: 'READY' }
}

export function approveAfterCancel(input: { tokenOk: boolean; cancelOk: boolean }): RefundDecision {
  if (!input.tokenOk) return { updateDatabase: false, status: 502, code: 'PAYMENT_SERVICE_ERROR' }
  if (!input.cancelOk) return { updateDatabase: false, status: 502, code: 'PORTONE_CANCEL_FAILED' }
  return { updateDatabase: true, status: 200, code: 'OK' }
}

export function rejectDecision(): RefundDecision {
  return { updateDatabase: true, status: 200, code: 'OK' }
}

export function cancelSucceeded(body: { code?: number; response?: { status?: string } | null }): boolean {
  const status = body.response?.status
  return body.code === 0 && (status === 'cancelled' || status === 'refunded')
}
