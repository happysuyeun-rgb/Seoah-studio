import assert from 'node:assert/strict'
import { isOwnedRefundAttachment } from './attachment.ts'

const userId = 'user-1'
const orderId = 'order-1'
assert.equal(isOwnedRefundAttachment(undefined, userId, orderId), true)
assert.equal(isOwnedRefundAttachment(`${userId}/${orderId}/receipt.jpg`, userId, orderId), true)
assert.equal(isOwnedRefundAttachment(`other/${orderId}/receipt.jpg`, userId, orderId), false)
assert.equal(isOwnedRefundAttachment(`${userId}/other/receipt.jpg`, userId, orderId), false)
assert.equal(isOwnedRefundAttachment(`${userId}/${orderId}/../secret.jpg`, userId, orderId), false)

console.log('refund attachment tests passed')
