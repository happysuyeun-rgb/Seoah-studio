import {
  advancedFeatures,
  basicFeatures,
  budgetChoices,
  currentStatusOptions,
  goalOptions,
  labelOf,
  labelsOf,
  projectTypeOptions,
  targetUserOptions,
  timelineChoices,
} from './options'
import type { ProjectRequestDraft } from './types'

export function buildRequestMessage(draft: ProjectRequestDraft) {
  const references = draft.references.filter((item) => item.url.trim() || item.note.trim())
  const referenceText =
    references.length === 0
      ? '없음'
      : references.map((item) => `- ${item.url.trim() || 'URL 없음'}${item.note.trim() ? ` (${item.note.trim()})` : ''}`).join('\n')
  const lines = [
    '[Studio 프로젝트 의뢰 초안]',
    `유형: ${labelOf(projectTypeOptions, draft.projectType)}`,
    `현재 상태: ${labelOf(currentStatusOptions, draft.currentStatus)}`,
    `목표: ${labelsOf(goalOptions, draft.goals)}`,
    `대상: ${labelsOf(targetUserOptions, draft.targetUsers)}`,
    `대상 설명: ${draft.targetUserDescription.trim() || '없음'}`,
    `기능: ${labelsOf([...basicFeatures, ...advancedFeatures], draft.features)}`,
    `일정: ${labelOf(timelineChoices, draft.timeline)}`,
    `희망 완료일: ${draft.desiredCompletionDate || '없음'}`,
    `예산: ${labelOf(budgetChoices, draft.budget)}`,
    `회사: ${draft.contact.company.trim() || '없음'}`,
    '참고:',
    referenceText,
    '설명:',
    draft.description.trim() || '없음',
  ]
  return lines.join('\n').slice(0, 3000)
}
