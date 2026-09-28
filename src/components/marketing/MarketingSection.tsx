import type { ReactNode } from 'react'
import { PageContainer } from '../ui/PageContainer'

type MarketingSectionProps = {
  children: ReactNode
  id?: string
  className?: string
  surface?: 'canvas' | 'paper'
}

export function MarketingSection({ children, id, className = '', surface = 'canvas' }: MarketingSectionProps) {
  const surfaceClass = surface === 'paper' ? 'bg-paper' : ''
  return (
    <section id={id} className={`border-t border-line py-24 sm:py-32 lg:py-36 ${surfaceClass} ${className}`}>
      <PageContainer>{children}</PageContainer>
    </section>
  )
}
