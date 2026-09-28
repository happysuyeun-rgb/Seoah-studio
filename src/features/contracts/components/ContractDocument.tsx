import { formatKrw } from '../../proposals/money'
import type { Contract } from '../types'

export function ContractDocument({ contract }: { contract: Contract }) {
  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-xs text-ink-faint">Version {contract.version}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{contract.projectName || 'Contract'}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {contract.customer} · {contract.company}. 아래 문장은 법률 문구로 확정된 내용이 아닙니다.
      </p>
      <ol className="mt-10">
        {contract.sections.map((section, index) => (
          <li key={section.id} className="border-t border-line py-6">
            <h2 className="text-base font-semibold tracking-tight text-ink">
              {String(index + 1).padStart(2, '0')} {section.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{section.body}</p>
          </li>
        ))}
      </ol>
      <section className="border-t border-line py-8">
        <h2 className="text-base font-semibold text-ink">Rights and source</h2>
        <p className="mt-2 text-xs text-ink-faint">운영 기준을 이해하기 위한 구분입니다. 법률 최종 문구가 아닙니다.</p>
        <dl className="mt-4 grid gap-4 text-sm leading-relaxed">
          <Item label="Customer Assets" value="고객이 제공한 브랜드, 콘텐츠, 데이터." />
          <Item label="Client-specific Deliverables" value="계약 범위에서 만든 고객별 최종 결과." />
          <Item label="Studio Assets" value="공통 컴포넌트, 내부 framework, template, reusable module, know-how." />
          <Item label="Managed Delivery" value="기본은 Studio private repo와 배포 URL입니다. 소스 코드는 포함하지 않습니다." />
          <Item label="Full Source" value="선택 사항입니다. 추가 계약과 추가 비용이 필요하며, 공통 내부 library는 제외하거나 별도 license가 필요합니다." />
          <Item label="Exclusivity" value="고객별 최종 조립 형태를 그대로 재판매하지 않습니다. 공통 기술 구성은 재사용할 수 있습니다." />
        </dl>
      </section>
      <section className="border-t border-line py-8">
        <h2 className="text-base font-semibold text-ink">Deposit</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Deposit Amount" value={formatKrw(contract.deposit.amount)} />
          <Item label="Due Date" value={contract.deposit.dueDate || '—'} />
          <Item label="Payment Method" value={contract.deposit.method || '—'} />
          <Item label="Payment Status" value={contract.deposit.status || '—'} />
        </dl>
      </section>
    </article>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  )
}
