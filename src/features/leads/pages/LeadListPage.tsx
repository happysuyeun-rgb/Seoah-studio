import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { leadStatusLabels, leadStatuses, type Lead, type LeadStatus } from '../types'
import { useLeadSource } from '../useLeadSource'

const filters: { id: 'ALL' | LeadStatus; label: string }[] = [
  { id: 'ALL', label: 'All' },
  ...leadStatuses.map((status) => ({ id: status, label: leadStatusLabels[status] })),
]

function matches(lead: Lead, query: string, status: 'ALL' | LeadStatus) {
  if (status !== 'ALL' && lead.status !== status) return false
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return [lead.name, lead.email, lead.company].some((value) => value.toLowerCase().includes(needle))
}

export function LeadListPage() {
  usePageTitle('Leads — SEOAH.STUDIO')
  const { leads, ready } = useLeadSource()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'ALL' | LeadStatus>('ALL')
  const rows = useMemo(() => leads.filter((lead) => matches(lead, query, status)), [leads, query, status])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Leads</h1>
        <p className="mt-2 text-sm text-ink-soft">Studio 의뢰는 아직 저장되지 않습니다.</p>
      </header>

      <div className="mt-8 grid gap-4">
        <label className="block max-w-sm">
          <span className="mb-2 block text-xs text-ink-faint">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, email, company"
            className="w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
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
      {ready && leads.length === 0 ? <p className="mt-10 text-sm text-ink">No leads yet.</p> : null}
      {ready && leads.length > 0 && rows.length === 0 ? <p className="mt-10 text-sm text-ink-soft">조건에 맞는 리드가 없습니다.</p> : null}

      {rows.length > 0 ? (
        <>
          <ul className="mt-8 border-t border-line md:hidden">
            {rows.map((lead) => (
              <li key={lead.id} className="border-b border-line py-4">
                <Link to={`/admin/leads/${lead.id}`} className="text-sm font-medium text-ink">
                  {lead.company || lead.name}
                </Link>
                <p className="mt-1 text-sm text-ink-soft">{lead.name}</p>
                <p className="mt-2 text-xs text-ink-faint">
                  {lead.projectType} · {lead.budget} · {lead.timeline}
                </p>
                <p className="mt-1 text-xs text-ink-faint">
                  {leadStatusLabels[lead.status]} · {lead.createdAt}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full border-t border-line text-left text-sm">
              <thead>
                <tr className="text-xs text-ink-faint">
                  <th className="py-3 pr-4 font-medium">Lead</th>
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Project Type</th>
                  <th className="py-3 pr-4 font-medium">Budget</th>
                  <th className="py-3 pr-4 font-medium">Timeline</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 font-medium">Created At</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((lead) => (
                  <tr key={lead.id} className="border-t border-line">
                    <td className="py-3 pr-4">
                      <Link to={`/admin/leads/${lead.id}`} className="font-medium text-ink">
                        {lead.company || lead.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">{lead.name}</td>
                    <td className="py-3 pr-4 text-ink-soft">{lead.projectType}</td>
                    <td className="py-3 pr-4 text-ink-soft">{lead.budget}</td>
                    <td className="py-3 pr-4 text-ink-soft">{lead.timeline}</td>
                    <td className="py-3 pr-4 text-ink">{leadStatusLabels[lead.status]}</td>
                    <td className="py-3 text-ink-faint">{lead.createdAt}</td>
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
