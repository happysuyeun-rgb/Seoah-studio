import { Link, useParams } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { ContractDocument } from '../components/ContractDocument'
import { contractStatusLabels } from '../types'
import { useContractSource } from '../useContractSource'

export function AdminContractDetailPage() {
  usePageTitle('Contract — SEOAH.STUDIO')
  const { id } = useParams()
  const { contracts, ready } = useContractSource()
  const contract = contracts.find((item) => item.id === id) ?? null

  if (!ready) return <main className="px-4 py-8"><p className="text-sm text-ink-faint">로딩 중...</p></main>
  if (!contract) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-ink">Contract not found.</p>
        <Link to="/admin/contracts" className="mt-4 inline-block text-sm text-ink-soft">Contracts</Link>
      </main>
    )
  }

  return (
    <main className="px-4 py-8 sm:px-8">
      <div className="mx-auto mb-8 flex max-w-2xl items-center justify-between">
        <Link to="/admin/contracts" className="text-sm text-ink-soft">Contracts</Link>
        <p className="text-sm text-ink">{contractStatusLabels[contract.status]}</p>
      </div>
      <ContractDocument contract={contract} />
    </main>
  )
}
