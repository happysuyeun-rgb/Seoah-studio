import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { formatKrw } from '../../proposals/money'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { ContractDocument } from '../components/ContractDocument'
import { useContractSource } from '../useContractSource'

export function CustomerContractPage() {
  usePageTitle('Contract — MY SEOA')
  const { id } = useParams()
  const location = useLocation()
  const unsaved = Boolean((location.state as { unsaved?: boolean } | null)?.unsaved)
  const { contracts, ready } = useContractSource()
  const contract = contracts.find((item) => item.id === id) ?? null
  const [confirmed, setConfirmed] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [stopped, setStopped] = useState(false)
  const agreedAt = agreed ? new Date().toISOString().slice(0, 10) : ''

  if (!ready) return <p className="text-sm text-ink-faint">로딩 중...</p>
  if (!contract) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-ink">계약 정보를 찾지 못했습니다.</p>
        <Link to="/my/proposals" className="mt-4 inline-block text-sm text-ink-soft">Proposals</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <p className="text-xs text-ink-faint">
        <Link to="/my/proposals" className="hover:text-ink">Proposals</Link>
      </p>
      {import.meta.env.DEV ? <p className="mt-4 text-xs text-ink-faint">개발 환경 예시입니다. 전자서명과 결제는 저장되지 않습니다.</p> : null}
      {unsaved ? <p className="mt-3 text-sm text-ink">이 이동은 저장되지 않았습니다.</p> : null}
      <div className="mt-8">
        <ContractDocument contract={contract} />
      </div>

      <section className="mt-10 border-t border-line pt-8">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Agreement</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">실제 전자서명이 아닙니다. 사용자, 시각, IP, 계약 버전은 나중에 저장할 항목이며 지금은 저장하지 않습니다.</p>
        <label className="mt-6 flex items-start gap-3 text-sm">
          <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 h-4 w-4 accent-ink" />
          계약 내용을 확인했습니다.
        </label>
        <label className="mt-4 block text-sm">
          <span className="mb-2 block font-medium">Typed Name</span>
          <input className="w-full border border-line bg-paper px-3 py-2" value={typedName} onChange={(event) => setTypedName(event.target.value)} />
        </label>
        <p className="mt-4 text-sm text-ink-soft">Agreement Date: {agreedAt || '—'}</p>
        <button
          type="button"
          className="mt-6 min-h-11 bg-ink px-4 text-sm text-white disabled:opacity-40"
          disabled={!confirmed || typedName.trim().length < 1 || agreed}
          onClick={() => setAgreed(true)}
        >
          Agree to Contract
        </button>
        {agreed ? <p className="mt-3 text-sm text-ink">저장되지 않았습니다. 이 브라우저에서만 확인했습니다.</p> : null}
      </section>

      {agreed ? (
        <section className="mt-10 border-t border-line pt-8">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Deposit Required</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-ink-faint">Deposit Amount</dt><dd className="mt-1">{formatKrw(contract.deposit.amount)}</dd></div>
            <div><dt className="text-xs text-ink-faint">Due Date</dt><dd className="mt-1">{contract.deposit.dueDate}</dd></div>
            <div><dt className="text-xs text-ink-faint">Payment Method</dt><dd className="mt-1">{contract.deposit.method}</dd></div>
            <div><dt className="text-xs text-ink-faint">Payment Status</dt><dd className="mt-1">{contract.deposit.status}</dd></div>
          </dl>
          <button type="button" disabled className="mt-6 min-h-11 border border-line px-4 text-sm text-ink-faint">
            Pay Deposit
          </button>
          <p className="mt-3 text-sm text-ink-soft">결제 연결은 계약 확정 후 안내됩니다.</p>
          {import.meta.env.DEV ? (
            <div className="mt-6">
              <button type="button" className="text-sm text-ink-soft" onClick={() => setStopped(true)}>
                개발 환경에서 조건만 확인
              </button>
              {stopped ? (
                <p className="mt-3 text-sm leading-relaxed text-ink">
                  여기서 멈춥니다. Engagement는 만들지 않습니다. 이후 프로젝트는 Proposal Approved, Contract Agreed, Deposit Paid가 모두 끝난 뒤에만 만들 수 있습니다.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
