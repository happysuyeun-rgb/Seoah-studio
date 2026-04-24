import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID
if (GA_ID && typeof window !== 'undefined') {
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  ;(window as { dataLayer?: unknown[] }).dataLayer = (window as { dataLayer?: unknown[] }).dataLayer ?? []
  ;(window as { gtag?: (...a: unknown[]) => void }).gtag = function gtag(...a: unknown[]) {
    (window as { dataLayer?: unknown[] }).dataLayer?.push(a)
  }
  ;(window as { gtag?: (...a: unknown[]) => void }).gtag!('js', new Date())
  ;(window as { gtag?: (...a: unknown[]) => void }).gtag!('config', GA_ID)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
