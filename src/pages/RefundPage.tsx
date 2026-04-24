import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const POLICY_VERSION = '2026-03'
const EFFECTIVE_DATE = '2026년 3월 22일'

export function RefundPage() {
  useEffect(() => {
    document.title = '환불정책 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">환불정책</h1>
        <p className="mt-2 text-sm text-gray-500">
          버전 {POLICY_VERSION} · 시행일 {EFFECTIVE_DATE}
        </p>
      </header>

      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-sm text-gray-700">
        <strong className="text-gray-900">주요 고지</strong>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>다운로드 전: 전액 환불 가능</li>
          <li>다운로드 후: 미사용·오류 시 7일 이내 검토</li>
          <li>환불 요청: 마이페이지에서 주문별로 제출</li>
        </ul>
      </div>

      <article className="prose prose-gray mt-8 max-w-none">
        <section id="article1" className="scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제1조 (환불 가능 조건)</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
            <li><strong>다운로드 전:</strong> 결제 완료 후 파일을 다운로드하지 않은 경우 전액 환불 가능</li>
            <li><strong>다운로드 후:</strong> AI 생성 결과물의 심각한 오류·미작동 시 7일 이내 검토 후 환불</li>
            <li>단순 변심은 다운로드 후 환불 대상이 아닙니다.</li>
          </ul>
        </section>

        <section id="article2" className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제2조 (환불 절차)</h2>
          <p className="mt-2 text-gray-600">
            마이페이지의 다운로드 내역에서 해당 주문의 &quot;환불 요청&quot; 버튼을 클릭하고,
            사유(10자 이상)를 입력하여 제출해 주세요. 필요한 경우 스크린샷 등 첨부파일을 업로드할 수 있습니다.
            검토 후 3~5 영업일 내 처리됩니다.
          </p>
        </section>

        <section id="article3" className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제3조 (환불 불가)</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
            <li>결제 후 7일 초과</li>
            <li>다운로드 완료 후 단순 변심</li>
            <li>고의적 남용·악용 의심 시</li>
          </ul>
        </section>
      </article>

      <footer className="mt-12 border-t border-gray-200 pt-6">
        <Link
          to="/support"
          className="text-primary hover:underline"
        >
          문의하기 (support@seoah.studio)
        </Link>
      </footer>
    </main>
  )
}
