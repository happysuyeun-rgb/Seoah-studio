import assert from 'node:assert/strict'
import { destinationAfterSignup, postLoginPath, requiresAccountType, takeStoredReturnTo } from './postLogin.ts'

assert.equal(postLoginPath(null), '/my')
assert.equal(postLoginPath(undefined), '/my')
assert.equal(postLoginPath(''), '/my')
assert.equal(postLoginPath('   '), '/my')

assert.equal(postLoginPath('/my'), '/my')
assert.equal(postLoginPath('/ready'), '/ready')
assert.equal(postLoginPath('/studio/request'), '/studio/request')

assert.equal(postLoginPath('//evil.example'), '/my')
assert.equal(postLoginPath('https://evil.example'), '/my')
assert.equal(postLoginPath('http://evil.example'), '/my')

assert.equal(requiresAccountType({ isOAuth: true, isRecent: true, accountType: null }), true)
assert.equal(requiresAccountType({ isOAuth: true, isRecent: true, accountType: '' }), true)
assert.equal(requiresAccountType({ isOAuth: true, isRecent: true, accountType: 'individual' }), false)
assert.equal(requiresAccountType({ isOAuth: false, isRecent: true, accountType: null }), false)

const memory = new Map<string, string>()
Object.defineProperty(globalThis, 'sessionStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
    removeItem: (key: string) => memory.delete(key),
  },
})

memory.set('seoah_returnTo', '/studio/request')
assert.equal(takeStoredReturnTo(), '/studio/request')
assert.equal(memory.get('seoah_returnTo'), undefined)

memory.set('seoah_returnTo', '//evil.example')
assert.equal(takeStoredReturnTo(), '/my')

memory.set('seoah_returnTo', 'https://evil.example')
assert.equal(takeStoredReturnTo(), '/my')

assert.equal(takeStoredReturnTo(), '/my')
assert.equal(destinationAfterSignup(true), '/my')
assert.equal(destinationAfterSignup(false), null)

console.log('postLogin tests passed')
