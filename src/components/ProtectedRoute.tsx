import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()
  const returnTo = location.state?.returnTo ?? location.pathname + location.search
  const searchReturnTo = new URLSearchParams(location.search).get('returnTo') ?? returnTo

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }
  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(searchReturnTo)}`} replace state={{ returnTo: searchReturnTo }} />
  }
  return <>{children}</>
}
