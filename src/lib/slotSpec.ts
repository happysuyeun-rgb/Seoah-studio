/** v2 S1-P5: 템플릿 슬롯 12종 + font_hint 매핑 */

export const SLOT_KEYS = [
  'company',
  'headline',
  'description',
  'feature_1',
  'feature_2',
  'feature_3',
  'cta',
  'contact',
  'color_primary',
  'color_secondary',
  'font_hint',
  'logo_url',
] as const

/** 권장 슬롯(템플릿에 있으면 좋은 변수) */
export const RECOMMENDED_SLOTS = [...SLOT_KEYS]

/** 필수 슬롯 누락 시 저장 전 경고 */
export const REQUIRED_SLOTS = ['company', 'headline', 'cta'] as const

export const FONT_HINT_TO_URL: Record<string, string> = {
  'Noto Sans KR':
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap',
  'Nanum Gothic':
    'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap',
  'Nanum Myeongjo':
    'https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap',
  Jua: 'https://fonts.googleapis.com/css2?family=Jua&display=swap',
  'Gowun Batang':
    'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap',
  Pretendard:
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
}

export function getFontUrl(fontHint: string): string {
  return FONT_HINT_TO_URL[fontHint.trim()] ?? ''
}
