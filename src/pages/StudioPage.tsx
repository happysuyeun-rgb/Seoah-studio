import { useState, type FormEvent } from 'react'
import { Button } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'
import { SelectField, TextAreaField, TextField } from '../components/marketing/Fields'
import { MarketingSection } from '../components/marketing/MarketingSection'
import { PageHero } from '../components/marketing/PageHero'
import { usePageTitle } from '../components/marketing/usePageTitle'
import { toast } from '../store/toastStore'

const builds = [
  { name: 'Website', text: '서비스와 회사를 설명하는 사이트.' },
  { name: 'MVP', text: '핵심 기능만 먼저 쓰는 제품.' },
  { name: 'AI Product', text: '모델과 업무 흐름이 연결된 제품.' },
  { name: 'Internal Tool', text: '팀 안에서 반복 업무를 줄이는 도구.' },
]

const steps = [
  { name: 'Discovery', text: '문제, 사용자, 범위를 정리합니다.' },
  { name: 'Planning', text: '만들어야 할 화면과 우선순위를 정합니다.' },
  { name: 'Design', text: '사용할 수 있는 인터페이스로 다듬습니다.' },
  { name: 'Development', text: '합의된 범위를 제품으로 만듭니다.' },
  { name: 'Launch', text: '배포하고 운영으로 넘깁니다.' },
]

const guides = [
  { name: 'Basic MVP', price: '590~790만원', text: '화면 수와 역할이 제한된 첫 제품.' },
  { name: 'Standard MVP', price: '790~1,200만원', text: '결제, 권한, 외부 연동이 포함되는 범위.' },
  { name: 'Advanced', price: '1,200만원~', text: '복잡한 권한과 운영이 필요한 개별 범위.' },
]

const projectTypes = ['Website', 'MVP', 'AI Product', 'Internal Tool']

export function StudioPage() {
  usePageTitle('Studio — SEOAH.STUDIO')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [projectType, setProjectType] = useState(projectTypes[0])
  const [message, setMessage] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('이름, 이메일, 내용을 입력해 주세요.')
      return
    }
    toast.info('문의 접수를 준비하고 있습니다.')
  }

  return (
    <main>
      <PageHero
        eyebrow="Studio"
        title={
          <>
            아이디어를
            <br />
            실제 제품으로.
          </>
        }
        description="기획, UX/UI, 개발, 배포를 한 흐름으로 진행합니다. 상담 단계에서 가격 티어를 확정하지 않습니다."
      />

      <MarketingSection>
        <SectionHeading title="What we build" />
        <ul className="mt-12 grid gap-10 sm:grid-cols-2">
          {builds.map((item) => (
            <li key={item.name} className="border-t border-line pt-5">
              <h3 className="text-xl font-semibold tracking-tight text-ink">{item.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.text}</p>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection>
        <SectionHeading title="How it works" />
        <ol className="mt-12">
          {steps.map((step, index) => (
            <li key={step.name} className="grid gap-2 border-t border-line py-6 sm:grid-cols-[4rem_12rem_minmax(0,1fr)] sm:items-baseline">
              <span className="text-sm tabular-nums text-ink-faint">0{index + 1}</span>
              <h3 className="text-lg font-semibold tracking-tight text-ink">{step.name}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </MarketingSection>

      <MarketingSection>
        <SectionHeading
          eyebrow="Discovery Sprint"
          title="본계약 전의 유료 진단."
          description="3~5일. 서비스 정의, 사용자와 문제, 핵심 기능, 화면 목록, MVP 범위, 예상 일정, 정식 견적을 정리합니다."
        />
        <p className="mt-8 text-3xl font-semibold tracking-tight text-ink">30만원</p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">본 계약이 체결되면 전액 차감됩니다. 상세 IA, 와이어프레임, DB/API 설계는 이 산출물에 포함하지 않습니다.</p>
      </MarketingSection>

      <MarketingSection>
        <SectionHeading
          title="Price guide"
          description="아래 금액은 시작 범위입니다. 확정 견적이 아니며, Discovery 이후 실제 범위를 기준으로 정식 견적을 정합니다."
        />
        <ul className="mt-12 border-t border-line">
          {guides.map((guide) => (
            <li key={guide.name} className="grid gap-2 border-b border-line py-7 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-baseline">
              <h3 className="text-lg font-semibold tracking-tight text-ink">{guide.name}</h3>
              <p className="text-sm text-ink-soft">{guide.text}</p>
              <p className="text-sm font-medium text-ink">{guide.price}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-faint">Starting guide. 상담만으로 티어를 정하지 않습니다.</p>
      </MarketingSection>

      <MarketingSection id="request" className="scroll-mt-24">
        <SectionHeading title="프로젝트 의뢰하기" description="지금 아는 범위만 적어도 됩니다." />
        <form onSubmit={submit} className="mt-10 grid max-w-xl gap-6">
          <TextField label="이름" name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          <TextField label="이메일" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          <SelectField label="프로젝트 유형" name="projectType" value={projectType} onChange={(event) => setProjectType(event.target.value)}>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </SelectField>
          <TextAreaField label="내용" name="message" value={message} onChange={(event) => setMessage(event.target.value)} />
          <Button type="submit">보내기</Button>
        </form>
      </MarketingSection>
    </main>
  )
}
