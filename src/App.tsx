import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from './lib/supabase'
import { useAuthStore, getDevMockAuth } from './store/authStore'
import { AppShell } from './components/shell/AppShell'
import { AdminFrame } from './components/shell/AdminFrame'
import { DevFloatingButtons } from './components/DevFloatingButtons'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toast } from './components/Toast'
import { HomePage } from './pages/HomePage'
import { ReadyPage } from './pages/ReadyPage'
import { BrandPage } from './pages/BrandPage'
import { StudioPage } from './pages/StudioPage'
import { CarePage } from './pages/CarePage'
import { SaasPage } from './pages/SaasPage'
import { WorkPage } from './pages/WorkPage'
import { AboutPage } from './pages/AboutPage'
import { FaqPage } from './pages/FaqPage'
import { ContactPage } from './pages/ContactPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { AccountTypePage } from './pages/AccountTypePage'
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
import { MySeoLayout } from './features/my-seoa/layouts/MySeoLayout'
import { DashboardPage } from './features/my-seoa/pages/DashboardPage'
import { PurchasesPage } from './features/my-seoa/pages/PurchasesPage'
import { PurchaseDetailPage } from './features/my-seoa/pages/PurchaseDetailPage'
import { ProjectsPage } from './features/my-seoa/pages/ProjectsPage'
import { ProjectDetailPage } from './features/my-seoa/pages/ProjectDetailPage'
import { ProposalDetailPage, ProposalsPage } from './features/my-seoa/pages/ProposalsPage'
import { BillingPage } from './features/my-seoa/pages/BillingPage'
import { MySupportPage } from './features/my-seoa/pages/MySupportPage'
import { NotificationsPage } from './features/my-seoa/pages/NotificationsPage'
import { AccountPage } from './features/my-seoa/pages/AccountPage'
import { ProjectRequestPage } from './features/project-request/pages/ProjectRequestPage'
import { LeadDetailPage } from './features/leads/pages/LeadDetailPage'
import { LeadListPage } from './features/leads/pages/LeadListPage'
import { AdminProposalDetailPage } from './features/proposals/pages/AdminProposalDetailPage'
import { AdminProposalEditorPage } from './features/proposals/pages/AdminProposalEditorPage'
import { AdminProposalListPage } from './features/proposals/pages/AdminProposalListPage'
import { AdminContractDetailPage } from './features/contracts/pages/AdminContractDetailPage'
import { AdminContractListPage } from './features/contracts/pages/AdminContractListPage'
import { CustomerContractPage } from './features/contracts/pages/CustomerContractPage'
import { AdminEngagementDetailPage } from './features/engagements/pages/AdminEngagementDetailPage'
import { AdminEngagementListPage } from './features/engagements/pages/AdminEngagementListPage'

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
  return (
    <AppShell>
      <DevFloatingButtons />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ready" element={<ReadyPage />} />
        <Route path="/brand" element={<BrandPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/studio/request" element={<ProjectRequestPage />} />
        <Route path="/care" element={<CarePage />} />
        <Route path="/saas" element={<SaasPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/account-type" element={<AccountTypePage />} />
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
        <Route
          path="/my"
          element={
            <ProtectedRoute>
              <MySeoLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="purchases" element={<PurchasesPage />} />
          <Route path="purchases/:id" element={<PurchaseDetailPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="proposals" element={<ProposalsPage />} />
          <Route path="proposals/:id" element={<ProposalDetailPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="support" element={<MySupportPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="contracts/:id" element={<CustomerContractPage />} />
        </Route>
        <Route path="/support" element={<SupportPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/refund" element={<RefundPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminFrame />
            </AdminRoute>
          }
        >
          <Route index element={<AdminPage />} />
          <Route path="leads" element={<LeadListPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="proposals" element={<AdminProposalListPage />} />
          <Route path="proposals/new" element={<AdminProposalEditorPage />} />
          <Route path="proposals/:id" element={<AdminProposalDetailPage />} />
          <Route path="proposals/:id/edit" element={<AdminProposalEditorPage />} />
          <Route path="contracts" element={<AdminContractListPage />} />
          <Route path="contracts/:id" element={<AdminContractDetailPage />} />
          <Route path="engagements" element={<AdminEngagementListPage />} />
          <Route path="engagements/:id" element={<AdminEngagementDetailPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toast />
    </AppShell>
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
