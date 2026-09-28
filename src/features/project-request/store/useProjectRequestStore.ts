import { create } from 'zustand'
import type { BudgetRange, CurrentStatus, FeatureOption, ProjectGoal, ProjectReference, ProjectRequestContact, ProjectRequestDraft, ProjectType, TargetUser, TimelineOption } from '../types'

const emptyContact: ProjectRequestContact = { name: '', email: '', phone: '', company: '' }

const initial: ProjectRequestDraft = {
  currentStep: 0,
  projectType: null,
  currentStatus: null,
  goals: [],
  targetUsers: [],
  targetUserDescription: '',
  features: [],
  description: '',
  timeline: null,
  desiredCompletionDate: '',
  budget: null,
  references: [],
  contact: emptyContact,
}

function toggle<T extends string>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

type ProjectRequestStore = ProjectRequestDraft & {
  setStep: (currentStep: number) => void
  setProjectType: (projectType: ProjectType) => void
  setCurrentStatus: (currentStatus: CurrentStatus) => void
  toggleGoal: (goal: ProjectGoal) => void
  toggleTargetUser: (targetUser: TargetUser) => void
  setTargetUserDescription: (targetUserDescription: string) => void
  toggleFeature: (feature: FeatureOption) => void
  setDescription: (description: string) => void
  setTimeline: (timeline: TimelineOption) => void
  setDesiredCompletionDate: (desiredCompletionDate: string) => void
  setBudget: (budget: BudgetRange) => void
  addReference: () => void
  updateReference: (id: string, patch: Partial<Pick<ProjectReference, 'url' | 'note'>>) => void
  removeReference: (id: string) => void
  setContact: (patch: Partial<ProjectRequestContact>) => void
}

export const useProjectRequestStore = create<ProjectRequestStore>((set) => ({
  ...initial,
  setStep: (currentStep) => set({ currentStep }),
  setProjectType: (projectType) => set({ projectType }),
  setCurrentStatus: (currentStatus) => set({ currentStatus }),
  toggleGoal: (goal) => set((state) => ({ goals: toggle(state.goals, goal) })),
  toggleTargetUser: (targetUser) => set((state) => ({ targetUsers: toggle(state.targetUsers, targetUser) })),
  setTargetUserDescription: (targetUserDescription) => set({ targetUserDescription }),
  toggleFeature: (feature) => set((state) => ({ features: toggle(state.features, feature) })),
  setDescription: (description) => set({ description: description.slice(0, 3000) }),
  setTimeline: (timeline) => set({ timeline }),
  setDesiredCompletionDate: (desiredCompletionDate) => set({ desiredCompletionDate }),
  setBudget: (budget) => set({ budget }),
  addReference: () =>
    set((state) => ({
      references: [...state.references, { id: crypto.randomUUID(), url: '', note: '' }],
    })),
  updateReference: (id, patch) =>
    set((state) => ({
      references: state.references.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })),
  removeReference: (id) => set((state) => ({ references: state.references.filter((item) => item.id !== id) })),
  setContact: (patch) => set((state) => ({ contact: { ...state.contact, ...patch } })),
}))

export function stepError(draft: ProjectRequestDraft): string | null {
  switch (draft.currentStep) {
    case 0:
      return draft.projectType ? null : '프로젝트 유형을 선택해 주세요.'
    case 1:
      return draft.currentStatus ? null : '현재 상태를 선택해 주세요.'
    case 5:
      return draft.description.length <= 3000 ? null : '설명은 3000자 이하여야 합니다.'
    case 6:
      return draft.timeline ? null : '일정을 선택해 주세요.'
    case 7:
      return draft.budget ? null : '예산을 선택해 주세요.'
    case 9: {
      const name = draft.contact.name.trim()
      const email = draft.contact.email.trim()
      if (name.length < 1) return '이름을 입력해 주세요.'
      if (!email.includes('@') || email.length > 200) return '이메일 형식을 확인해 주세요.'
      return null
    }
    default:
      return null
  }
}
