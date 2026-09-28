import { Link } from 'react-router-dom'
import type { ActionRequired } from '../types'

export function ActionRequiredPanel({ action }: { action: ActionRequired | null }) {
  if (!action) {
    return <p className="text-sm text-ink-soft">지금 확인할 작업이 없습니다.</p>
  }

  return (
    <section className="border-t border-line py-4" aria-label="해야 할 일">
      <p className="text-xs text-ink-faint">{action.label}</p>
      <p className="mt-2 text-sm text-ink">{action.description}</p>
      {action.dueDate ? <p className="mt-2 text-sm text-ink-soft">기한 {action.dueDate}</p> : null}
      <Link to={action.ctaTarget} className="mt-3 inline-flex min-h-11 items-center text-sm text-signal">
        {action.ctaLabel}
      </Link>
    </section>
  )
}
