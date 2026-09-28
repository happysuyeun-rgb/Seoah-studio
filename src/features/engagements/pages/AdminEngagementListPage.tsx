import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { customerStageFor, matchesAdminFilter } from '../mappers'
import { adminListFilters, engagementStatusLabels, type AdminListFilter } from '../types'
import { useEngagementSource } from '../useEngagementSource'

const filters: { id: 'ALL' | AdminListFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  ...adminListFilters.map((id) => ({ id, label: id })),
]

export function AdminEngagementListPage() {
  usePageTitle('Projects — SEOAH.STUDIO')
  const { engagements, ready } = useEngagementSource()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'ALL' | AdminListFilter>('ALL')
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return engagements.filter((engagement) => {
      if (!matchesAdminFilter(engagement, filter)) return false
      if (!needle) return true
      return [engagement.name, engagement.customer, engagement.projectType].some((value) => value.toLowerCase().includes(needle))
    })
  }, [engagements, filter, query])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Projects</h1>
        <p className="mt-2 text-sm text-ink-soft">프로젝트는 아직 저장되지 않습니다.</p>
      </header>
      <div className="mt-8 grid gap-4">
        <label className="block max-w-sm">
          <span className="mb-2 block text-xs text-ink-faint">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Project, customer, type"
            className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Status">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`border px-3 py-1.5 text-xs ${filter === item.id ? 'border-ink bg-ink text-white' : 'border-line bg-paper text-ink-soft'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {!ready ? <p className="mt-10 text-sm text-ink-faint">로딩 중...</p> : null}
      {ready && engagements.length === 0 ? <p className="mt-10 text-sm text-ink">No projects yet.</p> : null}
      {ready && engagements.length > 0 && rows.length === 0 ? <p className="mt-10 text-sm text-ink-soft">조건에 맞는 프로젝트가 없습니다.</p> : null}
      {rows.length > 0 ? (
        <>
          <ul className="mt-8 border-t border-line md:hidden">
            {rows.map((engagement) => (
              <li key={engagement.id} className="border-b border-line py-4">
                <Link to={`/admin/engagements/${engagement.id}`} className="text-sm font-medium text-ink">
                  {engagement.name}
                </Link>
                <p className="mt-1 text-sm text-ink-soft">
                  {engagement.customer} · {engagement.projectType}
                </p>
                <p className="mt-2 text-xs text-ink-faint">
                  {engagementStatusLabels[engagement.status]} · {customerStageFor(engagement.status)} · {engagement.actionRequired?.label ?? 'None'}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full border-t border-line text-left text-sm">
              <thead>
                <tr className="text-xs text-ink-faint">
                  {['Project', 'Customer', 'Type', 'Status', 'Stage', 'Action Required', 'Expected Completion', 'Updated At'].map((label) => (
                    <th key={label} className="py-3 pr-4 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((engagement) => (
                  <tr key={engagement.id} className="border-t border-line">
                    <td className="py-3 pr-4">
                      <Link to={`/admin/engagements/${engagement.id}`} className="font-medium text-ink">
                        {engagement.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">{engagement.customer}</td>
                    <td className="py-3 pr-4 text-ink-soft">{engagement.projectType}</td>
                    <td className="py-3 pr-4">{engagementStatusLabels[engagement.status]}</td>
                    <td className="py-3 pr-4">{customerStageFor(engagement.status)}</td>
                    <td className="py-3 pr-4 text-ink-soft">{engagement.actionRequired?.label ?? 'None'}</td>
                    <td className="py-3 pr-4 text-ink-faint">{engagement.expectedCompletion ?? '—'}</td>
                    <td className="py-3 text-ink-faint">{engagement.updatedAt}</td>
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
