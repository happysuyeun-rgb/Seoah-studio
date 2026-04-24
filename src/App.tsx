import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from './lib/supabase'
import { useAuthStore, getDevMockAuth } from './store/authStore'
import { GNB } from './components/GNB'
import { ChatbotWidget } from './components/ChatbotWidget'
import { DevFloatingButtons } from './components/DevFloatingButtons'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toast } from './components/Toast'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { TemplateGalleryPage } from './pages/TemplateGalleryPage'
import { TemplateDetailPage } from './pages/TemplateDetailPage'
import { UploadPage } from './pages/UploadPage'
import { CustomizePage } from './pages/CustomizePage'
import { PreviewPage } from './pages/PreviewPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { PaymentSuccessPage } from './pages/PaymentSuccessPage'
import { PaymentFailPage } from './pages/PaymentFailPage'
import { MyPage } from './pages/MyPage'
import { AdminPage } from './pages/AdminPage'
import { SupportPage } from './pages/SupportPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { RefundPage } from './pages/RefundPage'
import { MyPageSettingsPage } from './pages/MyPageSettingsPage'
import { RefundRequestPage } from './pages/RefundRequestPage'
import { Footer } from './components/Footer'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

function AuthListener() {
  const setUser = useAuthStore((s) => s.setUser)
  const setSession = useAuthStore((s) => s.setSession)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    const devMock = getDevMockAuth()
    if (devMock) {
      setSession(devMock.session)
      setUser(devMock.user)
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (getDevMockAuth()) return
      setSession(session)
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [setUser, setSession, setLoading])

  return null
}

function AppRoutes() {
  const location = useLocation()
  const hideFooter = location.pathname.startsWith('/admin')

  return (
    <>
      <GNB />
      <ChatbotWidget />
      <DevFloatingButtons />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/templates/:category" element={<TemplateGalleryPage />} />
        <Route path="/templates/detail/:id" element={<TemplateDetailPage />} />
        <Route
          path="/project/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/customize"
          element={
            <ProtectedRoute>
              <CustomizePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/preview"
          element={
            <ProtectedRoute>
              <PreviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route path="/payment/fail" element={<PaymentFailPage />} />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage/settings"
          element={
            <ProtectedRoute>
              <MyPageSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage/refund/:orderId"
          element={
            <ProtectedRoute>
              <RefundRequestPage />
            </ProtectedRoute>
          }
        />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/refund" element={<RefundPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!hideFooter && <Footer />}
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthListener />
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
