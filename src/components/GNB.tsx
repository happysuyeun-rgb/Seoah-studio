import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function GNB() {
  const { user, signOut, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-14 min-h-[44px] max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link to="/" className="flex min-h-[44px] items-center text-xl font-semibold text-gray-900">
          SEOAH.STUDIO
        </Link>
        <div className="flex min-h-[44px] items-center gap-2">
          <Link
            to="/support"
            className="hidden min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:inline-flex"
          >
            고객지원
          </Link>
          {isLoading ? (
            <span className="min-h-[44px] py-2 text-sm text-gray-400">...</span>
          ) : user ? (
            <>
              <Link
                to="/mypage"
                className="hidden min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:inline-flex"
              >
                마이페이지
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
