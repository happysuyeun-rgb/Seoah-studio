import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { EmptyState } from '../components/EmptyState'
import { FilterTabs } from '../components/FilterTabs'
import { PageHeader } from '../components/SectionHeader'
import { ProgressTimeline } from '../components/ProgressTimeline'
import { portalData } from '../portalData'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'progress', label: 'Progress' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'review', label: 'Review & Approval' },
  { id: 'files', label: 'Files' },
  { id: 'payments', label: 'Payments' },
  { id: 'messages', label: 'Messages' },
  { id: 'changes', label: 'Change Requests' },
  { id: 'activity', label: 'Activity' },
] as const

type TabId = (typeof tabs)[number]['id']

export function ProjectDetailPage() {
  usePageTitle('Project — MY SEOA')
  const { id } = useParams()
  const [tab, setTab] = useState<TabId>('overview')
  const project = portalData.projects.find((item) => item.id === id) ?? null

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={project?.name ?? 'Project'} description={project ? `${project.type} · ${project.stage}` : '프로젝트 진행, 검토, 파일, 결제를 이 화면에서 확인합니다.'} />
      <FilterTabs value={tab} options={tabs.map((item) => ({ id: item.id, label: item.label }))} onChange={setTab} />
      {project ? (
        <div>
          {tab === 'progress' ? <ProgressTimeline current={project.stage} /> : <p className="text-sm text-ink-soft">{project.expectedCompletion}</p>}
        </div>
      ) : tab === 'progress' ? (
        <div>
          <ProgressTimeline current={null} />
          <div className="mt-8">
            <EmptyState title="진행 중인 프로젝트가 없습니다." action={{ to: '/studio/request', label: '새 프로젝트 의뢰' }} />
          </div>
        </div>
      ) : (
        <EmptyState title="진행 중인 프로젝트가 없습니다." action={{ to: '/my/projects', label: '프로젝트 목록' }} />
      )}
    </div>
  )
}
