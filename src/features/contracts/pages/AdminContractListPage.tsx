import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { contractStatusLabels, type ContractStatus } from '../types'
import { useContractSource } from '../useContractSource'

const filters: { id: 'ALL' | ContractStatus; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'DRAFT', label: 'Draft' },
  { id: 'SENT', label: 'Sent' },
  { id: 'AGREED', label: 'Agreed' },
  { id: 'DECLINED', label: 'Declined' },
  { id: 'EXPIRED', label: 'Expired' },
]

export function AdminContractListPage() {
  usePageTitle('Contracts — SEOAH.STUDIO')
  const { contracts, ready } = useContractSource()
  const [status, setStatus] = useState<'ALL' | ContractStatus>('ALL')
  const rows = useMemo(() => contracts.filter((contract) => status === 'ALL' || contract.status === status), [contracts, status])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Contracts</h1>
      <p className="mt-2 text-sm text-ink-soft">계약은 아직 저장되지 않습니다.</p>
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Status">
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
      {!ready ? <p className="mt-10 text-sm text-ink-faint">로딩 중...</p> : null}
      {ready && contracts.length === 0 ? <p className="mt-10 text-sm text-ink">No contracts yet.</p> : null}
      {rows.length > 0 ? (
        <>
          <ul className="mt-8 border-t border-line md:hidden">
            {rows.map((contract) => (
              <li key={contract.id} className="border-b border-line py-4 text-sm">
                <Link to={`/admin/contracts/${contract.id}`} className="font-medium text-ink">{contract.projectName}</Link>
                <p className="mt-1 text-ink-soft">{contract.customer}</p>
                <p className="mt-1 text-xs text-ink-faint">{contractStatusLabels[contract.status]} · v{contract.version}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full border-t border-line text-left text-sm">
              <thead>
                <tr className="text-xs text-ink-faint">
                  {['Contract', 'Customer', 'Project', 'Status', 'Version', 'Sent At', 'Agreed At'].map((label) => (
                    <th key={label} className="py-3 pr-4 font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((contract) => (
                  <tr key={contract.id} className="border-t border-line">
                    <td className="py-3 pr-4">
                      <Link to={`/admin/contracts/${contract.id}`} className="font-medium text-ink">{contract.projectName}</Link>
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">{contract.customer}</td>
                    <td className="py-3 pr-4 text-ink-soft">{contract.projectName}</td>
                    <td className="py-3 pr-4">{contractStatusLabels[contract.status]}</td>
                    <td className="py-3 pr-4">v{contract.version}</td>
                    <td className="py-3 pr-4 text-ink-faint">{contract.sentAt || '—'}</td>
                    <td className="py-3 text-ink-faint">{contract.agreedAt || '—'}</td>
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
