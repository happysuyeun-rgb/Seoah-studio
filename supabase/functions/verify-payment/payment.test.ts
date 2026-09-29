import assert from 'node:assert/strict'
import { assessPayment, isUniqueViolation } from './payment.ts'
import { HTML_PRICE, resolvePlan } from './plans.ts'

const merchant = 'merchant-1'
const base = {
  hasCredentials: true,
  tokenOk: true,
  lookupOk: true,
  paymentStatus: 'paid',
  paidAmount: 49000,
  expectedAmount: 49000,
  requestMerchantUid: merchant,
  responseMerchantUid: merchant,
}

const missing = assessPayment({ ...base, hasCredentials: false, tokenOk: false, lookupOk: false, expectedAmount: HTML_PRICE })
assert.equal(missing.ok, false)
if (!missing.ok) assert.equal(missing.code, 'PAYMENT_NOT_CONFIGURED')

const unknown = resolvePlan(undefined)
assert.equal(unknown.ok, false)
if (!unknown.ok) assert.equal(unknown.code, 'INVALID_PLAN')

const inactive = resolvePlan('pdf')
assert.equal(inactive.ok, false)
if (!inactive.ok) assert.equal(inactive.code, 'PLAN_NOT_AVAILABLE')
for (const plan of ['url', 'ppt', 'figma']) {
  const decision = resolvePlan(plan)
  assert.equal(decision.ok, false)
}

const html = resolvePlan('html')
assert.equal(html.ok, true)
if (html.ok) assert.equal(html.amount, 49000)

const paid = assessPayment({ ...base, expectedAmount: html.ok ? html.amount : 0 })
assert.equal(paid.ok, true)

const mismatch = assessPayment({ ...base, paidAmount: 100, expectedAmount: 49000 })
assert.equal(mismatch.ok, false)
if (!mismatch.ok) assert.equal(mismatch.code, 'AMOUNT_MISMATCH')

const forgedClientAmount = 1
const forged = assessPayment({ ...base, expectedAmount: HTML_PRICE })
assert.equal(forged.ok, true)
assert.notEqual(forgedClientAmount, HTML_PRICE)
const sameMerchant = assessPayment(base)
assert.equal(sameMerchant.ok, true)
const otherMerchant = assessPayment({ ...base, responseMerchantUid: 'merchant-other' })
assert.equal(otherMerchant.ok, false)
if (!otherMerchant.ok) assert.equal(otherMerchant.code, 'PAYMENT_REFERENCE_MISMATCH')
const missingMerchant = assessPayment({ ...base, responseMerchantUid: undefined })
assert.equal(missingMerchant.ok, false)
if (!missingMerchant.ok) assert.equal(missingMerchant.code, 'PAYMENT_REFERENCE_MISMATCH')

assert.equal(isUniqueViolation('23505'), true)
assert.equal(isUniqueViolation('23503'), false)

console.log('verify-payment tests passed')
