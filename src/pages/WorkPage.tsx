import { useState } from 'react'
import { SectionHeading } from '../components/ui/SectionHeading'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { usePageTitle } from '../components/marketing/usePageTitle'

const categories = ['All', 'Website', 'Product', 'Brand'] as const

export function WorkPage() {
  usePageTitle('Work — SEOAH.STUDIO')
  const [category, setCategory] = useState<(typeof categories)[number]>('All')

  return (
    <main>
      <PageHero
        eyebrow="Work"
        title="Selected work"
        description="공개할 수 있는 사례가 정리되기 전에는 프로젝트를 채우지 않습니다."
      />

      <MarketingSection>
        <SectionHeading title="Case studies" />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3" role="tablist" aria-label="Work 분류">
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
        <div className="mt-8 border-t border-line py-16">
          <p className="text-sm tracking-[0.14em] text-ink-faint">{category}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">Preparing case studies</p>
        </div>
      </MarketingSection>
    </main>
  )
}
