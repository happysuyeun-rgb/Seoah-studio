import type { ProposalTab } from '../my-seoa/types'
import type { ProposalStatus } from './types'

/** Customer tabs stay on the portal vocabulary. Domain status is mapped only for display. */
export function customerProposalTab(status: ProposalStatus): ProposalTab | null {
  switch (status) {
    case 'SENT':
    case 'VIEWED':
    case 'REVISION_REQUESTED':
      return 'awaiting_review'
    case 'APPROVED':
      return 'approved'
    case 'REJECTED':
      return 'rejected'
    case 'EXPIRED':
      return 'expired'
    case 'DRAFT':
      return null
    default:
      return null
  }
}
