import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6">
      <div className="mx-auto max-w-6xl px-4 text-center text-[12px] text-gray-500 sm:px-8">
        <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
          <Link to="/terms" className="hover:text-gray-700 hover:underline">
            이용약관
          </Link>
          <span aria-hidden> | </span>
          <Link to="/privacy" className="hover:text-gray-700 hover:underline">
            개인정보처리방침
          </Link>
          <span aria-hidden> | </span>
          <Link to="/refund" className="hover:text-gray-700 hover:underline">
            환불정책
          </Link>
        </nav>
        <p className="mt-3">© 2026 SEOAH.STUDIO</p>
      </div>
    </footer>
  )
}
