import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SectionHeading } from '../components/ui/SectionHeading'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { usePageTitle } from '../components/marketing/usePageTitle'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const groups = ['Ready', 'Studio', 'Care', 'Payment', 'Project'] as const
type FaqGroup = (typeof groups)[number]

type FaqItem = { id: string; group: FaqGroup; question: string; answer: string }

const staticFaqs: FaqItem[] = [
  {
    id: 'ready-1',
    group: 'Ready',
    question: 'Ready는 어떤 서비스인가요?',
    answer: '바로 사용할 수 있는 웹사이트와 디지털 제품을 고르는 영역입니다. 상품 탐색은 로그인 없이 할 수 있습니다.',
  },
  {
    id: 'ready-2',
    group: 'Ready',
    question: '지금 템플릿은 어디서 보나요?',
    answer: '새 Ready 페이지는 상위 소개입니다. 현재 공개된 템플릿은 /templates 갤러리에서 그대로 볼 수 있습니다.',
  },
  {
    id: 'studio-1',
    group: 'Studio',
    question: 'Discovery Sprint는 무엇인가요?',
    answer: '30만원, 3~5일 진단입니다. 본계약이 체결되면 전액 차감됩니다. 상담 단계에서 제작 티어를 확정하지 않습니다.',
  },
  {
    id: 'studio-2',
    group: 'Studio',
    question: '안내된 MVP 금액은 확정 견적인가요?',
    answer: '아닙니다. Basic, Standard, Advanced 금액은 시작 가이드입니다. 정식 견적은 Discovery 이후 범위를 기준으로 정합니다.',
  },
  {
    id: 'care-1',
    group: 'Care',
    question: 'Care는 꼭 가입해야 하나요?',
    answer: '아닙니다. 납품 이후 필요할 때 고르는 선택형 운영 상품입니다.',
  },
  {
    id: 'care-2',
    group: 'Care',
    question: '기본 Care에 포함되지 않는 것은 무엇인가요?',
    answer: '신규 페이지, 신규 기능, 대규모 구조 변경, 외부 유료 서비스 비용은 기본 범위에 포함되지 않습니다. Product Care는 월 49만원부터이며 범위는 협의합니다.',
  },
  {
    id: 'payment-1',
    group: 'Payment',
    question: '기존에 결제한 템플릿은 어디서 확인하나요?',
    answer: '기존 주문과 다운로드는 마이페이지에서 그대로 확인합니다.',
  },
  {
    id: 'project-1',
    group: 'Project',
    question: '의뢰하면 바로 제작이 시작되나요?',
    answer: '아닙니다. 범위를 정리하고, 견적과 계약, 계약금 이후에 프로젝트가 시작됩니다.',
  },
]

function mapGroup(category: string): FaqGroup {
  if (category === '결제' || category === 'Payment') return 'Payment'
  if (category === '파일' || category === 'Project') return 'Project'
  if (category === 'Studio') return 'Studio'
  if (category === 'Care') return 'Care'
  if (category === 'Ready' || category === '서비스') return 'Ready'
  return 'Project'
}

export function FaqPage() {
  usePageTitle('FAQ — SEOAH.STUDIO')
  const [group, setGroup] = useState<FaqGroup | 'All'>('All')
  const [openId, setOpenId] = useState<string | null>(staticFaqs[0].id)

  const { data: remote = [] } = useQuery({
    queryKey: ['public-faqs'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase
        .from('faqs')
        .select('id, category, question, answer, sort_order')
        .eq('is_active', true)
        .order('sort_order')
      if (error) return []
      return data ?? []
    },
  })

  const items = useMemo(() => {
    const fromDb: FaqItem[] = remote.map((row) => ({
      id: `db-${row.id}`,
      group: mapGroup(row.category),
      question: row.question,
      answer: row.answer,
    }))
    const seen = new Set(staticFaqs.map((item) => item.question))
    return [...staticFaqs, ...fromDb.filter((item) => !seen.has(item.question))]
  }, [remote])

  const visible = items.filter((item) => group === 'All' || item.group === group)

  return (
    <main>
      <PageHero eyebrow="FAQ" title="자주 묻는 질문" description="Ready, Studio, Care, 결제, 프로젝트 진행에 대한 기준입니다." />
      <MarketingSection>
        <SectionHeading title="Categories" />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3" role="tablist" aria-label="FAQ 분류">
          {(['All', ...groups] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={group === item}
              onClick={() => setGroup(item)}
              className={`min-h-11 text-sm tracking-tight ${group === item ? 'text-ink' : 'text-ink-faint hover:text-ink'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <ul className="mt-6 border-t border-line">
          {visible.map((item) => {
            const open = openId === item.id
            return (
              <li key={item.id} className="border-b border-line">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-6 py-5 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span>
                    <span className="block text-xs tracking-[0.14em] text-ink-faint">{item.group}</span>
                    <span className="mt-2 block text-base font-medium text-ink">{item.question}</span>
                  </span>
                  <span className="text-sm text-ink-faint" aria-hidden>
                    {open ? '–' : '+'}
                  </span>
                </button>
                {open ? <p className="max-w-2xl pb-6 text-sm leading-relaxed text-ink-soft">{item.answer}</p> : null}
              </li>
            )
          })}
        </ul>
      </MarketingSection>
    </main>
  )
}
