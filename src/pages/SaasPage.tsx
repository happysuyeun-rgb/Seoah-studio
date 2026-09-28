import { ButtonLink } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { usePageTitle } from '../components/marketing/usePageTitle'

const products = [
  { name: 'Plan OS', text: '계획과 실행을 한 작업면에 두는 도구.' },
  { name: 'Approval OS', text: '승인 요청과 결정을 남기는 도구.' },
  { name: 'Voting', text: '팀의 선택을 모으는 도구.' },
]

export function SaasPage() {
  usePageTitle('SaaS — SEOAH.STUDIO')

  return (
    <main>
      <PageHero
        eyebrow="SaaS"
        title={
          <>
            팀이 쓰는 도구는
            <br />
            준비 중입니다.
          </>
        }
        description="아래 제품은 판매 중이 아닙니다. 개발 중이며, 관심이 있으면 얼리 액세스만 남겨 주세요."
      />

      <MarketingSection>
        <SectionHeading title="In development" />
        <ul className="mt-12 border-t border-line">
          {products.map((product) => (
            <li key={product.name} className="grid gap-2 border-b border-line py-8 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-baseline">
              <h3 className="text-lg font-semibold tracking-tight text-ink">{product.name}</h3>
              <p className="text-sm text-ink-soft">{product.text}</p>
              <p className="text-xs font-medium tracking-[0.14em] text-signal">IN DEVELOPMENT</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink to="/contact?topic=saas">Early Access 문의</ButtonLink>
        </div>
      </MarketingSection>
    </main>
  )
}
