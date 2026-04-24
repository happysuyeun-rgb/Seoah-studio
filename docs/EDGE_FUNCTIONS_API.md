# Edge Function API 요약

Supabase Edge Functions (Deno). 모든 요청에 `Authorization: Bearer {JWT}` 필수. CORS 헤더 포함.

---

## 1. ai-customize

**POST** `/functions/v1/ai-customize`  
업로드된 파일(.txt/.md)을 파싱하고 Claude API로 콘텐츠를 추출하여 템플릿 변수를 치환. 결과를 `projects.output_html`에 저장하고 `status`를 `ready`로 변경.

### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| projectId | string | 필수 | 처리할 프로젝트 UUID |
| reprocess | boolean | 선택 | true 시 기존 output_html 무시하고 재처리 (기본: false) |

### Response 200

```json
{
  "success": true,
  "projectId": "string",
  "customParams": { "company", "headline", "color_primary", ... },
  "processingMs": 0
}
```

### 에러 코드

| HTTP | 코드 | 설명 |
|------|------|------|
| 400 | INVALID_PROJECT_ID | projectId 형식 오류 또는 미존재 |
| 401 | UNAUTHORIZED | JWT 누락 또는 만료 |
| 403 | FORBIDDEN | 본인 프로젝트 아님 (RLS) |
| 408 | AI_TIMEOUT | Claude API 30초 타임아웃 |
| 422 | PARSE_FAILED | 파일 파싱 실패 + textInput 없음 |
| 500 | INTERNAL_ERROR | 예기치 못한 서버 오류 |
| 503 | AI_UNAVAILABLE | Claude API 크레딧 부족 |

### 현재 구현 상태

- .txt/.md 파싱 구현됨. .pptx/.docx (mammoth) · 이미지 Vision 미연동 (Phase 3 보완 예정).
- Realtime 구독 미적용 — 클라이언트에서 2초 폴링으로 status 감지.

---

## 2. verify-payment

**POST** `/functions/v1/verify-payment`  
포트원 imp_uid로 결제를 검증하고 orders 테이블에 INSERT. PortOne 응답의 `pay_method`(card/phone/vbank 등)를 `orders.payment_method`에 저장. 성공 시 send-email 호출.

### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| imp_uid | string | 필수 | 포트원 결제 고유번호 |
| merchant_uid | string | 필수 | 주문번호 (order_{timestamp}) |
| amount | number | 필수 | 결제 요청 금액 (원) |
| projectId | string | 필수 | 결제할 프로젝트 UUID |
| planType | string | 필수 | html / url / pdf / ppt / figma |

### Response 200

```json
{
  "success": true,
  "orderId": "string",
  "verifiedAmount": 0
}
```

### 에러 코드

| HTTP | 코드 | 설명 |
|------|------|------|
| 400 | INVALID_PARAMS | 필수 파라미터 누락 |
| 401 | UNAUTHORIZED | JWT 누락 또는 만료 |
| 402 | AMOUNT_MISMATCH | 금액 불일치 → 자동 환불 처리 |
| 409 | ALREADY_PAID | 이미 결제된 프로젝트 |
| 500 | PORTONE_ERROR | 포트원 API 호출 실패 |
| 500 | DB_ERROR | orders INSERT 실패 |

---

## 3. send-email

**POST** `/functions/v1/send-email`  
Resend API를 통해 이메일 발송. type에 따라 결제 완료 / 문의 접수 / 문의 답변 / 환불 알림 등 처리.

### Request Body — type별

| type | 필수 필드 | 설명 |
|------|-----------|------|
| payment_complete | to, userName, projectId, planType, orderId | 결제 완료 + 다운로드 링크 발송 |
| inquiry_alert | inquiryId, subject, body, userEmail | 관리자에게 문의 접수 알림 |
| inquiry_answered | to, inquirySubject, adminReply | 고객에게 답변 등록 알림 |
| refund_alert | orderId (reason, amount, userId 선택) | 관리자에게 환불 요청 접수 알림. ADMIN_EMAIL 환경 변수 필요, 없으면 건너뜀 |
| refund_approved | to, refundAmount | 고객에게 환불 승인 안내 |
| refund_rejected | to, reviewNote(선택) | 고객에게 환불 거절 안내 |

### Response 200

```json
{
  "success": true,
  "messageId": "string"
}
```

### 에러 코드

| HTTP | 코드 | 설명 |
|------|------|------|
| 400 | INVALID_EMAIL | 이메일 형식 오류 |
| 500 | RESEND_ERROR | Resend API 호출 실패 |
| 500 | URL_GENERATE_FAILED | Storage signed URL 생성 실패 |

---

## 4. get-download-url

**POST** `/functions/v1/get-download-url`  
7일 만료 후 마이페이지 "재다운로드" 시 호출. project-outputs/{projectId}/website.zip에 새 signed URL(7일) 발급.

### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| projectId | string | 필수 | 재다운로드할 프로젝트 UUID |

### Response 200

```json
{
  "success": true,
  "downloadUrl": "string"
}
```

### 에러 코드

| HTTP | 코드 | 설명 |
|------|------|------|
| 400 | INVALID_PARAMS | projectId 누락 |
| 401 | UNAUTHORIZED | JWT 누락/만료 |
| 402 | NOT_PAID | 결제 완료 주문 없음 |
| 403 | FORBIDDEN | 본인 주문 아님 |
| 404 | FILE_NOT_FOUND | project-outputs에 파일 없음 |
| 500 | INTERNAL_ERROR | signed URL 생성 실패 |

---

## 5. submit-refund-request

**POST** `/functions/v1/submit-refund-request`  
환불 요청 제출. refund_requests INSERT 후 send-email(type: refund_alert)로 관리자 알림. **ADMIN_EMAIL 미설정 시 알림 발송 건너뜀.**

---

## 6. process-refund

**POST** `/functions/v1/process-refund`  
관리자 환불 승인/거절. 승인 시 PortOne 환불 API 호출.

### 에러 코드 (E-portone)

| HTTP | 코드 | 설명 |
|------|------|------|
| 502 | PORTONE_CANCEL_FAILED | PortOne 환불 API 실패 → 수동 환불 후 관리자에서 상태 확인 |
| 500 | REFUND_ERROR | 환불 API 호출 중 오류 |
