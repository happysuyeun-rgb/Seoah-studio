export function FilterTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { id: T; label: string }[]
  onChange: (id: T) => void
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2" role="tablist">
      {options.map((option) => {
        const selected = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={`min-h-9 border px-3 text-sm ${selected ? 'border-ink bg-ink text-white' : 'border-line bg-paper text-ink-soft'}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
