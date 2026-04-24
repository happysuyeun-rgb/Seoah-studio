/**
 * Edge Function / 페이지 에러 코드 → 사용자 메시지 매핑.
 * 문서: docs/ERROR_CODES_MAPPING.md, docs/EDGE_FUNCTIONS_API.md
 */

const MESSAGES: Record<string, string> = {
  // ── 인증 E-001~E-005 ──
  'E-001': '로그인 서버에 일시적 오류가 발생했습니다.',
  'E-002': '로그인 처리 중 오류가 발생했습니다.',
  'E-003': '로그인이 필요합니다.',
  'E-004': '인증이 만료되었습니다. 다시 로그인해주세요.',
  'E-005': '접근 권한이 없습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',

  // ── 업로드 E-010~E-014 ──
  'E-010': '지원하지 않는 파일 형식입니다.',
  'E-011': '파일 크기는 20MB 이하여야 합니다.',
  'E-012': '파일 업로드에 실패했습니다. 다시 시도해주세요.',
  'E-013': '콘텐츠를 입력하거나 파일을 업로드해주세요.',
  'E-014': '파일을 읽을 수 없습니다. 다른 파일을 사용해주세요.',

  // ── AI E-020~E-024 + Edge Function ──
  'E-020': '처리 시간이 초과되었습니다. 다시 시도해 주세요.',
  'E-021': 'AI 분석 중 오류가 발생했습니다. 기본값으로 적용합니다.',
  'E-022': '서비스 일시 점검 중입니다 (503).',
  'E-023': '일부 항목이 비어있습니다. 직접 수정해주세요.',
  'E-024': '처리 상태를 확인하는 중입니다...',
  INVALID_PROJECT_ID: 'projectId 형식 오류 또는 미존재.',
  MISSING_PROJECT_ID: 'projectId 형식 오류 또는 미존재.',
  NOT_FOUND: '해당 프로젝트를 찾을 수 없습니다.',
  AI_TIMEOUT: '처리 시간이 초과되었습니다. 다시 시도해 주세요.',
  PARSE_FAILED: '파일을 읽을 수 없습니다. 텍스트를 직접 입력해 주세요.',
  INTERNAL_ERROR: '요청 처리에 실패했습니다.',
  AI_UNAVAILABLE: 'AI 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  TIMEOUT: '처리 시간이 초과되었습니다. 다시 시도해 주세요.',

  // ── 미리보기 E-030~E-033 ──
  'E-030': '미리보기를 불러오지 못했습니다.',
  'E-031': '일부 리소스가 표시되지 않을 수 있습니다.',
  'E-032': '변경 내용 저장에 실패했습니다.',
  'E-033': '잘못된 접근입니다.',
  UPDATE_FAILED: '변경 내용 저장에 실패했습니다.',

  // ── 결제 E-040~E-045 + Edge Function ──
  'E-040': '결제가 취소되었습니다.',
  'E-041': '결제에 실패했습니다. 다른 결제 수단을 시도해 주세요.',
  'E-042': '결제 금액이 일치하지 않습니다. 고객센터로 문의해 주세요.',
  'E-043': '결제 확인 중 오류가 발생했습니다. 고객센터로 문의해 주세요.',
  'E-044': '이미 결제된 프로젝트입니다.',
  AMOUNT_MISMATCH: '결제 금액이 일치하지 않습니다. 고객센터로 문의해 주세요.',
  ALREADY_PAID: '이미 결제가 완료된 주문입니다.',
  PORTONE_ERROR: '결제 서비스 연결에 실패했습니다.',
  DB_ERROR: '주문 처리에 실패했습니다.',
  PAYMENT_INVALID: '결제 정보를 확인할 수 없습니다.',
  PAYMENT_NOT_COMPLETED: '결제가 완료되지 않았습니다.',
  PAYMENT_SERVICE_ERROR: '결제 서비스 연결에 실패했습니다.',
  ORDER_FAILED: '주문 처리에 실패했습니다.',

  // ── 파일 E-050~E-052 + get-download-url ──
  'E-050': '파일 생성 중 오류가 발생했습니다. 마이페이지에서 다시 시도해 주세요.',
  'E-051': '다운로드 링크가 만료되었습니다.',
  'E-052': '브라우저 설정에서 팝업/다운로드를 허용해 주세요.',
  NOT_PAID: '결제 완료된 주문이 없습니다.',
  FILE_NOT_FOUND: '다운로드 파일을 찾을 수 없습니다.',
  INVALID_PARAMS: '필수 정보가 누락되었습니다.',

  // ── send-email ──
  INVALID_EMAIL: '이메일 형식이 올바르지 않습니다.',
  RESEND_ERROR: '이메일 발송에 실패했습니다.',
  URL_GENERATE_FAILED: '다운로드 링크 생성에 실패했습니다.',
}

export function getErrorMessage(code: string | undefined, fallback: string): string {
  if (!code) return fallback
  return MESSAGES[code] ?? fallback
}

/** Edge Function invoke 후 data/error에서 사용자 메시지 추출 */
export function getInvokeMessage(
  data:
    | { message?: string; error?: string | { code?: string; message?: string; detail?: unknown } }
    | null,
  error: { message?: string } | null
): string {
  if (data?.message) return data.message
  if (data?.error) {
    if (typeof data.error === 'string') return getErrorMessage(data.error, data.error)
    const code = data.error.code
    const msg = data.error.message
    if (msg) return msg
    if (code) return getErrorMessage(code, code)
  }
  if (error?.message) return error.message
  return '요청 처리에 실패했습니다.'
}
