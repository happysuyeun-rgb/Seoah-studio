import { PathList } from '../components/marketing/PathList'
import { PageHero } from '../components/marketing/PageHero'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { usePageTitle } from '../components/marketing/usePageTitle'

const lines = [
  { label: 'Ready', text: '바로 쓰는 웹사이트와 디지털 제품.', to: '/ready' },
  { label: 'Studio', text: '사업에 맞게 만드는 맞춤 제품.', to: '/studio' },
  { label: 'Care', text: '납품 이후의 선택형 운영.', to: '/care' },
  { label: 'SaaS', text: '팀이 쓸 도구. 지금은 개발 중.', to: '/saas' },
]

export function BrandPage() {
  usePageTitle('Brand — SEOAH.STUDIO')

  return (
    <main>
      <PageHero
        eyebrow="Brand"
        title="SEOAH.STUDIO"
        description="스타트업, 1인 기업, 소상공인을 위한 디지털 프로덕트 스튜디오. 제작 대행이 아니라, 사업에 필요한 제품을 고르거나 만들거나 운영하는 곳입니다."
      />
      <MarketingSection>
        <PathList items={lines} />
      </MarketingSection>
    </main>
  )
}
