import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { customerHold, toCustomerProject } from '../../engagements/mappers'
import { customerHoldLabels } from '../../engagements/types'
import { useEngagementSource } from '../../engagements/useEngagementSource'
import { EmptyState } from '../components/EmptyState'
import { FilterTabs } from '../components/FilterTabs'
import { PageHeader } from '../components/SectionHeader'
import type { ProjectTab } from '../types'

const tabs: { id: ProjectTab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'awaiting_review', label: 'Awaiting Review' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

const emptyCopy: Record<ProjectTab, string> = {
  active: '진행 중인 프로젝트가 없습니다.',
  awaiting_review: '검토를 기다리는 프로젝트가 없습니다.',
  completed: '완료된 프로젝트가 없습니다.',
  cancelled: '취소된 프로젝트가 없습니다.',
}

export function ProjectsPage() {
  usePageTitle('Projects — MY SEOA')
  const { engagements, ready } = useEngagementSource()
  const [tab, setTab] = useState<ProjectTab>('active')
  const rows = engagements
    .map((engagement) => ({ project: toCustomerProject(engagement), hold: customerHold(engagement.status) }))
    .filter((row) => row.project.status === tab)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Projects" description="Studio에서 진행하는 프로젝트입니다." />
      {import.meta.env.DEV ? <p className="mb-4 text-xs text-ink-faint">개발 환경 예시입니다. 저장되지 않습니다.</p> : null}
      <FilterTabs value={tab} options={tabs} onChange={setTab} />
      {!ready ? <p className="text-sm text-ink-faint">로딩 중...</p> : null}
      {ready && rows.length === 0 ? (
        <EmptyState title={emptyCopy[tab]} action={tab === 'active' ? { to: '/studio/request', label: '새 프로젝트 의뢰' } : undefined} />
      ) : null}
      {ready && rows.length > 0 ? (
        <ul className="divide-y divide-line border-t border-line">
          {rows.map(({ project, hold }) => (
            <li key={project.id} className="py-5">
              <Link to={`/my/projects/${project.id}`} className="text-sm font-medium text-ink">
                {project.name}
              </Link>
              <p className="mt-1 text-sm text-ink-soft">
                {project.type} · {project.stage}
                {hold ? ` · ${customerHoldLabels[hold]}` : ''} · {project.progress}% · {project.expectedCompletion}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
