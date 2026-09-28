import type { ReactNode } from 'react'

function Chrome({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-line bg-paper ${className}`}>
      <div className="flex h-9 items-center gap-2 border-b border-line px-3">
        <span className="h-1.5 w-1.5 bg-ink" />
        <span className="h-1.5 w-1.5 bg-line" />
        <span className="h-1.5 w-1.5 bg-line" />
        <span className="ml-2 h-px flex-1 bg-line" />
      </div>
      {children}
    </div>
  )
}

export function ProductComposition() {
  return (
    <div className="relative min-h-[32rem] sm:min-h-[40rem] lg:min-h-[44rem]" aria-hidden>
      <Chrome className="absolute inset-x-0 top-8 bottom-10 sm:inset-x-1 lg:inset-x-0">
        <div className="grid h-[calc(100%-2.25rem)] grid-cols-[4.75rem_minmax(0,1fr)] sm:grid-cols-[6.5rem_minmax(0,1fr)]">
          <div className="border-r border-line px-3 py-4 sm:px-4">
            {['Ready', 'Studio', 'Care'].map((item, index) => (
              <p key={item} className={`py-2.5 text-xs tracking-tight ${index === 0 ? 'font-medium text-ink' : 'text-ink-soft'}`}>
                {item}
              </p>
            ))}
          </div>
          <div className="flex flex-col p-4 sm:p-6 lg:p-7">
            <p className="text-[11px] font-medium tracking-[0.16em] text-ink-soft">WEBSITE</p>
            <p className="mt-4 max-w-[9em] text-2xl font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-3xl">
              Ready to launch
            </p>
            <p className="mt-3 max-w-[14em] text-sm leading-relaxed text-ink-soft">Choose a structure, then review.</p>
            <div className="mt-6 grid flex-1 grid-cols-2 gap-3">
              <div className="border border-line p-3">
                <p className="text-[11px] tracking-[0.12em] text-ink-soft">PAGE</p>
                <div className="mt-3 h-2 w-4/5 bg-canvas" />
                <div className="mt-2 h-2 w-3/5 bg-canvas" />
              </div>
              <div className="border border-line bg-signal-soft p-3">
                <p className="text-[11px] tracking-[0.12em] text-ink-soft">REVIEW</p>
                <div className="mt-3 h-2 w-3/5 bg-paper" />
                <div className="mt-2 h-2 w-2/5 bg-paper" />
              </div>
            </div>
            <div className="mt-5 inline-flex h-9 w-fit items-center bg-signal px-4 text-xs font-medium text-white">Open</div>
          </div>
        </div>
      </Chrome>

      <Chrome className="float-soft absolute bottom-0 left-0 w-[58%] sm:w-[52%]">
        <div className="p-4 sm:p-5">
          <p className="text-[11px] font-medium tracking-[0.16em] text-ink-soft">DASHBOARD</p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {['Homepage draft', 'Care request', 'Launch checklist'].map((row) => (
              <li key={row} className="flex items-center justify-between py-2.5 text-sm text-ink">
                <span>{row}</span>
                <span className="text-xs text-ink-soft">Review</span>
              </li>
            ))}
          </ul>
        </div>
      </Chrome>

      <div className="float-soft-delay absolute right-0 top-16 w-[38%] border border-line bg-canvas sm:top-20 sm:w-[32%]">
        <div className="border-b border-line px-3 py-2 text-[11px] font-medium tracking-[0.16em] text-ink-soft">MOBILE</div>
        <div className="space-y-2 p-3">
          <p className="text-sm font-medium tracking-tight text-ink">Product</p>
          <div className="h-14 border border-line bg-paper" />
          <div className="h-2 w-full bg-paper" />
          <div className="h-2 w-4/5 bg-paper" />
          <div className="flex h-8 items-center bg-ink px-2 text-[11px] text-white">Continue</div>
        </div>
      </div>

      <div className="absolute right-[6%] top-0 hidden border border-line bg-paper px-3 py-2.5 sm:block">
        <p className="text-[11px] font-medium tracking-[0.16em] text-ink-soft">STATUS</p>
        <p className="mt-1 text-sm font-medium text-ink">In review</p>
      </div>
    </div>
  )
}
