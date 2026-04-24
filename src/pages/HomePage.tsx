import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { CATEGORIES } from '../types'
import { MOCK_TEMPLATES_PUBLIC } from '../mocks/templatesMock'

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    document.title = 'SEOAH.STUDIO — 파일 하나로 웹사이트 완성'
    return () => { document.title = 'SEOAH.STUDIO' }
  }, [])

  const { data: countsByCategory } = useQuery({
    queryKey: ['template-counts-by-category'],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        const map: Record<string, number> = {}
        MOCK_TEMPLATES_PUBLIC.forEach((t) => {
          map[t.category] = (map[t.category] ?? 0) + 1
        })
        return map
      }
      const { data, error } = await supabase
        .from('templates_public')
        .select('category')
      if (error) throw error
      const map: Record<string, number> = {}
      ;(data ?? []).forEach((row: { category: string }) => {
        map[row.category] = (map[row.category] ?? 0) + 1
      })
      return map
    },
  })

  const handleCategoryClick = (id: string) => {
    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent('/templates/' + id)}`)
      return
    }
    navigate('/templates/' + id)
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <section className="border-b border-gray-200 bg-slate-900 px-4 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            하나의 랜딩으로 프로젝트 완성
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            피티·문서·이미지를 넣으면 AI가 코드까지 커스터마이징한 랜딩을 만들어 드립니다.
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-8 min-h-[44px] rounded-lg bg-white px-6 py-3 font-medium text-slate-900 hover:bg-slate-100"
          >
            시작하기
          </button>
        </div>
      </section>

      <section className="border-b border-gray-200 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-8">
          <h2 className="text-center text-2xl font-semibold text-gray-900">How it works</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {['자료 업로드', 'AI 분석', '커스터마이징', '다운로드'].map((step, i) => (
              <div key={step} className="rounded-xl border border-gray-200 bg-gray-50/50 p-6 text-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="mt-3 font-medium text-gray-900">{step}</p>
                <p className="mt-1 text-sm text-gray-500">간단한 단계로 완성</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="scroll-mt-8 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-8">
          <h2 className="text-center text-2xl font-semibold text-gray-900">템플릿 카테고리</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const count = countsByCategory?.[cat.id]
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className="relative min-h-[44px] rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-primary hover:shadow-md"
                >
                  {count != null && (
                    <span className="absolute right-4 top-4 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-medium text-white">
                      {count}개 템플릿
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900">{cat.label}</h3>
                  <p className="mt-2 text-sm text-gray-600">{cat.desc}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-primary">보기 →</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 py-12">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900">이런 결과물을 만들 수 있어요</h2>
          <p className="mt-2 text-gray-500">궁금한 점이 있으시면 알려주세요.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 w-32 rounded-lg border border-dashed border-gray-300 bg-gray-50"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
