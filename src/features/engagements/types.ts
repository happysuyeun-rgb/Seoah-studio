import type { ProjectStage } from '../my-seoa/types'

/** Studio 고객 프로젝트. public.projects(템플릿 세션)와 별도이며 DB row가 아니다. */
export const engagementStatuses = [
  'DRAFT',
  'AWAITING_CONTRACT',
  'AWAITING_DEPOSIT',
  'WAITING_CONTENT',
  'READY_TO_START',
  'PLANNING',
  'DESIGN',
  'DEVELOPMENT',
  'QA',
  'AWAITING_REVIEW',
  'REVISION',
  'READY_TO_LAUNCH',
  'LAUNCHING',
  'COMPLETED',
  'PAUSED',
  'CANCELLED',
] as const
export type EngagementStatus = (typeof engagementStatuses)[number]

export const actionKinds = [
  'NONE',
  'CONTENT_REQUIRED',
  'REVIEW_REQUIRED',
  'APPROVAL_REQUIRED',
  'PAYMENT_REQUIRED',
  'CHANGE_REQUEST_APPROVAL',
  'INFORMATION_REQUIRED',
] as const
export type ActionKind = (typeof actionKinds)[number]

export interface ActionRequired {
  kind: Exclude<ActionKind, 'NONE'>
  label: string
  description: string
  dueDate: string | null
  ctaLabel: string
  ctaTarget: string
}

export const blockedReasons = [
  'WAITING_CUSTOMER',
  'MISSING_CONTENT',
  'PAYMENT',
  'TECHNICAL_DEPENDENCY',
  'EXTERNAL_SERVICE',
  'OTHER',
] as const
export type BlockedReason = (typeof blockedReasons)[number]

export const milestoneStatuses = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'AWAITING_REVIEW',
  'REVISION',
  'APPROVED',
  'COMPLETED',
  'BLOCKED',
] as const
export type MilestoneStatus = (typeof milestoneStatuses)[number]

export interface EngagementMilestone {
  id: string
  engagementId: string
  title: string
  description: string
  status: MilestoneStatus
  order: number
  dueDate: string | null
  completedAt: string | null
  requiresApproval: boolean
  notes: string
}

export const reviewStatuses = ['PENDING', 'APPROVED', 'REVISION_REQUESTED'] as const
export type ReviewStatus = (typeof reviewStatuses)[number]

export interface ProjectReview {
  id: string
  engagementId: string
  milestoneId: string
  title: string
  status: ReviewStatus
  requestedAt: string
  reviewedAt: string | null
  feedback: string
  version: number
}

export const changeClassifications = ['SCOPE_IN', 'MINOR_CHANGE', 'CHANGE_REQUEST', 'BUG'] as const
export type ChangeClassification = (typeof changeClassifications)[number]

export const changeRequestStatuses = [
  'DRAFT',
  'UNDER_REVIEW',
  'AWAITING_CUSTOMER_APPROVAL',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'COMPLETED',
] as const
export type ChangeRequestStatus = (typeof changeRequestStatuses)[number]

