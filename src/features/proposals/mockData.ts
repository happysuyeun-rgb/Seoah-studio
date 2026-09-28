import type { Proposal } from './types'

const createdAt = '2026-09-28'

function content(partial: Proposal['content']): Proposal['content'] {
  return partial
}

export const mockProposals: Proposal[] = [
  {
    id: 'example-proposal-1',
    status: 'SENT',
    createdAt,
    leadId: 'example-lead-1',
    currentVersion: 1,
    versions: [
      {
        id: 'example-proposal-1-v1',
        proposalId: 'example-proposal-1',
        version: 1,
        createdAt,
        snapshot: content({
          title: 'Example Website Proposal',
          customer: 'Example Customer',
          company: 'Example Co',
          projectName: 'Example Website',
          validUntil: '2026-10-15',
          summary: 'Example summary. This fixture is only loaded in development.',
          goals: ['서비스 출시', '문의 전환'],
          scope: [{ id: 'scope-1', title: 'Planning', description: 'Example included scope.' }],
          outOfScope: [{ id: 'out-1', title: 'Content Production', description: 'Example exclusion.' }],
          deliverables: [{ id: 'del-1', title: 'Responsive Web', description: 'Example deliverable.' }],
          timeline: [{ id: 'phase-1', name: 'Design', duration: '2주', description: 'Example phase.' }],
          lineItems: [{ id: 'line-1', item: 'Design and build', description: 'Example line', amount: 3000000 }],
          paymentSchedule: [{ id: 'pay-1', label: '계약금', portion: '50%', dueCondition: '계약 체결 후' }],
          revision: {
            planning: 'Planning revision example.',
            design: 'Design revision example.',
            development: 'QA and bug example.',
            bundleNote: '수정 1회는 한 번에 전달한 피드백 묶음입니다.',
          },
          support: 'Example support note. Not a fixed warranty.',
          internalNotes: 'Example internal note. Do not show this to the customer.',
        }),
      },
    ],
    content: {
      title: 'Example Website Proposal',
      customer: 'Example Customer',
      company: 'Example Co',
      projectName: 'Example Website',
      validUntil: '2026-10-15',
      summary: 'Example summary. This fixture is only loaded in development.',
      goals: ['서비스 출시', '문의 전환'],
      scope: [{ id: 'scope-1', title: 'Planning', description: 'Example included scope.' }],
      outOfScope: [{ id: 'out-1', title: 'Content Production', description: 'Example exclusion.' }],
      deliverables: [{ id: 'del-1', title: 'Responsive Web', description: 'Example deliverable.' }],
      timeline: [{ id: 'phase-1', name: 'Design', duration: '2주', description: 'Example phase.' }],
      lineItems: [{ id: 'line-1', item: 'Design and build', description: 'Example line', amount: 3000000 }],
      paymentSchedule: [{ id: 'pay-1', label: '계약금', portion: '50%', dueCondition: '계약 체결 후' }],
      revision: {
        planning: 'Planning revision example.',
        design: 'Design revision example.',
        development: 'QA and bug example.',
        bundleNote: '수정 1회는 한 번에 전달한 피드백 묶음입니다.',
      },
      support: 'Example support note. Not a fixed warranty.',
      internalNotes: 'Example internal note. Do not show this to the customer.',
    },
  },
  {
    id: 'example-proposal-2',
    status: 'DRAFT',
    createdAt: '2026-09-27',
    leadId: null,
    currentVersion: 1,
    versions: [],
    content: {
      title: 'Example Draft Proposal',
      customer: 'Example Founder',
      company: 'Example Studio',
      projectName: 'Example MVP',
      validUntil: '',
      summary: 'Draft example. Not sent to a customer.',
      goals: [],
      scope: [],
      outOfScope: [],
      deliverables: [],
      timeline: [],
      lineItems: [],
      paymentSchedule: [],
      revision: { planning: '', design: '', development: '', bundleNote: '' },
      support: '',
      internalNotes: 'Draft only.',
    },
  },
]
