import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/marketing/Fields'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { usePageTitle } from '../components/marketing/usePageTitle'
import { destinationAfterSignup } from '../lib/postLogin'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { signupSchema, type AccountType } from '../lib/signupSchema'

const options: { id: AccountType; title: string; detail: string }[] = [
  { id: 'individual', title: 'Individual', detail: '개인 프로젝트와 사업을 위한 계정' },
  { id: 'business', title: 'Business', detail: '회사 또는 팀 프로젝트를 위한 계정' },
]

export function SignupPage() {
  usePageTitle('회원가입 — SEOAH.STUDIO')
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState<AccountType | ''>('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setError(null)
    const parsed = signupSchema.safeParse({
      account_type: accountType,
      name,
      email,
      password,
      password_confirm: passwordConfirm,
      company_name: companyName,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? '입력 내용을 확인해 주세요.')
      return
    }
    if (!isSupabaseConfigured) {
      setError('회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      const { data, error: signError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: parsed.data.name,
            account_type: parsed.data.account_type,
            company_name: parsed.data.account_type === 'business' ? parsed.data.company_name || null : null,
          },
        },
      })
      if (signError) {
        const already = /already|registered|exists/i.test(signError.message)
        setError(already ? '이미 가입된 이메일입니다.' : '회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        setError('이미 가입된 이메일입니다.')
        return
      }
      const next = destinationAfterSignup(Boolean(data.session))
      if (next) {
        navigate(next, { replace: true })
        return
      }
      setNotice('확인 메일을 보냈습니다. 메일의 링크를 연 뒤 로그인해 주세요.')
    } catch {
      setError('회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <PageHero eyebrow="Account" title="회원가입" description="개인 또는 회사 계정으로 시작합니다." />
      <MarketingSection>
        {notice ? (
          <div className="max-w-xl">
            <p className="text-lead text-ink-soft">{notice}</p>
            <Link to="/login" className="mt-6 inline-flex text-sm font-medium text-signal">
              로그인
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="grid max-w-xl gap-6">
            <fieldset className="grid gap-3">
              <legend className="mb-2 text-sm font-medium text-ink">계정 유형</legend>
              {options.map((option) => {
                const selected = accountType === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setAccountType(option.id)}
                    className={`border px-4 py-3 text-left ${selected ? 'border-ink bg-paper' : 'border-line bg-canvas'}`}
                  >
                    <span className="block text-sm font-medium text-ink">{option.title}</span>
                    <span className="mt-1 block text-sm text-ink-soft">{option.detail}</span>
                  </button>
                )
              })}
            </fieldset>
            <TextField label="이름" name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
            <TextField label="이메일" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            <TextField label="비밀번호" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />
            <TextField
              label="비밀번호 확인"
              name="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              autoComplete="new-password"
              required
            />
            {accountType === 'business' ? (
              <TextField
                label="회사명"
                name="companyName"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                autoComplete="organization"
              />
            ) : null}
            {error ? <p className="text-sm text-ink">{error}</p> : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? '가입 중' : '가입하기'}
            </Button>
            <p className="text-sm text-ink-soft">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="font-medium text-signal">
                로그인
              </Link>
            </p>
          </form>
        )}
      </MarketingSection>
    </main>
  )
}
