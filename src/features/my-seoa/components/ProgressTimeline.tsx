import { projectStages, type ProjectStage } from '../types'

export function ProgressTimeline({ current }: { current: ProjectStage | null }) {
  return (
    <ol className="grid sm:grid-cols-6">
      {projectStages.map((stage, index) => {
        const currentIndex = current ? projectStages.indexOf(current) : -1
        const active = stage === current
        const reached = currentIndex >= 0 && index < currentIndex
        const labelClass = active ? 'font-medium text-signal' : reached ? 'text-ink' : 'text-ink-faint'
        return (
          <li key={stage} className="border-t border-line py-3 sm:pr-3">
            <span className="block text-xs text-ink-faint">{String(index + 1).padStart(2, '0')}</span>
            <span className={`mt-1 block text-sm ${labelClass}`}>{stage}</span>
          </li>
        )
      })}
    </ol>
  )
}
