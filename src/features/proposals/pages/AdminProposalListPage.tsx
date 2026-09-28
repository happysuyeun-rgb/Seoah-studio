import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { formatKrw, priceSummary } from '../money'
import { proposalStatusLabels, type ProposalStatus } from '../types'
import { useProposalSource } from '../useProposalSource'

const filters: { id: 'ALL' | ProposalStatus; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'DRAFT', label: 'Draft' },
  { id: 'SENT', label: 'Sent' },
  { id: 'REVISION_REQUESTED', label: 'Revision Requested' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'EXPIRED', label: 'Expired' },
]

export function AdminProposalListPage() {
  usePageTitle('Proposals — SEOAH.STUDIO')
  const { proposals, ready } = useProposalSource()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'ALL' | ProposalStatus>('ALL')
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return proposals.filter((proposal) => {
      if (status !== 'ALL' && proposal.status !== status) return false
      if (!needle) return true
      return [proposal.content.title, proposal.content.customer, proposal.content.projectName, proposal.content.company].some((value) =>
        value.toLowerCase().includes(needle),
      )
    })
  }, [proposals, query, status])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Proposals</h1>
          <p className="mt-2 text-sm text-ink-soft">견적은 아직 저장되지 않습니다.</p>
        </div>
        <Link to="/admin/proposals/new" className="border border-ink px-3 py-2 text-sm text-ink">
          New Proposal
        </Link>
      </header>
      <div className="mt-8 grid gap-4">
        <label className="block max-w-sm">
          <span className="mb-2 block text-xs text-ink-faint">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Proposal, customer, project"
            className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Status">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={status === filter.id}
              onClick={() => setStatus(filter.id)}
              className={`border px-3 py-1.5 text-xs ${status === filter.id ? 'border-ink bg-ink text-white' : 'border-line bg-paper text-ink-soft'}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      {!ready ? <p className="mt-10 text-sm text-ink-faint">로딩 중...</p> : null}
      {ready && proposals.length === 0 ? <p className="mt-10 text-sm text-ink">No proposals yet.</p> : null}
      {ready && proposals.length > 0 && rows.length === 0 ? <p className="mt-10 text-sm text-ink-soft">조건에 맞는 견적이 없습니다.</p> : null}
      {rows.length > 0 ? (
        <>
          <ul className="mt-8 border-t border-line md:hidden">
            {rows.map((proposal) => (
              <li key={proposal.id} className="border-b border-line py-4">
                <Link to={`/admin/proposals/${proposal.id}`} className="text-sm font-medium text-ink">
                  {proposal.content.title || 'Untitled'}
                </Link>
                <p className="mt-1 text-sm text-ink-soft">{proposal.content.customer}</p>
                <p className="mt-2 text-xs text-ink-faint">
                  {proposal.content.projectName} · {formatKrw(priceSummary(proposal.content.lineItems).total)} · {proposalStatusLabels[proposal.status]} · v
                  {proposal.currentVersion}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full border-t border-line text-left text-sm">
              <thead>
                <tr className="text-xs text-ink-faint">
                  {['Proposal', 'Customer', 'Project', 'Amount', 'Status', 'Version', 'Valid Until', 'Created At'].map((label) => (
                    <th key={label} className="py-3 pr-4 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((proposal) => (
                  <tr key={proposal.id} className="border-t border-line">
                    <td className="py-3 pr-4">
                      <Link to={`/admin/proposals/${proposal.id}`} className="font-medium text-ink">
                        {proposal.content.title || 'Untitled'}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">{proposal.content.customer || '—'}</td>
                    <td className="py-3 pr-4 text-ink-soft">{proposal.content.projectName || '—'}</td>
                    <td className="py-3 pr-4 text-ink">{formatKrw(priceSummary(proposal.content.lineItems).total)}</td>
                    <td className="py-3 pr-4">{proposalStatusLabels[proposal.status]}</td>
                    <td className="py-3 pr-4">v{proposal.currentVersion}</td>
                    <td className="py-3 pr-4 text-ink-faint">{proposal.content.validUntil || '—'}</td>
                    <td className="py-3 text-ink-faint">{proposal.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </main>
  )
}
