/**
 * 개발 환경 전용 플로팅 버튼.
 * - DEV 로그인: 목업 유저로 로그인 (Supabase 없이 UI 확인)
 * - DEV 로그아웃: 목업 로그아웃
 * - DEV 관리자 ON/OFF: 목업 유저로 /admin 접근 시 is_admin 토글
 * 운영 빌드에는 포함되지 않음 (import.meta.env.DEV).
 */
export function DevFloatingButtons() {
  if (!import.meta.env.DEV) return null

  const isDevLogin = typeof localStorage !== 'undefined' && localStorage.getItem('dev-login') === 'true'
  const isDevAdmin = typeof localStorage !== 'undefined' && localStorage.getItem('dev-admin') === 'true'

  const handleDevLogin = () => {
    localStorage.setItem('dev-login', 'true')
    window.location.reload()
  }

  const handleDevLogout = () => {
    localStorage.removeItem('dev-login')
    localStorage.removeItem('dev-admin')
    window.location.reload()
  }

  const handleDevAdminToggle = () => {
    if (isDevAdmin) {
      localStorage.removeItem('dev-admin')
    } else {
      localStorage.setItem('dev-admin', 'true')
    }
    window.location.reload()
  }

  return (
    <div className="fixed right-3 top-16 z-40 flex flex-col gap-1 rounded-lg border border-gray-300 bg-gray-100 px-2 py-2 shadow-md">
      <span className="text-[10px] font-semibold text-amber-700">⚠ DEV</span>
      {isDevLogin ? (
        <>
          <button
            type="button"
            onClick={handleDevLogout}
            className="rounded bg-gray-500 px-2 py-1.5 text-xs font-medium text-white hover:bg-gray-600"
          >
            DEV 로그아웃
          </button>
          <button
            type="button"
            onClick={handleDevAdminToggle}
            className={`rounded px-2 py-1.5 text-xs font-medium ${isDevAdmin ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
          >
            {isDevAdmin ? 'DEV 관리자 ON' : 'DEV 관리자 OFF'}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={handleDevLogin}
          className="rounded bg-gray-500 px-2 py-1.5 text-xs font-medium text-white hover:bg-gray-600"
        >
          DEV 로그인
        </button>
      )}
    </div>
  )
}
