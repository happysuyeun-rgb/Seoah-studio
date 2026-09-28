import { Link } from 'react-router-dom'
import { PageContainer } from './ui/PageContainer'

const columns = [
  {
    title: 'Product',
    links: [
      { to: '/ready', label: 'Ready' },
      { to: '/saas', label: 'SaaS' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { to: '/studio', label: 'Studio' },
      { to: '/studio/request', label: '프로젝트 의뢰' },
    ],
  },
  {
    title: 'Care',
    links: [{ to: '/care', label: 'Care' }],
  },
  {
    title: 'Company',
    links: [
      { to: '/work', label: 'Work' },
      { to: '/about', label: 'About' },
      { to: '/brand', label: 'Brand' },
      { to: '/faq', label: 'FAQ' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/terms', label: '이용약관' },
      { to: '/privacy', label: '개인정보처리방침' },
      { to: '/refund', label: '환불정책' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <PageContainer className="py-20 sm:py-24 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2.4fr)] lg:gap-16">
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink">SEOAH.STUDIO</p>
            <p className="mt-4 max-w-xs text-base leading-relaxed text-ink">
              스타트업과 작은 비즈니스를 위한 디지털 제품 스튜디오.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-faint">{column.title}</p>
                <ul className="mt-4 space-y-3">
                  {column.links.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} className="text-base text-ink-soft hover:text-ink">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <p className="mt-16 text-sm tracking-tight text-ink-faint">© 2026 SEOAH.STUDIO</p>
      </PageContainer>
    </footer>
  )
}
