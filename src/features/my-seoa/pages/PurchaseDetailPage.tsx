import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { EmptyState } from '../components/EmptyState'
import { FilterTabs } from '../components/FilterTabs'
import { PageHeader } from '../components/SectionHeader'
import { portalData } from '../portalData'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'license', label: 'License' },
  { id: 'updates', label: 'Update History' },
  { id: 'order', label: 'Order Information' },
  { id: 'support', label: 'Support' },
] as const

type TabId = (typeof tabs)[number]['id']

export function PurchaseDetailPage() {
  usePageTitle('Purchase — MY SEOA')
  const { id } = useParams()
  const [tab, setTab] = useState<TabId>('overview')
  const purchase = portalData.purchases.find((item) => item.id === id) ?? null

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={purchase?.productName ?? '구매'} description="구매 상세, 다운로드, 라이선스, 주문 정보를 이 화면에서 확인합니다." />
      <FilterTabs value={tab} options={tabs.map((item) => ({ id: item.id, label: item.label }))} onChange={setTab} />
      {purchase ? <p className="text-sm text-ink-soft">{purchase.category}</p> : <EmptyState title="구매 정보를 찾지 못했습니다." action={{ to: '/my/purchases', label: '구매 목록' }} />}
    </div>
  )
}
