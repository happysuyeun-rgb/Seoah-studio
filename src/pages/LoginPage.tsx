import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

const DEV_EMAIL = import.meta.env.VITE_DEV_EMAIL ?? 'test@seoah.studio'
const DEV_PASSWORD = import.meta.env.VITE_DEV_PASSWORD ?? ''

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const returnTo = searchParams.get('returnTo') ?? '/'
  const [devEmail, setDevEmail] = useState(DEV_EMAIL)
  const [devPassword, setDevPassword] = useState(DEV_PASSWORD)
  const [devError, setDevError] = useState<string | null>(null)
  const [devLoading, setDevLoading] = useState(false)

  useEffect(() => {
    document.title = '로그인 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])
  useEffect(() => {
    if (user) {
      navigate(returnTo, { replace: true })
    }
  }, [user, navigate, returnTo])

  const handleDevLogin = async () => {
    setDevError(null)
    setDevLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: devEmail, password: devPassword })
      if (error) throw error
      navigate(returnTo, { replace: true })
    } catch (e) {
      setDevError(e instanceof Error ? e.message : '로그인 실패')
      setDevLoading(false)
    }
  }

  const handleDevMockLogin = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dev-login', 'true')
      window.location.reload()
    }
  }

  const handleKakao = async () => {
    try {
      sessionStorage.setItem('seoah_returnTo', returnTo)
    } catch (_) {}
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleGoogle = async () => {
    try {
      sessionStorage.setItem('seoah_returnTo', returnTo)
    } catch (_) {}
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="block w-full min-h-[44px] text-center text-2xl font-bold text-gray-900 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          SEOAH.STUDIO
        </button>
        <p className="mt-2 text-center text-sm text-gray-600">
          로그인하면 AI 자동 커스텀을 시작할 수 있습니다.
        </p>
        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={handleKakao}
            className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#FEE500] py-3 font-medium text-gray-900 hover:bg-[#FEE500]/90"
          >
            카카오 로그인
          </button>
          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Google 로그인
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">로그인 시 이용약관에 동의합니다.</p>
        <p className="mt-4 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            회원가입
          </Link>
        </p>

        {import.meta.env.DEV && (
          <div className="mt-8 rounded-lg border-2 border-amber-400 bg-gray-100 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-800">
              <span aria-hidden>⚠</span> 개발 전용
            </p>
            <div className="space-y-2">
              <input
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                placeholder="이메일"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              {devError && <p className="text-xs text-red-600">{devError}</p>}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleDevLogin}
                  disabled={devLoading}
                  className="min-h-[40px] rounded bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  개발 로그인
                </button>
                <button
                  type="button"
                  onClick={handleDevMockLogin}
                  className="min-h-[40px] rounded border border-gray-400 bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  목업 로그인 (Supabase 없음)
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-4 text-center">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="min-h-[44px] text-sm text-primary hover:underline"
        >
          ← 홈으로
        </button>
        </p>
      </div>
    </main>
  )
}
