type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeading({ eyebrow, title, description, align = 'left' }: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'mx-auto text-center' : 'text-left'

  return (
    <header className={alignClass}>
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-signal">{eyebrow}</p>
      ) : null}
      <h2 className={`max-w-[18em] text-title text-ink ${align === 'center' ? 'mx-auto' : ''} ${eyebrow ? 'mt-4' : ''}`}>{title}</h2>
      {description ? (
        <p className={`mt-5 max-w-copy text-lead text-ink-soft ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      ) : null}
    </header>
  )
}
