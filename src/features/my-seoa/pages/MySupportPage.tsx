import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { ButtonLink } from '../../../components/ui/Button'
import { EmptyState } from '../components/EmptyState'
import { PageHeader, SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { portalData } from '../portalData'
import { ticketStatuses } from '../types'

export function MySupportPage() {
  usePageTitle('Support — MY SEOA')

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Support" description="문의와 답변 상태를 확인합니다." />
      <section className="mb-12">
        <SectionHeader title="New Inquiry" />
        <ButtonLink to="/contact" size="sm">
          문의하기
        </ButtonLink>
      </section>
      <section>
        <SectionHeader title="Inquiry History" />
        <div className="mb-4 flex flex-wrap gap-2">
          {ticketStatuses.map((status) => (
            <StatusBadge key={status}>{status}</StatusBadge>
          ))}
        </div>
        {portalData.tickets.length === 0 ? (
          <EmptyState title="아직 문의 내역이 없습니다." />
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {portalData.tickets.map((ticket) => (
              <li key={ticket.id} className="py-5">
                <p className="text-sm font-medium text-ink">{ticket.category}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {ticket.submittedAt} · {ticket.status}
                </p>
                <p className="mt-2 text-sm text-ink-soft">{ticket.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
