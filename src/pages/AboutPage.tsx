import { SectionHeading } from '../components/ui/SectionHeading'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { usePageTitle } from '../components/marketing/usePageTitle'

const flow = [
  { name: 'Planning', text: '만들어야 하는 것과 만들지 않을 것을 나눕니다.' },
  { name: 'UX/UI', text: '쓰는 사람이 다음 행동을 알 수 있게 구성합니다.' },
  { name: 'Development', text: '합의된 범위를 동작하는 제품으로 만듭니다.' },
  { name: 'AI Workflow', text: '반복되는 정리와 초안을 작업 흐름 안에 둡니다.' },
  { name: 'Launch', text: '배포하고, 필요한 운영은 Care로 이어집니다.' },
]

export function AboutPage() {
  usePageTitle('About — SEOAH.STUDIO')

  return (
    <main>
      <PageHero
        eyebrow="About"
        title={
          <>
            처음부터 출시까지,
            <br />
            하나의 흐름.
          </>
        }
        description="SEOAH.STUDIO는 기획, 인터페이스, 개발, 출시를 따로 끊지 않습니다. 사업에 필요한 디지털 제품이 한 줄로 이어지게 만듭니다."
      />

      <MarketingSection>
        <SectionHeading title="작업 방식" />
        <ol className="mt-12">
          {flow.map((item, index) => (
            <li key={item.name} className="grid gap-2 border-t border-line py-7 sm:grid-cols-[4rem_12rem_minmax(0,1fr)] sm:items-baseline">
              <span className="text-sm tabular-nums text-ink-faint">0{index + 1}</span>
              <h3 className="text-lg font-semibold tracking-tight text-ink">{item.name}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{item.text}</p>
            </li>
          ))}
        </ol>
      </MarketingSection>
    </main>
  )
}
