import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'

type FaqRow = { id: string; category: string; question: string; answer: string; sort_order: number }
type InquiryRow = {
  id: string
  subject: string
  body: string
  type: string | null
  is_private: boolean
  status: string
  admin_reply: string | null
  replied_at: string | null
  created_at: string
}

const INQUIRY_TYPES = [
  { value: '서비스 문의', label: '서비스 문의' },
  { value: '결제 / 환불', label: '결제·환불' },
  { value: '파일 / 다운로드', label: '파일·다운로드' },
  { value: 'AI 커스텀 오류', label: 'AI 커스텀 오류' },
  { value: '기타', label: '기타' },
] as const

const CATEGORY_LABELS: Record<string, string> = {
  서비스: '서비스',
  결제: '결제',
  파일: '파일',
}
const STATUS_LABELS: Record<string, string> = {
  pending: '접수',
  replied: '답변완료',
}

export function SupportPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'faq' | 'inquiry'>('faq')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [formSubject, setFormSubject] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formType, setFormType] = useState('서비스 문의')
  const [formPrivate, setFormPrivate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false)
  const inquiryListRef = useRef<HTMLDivElement>(null)

  const { data: faqs = [] } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('id, category, question, answer, sort_order')
        .eq('is_active', true)
        .order('sort_order')
        .order('created_at')
      if (error) throw error
      return (data ?? []) as FaqRow[]
    },
  })

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('inquiries')
        .select('id, subject, body, type, is_private, status, admin_reply, replied_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as InquiryRow[]
    },
    enabled: !!user?.id,
  })

  const filtered = useMemo(() => {
    let list = faqs
    if (category) list = list.filter((f) => f.category === category)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
    }
    return list
  }, [faqs, category, search])

  const categories = useMemo(() => Array.from(new Set(faqs.map((f) => f.category))).sort(), [faqs])
  const detailInquiry = useMemo(() => inquiries.find((i) => i.id === detailId), [inquiries, detailId])

  useEffect(() => {
    document.title = '고객지원 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])

  const submitInquiry = async () => {
    if (!user?.id || !formSubject.trim() || !formBody.trim()) {
      toast.error('제목과 내용을 입력하세요.')
      return
    }
    const subject = formSubject.trim()
    const body = formBody.trim()
    setSubmitting(true)
    try {
      const { data: row, error } = await supabase
        .from('inquiries')
        .insert({
          user_id: user.id,
          subject,
          body,
          type: formType,
          is_private: formPrivate,
          status: 'pending',
        })
        .select('id')
        .single()
      if (error) throw error
      queryClient.invalidateQueries({ queryKey: ['inquiries', user.id] })
      setFormSubject('')
      setFormBody('')
      setFormType('서비스 문의')
      setFormPrivate(false)
      toast.success('문의가 접수되었습니다.')
      setDetailId(row?.id ?? null)
      setShowSubmitSuccess(true)
      setTimeout(() => inquiryListRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'inquiry_alert',
          inquiryId: row?.id,
        },
      })
      if (emailError) {
        console.warn('관리자 알림 이메일 발송 실패:', emailError.message)
        // 이메일 실패해도 문의 접수는 정상 완료로 처리
      }
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">무엇을 도와드릴까요?</h1>
        <p className="mt-2 text-gray-600">FAQ에서 빠르게 답변을 찾거나, 1:1 문의를 남겨주세요.</p>
      </div>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('faq')}
          className={`min-h-[44px] border-b-2 px-4 py-2 text-sm font-medium ${tab === 'faq' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          FAQ
        </button>
        <button
          type="button"
          onClick={() => setTab('inquiry')}
          className={`min-h-[44px] border-b-2 px-4 py-2 text-sm font-medium ${tab === 'inquiry' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          1:1 문의
        </button>
      </div>

      {tab === 'faq' && (
        <div className="mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <label htmlFor="faq-search" className="sr-only">FAQ 검색</label>
            <input
              id="faq-search"
              type="search"
              placeholder="FAQ 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-[44px] flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm"
            />
            <label htmlFor="faq-category" className="sr-only">FAQ 카테고리</label>
            <select
              id="faq-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-h-[44px] rounded-lg border border-gray-300 px-4 py-2 text-sm"
            >
              <option value="">전체 카테고리</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c] ?? c}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6 space-y-2">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>
            ) : (
              filtered.map((faq) => (
                <div key={faq.id} className="rounded-lg border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    <span className="pr-2">[{faq.category}] {faq.question}</span>
                    <span className="shrink-0 text-gray-400">{openId === faq.id ? '▲' : '▼'}</span>
                  </button>
                  {openId === faq.id && (
                    <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'inquiry' && (
        <div className="mt-6 space-y-6">
          {!user ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
              <p className="text-sm text-amber-800">1:1 문의는 로그인 후 이용할 수 있습니다.</p>
              <div className="mt-4">
                <Link
                  to="/login?returnTo=%2Fsupport"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#FEE500] px-6 py-3 text-sm font-medium text-gray-900 hover:bg-[#FEE500]/90"
                >
                  카카오 로그인
                </Link>
              </div>
            </div>
          ) : (
            <>
              {showSubmitSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-green-900">제출 완료</p>
                    <p className="text-sm text-green-700">목록에서 확인하세요.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSubmitSuccess(false)}
                    className="shrink-0 min-h-[44px] rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    확인
                  </button>
                </div>
              )}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="font-medium text-gray-900">새 문의</h3>
                <label htmlFor="support-inquiry-type" className="mt-2 block text-xs font-medium text-gray-500">문의 유형</label>
                <select
                  id="support-inquiry-type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  {INQUIRY_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <label htmlFor="support-inquiry-subject" className="mt-2 block text-xs font-medium text-gray-500">제목</label>
                <input
                  id="support-inquiry-subject"
                  type="text"
                  placeholder="제목"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <label htmlFor="support-inquiry-body" className="mt-2 block text-xs font-medium text-gray-500">내용</label>
                <textarea
                  id="support-inquiry-body"
                  placeholder="내용"
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <label className="mt-2 flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={formPrivate}
                    onChange={(e) => setFormPrivate(e.target.checked)}
                    aria-label="비밀글로 등록"
                  />
                  비밀글로 등록
                </label>
                <button
                  type="button"
                  onClick={submitInquiry}
                  disabled={submitting}
                  className="mt-3 min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? '접수 중...' : '문의하기'}
                </button>
              </div>
              <div ref={inquiryListRef}>
                <h3 className="font-medium text-gray-900">내 문의 목록</h3>
                {inquiries.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500">접수한 문의가 없습니다.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {inquiries.map((i) => (
                      <li key={i.id}>
                        <button
                          type="button"
                          onClick={() => setDetailId(i.id)}
                          className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm hover:bg-gray-50"
                        >
                          <span className="min-w-0 flex-1 font-medium text-gray-900 truncate">{i.subject}</span>
                          {i.type && (
                            <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {i.type}
                            </span>
                          )}
                          <span className={`shrink-0 rounded px-2 py-0.5 text-xs ${i.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABELS[i.status] ?? i.status}
                          </span>
                          {i.is_private && (
                            <span className="shrink-0 text-gray-400" aria-label="비밀글">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {detailInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailId(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900">{detailInquiry.subject}</h3>
            <p className="mt-1 text-xs text-gray-500">{new Date(detailInquiry.created_at).toLocaleString('ko-KR')}</p>
            <p className={`mt-2 rounded px-2 py-0.5 text-xs inline-block ${detailInquiry.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABELS[detailInquiry.status] ?? detailInquiry.status}
            </p>
            <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{detailInquiry.body}</div>
            {detailInquiry.admin_reply && (
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-medium text-primary">관리자 답변</p>
                {detailInquiry.replied_at && <p className="text-xs text-gray-500">{new Date(detailInquiry.replied_at).toLocaleString('ko-KR')}</p>}
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{detailInquiry.admin_reply}</p>
              </div>
            )}
            <button type="button" onClick={() => setDetailId(null)} className="mt-6 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              닫기
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
