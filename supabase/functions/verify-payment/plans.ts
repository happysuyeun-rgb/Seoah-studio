export const HTML_PRICE = 49000

export const SERVER_PLANS = {
  html: { amount: HTML_PRICE, active: true },
  url: { amount: 89000, active: false },
  pdf: { amount: 29000, active: false },
  ppt: { amount: 39000, active: false },
  figma: { amount: 69000, active: false },
} as const

export type PlanId = keyof typeof SERVER_PLANS

export type PlanDecision =
  | { ok: true; planType: 'html'; amount: number }
  | { ok: false; status: 400 | 409; code: 'INVALID_PLAN' | 'PLAN_NOT_AVAILABLE' }

export function resolvePlan(planType: string | undefined): PlanDecision {
  if (!planType || !(planType in SERVER_PLANS)) {
    return { ok: false, status: 400, code: 'INVALID_PLAN' }
  }
  const plan = SERVER_PLANS[planType as PlanId]
  if (!plan.active) return { ok: false, status: 409, code: 'PLAN_NOT_AVAILABLE' }
  return { ok: true, planType: 'html', amount: plan.amount }
}
