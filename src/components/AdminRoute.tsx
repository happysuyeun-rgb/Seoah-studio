import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore, DEV_MOCK_USER_ID_CONST } from '../store/authStore'
import { ProtectedRoute } from './ProtectedRoute'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', user?.id, import.meta.env.DEV && typeof localStorage !== 'undefined' ? localStorage.getItem('dev-admin') : null],
    queryFn: async () => {
      if (!user?.id) return null
      if (import.meta.env.DEV && user.id === DEV_MOCK_USER_ID_CONST) {
        return { is_admin: typeof localStorage !== 'undefined' && localStorage.getItem('dev-admin') === 'true' }
      }
      const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
      return data as { is_admin?: boolean } | null
    },
    enabled: !!user?.id,
  })

  if (!user) {
    return <ProtectedRoute>{children}</ProtectedRoute>
  }
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }
  if (!profile?.is_admin) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
