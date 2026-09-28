import { ButtonLink } from '../../../components/ui/Button'

export function EmptyState({
  title,
  action,
}: {
  title: string
  action?: { to: string; label: string }
}) {
  return (
    <div className="border border-dashed border-line px-6 py-14">
      <p className="text-sm text-ink-soft">{title}</p>
      {action ? (
        <div className="mt-5">
          <ButtonLink to={action.to} size="sm">
            {action.label}
          </ButtonLink>
        </div>
      ) : null}
    </div>
  )
}
