import type { ActionRequired, CustomerProject, PaymentRecord, PortalFile, PortalNotification, Proposal, Purchase, SupportTicket } from './types'

/** Development fixtures. Portal pages do not render these. */
export const mockPurchases: Purchase[] = [
  {
    id: 'purchase-example',
    productName: 'Example Ready Site',
    category: 'Ready',
    purchasedAt: '2026-01-01',
    orderStatus: 'paid',
    downloadStatus: 'ready',
  },
]

export const mockProjects: CustomerProject[] = [
  {
    id: 'project-example',
    name: 'Example Project',
    type: 'Website',
    progress: 40,
    stage: '디자인',
    expectedCompletion: '2026-06-01',
    actionRequired: 'REVIEW_REQUIRED',
    status: 'active',
  },
]

export const mockProposals: Proposal[] = [
  {
    id: 'proposal-example',
    title: 'Example Proposal',
    status: 'awaiting_review',
    submittedAt: '2026-01-01',
    summary: '',
    scope: '',
    outOfScope: '',
    deliverables: '',
    timeline: '',
    price: '',
    paymentSchedule: '',
    revisionPolicy: '',
    validity: '',
  },
]

export const mockActions: ActionRequired[] = [
  {
    id: 'action-example',
    kind: 'REVIEW_REQUIRED',
    title: 'Example review',
    projectName: 'Example Project',
    dueAt: null,
  },
]

export const mockPayments: PaymentRecord[] = []

export const mockTickets: SupportTicket[] = []

export const mockNotifications: PortalNotification[] = []

export const mockFiles: PortalFile[] = []
