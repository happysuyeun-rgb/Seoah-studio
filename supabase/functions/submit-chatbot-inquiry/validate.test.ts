import assert from 'node:assert/strict'
import { CHATBOT_CONTENT_MAX, CHATBOT_RATE_LIMIT, CHATBOT_RATE_WINDOW_MS, validateChatbotInput } from './validate.ts'

const ok = validateChatbotInput({ category: 'billing', content: 'hello', name: 'Ada', email: 'ada@example.com' })
assert.equal(ok.ok, true)

const missing = validateChatbotInput({ content: '', name: 'Ada', email: 'ada@example.com' })
assert.equal(missing.ok, false)
if (!missing.ok) assert.equal(missing.code, 'MISSING_PARAMS')

const longContent = validateChatbotInput({ content: 'a'.repeat(CHATBOT_CONTENT_MAX + 1), name: 'Ada', email: 'ada@example.com' })
assert.equal(longContent.ok, false)
if (!longContent.ok) {
  assert.equal(longContent.status, 400)
  assert.equal(longContent.code, 'INVALID')
  assert.equal(JSON.stringify(longContent).includes('service'), false)
}

const longName = validateChatbotInput({ content: 'hello', name: 'a'.repeat(51), email: 'ada@example.com' })
assert.equal(longName.ok, false)

const longEmail = validateChatbotInput({ content: 'hello', name: 'Ada', email: `${'a'.repeat(190)}@example.com` })
assert.equal(longEmail.ok, false)

const badEmail = validateChatbotInput({ content: 'hello', name: 'Ada', email: 'not-an-email' })
assert.equal(badEmail.ok, false)

assert.equal(CHATBOT_RATE_LIMIT, 5)
assert.equal(CHATBOT_RATE_WINDOW_MS, 60_000)
console.log('chatbot validation tests passed')
