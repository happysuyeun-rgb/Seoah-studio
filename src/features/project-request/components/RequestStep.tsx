import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'

type RequestStepProps = {
  title: string
  hint?: string
  children: ReactNode
  error?: string | null
  onBack?: () => void
  onContinue?: () => void
  continueLabel?: string
}

export function RequestStep({ title, hint, children, error, onBack, onContinue, continueLabel = '계속' }: RequestStepProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="mt-14">
      <h1 ref={headingRef} tabIndex={-1} className="max-w-[16em] text-3xl font-semibold tracking-tight text-ink outline-none sm:text-4xl">
        {title}
      </h1>
      {hint ? <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">{hint}</p> : null}
      <div className="mt-10">{children}</div>
      {error ? (
        <p className="mt-4 text-sm text-ink" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-12 flex items-center justify-between gap-4">
        {onBack ? (
          <Button type="button" variant="ghost" onClick={onBack}>
            이전
          </Button>
        ) : (
          <span />
        )}
        {onContinue ? (
          <Button type="button" onClick={onContinue}>
            {continueLabel}
          </Button>
        ) : null}
      </div>
    </section>
  )
}
