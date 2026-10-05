import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageContainer } from '../components/ui/PageContainer'
import { postLoginPath } from '../lib/postLogin'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

const DEV_EMAIL = import.meta.env.VITE_DEV_EMAIL ?? 'test@seoah.studio'
const DEV_PASSWORD = import.meta.env.VITE_DEV_PASSWORD ?? ''

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const returnTo = postLoginPath(searchParams.get('returnTo'))
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
    <main>
      <PageContainer className="py-16 sm:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:gap-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-faint">SEOAH.STUDIO</p>
            <h1 className="mt-4 text-title text-ink">구매와 프로젝트를 이어서 관리합니다.</h1>
            <p className="mt-5 max-w-copy text-lead text-ink-soft">로그인하면 MY SEOA에서 진행 상황, 제안, 결제를 확인합니다.</p>
          </div>
          <div className="border-t-2 border-ink pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleKakao}
                className="flex min-h-11 w-full items-center justify-center bg-[#FEE500] px-4 text-sm font-medium text-ink hover:opacity-90"
              >
                카카오 로그인
              </button>
              <button
                type="button"
                onClick={handleGoogle}
                className="flex min-h-11 w-full items-center justify-center border border-line bg-paper px-4 text-sm font-medium text-ink hover:bg-canvas"
              >
                Google 로그인
              </button>
            </div>
            <p className="mt-6 text-xs text-ink-faint">로그인 시 이용약관에 동의합니다.</p>
            <p className="mt-4 text-sm text-ink-soft">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                회원가입
              </Link>
            </p>
            <button type="button" onClick={() => navigate('/')} className="mt-6 inline-flex min-h-11 items-center text-sm text-ink-soft hover:text-ink">
              홈으로
            </button>

            {import.meta.env.DEV && (
              <div className="mt-8 border border-line bg-canvas p-4">
                <p className="mb-2 text-sm font-semibold text-ink">개발 전용</p>
                <div className="space-y-2">
                  <input
                    type="email"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    placeholder="이메일"
                    className="min-h-11 w-full border border-line bg-paper px-3 text-sm"
                  />
                  <input
                    type="password"
                    value={devPassword}
                    onChange={(e) => setDevPassword(e.target.value)}
                    placeholder="비밀번호"
                    className="min-h-11 w-full border border-line bg-paper px-3 text-sm"
                  />
                  {devError && <p className="text-xs text-ink">{devError}</p>}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleDevLogin}
                      disabled={devLoading}
                      className="min-h-11 bg-ink px-3 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
                    >
                      개발 로그인
                    </button>
                    <button
                      type="button"
                      onClick={handleDevMockLogin}
                      className="min-h-11 border border-line bg-paper px-3 text-sm font-medium text-ink hover:bg-canvas"
                    >
                      목업 로그인 (Supabase 없음)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </main>
  )
}
