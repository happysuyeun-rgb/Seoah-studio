const toneClass = {
  neutral: 'border-line bg-paper text-ink-soft',
  signal: 'border-signal bg-signal-soft text-signal',
  warning: 'border-ink bg-paper text-ink',
  success: 'border-ink bg-ink text-white',
} as const

export function StatusBadge({ children, tone = 'neutral' }: { children: string; tone?: keyof typeof toneClass }) {
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${toneClass[tone]}`}>{children}</span>
}
