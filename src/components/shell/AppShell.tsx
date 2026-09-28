import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { BackToTop } from '../BackToTop'
import { ChatbotWidget } from '../ChatbotWidget'
import { Footer } from '../Footer'
import { GNB } from '../GNB'

type AppShellProps = {
  children: ReactNode
}

function isPortalPath(pathname: string) {
  return pathname === '/my' || pathname.startsWith('/my/')
}

function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

export function AppShell({ children }: AppShellProps) {
  const { pathname, hash } = useLocation()
  const showPublicChrome = !isPortalPath(pathname) && !isAdminPath(pathname)

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
      {showPublicChrome ? <GNB /> : null}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {showPublicChrome ? <Footer /> : null}
      {showPublicChrome ? <ChatbotWidget /> : null}
      {showPublicChrome ? <BackToTop /> : null}
    </div>
  )
}
