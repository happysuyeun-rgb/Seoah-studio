import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { intakeProgress } from '../../intake/types'
import { useEngagementSource } from '../../engagements/useEngagementSource'
import { AdminEmptyState, AdminPageHeader } from '../components/AdminPageHeader'
import { paymentBuckets, productStatuses, productTypes, supportStatuses } from '../types'

const customerSections = ['Overview', 'Projects', 'Purchases', 'Proposals', 'Contracts', 'Billing', 'Support', 'Activity']
const settingGroups = ['Studio Profile', 'Default Pricing', 'Default Contract Settings', 'Notification', 'Payment', 'Integrations']
const carePlans = [
  { name: 'Website Care Mini', price: '99,000원 / month' },
  { name: 'Website Care', price: '199,000원 / month' },
  { name: 'Product Care', price: '490,000원~ / month' },
]

function Shell({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <AdminPageHeader title={title} description={description} />
      {children}
    </main>
  )
}

export function AdminCustomersPage() {
  usePageTitle('Customers — SEOAH.STUDIO')
  return (
    <Shell title="Customers" description="고객 목록은 아직 저장되지 않습니다.">
      <AdminEmptyState title="No customers yet." />
    </Shell>
  )
}

export function AdminCustomerDetailPage() {
  usePageTitle('Customer — SEOAH.STUDIO')
  const { id } = useParams()
  return (
    <Shell title="Customer" description="고객 360 화면의 자리입니다. 프로젝트와 구매는 연결되지 않았습니다.">
      <p className="mt-4 text-sm text-ink-faint">{id}</p>
      <ul className="mt-8 divide-y divide-line border-t border-line">
        {customerSections.map((section) => (
          <li key={section} className="py-4 text-sm">
            <p className="font-medium text-ink">{section}</p>
            <p className="mt-1 text-ink-soft">데이터가 없습니다.</p>
          </li>
        ))}
      </ul>
    </Shell>
  )
}

export function AdminProductsPage() {
  usePageTitle('Products — SEOAH.STUDIO')
  return (
    <Shell title="Products" description="Ready, APX, Brand, Care, SaaS를 나중에 한 목록으로 봅니다. 기존 템플릿은 여기서 옮기지 않습니다.">
      <p className="mt-6 text-sm text-ink-soft">Type: {productTypes.join(' · ')}</p>
      <p className="mt-2 text-sm text-ink-soft">Status: {productStatuses.join(' · ')}</p>
      <p className="mt-4 text-sm">
        <Link to="/admin" className="text-signal">
          Legacy Templates
        </Link>
      </p>
      <AdminEmptyState title="No products yet." />
    </Shell>
  )
}

export function AdminOrdersPage() {
  usePageTitle('Orders — SEOAH.STUDIO')
  return (
    <Shell title="Orders" description="주문은 새 테이블로 다시 만들지 않습니다. 기존 Commerce 주문은 Legacy Admin에 있습니다.">
      <p className="mt-6 text-sm">
        <Link to="/admin" className="text-signal">
          Legacy Admin에서 주문 현황 열기
        </Link>
      </p>
    </Shell>
  )
}

export function AdminPaymentsPage() {
  usePageTitle('Payments — SEOAH.STUDIO')
  return (
    <Shell title="Payments" description="Commerce 주문 결제와 Studio 프로젝트 결제는 나중에도 한 종류로 합치지 않습니다. 이 화면은 아직 비어 있습니다.">
      {paymentBuckets.map((section) => (
        <section key={section} className="mt-8">
          <h2 className="text-sm font-medium text-ink">{section}</h2>
          <p className="mt-3 text-sm text-ink-soft">항목이 없습니다.</p>
        </section>
      ))}
    </Shell>
  )
}

