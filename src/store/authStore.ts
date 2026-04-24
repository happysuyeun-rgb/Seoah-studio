import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

const DEV_MOCK_USER_ID = 'dev-user-001'

/** 개발 환경에서만 사용. dev-login 시 목업 유저/세션 반환 (Supabase 불필요 시 fallback) */
export function getDevMockAuth(): { user: SupabaseUser; session: Session } | null {
  if (import.meta.env.DEV && typeof localStorage !== 'undefined' && localStorage.getItem('dev-login') === 'true') {
    const user = {
      id: DEV_MOCK_USER_ID,
      email: 'test@seoah.studio',
      user_metadata: { name: '테스트 유저', avatar_url: null },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as SupabaseUser
    const session = {
      access_token: 'dev-mock-token',
      refresh_token: 'dev-mock-refresh',
      user,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      expires_in: 3600,
      token_type: 'bearer',
    } as Session
    return { user, session }
  }
  return null
}

export const DEV_MOCK_USER_ID_CONST = DEV_MOCK_USER_ID

interface AuthState {
  user: SupabaseUser | null
  session: Session | null
  isLoading: boolean
  setUser: (user: SupabaseUser | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    if (import.meta.env.DEV && typeof localStorage !== 'undefined' && localStorage.getItem('dev-login') === 'true') {
      localStorage.removeItem('dev-login')
      localStorage.removeItem('dev-admin')
      set({ user: null, session: null })
      return
    }
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
