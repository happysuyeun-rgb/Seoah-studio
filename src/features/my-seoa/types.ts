export const projectStages = ['준비', '기획', '디자인', '제작', '검토', '완료'] as const
export type ProjectStage = (typeof projectStages)[number]

export const actionKinds = [
  'CONTENT_REQUIRED',
  'REVIEW_REQUIRED',
  'APPROVAL_REQUIRED',
  'PAYMENT_REQUIRED',
  'CHANGE_REQUEST_APPROVAL',
  'INFORMATION_REQUIRED',
] as const
export type ActionKind = (typeof actionKinds)[number]

export const purchaseCategories = ['Ready', 'Brand', 'Add-ons'] as const
export type PurchaseCategory = (typeof purchaseCategories)[number]

export const projectTabs = ['active', 'awaiting_review', 'completed', 'cancelled'] as const
export type ProjectTab = (typeof projectTabs)[number]

export const proposalTabs = ['awaiting_review', 'approved', 'rejected', 'expired'] as const
export type ProposalTab = (typeof proposalTabs)[number]

export const ticketStatuses = ['New', 'Open', 'Waiting Customer', 'Resolved', 'Closed'] as const
export type TicketStatus = (typeof ticketStatuses)[number]

export const notificationCategories = ['Project', 'Payment', 'Review', 'Support', 'System'] as const
export type NotificationCategory = (typeof notificationCategories)[number]

export interface Purchase {
  id: string
  productName: string
  category: PurchaseCategory
  purchasedAt: string
  orderStatus: string
  downloadStatus: string
}

export interface CustomerProject {
  id: string
  name: string
  type: string
  progress: number
  stage: ProjectStage
  expectedCompletion: string
  actionRequired: ActionKind | null
  status: ProjectTab
}

export interface Proposal {
  id: string
  title: string
  status: ProposalTab
  submittedAt: string
  summary: string
  scope: string
  outOfScope: string
  deliverables: string
  timeline: string
  price: string
  paymentSchedule: string
  revisionPolicy: string
  validity: string
}

export interface ActionRequired {
  id: string
  kind: ActionKind
  title: string
  projectName: string
  dueAt: string | null
}

export interface PaymentRecord {
  id: string
  label: string
  paidAt: string
  status: string
}

export interface SupportTicket {
  id: string
  category: string
  submittedAt: string
  status: TicketStatus
  summary: string
}

export interface PortalNotification {
  id: string
  category: NotificationCategory
  title: string
  at: string
}

export interface ActivityItem {
  id: string
  title: string
  at: string
}

export interface PortalFile {
  id: string
  name: string
  at: string
}
