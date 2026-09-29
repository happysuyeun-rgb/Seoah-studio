import assert from 'node:assert/strict'
import { classifyCaller, decideMail } from './access.ts'

const serviceKey = 'service-key-value'
const anonKey = 'anon-key-value'
const userId = '11111111-1111-1111-1111-111111111111'
const none = async () => null
const asUser = async () => ({ id: userId })

assert.deepEqual(await classifyCaller('', serviceKey, asUser), { kind: 'anonymous' })
assert.deepEqual(await classifyCaller(anonKey, serviceKey, none), { kind: 'anonymous' })
assert.deepEqual(await classifyCaller(anonKey, '', none), { kind: 'anonymous' })
assert.deepEqual(await classifyCaller('not-a-jwt', serviceKey, none), { kind: 'anonymous' })
assert.deepEqual(await classifyCaller('not-a-jwt', '', async () => { throw new Error('invalid') }), { kind: 'anonymous' })
assert.deepEqual(await classifyCaller('user-jwt', serviceKey, asUser), { kind: 'user', userId })
assert.deepEqual(await classifyCaller(serviceKey, serviceKey, none), { kind: 'service' })

const denied = [
  'payment_complete',
  'refund_alert',
  'refund_approved',
  'refund_rejected',
  'chatbot_alert',
  'made-up',
  undefined,
]
for (const type of denied) {
  const decision = decideMail({
    caller: 'user',
    type,
    isAdmin: true,
    ownsInquiry: true,
    hasInquiryId: true,
    clientTo: 'evil@example.com',
    customerEmail: 'customer@example.com',
    adminEmail: 'admin@example.com',
  })
  assert.equal(decision.ok, false)
  if (!decision.ok) assert.equal(decision.status, 403)
}

const alert = decideMail({
  caller: 'user',
  type: 'inquiry_alert',
  ownsInquiry: true,
  hasInquiryId: true,
  clientTo: 'evil@example.com',
  adminEmail: 'admin@example.com',
})
assert.equal(alert.ok, true)
if (alert.ok && alert.scope === 'inquiry_alert') {
  assert.equal(alert.to, 'admin@example.com')
  assert.notEqual(alert.to, 'evil@example.com')
}

const notOwner = decideMail({
  caller: 'user',
  type: 'inquiry_alert',
  ownsInquiry: false,
  hasInquiryId: true,
  clientTo: 'evil@example.com',
  adminEmail: 'admin@example.com',
})
assert.equal(notOwner.ok, false)

const normalReply = decideMail({
  caller: 'user',
  type: 'inquiry_answered',
  isAdmin: false,
  hasInquiryId: true,
  clientTo: 'evil@example.com',
  customerEmail: 'customer@example.com',
})
assert.equal(normalReply.ok, false)
if (!normalReply.ok) assert.equal(normalReply.status, 403)

const adminReply = decideMail({
  caller: 'user',
  type: 'inquiry_answered',
  isAdmin: true,
  hasInquiryId: true,
  clientTo: 'evil@example.com',
  customerEmail: 'customer@example.com',
})
assert.equal(adminReply.ok, true)
if (adminReply.ok && adminReply.scope === 'inquiry_answered') {
  assert.equal(adminReply.to, 'customer@example.com')
  assert.notEqual(adminReply.to, 'evil@example.com')
}

const anon = decideMail({ caller: 'anonymous', type: 'inquiry_alert', hasInquiryId: true, ownsInquiry: true })
assert.equal(anon.ok, false)
if (!anon.ok) assert.equal(anon.status, 401)

console.log('send-email access tests passed')
