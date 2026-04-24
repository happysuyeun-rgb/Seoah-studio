import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'

function formatJoinDateKorean(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `가입일  ${y}년 ${m}월 ${day}일`
}

export function MyPageSettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, signOut } = useAuthStore()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawConfirm, setWithdrawConfirm] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [marketingSaving, setMarketingSaving] = useState(false)

  const { data: userCreatedAt } = useQuery({
    queryKey: ['user-settings-created-at', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data, error } = await supabase.from('users').select('created_at').eq('id', user.id).maybeSingle()
      if (error) throw error
      return (data as { created_at?: string } | null)?.created_at ?? null
    },
    enabled: !!user?.id,
  })

  const joinDateLabel = formatJoinDateKorean(userCreatedAt ?? user?.created_at)

  const { data: marketingAgreed, isLoading: marketingLoading } = useQuery({
    queryKey: ['marketing-consent', user?.id],
    queryFn: async () => {
      if (!user?.id) return false
      const { data, error } = await supabase
        .from('policy_agreements')
        .select('agreed')
        .eq('user_id', user.id)
        .eq('policy_type', 'marketing')
        .order('agreed_at', { ascending: false })
        .limit(1)
      if (error) throw error
      const row = data?.[0] as { agreed?: boolean } | undefined
      return row?.agreed === true
    },
    enabled: !!user?.id,
  })

  const marketingOn = marketingAgreed ?? false

  const handleMarketingToggle = async () => {
    if (!user?.id || marketingLoading || marketingSaving) return
    const next = !marketingOn
    setMarketingSaving(true)
    try {
      const { error } = await supabase.from('policy_agreements').insert({
        user_id: user.id,
        policy_type: 'marketing',
        version: '2026-03',
        is_required: false,
        agreed: next,
        source: 'settings',
      })
      if (error) throw error
      await queryClient.invalidateQueries({ queryKey: ['marketing-consent', user.id] })
      toast.success('설정이 저장되었습니다.')
    } catch (e) {
      toast.error((e as Error).message ?? '설정 저장에 실패했습니다.')
    } finally {
      setMarketingSaving(false)
    }
  }

  useEffect(() => {
    document.title = '계정 설정 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])

  const handleWithdraw = async () => {
    if (withdrawConfirm !== '탈퇴합니다') {
      toast.error('"탈퇴합니다"를 정확히 입력해 주세요.')
      return
    }
    setWithdrawing(true)
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { userId: user?.id },
      })
      if (error) throw error
      if (data && !(data as { success?: boolean }).success) {
        const msg = (data as { error?: string; message?: string }).error ?? (data as { message?: string }).message ?? '탈퇴 처리에 실패했습니다.'
        throw new Error(msg)
      }
      await signOut()
      toast.success('회원탈퇴가 완료되었습니다.')
      navigate('/')
    } catch (e) {
      const msg = (e as Error).message ?? '탈퇴 처리에 실패했습니다. 고객센터에 문의해 주세요.'
      toast.error(msg)
    } finally {
      setWithdrawing(false)
      setShowWithdrawModal(false)
      setWithdrawConfirm('')
    }
  }

  const displayName = (user?.user_metadata?.name as string) || user?.email || '사용자'
  const initial = displayName.trim().charAt(0).toUpperCase() || '?'

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <Link to="/mypage" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700 hover:underline">
        ← 마이페이지로
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">계정 설정</h1>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-medium text-gray-700">계정 정보</h2>
        <div className="mt-4 flex items-center gap-4">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url as string}
              alt=""
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-xl font-semibold text-primary">
              {initial}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{displayName}</p>
            <p className="text-sm text-gray-500">{user?.email ?? ''}</p>
            <p className="mt-1 text-xs text-gray-400">
              연동: {(user?.app_metadata?.provider as string) ?? 'unknown'}
            </p>
            {joinDateLabel ? (
              <p className="mt-1 text-xs text-gray-500">{joinDateLabel}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-gray-700">마케팅 이메일 수신</span>
          <button
            type="button"
            role="switch"
            aria-checked={marketingOn}
            aria-label={marketingOn ? '마케팅 이메일 수신 끄기' : '마케팅 이메일 수신 켜기'}
            disabled={marketingLoading || marketingSaving || !user?.id}
            onClick={handleMarketingToggle}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
              marketingOn ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                marketingOn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">이벤트·혜택 등 마케팅 메일 수신 여부입니다.</p>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-medium text-gray-700">정책</h2>
        <ul className="mt-4 space-y-2">
          <li>
            <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              이용약관
            </Link>
          </li>
          <li>
            <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              개인정보처리방침
            </Link>
          </li>
          <li>
            <Link to="/refund" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              환불정책
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <button
          type="button"
          onClick={() => setShowWithdrawModal(true)}
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          회원탈퇴
        </button>
      </section>

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">회원탈퇴</h3>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-gray-700">
              <p className="font-medium text-amber-800">⚠️ 탈퇴 시 복구할 수 없습니다.</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>프로젝트·문의 데이터는 즉시 비식별화됩니다.</li>
                <li>결제·다운로드 이력은 법정 보관 기준(5년)으로 보존됩니다.</li>
              </ul>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              탈퇴를 진행하려면 아래에 <strong>&quot;탈퇴합니다&quot;</strong>를 입력하세요.
            </p>
            <input
              type="text"
              value={withdrawConfirm}
              onChange={(e) => setWithdrawConfirm(e.target.value)}
              placeholder="탈퇴합니다"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
            />
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowWithdrawModal(false)
                  setWithdrawConfirm('')
                }}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawing || withdrawConfirm !== '탈퇴합니다'}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {withdrawing ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
