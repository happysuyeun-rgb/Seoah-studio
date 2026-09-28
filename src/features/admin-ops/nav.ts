export const adminNav = [
  { group: 'Overview', items: [{ label: 'Dashboard', to: '/admin/dashboard' }] },
  {
    group: 'Sales',
    items: [
      { label: 'Leads', to: '/admin/leads' },
      { label: 'Proposals', to: '/admin/proposals' },
      { label: 'Contracts', to: '/admin/contracts' },
    ],
  },
  {
    group: 'Delivery',
    items: [
      { label: 'Projects', to: '/admin/engagements' },
      { label: 'Intake', to: '/admin/intake' },
    ],
  },
  {
    group: 'Commerce',
    items: [
      { label: 'Products', to: '/admin/products' },
      { label: 'Orders', to: '/admin/orders' },
      { label: 'Payments', to: '/admin/payments' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Care', to: '/admin/care' },
      { label: 'Support', to: '/admin/support' },
    ],
  },
  {
    group: 'Platform',
    items: [
      { label: 'SaaS', to: '/admin/saas' },
      { label: 'Chatbot', to: '/admin/chatbot' },
      { label: 'Content', to: '/admin/content' },
      { label: 'Analytics', to: '/admin/analytics' },
    ],
  },
  {
    group: 'System',
    items: [
      { label: 'Customers', to: '/admin/customers' },
      { label: 'Settings', to: '/admin/settings' },
      { label: 'Legacy Admin', to: '/admin', end: true },
    ],
  },
] as const

export function isAdminNavActive(pathname: string, to: string, end = false) {
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}
