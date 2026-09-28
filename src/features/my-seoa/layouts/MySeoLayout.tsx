import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'

const items = [
  { to: '/my', label: 'Dashboard', end: true },
  { to: '/my/purchases', label: 'Purchases', end: false },
  { to: '/my/projects', label: 'Projects', end: false },
  { to: '/my/proposals', label: 'Proposals', end: false },
  { to: '/my/billing', label: 'Billing', end: false },
  { to: '/my/support', label: 'Support', end: false },
  { to: '/my/notifications', label: 'Notifications', end: false },
  { to: '/my/account', label: 'Account', end: false },
] as const

function displayName(name: unknown, email: string | undefined) {
  if (typeof name === 'string' && name.trim()) return name.trim()
  if (email) return email.split('@')[0] ?? email
  return '회원'
}

function AccountBlock({ name, email, onLogout }: { name: string; email: string; onLogout: () => void }) {
  return (
    <div>
      <p className="truncate text-sm font-medium text-ink">{name}</p>
      <p className="truncate text-xs text-ink-faint">{email}</p>
      <button type="button" onClick={onLogout} className="mt-3 text-sm text-ink-soft hover:text-ink">
        로그아웃
      </button>
    </div>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="grid gap-1">
      {items.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block px-3 py-2 text-sm ${isActive ? 'bg-canvas font-medium text-ink' : 'text-ink-soft hover:text-ink'}`
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export function MySeoLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const [menuState, setMenuState] = useState({ path: location.pathname, open: false })
  const menuOpen = menuState.open && menuState.path === location.pathname
  const email = user?.email ?? ''
  const name = displayName(user?.user_metadata?.name, email || undefined)

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-paper lg:flex lg:flex-col">
        <div className="border-b border-line px-5 py-6">
          <Link to="/" className="text-xs tracking-tight text-ink-faint hover:text-ink">
            SEOAH.STUDIO
          </Link>
          <p className="mt-1 text-sm font-semibold tracking-tight text-ink">MY SEOA</p>
        </div>
        <nav className="flex-1 px-3 py-4" aria-label="MY SEOA">
          <NavList />
        </nav>
        <div className="border-t border-line px-5 py-4">
          <AccountBlock name={name} email={email} onLogout={() => void logout()} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-line bg-paper px-4 py-3 lg:hidden">
          <div>
            <Link to="/" className="text-xs text-ink-faint hover:text-ink">
              SEOAH.STUDIO
            </Link>
            <p className="text-sm font-semibold text-ink">MY SEOA</p>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center text-ink"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            onClick={() => setMenuState((state) => ({ path: location.pathname, open: !(state.open && state.path === location.pathname) }))}
          >
            <span aria-hidden className="flex w-4 flex-col gap-1.5">
              <span className="h-px w-full bg-ink" />
              <span className="h-px w-full bg-ink" />
            </span>
          </button>
        </header>
        {menuOpen ? (
          <div className="border-b border-line bg-paper px-3 py-3 lg:hidden">
            <NavList onNavigate={() => setMenuState({ path: location.pathname, open: false })} />
            <div className="mt-3 border-t border-line px-3 py-3">
              <AccountBlock name={name} email={email} onLogout={() => void logout()} />
            </div>
          </div>
        ) : null}
        <div className="px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
