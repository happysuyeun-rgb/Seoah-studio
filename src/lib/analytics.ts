/**
 * GA4 이벤트 추적 (VITE_GA4_MEASUREMENT_ID 설정 시 사용)
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | undefined>
): void {
  if (typeof window === 'undefined' || !GA_ID || !window.gtag) return
  window.gtag('event', eventName, params)
}

export const analytics = {
  templateSelected: (category: string, templateId: string) =>
    trackEvent('template_selected', { category, template_id: templateId }),
  customizeStarted: (projectId: string) => trackEvent('customize_started', { project_id: projectId }),
  paymentStarted: (planType: string, amount: number) =>
    trackEvent('payment_started', { plan_type: planType, amount }),
  paymentCompleted: (planType: string, amount: number) =>
    trackEvent('payment_completed', { plan_type: planType, amount }),
  fileDownloaded: (fileType: string) => trackEvent('file_downloaded', { file_type: fileType }),
}
