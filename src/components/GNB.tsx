import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { PRIMARY_NAV, REQUEST_PATH } from './marketing/nav'
import { PageContainer } from './ui/PageContainer'
import { Button, ButtonLink } from './ui/Button'

const navLinkClass =
  'inline-flex min-h-11 items-center px-3 text-sm font-medium tracking-tight text-ink-soft transition-colors hover:text-ink'

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function GNB() {
  const { user, signOut, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuState, setMenuState] = useState({ path: location.pathname, open: false })
  const menuOpen = menuState.open && menuState.path === location.pathname

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <PageContainer>
        <nav className="flex h-[4.5rem] items-center justify-between gap-6" aria-label="주요">
          <Link to="/" className="shrink-0 text-base font-semibold tracking-tight text-ink">
            SEOAH.STUDIO
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`${navLinkClass} ${isActive(location.pathname, item.to) ? 'text-ink' : ''}`}
                aria-current={isActive(location.pathname, item.to) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/contact"
              className={`${navLinkClass} ${isActive(location.pathname, '/contact') ? 'text-ink' : ''}`}
              aria-current={isActive(location.pathname, '/contact') ? 'page' : undefined}
            >
              Contact
            </Link>
            <AuthActions isLoading={isLoading} user={Boolean(user)} onSignOut={handleSignOut} />
            <ButtonLink to={REQUEST_PATH} size="sm">
              프로젝트 의뢰하기
            </ButtonLink>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center text-ink lg:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            onClick={() => setMenuState((state) => ({ path: location.pathname, open: !(state.open && state.path === location.pathname) }))}
          >
            <span aria-hidden className="flex w-4 flex-col gap-1.5">
              <span className="h-px w-full bg-ink" />
              <span className="h-px w-full bg-ink" />
            </span>
          </button>
        </nav>
      </PageContainer>

      {menuOpen ? (
        <div className="border-t border-line bg-paper lg:hidden">
          <PageContainer className="flex flex-col py-3">
            {PRIMARY_NAV.map((item) => (
              <Link key={item.to} to={item.to} className="px-1 py-3 text-sm font-medium text-ink">
                {item.label}
              </Link>
            ))}
            <Link to="/contact" className="px-1 py-3 text-sm font-medium text-ink">
              Contact
            </Link>
            <div className="mt-2 flex flex-col gap-2 border-t border-line py-3">
              <AuthActions isLoading={isLoading} user={Boolean(user)} onSignOut={handleSignOut} stacked />
              <ButtonLink to={REQUEST_PATH} className="w-full">
                프로젝트 의뢰하기
              </ButtonLink>
            </div>
          </PageContainer>
        </div>
      ) : null}
    </header>
  )
}

function AuthActions({
  isLoading,
  user,
  onSignOut,
  stacked = false,
}: {
  isLoading: boolean
  user: boolean
  onSignOut: () => void
  stacked?: boolean
}) {
  if (isLoading) {
    return <span className="px-3 text-sm text-ink-faint">...</span>
  }

  if (user) {
    return (
      <div className={stacked ? 'flex flex-col items-stretch gap-1' : 'flex items-center gap-1'}>
        <ButtonLink to="/my" variant="ghost" className={stacked ? 'w-full' : ''}>
          MY SEOA
        </ButtonLink>
        <Button variant="ghost" onClick={onSignOut} className={stacked ? 'w-full' : ''}>
          로그아웃
        </Button>
      </div>
    )
  }

  return (
    <ButtonLink to="/login" variant="ghost" className={stacked ? 'w-full' : ''}>
      로그인
    </ButtonLink>
  )
}
