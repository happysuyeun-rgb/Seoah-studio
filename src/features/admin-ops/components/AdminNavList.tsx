import { Link } from 'react-router-dom'
import { adminNav, isAdminNavActive } from '../nav'

export function AdminNavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="grid gap-6">
      {adminNav.map((group) => (
        <div key={group.group}>
          <p className="text-[11px] tracking-wide text-ink-faint">{group.group}</p>
          <ul className="mt-2 grid gap-1">
            {group.items.map((item) => {
              const end = 'end' in item && item.end
              const active = isAdminNavActive(pathname, item.to, end)
              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    onClick={onNavigate}
                    className={`block min-h-9 px-2 py-1.5 text-sm ${active ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
