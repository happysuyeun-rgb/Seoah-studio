# Edge Function API 요약

Supabase Edge Functions (Deno). 게이트웨이 JWT 검사는 `supabase/config.toml`의 `verify_jwt`를 따른다.

로그인 JWT가 필요한 함수: `ai-customize`, `delete-account`, `get-download-url`, `process-refund`, `send-email`, `submit-refund-request`, `verify-payment`.

비로그인 호출이 가능한 함수: `submit-contact`, `submit-chatbot-inquiry`. 이 둘은 `verify_jwt = false`이고, 함수 안에서 입력을 검사한다. `submit-contact`만 사용자 JWT가 있으면 계정을 연결한다.

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

- `.txt`, `.md`, `.docx`, `.pptx`는 private `project-uploads` 경로에서 읽는다. 이미지와 PDF는 텍스트 추출을 하지 않는다. 임의 URL fetch는 하지 않는다.
- Realtime 구독 미적용 — 클라이언트에서 2초 폴링으로 status 감지.

---

## 2. verify-payment

**POST** `/functions/v1/verify-payment`  
로그인 사용자 전용. 판매 중인 플랜은 `html` 49,000원뿐이고, 금액은 서버 가격으로 정한다. 요청 `amount`는 승인에 쓰지 않는다. PortOne 키가 없으면 주문을 만들지 않는다. 조회 결과의 `status=paid`, 금액, `merchant_uid`가 요청 `merchant_uid`와 같아야 한다. `imp_uid`와 `payment_key` 중복은 DB에서 거부한다.

### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| imp_uid | string | 필수 | 포트원 결제 고유번호 |
| merchant_uid | string | 필수 | 주문번호 (order_{timestamp}) |
| amount | number | 선택 | 클라이언트가 보내도 승인 금액으로 쓰지 않음 |
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
| 402 | AMOUNT_MISMATCH | PortOne 금액이 서버 가격과 다름 |
| 409 | PAYMENT_REFERENCE_MISMATCH | PortOne `merchant_uid`가 요청과 다름 |
| 409 | ALREADY_PAID | 이미 결제된 프로젝트 |
| 409 | PAYMENT_ALREADY_PROCESSED | 같은 `imp_uid` 또는 `payment_key` |
| 503 | PAYMENT_NOT_CONFIGURED | PortOne 키 없음 |
| 500 | PORTONE_ERROR | 포트원 API 호출 실패 |
| 500 | DB_ERROR | orders INSERT 실패 |

---

## 3. send-email

**POST** `/functions/v1/send-email`  
로그인 JWT 또는 service role만 호출한다. 브라우저가 보낼 수 있는 type은 본인 문의 `inquiry_alert`와 관리자 답변 `inquiry_answered`뿐이다. 수신자는 DB 또는 `ADMIN_EMAIL`에서 정하고, 요청의 임의 `to`는 쓰지 않는다. 결제, 환불, 챗봇 메일은 다른 Edge Function이 service role로만 보낸다. 발신 주소는 `RESEND_FROM`만 사용한다. `RESEND_API_KEY`가 없으면 발송을 건너뛴다. 키는 있는데 `RESEND_FROM`이 없으면 `EMAIL_NOT_CONFIGURED`이며 보내지 않는다.

### 브라우저가 보낼 수 있는 type

| type | 호출 | 수신자 |
|------|------|--------|
| inquiry_alert | 로그인 사용자, 본인 문의 `inquiryId` | `ADMIN_EMAIL` |
| inquiry_answered | 관리자, 해당 문의 `inquiryId` | 문의에 저장된 이메일 |

요청의 `to`와 `from`은 수신·발신으로 쓰지 않는다.

### service role만 보낼 수 있는 type

`payment_complete`, `chatbot_alert`, `refund_alert`, `refund_approved`, `refund_rejected`. 일반 사용자 JWT로 이 type을 보내면 거절한다.

| type | 설명 |
|------|------|
| payment_complete | 결제 완료. 수신자는 주문 사용자 |
| chatbot_alert | 챗봇 문의 알림. 수신자는 `ADMIN_EMAIL` |
| refund_alert | 환불 접수 알림. `ADMIN_EMAIL`이 없으면 건너뜀 |
| refund_approved | 환불 승인 안내 |
| refund_rejected | 환불 거절 안내 |

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
| 503 | EMAIL_NOT_CONFIGURED | `RESEND_API_KEY`는 있으나 `RESEND_FROM`이 없음. 발송하지 않음 |
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
| 502 | PORTONE_CANCEL_FAILED | PortOne 환불 API 실패. 주문 상태는 바꾸지 않음 |
| 500 | REFUND_ERROR | 환불 API 호출 중 오류 |
| 500 | REFUND_DB_CRITICAL | 취소는 되었으나 DB 저장 실패 |

---

## 7. delete-account

**POST** `/functions/v1/delete-account`  
로그인 사용자 본인만. 로그인 계정을 지우고, 주문·계약·프로젝트 기록은 placeholder로 남긴다.

---

## 8. submit-contact

**POST** `/functions/v1/submit-contact`  
비로그인 가능. `verify_jwt = false`. 이름, 이메일, 유형, 본문을 검사하고 같은 IP는 10분에 3건까지다.

---

## 9. submit-chatbot-inquiry

**POST** `/functions/v1/submit-chatbot-inquiry`  
비로그인 가능. `verify_jwt = false`. 본문 4000자, 이름 50자, 이메일 200자. 같은 IP는 1분에 5건까지다.
