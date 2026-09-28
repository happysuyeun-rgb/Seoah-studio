import type { ActionRequired as PortalAction, CustomerProject, ProjectStage, ProjectTab } from '../my-seoa/types'
import { projectStages } from '../my-seoa/types'
import type { Intake } from '../intake/types'
import type { AdminListFilter, Engagement, EngagementStatus, EngagementView } from './types'

const preparing: EngagementStatus[] = ['DRAFT', 'AWAITING_CONTRACT', 'AWAITING_DEPOSIT', 'WAITING_CONTENT', 'READY_TO_START']
const inProgress: EngagementStatus[] = ['PLANNING', 'DESIGN', 'DEVELOPMENT', 'QA', 'REVISION', 'READY_TO_LAUNCH', 'LAUNCHING']

/** 관리자 상세 상태를 고객 단계로 줄인다. 고객 화면은 이 값만 쓴다. */
export function customerStageFor(status: EngagementStatus): ProjectStage {
  if (preparing.includes(status)) return '준비'
  if (status === 'PLANNING') return '기획'
  if (status === 'DESIGN') return '디자인'
  if (status === 'DEVELOPMENT') return '제작'
  if (status === 'QA' || status === 'AWAITING_REVIEW' || status === 'REVISION' || status === 'READY_TO_LAUNCH' || status === 'LAUNCHING') {
    return '검토'
  }
  if (status === 'COMPLETED') return '완료'
  return '준비'
}

export function nextCustomerStage(stage: ProjectStage): ProjectStage | null {
  const index = projectStages.indexOf(stage)
  if (index < 0 || index >= projectStages.length - 1) return null
  return projectStages[index + 1]
}

export function customerProjectTab(engagement: Engagement): ProjectTab {
  if (engagement.status === 'COMPLETED') return 'completed'
  if (engagement.status === 'CANCELLED') return 'cancelled'
  if (engagement.status === 'AWAITING_REVIEW') return 'awaiting_review'
  return 'active'
}

export function toEngagementView(engagement: Engagement): EngagementView {
  return { ...engagement, customerStage: customerStageFor(engagement.status) }
}

export function toCustomerProject(engagement: Engagement): CustomerProject {
  const view = toEngagementView(engagement)
  return {
    id: view.id,
    name: view.name,
    type: view.projectType,
    progress: view.progress,
    stage: view.customerStage,
    expectedCompletion: view.expectedCompletion ?? '미정',
    actionRequired: view.actionRequired?.kind ?? null,
    status: customerProjectTab(view),
  }
}

export function toPortalAction(engagement: Engagement): PortalAction | null {
  if (!engagement.actionRequired) return null
  return {
    id: `${engagement.id}-${engagement.actionRequired.kind}`,
    kind: engagement.actionRequired.kind,
    title: engagement.actionRequired.label,
    projectName: engagement.name,
    dueAt: engagement.actionRequired.dueDate,
  }
}

export function matchesAdminFilter(engagement: Engagement, filter: 'ALL' | AdminListFilter) {
  if (filter === 'ALL') return true
  if (filter === 'Blocked') return engagement.blockedReason !== null
  if (filter === 'Preparing') return preparing.includes(engagement.status)
  if (filter === 'In Progress') return inProgress.includes(engagement.status)
  if (filter === 'Awaiting Review') return engagement.status === 'AWAITING_REVIEW'
  if (filter === 'Completed') return engagement.status === 'COMPLETED'
  if (filter === 'Paused') return engagement.status === 'PAUSED'
  return engagement.status === 'CANCELLED'
}

/**
 * READY_TO_START는 Contract Agreed + Deposit Paid + 필수 Intake 승인 이후다.
 * 상태를 바꾸지 않고 조건만 계산한다.
 */
export function meetsReadyToStart(input: { contractAgreed: boolean; depositPaid: boolean; intake: Intake | null }) {
  if (!input.contractAgreed || !input.depositPaid || !input.intake) return false
  const required = input.intake.items.filter((item) => item.required)
  return required.length > 0 && required.every((item) => item.status === 'APPROVED')
}

export function customerMessages(engagement: Engagement) {
  return engagement.messages.filter((message) => !message.isInternal)
}

export function statusTone(status: string): 'neutral' | 'signal' | 'warning' | 'success' {
  if (['APPROVED', 'COMPLETED', 'PAID'].includes(status)) return 'success'
  if (['AWAITING_REVIEW', 'PENDING', 'OVERDUE', 'NEEDS_REVISION', 'REVISION', 'REVISION_REQUESTED', 'BLOCKED', 'AWAITING_CUSTOMER_APPROVAL', 'UNDER_REVIEW'].includes(status)) {
    return 'warning'
  }
  if (['IN_PROGRESS', 'DEVELOPMENT', 'DESIGN', 'PLANNING', 'QA', 'LAUNCHING', 'READY_TO_LAUNCH'].includes(status)) return 'signal'
  return 'neutral'
}
