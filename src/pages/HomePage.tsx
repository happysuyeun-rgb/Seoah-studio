import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { PathList } from '../components/marketing/PathList'
import { ProductComposition } from '../components/marketing/ProductComposition'
import { ReadyPreview, ReadyThumb, type ReadyPreviewName } from '../components/marketing/ReadyPreview'
import { REQUEST_PATH } from '../components/marketing/nav'
import { usePageTitle } from '../components/marketing/usePageTitle'

const paths = [
  { label: 'Ready', text: '바로 시작할 웹사이트가 필요해요.', to: '/ready' },
  { label: 'Studio', text: '우리 사업에 맞는 제품을 만들고 싶어요.', to: '/studio' },
  { label: 'Care', text: '이미 만든 사이트를 운영하고 싶어요.', to: '/care' },
  { label: 'SaaS', text: '팀에서 사용할 업무 도구가 필요해요.', to: '/saas' },
]

const readyCategories: ReadyPreviewName[] = ['Startup', 'Solo Business', 'Small Business', 'Portfolio']

const studioOffers = [
  { name: 'Website', text: 'Business / Landing' },
  { name: 'MVP', text: 'Web Product' },
  { name: 'AI Product', text: 'AI-enabled Service' },
  { name: 'Internal Tool', text: 'Operations / Admin' },
]

const studioFlow = ['Discovery', 'Planning', 'Design', 'Development', 'Launch']

const carePlans = [
  {
    name: 'Website Care Mini',
    who: '작은 웹사이트 기본 운영',
    items: ['텍스트/이미지 수정', '기본 상태 점검', '간단 오류 대응'],
    price: '₩99,000',
    unit: '/ month',
  },
  {
    name: 'Website Care',
    who: '운영 중인 비즈니스 웹사이트',
    items: ['콘텐츠 수정', '정기 점검', '운영 지원'],
    price: '₩199,000',
    unit: '/ month',
  },
  {
    name: 'Product Care',
    who: 'MVP / Digital Product',
    items: ['오류 대응', '운영 지원', '범위는 협의'],
    price: '₩490,000~',
    unit: '/ month',
  },
]

const practice = ['Planning', 'UX/UI', 'Development', 'Launch']

const workCategories = ['Website', 'Product', 'Brand']

