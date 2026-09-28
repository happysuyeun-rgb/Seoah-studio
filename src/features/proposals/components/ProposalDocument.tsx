import { formatKrw, priceSummary } from '../money'
import { proposalStatusLabels, type Proposal } from '../types'

export function ProposalDocument({ proposal, showInternal = false }: { proposal: Proposal; showInternal?: boolean }) {
  const { content } = proposal
  const price = priceSummary(content.lineItems)

  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs text-ink-faint">Version {proposal.currentVersion}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{content.title || 'Proposal'}</h1>
      <p className="mt-3 text-sm text-ink-soft">
        {content.projectName || '—'} · {proposalStatusLabels[proposal.status]}
        {content.validUntil ? ` · Valid until ${content.validUntil}` : ''}
      </p>
      <dl className="mt-8 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
        <Meta label="Customer" value={content.customer || '—'} />
        <Meta label="Company" value={content.company || '—'} />
      </dl>

      <Section title="Project Summary" body={content.summary} />
      <Section title="Goal" body={content.goals.length ? content.goals.map((goal) => `· ${goal}`).join('\n') : ''} />
      <ItemSection title="Scope" items={content.scope} />
      <ItemSection title="Out of Scope" items={content.outOfScope} />
      <ItemSection title="Deliverables" items={content.deliverables} />

      <section className="border-t border-line py-8">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Timeline</h2>
        {content.timeline.length === 0 ? <p className="mt-4 text-sm text-ink-soft">—</p> : null}
        <ol className="mt-4">
          {content.timeline.map((phase) => (
            <li key={phase.id} className="border-t border-line py-4">
              <p className="text-sm font-medium text-ink">
                {phase.name || '—'}
                {phase.duration ? <span className="ml-2 font-normal text-ink-faint">{phase.duration}</span> : null}
              </p>
              {phase.description ? <p className="mt-2 text-sm leading-relaxed text-ink-soft">{phase.description}</p> : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line py-8">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Price</h2>
        <p className="mt-2 text-xs text-ink-faint">금액은 문서 표시입니다. 결제와 연결되지 않습니다.</p>
        <ul className="mt-4">
          {content.lineItems.map((item) => (
            <li key={item.id} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <p className="text-sm font-medium text-ink">{item.item || '—'}</p>
                {item.description ? <p className="mt-1 text-sm text-ink-soft">{item.description}</p> : null}
              </div>
              <p className="text-sm text-ink">{formatKrw(item.amount)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-2 grid gap-2 border-t border-line pt-4 text-sm">
          <Row label="Subtotal" value={formatKrw(price.subtotal)} />
          <Row label="VAT" value={formatKrw(price.vat)} />
          <Row label="Total" value={formatKrw(price.total)} strong />
        </dl>
      </section>

      <section className="border-t border-line py-8">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Payment Schedule</h2>
        {content.paymentSchedule.length === 0 ? <p className="mt-4 text-sm text-ink-soft">—</p> : null}
        <ul>
          {content.paymentSchedule.map((item) => (
            <li key={item.id} className="border-t border-line py-4 text-sm">
              <p className="font-medium text-ink">
                {item.label || '—'} · {item.portion || '—'}
              </p>
              <p className="mt-1 text-ink-soft">{item.dueCondition || '—'}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-8">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Revision Policy</h2>
        <dl className="mt-4 grid gap-4 text-sm">
          <Meta label="Bug" value="합의한 기능이 정상적으로 작동하지 않는 경우" />
          <Meta label="Change Request" value="합의된 기능은 정상 작동하지만 동작이나 범위를 바꿔 달라는 요청" />
          <Meta label="Planning Revision" value={content.revision.planning || '—'} />
          <Meta label="Design Revision" value={content.revision.design || '—'} />
          <Meta label="Development QA/Bug" value={content.revision.development || '—'} />
          <Meta label="수정 1회" value={content.revision.bundleNote || '피드백 항목 수가 아니라, 한 번에 전달한 피드백 묶음입니다.'} />
        </dl>
      </section>

      <Section title="Support" body={content.support} />
      <Section title="Validity" body={content.validUntil ? `Valid until ${content.validUntil}` : ''} />

      {showInternal ? (
        <section className="border-t border-line py-8">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Internal Notes</h2>
          <p className="mt-2 text-xs font-medium text-ink">Internal only. 고객 화면에는 보이지 않습니다.</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{content.internalNotes || '—'}</p>
        </section>
      ) : null}
    </article>
  )
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="border-t border-line py-8">
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{body.trim() || '—'}</p>
    </section>
  )
}

function ItemSection({ title, items }: { title: string; items: { id: string; title: string; description: string }[] }) {
  return (
    <section className="border-t border-line py-8">
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      {items.length === 0 ? <p className="mt-4 text-sm text-ink-soft">—</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.id} className="border-t border-line py-4">
            <p className="text-sm font-medium text-ink">{item.title || '—'}</p>
            {item.description ? <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.description}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{value}</dd>
    </div>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={strong ? 'font-medium text-ink' : 'text-ink-soft'}>{label}</dt>
      <dd className={strong ? 'font-semibold text-ink' : 'text-ink'}>{value}</dd>
    </div>
  )
}
