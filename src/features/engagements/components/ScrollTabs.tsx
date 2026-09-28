import { useRef } from 'react'

export function ScrollTabs<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { id: T; label: string }[]
  onChange: (id: T) => void
  label: string
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const move = (current: number, direction: 1 | -1) => {
    const next = (current + direction + options.length) % options.length
    onChange(options[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex w-max gap-2" role="tablist" aria-label={label}>
        {options.map((option, index) => {
          const selected = option.id === value
          return (
            <button
              key={option.id}
              ref={(node) => {
                refs.current[index] = node
              }}
              type="button"
              role="tab"
              id={`tab-${option.id}`}
              aria-selected={selected}
              aria-controls={`panel-${option.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(option.id)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                  event.preventDefault()
                  move(index, 1)
                }
                if (event.key === 'ArrowLeft') {
                  event.preventDefault()
                  move(index, -1)
                }
              }}
              className={`min-h-9 shrink-0 border px-3 text-sm ${selected ? 'border-ink bg-ink text-white' : 'border-line bg-paper text-ink-soft'}`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
