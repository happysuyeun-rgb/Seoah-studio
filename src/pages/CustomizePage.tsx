import DOMPurify from 'dompurify'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useProjectStore, getStoredProjectId } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'
import { analytics } from '../lib/analytics'
import { StepIndicator } from '../components/StepIndicator'
import { SLOT_KEYS, getFontUrl } from '../lib/slotSpec'
import { getInvokeMessage } from '../lib/errorCodes'
import type { CustomResult } from '../store/projectStore'

const TIMEOUT_SEC = 60
const LONG_WAIT_THRESHOLD_SEC = 30
const LOADING_STEPS = [
  '① 파일 분석 중...',
  '② 콘텐츠 추출 중...',
  '③ 브랜드 컬러 감지 중...',
  '④ 템플릿에 적용 중...',
  '⑤ 마무리 중...',
]
const STEP_INTERVAL_MS = 2500

function applyParamsToHtml(html: string, params: CustomResult): string {
  let out = html
  for (const k of SLOT_KEYS) {
    const v = params[k]
    if (typeof v === 'string') out = out.replaceAll(`{{${k}}}`, v)
  }
  const primary = (params.color_primary as string) || '#1A4FA0'
  const secondary = (params.color_secondary as string) || '#E8EEFA'
  const rootVars: string[] = [`--color-primary:${primary}`, `--color-secondary:${secondary}`]
  const fontHint = (params.font_hint as string)?.trim() ?? ''
  const fontUrl = getFontUrl(fontHint)
  if (fontHint && fontUrl) rootVars.push(`--font-family:'${fontHint.replace(/'/g, "\\'")}', sans-serif`)
  const rootCss = `:root{${rootVars.join(';')}}`
  const styleBlock = `<style>${rootCss}</style>`
  if (fontUrl) {
    const linkTag = `<link rel="stylesheet" href="${fontUrl}" />`
    if (out.includes('</head>')) out = out.replace('</head>', `${linkTag}${styleBlock}</head>`)
    else out = `${linkTag}${styleBlock}${out}`
  } else {
    if (out.includes('</head>')) out = out.replace('</head>', `${styleBlock}</head>`)
    else out = `${styleBlock}${out}`
  }
  return out
}

