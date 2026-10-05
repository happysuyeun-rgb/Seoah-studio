import { Link } from 'react-router-dom'
import { ButtonLink } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { REQUEST_PATH } from '../components/marketing/nav'
import { usePageTitle } from '../components/marketing/usePageTitle'

const offers = [
  { name: 'READY', text: '준비된 제품에서 시작합니다.' },
  { name: 'STUDIO', text: '사업에 맞게 새로 만듭니다.' },
  { name: 'CARE', text: '출시 이후의 운영을 이어갑니다.' },
  { name: 'SAAS', text: '팀이 쓰는 도구를 준비합니다.' },
]

const studioOffers = [
  { name: 'Website', text: '사업 소개와 랜딩을 위한 사이트.' },
  { name: 'MVP', text: '시장에서 확인할 수 있는 웹 제품.' },
  { name: 'AI Product', text: '필요한 기능만 넣은 디지털 제품.' },
  { name: 'Internal Tool', text: '운영과 관리를 위한 내부 도구.' },
]

const steps = [
  { name: 'Discover', text: '지금 필요한 것을 듣습니다.' },
  { name: 'Define', text: '범위와 조건을 정합니다.' },
  { name: 'Build', text: '설계하고 만듭니다.' },
  { name: 'Launch', text: '검토한 뒤 전달합니다.' },
]

const flow = ['문의', 'Discovery', 'Proposal', 'Contract', 'Build', 'Review', 'Launch']

const carePlans = [
  { name: 'Website Care Mini', text: '작은 수정과 기본 상태 점검.', price: '월 9.9만원' },
  { name: 'Website Care', text: '수정, 기본 점검, 운영 지원.', price: '월 19.9만원' },
  { name: 'Product Care', text: '제품 운영. 범위는 별도 협의.', price: '월 49만원부터' },
]

const saasProducts = [
  { name: 'Plan OS', text: '계획과 실행을 한 작업면에 두는 도구.' },
  { name: 'Approval OS', text: '승인 요청과 결정을 남기는 도구.' },
  { name: 'Voting', text: '팀의 선택을 모으는 도구.' },
]

