import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// env 없을 때도 앱이 흰 화면 없이 로드되도록 placeholder로 클라이언트 생성 (실제 API 호출은 실패)
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder-anon-key'

export const supabase: SupabaseClient = createClient(url, key)
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
