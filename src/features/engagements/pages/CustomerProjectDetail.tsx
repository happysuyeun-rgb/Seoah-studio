import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { EmptyState } from '../../my-seoa/components/EmptyState'
import { ProgressTimeline } from '../../my-seoa/components/ProgressTimeline'
import { StatusBadge } from '../../my-seoa/components/StatusBadge'
import { formatKrw } from '../../proposals/money'
import { intakeProgress, SECRET_INTAKE_NOTE } from '../../intake/types'
import { ActionRequiredPanel } from '../components/ActionRequiredPanel'
import { ScrollTabs } from '../components/ScrollTabs'
import { nextCustomerStage, statusTone, toCustomerEngagementView } from '../mappers'
import { customerHoldLabels } from '../types'
import { BUG_CHANGE_NOTE, REVISION_BUNDLE_NOTE, STAGE_LOCK_NOTE, type Engagement } from '../types'
import { useEditable } from '../useEditable'
import { useEngagementSource } from '../useEngagementSource'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'progress', label: 'Progress' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'review', label: 'Review & Approval' },
  { id: 'files', label: 'Files' },
  { id: 'payments', label: 'Payments' },
  { id: 'messages', label: 'Messages' },
  { id: 'changes', label: 'Change Requests' },
  { id: 'activity', label: 'Activity' },
] as const

type TabId = (typeof tabs)[number]['id']

const UNSAVED = '저장되지 않았습니다. 이 브라우저에서만 바뀝니다.'

function isTab(value: string | null): value is TabId {
  return tabs.some((tab) => tab.id === value)
}

