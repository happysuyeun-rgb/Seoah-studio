import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { EmptyState } from '../components/EmptyState'
import { FilterTabs } from '../components/FilterTabs'
import { PageHeader, SectionHeader } from '../components/SectionHeader'
import { portalData } from '../portalData'
import type { ProposalTab } from '../types'

const tabs: { id: ProposalTab; label: string }[] = [
  { id: 'awaiting_review', label: 'Awaiting Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'expired', label: 'Expired' },
]

const detailFields = [
  'Project Summary',
  'Scope',
  'Out of Scope',
  'Deliverables',
  'Timeline',
  'Price',
  'Payment Schedule',
  'Revision Policy',
  'Validity',
] as const

export function ProposalsPage() {
  usePageTitle('Proposals — MY SEOA')
  const [tab, setTab] = useState<ProposalTab>('awaiting_review')
  const rows = portalData.proposals.filter((proposal) => proposal.status === tab)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Proposals" description="견적과 계약 조건을 확인합니다." />
      <FilterTabs value={tab} options={tabs} onChange={setTab} />
      {rows.length === 0 ? (
        <EmptyState title="확인할 견적 또는 계약이 없습니다." />
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {rows.map((proposal) => (
            <li key={proposal.id} className="py-5 text-sm text-ink">
              {proposal.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ProposalDetailPage() {
  usePageTitle('Proposal — MY SEOA')
  const { id } = useParams()
  const proposal = portalData.proposals.find((item) => item.id === id) ?? null

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={proposal?.title ?? 'Proposal'} />
      {proposal ? (
        <div className="divide-y divide-line border-t border-line">
          {detailFields.map((field) => (
            <section key={field} className="py-5">
              <SectionHeader title={field} />
              <p className="text-sm text-ink-faint">—</p>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState title="확인할 견적 또는 계약이 없습니다." />
      )}
    </div>
  )
}
