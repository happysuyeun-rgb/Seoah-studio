/** 상품 종류. 기존 templates 행을 이 타입으로 옮기지 않는다. */
export const productTypes = ['READY', 'APX', 'BRAND', 'CARE', 'SAAS'] as const
export type ProductType = (typeof productTypes)[number]

export const productStatuses = ['DRAFT', 'ACTIVE', 'HIDDEN', 'ARCHIVED'] as const
export type ProductStatus = (typeof productStatuses)[number]

/** 나중에 legacy template 행을 가리킬 수 있는 자리. 이번 단계에서는 값을 만들지 않는다. */
export type ProductRecord = {
  id: string
  name: string
  type: ProductType
  status: ProductStatus
  priceLabel: string
  visibility: 'public' | 'hidden'
  updatedAt: string
  legacyTemplateId?: string
}

/** Legacy inquiry의 pending / replied 와 같지 않다. 연결 시 별도 mapper가 필요하다. */
export const supportStatuses = ['NEW', 'OPEN', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'] as const
export type SupportStatus = (typeof supportStatuses)[number]

export const supportCategories = ['pre_sales', 'customer', 'project'] as const
export type SupportCategory = (typeof supportCategories)[number]

/** Commerce 주문 결제와 Studio engagement 결제를 한 종류로 보지 않는다. */
export const paymentDomains = ['commerce_order', 'studio_engagement'] as const
export type PaymentDomain = (typeof paymentDomains)[number]

export const paymentBuckets = ['Pending', 'Paid', 'Overdue', 'Refunded'] as const
