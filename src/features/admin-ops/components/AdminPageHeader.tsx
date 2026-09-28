export function AdminPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm text-ink-soft">{description}</p> : null}
    </header>
  )
}

export function AdminEmptyState({ title }: { title: string }) {
  return <p className="mt-8 border border-dashed border-line px-6 py-14 text-sm text-ink-soft">{title}</p>
}

export function AdminMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line py-4">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  )
}
