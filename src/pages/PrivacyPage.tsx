import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const POLICY_VERSION = '2026-03'
const EFFECTIVE_DATE = '2026년 3월 22일'

export function PrivacyPage() {
  useEffect(() => {
    document.title = '개인정보처리방침 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">개인정보처리방침</h1>
        <p className="mt-2 text-sm text-gray-500">
          버전 {POLICY_VERSION} · 시행일 {EFFECTIVE_DATE}
        </p>
      </header>

      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-sm text-gray-700">
        <strong className="text-gray-900">주요 고지</strong>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>수집 항목: 이메일, 이름, 프로필 이미지(소셜 로그인 시)</li>
          <li>보관 기간: 회원 탈퇴 시 즉시 삭제(주문·결제 이력은 법정 보관 기준 준수)</li>
          <li>제3자 제공: 결제·이메일 발송 목적으로 최소 범위만 제공</li>
        </ul>
      </div>

      <article className="prose prose-gray mt-8 max-w-none">
        <section id="article1" className="scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제1조 (수집 항목)</h2>
          <p className="mt-2 text-gray-600">
            카카오·구글 소셜 로그인 시 이메일, 이름, 프로필 이미지를 수집합니다.
            결제 시 포트원을 통해 결제 정보가 처리되며, 본 서비스는 결제 검증에 필요한 최소 정보만 보관합니다.
          </p>
        </section>

        <section id="article2" className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제2조 (수집 목적)</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
            <li>회원 식별 및 서비스 제공</li>
            <li>결제·환불 처리</li>
            <li>문의·고객지원 응답</li>
            <li>법적 의무 이행</li>
          </ul>
        </section>

        <section id="article3" className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제3조 (보관 기간)</h2>
          <p className="mt-2 text-gray-600">
            회원 탈퇴 시 프로젝트·문의 데이터는 즉시 비식별화됩니다.
            주문·결제·환불 이력은 전자상거래법 등 법정 보관 기간(5년) 동안 보관됩니다.
          </p>
        </section>

        <section id="article4" className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900">제4조 (권리)</h2>
          <p className="mt-2 text-gray-600">
            회원은 언제든지 개인정보 열람·정정·삭제를 요청할 수 있으며, 마이페이지 설정에서
            회원탈퇴를 진행할 수 있습니다.
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
