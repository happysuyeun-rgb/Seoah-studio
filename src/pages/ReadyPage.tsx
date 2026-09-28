import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { usePageTitle } from '../components/marketing/usePageTitle'

const categories = ['All', 'Startup', 'Solo Business', 'Small Business', 'Portfolio'] as const
type ReadyCategory = (typeof categories)[number]

const slots: { category: Exclude<ReadyCategory, 'All'>; index: string }[] = [
  { category: 'Startup', index: '01' },
  { category: 'Startup', index: '02' },
  { category: 'Solo Business', index: '01' },
  { category: 'Small Business', index: '01' },
  { category: 'Portfolio', index: '01' },
  { category: 'Portfolio', index: '02' },
]

const modes = [
  { name: 'SELF', text: '정해진 구조를 골라 바로 사용합니다.' },
  { name: 'SETUP', text: '사업 정보에 맞춰 기본 구성을 세팅합니다.' },
  { name: 'CUSTOM', text: '필요한 범위만 Studio에서 이어서 제작합니다.' },
]

const legacyGalleries = [
  { to: '/templates/portfolio', label: '포트폴리오' },
  { to: '/templates/homepage', label: '홈페이지' },
  { to: '/templates/app-mvp', label: '앱 MVP' },
]

export function ReadyPage() {
  usePageTitle('Ready — SEOAH.STUDIO')
  const [category, setCategory] = useState<ReadyCategory>('All')
  const visible = slots.filter((slot) => category === 'All' || slot.category === category)

  return (
    <main>
      <PageHero
        eyebrow="Ready / APX"
        title={
          <>
            바로 시작할 수 있는
            <br />
            웹사이트.
          </>
        }
        description="검증된 구조로 만든 웹사이트를 사업에 맞게 선택합니다. 새 상품 목록은 준비 중이고, 지금 공개된 템플릿은 기존 갤러리에서 볼 수 있습니다."
      />

      <MarketingSection>
        <SectionHeading title="Category" description="사업 유형으로 나눕니다. 지금 공개된 템플릿은 아래에서 이어서 볼 수 있습니다." />
        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3" role="tablist" aria-label="Ready 카테고리">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={category === item}
              onClick={() => setCategory(item)}
              className={`min-h-11 text-sm tracking-tight ${category === item ? 'text-ink' : 'text-ink-faint hover:text-ink'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((slot) => (
            <li key={`${slot.category}-${slot.index}`} className="bg-canvas px-5 py-10">
              <p className="text-xs tracking-[0.14em] text-ink-faint">{slot.category}</p>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-ink">{slot.index}</p>
              <p className="mt-3 text-sm text-ink-soft">준비 중</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <p className="text-sm text-ink-soft">현재 공개된 템플릿</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {legacyGalleries.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </MarketingSection>

      <MarketingSection id="how" className="scroll-mt-24">
        <SectionHeading title="구매 방식" description="제품을 어떻게 시작할지에 대한 구분입니다." />
        <ol className="mt-12 grid gap-10 lg:grid-cols-3">
          {modes.map((mode, index) => (
            <li key={mode.name} className="border-t border-ink pt-5">
              <p className="text-sm tabular-nums text-ink-faint">0{index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">{mode.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{mode.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <ButtonLink to="/faq" variant="secondary">
            FAQ 보기
          </ButtonLink>
        </div>
      </MarketingSection>
    </main>
  )
}
