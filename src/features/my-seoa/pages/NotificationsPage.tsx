import { useState } from 'react'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { EmptyState } from '../components/EmptyState'
import { FilterTabs } from '../components/FilterTabs'
import { PageHeader } from '../components/SectionHeader'
import { portalData } from '../portalData'
import { notificationCategories, type NotificationCategory } from '../types'

type Filter = 'all' | NotificationCategory

export function NotificationsPage() {
  usePageTitle('알림 — MY SEOA')
  const [filter, setFilter] = useState<Filter>('all')
  const rows = portalData.notifications.filter((item) => filter === 'all' || item.category === filter)
  const options: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    ...notificationCategories.map((category) => ({ id: category, label: category })),
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="알림" description="확인이 필요한 소식만 모읍니다." />
      <FilterTabs value={filter} options={options} onChange={setFilter} />
      {rows.length === 0 ? (
        <EmptyState title="새 알림이 없습니다." />
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {rows.map((item) => (
            <li key={item.id} className="py-4 text-sm text-ink">
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
