import { Link } from 'react-router-dom'
import { ButtonLink } from '../../../components/ui/Button'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { useAuthStore } from '../../../store/authStore'
import { EmptyState } from '../components/EmptyState'
import { ProgressTimeline } from '../components/ProgressTimeline'
import { SectionHeader } from '../components/SectionHeader'
import { SummaryMetric } from '../components/SummaryMetric'
import { ActionRequiredPanel } from '../../engagements/components/ActionRequiredPanel'
import { nextCustomerStage, toCustomerProject } from '../../engagements/mappers'
import { useEngagementSource } from '../../engagements/useEngagementSource'
import { portalData } from '../portalData'

function displayName(name: unknown) {
  if (typeof name === 'string' && name.trim()) return name.trim()
  return '회원'
}

export function DashboardPage() {
  usePageTitle('MY SEOA — SEOAH.STUDIO')
  const user = useAuthStore((state) => state.user)
  const name = displayName(user?.user_metadata?.name)
  const { engagements } = useEngagementSource()
  const projects = engagements.map(toCustomerProject)
  const current = projects.find((project) => project.status === 'active') ?? null
  const nextStage = current ? nextCustomerStage(current.stage) : null
  const actions = engagements.flatMap((engagement) => (engagement.actionRequired ? [{ id: engagement.id, action: engagement.actionRequired, name: engagement.name }] : []))

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-12">
        <p className="text-xs font-medium tracking-[0.14em] text-ink-faint">MY SEOA</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">안녕하세요, {name}님.</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">현재 진행 중인 프로젝트와 확인이 필요한 작업을 확인하세요.</p>
      </header>

      <div className="grid gap-12 border-t-2 border-ink pt-8 lg:grid-cols-2 lg:gap-16">
        <section>
          <SectionHeader title="진행 중인 프로젝트" />
          {current ? (
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-ink">{current.name}</h3>
              <p className="mt-3 text-sm text-ink-soft">
                {current.stage} · {current.progress}% · 완료 예정 {current.expectedCompletion}
              </p>
              <div className="mt-6">
                <ProgressTimeline current={current.stage} />
              </div>
              {nextStage ? <p className="mt-4 text-sm text-ink-soft">다음 단계 {nextStage}</p> : null}
              <ButtonLink to={`/my/projects/${current.id}`} variant="secondary" size="sm" className="mt-6">
                프로젝트 보기
              </ButtonLink>
            </div>
          ) : (
            <EmptyState title="진행 중인 프로젝트가 없습니다." action={{ to: '/studio/request', label: '프로젝트 의뢰하기' }} />
          )}
        </section>

        <section>
          <SectionHeader title="확인이 필요합니다" />
          {actions.length === 0 ? (
            <p className="text-sm text-ink-soft">현재 확인할 작업이 없습니다.</p>
          ) : (
            <ul>
              {actions.map((item) => (
                <li key={item.id}>
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <ActionRequiredPanel action={item.action} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-12 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
        <SummaryMetric label="구매" value={String(portalData.purchases.length)} />
        <SummaryMetric label="다음 결제" value="없음" />
      </section>

      <section className="mt-12">
        <SectionHeader title="최근 구매" />
        {portalData.purchases.length === 0 ? (
          <EmptyState title="구매 내역이 없습니다." action={{ to: '/ready', label: 'Ready 제품 보기' }} />
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
        <SectionHeader title="최근 활동" />
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
        <SectionHeader title="최근 파일" />
        {portalData.files.length === 0 ? <EmptyState title="받은 파일이 없습니다." /> : null}
      </section>

      <section className="mt-16 border-t border-line pt-8">
        <SectionHeader title="바로 가기" />
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/ready" className="inline-flex min-h-11 items-center text-sm text-ink-soft hover:text-ink">
            Ready 제품 보기
          </Link>
          <Link to="/studio/request" className="inline-flex min-h-11 items-center text-sm text-ink-soft hover:text-ink">
            프로젝트 의뢰하기
          </Link>
          <Link to="/contact" className="inline-flex min-h-11 items-center text-sm text-ink-soft hover:text-ink">
            문의하기
          </Link>
        </div>
      </section>
    </div>
  )
}