export function AdminIntakeQueuePage() {
  usePageTitle('Intake — SEOAH.STUDIO')
  const { engagements, intakes, ready } = useEngagementSource()
  const rows = engagements.map((engagement) => {
    const intake = intakes.find((item) => item.engagementId === engagement.id) ?? null
    const progress = intakeProgress(intake)
    return { engagement, intake, progress }
  })
  return (
    <Shell title="Intake" description="프로젝트별 인테이크 대기열입니다. 상세는 프로젝트 화면에서 엽니다.">
      {!ready ? <p className="mt-8 text-sm text-ink-faint">로딩 중...</p> : null}
      {ready && rows.length === 0 ? <AdminEmptyState title="No intake items yet." /> : null}
      {rows.length > 0 ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-t border-line text-left text-sm">
            <thead>
              <tr className="text-xs text-ink-faint">
                {['Project', 'Customer', 'Completed', 'Required', 'Status', 'Last Updated'].map((label) => (
                  <th key={label} className="py-3 pr-4 font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.engagement.id} className="border-t border-line">
                  <td className="py-3 pr-4">
                    <Link to={`/admin/engagements/${row.engagement.id}?tab=intake`} className="font-medium text-ink">
                      {row.engagement.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-ink-soft">{row.engagement.customer}</td>
                  <td className="py-3 pr-4">{row.progress.completed}</td>
                  <td className="py-3 pr-4">{row.progress.required}</td>
                  <td className="py-3 pr-4">{row.intake?.status ?? '—'}</td>
                  <td className="py-3 text-ink-faint">{row.engagement.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Shell>
  )
}

export function AdminCarePage() {
  usePageTitle('Care — SEOAH.STUDIO')
  return (
    <Shell title="Care" description="구독은 저장하지 않습니다. 요청 1회의 정의, 월 한도, 이월, 응답 시간, 긴급 대응, 외부 비용은 아직 확정하지 않습니다.">
      <ul className="mt-8 divide-y divide-line border-t border-line">
        {carePlans.map((plan) => (
          <li key={plan.name} className="py-4 text-sm">
            <p className="text-ink">{plan.name}</p>
            <p className="mt-1 text-ink-soft">{plan.price}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-ink-faint">Product Care 금액은 범위에 따라 달라질 수 있습니다.</p>
      <AdminEmptyState title="No care subscriptions yet." />
    </Shell>
  )
}

export function AdminSaasPage() {
  usePageTitle('SaaS — SEOAH.STUDIO')
  return (
    <Shell title="SaaS" description="Organization과 Workspace는 아직 만들지 않습니다.">
      <AdminEmptyState title="Coming soon. 데이터가 연결되면 표시됩니다." />
    </Shell>
  )
}

export function AdminSupportPage() {
  usePageTitle('Support — SEOAH.STUDIO')
  return (
    <Shell title="Support" description="판매 전 문의, 고객 지원, 프로젝트 지원을 나중에 한 목록으로 봅니다. 기존 문의 상태와 같지 않습니다.">
      <p className="mt-6 text-sm text-ink-soft">Status: {supportStatuses.join(' · ')}</p>
      <p className="mt-4 text-sm">
        <Link to="/admin" className="text-signal">
          Legacy Admin의 문의 관리
        </Link>
      </p>
      <AdminEmptyState title="No support tickets yet." />
    </Shell>
  )
}

export function AdminChatbotPage() {
  usePageTitle('Chatbot — SEOAH.STUDIO')
  return (
    <Shell title="Chatbot" description="챗봇 문의는 아직 Legacy Admin에서 관리합니다. 새 화면으로 옮기지 않았습니다.">
      <p className="mt-6 text-sm">
        <Link to="/admin" className="text-signal">
          Legacy Chatbot Management
        </Link>
      </p>
    </Shell>
  )
}

export function AdminContentPage() {
  usePageTitle('Content — SEOAH.STUDIO')
  return (
    <Shell title="Content" description="FAQ, Work, 마케팅 문구를 나중에 관리할 자리입니다. CMS는 만들지 않습니다.">
      <AdminEmptyState title="No content entries yet." />
    </Shell>
  )
}

export function AdminAnalyticsPage() {
  usePageTitle('Analytics — SEOAH.STUDIO')
  return (
    <Shell title="Analytics" description="차트는 그리지 않습니다.">
      <AdminEmptyState title="데이터가 연결되면 표시됩니다." />
    </Shell>
  )
}

export function AdminSettingsPage() {
  usePageTitle('Settings — SEOAH.STUDIO')
  return (
    <Shell title="Settings" description="비밀 키는 이 화면에 입력하지 않습니다.">
      <ul className="mt-8 divide-y divide-line border-t border-line">
        {settingGroups.map((group) => (
          <li key={group} className="py-4 text-sm text-ink">
            {group}
            <p className="mt-1 text-ink-soft">아직 설정값이 없습니다.</p>
          </li>
        ))}
      </ul>
    </Shell>
  )
}
