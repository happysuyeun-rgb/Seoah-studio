import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useProjectStore, getStoredProjectId } from '../store/projectStore'
import { toast } from '../store/toastStore'

type Viewport = 'desktop' | 'tablet' | 'mobile'
const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: '1280px',
  tablet: '768px',
  mobile: '375px',
}

export function PreviewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currentProjectId, setCurrentProjectId } = useProjectStore()
  const [editMode, setEditMode] = useState(false)
  const [viewport, setViewport] = useState<Viewport>('mobile')
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false)

  useEffect(() => {
    document.title = '미리보기 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])

  useEffect(() => {
    if (!currentProjectId) {
      const saved = getStoredProjectId()
      if (saved) setCurrentProjectId(saved)
    }
    setHasCheckedStorage(true)
  }, [currentProjectId, setCurrentProjectId])

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', currentProjectId],
    queryFn: async () => {
      if (!currentProjectId) return null
      const { data, error } = await supabase
        .from('projects')
        .select('output_html, custom_params, templates(name)')
        .eq('id', currentProjectId)
        .single()
      if (error) throw error
      return data as unknown as { output_html: string | null; custom_params: Record<string, unknown> | null; templates?: { name: string }[] | { name: string } | null }
    },
    enabled: !!currentProjectId,
  })

  const handleSaveEdit = async () => {
    if (!currentProjectId || !project?.output_html) return
    try {
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement | null
      const rawHtml = (iframe?.contentWindow?.document?.documentElement?.outerHTML) ?? project.output_html
      const newHtml = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } })
      const { error } = await supabase.from('projects').update({ output_html: newHtml }).eq('id', currentProjectId)
      if (error) throw error
      queryClient.invalidateQueries({ queryKey: ['project', currentProjectId] })
      setEditMode(false)
      toast.success('저장되었습니다.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '저장에 실패했습니다.')
    }
  }

  const handleCheckout = async () => {
    if (!currentProjectId) return
    try {
      const { error } = await supabase.from('projects').update({ status: 'pending_payment' }).eq('id', currentProjectId)
      if (error) throw error
      navigate('/project/checkout')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '결제 페이지로 이동할 수 없습니다.')
    }
  }

  if (hasCheckedStorage && !currentProjectId) {
    navigate('/project/upload', { replace: true })
    return null
  }
  if (!currentProjectId) return null

  if (isLoading || !project) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    )
  }

  const html = project.output_html ?? ''
  const editScript = editMode
    ? `<script>window.addEventListener("message",e=>{if(e.data==="enableEdit")document.querySelectorAll("p,h1,h2,h3,span,a,button").forEach(el=>el.contentEditable="true")});</script>`
    : ''

  return (
    <main className="flex h-[calc(100vh-3.5rem)] flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200">
        <div className="flex min-h-[44px] flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-2">
          <button type="button" onClick={() => navigate(-1)} className="min-h-[44px] text-sm text-gray-600 hover:underline" aria-label="뒤로 가기">
            ← 뒤로
          </button>
          <div className="flex flex-wrap items-center gap-2">
            {(['desktop', 'tablet', 'mobile'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setViewport(v)}
                aria-label={v === 'desktop' ? '데스크탑 뷰로 전환' : v === 'tablet' ? '태블릿 뷰로 전환' : '모바일 뷰로 전환'}
                className={`min-h-[44px] rounded px-2 py-1 text-xs ${viewport === v ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {v === 'desktop' ? '1280' : v === 'tablet' ? '768' : '375'}
              </button>
            ))}
            <span className="hidden text-gray-400 sm:inline">|</span>
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className="min-h-[44px] rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
            >
              {editMode ? '편집 완료' : '편집 모드'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={handleSaveEdit}
                className="min-h-[44px] rounded bg-primary px-3 py-1 text-sm text-white hover:bg-primary/90"
              >
                변경 저장
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-1 justify-center overflow-auto p-4 pb-52 md:pb-4">
          <div
            className="min-h-[calc(100vh-120px)] w-full transition-[max-width] duration-200"
            style={{ maxWidth: VIEWPORT_WIDTHS[viewport] }}
          >
            <iframe
              id="preview-iframe"
              title="미리보기"
              srcDoc={html + editScript}
              sandbox="allow-scripts allow-same-origin"
              className="min-h-[calc(100vh-120px)] w-full border-0"
            onLoad={() => {
              const el = document.getElementById('preview-iframe') as HTMLIFrameElement | null
              if (editMode && el?.contentWindow) el.contentWindow.postMessage('enableEdit', '*')
            }}
            />
          </div>
        </div>
      </div>
      <aside className="fixed bottom-0 left-0 right-0 z-10 w-full border-t border-gray-200 bg-gray-50 p-4 md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto md:w-[30%] md:min-w-[240px] md:max-h-[calc(100vh-3.5rem)] md:overflow-auto md:border-t-0 md:border-l">
        <h3 className="font-semibold text-gray-900">결과 요약</h3>
        <p className="mt-2 text-sm text-gray-600">커스터마이징된 내용을 확인하세요.</p>

        {(() => {
          const params = (project?.custom_params ?? {}) as Record<string, unknown>
          const company = params.company as string | undefined
          const headline = params.headline as string | undefined
          const colorPrimary = params.color_primary as string | undefined
          const templateName = (project as { templates?: { name: string } | null })?.templates?.name
          const hasAny = company || headline || colorPrimary || templateName
          if (!hasAny) return null
          return (
            <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
              {templateName && (
                <div>
                  <p className="text-xs font-medium text-gray-500">적용 템플릿</p>
                  <p className="text-sm text-gray-900">{templateName}</p>
                </div>
              )}
              {company && (
                <div>
                  <p className="text-xs font-medium text-gray-500">회사명</p>
                  <p className="text-sm text-gray-900">{company}</p>
                </div>
              )}
              {headline && (
                <div>
                  <p className="text-xs font-medium text-gray-500">슬로건</p>
                  <p className="text-sm text-gray-900">{headline}</p>
                </div>
              )}
              {colorPrimary && (
                <div>
                  <p className="text-xs font-medium text-gray-500">메인 컬러</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="h-5 w-5 shrink-0 rounded-full border border-gray-300"
                      style={{ backgroundColor: String(colorPrimary).startsWith('#') ? colorPrimary : `#${colorPrimary}` }}
                    />
                    <span className="font-mono text-sm text-gray-700">{String(colorPrimary).startsWith('#') ? colorPrimary : `#${colorPrimary}`}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        <button
          type="button"
          onClick={() => navigate('/project/customize')}
          className="mt-4 min-h-[44px] text-sm text-primary hover:underline"
        >
          AI 설정으로
        </button>
        <button
          type="button"
          onClick={handleCheckout}
          className="mt-4 block w-full min-h-[44px] rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary/90"
        >
          결제하고 다운로드
        </button>
      </aside>
    </main>
  )
}