function OfferMap() {
  return (
    <ol className="border-t-2 border-ink" aria-label="SEOAH.STUDIO 구성">
      {offers.map((item, index) => (
        <li key={item.name} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-4 border-b border-line py-5">
          <span className="text-sm tabular-nums text-ink-faint">0{index + 1}</span>
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink">{item.name}</p>
            <p className="mt-1 text-sm text-ink-soft">{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function HomePage() {
  usePageTitle('SEOAH.STUDIO — 디지털 제품 플랫폼')

  return (
    <main>
      <PageHero
        eyebrow="Digital products for business"
        title={
          <>
            사업에 필요한 디지털 제품,
            <br />
            처음부터 만들 필요 없습니다.
          </>
        }
        description="웹사이트부터 MVP, 업무도구와 디지털 제품까지. 준비된 제품에서 시작하거나 내 사업에 맞춰 제작하세요."
        actions={
          <>
            <ButtonLink to="/ready">Ready 제품 보기</ButtonLink>
            <ButtonLink to={REQUEST_PATH} variant="secondary">
              프로젝트 의뢰하기
            </ButtonLink>
          </>
        }
        visual={<OfferMap />}
      />

      <MarketingSection>
        <SectionHeading title="어떤 방식으로 시작하시겠어요?" />
        <div className="mt-14 grid border-t-2 border-ink lg:mt-16 lg:grid-cols-2">
          <article className="border-b border-line py-10 lg:border-b-0 lg:border-r lg:pr-12 lg:pt-12">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-faint">Ready</p>
            <h3 className="mt-4 text-title text-ink">이미 준비된 제품에서 시작합니다.</h3>
            <ul className="mt-8 space-y-3 text-base text-ink-soft">
              <li>빠르게 선택</li>
              <li>필요한 부분만 변경</li>
              <li>바로 시작</li>
            </ul>
            <ButtonLink to="/ready" variant="secondary" className="mt-10">
              Ready 보기
            </ButtonLink>
          </article>
          <article className="py-10 lg:pl-12 lg:pt-12">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-faint">Studio</p>
            <h3 className="mt-4 text-title text-ink">내 사업에 맞게 새로 만듭니다.</h3>
            <ul className="mt-8 space-y-3 text-base text-ink-soft">
              <li>문제 정의</li>
              <li>기획과 디자인</li>
              <li>개발과 출시</li>
            </ul>
            <ButtonLink to="/studio" className="mt-10">
              Studio 시작하기
            </ButtonLink>
          </article>
        </div>
      </MarketingSection>

      <MarketingSection surface="paper">
        <SectionHeading eyebrow="Studio" title="만드는 제품" />
        <ul className="mt-12 border-t border-line">
          {studioOffers.map((offer) => (
            <li key={offer.name} className="grid gap-2 border-b border-line py-7 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-baseline">
              <h3 className="text-lg font-semibold tracking-tight text-ink">{offer.name}</h3>
              <p className="text-base text-ink-soft">{offer.text}</p>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection>
        <SectionHeading title="진행은 한 계정 안에서 이어집니다." description="문의부터 납품까지 따로 흩어지지 않습니다." />
        <ol className="mt-14 grid gap-0 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.name} className="border-t-2 border-ink py-6 lg:px-5 lg:first:pl-0">
              <p className="text-sm font-medium tabular-nums text-ink-faint">0{index + 1}</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">{step.name}</p>
              <p className="mt-2 text-sm text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm leading-relaxed text-ink-soft">{flow.join(' → ')}</p>
      </MarketingSection>

      <MarketingSection surface="paper">
        <SectionHeading eyebrow="Ready" title="처음부터 만들 필요 없는 제품." description="판매 중인 카탈로그는 아직 없습니다. 준비되는 대로 이 자리에서 고를 수 있습니다." />
        <p className="mt-10 text-xs font-medium tracking-[0.16em] text-signal">PREPARING</p>
        <div className="mt-8">
          <ButtonLink to="/ready" variant="secondary">
            Ready 페이지 보기
          </ButtonLink>
        </div>
      </MarketingSection>

      <MarketingSection>
        <SectionHeading eyebrow="Care" title="출시가 끝이 아닙니다." description="운영, 개선, 업데이트, 기술 관리를 필요한 범위에서 이어갑니다." />
        <ul className="mt-12 border-t border-line">
          {carePlans.map((plan) => (
            <li key={plan.name} className="grid gap-2 border-b border-line py-7 sm:grid-cols-[16rem_minmax(0,1fr)_auto] sm:items-baseline">
              <h3 className="text-lg font-semibold tracking-tight text-ink">{plan.name}</h3>
              <p className="text-base text-ink-soft">{plan.text}</p>
              <p className="text-sm font-medium text-ink">{plan.price}</p>
            </li>
          ))}
        </ul>
        <Link to="/care" className="mt-8 inline-flex min-h-11 items-center text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
          Care 자세히 보기
        </Link>
      </MarketingSection>

      <MarketingSection surface="paper">
        <SectionHeading eyebrow="SaaS" title="팀이 쓰는 도구" description="개발 중이며, 아직 판매하지 않습니다." />
        <ul className="mt-12 border-t border-line">
          {saasProducts.map((product) => (
            <li key={product.name} className="grid gap-2 border-b border-line py-7 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-baseline">
              <h3 className="text-lg font-semibold tracking-tight text-ink">{product.name}</h3>
              <p className="text-base text-ink-soft">{product.text}</p>
              <p className="text-xs font-medium tracking-[0.14em] text-signal">IN DEVELOPMENT</p>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection>
        <h2 className="max-w-[14em] text-display text-ink">필요한 제품이 있다면, 이제 시작하면 됩니다.</h2>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to={REQUEST_PATH}>프로젝트 시작</ButtonLink>
          <ButtonLink to="/ready" variant="secondary">
            Ready 둘러보기
          </ButtonLink>
        </div>
      </MarketingSection>
    </main>
  )
}
