import type { ReactNode } from 'react'
import { PageContainer } from '../ui/PageContainer'

type PageHeroProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  actions?: ReactNode
  visual?: ReactNode
}

export function PageHero({ eyebrow, title, description, actions, visual }: PageHeroProps) {
  return (
    <section className="py-16 sm:py-24 lg:py-28">
      <PageContainer width={visual ? 'hero' : 'section'}>
        <div className={visual ? 'grid items-center gap-12 lg:grid-cols-2 lg:gap-10 xl:gap-14' : 'max-w-copy'}>
          <div>
            {eyebrow ? (
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-signal">{eyebrow}</p>
            ) : null}
            <h1 className={`text-display text-ink ${eyebrow ? 'mt-5' : ''}`}>{title}</h1>
            {description ? (
              <p className="mt-6 max-w-copy text-lead text-ink-soft">{description}</p>
            ) : null}
            {actions ? <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div> : null}
          </div>
          {visual ? <div className="min-w-0">{visual}</div> : null}
        </div>
      </PageContainer>
    </section>
  )
}
