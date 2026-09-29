// Supabase Edge Function: AI 커스터마이징 (Claude API + 파일 파싱 + 60초 타임아웃, v2.1 상태기계)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import JSZip from 'https://esm.sh/jszip'
import { decodeUtf8, fileExtension, selectUploadPaths, textFromDocxDocumentXml, textFromPptxSlideXml } from './files.ts'
import sanitizeHtml from 'https://esm.sh/sanitize-html@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' }
const TIMEOUT_MS = 60_000

type ApiError = { code: string; message: string; detail?: unknown }
type ApiResponse = { success: boolean; error?: ApiError; message?: string; processingMs?: number; traceId?: string; projectId?: string }
function jsonResponse(obj: ApiResponse, status: number, traceId: string, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify({ ...obj, traceId }), { status, headers: { ...cors, 'Content-Type': 'application/json', ...headers } })
}

// 12종 슬롯 (v2 S1-P5)
const SLOT_KEYS = [
  'company', 'headline', 'description', 'feature_1', 'feature_2', 'feature_3',
  'cta', 'contact', 'color_primary', 'color_secondary', 'font_hint', 'logo_url',
] as const

const FALLBACK: Record<string, string> = {
  company: 'YOUR COMPANY',
  headline: '당신의 비즈니스를 알려주세요',
  description: 'AI가 분석해 맞춤형 랜딩을 만들어 드립니다.',
  feature_1: '기능 1',
  feature_2: '기능 2',
  feature_3: '기능 3',
  cta: '시작하기',
  contact: 'contact@example.com',
  color_primary: '#1A4FA0',
  color_secondary: '#E8EEFA',
  font_hint: '',
  logo_url: '',
}

// font_hint → Google Fonts URL (v2 S1-P5)
const FONT_HINT_TO_URL: Record<string, string> = {
  'Noto Sans KR': 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap',
  'Nanum Gothic': 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap',
  'Nanum Myeongjo': 'https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap',
  'Jua': 'https://fonts.googleapis.com/css2?family=Jua&display=swap',
  'Gowun Batang': 'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap',
  'Pretendard': 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
}

type Extracted = Record<string, string>

async function textFromDocxBytes(bytes: Uint8Array): Promise<string | null> {
  try {
    const zip = await JSZip.loadAsync(bytes)
    const docXml = await zip.file('word/document.xml')?.async('string')
    return textFromDocxDocumentXml(docXml)
  } catch {
    return null
  }
}

async function textFromPptxBytes(bytes: Uint8Array): Promise<string | null> {
  try {
    const zip = await JSZip.loadAsync(bytes)
    const slideNames = Object.keys(zip.files).filter((n) => n.startsWith('ppt/slides/slide') && n.endsWith('.xml')).sort()
    const slides: string[] = []
    for (const name of slideNames) {
      const xml = await zip.file(name)?.async('string')
      if (xml) slides.push(xml)
    }
    return textFromPptxSlideXml(slides)
  } catch {
    return null
  }
}

function parseJsonFromText(text: string): Extracted | null {
  const trimmed = text.trim()
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
    const out: Extracted = { ...FALLBACK }
    for (const k of SLOT_KEYS) {
      if (parsed[k] != null && typeof parsed[k] === 'string') out[k] = parsed[k] as string
    }
    return out
  } catch {
    return null
  }
}

async function callClaude(rawText: string, apiKey: string): Promise<Extracted | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const system = `당신은 웹사이트 콘텐츠 추출 전문가입니다.
주어진 문서에서 정보를 추출하여 반드시 JSON만 반환하세요.
키: company, headline, description, feature_1, feature_2, feature_3, cta, contact, color_primary, color_secondary, font_hint, logo_url
값은 문자열만 사용하세요. 다른 내용 없이 JSON 객체만 출력하세요.`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: rawText || '콘텐츠가 없습니다. 기본값을 사용해 주세요.' }],
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!res.ok) return null
    const data = (await res.json()) as { content?: { type: string; text?: string }[] }
    const text = data.content?.find((c) => c.type === 'text')?.text ?? ''
    return parseJsonFromText(text)
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

function applyToHtml(html: string, params: Extracted): string {
  let out = html
  for (const k of SLOT_KEYS) {
    const v = params[k]
    if (v != null && v !== '') out = out.replaceAll(`{{${k}}}`, v)
  }
  const rootVars: string[] = []
  rootVars.push(`--color-primary:${params.color_primary || FALLBACK.color_primary}`)
  rootVars.push(`--color-secondary:${params.color_secondary || FALLBACK.color_secondary}`)
  const fontHint = (params.font_hint || '').trim()
  const fontUrl = fontHint ? (FONT_HINT_TO_URL[fontHint] ?? '') : ''
  if (fontHint && fontUrl) {
    rootVars.push(`--font-family:'${fontHint.replace(/'/g, "\\'")}', sans-serif`)
  }
  const rootCss = `:root{${rootVars.join(';')}}`
  const styleBlock = `<style>${rootCss}</style>`
  if (fontUrl) {
    const linkTag = `<link rel="stylesheet" href="${fontUrl}" />`
    if (out.includes('</head>')) {
      out = out.replace('</head>', `${linkTag}${styleBlock}</head>`)
    } else {
      out = `${linkTag}${styleBlock}${out}`
    }
  } else {
    if (out.includes('</head>')) out = out.replace('</head>', `${styleBlock}</head>`)
    else out = `${styleBlock}${out}`
  }
  return out
}

