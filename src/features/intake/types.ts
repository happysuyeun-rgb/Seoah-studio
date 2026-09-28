export const intakeStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'AWAITING_REVIEW', 'NEEDS_REVISION', 'COMPLETED'] as const
export type IntakeStatus = (typeof intakeStatuses)[number]

export const intakeItemStatuses = ['NOT_STARTED', 'UPLOADED', 'UNDER_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'OPTIONAL'] as const
export type IntakeItemStatus = (typeof intakeItemStatuses)[number]

/**
 * API Key, Password, Private Token, Secret는 일반 입력란으로 받지 않는다.
 * 필요해지면 Secure Secret 방식을 따로 설계한다.
 */
export const SECRET_INTAKE_NOTE =
  'API Key, 비밀번호, 비공개 토큰은 이 양식에 입력하지 않습니다. 민감 정보는 이후 별도의 보안 입력으로 받습니다.'

export interface IntakeItem {
  id: string
  intakeId: string
  category: string
  title: string
  description: string
  required: boolean
  status: IntakeItemStatus
  customerResponse: string
  referenceUrl: string
  adminFeedback: string
}

export interface Intake {
  id: string
  engagementId: string
  status: IntakeStatus
  items: IntakeItem[]
}

export function intakeProgress(intake: Intake | null) {
  if (!intake) return { completed: 0, required: 0 }
  const required = intake.items.filter((item) => item.required)
  return {
    completed: required.filter((item) => item.status === 'APPROVED').length,
    required: required.length,
  }
}
