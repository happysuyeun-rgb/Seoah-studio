import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { StatusBadge } from '../../my-seoa/components/StatusBadge'
import { formatKrw } from '../../proposals/money'
import { intakeProgress, SECRET_INTAKE_NOTE, type Intake, type IntakeItemStatus } from '../../intake/types'
import { ScrollTabs } from '../components/ScrollTabs'
import { customerStageFor, meetsReadyToStart, statusTone } from '../mappers'
import {
  BUG_CHANGE_NOTE,
  CUSTOMER_DELAY_POLICY,
  REVISION_BUNDLE_NOTE,
  STAGE_LOCK_NOTE,
  blockedReasonLabels,
  engagementStatuses,
  engagementStatusLabels,
  type ActionKind,
  type Engagement,
  type EngagementStatus,
} from '../types'
import { useEditable } from '../useEditable'
import { useEngagementSource } from '../useEngagementSource'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'intake', label: 'Intake' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'review', label: 'Review & Approval' },
  { id: 'files', label: 'Files' },
  { id: 'messages', label: 'Messages' },
  { id: 'changes', label: 'Change Requests' },
  { id: 'payments', label: 'Payments' },
  { id: 'activity', label: 'Activity' },
] as const

type TabId = (typeof tabs)[number]['id']

const UNSAVED = '저장되지 않았습니다. 이 브라우저에서만 바뀝니다.'

