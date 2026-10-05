import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/marketing/Fields'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { usePageTitle } from '../components/marketing/usePageTitle'
import { takeStoredReturnTo } from '../lib/postLogin'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { accountTypes, type AccountType } from '../lib/signupSchema'
import { DEV_MOCK_USER_ID_CONST, useAuthStore } from '../store/authStore'

const options: { id: AccountType; title: string; detail: string }[] = [
  { id: 'individual', title: 'Individual', detail: '개인 프로젝트와 사업을 위한 계정' },
  { id: 'business', title: 'Business', detail: '회사 또는 팀 프로젝트를 위한 계정' },
]

export function AccountTypePage() {
  usePageTitle('계정 유형 — SEOAH.STUDIO')
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [accountType, setAccountType] = useState<AccountType | ''>('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting || !user) return
    if (!accountTypes.includes(accountType as AccountType)) {
      setError('계정 유형을 선택해 주세요.')
      return
    }
    if (user.id === DEV_MOCK_USER_ID_CONST || !isSupabaseConfigured) {
      setError('이 로그인에서는 계정 유형을 저장할 수 없습니다.')
      return
    }
    setSubmitting(true)
    setError(null)
    const type = accountType as AccountType
    const company = type === 'business' ? companyName.trim() || null : null
    try {
      const { error: updateError } = await supabase.from('users').update({ account_type: type, company_name: company }).eq('id', user.id)
      if (updateError) {
        setError('계정 유형을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }
      await supabase.auth.updateUser({ data: { account_type: type, company_name: company } })
      navigate(takeStoredReturnTo(), { replace: true })
    } catch {
      setError('계정 유형을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isLoading && !user) {
    return (
      <main>
        <PageHero eyebrow="Account" title="계정 유형" description="로그인한 뒤 계정 유형을 선택합니다." />
        <MarketingSection>
          <Link to="/login?returnTo=/account-type" className="text-sm font-medium text-signal">
            로그인
          </Link>
        </MarketingSection>
      </main>
    )
  }

  return (
    <main>
      <PageHero eyebrow="Account" title="계정 유형" description="Google 또는 카카오로 시작한 계정의 유형을 선택합니다." />
      <MarketingSection>
        <form onSubmit={submit} className="grid max-w-xl gap-6">
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
          {accountType === 'business' ? (
            <TextField label="회사명" name="companyName" value={companyName} onChange={(event) => setCompanyName(event.target.value)} autoComplete="organization" />
          ) : null}
          {error ? <p className="text-sm text-ink">{error}</p> : null}
          <Button type="submit" disabled={submitting || isLoading || accountType === ''}>
            {submitting ? '저장 중' : '저장'}
          </Button>
        </form>
      </MarketingSection>
    </main>
  )
}
