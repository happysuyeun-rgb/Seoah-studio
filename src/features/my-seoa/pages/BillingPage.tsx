import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { EmptyState } from '../components/EmptyState'
import { PageHeader, SectionHeader } from '../components/SectionHeader'
import { portalData } from '../portalData'

export function BillingPage() {
  usePageTitle('Billing — MY SEOA')

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Billing" description="결제 내역을 확인합니다." />
      <section>
        <SectionHeader title="Payment History" />
        {portalData.payments.length === 0 ? (
          <EmptyState title="결제 내역이 없습니다." />
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {portalData.payments.map((payment) => (
              <li key={payment.id} className="flex justify-between py-4 text-sm text-ink">
                <span>{payment.label}</span>
                <span className="text-ink-soft">{payment.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-12">
        <SectionHeader title="Invoices" />
        <EmptyState title="인보이스가 없습니다." />
      </section>
      <section className="mt-12">
        <SectionHeader title="Receipts" />
        <EmptyState title="영수증이 없습니다." />
      </section>
      <section className="mt-12">
        <SectionHeader title="Subscriptions" />
        <EmptyState title="구독이 없습니다." />
      </section>
      <section className="mt-12">
        <SectionHeader title="Payment Methods" />
        <EmptyState title="등록된 결제 수단이 없습니다." />
      </section>
    </div>
  )
}
