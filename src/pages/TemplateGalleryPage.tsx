import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { analytics } from '../lib/analytics'
import { useProjectStore } from '../store/projectStore'
import { CATEGORIES } from '../types'
import type { TemplatePublic } from '../types'
import { MOCK_TEMPLATES_PUBLIC } from '../mocks/templatesMock'

export function TemplateGalleryPage() {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()
  const { setSelectedTemplateId } = useProjectStore()
  const currentCategory = category ?? 'portfolio'
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const { data: templates = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['templates_public', currentCategory],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return (MOCK_TEMPLATES_PUBLIC.filter((t) => t.category === currentCategory) as TemplatePublic[]) ?? []
      }
      const { data, error } = await supabase
        .from('templates_public')
        .select('*')
        .eq('category', currentCategory)
      if (error) throw error
      return (data ?? []) as TemplatePublic[]
    },
  })

  const uniqueTags = useMemo(() => {
    const set = new Set<string>()
    templates.forEach((t) => (t.tags ?? []).forEach((tag) => set.add(tag)))
    return Array.from(set).sort()
  }, [templates])

  const filteredTemplates = useMemo(() => {
    if (!selectedTag) return templates
    return templates.filter((t) => (t.tags ?? []).includes(selectedTag))
  }, [templates, selectedTag])

  const catInfo = CATEGORIES.find((c) => c.id === currentCategory)

  useEffect(() => {
    const label = catInfo?.label ?? currentCategory
    document.title = `${label} 템플릿 — SEOAH.STUDIO`
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [currentCategory, catInfo?.label])

  const handleUseTemplate = (id: string) => {
    analytics.templateSelected(currentCategory, id)
    setSelectedTemplateId(id)
    navigate('/project/upload')
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 pb-4 flex-nowrap sm:flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => navigate(`/templates/${c.id}`)}
            className={`min-h-[44px] shrink-0 rounded-lg px-4 py-2 text-sm font-medium ${
              currentCategory === c.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{catInfo?.label ?? currentCategory}</h1>
      {uniqueTags.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto flex-nowrap sm:flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`min-h-[44px] shrink-0 rounded-full px-3 py-1.5 text-sm ${
              selectedTag === null ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {uniqueTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`min-h-[44px] shrink-0 rounded-full px-3 py-1.5 text-sm ${
                selectedTag === tag ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      {isError ? (
        <div className="mt-12 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-gray-500">템플릿 목록을 불러오지 못했습니다.</p>
          {import.meta.env.DEV && error && (
            <p className="mt-2 max-w-md mx-auto text-left text-xs text-amber-700 break-all">
              {error instanceof Error ? error.message : String(error)}
            </p>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 min-h-[44px] rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90"
          >
            다시 시도
          </button>
        </div>
      ) : isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
              <div className="p-4">
                <div className="h-5 w-[60%] rounded bg-gray-200 animate-pulse" />
                <div className="mt-2 flex gap-2">
                  <span className="h-6 w-14 rounded-full bg-gray-200 animate-pulse" />
                  <span className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="h-9 w-16 rounded-lg bg-gray-200 animate-pulse" />
                  <span className="h-9 w-24 rounded-lg bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-gray-500">
            {templates.length === 0
              ? '준비 중입니다. 다른 카테고리를 확인해보세요.'
              : '선택한 태그에 맞는 템플릿이 없습니다.'}
          </p>
          {templates.length === 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {CATEGORIES.filter((c) => c.id !== currentCategory).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`/templates/${c.id}`)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((t) => (
            <div key={t.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="aspect-[4/3] bg-gray-100">
                {t.thumbnail_url ? (
                  <img src={t.thumbnail_url} alt={t.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">미리보기</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{t.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(t.tags ?? []).slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/templates/detail/${t.id}`)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    미리보기
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseTemplate(t.id)}
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    이 템플릿 사용
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
