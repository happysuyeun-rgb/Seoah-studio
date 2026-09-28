export const leadStatuses = ['NEW', 'CONTACTED', 'CONSULTATION', 'PROPOSAL', 'WON', 'LOST'] as const
export type LeadStatus = (typeof leadStatuses)[number]

export const recommendedPaths = ['Ready', 'Ready + Custom', 'Full Custom Website', 'MVP / Product', 'Not Fit'] as const
export type RecommendedPath = (typeof recommendedPaths)[number]

export type LeadReference = {
  url: string
  note: string
}

export type Lead = {
  id: string
  name: string
  email: string
  company: string
  phone: string
  projectType: string
  currentStatus: string
  goals: string[]
  budget: string
  timeline: string
  status: LeadStatus
  createdAt: string
  targetUsers: string[]
  features: string[]
  description: string
  references: LeadReference[]
}

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  CONSULTATION: 'Consultation',
  PROPOSAL: 'Proposal',
  WON: 'Won',
  LOST: 'Lost',
}
