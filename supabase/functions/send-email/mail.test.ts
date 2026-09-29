import assert from 'node:assert/strict'
import { resolveOutboundMail } from './mail.ts'

const skipped = resolveOutboundMail({ resendFrom: 'SEOAH.STUDIO <mail@example.com>', bodyFrom: 'attacker@example.com' })
assert.equal(skipped.send, false)
if (!skipped.send) {
  assert.equal(skipped.status, 200)
  assert.equal(skipped.code, 'SKIPPED')
}

const missingFrom = resolveOutboundMail({ apiKey: 're_test', bodyFrom: 'attacker@example.com' })
assert.equal(missingFrom.send, false)
if (!missingFrom.send) {
  assert.equal(missingFrom.status, 503)
  assert.equal(missingFrom.code, 'EMAIL_NOT_CONFIGURED')
}

const configured = resolveOutboundMail({
  apiKey: 're_test',
  resendFrom: 'SEOAH.STUDIO <mail@example.com>',
  bodyFrom: 'attacker@example.com',
})
assert.equal(configured.send, true)
if (configured.send) {
  assert.equal(configured.from, 'SEOAH.STUDIO <mail@example.com>')
  assert.notEqual(configured.from, 'attacker@example.com')
}

console.log('send-email config tests passed')
