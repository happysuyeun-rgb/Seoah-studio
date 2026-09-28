import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { ProposalDocument } from '../components/ProposalDocument'
import { formatKrw, priceSummary } from '../money'
import { blankProposal, type PaymentScheduleItem, type Proposal, type ProposalLineItem, type ProposalSection, type ProposalTimelinePhase } from '../types'
import { useProposalSource } from '../useProposalSource'

const inputClass = 'w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink'

export function AdminProposalEditorPage() {
  usePageTitle('Edit Proposal — SEOAH.STUDIO')
  const { id } = useParams()
  const [params] = useSearchParams()
  const { proposals, ready } = useProposalSource()
  const existing = id ? proposals.find((item) => item.id === id) ?? null : null
  const [proposal, setProposal] = useState<Proposal>(() => blankProposal())
  const [preview, setPreview] = useState(false)
  const [loaded, setLoaded] = useState(!id)

  useEffect(() => {
    if (!id || !ready) return
    if (existing) {
      setProposal(existing)
      setLoaded(true)
    } else if (ready) {
      setLoaded(true)
    }
  }, [id, ready, existing])

  useEffect(() => {
    if (id || !import.meta.env.DEV) return
    const leadId = params.get('lead')
    if (!leadId) return
    let cancelled = false
    void import('../../leads/mockData').then((mod) => {
      const lead = mod.mockLeads.find((item) => item.id === leadId)
      if (!lead || cancelled) return
      setProposal((current) => ({
        ...current,
        leadId: lead.id,
        content: {
          ...current.content,
          customer: lead.name,
          company: lead.company,
          projectName: lead.projectType,
          title: current.content.title || `${lead.company} proposal`,
        },
      }))
    })
    return () => {
      cancelled = true
    }
  }, [id, params])

  if (id && !ready) {
    return <main className="mx-auto max-w-3xl px-4 py-8"><p className="text-sm text-ink-faint">로딩 중...</p></main>
  }
  if (id && ready && !existing && loaded) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-ink">Proposal not found.</p>
      </main>
    )
  }

  const content = proposal.content
  const price = priceSummary(content.lineItems)
  const setContent = (partial: Partial<Proposal['content']>) => {
    setProposal((current) => ({ ...current, content: { ...current.content, ...partial } }))
  }

  if (preview) {
    return (
      <main className="px-4 py-8 sm:px-8">
        <div className="mx-auto mb-8 flex max-w-3xl justify-between">
          <p className="text-sm text-ink-faint">고객에게 보이는 레이아웃입니다. 저장되지 않습니다.</p>
          <button type="button" onClick={() => setPreview(false)} className="border border-ink px-3 py-2 text-sm">
            Back to editor
          </button>
        </div>
        <ProposalDocument proposal={proposal} />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/proposals" className="text-sm text-ink-soft">Proposals</Link>
        <button type="button" onClick={() => setPreview(true)} className="border border-ink px-3 py-2 text-sm text-ink">
          Preview
        </button>
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">{id ? 'Edit Proposal' : 'New Proposal'}</h1>
      <p className="mt-2 text-sm text-ink-soft">Version {proposal.currentVersion}. 이 화면의 변경은 저장되지 않습니다.</p>
      {!import.meta.env.DEV && params.get('lead') ? <p className="mt-3 text-sm text-ink">이 환경에서는 리드를 불러오지 않습니다.</p> : null}

      <EditorSection title="1. Basic Information">
        <Field label="Proposal Title" value={content.title} onChange={(title) => setContent({ title })} />
        <Field label="Customer" value={content.customer} onChange={(customer) => setContent({ customer })} />
        <Field label="Company" value={content.company} onChange={(company) => setContent({ company })} />
        <Field label="Project Name" value={content.projectName} onChange={(projectName) => setContent({ projectName })} />
        <p className="text-sm text-ink-soft">Proposal Version: v{proposal.currentVersion}</p>
        <Field label="Valid Until" type="date" value={content.validUntil} onChange={(validUntil) => setContent({ validUntil })} />
      </EditorSection>

      <EditorSection title="2. Project Summary">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Project Summary</span>
          <textarea className={`${inputClass} min-h-32`} value={content.summary} onChange={(event) => setContent({ summary: event.target.value })} />
        </label>
      </EditorSection>

      <EditorSection title="3. Goal">
        {content.goals.map((goal, index) => (
          <div key={`${index}-${goal}`} className="flex gap-2">
            <input className={inputClass} value={goal} onChange={(event) => setContent({ goals: content.goals.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) })} />
            <button type="button" className="text-sm text-ink-soft" onClick={() => setContent({ goals: content.goals.filter((_, itemIndex) => itemIndex !== index) })}>삭제</button>
          </div>
        ))}
        <button type="button" className="text-sm font-medium" onClick={() => setContent({ goals: [...content.goals, ''] })}>목표 추가</button>
      </EditorSection>

      <NamedList title="4. Scope" items={content.scope} onChange={(scope) => setContent({ scope })} />
      <NamedList title="5. Out of Scope" items={content.outOfScope} onChange={(outOfScope) => setContent({ outOfScope })} hint="예시 문구를 기본값으로 넣지 않습니다." />
      <NamedList title="6. Deliverables" items={content.deliverables} onChange={(deliverables) => setContent({ deliverables })} />

      <EditorSection title="7. Timeline">
        {content.timeline.map((phase) => (
          <div key={phase.id} className="grid gap-2 border-t border-line pt-4">
            <Field label="Name" value={phase.name} onChange={(name) => updatePhase(content.timeline, phase.id, { name }, (timeline) => setContent({ timeline }))} />
            <Field label="Duration" value={phase.duration} onChange={(duration) => updatePhase(content.timeline, phase.id, { duration }, (timeline) => setContent({ timeline }))} />
            <Field label="Description" value={phase.description} onChange={(description) => updatePhase(content.timeline, phase.id, { description }, (timeline) => setContent({ timeline }))} />
            <button type="button" className="text-left text-sm text-ink-soft" onClick={() => setContent({ timeline: content.timeline.filter((item) => item.id !== phase.id) })}>삭제</button>
          </div>
        ))}
        <button type="button" className="text-sm font-medium" onClick={() => setContent({ timeline: [...content.timeline, { id: crypto.randomUUID(), name: '', duration: '', description: '' }] })}>Phase 추가</button>
      </EditorSection>

      <EditorSection title="8. Price Breakdown">
        <p className="text-xs text-ink-faint">KRW. 계산은 화면 표시이며 결제와 연결되지 않습니다.</p>
        {content.lineItems.map((item) => (
          <div key={item.id} className="grid gap-2 border-t border-line pt-4">
            <Field label="Item" value={item.item} onChange={(value) => updateLine(content.lineItems, item.id, { item: value }, (lineItems) => setContent({ lineItems }))} />
            <Field label="Description" value={item.description} onChange={(description) => updateLine(content.lineItems, item.id, { description }, (lineItems) => setContent({ lineItems }))} />
            <Field label="Amount" type="number" value={String(item.amount)} onChange={(value) => updateLine(content.lineItems, item.id, { amount: Number(value) || 0 }, (lineItems) => setContent({ lineItems }))} />
            <button type="button" className="text-left text-sm text-ink-soft" onClick={() => setContent({ lineItems: content.lineItems.filter((line) => line.id !== item.id) })}>삭제</button>
          </div>
        ))}
        <button type="button" className="text-sm font-medium" onClick={() => setContent({ lineItems: [...content.lineItems, { id: crypto.randomUUID(), item: '', description: '', amount: 0 }] })}>항목 추가</button>
        <p className="text-sm text-ink">Subtotal {formatKrw(price.subtotal)} · VAT {formatKrw(price.vat)} · Total {formatKrw(price.total)}</p>
      </EditorSection>

      <EditorSection title="9. Payment Schedule">
        {content.paymentSchedule.map((item) => (
          <div key={item.id} className="grid gap-2 border-t border-line pt-4">
            <Field label="Label" value={item.label} onChange={(label) => updatePay(content.paymentSchedule, item.id, { label }, (paymentSchedule) => setContent({ paymentSchedule }))} />
            <Field label="Percentage or Amount" value={item.portion} onChange={(portion) => updatePay(content.paymentSchedule, item.id, { portion }, (paymentSchedule) => setContent({ paymentSchedule }))} />
            <Field label="Due Condition" value={item.dueCondition} onChange={(dueCondition) => updatePay(content.paymentSchedule, item.id, { dueCondition }, (paymentSchedule) => setContent({ paymentSchedule }))} />
            <button type="button" className="text-left text-sm text-ink-soft" onClick={() => setContent({ paymentSchedule: content.paymentSchedule.filter((pay) => pay.id !== item.id) })}>삭제</button>
          </div>
        ))}
        <button type="button" className="text-sm font-medium" onClick={() => setContent({ paymentSchedule: [...content.paymentSchedule, { id: crypto.randomUUID(), label: '', portion: '', dueCondition: '' }] })}>일정 추가</button>
      </EditorSection>

      <EditorSection title="10. Revision Policy">
        <p className="text-sm leading-relaxed text-ink-soft">Bug는 합의한 기능이 정상 작동하지 않는 경우입니다. Change Request는 합의된 기능이 정상 작동하지만 동작이나 범위를 바꿔 달라는 요청입니다. 수정 1회는 피드백 개수가 아니라 한 번에 전달한 묶음입니다.</p>
        <Field label="Planning Revision" value={content.revision.planning} onChange={(planning) => setContent({ revision: { ...content.revision, planning } })} />
        <Field label="Design Revision" value={content.revision.design} onChange={(design) => setContent({ revision: { ...content.revision, design } })} />
        <Field label="Development QA/Bug" value={content.revision.development} onChange={(development) => setContent({ revision: { ...content.revision, development } })} />
        <Field label="Bundle note" value={content.revision.bundleNote} onChange={(bundleNote) => setContent({ revision: { ...content.revision, bundleNote } })} />
      </EditorSection>

      <EditorSection title="11. Support">
        <p className="text-xs text-ink-faint">보증 기간을 기본값으로 강제하지 않습니다. 관리자가 입력합니다.</p>
        <textarea className={`${inputClass} min-h-24`} value={content.support} onChange={(event) => setContent({ support: event.target.value })} />
      </EditorSection>

      <EditorSection title="12. Validity">
        <Field label="Proposal Valid Until" type="date" value={content.validUntil} onChange={(validUntil) => setContent({ validUntil })} />
      </EditorSection>

      <EditorSection title="13. Internal Notes">
        <p className="text-xs font-medium text-ink">Internal only. 고객 Proposal에는 보이지 않습니다.</p>
        <textarea className={`${inputClass} min-h-24`} value={content.internalNotes} onChange={(event) => setContent({ internalNotes: event.target.value })} />
      </EditorSection>
    </main>
  )
}

function EditorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 border-t border-line pt-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input className={inputClass} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function NamedList({ title, items, onChange, hint }: { title: string; items: ProposalSection[]; onChange: (items: ProposalSection[]) => void; hint?: string }) {
  return (
    <EditorSection title={title}>
      {hint ? <p className="text-xs text-ink-faint">{hint}</p> : null}
      {items.map((item) => (
        <div key={item.id} className="grid gap-2 border-t border-line pt-4">
          <Field label="Title" value={item.title} onChange={(value) => onChange(items.map((row) => (row.id === item.id ? { ...row, title: value } : row)))} />
          <Field label="Description" value={item.description} onChange={(description) => onChange(items.map((row) => (row.id === item.id ? { ...row, description } : row)))} />
          <button type="button" className="text-left text-sm text-ink-soft" onClick={() => onChange(items.filter((row) => row.id !== item.id))}>삭제</button>
        </div>
      ))}
      <button type="button" className="text-sm font-medium" onClick={() => onChange([...items, { id: crypto.randomUUID(), title: '', description: '' }])}>항목 추가</button>
    </EditorSection>
  )
}

function updatePhase(items: ProposalTimelinePhase[], id: string, patch: Partial<ProposalTimelinePhase>, apply: (items: ProposalTimelinePhase[]) => void) {
  apply(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
}

function updateLine(items: ProposalLineItem[], id: string, patch: Partial<ProposalLineItem>, apply: (items: ProposalLineItem[]) => void) {
  apply(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
}

function updatePay(items: PaymentScheduleItem[], id: string, patch: Partial<PaymentScheduleItem>, apply: (items: PaymentScheduleItem[]) => void) {
  apply(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
}