export function AdminEngagementDetailPage() {
  usePageTitle('Project — SEOAH.STUDIO')
  const { id } = useParams()
  const { engagements, intakes, ready } = useEngagementSource()
  const [tab, setTab] = useState<TabId>('overview')
  const [notice, setNotice] = useState('')
  const [draft, setDraft] = useEditable(id, ready ? (engagements.find((item) => item.id === id) ?? null) : null)
  const [intake, setIntake] = useEditable(id, ready ? (intakes.find((item) => item.engagementId === id) ?? null) : null)

  const milestoneTitle = (milestoneId: string) => draft?.milestones.find((item) => item.id === milestoneId)?.title ?? milestoneId

  const setStatus = (status: EngagementStatus) => {
    setDraft((current) => (current ? { ...current, status, updatedAt: current.updatedAt } : current))
    setNotice(UNSAVED)
  }

  const setAction = (kind: ActionKind) => {
    setDraft((current) => {
      if (!current) return current
      if (kind === 'NONE') return { ...current, actionRequired: null }
      return {
        ...current,
        actionRequired: {
          kind,
          label: kind,
          description: '개발 환경에서만 바뀐 요청입니다.',
          dueDate: null,
          ctaLabel: '프로젝트 열기',
          ctaTarget: `/my/projects/${current.id}`,
        },
      }
    })
    setNotice(UNSAVED)
  }

  const setItemStatus = (itemId: string, status: IntakeItemStatus) => {
    setIntake((current) =>
      current
        ? { ...current, items: current.items.map((item) => (item.id === itemId ? { ...item, status } : item)) }
        : current,
    )
    setNotice(UNSAVED)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <Link to="/admin/engagements" className="text-sm text-ink-soft">
        Projects
      </Link>
      {!ready ? <p className="mt-8 text-sm text-ink-faint">로딩 중...</p> : null}
      {ready && !draft ? <p className="mt-8 text-sm text-ink">프로젝트를 찾을 수 없습니다.</p> : null}
      {draft ? (
        <div className="mt-6">
          <p className="text-xs text-ink-faint">{engagementStatusLabels[draft.status]}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{draft.name}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {draft.customer} · {draft.projectType}. 개발 환경 예시이며 저장되지 않습니다.
          </p>
          {notice ? <p className="mt-3 text-sm text-ink">{notice}</p> : null}
          <div className="mt-8">
            <ScrollTabs value={tab} options={[...tabs]} onChange={setTab} label="Project sections" />
          </div>
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'overview' ? (
              <Overview
                draft={draft}
                intake={intake}
                onStatus={setStatus}
                onAction={setAction}
              />
            ) : null}
            {tab === 'intake' ? (
              <section>
                <p className="text-sm text-ink-soft">{SECRET_INTAKE_NOTE}</p>
                <p className="mt-2 text-sm text-ink-faint">파일 업로드는 연결하지 않습니다.</p>
                <ul className="mt-6 divide-y divide-line border-t border-line">
                  {(intake?.items ?? []).map((item) => (
                    <li key={item.id} className="py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-medium text-ink">{item.title}</h2>
                        <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
                        <span className="text-xs text-ink-faint">{item.required ? 'Required' : 'Optional'}</span>
                      </div>
                      <p className="mt-1 text-xs text-ink-faint">{item.category}</p>
                      <p className="mt-2 text-sm text-ink-soft">{item.customerResponse || item.referenceUrl || '응답 없음'}</p>
                      {item.adminFeedback ? <p className="mt-2 text-sm text-ink">피드백 {item.adminFeedback}</p> : null}
                      {import.meta.env.DEV ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" className="min-h-11 border border-ink px-3 text-sm" onClick={() => setItemStatus(item.id, 'APPROVED')}>
                            Approve
                          </button>
                          <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={() => setItemStatus(item.id, 'NEEDS_REVISION')}>
                            Request Revision
                          </button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {tab === 'milestones' ? (
              <ul className="divide-y divide-line border-t border-line">
                {draft.milestones.map((item) => (
                  <li key={item.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-medium text-ink">{item.title}</h2>
                      <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">{item.description}</p>
                    <p className="mt-2 text-xs text-ink-faint">
                      Due {item.dueDate ?? '—'} · Approval {item.requiresApproval ? 'Yes' : 'No'}
                      {item.notes ? ` · ${item.notes}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
            {tab === 'review' ? (
              <section>
                <p className="text-sm text-ink-soft">{STAGE_LOCK_NOTE}</p>
                <p className="mt-2 text-sm text-ink-soft">{REVISION_BUNDLE_NOTE}</p>
                <ul className="mt-6 divide-y divide-line border-t border-line">
                  {draft.reviews.map((review) => (
                    <li key={review.id} className="py-4 text-sm">
                      <StatusBadge tone={statusTone(review.status)}>{review.status}</StatusBadge>
                      <p className="mt-2 text-ink">{review.title}</p>
                      <p className="mt-1 text-ink-soft">
                        {milestoneTitle(review.milestoneId)} · v{review.version}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {tab === 'files' ? (
              <FileList files={draft.files} />
            ) : null}
            {tab === 'messages' ? (
              <section className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h2 className="text-sm font-medium text-ink">Messages</h2>
                  <MessageList messages={draft.messages} />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-ink">Internal Notes</h2>
                  <p className="mt-2 text-xs text-ink-faint">Admin only. 고객 메시지와 다른 기록입니다.</p>
                  <p className="mt-3 text-sm text-ink-soft">{draft.internalNotes || '내부 메모가 없습니다.'}</p>
                </div>
              </section>
            ) : null}
            {tab === 'changes' ? (
              <section>
                <p className="text-sm text-ink-soft">{BUG_CHANGE_NOTE}</p>
                <ChangeList requests={draft.changeRequests} />
              </section>
            ) : null}
            {tab === 'payments' ? <PaymentList payments={draft.payments} /> : null}
            {tab === 'activity' ? <ActivityList items={draft.activities} /> : null}
          </div>
        </div>
      ) : null}
    </main>
  )
}

function Overview({
  draft,
  intake,
  onStatus,
  onAction,
}: {
  draft: Engagement
  intake: Intake | null
  onStatus: (status: EngagementStatus) => void
  onAction: (kind: ActionKind) => void
}) {
  const current = draft.milestones.find((item) => item.id === draft.currentMilestoneId)
  const ready = meetsReadyToStart({ contractAgreed: draft.contractAgreed, depositPaid: draft.depositPaid, intake })
  const counts = intakeProgress(intake)
  return (
    <div>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-faint">Customer</dt>
          <dd>{draft.customer}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Type</dt>
          <dd>{draft.projectType}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Engagement Status</dt>
          <dd>{engagementStatusLabels[draft.status]}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Customer Stage</dt>
          <dd>{customerStageFor(draft.status)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Progress</dt>
          <dd>{draft.progress}%</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Current Milestone</dt>
          <dd>{current?.title ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Start</dt>
          <dd>{draft.startedAt ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Expected Completion</dt>
          <dd>{draft.expectedCompletion ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Action Required</dt>
          <dd>{draft.actionRequired?.label ?? 'None'}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Blocked Reason</dt>
          <dd>{draft.blockedReason ? blockedReasonLabels[draft.blockedReason] : 'None'}</dd>
        </div>
      </dl>
      <p className="mt-6 text-sm text-ink-soft">
        시작 조건 {ready ? '충족' : '미충족'} · Intake {counts.completed} / {counts.required}. 조건만 보여 주고 상태를 바꾸지 않습니다.
      </p>
      <p className="mt-2 text-sm text-ink-faint">{CUSTOMER_DELAY_POLICY}</p>
      {import.meta.env.DEV ? (
        <fieldset className="mt-8 border-t border-line pt-6">
          <legend className="text-sm font-medium text-ink">Quick Actions</legend>
          <label className="mt-4 block max-w-xs text-sm">
            <span className="mb-2 block text-xs text-ink-faint">Change Status</span>
            <select
              value={draft.status}
              onChange={(event) => onStatus(event.target.value as EngagementStatus)}
              className="w-full border border-line bg-paper px-3 py-2"
            >
              {engagementStatuses.map((status) => (
                <option key={status} value={status}>
                  {engagementStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={() => onAction('CONTENT_REQUIRED')}>
              Request Content
            </button>
            <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={() => onAction('REVIEW_REQUIRED')}>
              Request Review
            </button>
            <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={() => onAction('APPROVAL_REQUIRED')}>
              Request Approval
            </button>
            <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={() => onStatus('PAUSED')}>
              Pause Project
            </button>
          </div>
        </fieldset>
      ) : null}
    </div>
  )
}

function FileList({ files }: { files: Engagement['files'] }) {
  if (files.length === 0) return <p className="text-sm text-ink-soft">파일이 없습니다.</p>
  return (
    <ul className="divide-y divide-line border-t border-line">
      {files.map((file) => (
        <li key={file.id} className="py-4 text-sm">
          <p className="text-ink">{file.name}</p>
          <p className="mt-1 text-ink-faint">
            {file.category} · {file.uploadedBy} · v{file.version} · {file.createdAt}
          </p>
        </li>
      ))}
    </ul>
  )
}

function MessageList({ messages }: { messages: Engagement['messages'] }) {
  if (messages.length === 0) return <p className="mt-4 text-sm text-ink-soft">메시지가 없습니다.</p>
  return (
    <ul className="mt-4 divide-y divide-line border-t border-line">
      {messages.map((message) => (
        <li key={message.id} className="py-4 text-sm">
          <p className="text-xs text-ink-faint">
            {message.sender} · {message.createdAt}
            {message.isInternal ? ' · Internal' : ''}
          </p>
          <p className="mt-2 text-ink">{message.body}</p>
        </li>
      ))}
    </ul>
  )
}

function ChangeList({ requests }: { requests: Engagement['changeRequests'] }) {
  if (requests.length === 0) return <p className="mt-6 text-sm text-ink-soft">변경 요청이 없습니다.</p>
  return (
    <ul className="mt-6 divide-y divide-line border-t border-line">
      {requests.map((request) => (
        <li key={request.id} className="py-4 text-sm">
          <StatusBadge tone={statusTone(request.status)}>{request.status}</StatusBadge>
          <h2 className="mt-2 font-medium text-ink">{request.title}</h2>
          <p className="mt-1 text-ink-soft">{request.classification}</p>
          <p className="mt-2 text-ink">{request.description}</p>
          <p className="mt-2 text-ink-faint">
            비용 {request.costImpact} · 일정 {request.scheduleImpact}
          </p>
        </li>
      ))}
    </ul>
  )
}

function PaymentList({ payments }: { payments: Engagement['payments'] }) {
  return (
    <section>
      <p className="text-sm text-ink-soft">결제 상태와 프로젝트 상태는 별도입니다. 결제는 연결하지 않습니다.</p>
      <ul className="mt-6 divide-y divide-line border-t border-line">
        {payments.map((payment) => (
          <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
            <span className="text-ink">
              {payment.label} · {formatKrw(payment.amount)}
            </span>
            <StatusBadge tone={statusTone(payment.status)}>{payment.status}</StatusBadge>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ActivityList({ items }: { items: Engagement['activities'] }) {
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  if (sorted.length === 0) return <p className="text-sm text-ink-soft">활동이 없습니다.</p>
  return (
    <ol className="divide-y divide-line border-t border-line">
      {sorted.map((item) => (
        <li key={item.id} className="py-4 text-sm">
          <p className="text-xs text-ink-faint">
            {item.createdAt} · {item.actor} · {item.type}
          </p>
          <p className="mt-1 text-ink">{item.description}</p>
        </li>
      ))}
    </ol>
  )
}
