import type { TemplatePublic } from '../types'

const DEMO_DATA: Record<string, string> = {
  company: 'DEMO COMPANY',
  headline: '당신의 비즈니스를 알려주세요',
  description: 'AI가 분석해 맞춤형 랜딩을 만들어 드립니다.',
  cta: '시작하기',
  color_primary: '#1A4FA0',
  color_secondary: '#E8EEFA',
  feature_1: '기능 1',
  feature_2: '기능 2',
  feature_3: '기능 3',
  contact: 'contact@demo.com',
  font_hint: 'Noto Sans KR',
  logo_url: '',
}

function renderDemoPreviewHtml() {
  // 공개용 미리보기: scripts는 포함하지 않음(기본적으로 텍스트/스타일만).
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{
      --color-primary:${DEMO_DATA.color_primary};
      --color-secondary:${DEMO_DATA.color_secondary};
      --font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    }
    body{
      margin:0;
      font-family:var(--font-family);
      background:linear-gradient(140deg,#0d0f1a,#121632);
      color:#F0EEF8;
      padding:48px 20px;
    }
    .wrap{max-width:920px;margin:0 auto;}
    .badge{display:inline-block;padding:6px 12px;border:1px solid rgba(79,126,255,.35);border-radius:999px;color:var(--color-primary);background:rgba(79,126,255,.10);font-size:12px;font-weight:600;}
    h1{margin:18px 0 12px;font-size:48px;line-height:1.1;}
    p{margin:0 0 22px;color:rgba(240,238,248,.78);font-size:16px;line-height:1.8;}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:26px;}
    .card{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);border-radius:16px;padding:16px;}
    .card b{display:block;margin-bottom:6px;}
    .cta{
      display:inline-flex;align-items:center;justify-content:center;
      padding:14px 22px;border-radius:14px;
      background:var(--color-primary);color:#fff;text-decoration:none;font-weight:700;
      box-shadow:0 10px 40px rgba(79,126,255,.22);
    }
    @media (max-width:800px){h1{font-size:34px}.grid{grid-template-columns:1fr;}}
  </style>
</head>
<body>
  <div class="wrap">
    <span class="badge">Preview (Local)</span>
    <h1>${DEMO_DATA.headline}</h1>
    <p>${DEMO_DATA.description}</p>
    <a class="cta" href="#">${DEMO_DATA.cta}</a>
    <div class="grid">
      <div class="card"><b>${DEMO_DATA.feature_1}</b><span>간단 설명</span></div>
      <div class="card"><b>${DEMO_DATA.feature_2}</b><span>간단 설명</span></div>
      <div class="card"><b>${DEMO_DATA.feature_3}</b><span>간단 설명</span></div>
    </div>
  </div>
</body>
</html>`
}

export const MOCK_TEMPLATES_PUBLIC: TemplatePublic[] = [
  {
    id: 'mock-portfolio-1',
    name: '포트폴리오 미니 랜딩',
    category: 'portfolio',
    thumbnail_url: null,
    variables: null,
    tags: ['기본', '미니멀', 'SaaS'],
    preview_html: renderDemoPreviewHtml(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-homepage-1',
    name: '홈페이지 스타터',
    category: 'homepage',
    thumbnail_url: null,
    variables: null,
    tags: ['스타터', '브랜드'],
    preview_html: renderDemoPreviewHtml(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-appmvp-1',
    name: '앱 MVP 소개 페이지',
    category: 'app-mvp',
    thumbnail_url: null,
    variables: null,
    tags: ['MVP', '제품'],
    preview_html: renderDemoPreviewHtml(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
]

export function getMockTemplatePublicById(id: string | undefined) {
  if (!id) return null
  return MOCK_TEMPLATES_PUBLIC.find((t) => t.id === id) ?? null
}

