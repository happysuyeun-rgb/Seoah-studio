import type { ActionRequired as PortalAction, CustomerProject, ProjectStage, ProjectTab } from '../my-seoa/types'
import { projectStages } from '../my-seoa/types'
import type { Intake } from '../intake/types'
import type {
  AdminListFilter,
  CustomerChangeRequestStatus,
  CustomerEngagementView,
  CustomerHold,
  Engagement,
  EngagementStatus,
} from './types'
import { customerChangeRequestStatuses } from './types'

const preparing: EngagementStatus[] = ['DRAFT', 'AWAITING_CONTRACT', 'AWAITING_DEPOSIT', 'WAITING_CONTENT', 'READY_TO_START']
const inProgress: EngagementStatus[] = ['PLANNING', 'DESIGN', 'DEVELOPMENT', 'QA', 'REVISION', 'READY_TO_LAUNCH', 'LAUNCHING']

/** 진행 중인 관리자 상태를 고객 단계로 줄인다. PAUSED/CANCELLED는 단계가 아니다. */
export function customerStageFor(status: EngagementStatus): ProjectStage | null {
  if (status === 'PAUSED' || status === 'CANCELLED') return null
  if (preparing.includes(status)) return '준비'
  if (status === 'PLANNING') return '기획'
  if (status === 'DESIGN') return '디자인'
  if (status === 'DEVELOPMENT') return '제작'
  if (status === 'QA' || status === 'AWAITING_REVIEW' || status === 'REVISION' || status === 'READY_TO_LAUNCH' || status === 'LAUNCHING') {
    return '검토'
  }
  if (status === 'COMPLETED') return '완료'
  return null
}

/** 고객에게 보이는 진행 단계. 중지·취소여도 progressStage를 유지한다. */
export function resolveCustomerStage(engagement: Pick<Engagement, 'status' | 'progressStage'>): ProjectStage {
  if (engagement.status === 'PAUSED' || engagement.status === 'CANCELLED') return engagement.progressStage
  return customerStageFor(engagement.status) ?? engagement.progressStage
}

export function customerHold(status: EngagementStatus): CustomerHold | null {
  if (status === 'PAUSED') return 'paused'
  if (status === 'CANCELLED') return 'cancelled'
  return null
}

export function isCustomerChangeStatus(status: string): status is CustomerChangeRequestStatus {
  return customerChangeRequestStatuses.some((item) => item === status)
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

export function toCustomerEngagementView(engagement: Engagement): CustomerEngagementView {
  return {
    id: engagement.id,
    name: engagement.name,
    projectType: engagement.projectType,
    progressStage: resolveCustomerStage(engagement),
    hold: customerHold(engagement.status),
    progress: engagement.progress,
    expectedCompletion: engagement.expectedCompletion,
    actionRequired: engagement.actionRequired,
    milestones: engagement.milestones.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      order: item.order,
      dueDate: item.dueDate,
      requiresApproval: item.requiresApproval,
      needsAction: item.requiresApproval && item.status === 'AWAITING_REVIEW',
    })),
    reviews: engagement.reviews.map((review) => ({
      id: review.id,
      title: review.title,
      status: review.status,
      feedback: review.feedback,
      version: review.version,
    })),
    files: engagement.files
      .filter((file) => file.audience === 'customer')
      .map((file) => ({
        id: file.id,
        name: file.name,
        category: file.category,
        createdAt: file.createdAt,
        version: file.version,
      })),
    payments: engagement.payments.map((payment) => ({
      id: payment.id,
      label: payment.label,
      amount: payment.amount,
      dueDate: payment.dueDate,
      status: payment.status,
    })),
    messages: engagement.messages
      .filter((message) => !message.isInternal)
      .map((message) => ({
        id: message.id,
        sender: message.sender,
        body: message.body,
        createdAt: message.createdAt,
      })),
    changeRequests: engagement.changeRequests
      .filter((request): request is Engagement['changeRequests'][number] & { status: CustomerChangeRequestStatus } => request.audience === 'customer' && isCustomerChangeStatus(request.status))
      .map((request) => ({
        id: request.id,
        title: request.title,
        description: request.description,
        classification: request.classification,
        status: request.status,
        costImpact: request.costImpact,
        scheduleImpact: request.scheduleImpact,
        createdAt: request.createdAt,
      })),
    activities: engagement.activities
      .filter((item) => item.audience === 'customer')
      .map((item) => ({
        id: item.id,
        description: item.description,
        createdAt: item.createdAt,
        actor: item.actor,
      })),
  }
}

export function toCustomerProject(engagement: Engagement): CustomerProject {
  return {
    id: engagement.id,
    name: engagement.name,
    type: engagement.projectType,
    progress: engagement.progress,
    stage: resolveCustomerStage(engagement),
    expectedCompletion: engagement.expectedCompletion ?? '미정',
    actionRequired: engagement.actionRequired?.kind ?? null,
    status: customerProjectTab(engagement),
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
 * READY_TO_START 조건은 Contract Agreed + Deposit Paid + 모든 필수 Intake 승인이다.
 * 상태를 바꾸지 않고 조건만 계산한다.
 * 필수 항목이 0개면 승인할 항목이 없으므로 그 조건은 충족이다.
 * Intake 자체가 없으면 필수 항목을 확인할 수 없어 충족이 아니다.
 */
export function meetsReadyToStart(input: { contractAgreed: boolean; depositPaid: boolean; intake: Intake | null }) {
  if (!input.contractAgreed || !input.depositPaid || !input.intake) return false
  const required = input.intake.items.filter((item) => item.required)
  return required.every((item) => item.status === 'APPROVED')
}

export function statusTone(status: string): 'neutral' | 'signal' | 'warning' | 'success' {
  if (['APPROVED', 'COMPLETED', 'PAID'].includes(status)) return 'success'
  if (['AWAITING_REVIEW', 'PENDING', 'OVERDUE', 'NEEDS_REVISION', 'REVISION', 'REVISION_REQUESTED', 'BLOCKED', 'AWAITING_CUSTOMER_APPROVAL', 'UNDER_REVIEW'].includes(status)) {
    return 'warning'
  }
  if (['IN_PROGRESS', 'DEVELOPMENT', 'DESIGN', 'PLANNING', 'QA', 'LAUNCHING', 'READY_TO_LAUNCH'].includes(status)) return 'signal'
  return 'neutral'
}
