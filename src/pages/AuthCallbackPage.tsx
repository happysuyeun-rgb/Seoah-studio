import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const returnToFromQuery = searchParams.get('returnTo')

  useEffect(() => {
    const run = async () => {
      const { data: { session }, error: err } = await supabase.auth.getSession()
      if (err) {
        setError(err.message)
        return
      }
      if (session) {
        let target = returnToFromQuery ?? null
        if (!target) {
          try {
            target = sessionStorage.getItem('seoah_returnTo')
            if (target) sessionStorage.removeItem('seoah_returnTo')
          } catch (_) {}
        }
        navigate(target ?? '/', { replace: true })
      } else {
        setError('로그인에 실패했습니다.')
      }
    }
    run()
  }, [navigate, returnToFromQuery])

  if (error) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="rounded-lg bg-primary px-4 py-2 text-white"
        >
          로그인으로
        </button>
      </main>
    )
  }

  return (
    <main className="flex min-h-[50vh] items-center justify-center">
      <p className="text-gray-500">로그인 처리 중...</p>
    </main>
  )
}
