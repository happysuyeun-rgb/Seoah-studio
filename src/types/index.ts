export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  provider: string | null
  created_at: string
}

export interface Template {
  id: string
  name: string
  category: string
  thumbnail_url: string | null
  html_template: string
  variables: Record<string, unknown> | null
  tags: string[] | null
  preview_html?: string | null
  is_active: boolean
  created_at: string
}

/** 갤러리/상세용 (html_template 제외, templates_public 뷰) */
export type TemplatePublic = Omit<Template, 'html_template'>

export interface Project {
  id: string
  user_id: string
  template_id: string
  status: 'draft' | 'parsing' | 'ready' | 'pending_payment' | 'paid' | 'fulfilled' | 'error'
  input_data: { fileUrls?: string[]; textInput?: string } | null
  output_html: string | null
  custom_params: Record<string, unknown> | null
  deleted_at: string | null
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  project_id: string
  plan_type: string
  amount: number
  payment_key: string | null
  imp_uid: string | null
  status: string
  created_at: string
}

export interface Download {
  id: string
  order_id: string
  file_type: string
  file_url: string | null
  downloaded_at: string
}

export type TemplateCategory = 'portfolio' | 'homepage' | 'app-mvp'

export const CATEGORIES: { id: TemplateCategory; label: string; desc: string }[] = [
  { id: 'portfolio', label: '포트폴리오', desc: '개인·팀 포트폴리오 원페이지' },
  { id: 'homepage', label: '홈페이지', desc: '서비스·스타트업 메인 랜딩' },
  { id: 'app-mvp', label: '앱 MVP', desc: 'SaaS·앱 소개 원페이지' },
]
