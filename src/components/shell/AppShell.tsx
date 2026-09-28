import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Footer } from '../Footer'
import { GNB } from '../GNB'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { pathname, hash } = useLocation()
  const hideFooter = pathname.startsWith('/admin') || pathname === '/my' || pathname.startsWith('/my/')

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
      <GNB />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {hideFooter ? null : <Footer />}
    </div>
  )
}
