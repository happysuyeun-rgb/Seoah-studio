import assert from 'node:assert/strict'
import { approveAfterCancel, approvePreconditions, cancelSucceeded, rejectDecision } from './decision.ts'

const rejected = rejectDecision()
assert.equal(rejected.updateDatabase, true)

const noKeys = approvePreconditions({ impUid: 'imp_1', hasKey: false, hasSecret: false })
assert.equal(noKeys.updateDatabase, false)
assert.equal(noKeys.code, 'REFUND_NOT_CONFIGURED')

const noUid = approvePreconditions({ impUid: null, hasKey: true, hasSecret: true })
assert.equal(noUid.updateDatabase, false)
assert.equal(noUid.code, 'MISSING_IMP_UID')

const ready = approvePreconditions({ impUid: 'imp_1', hasKey: true, hasSecret: true })
assert.equal(ready.updateDatabase, false)
assert.equal(ready.code, 'READY')

const tokenFail = approveAfterCancel({ tokenOk: false, cancelOk: false })
assert.equal(tokenFail.updateDatabase, false)
assert.equal(tokenFail.code, 'PAYMENT_SERVICE_ERROR')

const cancelFail = approveAfterCancel({ tokenOk: true, cancelOk: false })
assert.equal(cancelFail.updateDatabase, false)
assert.equal(cancelFail.code, 'PORTONE_CANCEL_FAILED')
assert.equal(cancelSucceeded({ code: 0, response: null }), false)
assert.equal(cancelSucceeded({ code: 0, response: { status: 'paid' } }), false)

const cancelOk = approveAfterCancel({ tokenOk: true, cancelOk: cancelSucceeded({ code: 0, response: { status: 'cancelled' } }) })
assert.equal(cancelOk.updateDatabase, true)

console.log('process-refund tests passed')
