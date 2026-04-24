import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'

const CATEGORIES = [
  { id: 'service', label: '서비스 이용' },
  { id: 'payment', label: '결제/환불' },
  { id: 'template', label: '템플릿/제작' },
  { id: 'etc', label: '기타' },
]

type Step = 1 | 2 | 3 | 4

export function ChatbotWidget() {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [name, setName] = useState(user?.user_metadata?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const reset = () => {
    setStep(1)
    setCategory('')
    setContent('')
    setName(user?.user_metadata?.name ?? '')
    setEmail(user?.email ?? '')
    setSubmitted(false)
  }

  const handleClose = () => {
    setOpen(false)
    if (submitted) reset()
  }

  const handleSubmit = async () => {
    const catLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category
    if (!content.trim()) {
      toast.error('문의 내용을 입력하세요.')
      return
    }
    if (!name.trim() || !email.trim()) {
      toast.error('이름과 이메일을 입력하세요.')
      return
    }
    setSubmitting(true)
    try {
      const { data, error } = await supabase.functions.invoke('submit-chatbot-inquiry', {
        body: { category: catLabel, content: content.trim(), name: name.trim(), email: email.trim() },
      })
      if (error || (data && (data as { success?: boolean }).success === false)) {
        const msg = (data as { message?: string } | null)?.message ?? error?.message ?? '접수에 실패했습니다.'
        throw new Error(msg)
      }
      setSubmitted(true)
      toast.success('접수되었습니다. 빠른 시일 내에 연락드리겠습니다.')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90"
        aria-label="챗봇 열기"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="font-semibold text-gray-900">문의하기</span>
            <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {submitted ? (
              <p className="py-6 text-center text-sm text-gray-600">접수가 완료되었습니다. 감사합니다.</p>
            ) : (
              <>
                {step === 1 && (
                  <div>
                    <p className="text-sm text-gray-600">어떤 문의인가요?</p>
                    <div className="mt-3 space-y-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setCategory(c.id); setStep(2); }}
                          className="block w-full rounded-lg border border-gray-200 px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-primary hover:underline">
                      ← 이전
                    </button>
                    <p className="mt-2 text-sm text-gray-600">문의 내용을 적어 주세요.</p>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={4}
                      placeholder="내용"
                      className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button type="button" onClick={() => setStep(3)} className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90">
                      다음
                    </button>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <button type="button" onClick={() => setStep(2)} className="text-xs text-primary hover:underline">
                      ← 이전
                    </button>
                    <p className="mt-2 text-sm text-gray-600">이름</p>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="이름"
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button type="button" onClick={() => setStep(4)} className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90">
                      다음
                    </button>
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <button type="button" onClick={() => setStep(3)} className="text-xs text-primary hover:underline">
                      ← 이전
                    </button>
                    <p className="mt-2 text-sm text-gray-600">이메일</p>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      {submitting ? '접수 중...' : '접수하기'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
