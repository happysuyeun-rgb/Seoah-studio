const STEPS = [
  { key: 'template', label: '템플릿 선택' },
  { key: 'upload', label: '자료 업로드' },
  { key: 'input', label: '텍스트 입력' },
  { key: 'ai', label: 'AI 커스터마이징' },
  { key: 'preview', label: '미리보기' },
] as const

export type StepKey = (typeof STEPS)[number]['key']

interface StepIndicatorProps {
  currentStep: StepKey
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 py-4 sm:gap-4" aria-label="진행 단계">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex
        const isCurrent = i === currentIndex
        return (
          <div key={step.key} className="flex items-center">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                isCurrent ? 'bg-primary text-white' : isDone ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isDone ? '✓' : i + 1}
            </span>
            <span className={`ml-2 hidden text-sm sm:inline ${isCurrent ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-2 hidden h-px w-4 bg-gray-200 sm:block" aria-hidden />}
          </div>
        )
      })}
    </nav>
  )
}
