import type {
  ActionRequired,
  ActivityItem,
  CustomerProject,
  PaymentRecord,
  PortalFile,
  PortalNotification,
  Proposal,
  Purchase,
  SupportTicket,
} from './types'

/** Live portal lists stay empty until a later step reads the database. */
export const portalData: {
  purchases: Purchase[]
  projects: CustomerProject[]
  proposals: Proposal[]
  actions: ActionRequired[]
  payments: PaymentRecord[]
  tickets: SupportTicket[]
  notifications: PortalNotification[]
  activities: ActivityItem[]
  files: PortalFile[]
} = {
  purchases: [],
  projects: [],
  proposals: [],
  actions: [],
  payments: [],
  tickets: [],
  notifications: [],
  activities: [],
  files: [],
}
