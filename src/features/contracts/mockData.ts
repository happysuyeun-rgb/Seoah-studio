import { contractSectionTitles, type Contract } from './types'

const placeholder = '문구는 확정되지 않았습니다. 이 항목은 구조만 보여 줍니다.'

export const mockContracts: Contract[] = [
  {
    id: 'example-contract-1',
    proposalId: 'example-proposal-1',
    customer: 'Example Customer',
    company: 'Example Co',
    projectName: 'Example Website',
    status: 'SENT',
    version: 1,
    versions: [{ id: 'example-contract-1-v1', contractId: 'example-contract-1', version: 1, createdAt: '2026-09-28' }],
    sentAt: '2026-09-28',
    agreedAt: null,
    sections: contractSectionTitles.map((title, index) => ({
      id: `section-${index + 1}`,
      title,
      body: placeholder,
    })),
    deposit: {
      amount: 1650000,
      dueDate: '2026-10-20',
      method: '안내 예정',
      status: 'Required',
    },
  },
]
