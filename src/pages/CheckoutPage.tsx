import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getInvokeMessage } from '../lib/errorCodes'
import { useProjectStore, getStoredProjectId } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import { analytics } from '../lib/analytics'

const PLANS = [
  { id: 'html', label: 'HTML 다운로드', desc: '완성코드 zip 다운로드', price: 49000, available: true },
  { id: 'url', label: 'Vercel URL', desc: '배포된 랜딩 주소', price: 89000, available: false, badge: 'Phase 2 예정' },
  { id: 'pdf', label: 'PDF', desc: '인쇄용 PDF 파일', price: 29000, available: false, badge: 'Phase 2 예정' },
  { id: 'ppt', label: 'PPT 변환', desc: '발표용 슬라이드 변환', price: 39000, available: false, badge: 'Phase 3 예정' },
  { id: 'figma', label: 'Figma 변환', desc: '디자인 파일 변환', price: 69000, available: false, badge: 'Phase 3 예정' },
]

declare global {
  interface Window {
    IMP?: {
      init: (code: string) => void
      request_pay: (
        params: Record<string, unknown>,
        callback: (r: { success?: boolean; error_msg?: string; imp_uid?: string; merchant_uid?: string }) => void
      ) => void
    }
  }
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentProjectId, setCurrentProjectId } = useProjectStore()
  const [selected, setSelected] = useState(PLANS[0])
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeRefund, setAgreeRefund] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)

  const requiredAgreed = agreeTerms && agreePrivacy && agreeRefund

  const { data: project } = useQuery({
    queryKey: ['project-output', currentProjectId],
    queryFn: async () => {
      if (!currentProjectId) return null
      const { data, error } = await supabase
        .from('projects')
        .select('output_html')
        .eq('id', currentProjectId)
        .single()
      if (error || !data) return null
      return data as { output_html: string | null }
    },
    enabled: !!currentProjectId,
  })

  const outputHtml = project?.output_html ?? null

  useEffect(() => {
    document.title = '결제 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])
  useEffect(() => {
    if (!currentProjectId) {
      const saved = getStoredProjectId()
      if (saved) setCurrentProjectId(saved)
    }
    setHasCheckedStorage(true)
  }, [currentProjectId, setCurrentProjectId])

  if (hasCheckedStorage && !currentProjectId) {
    navigate('/project/preview', { replace: true })
    return null
  }
  if (!currentProjectId) return null

  const handlePayment = async () => {
    if (!requiredAgreed) return
    analytics.paymentStarted(selected.id, selected.price)

    // F-046: 정책 동의 저장 (결제 전)
    if (user?.id) {
      try {
        const version = '2026-03'
        const policies = [
          { policy_type: 'terms', is_required: true, agreed: agreeTerms, source: 'checkout' },
          { policy_type: 'privacy', is_required: true, agreed: agreePrivacy, source: 'checkout' },
          { policy_type: 'refund', is_required: true, agreed: agreeRefund, source: 'checkout' },
          { policy_type: 'marketing', is_required: false, agreed: agreeMarketing, source: 'checkout' },
        ]
        for (const p of policies) {
          const { error } = await supabase.from('policy_agreements').insert({
            user_id: user.id,
            policy_type: p.policy_type,
            version,
            is_required: p.is_required,
            agreed: p.agreed,
            source: p.source,
          })
          if (error) throw error
        }
      } catch (e) {
        console.error('policy_agreements insert', e)
        alert('정책 동의 기록에 실패했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }
    }
    const impCode = import.meta.env.VITE_PORTONE_IMP_CODE
    if (!impCode || !window.IMP) {
      alert('결제 모듈을 불러올 수 없습니다. VITE_PORTONE_IMP_CODE를 확인하세요.')
      return
    }
    window.IMP.init(impCode)
    const merchant_uid = `order_${Date.now()}`
    try {
      sessionStorage.setItem('lastProjectId', currentProjectId)
      sessionStorage.setItem('seoah_merchant_uid', merchant_uid)
    } catch (_) {}
    window.IMP.request_pay(
      {
        pg: 'html5_inicis',
        pay_method: 'card',
        merchant_uid,
        name: `SEOAH.STUDIO - ${selected.label}`,
        amount: selected.price,
        buyer_email: user?.email ?? '',
        buyer_name: user?.user_metadata?.name ?? '',
      },
      async (res) => {
        if (res.success && res.imp_uid) {
          try {
            const { data, error } = await supabase.functions.invoke('verify-payment', {
              body: {
                imp_uid: res.imp_uid,
                merchant_uid: res.merchant_uid,
                amount: selected.price,
                projectId: currentProjectId,
                planType: selected.id,
              },
            })
            if (error || (data && !data.success)) {
              const errCode =
                (data as { error?: string | { code?: string } } | null)?.error &&
                (typeof (data as { error?: unknown } | null)?.error === 'string'
                  ? ((data as { error?: string } | null)?.error ?? null)
                  : ((data as { error?: { code?: string } } | null)?.error?.code ?? null))
              if (errCode === 'UNAUTHORIZED' || errCode === 'FORBIDDEN') {
                navigate(`/login?returnTo=${encodeURIComponent('/project/checkout')}`)
                return
              }
              const msg = getInvokeMessage(data as { message?: string; error?: string } | null, error)
              navigate(`/payment/fail?message=${encodeURIComponent(msg)}`)
              return
            }
            navigate(`/payment/success?projectId=${currentProjectId}`)
          } catch (e) {
            const msg = (e as Error).message ?? '결제 검증 실패'
            navigate(`/payment/fail?message=${encodeURIComponent(msg)}`)
          }
        } else {
          navigate(`/payment/fail?message=${encodeURIComponent(res.error_msg ?? '결제 실패')}`)
        }
      }
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold text-gray-900">결제</h1>

      <div className="mt-6 flex gap-4">
        <div className="min-h-[160px] w-[55%] min-w-0 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {outputHtml ? (
            <iframe
              title="결과물 미리보기"
              srcDoc={outputHtml}
              sandbox="allow-scripts allow-same-origin"
              width="100%"
              height={160}
              className="block rounded-lg"
              style={{ borderRadius: 8, overflow: 'hidden', pointerEvents: 'none' }}
            />
          ) : (
            <div className="flex h-[160px] items-center justify-center rounded-lg bg-gray-200 text-sm text-gray-500">
              미리보기 없음
            </div>
          )}
        </div>
        <p className="flex flex-1 items-center text-sm text-gray-500">
          선택한 파일 형태로 결과물을 받으실 수 있습니다.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-1">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            disabled={!plan.available}
            onClick={() => plan.available && setSelected(plan)}
            className={`flex min-h-[44px] w-full items-center justify-between rounded-xl border p-4 text-left ${
              selected.id === plan.id ? 'border-primary bg-primary/5' : 'border-gray-200'
            } ${!plan.available ? 'opacity-60' : ''}`}
          >
            <div>
              <span className="font-medium text-gray-900">{plan.label}</span>
              <span className="ml-2 text-sm text-gray-500">{plan.desc}</span>
              {plan.badge && (
                <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs">{plan.badge}</span>
              )}
            </div>
            <span className="font-semibold text-gray-900">{plan.price.toLocaleString()}원</span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-700">결제 전 필수 동의</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">이용약관</a>에 동의합니다. (필수)
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">개인정보처리방침</a>에 동의합니다. (필수)
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeRefund}
            onChange={(e) => setAgreeRefund(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">
            <a href="/refund" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">환불정책</a>에 동의합니다. (필수)
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeMarketing}
            onChange={(e) => setAgreeMarketing(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-500">마케팅 이메일 수신에 동의합니다. (선택)</span>
        </label>
        {!requiredAgreed && (
          <p className="text-xs text-amber-600">필수 항목 3종에 모두 동의해 주세요.</p>
        )}
      </div>

      <button
        type="button"
        onClick={handlePayment}
        disabled={!requiredAgreed}
        className="mt-8 w-full min-h-[44px] rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        결제하기
      </button>
      <p className="mt-3 text-center text-[13px] text-gray-500">
        신용·체크카드 및 휴대폰 결제가 가능합니다.
      </p>
      <p className="mt-1 text-center text-xs text-gray-500">
        결제 완료 후 등록하신 이메일로 다운로드 링크가 발송됩니다.
      </p>
    </main>
  )
}
