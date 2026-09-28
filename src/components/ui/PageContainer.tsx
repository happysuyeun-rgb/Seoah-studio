import type { ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
  className?: string
  width?: 'section' | 'hero'
}

const widthClass = {
  section: 'max-w-[1280px]',
  hero: 'max-w-[1360px]',
}

export function PageContainer({ children, className = '', width = 'section' }: PageContainerProps) {
  return (
    <div className={`mx-auto w-full px-6 sm:px-8 lg:px-10 ${widthClass[width]} ${className}`}>
      {children}
    </div>
  )
}
