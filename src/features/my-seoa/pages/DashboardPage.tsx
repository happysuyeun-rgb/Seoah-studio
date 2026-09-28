import { Link } from 'react-router-dom'
import { ButtonLink } from '../../../components/ui/Button'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { useAuthStore } from '../../../store/authStore'
import { EmptyState } from '../components/EmptyState'
import { ProgressTimeline } from '../components/ProgressTimeline'
import { SectionHeader } from '../components/SectionHeader'
import { SummaryMetric } from '../components/SummaryMetric'
import { portalData } from '../portalData'

function displayName(name: unknown) {
  if (typeof name === 'string' && name.trim()) return name.trim()
  return '회원'
}

export function DashboardPage() {
  usePageTitle('MY SEOA — SEOAH.STUDIO')
  const user = useAuthStore((state) => state.user)
  const name = displayName(user?.user_metadata?.name)
  const current = portalData.projects.find((project) => project.status === 'active') ?? null

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <p className="text-xs text-ink-faint">MY SEOA</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{name}님, 안녕하세요.</h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric label="Active Projects" value={String(portalData.projects.filter((project) => project.status === 'active').length)} />
        <SummaryMetric label="Action Required" value={String(portalData.actions.length)} />
        <SummaryMetric label="Purchases" value={String(portalData.purchases.length)} />
        <SummaryMetric label="Next Payment" value="없음" />
      </section>

      <section className="mt-12">
        <SectionHeader title="Current Project" />
        {current ? (
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-ink">{current.name}</h3>
            <p className="mt-2 text-sm text-ink-soft">
              {current.stage} · {current.progress}% · {current.expectedCompletion}
            </p>
            <div className="mt-6">
              <ProgressTimeline current={current.stage} />
            </div>
          </div>
        ) : (
          <EmptyState title="진행 중인 Studio 프로젝트가 없습니다." action={{ to: '/studio/request', label: '프로젝트 의뢰하기' }} />
        )}
      </section>

      <section className="mt-12">
        <SectionHeader title="Action Required" />
        {portalData.actions.length === 0 ? (
          <EmptyState title="지금 확인할 작업이 없습니다." />
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {portalData.actions.map((action) => (
              <li key={action.id} className="py-4 text-sm text-ink">
                {action.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <SectionHeader title="Recent Purchases" />
        {portalData.purchases.length === 0 ? (
          <EmptyState title="아직 구매한 제품이 없습니다." action={{ to: '/ready', label: 'Ready 제품 보기' }} />
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {portalData.purchases.map((purchase) => (
              <li key={purchase.id} className="py-4 text-sm">
                <Link to={`/my/purchases/${purchase.id}`} className="text-ink">
                  {purchase.productName}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <SectionHeader title="Recent Activity" />
        {portalData.activities.length === 0 ? (
          <EmptyState title="최근 활동이 없습니다." />
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {portalData.activities.map((item) => (
              <li key={item.id} className="py-4 text-sm text-ink">
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <SectionHeader title="Latest Files" />
        {portalData.files.length === 0 ? <EmptyState title="받은 파일이 없습니다." /> : null}
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <SectionHeader title="Quick Actions" />
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/ready" size="sm">
            Ready 제품 보기
          </ButtonLink>
          <ButtonLink to="/studio/request" variant="secondary" size="sm">
            프로젝트 의뢰하기
          </ButtonLink>
          <ButtonLink to="/contact" variant="secondary" size="sm">
            문의하기
          </ButtonLink>
        </div>
      </section>
    </div>
  )
}
