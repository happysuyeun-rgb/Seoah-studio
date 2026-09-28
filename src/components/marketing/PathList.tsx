import { Link } from 'react-router-dom'

type PathItem = {
  label: string
  text: string
  to: string
}

export function PathList({ items }: { items: PathItem[] }) {
  return (
    <ol className="mt-14 border-t border-line lg:mt-16">
      {items.map((item, index) => (
        <li key={item.label} className="border-b border-line">
          <Link
            to={item.to}
            className="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 py-8 transition-colors hover:bg-paper sm:grid-cols-[6.5rem_14rem_minmax(0,1fr)_auto] sm:gap-x-8 sm:py-12"
          >
            <span className="text-4xl font-semibold tabular-nums tracking-[-0.04em] text-ink-faint sm:text-5xl">
              0{index + 1}
            </span>
            <span className="text-2xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">{item.label}</span>
            <span className="col-start-2 max-w-copy text-lead text-ink-soft sm:col-start-3">{item.text}</span>
            <span className="hidden text-xl text-ink-faint transition-transform duration-200 group-hover:translate-x-1.5 sm:block" aria-hidden>
              →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
