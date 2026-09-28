import { ButtonLink } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { usePageTitle } from '../components/marketing/usePageTitle'

const plans = [
  { name: 'Website Care Mini', price: '월 9.9만원', text: '작은 수정과 기본 상태 점검.' },
  { name: 'Website Care', price: '월 19.9만원', text: '수정, 기본 점검, 운영 지원.' },
  { name: 'Product Care', price: '월 49만원부터', text: '제품 운영. 범위는 별도 협의.' },
]

const outside = ['신규 페이지', '신규 기능', '대규모 구조 변경', '외부 유료 서비스 비용']

export function CarePage() {
  usePageTitle('Care — SEOAH.STUDIO')

  return (
    <main>
      <PageHero
        eyebrow="Care"
        title={
          <>
            출시 이후의
            <br />
            운영.
          </>
        }
        description="Care는 강제 구독이 아닙니다. 납품 이후 수정과 운영이 필요할 때 고르는 선택형 상품입니다."
      />

      <MarketingSection>
        <SectionHeading title="운영 상품" />
        <ul className="mt-12 border-t border-line">
          {plans.map((plan) => (
            <li key={plan.name} className="grid gap-2 border-b border-line py-8 sm:grid-cols-[16rem_minmax(0,1fr)_auto] sm:items-baseline">
              <h3 className="text-lg font-semibold tracking-tight text-ink">{plan.name}</h3>
              <p className="text-sm text-ink-soft">{plan.text}</p>
              <p className="text-sm font-medium text-ink">{plan.price}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-faint">Product Care는 49만원부터이며, 지원 범위는 협의합니다.</p>
      </MarketingSection>

      <MarketingSection>
        <SectionHeading title="기본 범위에 포함되지 않습니다." description="아래 항목은 Care 기본 상품으로 처리하지 않습니다." />
        <ul className="mt-10 border-t border-line">
          {outside.map((item) => (
            <li key={item} className="border-b border-line py-5 text-lg tracking-tight text-ink">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink to="/contact?topic=care" variant="secondary">
            Care 문의
          </ButtonLink>
        </div>
      </MarketingSection>
    </main>
  )
}
