type RequestProgressProps = {
  current: number
  total: number
}

const labels = ['유형', '상태', '목표', '대상', '기능', '설명', '일정', '예산', '참고', '연락처', '확인']

export function RequestProgress({ current, total }: RequestProgressProps) {
  const step = current + 1
  const label = labels[current] ?? ''

  return (
    <div>
      <p className="text-sm tabular-nums text-ink-faint">
        {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
        <span className="ml-3 text-ink">{label}</span>
      </p>
      <ol className="mt-4 flex gap-1" aria-label="의뢰 진행">
        {labels.map((name, index) => (
          <li
            key={name}
            aria-current={index === current ? 'step' : undefined}
            className={`h-px flex-1 ${index <= current ? 'bg-ink' : 'bg-line'}`}
          >
            <span className="sr-only">{name}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
