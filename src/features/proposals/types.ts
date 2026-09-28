export const proposalStatuses = ['DRAFT', 'SENT', 'VIEWED', 'REVISION_REQUESTED', 'APPROVED', 'REJECTED', 'EXPIRED'] as const
export type ProposalStatus = (typeof proposalStatuses)[number]

export type ProposalSection = {
  id: string
  title: string
  description: string
}

export type ProposalLineItem = {
  id: string
  item: string
  description: string
  amount: number
}

export type ProposalTimelinePhase = {
  id: string
  name: string
  duration: string
  description: string
}

export type PaymentScheduleItem = {
  id: string
  label: string
  portion: string
  dueCondition: string
}

export const revisionKinds = ['SCOPE_IN', 'MINOR_CHANGE', 'CHANGE_REQUEST', 'BUG'] as const
export type RevisionKind = (typeof revisionKinds)[number]

export type RevisionPolicy = {
  planning: string
  design: string
  development: string
  bundleNote: string
}

export type ProposalContent = {
  title: string
  customer: string
  company: string
  projectName: string
  validUntil: string
  summary: string
  goals: string[]
  scope: ProposalSection[]
  outOfScope: ProposalSection[]
  deliverables: ProposalSection[]
  timeline: ProposalTimelinePhase[]
  lineItems: ProposalLineItem[]
  paymentSchedule: PaymentScheduleItem[]
  revision: RevisionPolicy
  support: string
  internalNotes: string
}

export type ProposalVersion = {
  id: string
  proposalId: string
  version: number
  createdAt: string
  snapshot: ProposalContent
}

export type Proposal = {
  id: string
  status: ProposalStatus
  createdAt: string
  leadId: string | null
  currentVersion: number
  versions: ProposalVersion[]
  content: ProposalContent
}

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  REVISION_REQUESTED: 'Revision Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
}

export function emptyContent(): ProposalContent {
  return {
    title: '',
    customer: '',
    company: '',
    projectName: '',
    validUntil: '',
    summary: '',
    goals: [],
    scope: [],
    outOfScope: [],
    deliverables: [],
    timeline: [],
    lineItems: [],
    paymentSchedule: [],
    revision: { planning: '', design: '', development: '', bundleNote: '' },
    support: '',
    internalNotes: '',
  }
}

export function blankProposal(): Proposal {
  const id = 'local-draft'
  const createdAt = new Date().toISOString().slice(0, 10)
  const content = emptyContent()
  return {
    id,
    status: 'DRAFT',
    createdAt,
    leadId: null,
    currentVersion: 1,
    versions: [{ id: `${id}-v1`, proposalId: id, version: 1, createdAt, snapshot: content }],
    content,
  }
}
