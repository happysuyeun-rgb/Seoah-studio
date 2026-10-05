import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { EmptyState } from '../components/EmptyState'
import { FilterTabs } from '../components/FilterTabs'
import { PageHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { portalData } from '../portalData'
import type { PurchaseCategory } from '../types'

type Filter = 'all' | PurchaseCategory

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Ready', label: 'Ready' },
  { id: 'Brand', label: 'Brand' },
  { id: 'Add-ons', label: 'Add-ons' },
]

export function PurchasesPage() {
  usePageTitle('구매 — MY SEOA')
  const [filter, setFilter] = useState<Filter>('all')
  const rows = portalData.purchases.filter((purchase) => filter === 'all' || purchase.category === filter)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="구매" description="구매한 제품과 다운로드 상태를 확인합니다." />
      <FilterTabs value={filter} options={filters} onChange={setFilter} />
      {rows.length === 0 ? (
        <EmptyState title="아직 구매한 제품이 없습니다." action={{ to: '/ready', label: 'Ready 제품 보기' }} />
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {rows.map((purchase) => (
            <li key={purchase.id} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm font-medium text-ink">{purchase.productName}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {purchase.category} · {purchase.purchasedAt}
                </p>
                <div className="mt-2 flex gap-2">
                  <StatusBadge>{purchase.orderStatus}</StatusBadge>
                  <StatusBadge>{purchase.downloadStatus}</StatusBadge>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <Link to={`/my/purchases/${purchase.id}`} className="text-signal">
                  View Detail
                </Link>
                <span className="text-ink-faint">Download</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
