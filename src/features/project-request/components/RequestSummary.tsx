import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonLink } from '../../../components/ui/Button'
import type { ProjectRequestDraft } from '../types'
import { writeRequestHandoff } from '../../../lib/requestHandoff'
import { buildRequestMessage } from '../formatRequestMessage'
import {
  advancedFeatures,
  basicFeatures,
  budgetChoices,
  currentStatusOptions,
  goalOptions,
  labelOf,
  labelsOf,
  projectTypeOptions,
  targetUserOptions,
  timelineChoices,
} from '../options'

type RequestSummaryProps = {
  draft: ProjectRequestDraft
  onEdit: (step: number) => void
  devChecked: boolean
  onDevCheck: () => void
}

function SummaryBlock({ title, value, onEdit }: { title: string; value: string; onEdit: () => void }) {
  return (
    <section className="border-t border-line py-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-medium text-ink">{title}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          수정
        </Button>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{value || '없음'}</p>
    </section>
  )
}

export function RequestSummary({ draft, onEdit, devChecked, onDevCheck }: RequestSummaryProps) {
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const references = draft.references.filter((item) => item.url.trim() || item.note.trim())
  const referenceText =
    references.length === 0
      ? '없음'
      : references.map((item) => `${item.url.trim() || 'URL 없음'}${item.note.trim() ? ` — ${item.note.trim()}` : ''}`).join('\n')
  const contactText = [draft.contact.name, draft.contact.email, draft.contact.phone, draft.contact.company].filter((item) => item.trim()).join('\n') || '없음'

  const continueToContact = () => {
    try {
      writeRequestHandoff({
        name: draft.contact.name.trim().slice(0, 50),
        email: draft.contact.email.trim().slice(0, 200),
        phone: draft.contact.phone.trim().slice(0, 30),
        message: buildRequestMessage(draft),
      })
    } catch {
      // Contact still opens with the studio topic when storage is unavailable.
    }
    navigate('/contact?topic=studio')
  }

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="mt-14">
      <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold tracking-tight text-ink outline-none sm:text-4xl">
        입력한 내용을 확인해 주세요.
      </h1>
      <div className="mt-10">
        <SummaryBlock title="Project Type" value={labelOf(projectTypeOptions, draft.projectType)} onEdit={() => onEdit(0)} />
        <SummaryBlock title="Current Status" value={labelOf(currentStatusOptions, draft.currentStatus)} onEdit={() => onEdit(1)} />
        <SummaryBlock title="Goals" value={labelsOf(goalOptions, draft.goals)} onEdit={() => onEdit(2)} />
        <SummaryBlock
          title="Target Users"
          value={[labelsOf(targetUserOptions, draft.targetUsers), draft.targetUserDescription.trim()].filter(Boolean).join('\n')}
          onEdit={() => onEdit(3)}
        />
        <SummaryBlock title="Features" value={labelsOf([...basicFeatures, ...advancedFeatures], draft.features)} onEdit={() => onEdit(4)} />
        <SummaryBlock title="Description" value={draft.description.trim() || '없음'} onEdit={() => onEdit(5)} />
        <SummaryBlock
          title="Timeline"
          value={[labelOf(timelineChoices, draft.timeline), draft.desiredCompletionDate ? `희망 완료일 ${draft.desiredCompletionDate}` : ''].filter(Boolean).join('\n')}
          onEdit={() => onEdit(6)}
        />
        <SummaryBlock title="Budget" value={labelOf(budgetChoices, draft.budget)} onEdit={() => onEdit(7)} />
        <SummaryBlock title="References" value={referenceText} onEdit={() => onEdit(8)} />
        <SummaryBlock title="Contact" value={contactText} onEdit={() => onEdit(9)} />
      </div>
      <div className="mt-10 border-t border-line pt-8">
        <p className="max-w-xl text-sm leading-relaxed text-ink-soft">프로젝트 상담은 현재 Contact를 통해 접수하고 있습니다.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="button" variant="ghost" onClick={() => onEdit(9)}>
            이전
          </Button>
          <Button type="button" onClick={continueToContact}>
            문의 내용 이어서 보내기
          </Button>
          <ButtonLink to="/studio" variant="secondary">
            Studio로 돌아가기
          </ButtonLink>
        </div>
        {import.meta.env.DEV ? (
          <div className="mt-8">
            <Button type="button" variant="ghost" onClick={onDevCheck}>
              개발 환경에서 초안만 확인
            </Button>
            {devChecked ? <p className="mt-3 text-sm text-ink-soft">저장되지 않았습니다. 개발 환경에서 입력 내용만 확인했습니다.</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
