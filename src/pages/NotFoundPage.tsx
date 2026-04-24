import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = '페이지를 찾을 수 없음 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-6xl font-bold text-gray-300 sm:text-8xl">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-900 sm:text-2xl">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-sm text-gray-500">요청하신 주소의 페이지가 없거나 이동되었을 수 있습니다.</p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-8 min-h-[44px] rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90"
      >
        홈으로 이동
      </button>
    </main>
  )
}
