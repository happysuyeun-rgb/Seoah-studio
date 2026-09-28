import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AdminNavList } from '../../features/admin-ops/components/AdminNavList'
import { useAuthStore } from '../../store/authStore'

export function AdminFrame() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const signOut = useAuthStore((state) => state.signOut)
  const [openPath, setOpenPath] = useState<string | null>(null)
  const open = openPath === pathname

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPath(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-canvas text-ink lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden border-r border-line bg-paper lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:px-4 lg:py-6">
        <Link to="/" className="px-2 text-sm text-ink-faint hover:text-ink">
          SEOAH.STUDIO
        </Link>
        <p className="mt-1 px-2 text-xs text-ink-faint">Admin</p>
        <nav className="mt-8 flex-1" aria-label="Admin">
          <AdminNavList pathname={pathname} />
        </nav>
        <button type="button" onClick={() => void logout()} className="mt-6 min-h-11 px-2 text-left text-sm text-ink-soft hover:text-ink">
          로그아웃
        </button>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line bg-paper px-4 py-3 lg:hidden">
          <div>
            <Link to="/" className="text-sm text-ink-faint">
              SEOAH.STUDIO
            </Link>
            <p className="text-xs text-ink-faint">Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="min-h-11 border border-line px-3 text-sm"
              aria-expanded={open}
              aria-controls="admin-drawer"
              onClick={() => setOpenPath(open ? null : pathname)}
            >
              메뉴
            </button>
            <button type="button" onClick={() => void logout()} className="min-h-11 text-sm text-ink-soft">
              로그아웃
            </button>
          </div>
        </header>
        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" className="absolute inset-0 bg-ink/40" aria-label="메뉴 닫기" onClick={() => setOpenPath(null)} />
            <nav id="admin-drawer" className="relative h-full w-72 overflow-y-auto bg-paper px-4 py-6" aria-label="Admin">
              <AdminNavList pathname={pathname} onNavigate={() => setOpenPath(null)} />
            </nav>
          </div>
        ) : null}
        <Outlet />
      </div>
    </div>
  )
}
