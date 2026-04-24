/**
 * 관리자 템플릿 탭 — 미리보기 전체 재생성 버튼
 * 기존 템플릿 preview_html 일괄 재생성, templates.preview_html 컬럼 업데이트
 */
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toast } from '../store/toastStore'
import DOMPurify from 'dompurify'

const DEMO_DATA: Record<string, string> = {
  company: 'DEMO COMPANY',
  headline: '당신의 비즈니스를 알려주세요',
  description: 'AI가 분석해 맞춤형 랜딩을 만들어 드립니다.',
  cta: '시작하기',
  color_primary: '#1A4FA0',
  color_secondary: '#E8EEFA',
  feature_1: '기능 1',
  feature_2: '기능 2',
  feature_3: '기능 3',
  contact: 'contact@demo.com',
  font_hint: 'Noto Sans KR',
  logo_url: '',
}

function buildPreviewHtml(htmlTemplate: string) {
  let out = htmlTemplate
  for (const [k, v] of Object.entries(DEMO_DATA)) out = out.replaceAll(`{{${k}}}`, v)
  return DOMPurify.sanitize(out, { USE_PROFILES: { html: true }, FORBID_TAGS: ['script'] })
}

interface AdminPreviewRebuildButtonProps {
  templates: Array<{ id: string; html_template: string } | null>
  disabled?: boolean
  onRebuildingChange?: (v: boolean) => void
}

export function AdminPreviewRebuildButton({
  templates,
  disabled = false,
  onRebuildingChange,
}: AdminPreviewRebuildButtonProps) {
  const queryClient = useQueryClient()

  const handleRebuildAllPreviews = async () => {
    if (!window.confirm('모든 템플릿의 미리보기를 재생성하시겠습니까?')) return
    onRebuildingChange?.(true)
    try {
      for (const t of templates) {
        if (!t?.id || !t?.html_template) continue
        const previewHtml = buildPreviewHtml(t.html_template)
        const { error } = await supabase.rpc('admin_update_template_preview_html', {
          p_id: t.id,
          p_preview_html: previewHtml,
        })
        if (error) throw error
      }
      toast.success('미리보기가 재생성되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      onRebuildingChange?.(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleRebuildAllPreviews}
      disabled={disabled}
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      미리보기 전체 재생성
    </button>
  )
}
