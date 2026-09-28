import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { leadStatusLabels, recommendedPaths, type RecommendedPath } from '../types'
import { useLeadSource } from '../useLeadSource'

const qualification = ['Problem Clarity', 'Budget Fit', 'Timeline', 'Decision Maker', 'Requirements', 'References', 'Operating Business', 'Service Fit']

const pathNotes: Record<RecommendedPath, string> = {
  Ready: '상담 없이 제품 안내가 가능합니다.',
  'Ready + Custom': '짧은 확인이면 됩니다.',
  'Full Custom Website': 'Consultation을 권장합니다.',
  'MVP / Product': 'Consultation을 권장합니다.',
  'Not Fit': '진행하지 않는 기준으로 표시합니다.',
}

const actions = ['Mark as Contacted', 'Schedule Consultation', 'Create Proposal', 'Recommend Ready Product', 'Mark as Lost']

function textList(values: string[]) {
  return values.length > 0 ? values.join(', ') : '—'
}

export function LeadDetailPage() {
  usePageTitle('Lead — SEOAH.STUDIO')
  const { id } = useParams()
  const { leads, ready } = useLeadSource()
  const lead = leads.find((item) => item.id === id) ?? null
  const [path, setPath] = useState<RecommendedPath | null>(null)
  const [note, setNote] = useState('')

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <p className="text-sm text-ink-faint">로딩 중...</p>
      </main>
    )
  }

  if (!lead) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <p className="text-sm text-ink">Lead not found.</p>
        <Link to="/admin/leads" className="mt-4 inline-block text-sm text-ink-soft">
          Leads
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <p className="text-xs text-ink-faint">
        <Link to="/admin/leads" className="hover:text-ink">
          Leads
        </Link>
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{lead.company || lead.name}</h1>
      <p className="mt-2 text-sm text-ink-soft">{leadStatusLabels[lead.status]}</p>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-sm font-medium text-ink">Overview</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Item label="Customer" value={lead.name} />
          <Item label="Company" value={lead.company || '—'} />
          <Item label="Email" value={lead.email} />
          <Item label="Phone" value={lead.phone || '—'} />
          <Item label="Project Type" value={lead.projectType} />
          <Item label="Current Status" value={lead.currentStatus} />
          <Item label="Goal" value={textList(lead.goals)} />
          <Item label="Budget" value={lead.budget} />
          <Item label="Timeline" value={lead.timeline} />
          <Item label="Created At" value={lead.createdAt} />
          <Item label="Status" value={leadStatusLabels[lead.status]} />
        </dl>
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-sm font-medium text-ink">Request</h2>
        <dl className="mt-4 grid gap-4">
          <Item label="Target User" value={textList(lead.targetUsers)} />
          <Item label="Features" value={textList(lead.features)} />
          <Item label="Description" value={lead.description || '—'} />
          <div>
            <dt className="text-xs text-ink-faint">References</dt>
            {lead.references.length === 0 ? <dd className="mt-1 text-sm text-ink">—</dd> : null}
            <dd className="mt-2 grid gap-3">
              {lead.references.map((item) => (
                <p key={`${item.url}-${item.note}`} className="text-sm text-ink">
                  {/^https?:\/\//.test(item.url) ? (
                    <a href={item.url} className="underline" rel="noreferrer">
                      {item.url}
                    </a>
                  ) : (
                    item.url || '—'
                  )}
                  {item.note ? <span className="mt-1 block text-ink-soft">{item.note}</span> : null}
                </p>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-sm font-medium text-ink">Customer</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Item label="Name" value={lead.name} />
          <Item label="Company" value={lead.company || '—'} />
          <Item label="Email" value={lead.email} />
          <Item label="Phone" value={lead.phone || '—'} />
        </dl>
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-sm font-medium text-ink">Qualification</h2>
        <p className="mt-2 text-xs text-ink-faint">점수는 계산하지 않습니다.</p>
        <dl className="mt-4 border-t border-line">
          {qualification.map((label) => (
            <div key={label} className="grid grid-cols-[minmax(0,1fr)_8rem] gap-4 border-b border-line py-3 text-sm">
              <dt className="text-ink-soft">{label}</dt>
              <dd className="text-ink">Unreviewed</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-sm font-medium text-ink">Recommended Path</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">상담은 모든 리드에 필수가 아닙니다. 아래 선택은 이 화면에만 남고 저장되지 않습니다.</p>
        <fieldset className="mt-4">
          <legend className="sr-only">Recommended Path</legend>
          <div className="border-b border-line">
            {recommendedPaths.map((option) => (
              <label key={option} className="flex cursor-pointer items-start gap-3 border-t border-line py-3">
                <input type="radio" name="recommendedPath" value={option} checked={path === option} onChange={() => setPath(option)} className="mt-1 h-4 w-4 accent-ink" />
                <span>
                  <span className="block text-sm font-medium text-ink">{option}</span>
                  <span className="mt-1 block text-sm text-ink-soft">{pathNotes[option]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-sm font-medium text-ink">Internal Notes</h2>
        <label className="mt-4 block">
          <span className="sr-only">Internal note</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-28 w-full border border-line bg-paper px-3 py-3 text-sm text-ink outline-none focus:border-ink"
          />
        </label>
        <p className="mt-2 text-xs text-ink-faint">고객에게 보이지 않습니다. 이 화면에서는 저장되지 않습니다.</p>
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-sm font-medium text-ink">Activity</h2>
        <p className="mt-4 text-sm text-ink-soft">기록된 활동이 없습니다.</p>
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-sm font-medium text-ink">Actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/admin/proposals/new?lead=${lead.id}`} className="border border-ink px-3 py-2 text-sm text-ink">
            Create Proposal
          </Link>
          {actions.filter((action) => action !== 'Create Proposal').map((action) => (
            <button key={action} type="button" disabled className="border border-line px-3 py-2 text-sm text-ink-faint">
              {action}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-faint">상태 변경은 저장되지 않습니다. Create Proposal은 작성 화면으로만 이동합니다.</p>
      </section>
    </main>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{value}</dd>
    </div>
  )
}
