import { projectStages, type ProjectStage } from '../types'

export function ProgressTimeline({ current }: { current: ProjectStage | null }) {
  return (
    <ol className="grid sm:grid-cols-6">
      {projectStages.map((stage, index) => {
        const active = stage === current
        return (
          <li key={stage} className="border-t border-line py-3 sm:pr-3">
            <span className="block text-xs text-ink-faint">{String(index + 1).padStart(2, '0')}</span>
            <span className={`mt-1 block text-sm ${active ? 'font-medium text-signal' : 'text-ink'}`}>{stage}</span>
          </li>
        )
      })}
    </ol>
  )
}
