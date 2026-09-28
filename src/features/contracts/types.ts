/**
 * A future engagement may be created only after all three are complete:
 * Proposal Approved, Contract Agreed, and Deposit Paid.
 * This step does not create an engagement.
 */
export const contractStatuses = ['DRAFT', 'SENT', 'VIEWED', 'AGREED', 'DECLINED', 'EXPIRED'] as const
export type ContractStatus = (typeof contractStatuses)[number]

export type ContractSection = {
  id: string
  title: string
  body: string
}

export type AgreementState = {
  confirmed: boolean
  typedName: string
  agreedAt: string | null
}

export type ContractVersion = {
  id: string
  contractId: string
  version: number
  createdAt: string
}

export type Contract = {
  id: string
  proposalId: string
  customer: string
  company: string
  projectName: string
  status: ContractStatus
  version: number
  versions: ContractVersion[]
  sentAt: string | null
  agreedAt: string | null
  sections: ContractSection[]
  deposit: {
    amount: number
    dueDate: string
    method: string
    status: string
  }
}

export const contractStatusLabels: Record<ContractStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  AGREED: 'Agreed',
  DECLINED: 'Declined',
  EXPIRED: 'Expired',
}

export const contractSectionTitles = [
  'Purpose',
  'Scope',
  'Schedule',
  'Payment',
  'Customer Responsibilities',
  'Revision',
  'Delay',
  'Cancellation / Refund',
  'Intellectual Property',
  'Source Delivery',
  'Third-party License',
  'Confidentiality',
  'Portfolio Permission',
  'Support',
  'Termination',
] as const
