import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'

export function PaymentFailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setCurrentProjectId = useProjectStore((s) => s.setCurrentProjectId)
  const message = searchParams.get('message') ?? '결제에 실패했습니다.'

  useEffect(() => {
    document.title = '결제 실패 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])

  const handleRetry = () => {
    const lastId = sessionStorage.getItem('lastProjectId')
    if (lastId) {
      setCurrentProjectId(lastId)
      navigate('/project/checkout')
    } else {
      navigate('/')
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-red-600">결제 실패</h1>
      <p className="mt-4 text-gray-600">{decodeURIComponent(message)}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={handleRetry}
          className="min-h-[44px] rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90"
        >
          다시 시도하기
        </button>
        <a
          href="mailto:support@seoah.studio"
          className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          문의하기
        </a>
      </div>
    </main>
  )
}
