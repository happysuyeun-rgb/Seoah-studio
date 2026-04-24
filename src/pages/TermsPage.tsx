import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const POLICY_VERSION = '2026-03'
const EFFECTIVE_DATE = '2026년 3월 22일'

export function TermsPage() {
  useEffect(() => {
    document.title = '이용약관 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">이용약관</h1>
        <p className="mt-2 text-sm text-gray-500">
          버전 {POLICY_VERSION} · 시행일 {EFFECTIVE_DATE}
        </p>
      </header>

      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-sm text-gray-700">
        <strong className="text-gray-900">주요 고지</strong>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>본 서비스는 만 14세 미만 이용이 제한됩니다.</li>
          <li>결제 전 이용약관·개인정보처리방침·환불정책에 동의해야 합니다.</li>
          <li>서비스 이용 시 본 약관에 동의한 것으로 간주됩니다.</li>
        </ul>
      </div>

      <article className="prose prose-gray mt-8 max-w-none">
        <section id="article1" className="scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제1조 (목적)</h2>
          <p className="mt-2 text-gray-600">
            본 약관은 SEOAH.STUDIO(이하 &quot;서비스&quot;)가 제공하는 AI 자동화 웹사이트 제작 서비스의 이용 조건 및 절차,
            회원과 서비스 제공자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section id="article2" className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제2조 (정의)</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
            <li>&quot;서비스&quot;: AI 기반 랜딩 페이지 자동 생성·다운로드 및 관련 부가 서비스</li>
            <li>&quot;회원&quot;: 서비스에 가입하여 이용약관에 동의한 자</li>
            <li>&quot;결과물&quot;: 서비스를 통해 생성된 HTML·PDF 등 파일</li>
          </ul>
        </section>

        <section id="article3" className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제3조 (이용 자격)</h2>
          <p className="mt-2 text-gray-600">
            본 서비스는 만 14세 미만의 이용을 금지합니다. 결제 서비스를 포함하므로 법정 대리인 동의 없이
            미성년자가 이용할 수 없습니다.
          </p>
        </section>

        <section id="article4" className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제4조 (약관의 효력 및 변경)</h2>
          <p className="mt-2 text-gray-600">
            약관이 변경되는 경우 시행 7일 전에 서비스 내 공지합니다. 변경된 약관에 동의하지 않으면
            이용 중단 및 탈퇴를 요청할 수 있습니다.
          </p>
        </section>

        <section id="article5" className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제5조 (서비스 이용)</h2>
          <p className="mt-2 text-gray-600">
            회원은 업로드한 콘텐츠를 기반으로 AI가 생성한 결과물을 다운로드할 수 있습니다.
            결과물의 저작권은 회원에게 귀속되며, 서비스는 필요한 범위 내에서 이용권을 가집니다.
          </p>
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
