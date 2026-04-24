import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'

type OrderRow = { id: string; amount: number; status: string; plan_type: string; created_at: string; projects?: { id: string } }
type RefundRequestRow = { status: string; created_at: string; reviewed_at: string | null }

export function RefundRequestPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [reason, setReason] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['refund-request', orderId, user?.id],
    queryFn: async () => {
      if (!orderId || !user?.id) return { order: null as OrderRow | null, existingRequest: null as RefundRequestRow | null }
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('id, amount, status, plan_type, created_at, projects(id)')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()
      if (orderErr || !orderData) {
        throw new Error('Order not found')
      }
      const order = orderData as unknown as OrderRow
      const { data: reqData } = await supabase
        .from('refund_requests')
        .select('status, created_at, reviewed_at')
        .eq('order_id', orderId)
        .single()
      const existingRequest = reqData ? (reqData as RefundRequestRow) : null
      return { order, existingRequest }
    },
    enabled: !!orderId && !!user?.id,
  })

  const order = data?.order ?? null
  const existingRequest = data?.existingRequest ?? null

  useEffect(() => {
    document.title = '환불 요청 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])

  useEffect(() => {
    if (isError) {
      toast.error('주문을 찾을 수 없습니다.')
      navigate('/mypage')
    }
  }, [isError, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId || !user?.id) return
    if (reason.trim().length < 10) {
      toast.error('사유를 10자 이상 입력해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      let attachmentPath: string | null = null
      if (file) {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${user.id}/${orderId}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('refund-attachments')
          .upload(path, file, { upsert: false })
        if (uploadErr) throw uploadErr
        attachmentPath = path
      }

      const { data, error } = await supabase.functions.invoke('submit-refund-request', {
        body: { orderId, reason: reason.trim(), attachmentPath },
      })
      if (error) throw error
      if (data && !(data as { success?: boolean }).success) {
        const msg = (data as { error?: string; message?: string }).error ?? (data as { message?: string }).message ?? '요청 제출에 실패했습니다.'
        throw new Error(msg)
      }
      toast.success('환불 요청이 접수되었습니다. 검토 후 안내드리겠습니다.')
      navigate('/mypage')
    } catch (e) {
      toast.error((e as Error).message ?? '환불 요청에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    )
  }

  if (isError) {
    return null
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
        <Link to="/mypage" className="mb-4 inline-block text-sm text-gray-500 hover:underline">
          ← 마이페이지로
        </Link>
        <p className="text-gray-600">환불 요청 정보를 찾을 수 없습니다.</p>
      </main>
    )
  }

  const planLabels: Record<string, string> = {
    html: 'HTML 다운로드',
    url: 'Vercel URL',
    pdf: 'PDF',
    ppt: 'PPT',
    figma: 'Figma',
  }
  const planLabel = planLabels[order.plan_type] ?? order.plan_type

  if (existingRequest) {
    const status = existingRequest.status
    const isReviewing = status === 'requested'
    const step1Done = true
    const step2Done = !isReviewing
    const step3Done = status === 'approved' || status === 'rejected'
    const step3Label =
      status === 'approved' ? '환불 완료' :
      status === 'rejected' ? '환불 거절' : '대기 중'
    const step3Color =
      status === 'approved' ? 'text-green-600' :
      status === 'rejected' ? 'text-red-600' : 'text-gray-500'

    const formatDate = (iso: string | null) =>
      iso ? new Date(iso).toLocaleString('ko-KR') : '—'

    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
        <Link to="/mypage" className="mb-4 inline-block text-sm text-gray-500 hover:underline">
          ← 마이페이지로
        </Link>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-800">이미 환불 요청이 접수되었습니다.</h2>
          <p className="mt-2 text-sm text-amber-700">상태: {status === 'requested' ? '검토 중' : status === 'approved' ? '환불 완료' : '환불 거절'}</p>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700">처리 히스토리</h3>
            <div className="relative mt-3 pl-5">
              <div className="absolute left-[5px] top-1.5 bottom-6 w-px bg-gray-300" />
              <div className="relative space-y-0">
                {/* 1. 환불 요청 접수 */}
                <div className="relative flex items-start gap-3 pb-5">
                  <div className={`absolute left-[-17px] top-0.5 h-3 w-3 shrink-0 rounded-full ${step1Done ? 'bg-gray-700' : 'border border-gray-300 bg-white'}`} />
                  <div>
                    <p className={`text-sm font-medium ${step1Done ? 'text-gray-900' : 'text-gray-500'}`}>환불 요청 접수</p>
                    <p className="text-xs text-gray-500">{formatDate(existingRequest.created_at)}</p>
                  </div>
                </div>
                {/* 2. 검토 중 */}
                <div className="relative flex items-start gap-3 pb-5">
                  <div
                    className={`absolute left-[-17px] top-0.5 h-3 w-3 shrink-0 rounded-full ${
                      step2Done ? 'bg-gray-700' :
                      isReviewing ? 'border-2 border-dashed border-amber-500 bg-amber-50' :
                      'border border-gray-300 bg-white'
                    }`}
                  />
                  <div>
                    <p className={`text-sm font-medium ${
                      step2Done ? 'text-gray-900' : isReviewing ? 'text-amber-800' : 'text-gray-500'
                    }`}>검토 중</p>
                    <p className="text-xs text-gray-500">{isReviewing ? '검토 중입니다.' : '—'}</p>
                  </div>
                </div>
                {/* 3. 처리 완료 */}
                <div className="relative flex items-start gap-3">
                  <div
                    className={`absolute left-[-17px] top-0.5 h-3 w-3 shrink-0 rounded-full ${
                      step3Done ? (status === 'approved' ? 'bg-green-600' : 'bg-red-600') :
                      'border border-gray-300 bg-white'
                    }`}
                  />
                  <div>
                    <p className={`text-sm font-medium ${step3Done ? step3Color : 'text-gray-500'}`}>{step3Label}</p>
                    <p className="text-xs text-gray-500">{formatDate(existingRequest.reviewed_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link to="/mypage" className="mt-6 inline-block text-primary hover:underline">
            마이페이지로 돌아가기
          </Link>
        </div>
      </main>
    )
  }

  if (order.status === 'refunded' || order.status === 'refund_rejected') {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
        <Link to="/mypage" className="mb-4 inline-block text-sm text-gray-500 hover:underline">
          ← 마이페이지로
        </Link>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="font-semibold text-gray-800">이 주문은 환불 처리가 완료되었습니다.</h2>
          <Link to="/mypage" className="mt-4 inline-block text-primary hover:underline">
            마이페이지로 돌아가기
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <Link to="/mypage" className="mb-4 inline-block text-sm text-gray-500 hover:underline">
        ← 마이페이지로
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">환불 요청</h1>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-medium text-gray-700">주문 정보</h2>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          <li>주문번호: {order.id.slice(0, 8)}...</li>
          <li>상품: {planLabel}</li>
          <li>결제금액: {order.amount.toLocaleString()}원</li>
          <li>결제일: {new Date(order.created_at).toLocaleDateString()}</li>
        </ul>
      </div>

      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-sm text-gray-700">
        <strong>환불 기준:</strong> 다운로드 전 전액 환불 가능. 다운로드 후 오류·미작동 시 7일 이내 검토.
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <label className="block text-sm font-medium text-gray-700">
          환불 사유 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="10자 이상 입력해 주세요."
          rows={4}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          required
        />
        <p className="mt-1 text-xs text-gray-500">{reason.length}자</p>

        <label className="mt-4 block text-sm font-medium text-gray-700">첨부파일 (선택)</label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm text-gray-600"
        />
        <p className="mt-1 text-xs text-gray-500">스크린샷 등 (jpg, png, webp, pdf, 최대 5MB)</p>

        <div className="mt-6 flex gap-2">
          <Link
            to="/mypage"
            className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={submitting || reason.trim().length < 10}
            className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? '제출 중...' : '환불 요청 제출'}
          </button>
        </div>
      </form>
    </main>
  )
}