export function HomePage() {
  usePageTitle('SEOAH.STUDIO — 디지털 프로덕트 스튜디오')
  const [readyName, setReadyName] = useState<ReadyPreviewName>('Startup')

  return (
    <main>
      <PageHero
        eyebrow="SEOAH.STUDIO"
        title={
          <>
            사업에 필요한
            <br />
            디지털 제품,
            <br />
            처음부터 만들
            <br />
            필요 없습니다.
          </>
        }
        description="바로 사용할 수 있는 웹사이트부터 맞춤형 MVP와 디지털 제품까지. SEOAH.STUDIO가 사업의 시작을 제품으로 만듭니다."
        actions={
          <>
            <ButtonLink to="/ready">제품 둘러보기</ButtonLink>
            <ButtonLink to={REQUEST_PATH} variant="secondary">
              프로젝트 의뢰하기
            </ButtonLink>
          </>
        }
        visual={<ProductComposition />}
      />

      <MarketingSection>
        <SectionHeading title="무엇이 필요하세요?" />
        <PathList items={paths} />
      </MarketingSection>

      <MarketingSection surface="paper">
        <SectionHeading
          eyebrow="Ready"
          title="Ready to Launch."
          description="검증된 구조로 만든 웹사이트를 사업에 맞게 선택하고 바로 시작하세요."
        />
        <div className="mt-14 grid items-start gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1.45fr)_minmax(15rem,0.55fr)] lg:gap-10">
          <ReadyPreview name={readyName} />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1" role="list">
            {readyCategories.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setReadyName(name)}
                className="text-left"
                aria-pressed={readyName === name}
              >
                <ReadyThumb name={name} active={readyName === name} />
              </button>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/ready">Ready 제품 보기</ButtonLink>
          <ButtonLink to="/ready#how" variant="secondary">
            어떻게 이용하나요?
          </ButtonLink>
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <SectionHeading
            eyebrow="Studio"
            title="아이디어를 실제 제품으로."
            description="기획부터 UX/UI, 개발, 배포까지 하나의 흐름으로 진행합니다."
          />
          <ol className="grid gap-0 sm:grid-cols-5">
            {studioFlow.map((step, index) => (
              <li key={step} className="border-t-2 border-ink pt-5 sm:px-3 sm:first:pl-0">
                <p className="text-2xl font-semibold tabular-nums tracking-[-0.04em] text-ink">0{index + 1}</p>
                <p className="mt-3 text-base font-medium tracking-tight text-ink">{step}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-16 text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">제작 가능 범위</p>
        <ul className="mt-6 grid gap-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {studioOffers.map((offer) => (
            <li key={offer.name}>
              <p className="text-xl font-semibold tracking-tight text-ink">{offer.name}</p>
              <p className="mt-2 text-base text-ink-soft">{offer.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/studio" variant="secondary">
            Studio 알아보기
          </ButtonLink>
          <ButtonLink to={REQUEST_PATH}>프로젝트 의뢰하기</ButtonLink>
        </div>
      </MarketingSection>

      <MarketingSection surface="paper">
        <SectionHeading
          eyebrow="Care"
          title="출시가 끝이 아니니까."
          description="웹사이트와 제품이 안정적으로 운영될 수 있도록 필요한 수정과 운영을 이어갑니다."
        />
        <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-3 lg:gap-0">
          {carePlans.map((plan) => (
            <article key={plan.name} className="lg:border-l lg:border-line lg:px-8 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0">
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink">{plan.name}</h3>
              <p className="mt-3 text-base font-medium text-ink">{plan.who}</p>
              <ul className="mt-6 space-y-2">
                {plan.items.map((item) => (
                  <li key={item} className="text-base text-ink-soft">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-xl font-semibold tracking-tight text-ink">
                {plan.price}
                <span className="ml-1 text-base font-medium text-ink-soft">{plan.unit}</span>
              </p>
              <Link to="/care" className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink">
                자세히 보기
              </Link>
            </article>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <SectionHeading eyebrow="Work" title="Selected Work" />
        <div className="mt-14 grid border border-line bg-paper lg:mt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="relative min-h-72 border-b border-line p-6 sm:min-h-96 sm:p-8 lg:border-b-0 lg:border-r" aria-hidden>
            <div className="absolute inset-6 border border-line sm:inset-8">
              <div className="flex h-8 items-center gap-2 border-b border-line px-3">
                <span className="h-1.5 w-1.5 bg-ink" />
                <span className="h-1.5 w-1.5 bg-line" />
                <span className="ml-2 h-px flex-1 bg-line" />
              </div>
              <div className="grid h-[calc(100%-2rem)] grid-cols-[5rem_minmax(0,1fr)]">
                <div className="border-r border-line p-3">
                  <div className="h-2 w-full bg-canvas" />
                  <div className="mt-3 h-2 w-4/5 bg-canvas" />
                  <div className="mt-3 h-2 w-3/5 bg-canvas" />
                </div>
                <div className="p-4">
                  <div className="h-3 w-2/5 bg-canvas" />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="h-16 border border-line" />
                    <div className="h-16 border border-line bg-signal-soft" />
                  </div>
                  <div className="mt-3 h-2 w-3/5 bg-canvas" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-end p-6 sm:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">Private client work</p>
            <p className="mt-4 max-w-[14em] text-3xl font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
              Case studies are being prepared.
            </p>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {workCategories.map((category) => (
                <li key={category} className="text-base font-medium text-ink">
                  {category}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-copy text-lead text-ink-soft">공개할 수 있는 작업이 정리되는 대로 이 자리에 올립니다.</p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection surface="paper">
        <SectionHeading
          title="기획 따로, 디자인 따로, 개발 따로 맡기지 않아도 됩니다."
          description="SEOAH.STUDIO는 페이지를 납품하는 제작사가 아니라, 사업에 필요한 디지털 제품을 하나의 흐름으로 만드는 스튜디오입니다."
        />
        <ol className="mt-16 border-t-2 border-ink lg:mt-20 lg:flex">
          {practice.map((item, index) => (
            <li key={item} className="flex-1 border-t border-line py-6 lg:border-l lg:border-t-0 lg:px-6 lg:py-8 lg:first:border-l-0 lg:first:pl-0">
              <p className="text-sm font-medium tabular-nums tracking-[0.14em] text-ink-soft">0{index + 1}</p>
              <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl lg:text-5xl">{item}</p>
            </li>
          ))}
        </ol>
      </MarketingSection>

      <MarketingSection>
        <h2 className="max-w-[12em] text-display text-ink">
          무엇을 만들어야 할지
          <br />
          아직 정확하지 않아도 괜찮습니다.
        </h2>
        <p className="mt-6 max-w-copy text-lead text-ink-soft">
          현재 상황을 알려주시면 Ready 제품이 맞는지, 맞춤 제작이 필요한지부터 함께 정리합니다.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to={REQUEST_PATH}>프로젝트 이야기하기</ButtonLink>
          <ButtonLink to="/contact" variant="secondary">
            문의하기
          </ButtonLink>
        </div>
      </MarketingSection>
    </main>
  )
}
