export const projectTypes = ['website', 'brand-website', 'mvp', 'ai', 'internal', 'unsure'] as const
export type ProjectType = (typeof projectTypes)[number]

export const currentStatuses = ['idea', 'plan', 'requirements', 'design', 'existing', 'in-development', 'improvement'] as const
export type CurrentStatus = (typeof currentStatuses)[number]

export const projectGoals = [
  'company',
  'inquiry',
  'launch',
  'reservation',
  'commerce',
  'members',
  'internal',
  'demo',
  'automation',
  'other',
] as const
export type ProjectGoal = (typeof projectGoals)[number]

export const targetUsers = ['consumer', 'business', 'staff', 'admin', 'partner', 'seller', 'multi', 'other'] as const
export type TargetUser = (typeof targetUsers)[number]

export const featureOptions = [
  'login',
  'profile',
  'content',
  'search',
  'inquiry',
  'reservation',
  'payment',
  'notification',
  'upload',
  'admin',
  'dashboard',
  'statistics',
  'ai',
  'api',
  'realtime',
  'multi-role',
  'approval',
  'invitation',
  'organization',
  'subscription',
] as const
export type FeatureOption = (typeof featureOptions)[number]

export const timelineOptions = ['asap', 'one-month', 'one-two', 'three-months', 'discuss'] as const
export type TimelineOption = (typeof timelineOptions)[number]

export const budgetRanges = ['under-100', '100-300', '300-500', '500-800', '800-1200', 'over-1200', 'unknown'] as const
export type BudgetRange = (typeof budgetRanges)[number]

export type ProjectReference = {
  id: string
  url: string
  note: string
}

export type ProjectRequestContact = {
  name: string
  email: string
  phone: string
  company: string
}

export type ProjectRequestDraft = {
  currentStep: number
  projectType: ProjectType | null
  currentStatus: CurrentStatus | null
  goals: ProjectGoal[]
  targetUsers: TargetUser[]
  targetUserDescription: string
  features: FeatureOption[]
  description: string
  timeline: TimelineOption | null
  desiredCompletionDate: string
  budget: BudgetRange | null
  references: ProjectReference[]
  contact: ProjectRequestContact
}
