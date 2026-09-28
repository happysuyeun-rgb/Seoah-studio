import type { ProposalLineItem } from './types'

export function formatKrw(amount: number) {
  const value = Number.isFinite(amount) ? amount : 0
  return `${new Intl.NumberFormat('ko-KR').format(value)}원`
}

export function priceSummary(items: ProposalLineItem[], vatRate = 0.1) {
  const subtotal = items.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0)
  const vat = Math.round(subtotal * vatRate)
  return { subtotal, vat, total: subtotal + vat }
}
