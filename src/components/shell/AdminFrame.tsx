import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function AdminFrame() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const signOut = useAuthStore((state) => state.signOut)
  const leadsActive = pathname === '/admin/leads' || pathname.startsWith('/admin/leads/')
  const proposalsActive = pathname === '/admin/proposals' || pathname.startsWith('/admin/proposals/')
  const contractsActive = pathname === '/admin/contracts' || pathname.startsWith('/admin/contracts/')

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <nav className="flex flex-wrap items-center gap-4 text-sm" aria-label="Admin">
            <Link to="/" className="text-ink-faint hover:text-ink">
              SEOAH.STUDIO
            </Link>
            <Link to="/admin" aria-current={pathname === '/admin' ? 'page' : undefined} className={pathname === '/admin' ? 'font-medium text-ink' : 'text-ink-soft hover:text-ink'}>
              Admin
            </Link>
            <Link to="/admin/leads" aria-current={leadsActive ? 'page' : undefined} className={leadsActive ? 'font-medium text-ink' : 'text-ink-soft hover:text-ink'}>
              Leads
            </Link>
            <Link to="/admin/proposals" aria-current={proposalsActive ? 'page' : undefined} className={proposalsActive ? 'font-medium text-ink' : 'text-ink-soft hover:text-ink'}>
              Proposals
            </Link>
            <Link to="/admin/contracts" aria-current={contractsActive ? 'page' : undefined} className={contractsActive ? 'font-medium text-ink' : 'text-ink-soft hover:text-ink'}>
              Contracts
            </Link>
          </nav>
          <button type="button" onClick={() => void logout()} className="text-sm text-ink-soft hover:text-ink">
            로그아웃
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
