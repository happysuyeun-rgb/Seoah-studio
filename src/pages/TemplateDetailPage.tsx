import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useProjectStore } from '../store/projectStore'
import type { TemplatePublic } from '../types'
import { getMockTemplatePublicById } from '../mocks/templatesMock'

type Viewport = 'desktop' | 'tablet' | 'mobile'
const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: '1280px',
  tablet: '768px',
  mobile: '375px',
}

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setSelectedTemplateId } = useProjectStore()
  const [viewport, setViewport] = useState<Viewport>('desktop')

  const { data: template, isLoading } = useQuery({
    queryKey: ['template_public', id],
    queryFn: async () => {
      if (!id) return null
      if (!isSupabaseConfigured) {
        return getMockTemplatePublicById(id)
      }
      const { data, error } = await supabase.from('templates_public').select('*').eq('id', id).single()
      if (error) throw error
      return data as TemplatePublic
    },
    enabled: !!id,
  })

  const html = (template?.preview_html ?? '') as string

  useEffect(() => {
    document.title = template ? `${template.name} — SEOAH.STUDIO` : '템플릿 상세 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [template?.name])

  const handleUseTemplate = () => {
    if (id) {
      setSelectedTemplateId(id)
      navigate('/project/upload')
    }
  }

  if (!id || isLoading || !template) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="min-h-[44px] text-sm text-gray-600 hover:underline"
          aria-label="목록으로 돌아가기"
        >
          ← 목록
        </button>
        <div className="flex gap-2">
          {(['desktop', 'tablet', 'mobile'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setViewport(v)}
              aria-label={v === 'desktop' ? '데스크탑 뷰로 전환' : v === 'tablet' ? '태블릿 뷰로 전환' : '모바일 뷰로 전환'}
              className={`min-h-[44px] rounded px-3 py-1.5 text-xs font-medium ${
                viewport === v ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {v === 'desktop' ? '데스크톱(1280px)' : v === 'tablet' ? '태블릿(768px)' : '모바일(375px)'}
            </button>
          ))}
        </div>
      </div>
      <div
        className="mx-auto max-h-[600px] min-h-[400px] overflow-auto rounded-lg border border-gray-200 bg-white transition-[max-width] duration-200"
        style={{ maxWidth: VIEWPORT_WIDTHS[viewport] }}
      >
        {html ? (
          <iframe
            title="템플릿 미리보기"
            srcDoc={html}
            sandbox="allow-scripts allow-same-origin"
            className="h-full min-h-[500px] w-full"
          />
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-gray-500">
            {template.thumbnail_url ? (
              <img src={template.thumbnail_url} alt={template.name} className="max-h-[400px] rounded object-contain" />
            ) : null}
            <p className="text-sm">미리보기는 템플릿 사용 후 확인할 수 있습니다.</p>
          </div>
        )}
      </div>
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleUseTemplate}
          className="min-h-[44px] rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90"
        >
          이 템플릿으로 시작하기
        </button>
      </div>
    </main>
  )
}