export function CustomerProjectDetail() {
  usePageTitle('Project — MY SEOA')
  const { id } = useParams()
  const [params] = useSearchParams()
  const initial = params.get('tab')
  const { engagements, intakes, ready } = useEngagementSource()
  const [tab, setTab] = useState<TabId>(isTab(initial) ? initial : 'overview')
  const [notice, setNotice] = useState('')
  const [feedback, setFeedback] = useState('')
  const [draft, setDraft] = useEditable(id, ready ? (engagements.find((item) => item.id === id) ?? null) : null)
  const [intake, setIntake] = useEditable(id, ready ? (intakes.find((item) => item.engagementId === id) ?? null) : null)

  const view = draft ? toCustomerEngagementView(draft) : null
  const counts = intakeProgress(intake)
  const next = view ? nextCustomerStage(view.progressStage) : null

  const patchReview = (reviewId: string, status: Engagement['reviews'][number]['status']) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            reviews: current.reviews.map((review) =>
              review.id === reviewId ? { ...review, status, feedback, reviewedAt: '2026-09-28' } : review,
            ),
          }
        : current,
    )
    setNotice(UNSAVED)
  }

  const patchChange = (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setDraft((current) =>
      current
        ? {
            ...current,
            changeRequests: current.changeRequests.map((request) =>
              request.id === requestId ? { ...request, status, approvedAt: status === 'APPROVED' ? '2026-09-28' : null } : request,
            ),
          }
        : current,
    )
    setNotice(UNSAVED)
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <Link to="/my/projects" className="text-sm text-ink-soft">
        Projects
      </Link>
      {!ready ? <p className="mt-8 text-sm text-ink-faint">로딩 중...</p> : null}
      {ready && !view ? (
        <div className="mt-8">
          <EmptyState title="진행 중인 프로젝트가 없습니다." action={{ to: '/my/projects', label: '프로젝트 목록' }} />
        </div>
      ) : null}
      {view ? (
        <div className="mt-6">
          {import.meta.env.DEV ? <p className="mb-4 text-xs text-ink-faint">개발 환경 예시입니다. 승인, 메시지, 파일은 저장되지 않습니다.</p> : null}
          <h1 className="text-3xl font-semibold tracking-tight text-ink">{view.name}</h1>
          <p className="mt-3 text-sm text-ink-soft">
            {view.progressStage}
            {view.hold ? ` · ${customerHoldLabels[view.hold]}` : ''} · {view.progress}% · {view.expectedCompletion ?? '일정 미정'}
          </p>
          {notice ? <p className="mt-3 text-sm text-ink">{notice}</p> : null}
          <div className="mt-8">
            <ScrollTabs value={tab} options={[...tabs]} onChange={setTab} label="Project" />
          </div>
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'overview' ? (
              <div className="grid gap-8">
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-ink-faint">지금 단계</dt>
                    <dd className="mt-1 text-ink">
                      {view.progressStage}
                      {view.hold ? ` · ${customerHoldLabels[view.hold]}` : ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">다음 단계</dt>
                    <dd className="mt-1 text-ink">{next ?? '마지막 단계입니다.'}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">끝날 예정</dt>
                    <dd className="mt-1 text-ink">{view.expectedCompletion ?? '일정 미정'}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">진행률</dt>
                    <dd className="mt-1 text-ink">{view.progress}%</dd>
                  </div>
                </dl>
                <div>
                  <h2 className="text-sm font-medium text-ink">해야 할 일</h2>
                  <ActionRequiredPanel action={view.actionRequired} />
                </div>
                <section>
                  <h2 className="text-sm font-medium text-ink">프로젝트 시작을 위해 필요한 정보</h2>
                  {counts.required === 0 ? (
                    <p className="mt-3 text-sm text-ink-soft">필요한 정보 항목이 없습니다.</p>
                  ) : (
                    <p className="mt-3 text-sm text-ink">
                      {counts.completed} / {counts.required} completed
                    </p>
                  )}
                  <p className="mt-2 text-sm text-ink-faint">{SECRET_INTAKE_NOTE}</p>
                  <ul className="mt-4 divide-y divide-line border-t border-line">
                    {(intake?.items ?? []).map((item) => (
                      <li key={item.id} className="py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm text-ink">{item.title}</h3>
                          <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
                        </div>
                        <p className="mt-1 text-xs text-ink-faint">
                          {item.category} · {item.required ? 'Required' : 'Optional'}
                        </p>
                        <p className="mt-2 text-sm text-ink-soft">{item.description}</p>
                        {item.customerResponse ? <p className="mt-2 text-sm text-ink">{item.customerResponse}</p> : null}
                        {item.referenceUrl ? <p className="mt-1 text-sm text-ink-soft">{item.referenceUrl}</p> : null}
                        {item.adminFeedback ? <p className="mt-2 text-sm text-ink">피드백 {item.adminFeedback}</p> : null}
                        {import.meta.env.DEV ? (
                          <label className="mt-3 block text-sm">
                            <span className="mb-1 block text-xs text-ink-faint">Customer Response</span>
                            <textarea
                              value={item.customerResponse}
                              onChange={(event) => {
                                const value = event.target.value
                                setIntake((current) =>
                                  current
                                    ? { ...current, items: current.items.map((row) => (row.id === item.id ? { ...row, customerResponse: value } : row)) }
                                    : current,
                                )
                                setNotice(UNSAVED)
                              }}
                              rows={2}
                              className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                            />
                          </label>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            ) : null}
            {tab === 'progress' ? <ProgressTimeline current={view.progressStage} /> : null}
            {tab === 'milestones' ? (
              <ul className="divide-y divide-line border-t border-line">
                {view.milestones.map((item) => (
                  <li key={item.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-medium text-ink">{item.title}</h2>
                      <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
                      {item.needsAction ? <span className="text-xs text-ink-faint">Need Action</span> : null}
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">{item.description}</p>
                    <p className="mt-1 text-xs text-ink-faint">Expected {item.dueDate ?? '—'}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            {tab === 'review' ? (
              <section>
                <p className="text-sm text-ink-soft">{STAGE_LOCK_NOTE}</p>
                <p className="mt-2 text-sm text-ink-soft">{REVISION_BUNDLE_NOTE}</p>
                <ul className="mt-6 divide-y divide-line border-t border-line">
                  {view.reviews.map((review) => (
                    <li key={review.id} className="py-4">
                      <StatusBadge tone={statusTone(review.status)}>{review.status}</StatusBadge>
                      <h2 className="mt-2 text-sm font-medium text-ink">{review.title}</h2>
                      <p className="mt-1 text-xs text-ink-faint">Version {review.version}</p>
                      {import.meta.env.DEV ? (
                        <div className="mt-4">
                          <label className="block text-sm">
                            <span className="mb-1 block text-xs text-ink-faint">Feedback</span>
                            <textarea
                              value={feedback}
                              onChange={(event) => setFeedback(event.target.value)}
                              rows={3}
                              className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                            />
                          </label>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" className="min-h-11 border border-ink px-3 text-sm" onClick={() => patchReview(review.id, 'APPROVED')}>
                              Approve
                            </button>
                            <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={() => patchReview(review.id, 'REVISION_REQUESTED')}>
                              Request Revision
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {tab === 'files' ? (
              view.files.length === 0 ? (
                <p className="text-sm text-ink-soft">파일이 없습니다.</p>
              ) : (
                <ul className="divide-y divide-line border-t border-line">
                  {view.files.map((file) => (
                    <li key={file.id} className="py-4 text-sm">
                      <p className="text-ink">{file.name}</p>
                      <p className="mt-1 text-ink-faint">
                        {file.category} · v{file.version} · {file.createdAt}
                      </p>
                    </li>
                  ))}
                </ul>
              )
            ) : null}
            {tab === 'payments' ? (
              <section>
                <p className="text-sm text-ink-soft">결제 상태와 프로젝트 진행 상태는 별도입니다. 이 화면에서 결제하지 않습니다.</p>
                <ul className="mt-6 divide-y divide-line border-t border-line">
                  {view.payments.map((payment) => (
                    <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
                      <span>
                        {payment.label} · {formatKrw(payment.amount)}
                      </span>
                      <StatusBadge tone={statusTone(payment.status)}>{payment.status}</StatusBadge>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {tab === 'messages' ? (
              view.messages.length === 0 ? (
                <p className="text-sm text-ink-soft">메시지가 없습니다.</p>
              ) : (
                <ul className="divide-y divide-line border-t border-line">
                  {view.messages.map((message) => (
                    <li key={message.id} className="py-4 text-sm">
                      <p className="text-xs text-ink-faint">
                        {message.sender} · {message.createdAt}
                      </p>
                      <p className="mt-2 text-ink">{message.body}</p>
                    </li>
                  ))}
                </ul>
              )
            ) : null}
            {tab === 'changes' ? (
              <section>
                <p className="text-sm text-ink-soft">{BUG_CHANGE_NOTE}</p>
                <ul className="mt-6 divide-y divide-line border-t border-line">
                  {view.changeRequests.map((request) => (
                    <li key={request.id} className="py-4 text-sm">
                      <StatusBadge tone={statusTone(request.status)}>{request.status}</StatusBadge>
                      <h2 className="mt-2 font-medium text-ink">{request.title}</h2>
                      <p className="mt-1 text-ink-faint">{request.classification}</p>
                      <p className="mt-2 text-ink">{request.description}</p>
                      <p className="mt-2 text-ink-soft">
                        비용 {request.costImpact} · 일정 {request.scheduleImpact}
                      </p>
                      {import.meta.env.DEV && request.status === 'AWAITING_CUSTOMER_APPROVAL' ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" className="min-h-11 border border-ink px-3 text-sm" onClick={() => patchChange(request.id, 'APPROVED')}>
                            Approve
                          </button>
                          <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={() => patchChange(request.id, 'REJECTED')}>
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {tab === 'activity' ? (
              <ol className="divide-y divide-line border-t border-line">
                {[...view.activities]
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((item) => (
                    <li key={item.id} className="py-4 text-sm">
                      <p className="text-xs text-ink-faint">
                        {item.createdAt} · {item.actor}
                      </p>
                      <p className="mt-1 text-ink">{item.description}</p>
                    </li>
                  ))}
              </ol>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
