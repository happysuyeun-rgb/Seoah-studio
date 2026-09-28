type ChoiceOptionProps = {
  name: string
  value: string
  title: string
  description?: string
  checked: boolean
  onChange: () => void
  type?: 'radio' | 'checkbox'
}

export function ChoiceOption({ name, value, title, description, checked, onChange, type = 'radio' }: ChoiceOptionProps) {
  return (
    <label className={`flex cursor-pointer gap-4 border-t border-line px-1 py-5 focus-within:bg-canvas ${checked ? 'bg-canvas' : ''}`}>
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} className="mt-1 h-4 w-4 shrink-0 accent-ink" />
      <span>
        <span className="block text-base font-medium tracking-tight text-ink">{title}</span>
        {description ? <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{description}</span> : null}
      </span>
    </label>
  )
}