Deno.serve(async (req) => {
  const startMs = Date.now()
  const traceId = crypto.randomUUID()
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ success: false, error: { code: 'ENV_MISSING', message: '서버 환경 설정 오류' } }, 500, traceId)
  }

  let projectId: string | undefined
  try {
    let body: { projectId?: string }
    try {
      body = (await req.json()) as { projectId?: string }
    } catch {
      return jsonResponse({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid request body' } }, 400, traceId)
    }
    projectId = body.projectId
    if (!projectId) return jsonResponse({ success: false, error: { code: 'INVALID_PROJECT_ID', message: 'projectId required' } }, 400, traceId)

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authorization required' } }, 401, traceId)
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !user) return jsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401, traceId)

    const { data: project, error: projectErr } = await supabase.from('projects').select('id, user_id, input_data, template_id').eq('id', projectId).single()
    if (projectErr || !project) return jsonResponse({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404, traceId)
    if (project.user_id !== user.id) return jsonResponse({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, 403, traceId)

    const input = (project.input_data as { textInput?: string; filePaths?: string[]; fileUrls?: string[] }) ?? {}
    const selected = selectUploadPaths(input, user.id, project.id)
    if (!selected.ok) {
      return jsonResponse({ success: false, error: { code: 'FORBIDDEN_PATH', message: '업로드 경로가 올바르지 않습니다.' } }, 403, traceId)
    }

    const { error: parsingErr } = await supabase.from('projects').update({ status: 'parsing' }).eq('id', projectId)
    if (parsingErr) {
      console.error('ai-customize set parsing failed', parsingErr)
      return jsonResponse({ success: false, error: { code: 'UPDATE_FAILED', message: parsingErr.message }, processingMs: Date.now() - startMs }, 500, traceId)
    }

    const { data: template } = await supabase.from('templates').select('html_template').eq('id', project.template_id).single()
    if (!template?.html_template) {
      await supabase.from('projects').update({ status: 'error' }).eq('id', projectId)
      return jsonResponse({ success: false, error: { code: 'TEMPLATE_INVALID', message: 'Template not found' } }, 422, traceId)
    }

    const textInput = (input.textInput ?? '').trim()

    let rawText = ''
    for (const path of selected.paths) {
      const ext = fileExtension(path)
      const { data: file, error: downloadErr } = await supabase.storage.from('project-uploads').download(path)
      if (downloadErr || !file) continue
      const bytes = new Uint8Array(await file.arrayBuffer())
      if (ext === '.txt' || ext === '.md') {
        const text = decodeUtf8(bytes).trim()
        if (text) rawText += text + '\n\n'
        continue
      }
      if (ext === '.docx') {
        const text = await textFromDocxBytes(bytes)
        if (text) rawText += text + '\n\n'
        continue
      }
      if (ext === '.pptx') {
        const text = await textFromPptxBytes(bytes)
        if (text) rawText += text + '\n\n'
      }
    }
    if (textInput) rawText += textInput

    if (rawText.length === 0 && selected.paths.length > 0) {
      await supabase.from('projects').update({ status: 'error' }).eq('id', projectId)
      return jsonResponse(
        { success: false, error: { code: 'PARSE_FAILED', message: '파일을 읽을 수 없습니다. 텍스트를 직접 입력해 주세요.' }, processingMs: Date.now() - startMs },
        422,
        traceId
      )
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    let extracted: Extracted | null = null
    if (apiKey && rawText.length > 0) {
      extracted = await callClaude(rawText, apiKey)
      if (!extracted && rawText.length > 0) {
        console.error('ai-customize Claude returned no result')
        await supabase.from('projects').update({ status: 'error' }).eq('id', projectId)
        return jsonResponse(
          { success: false, error: { code: 'AI_UNAVAILABLE', message: 'AI 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, processingMs: Date.now() - startMs },
          503,
          traceId
        )
      }
    }
    const params: Extracted = extracted ?? FALLBACK

    let html = template.html_template
    html = applyToHtml(html, params)
    html = sanitizeHtml(html, {
      allowedTags: [
        'html', 'head', 'body', 'meta', 'title', 'style', 'link',
        'div', 'span', 'p', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'section', 'header', 'footer', 'main', 'nav', 'article', 'aside',
        'ul', 'ol', 'li', 'strong', 'em', 'br', 'button', 'form', 'input', 'label',
      ],
      allowedAttributes: {
        '*': ['style', 'class', 'id'],
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'width', 'height'],
        link: ['href', 'rel'],
        meta: ['charset', 'name', 'content'],
      },
    })

    const { error: updateErr } = await supabase.from('projects').update({
      output_html: html,
      custom_params: params,
      status: 'ready',
    }).eq('id', projectId)

    if (updateErr) {
      console.error('ai-customize update failed', updateErr)
      return jsonResponse({ success: false, error: { code: 'UPDATE_FAILED', message: updateErr.message }, processingMs: Date.now() - startMs }, 500, traceId)
    }
    return jsonResponse({ success: true, projectId, processingMs: Date.now() - startMs }, 200, traceId)
  } catch (e) {
    const err = e as Error
    console.error('ai-customize Critical', err?.message ?? e)
    const isTimeout = err?.name === 'AbortError' || err?.message?.includes('abort')
    if (projectId) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey)
        await supabase.from('projects').update({ status: 'error' }).eq('id', projectId)
      } catch (_) {}
    }
    return jsonResponse(
      {
        success: false,
        error: { code: isTimeout ? 'AI_TIMEOUT' : 'INTERNAL_ERROR', message: isTimeout ? '처리 시간이 초과되었습니다.' : (err?.message ?? '서버 오류') },
        processingMs: Date.now() - startMs,
      },
      isTimeout ? 408 : 500,
      traceId
    )
  }
})
