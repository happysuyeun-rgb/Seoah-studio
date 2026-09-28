import type { BudgetRange, CurrentStatus, FeatureOption, ProjectGoal, ProjectType, TargetUser, TimelineOption } from './types'

export const requestStepCount = 11

export const projectTypeOptions: { id: ProjectType; title: string; description: string }[] = [
  { id: 'website', title: 'Website', description: '서비스와 회사를 설명하는 사이트.' },
  { id: 'brand-website', title: 'Brand + Website', description: '이름, 톤, 사이트를 한 범위로 정리합니다.' },
  { id: 'mvp', title: 'MVP / Web App', description: '핵심 기능만 먼저 쓰는 제품.' },
  { id: 'ai', title: 'AI Product', description: '모델과 업무 흐름이 연결된 제품.' },
  { id: 'internal', title: 'Internal Tool', description: '팀 안에서 반복 업무를 줄이는 도구.' },
  { id: 'unsure', title: '잘 모르겠어요', description: '범위는 다음 단계에서 함께 정리하면 됩니다.' },
]

export const currentStatusOptions: { id: CurrentStatus; title: string }[] = [
  { id: 'idea', title: '아이디어만 있음' },
  { id: 'plan', title: '사업계획 있음' },
  { id: 'requirements', title: '요구사항 정리됨' },
  { id: 'design', title: '디자인 있음' },
  { id: 'existing', title: '기존 서비스 있음' },
  { id: 'in-development', title: '개발 진행 중' },
  { id: 'improvement', title: '기존 제품 개선' },
]

export const goalOptions: { id: ProjectGoal; title: string }[] = [
  { id: 'company', title: '회사 소개' },
  { id: 'inquiry', title: '문의 / 상담 전환' },
  { id: 'launch', title: '서비스 출시' },
  { id: 'reservation', title: '예약' },
  { id: 'commerce', title: '판매 / 결제' },
  { id: 'members', title: '회원 서비스' },
  { id: 'internal', title: '내부 업무 효율화' },
  { id: 'demo', title: '투자 / 데모' },
  { id: 'automation', title: '운영 자동화' },
  { id: 'other', title: '기타' },
]

export const targetUserOptions: { id: TargetUser; title: string }[] = [
  { id: 'consumer', title: '일반 고객' },
  { id: 'business', title: '기업 고객' },
  { id: 'staff', title: '회사 직원' },
  { id: 'admin', title: '관리자' },
  { id: 'partner', title: '파트너' },
  { id: 'seller', title: '판매자' },
  { id: 'multi', title: '다수 역할' },
  { id: 'other', title: '기타' },
]

export const basicFeatures: { id: FeatureOption; title: string }[] = [
  { id: 'login', title: 'Login' },
  { id: 'profile', title: 'Profile' },
  { id: 'content', title: 'Content' },
  { id: 'search', title: 'Search' },
  { id: 'inquiry', title: 'Inquiry' },
  { id: 'reservation', title: 'Reservation' },
  { id: 'payment', title: 'Payment' },
  { id: 'notification', title: 'Notification' },
  { id: 'upload', title: 'File Upload' },
  { id: 'admin', title: 'Admin' },
  { id: 'dashboard', title: 'Dashboard' },
  { id: 'statistics', title: 'Statistics' },
]

export const advancedFeatures: { id: FeatureOption; title: string }[] = [
  { id: 'ai', title: 'AI' },
  { id: 'api', title: 'External API' },
  { id: 'realtime', title: 'Realtime' },
  { id: 'multi-role', title: 'Multi Role' },
  { id: 'approval', title: 'Approval' },
  { id: 'invitation', title: 'Invitation' },
  { id: 'organization', title: 'Organization' },
  { id: 'subscription', title: 'Subscription' },
]

export const timelineChoices: { id: TimelineOption; title: string }[] = [
  { id: 'asap', title: '가능한 빨리' },
  { id: 'one-month', title: '1개월 이내' },
  { id: 'one-two', title: '1~2개월' },
  { id: 'three-months', title: '3개월 이내' },
  { id: 'discuss', title: '일정 협의' },
]

export const budgetChoices: { id: BudgetRange; title: string }[] = [
  { id: 'under-100', title: '100만원 이하' },
  { id: '100-300', title: '100~300만원' },
  { id: '300-500', title: '300~500만원' },
  { id: '500-800', title: '500~800만원' },
  { id: '800-1200', title: '800~1,200만원' },
  { id: 'over-1200', title: '1,200만원 이상' },
  { id: 'unknown', title: '아직 모름' },
]

export function labelOf<T extends string>(options: { id: T; title: string }[], id: T | null) {
  if (!id) return '없음'
  return options.find((option) => option.id === id)?.title ?? '없음'
}

export function labelsOf<T extends string>(options: { id: T; title: string }[], ids: T[]) {
  if (ids.length === 0) return '없음'
  return ids.map((id) => options.find((option) => option.id === id)?.title ?? id).join(', ')
}
