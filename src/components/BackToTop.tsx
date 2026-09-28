import { useEffect, useState } from 'react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      className="fixed bottom-24 right-6 z-40 flex h-11 w-11 items-center justify-center border border-line bg-paper text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      aria-label="맨 위로"
      onClick={() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
      }}
    >
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3.5 3.5 8M8 3.5 12.5 8M8 3.5V12.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  )
}
