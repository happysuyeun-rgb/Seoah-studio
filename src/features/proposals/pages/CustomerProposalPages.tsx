import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Modal } from '../../../components/ui/Modal'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { EmptyState } from '../../my-seoa/components/EmptyState'
import { FilterTabs } from '../../my-seoa/components/FilterTabs'
import { PageHeader } from '../../my-seoa/components/SectionHeader'
import type { ProposalTab } from '../../my-seoa/types'
import { ProposalDocument } from '../components/ProposalDocument'
import { formatKrw, priceSummary } from '../money'
import { customerProposalTab } from '../status'
import { proposalStatusLabels } from '../types'
import { useProposalSource } from '../useProposalSource'
import { useContractSource } from '../../contracts/useContractSource'

const tabs: { id: ProposalTab; label: string }[] = [
  { id: 'awaiting_review', label: 'Awaiting Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'expired', label: 'Expired' },
]

export function CustomerProposalsPage() {
  usePageTitle('Proposals — MY SEOA')
  const { proposals, ready } = useProposalSource()
  const [tab, setTab] = useState<ProposalTab>('awaiting_review')
  const rows = useMemo(
    () => proposals.filter((proposal) => customerProposalTab(proposal.status) === tab),
    [proposals, tab],
  )

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Proposals" description="견적과 조건을 확인합니다. 이 화면의 예시는 저장되지 않습니다." />
      <FilterTabs value={tab} options={tabs} onChange={setTab} />
      {!ready ? <p className="text-sm text-ink-faint">로딩 중...</p> : null}
      {ready && rows.length === 0 ? <EmptyState title="확인할 견적 또는 계약이 없습니다." /> : null}
      {rows.length > 0 ? (
        <ul className="divide-y divide-line border-t border-line">
          {rows.map((proposal) => (
            <li key={proposal.id} className="py-5">
              <Link to={`/my/proposals/${proposal.id}`} className="text-sm font-medium text-ink">
                {proposal.content.title}
              </Link>
              <p className="mt-1 text-xs text-ink-faint">
                {proposal.content.projectName} · Version {proposal.currentVersion} · {proposalStatusLabels[proposal.status]}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function CustomerProposalDetailPage() {
  usePageTitle('Proposal — MY SEOA')
  const { id } = useParams()
  const navigate = useNavigate()
  const { proposals, ready } = useProposalSource()
  const { contracts } = useContractSource()
  const proposal = proposals.find((item) => item.id === id && customerProposalTab(item.status)) ?? null
  const [mode, setMode] = useState<'approve' | 'revision' | 'reject' | null>(null)
  const [revision, setRevision] = useState('')
  const [reason, setReason] = useState('')
  const [notice, setNotice] = useState('')

  if (!ready) return <p className="text-sm text-ink-faint">로딩 중...</p>
  if (!proposal) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Proposal" />
        <EmptyState title="확인할 견적 또는 계약이 없습니다." />
      </div>
    )
  }

  const price = priceSummary(proposal.content.lineItems)
  const contract = contracts.find((item) => item.proposalId === proposal.id) ?? null
  const close = () => setMode(null)

  return (
    <div className="mx-auto max-w-3xl pb-28">
      {import.meta.env.DEV ? <p className="mb-6 text-xs text-ink-faint">개발 환경 예시입니다. 저장되지 않습니다.</p> : null}
      <ProposalDocument proposal={proposal} />
      {notice ? <p className="mt-6 text-sm text-ink">{notice}</p> : null}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="min-h-11 border border-line px-4 text-sm" onClick={() => setMode('reject')}>Reject</button>
          <button type="button" className="min-h-11 border border-line px-4 text-sm" onClick={() => setMode('revision')}>Request Revision</button>
          <button type="button" className="min-h-11 bg-signal px-4 text-sm text-white" onClick={() => setMode('approve')}>Approve Proposal</button>
        </div>
      </div>

      <Modal title="Approve Proposal" open={mode === 'approve'} onClose={close}>
        <dl className="grid gap-3 text-sm">
          <div><dt className="text-ink-faint">Proposal Version</dt><dd>Version {proposal.currentVersion}</dd></div>
          <div><dt className="text-ink-faint">Total Amount</dt><dd>{formatKrw(price.total)}</dd></div>
          <div><dt className="text-ink-faint">Payment Schedule</dt><dd>{proposal.content.paymentSchedule.map((item) => `${item.label} ${item.portion}`).join(', ') || '—'}</dd></div>
          <div><dt className="text-ink-faint">Validity</dt><dd>{proposal.content.validUntil || '—'}</dd></div>
          <div><dt className="text-ink-faint">Next Step</dt><dd>계약 내용을 확인합니다. 이 단계에서는 저장되지 않습니다.</dd></div>
        </dl>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="min-h-11 px-3 text-sm" onClick={close}>닫기</button>
          <button
            type="button"
            className="min-h-11 bg-ink px-4 text-sm text-white"
            onClick={() => {
              if (import.meta.env.DEV && contract) {
                navigate(`/my/contracts/${contract.id}`, { state: { unsaved: true } })
                return
              }
              setNotice('저장되지 않았습니다.')
              close()
            }}
          >
            Approve and Continue
          </button>
        </div>
      </Modal>

      <Modal title="Request Revision" open={mode === 'revision'} onClose={close}>
        <label className="block text-sm">
          수정이 필요한 내용을 알려주세요.
          <textarea className="mt-2 min-h-28 w-full border border-line px-3 py-2" value={revision} onChange={(event) => setRevision(event.target.value)} />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="min-h-11 px-3 text-sm" onClick={close}>닫기</button>
          <button
            type="button"
            className="min-h-11 bg-ink px-4 text-sm text-white"
            onClick={() => {
              setNotice(import.meta.env.DEV ? '저장되지 않았습니다. 개발 환경에서 수정 요청 내용만 확인했습니다.' : '저장되지 않았습니다.')
              close()
            }}
          >
            Send Revision Request
          </button>
        </div>
      </Modal>

      <Modal title="Reject Proposal" open={mode === 'reject'} onClose={close}>
        <label className="block text-sm">
          거절 이유 (선택)
          <textarea className="mt-2 min-h-24 w-full border border-line px-3 py-2" value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="min-h-11 px-3 text-sm" onClick={close}>닫기</button>
          <button
            type="button"
            className="min-h-11 bg-ink px-4 text-sm text-white"
            onClick={() => {
              setNotice('저장되지 않았습니다.')
              close()
            }}
          >
            Reject
          </button>
        </div>
      </Modal>
    </div>
  )
}