/** 고객에게 상태를 보여줄 변경 요청. DRAFT와 UNDER_REVIEW는 운영 내부 상태다. */
export const customerChangeRequestStatuses = ['AWAITING_CUSTOMER_APPROVAL', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'] as const
export type CustomerChangeRequestStatus = (typeof customerChangeRequestStatuses)[number]

export const audiences = ['customer', 'admin'] as const
export type Audience = (typeof audiences)[number]

export interface EngagementChangeRequest {
  id: string
  engagementId: string
  title: string
  description: string
  classification: ChangeClassification
  status: ChangeRequestStatus
  costImpact: string
  scheduleImpact: string
  createdAt: string
  approvedAt: string | null
  /** admin이면 고객 변경 요청 목록에 넣지 않는다. */
  audience: Audience
}

export const fileCategories = ['Intake', 'Planning', 'Design', 'Development', 'Review', 'Final', 'Contract', 'Other'] as const
export type FileCategory = (typeof fileCategories)[number]

export interface EngagementFile {
  id: string
  name: string
  category: FileCategory
  uploadedBy: 'Admin' | 'Customer'
  createdAt: string
  version: number
  /** admin이면 고객 파일 목록에 넣지 않는다. */
  audience: Audience
}

export interface EngagementMessage {
  id: string
  sender: 'Admin' | 'Customer'
  body: string
  createdAt: string
  /** true면 고객 화면에서 제외한다. Internal Notes와는 다른 운영 메시지다. */
  isInternal: boolean
}

export const activityTypes = [
  'STATUS_CHANGED',
  'MILESTONE_UPDATED',
  'REVIEW_REQUESTED',
  'APPROVED',
  'FILE_ADDED',
  'CHANGE_REQUEST_CREATED',
  'PAYMENT_UPDATED',
] as const
export type ActivityType = (typeof activityTypes)[number]

export interface EngagementActivity {
  id: string
  type: ActivityType
  actor: string
  description: string
  createdAt: string
  /** admin이면 고객 활동 목록에 넣지 않는다. */
  audience: Audience
}

/** 결제 상태. EngagementStatus와 섞지 않는다. Legacy orders와 연결하지 않는다. */
export const paymentStatuses = ['PENDING', 'PAID', 'FAILED', 'OVERDUE', 'REFUNDED', 'PARTIAL_REFUND', 'CANCELLED'] as const
export type EngagementPaymentStatus = (typeof paymentStatuses)[number]

export interface EngagementPayment {
  id: string
  label: 'Deposit' | 'Interim' | 'Final'
  amount: number
  dueDate: string | null
  status: EngagementPaymentStatus
}

export interface Engagement {
  id: string
  name: string
  customer: string
  projectType: string
  status: EngagementStatus
  /** 고객 진행 단계. PAUSED/CANCELLED와 별도이며, 중지해도 이 값은 유지한다. */
  progressStage: ProjectStage
  progress: number
  startedAt: string | null
  expectedCompletion: string | null
  actionRequired: ActionRequired | null
  blockedReason: BlockedReason | null
  currentMilestoneId: string | null
  createdAt: string
  updatedAt: string
  contractAgreed: boolean
  depositPaid: boolean
  /** Admin only. Messages와 별도 필드다. */
  internalNotes: string
  milestones: EngagementMilestone[]
  reviews: ProjectReview[]
  files: EngagementFile[]
  messages: EngagementMessage[]
  changeRequests: EngagementChangeRequest[]
  activities: EngagementActivity[]
  payments: EngagementPayment[]
}

export type CustomerHold = 'paused' | 'cancelled'

export interface CustomerMilestone {
  id: string
  title: string
  description: string
  status: MilestoneStatus
  order: number
  dueDate: string | null
  requiresApproval: boolean
  needsAction: boolean
}

export interface CustomerReview {
  id: string
  title: string
  status: ReviewStatus
  feedback: string
  version: number
}

export interface CustomerFile {
  id: string
  name: string
  category: FileCategory
  createdAt: string
  version: number
}

export interface CustomerMessage {
  id: string
  sender: 'Admin' | 'Customer'
  body: string
  createdAt: string
}

export interface CustomerChangeRequest {
  id: string
  title: string
  description: string
  classification: ChangeClassification
  status: CustomerChangeRequestStatus
  costImpact: string
  scheduleImpact: string
  createdAt: string
}

export interface CustomerActivity {
  id: string
  description: string
  createdAt: string
  actor: string
}

export interface CustomerPayment {
  id: string
  label: EngagementPayment['label']
  amount: number
  dueDate: string | null
  status: EngagementPaymentStatus
}

/** 고객 화면이 읽는 값만 담는다. internalNotes, 내부 메시지, 관리자 파일·활동·내부 변경 상태는 없다. */
export interface CustomerEngagementView {
  id: string
  name: string
  projectType: string
  progressStage: ProjectStage
  hold: CustomerHold | null
  progress: number
  expectedCompletion: string | null
  actionRequired: ActionRequired | null
  milestones: CustomerMilestone[]
  reviews: CustomerReview[]
  files: CustomerFile[]
  payments: CustomerPayment[]
  messages: CustomerMessage[]
  changeRequests: CustomerChangeRequest[]
  activities: CustomerActivity[]
}

export const customerHoldLabels: Record<CustomerHold, string> = {
  paused: '일시중지',
  cancelled: '취소',
}

export const adminListFilters = ['Preparing', 'In Progress', 'Awaiting Review', 'Blocked', 'Completed', 'Paused', 'Cancelled'] as const
export type AdminListFilter = (typeof adminListFilters)[number]

export const engagementStatusLabels: Record<EngagementStatus, string> = {
  DRAFT: 'Draft',
  AWAITING_CONTRACT: 'Awaiting Contract',
  AWAITING_DEPOSIT: 'Awaiting Deposit',
  WAITING_CONTENT: 'Waiting Content',
  READY_TO_START: 'Ready to Start',
  PLANNING: 'Planning',
  DESIGN: 'Design',
  DEVELOPMENT: 'Development',
  QA: 'QA',
  AWAITING_REVIEW: 'Awaiting Review',
  REVISION: 'Revision',
  READY_TO_LAUNCH: 'Ready to Launch',
  LAUNCHING: 'Launching',
  COMPLETED: 'Completed',
  PAUSED: 'Paused',
  CANCELLED: 'Cancelled',
}

export const blockedReasonLabels: Record<BlockedReason, string> = {
  WAITING_CUSTOMER: 'Waiting Customer',
  MISSING_CONTENT: 'Missing Content',
  PAYMENT: 'Payment',
  TECHNICAL_DEPENDENCY: 'Technical Dependency',
  EXTERNAL_SERVICE: 'External Service',
  OTHER: 'Other',
}

/** 자동 타이머는 없다. 운영 기준을 화면에 적기 위한 문구다. */
export const CUSTOMER_DELAY_POLICY =
  '고객 자료가 늦어지면 영업일 3일에 리마인드, 7일에 일정 조정, 10일 이후 Blocked를 검토할 수 있습니다. 이 화면은 그 시간을 세지 않습니다.'

export const STAGE_LOCK_NOTE =
  '고객이 승인한 단계는 잠급니다. 승인 이후의 큰 변경은 Revision이 아니라 Change Request로 다룹니다.'

export const REVISION_BUNDLE_NOTE = '수정 1회는 피드백 개수가 아니라, 한 번에 전달한 피드백 묶음 1회입니다.'

export const BUG_CHANGE_NOTE =
  'BUG는 합의된 기능이 정상 작동하지 않는 경우입니다. CHANGE_REQUEST는 기능이 합의대로 작동하지만 다른 동작이나 범위를 원하는 경우입니다.'
