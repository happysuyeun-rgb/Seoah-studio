export type PaymentCheck =
  | { ok: true }
  | { ok: false; status: 503 | 502 | 400 | 402 | 409; code: 'PAYMENT_NOT_CONFIGURED' | 'PAYMENT_SERVICE_ERROR' | 'PAYMENT_INVALID' | 'PAYMENT_NOT_COMPLETED' | 'AMOUNT_MISMATCH' | 'PAYMENT_REFERENCE_MISMATCH' }

export function assessPayment(input: {
  hasCredentials: boolean
  tokenOk: boolean
  lookupOk: boolean
  paymentStatus?: string
  paidAmount?: number
  expectedAmount: number
  requestMerchantUid: string
  responseMerchantUid?: string | null
}): PaymentCheck {
  if (!input.hasCredentials) return { ok: false, status: 503, code: 'PAYMENT_NOT_CONFIGURED' }
  if (!input.tokenOk) return { ok: false, status: 502, code: 'PAYMENT_SERVICE_ERROR' }
  if (!input.lookupOk) return { ok: false, status: 400, code: 'PAYMENT_INVALID' }
  if (input.paymentStatus !== 'paid') return { ok: false, status: 402, code: 'PAYMENT_NOT_COMPLETED' }
  if (input.paidAmount !== input.expectedAmount) return { ok: false, status: 402, code: 'AMOUNT_MISMATCH' }
  if (!input.responseMerchantUid || input.responseMerchantUid !== input.requestMerchantUid) {
    return { ok: false, status: 409, code: 'PAYMENT_REFERENCE_MISMATCH' }
  }
  return { ok: true }
}

export function isUniqueViolation(code: string | undefined): boolean {
  return code === '23505'
}
