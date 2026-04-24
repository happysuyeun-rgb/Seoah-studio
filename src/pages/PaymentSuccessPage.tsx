import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { analytics } from '../lib/analytics'
import { toast } from '../store/toastStore'
import { getErrorMessage } from '../lib/errorCodes'
import JSZip from 'jszip'

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const projectId = searchParams.get('projectId')

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', projectId],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession()
      const userId = data?.session?.user?.id
      if (!userId || !projectId) return []
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .eq('status', 'paid')
      if (error) throw error
      return ordersData ?? []
    },
    enabled: !!projectId,
  })

  const hasOrder = Array.isArray(orders) && orders.length > 0
  const paymentTracked = useRef(false)
  useEffect(() => {
    document.title = '결제 완료 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])
  useEffect(() => {
    if (hasOrder) {
      try {
        sessionStorage.removeItem('lastProjectId')
        sessionStorage.removeItem('seoah_merchant_uid')
      } catch (_) {}
    }
  }, [hasOrder])
  useEffect(() => {
    if (paymentTracked.current || !hasOrder || !projectId || !orders?.[0]) return
    paymentTracked.current = true
    const o = orders[0] as { plan_type?: string; amount?: number }
    analytics.paymentCompleted(o?.plan_type ?? 'html', o?.amount ?? 0)
  }, [hasOrder, projectId, orders])

  const handleDownloadZip = async () => {
    if (!projectId) return
    try {
      const { data: proj } = await supabase.from('projects').select('output_html').eq('id', projectId).single()
      if (!proj?.output_html) {
        toast.error('다운로드할 내용이 없습니다. 마이페이지에서 재다운로드를 시도해 주세요.')
        return
      }
      const zip = new JSZip()
      zip.file('index.html', proj.output_html)
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'seoah-studio-website.zip'
      a.click()
      URL.revokeObjectURL(url)
      analytics.fileDownloaded('html')
      const orderId = orders?.[0]?.id
      if (orderId) {
        await supabase.from('downloads').insert({ order_id: orderId, file_type: 'html' })
      }
    } catch {
      toast.error(getErrorMessage('E-050', '파일 생성 중 오류가 발생했습니다. 마이페이지에서 다시 시도해 주세요.'))
    }
  }

  if (!projectId) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 text-center">
        <p className="text-gray-500">결제 정보가 없습니다.</p>
        <button type="button" onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">
          홈으로
        </button>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">확인 중...</p>
      </main>
    )
  }

  if (!hasOrder) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 text-center">
        <p className="text-gray-500">결제 내역을 찾을 수 없습니다. 결제 후 다시 시도해 주세요.</p>
        <button type="button" onClick={() => navigate('/mypage')} className="mt-4 min-h-[44px] text-primary hover:underline">
          마이페이지
        </button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12 text-center">
      <style>{`
        @keyframes checkFadeIn {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        .check-fade-in {
          animation: checkFadeIn 0.4s ease forwards;
        }
      `}</style>
      <div
        className="check-fade-in mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500"
        style={{ width: 56, height: 56 }}
        aria-hidden
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900">결제가 완료되었습니다!</h1>
      <p className="mt-2 text-sm text-gray-500">입력하신 이메일로 다운로드 링크가 발송되었습니다.</p>
      <p className="mt-1 text-gray-600">HTML 파일 다운로드해 사용하시면 됩니다.</p>
      <button
        type="button"
        onClick={handleDownloadZip}
        className="mt-6 min-h-[44px] rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90"
      >
        HTML 파일 다운로드
      </button>
      <p className="mt-4 text-sm text-gray-500">다운로드가 되지 않으면 마이페이지에서 &quot;다시 다운로드&quot;를 이용해 주세요.</p>
      <div className="mt-6 flex justify-center gap-4">
        <button type="button" onClick={() => navigate('/mypage')} className="min-h-[44px] text-gray-600 hover:underline">
          내 프로젝트 보기
        </button>
        <button type="button" onClick={() => navigate('/')} className="min-h-[44px] text-gray-600 hover:underline">
          새 프로젝트 시작
        </button>
      </div>
    </main>
  )
}
