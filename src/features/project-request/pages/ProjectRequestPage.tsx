import { useEffect, useState } from 'react'
import { ChoiceOption } from '../components/ChoiceOption'
import { MultiChoice } from '../components/MultiChoice'
import { RequestProgress } from '../components/RequestProgress'
import { RequestStep } from '../components/RequestStep'
import { RequestSummary } from '../components/RequestSummary'
import {
  advancedFeatures,
  basicFeatures,
  budgetChoices,
  currentStatusOptions,
  goalOptions,
  projectTypeOptions,
  requestStepCount,
  targetUserOptions,
  timelineChoices,
} from '../options'
import { stepError, useProjectRequestStore } from '../store/useProjectRequestStore'
import { usePageTitle } from '../../../components/marketing/usePageTitle'
import { useAuthStore } from '../../../store/authStore'

export function ProjectRequestPage() {
  usePageTitle('프로젝트 의뢰 — SEOAH.STUDIO')
  const user = useAuthStore((state) => state.user)
  const draft = useProjectRequestStore()
  const [error, setError] = useState<string | null>(null)
  const [devChecked, setDevChecked] = useState(false)

  useEffect(() => {
    if (!user) return
    const metaName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : ''
    const current = useProjectRequestStore.getState().contact
    const name = current.name || metaName
    const email = current.email || user.email || ''
    if (name === current.name && email === current.email) return
    useProjectRequestStore.getState().setContact({ name, email })
  }, [user])

  const goBack = () => {
    setError(null)
    draft.setStep(Math.max(0, draft.currentStep - 1))
  }

  const goNext = () => {
    const message = stepError(draft)
    if (message) {
      setError(message)
      return
    }
    setError(null)
    draft.setStep(Math.min(requestStepCount - 1, draft.currentStep + 1))
  }

  const edit = (step: number) => {
    setError(null)
    setDevChecked(false)
    draft.setStep(step)
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
      <RequestProgress current={draft.currentStep} total={requestStepCount} />
      {draft.currentStep === 0 ? (
        <RequestStep key="type" title="무엇을 만들고 싶으신가요?" error={error} onContinue={goNext}>
          <MultiChoice legend="무엇을 만들고 싶으신가요?">
            {projectTypeOptions.map((option) => (
              <ChoiceOption
                key={option.id}
                name="projectType"
                value={option.id}
                title={option.title}
                description={option.description}
                checked={draft.projectType === option.id}
                onChange={() => draft.setProjectType(option.id)}
              />
            ))}
          </MultiChoice>
        </RequestStep>
      ) : null}
      {draft.currentStep === 1 ? (
        <RequestStep key="status" title="현재 어디까지 준비되어 있나요?" error={error} onBack={goBack} onContinue={goNext}>
          <MultiChoice legend="현재 어디까지 준비되어 있나요?">
            {currentStatusOptions.map((option) => (
              <ChoiceOption
                key={option.id}
                name="currentStatus"
                value={option.id}
                title={option.title}
                checked={draft.currentStatus === option.id}
                onChange={() => draft.setCurrentStatus(option.id)}
              />
            ))}
          </MultiChoice>
        </RequestStep>
      ) : null}
      {draft.currentStep === 2 ? (
        <RequestStep key="goal" title="이번 프로젝트로 이루고 싶은 것은 무엇인가요?" hint="여러 개를 선택할 수 있습니다." error={error} onBack={goBack} onContinue={goNext}>
          <MultiChoice legend="이번 프로젝트로 이루고 싶은 것은 무엇인가요?">
            {goalOptions.map((option) => (
              <ChoiceOption
                key={option.id}
                type="checkbox"
                name="goals"
                value={option.id}
                title={option.title}
                checked={draft.goals.includes(option.id)}
                onChange={() => draft.toggleGoal(option.id)}
              />
            ))}
          </MultiChoice>
        </RequestStep>
      ) : null}
      {draft.currentStep === 3 ? (
        <RequestStep key="audience" title="누가 사용하나요?" hint="여러 개를 선택할 수 있습니다." error={error} onBack={goBack} onContinue={goNext}>
          <MultiChoice legend="누가 사용하나요?">
            {targetUserOptions.map((option) => (
              <ChoiceOption
                key={option.id}
                type="checkbox"
                name="targetUsers"
                value={option.id}
                title={option.title}
                checked={draft.targetUsers.includes(option.id)}
                onChange={() => draft.toggleTargetUser(option.id)}
              />
            ))}
          </MultiChoice>
          <label className="mt-8 block">
            <span className="mb-2 block text-sm font-medium text-ink">대상에 대해 더 설명할 내용</span>
            <textarea
              name="targetUserDescription"
              value={draft.targetUserDescription}
              onChange={(event) => draft.setTargetUserDescription(event.target.value)}
              className="min-h-28 w-full border border-line bg-paper px-3 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-ink"
            />
          </label>
        </RequestStep>
      ) : null}
      {draft.currentStep === 4 ? (
        <RequestStep key="features" title="필요한 기능을 골라 주세요." hint="지금 확실한 것만 골라도 됩니다." error={error} onBack={goBack} onContinue={goNext}>
          <fieldset>
            <legend className="text-sm font-medium text-ink">Basic</legend>
            <div className="mt-3 border-b border-line">
              {basicFeatures.map((option) => (
                <ChoiceOption
                  key={option.id}
                  type="checkbox"
                  name="features"
                  value={option.id}
                  title={option.title}
                  checked={draft.features.includes(option.id)}
                  onChange={() => draft.toggleFeature(option.id)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-10">
            <legend className="text-sm font-medium text-ink">Advanced</legend>
            <div className="mt-3 border-b border-line">
              {advancedFeatures.map((option) => (
                <ChoiceOption
                  key={option.id}
                  type="checkbox"
                  name="features-advanced"
                  value={option.id}
                  title={option.title}
                  checked={draft.features.includes(option.id)}
                  onChange={() => draft.toggleFeature(option.id)}
                />
              ))}
            </div>
          </fieldset>
        </RequestStep>
      ) : null}
      {draft.currentStep === 5 ? (
        <RequestStep key="description" title="만들고 싶은 서비스를 자유롭게 설명해주세요." error={error} onBack={goBack} onContinue={goNext}>
          <label className="block">
            <span className="sr-only">설명</span>
            <textarea
              name="description"
              maxLength={3000}
              value={draft.description}
              onChange={(event) => draft.setDescription(event.target.value)}
              placeholder={'어떤 문제를 해결하려는지,\n사용자가 무엇을 할 수 있어야 하는지\n편하게 적어주세요.'}
              className="min-h-48 w-full border border-line bg-paper px-3 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-ink"
            />
          </label>
          <p className="mt-2 text-xs tabular-nums text-ink-faint">{draft.description.length} / 3000</p>
        </RequestStep>
      ) : null}
      {draft.currentStep === 6 ? (
        <RequestStep key="timeline" title="언제쯤 필요하고, 희망 완료일이 있나요?" error={error} onBack={goBack} onContinue={goNext}>
          <MultiChoice legend="일정">
            {timelineChoices.map((option) => (
              <ChoiceOption
                key={option.id}
                name="timeline"
                value={option.id}
                title={option.title}
                checked={draft.timeline === option.id}
                onChange={() => draft.setTimeline(option.id)}
              />
            ))}
          </MultiChoice>
          <label className="mt-8 block max-w-xs">
            <span className="mb-2 block text-sm font-medium text-ink">희망 완료일</span>
            <input
              type="date"
              name="desiredCompletionDate"
              value={draft.desiredCompletionDate}
              onChange={(event) => draft.setDesiredCompletionDate(event.target.value)}
              className="w-full border border-line bg-paper px-3 py-3 text-sm text-ink outline-none focus:border-ink"
            />
          </label>
        </RequestStep>
      ) : null}
      {draft.currentStep === 7 ? (
        <RequestStep key="budget" title="생각하고 있는 예산 범위가 있나요?" hint="확정 견적이 아닙니다. 이후 범위를 나눌 때 참고합니다." error={error} onBack={goBack} onContinue={goNext}>
          <MultiChoice legend="예산">
            {budgetChoices.map((option) => (
              <ChoiceOption
                key={option.id}
                name="budget"
                value={option.id}
                title={option.title}
                checked={draft.budget === option.id}
                onChange={() => draft.setBudget(option.id)}
              />
            ))}
          </MultiChoice>
        </RequestStep>
      ) : null}
      {draft.currentStep === 8 ? (
        <RequestStep key="references" title="참고하고 싶은 주소가 있나요?" hint="파일은 받지 않습니다. 주소와 메모만 적으면 됩니다." error={error} onBack={goBack} onContinue={goNext}>
          <div className="grid gap-8">
            {draft.references.map((item, index) => (
              <fieldset key={item.id} className="border-t border-line pt-6">
                <legend className="text-sm font-medium text-ink">참고 {index + 1}</legend>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-medium text-ink">URL</span>
                  <input
                    type="url"
                    name={`reference-url-${item.id}`}
                    value={item.url}
                    onChange={(event) => draft.updateReference(item.id, { url: event.target.value })}
                    className="w-full border border-line bg-paper px-3 py-3 text-sm text-ink outline-none focus:border-ink"
                  />
                </label>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-medium text-ink">Reference Note</span>
                  <textarea
                    name={`reference-note-${item.id}`}
                    value={item.note}
                    onChange={(event) => draft.updateReference(item.id, { note: event.target.value })}
                    placeholder="이 사이트에서 참고하고 싶은 점"
                    className="min-h-24 w-full border border-line bg-paper px-3 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-ink"
                  />
                </label>
                <button type="button" onClick={() => draft.removeReference(item.id)} className="mt-3 text-sm text-ink-soft hover:text-ink">
                  이 참고 삭제
                </button>
              </fieldset>
            ))}
          </div>
          <button type="button" onClick={() => draft.addReference()} className="mt-6 text-sm font-medium text-ink">
            참고 URL 추가
          </button>
        </RequestStep>
      ) : null}
      {draft.currentStep === 9 ? (
        <RequestStep key="contact" title="연락처를 알려 주세요." error={error} onBack={goBack} onContinue={goNext} continueLabel="확인">
          <div className="grid gap-6">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Name</span>
              <input
                name="name"
                autoComplete="name"
                value={draft.contact.name}
                onChange={(event) => draft.setContact({ name: event.target.value })}
                className="w-full border border-line bg-paper px-3 py-3 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Email</span>
              <input
                name="email"
                type="text"
                inputMode="email"
                autoComplete="email"
                value={draft.contact.email}
                onChange={(event) => draft.setContact({ email: event.target.value })}
                className="w-full border border-line bg-paper px-3 py-3 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Phone</span>
              <input
                name="phone"
                autoComplete="tel"
                value={draft.contact.phone}
                onChange={(event) => draft.setContact({ phone: event.target.value })}
                className="w-full border border-line bg-paper px-3 py-3 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Company</span>
              <input
                name="company"
                autoComplete="organization"
                value={draft.contact.company}
                onChange={(event) => draft.setContact({ company: event.target.value })}
                className="w-full border border-line bg-paper px-3 py-3 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
          </div>
        </RequestStep>
      ) : null}
      {draft.currentStep === 10 ? (
        <RequestSummary key="summary" draft={draft} onEdit={edit} devChecked={devChecked} onDevCheck={() => setDevChecked(true)} />
      ) : null}
    </main>
  )
}
