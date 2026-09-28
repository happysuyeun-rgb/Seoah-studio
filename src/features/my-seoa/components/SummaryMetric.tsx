export function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-paper px-5 py-4">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  )
}
