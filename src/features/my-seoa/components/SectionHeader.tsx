export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      {description ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">{description}</p> : null}
    </header>
  )
}

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-4">
      <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
      {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
    </header>
  )
}
