export function StatusBadge({ children }: { children: string }) {
  return <span className="inline-flex rounded-full border border-line bg-paper px-2 py-0.5 text-xs text-ink-soft">{children}</span>
}