export function CustomizePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentProjectId, setCurrentProjectId, setCustomResult } = useProjectStore()
  const [invoked, setInvoked] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [invokeError, setInvokeError] = useState<string | null>(null)
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false)
  const [loadingStep, setLoadingStep] = useState(1)
  const [activeTab, setActiveTab] = useState<'info' | 'color' | 'features'>('info')
  const [editingParams, setEditingParams] = useState<CustomResult | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const timedOutRef = useRef(false)

  useEffect(() => {
    document.title = 'AI 커스텀 중 — SEOAH.STUDIO'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])
  useEffect(() => {
    if (!currentProjectId) {
      const saved = getStoredProjectId()
      if (saved) setCurrentProjectId(saved)
    }
    setHasCheckedStorage(true)
  }, [currentProjectId, setCurrentProjectId])

  const { data: project, refetch, isLoading } = useQuery({
    queryKey: ['project', currentProjectId],
    queryFn: async () => {
      if (!currentProjectId) return null
      const { data, error } = await supabase.from('projects').select('*').eq('id', currentProjectId).single()
      if (error) throw error
      return data
    },
    enabled: !!currentProjectId,
    refetchInterval: (q) => {
      if (q.state.data?.status === 'ready') return false
      if (q.state.data?.status === 'error') return false
      if (timedOutRef.current) return false
      return 2000
    },
  })

  const { data: template } = useQuery({
    queryKey: ['project_template_html', currentProjectId],
    queryFn: async () => {
      if (!currentProjectId) return null
      const { data, error } = await supabase.rpc('get_project_template_html', { p_project_id: currentProjectId })
      if (error) throw error
      return data != null ? { html_template: data as string } : null
    },
    enabled: !!currentProjectId && (project?.status === 'ready'),
  })

  const status = project?.status ?? 'draft'
  const isReady = status === 'ready'
  const isError = status === 'error'
  const params = (editingParams ?? project?.custom_params ?? {}) as CustomResult
  const elapsedSec = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0
  const showLongWaitMessage = invoked && !isReady && !timedOut && !invokeError && elapsedSec >= LONG_WAIT_THRESHOLD_SEC && elapsedSec < TIMEOUT_SEC

  const invokeAi = useCallback(() => {
    if (!currentProjectId) return
    setTimedOut(false)
    setInvokeError(null)
    setLoadingStep(1)
    startTimeRef.current = Date.now()
    supabase.functions
      .invoke('ai-customize', { body: { projectId: currentProjectId } })
      .then(({ data, error }) => {
        if (error || (data && !data.success)) {
          const errCode =
            (data as { error?: string | { code?: string } } | null)?.error &&
            (typeof (data as { error?: unknown } | null)?.error === 'string'
              ? ((data as { error?: string } | null)?.error ?? null)
              : ((data as { error?: { code?: string } } | null)?.error?.code ?? null))
          if (errCode === 'UNAUTHORIZED' || errCode === 'FORBIDDEN') {
            navigate(`/login?returnTo=${encodeURIComponent('/project/customize')}`)
            return
          }
          const msg = getInvokeMessage(data as { message?: string; error?: string } | null, error)
          toast.error(msg)
          setInvokeError(msg)
        }
        refetch()
      })
      .catch(() => {
        toast.error('AI 처리 요청 실패')
        setInvokeError('AI 처리 요청에 실패했습니다. 다시 시도해 주세요.')
      })
  }, [currentProjectId, refetch, navigate])

  useEffect(() => {
    if (!currentProjectId || !user || invoked) return
    if (project?.status === 'error') return
    setInvoked(true)
    analytics.customizeStarted(currentProjectId)
    invokeAi()
  }, [currentProjectId, user, invoked, project?.status, invokeAi])

  useEffect(() => {
    if (!invoked || isReady || timedOut) return
    const t = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 5))
    }, STEP_INTERVAL_MS)
    return () => clearInterval(t)
  }, [invoked, isReady, timedOut])

  useEffect(() => {
    if (!invoked || isReady || timedOut) return
    const t = setInterval(() => {
      if (startTimeRef.current && Date.now() - startTimeRef.current >= TIMEOUT_SEC * 1000) {
        timedOutRef.current = true
        setTimedOut(true)
        startTimeRef.current = null
      }
    }, 1000)
    return () => clearInterval(t)
  }, [invoked, isReady, timedOut])

  useEffect(() => {
    if (project?.status === 'ready' && project?.custom_params) {
      const p = project.custom_params as CustomResult
      setCustomResult(p)
      setEditingParams(p)
    }
  }, [project?.status, project?.custom_params, setCustomResult])

  const handleParamChange = (key: keyof CustomResult, value: string) => {
    setEditingParams((prev) => ({ ...prev, [key]: value }))
  }

  const handleReapply = async () => {
    if (!currentProjectId || !template?.html_template || !editingParams) return
    const rawHtml = applyParamsToHtml(template.html_template, editingParams)
    const newHtml = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } })
    const { error } = await supabase.from('projects').update({ output_html: newHtml, custom_params: editingParams }).eq('id', currentProjectId)
    if (error) {
      toast.error('적용 실패')
      return
    }
    setCustomResult(editingParams)
    toast.success('다시 적용되었습니다.')
    refetch()
  }

  if (hasCheckedStorage && !currentProjectId) {
    navigate('/project/upload', { replace: true })
    return null
  }
  if (!currentProjectId) return null

  const handleRetry = () => {
    timedOutRef.current = false
    setInvoked(false)
    setTimedOut(false)
    setInvokeError(null)
    setLoadingStep(1)
    startTimeRef.current = null
    setTimeout(() => setInvoked(true), 0)
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <StepIndicator currentStep="ai" />
      <h1 className="text-2xl font-bold text-gray-900">AI 커스터마이징</h1>

      {(invokeError || isError) && !isReady && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-medium text-red-800">{invokeError || '오류가 발생했습니다. 다시 시도하거나 문의해 주세요.'}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={handleRetry} className="rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90">
              다시 시도
            </button>
            <Link to="/support" className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 hover:bg-gray-50">
              1:1 문의하기
            </Link>
          </div>
        </div>
      )}

      {timedOut && !isReady && !invokeError && !isError && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="font-medium text-amber-800">처리 시간이 초과되었습니다.</p>
          <p className="mt-2 text-sm text-amber-700">잠시 후 다시 시도해 주세요.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={handleRetry} className="rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90">
              다시 시도
            </button>
            <Link to="/support" className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 hover:bg-gray-50">
              1:1 문의하기
            </Link>
          </div>
        </div>
      )}

      {!isReady && !timedOut && !invokeError && !isError && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-8">
          <p className="text-center text-gray-600">약 20~60초 소요됩니다.</p>
          {showLongWaitMessage && (
            <p className="mt-2 text-center text-sm text-amber-700">시간이 걸리고 있습니다. 잠시만 기다려주세요.</p>
          )}
          <ul className="mt-6 space-y-2">
            {LOADING_STEPS.map((label, i) => (
              <li key={label} className={`flex items-center gap-2 text-sm ${i + 1 <= loadingStep ? 'font-medium text-primary' : 'text-gray-400'}`}>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs">
                  {i + 1 <= loadingStep ? '✓' : i + 1}
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isReady && (
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex gap-2 border-b border-gray-200">
            {(['info', 'color', 'features'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'info' && '기본 정보'}
                {tab === 'color' && '색상'}
                {tab === 'features' && '기능 문구'}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">브랜드 정보</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500">회사명</label>
                  <input
                    type="text"
                    value={params.company ?? ''}
                    onChange={(e) => handleParamChange('company', e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">슬로건 / 헤드라인</label>
                  <input
                    type="text"
                    value={params.headline ?? ''}
                    onChange={(e) => handleParamChange('headline', e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">CTA 버튼 문구</label>
                  <input
                    type="text"
                    value={params.cta ?? ''}
                    onChange={(e) => handleParamChange('cta', e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'color' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">컬러 팔레트</h3>
              <div className="flex flex-wrap gap-6">
                <div>
                  <label className="block text-xs text-gray-500">메인 컬러</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={params.color_primary ?? '#1A4FA0'}
                      onChange={(e) => handleParamChange('color_primary', e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={params.color_primary ?? ''}
                      onChange={(e) => handleParamChange('color_primary', e.target.value)}
                      className="w-28 rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">서브 컬러</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={params.color_secondary ?? '#E8EEFA'}
                      onChange={(e) => handleParamChange('color_secondary', e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={params.color_secondary ?? ''}
                      onChange={(e) => handleParamChange('color_secondary', e.target.value)}
                      className="w-28 rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">주요 내용 요약</h3>
              <div className="space-y-4">
                {(['feature_1', 'feature_2', 'feature_3'] as const).map((key, i) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500">기능 {i + 1}</label>
                    <input
                      type="text"
                      value={params[key] ?? ''}
                      onChange={(e) => handleParamChange(key, e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={handleReapply} className="rounded-lg border border-primary bg-white px-6 py-2 font-medium text-primary hover:bg-primary/5">
              다시 적용
            </button>
            <button type="button" onClick={() => navigate('/project/preview')} className="rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90">
              미리보기 확인
            </button>
            <button type="button" onClick={() => navigate('/project/upload')} className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50">
              처음부터 다시
            </button>
          </div>
        </div>
      )}

      {isLoading && !project && <p className="mt-4 text-gray-500">로딩 중...</p>}
    </main>
  )
}
