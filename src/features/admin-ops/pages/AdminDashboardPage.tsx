import { Link } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { useContractSource } from '../../contracts/useContractSource'
import { intakeProgress } from '../../intake/types'
import { useEngagementSource } from '../../engagements/useEngagementSource'
import { leadStatuses } from '../../leads/types'
import { useLeadSource } from '../../leads/useLeadSource'
import { useProposalSource } from '../../proposals/useProposalSource'
import { AdminMetric, AdminPageHeader } from '../components/AdminPageHeader'

type Attention = { id: string; label: string; detail: string; to: string }

export function AdminDashboardPage() {
  usePageTitle('Dashboard — SEOAH.STUDIO')
  const leads = useLeadSource()
  const proposals = useProposalSource()
  const contracts = useContractSource()
  const engagements = useEngagementSource()
  const ready = leads.ready && proposals.ready && contracts.ready && engagements.ready

  const attention: Attention[] = []
  for (const lead of leads.leads) {
    if (lead.status === 'NEW') attention.push({ id: lead.id, label: 'New Lead', detail: lead.company || lead.name, to: `/admin/leads/${lead.id}` })
  }
  for (const proposal of proposals.proposals) {
    if (proposal.status === 'SENT' || proposal.status === 'VIEWED') {
      attention.push({ id: proposal.id, label: 'Proposal Review', detail: proposal.content.title, to: `/admin/proposals/${proposal.id}` })
    }
  }
  for (const contract of contracts.contracts) {
    if (contract.status === 'SENT' || contract.status === 'VIEWED') {
      attention.push({ id: contract.id, label: 'Contract Pending', detail: contract.projectName, to: `/admin/contracts/${contract.id}` })
    }
    if (contract.deposit.status !== 'PAID' && contract.status !== 'DECLINED' && contract.status !== 'EXPIRED') {
      attention.push({ id: `${contract.id}-deposit`, label: 'Deposit Pending', detail: contract.projectName, to: `/admin/contracts/${contract.id}` })
    }
  }
  for (const engagement of engagements.engagements) {
    if (engagement.blockedReason) {
      attention.push({ id: `${engagement.id}-blocked`, label: 'Blocked Project', detail: engagement.name, to: `/admin/engagements/${engagement.id}` })
    }
    const intake = engagements.intakes.find((item) => item.engagementId === engagement.id) ?? null
    const progress = intakeProgress(intake)
    if (progress.required > progress.completed) {
      attention.push({ id: `${engagement.id}-intake`, label: 'Intake Incomplete', detail: engagement.name, to: `/admin/engagements/${engagement.id}?tab=intake` })
    }
    for (const review of engagement.reviews) {
      if (review.status === 'PENDING') {
        attention.push({ id: review.id, label: 'Customer Review', detail: review.title, to: `/admin/engagements/${engagement.id}?tab=review` })
      }
    }
    for (const request of engagement.changeRequests) {
      if (request.audience === 'customer' && request.status === 'AWAITING_CUSTOMER_APPROVAL') {
        attention.push({ id: request.id, label: 'Change Request Approval', detail: request.title, to: `/admin/engagements/${engagement.id}?tab=changes` })
      }
    }
    for (const payment of engagement.payments) {
      if (payment.status === 'OVERDUE' || payment.status === 'PENDING') {
        attention.push({
          id: payment.id,
          label: payment.status === 'OVERDUE' ? 'Overdue Payment' : 'Payment Pending',
          detail: `${engagement.name} · ${payment.label}`,
          to: `/admin/engagements/${engagement.id}?tab=payments`,
        })
      }
    }
  }

  const activeProjects = engagements.engagements.filter((item) => item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && item.status !== 'DRAFT')
  const milestones = engagements.engagements
    .flatMap((engagement) => engagement.milestones.map((milestone) => ({ engagement, milestone })))
    .filter((item) => item.milestone.dueDate && item.milestone.status !== 'COMPLETED' && item.milestone.status !== 'APPROVED')
    .sort((a, b) => (a.milestone.dueDate ?? '').localeCompare(b.milestone.dueDate ?? ''))
  const activity = engagements.engagements
    .flatMap((engagement) => engagement.activities.map((item) => ({ ...item, project: engagement.name })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <AdminPageHeader title="Dashboard" description="저장되지 않은 운영 화면입니다. 숫자가 없으면 0 또는 빈 목록입니다." />
      {!ready ? <p className="mt-8 text-sm text-ink-faint">로딩 중...</p> : null}
      {ready ? (
        <div className="mt-10 grid gap-12">
          <section>
            <h2 className="text-sm font-medium text-ink">Needs Attention</h2>
            {attention.length === 0 ? <p className="mt-4 text-sm text-ink-soft">확인할 항목이 없습니다.</p> : null}
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {attention.map((item) => (
                <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm">
                  <span className="text-ink-faint">{item.label}</span>
                  <Link to={item.to} className="text-ink">
                    {item.detail}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-medium text-ink">Pipeline</h2>
            <div className="mt-4 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
              {leadStatuses.map((status) => (
                <AdminMetric key={status} label={status} value={String(leads.leads.filter((lead) => lead.status === status).length)} />
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-sm font-medium text-ink">Active Projects</h2>
            {activeProjects.length === 0 ? <p className="mt-4 text-sm text-ink-soft">진행 중인 프로젝트가 없습니다.</p> : null}
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {activeProjects.map((project) => (
                <li key={project.id} className="py-3 text-sm">
                  <Link to={`/admin/engagements/${project.id}`} className="text-ink">
                    {project.name}
                  </Link>
                  <p className="mt-1 text-ink-faint">{project.customer}</p>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-medium text-ink">Upcoming Milestones</h2>
            {milestones.length === 0 ? <p className="mt-4 text-sm text-ink-soft">예정된 마일스톤이 없습니다.</p> : null}
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {milestones.slice(0, 5).map((item) => (
                <li key={item.milestone.id} className="py-3 text-sm">
                  <Link to={`/admin/engagements/${item.engagement.id}?tab=milestones`} className="text-ink">
                    {item.milestone.title}
                  </Link>
                  <p className="mt-1 text-ink-faint">
                    {item.engagement.name} · {item.milestone.dueDate}
                  </p>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-medium text-ink">Payment Attention</h2>
            <p className="mt-2 text-sm text-ink-soft">Studio 결제와 Commerce 주문 결제는 따로 봅니다. 주문 결제는 Legacy Admin에 있습니다.</p>
            <AdminMetric label="Studio items needing attention" value={String(attention.filter((item) => item.label.includes('Payment') || item.label.includes('Deposit') || item.label.includes('Overdue')).length)} />
          </section>
          <section>
            <h2 className="text-sm font-medium text-ink">Recent Activity</h2>
            {activity.length === 0 ? <p className="mt-4 text-sm text-ink-soft">최근 활동이 없습니다.</p> : null}
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {activity.map((item) => (
                <li key={item.id} className="py-3 text-sm">
                  <p className="text-ink">{item.description}</p>
                  <p className="mt-1 text-ink-faint">
                    {item.project} · {item.createdAt}
                  </p>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-medium text-ink">Support Waiting</h2>
            <p className="mt-4 text-sm text-ink-soft">0. 새 지원 목록은 아직 연결되지 않았습니다.</p>
          </section>
          <section>
            <h2 className="text-sm font-medium text-ink">Quick Actions</h2>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link to="/admin/leads" className="min-h-11 border border-ink px-3 py-2">
                Leads
              </Link>
              <Link to="/admin/proposals/new" className="min-h-11 border border-line px-3 py-2">
                New Proposal
              </Link>
              <Link to="/admin/intake" className="min-h-11 border border-line px-3 py-2">
                Intake Queue
              </Link>
              <Link to="/admin" className="min-h-11 border border-line px-3 py-2">
                Legacy Admin
              </Link>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}
