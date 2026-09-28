const previews = {
  Startup: {
    nav: ['Overview', 'Offer', 'Contact'],
    title: '서비스를 알리고 문의를 받는 첫 페이지',
    blocks: ['무엇을 하는지', '누구에게 필요한지', '어떻게 시작하는지'],
    cta: '문의하기',
  },
  'Solo Business': {
    nav: ['Work', 'About', 'Contact'],
    title: '한 사람의 일과 연락을 정리한 페이지',
    blocks: ['소개', '서비스', '연락'],
    cta: '연락하기',
  },
  'Small Business': {
    nav: ['Menu', 'Visit', 'Reserve'],
    title: '매장, 메뉴, 예약을 보여주는 페이지',
    blocks: ['메뉴', '방문', '예약'],
    cta: '예약하기',
  },
  Portfolio: {
    nav: ['Index', 'Profile', 'Contact'],
    title: '작업과 프로필을 한 흐름으로 보여주는 페이지',
    blocks: ['작업', '프로필', '연락'],
    cta: '작업 보기',
  },
} as const

export type ReadyPreviewName = keyof typeof previews

function BrowserBar() {
  return (
    <div className="flex h-10 items-center gap-2 border-b border-line px-4">
      <span className="h-1.5 w-1.5 bg-ink" />
      <span className="h-1.5 w-1.5 bg-line" />
      <span className="h-1.5 w-1.5 bg-line" />
      <span className="ml-3 h-5 flex-1 border border-line bg-canvas" />
    </div>
  )
}

export function ReadyPreview({ name }: { name: ReadyPreviewName }) {
  const page = previews[name]

  return (
    <div className="border border-line bg-paper">
      <BrowserBar />
      <div key={name} className="fade-in p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <p className="text-sm font-semibold tracking-tight text-ink">Site</p>
          <ul className="flex gap-4">
            {page.nav.map((item) => (
              <li key={item} className="text-xs text-ink-soft">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-signal">{name}</p>
            <p className="mt-3 max-w-[14em] text-2xl font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-3xl">
              {page.title}
            </p>
          </div>
          <div className="flex h-10 w-fit items-center bg-ink px-4 text-sm text-white">{page.cta}</div>
        </div>
        <ul className="grid gap-px border border-line bg-line sm:grid-cols-3">
          {page.blocks.map((block) => (
            <li key={block} className="bg-paper p-4">
              <p className="text-sm font-medium text-ink">{block}</p>
              <div className="mt-3 h-2 w-4/5 bg-canvas" />
              <div className="mt-2 h-2 w-3/5 bg-canvas" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function ReadyThumb({ name, active }: { name: ReadyPreviewName; active: boolean }) {
  const page = previews[name]

  return (
    <div className={`border bg-paper transition duration-200 ${active ? 'border-ink' : 'border-line hover:scale-[1.02] hover:border-ink-faint'}`}>
      <div className="flex h-7 items-center gap-1 border-b border-line px-2">
        <span className="h-1 w-1 bg-ink" />
        <span className="h-1 w-1 bg-line" />
        <span className="ml-1 h-px flex-1 bg-line" />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-ink">Site</span>
          <span className="text-[10px] text-ink-soft">{page.nav[0]}</span>
        </div>
        <p className="mt-3 text-sm font-semibold tracking-tight text-ink">{name}</p>
        <div className="mt-3 grid grid-cols-3 gap-1">
          {page.blocks.map((block) => (
            <span key={block} className="h-6 border border-line bg-canvas" />
          ))}
        </div>
      </div>
    </div>
  )
}
