# API / 에러코드 / CHANGELOG 문서 반영 — 작업 계획

> 첨부 HTML(`api_errors_changelog.html`) 검토 후, 프로젝트에 반영하기 위한 작업 계획입니다.  
> 작성일: 2025-03-17

---

## 1. 문서 요약 (첨부 HTML 내용)

| 섹션 | 내용 |
|------|------|
| **Edge Function API** | ai-customize, verify-payment, send-email, get-download-url 4종. Request Body, Response 200, 에러 코드(HTTP+코드) 정리. |
| **에러 코드 매핑** | E-001~E-052. 코드·HTTP/영역·발생 조건·**사용자 메시지**·**처리 방법**·심각도(Critical/High/Medium/Low). 인증/업로드/AI/결제/파일 등 필터. |
| **CHANGELOG** | v0.1.0 ~ v0.9.0. feat/fix/chore/break 타입별 항목. |

---

## 2. 현재 코드베이스와의 갭

| 구분 | 문서(HTML) | 현재 구현 | 갭 |
|------|------------|-----------|-----|
| **에러 메시지** | E-001~E-052 + Edge Function 코드별 사용자 메시지 정의 | `errorCodes.ts`에 10개 내외 코드만, 메시지 일부 상이 | 문서의 메시지·코드 전부 반영 필요 |
| **Edge Function 에러 코드** | INVALID_PROJECT_ID, AI_TIMEOUT, PARSE_FAILED, AMOUNT_MISMATCH, NOT_PAID, FILE_NOT_FOUND 등 | getErrorMessage에 TIMEOUT, AI_UNAVAILABLE, AMOUNT_MISMATCH 등 일부만 | API 문서의 에러 코드와 1:1 매핑 필요 |
| **처리 방법** | 에러별 "처리 방법"(토스트, 리디렉션, 재시도 버튼 등) 명시 | 페이지별로 ad-hoc 처리 | 문서의 처리 방법을 참고해 일관 적용 |
| **API 문서** | 4개 Edge Function 스펙이 HTML 내부에만 존재 | README·PRODUCTION_ENV에 간단 언급만 | 프로젝트 docs에 API 요약 문서로 보관 필요 |
| **CHANGELOG** | HTML 내 JS 데이터로 버전 이력 | 프로젝트에 CHANGELOG.md 없음 | CHANGELOG.md 생성 또는 HTML을 docs에 복사 |

---

## 3. 작업 계획 (우선순위)

### Phase A — 문서 이식 (우선)

| # | 작업 | 산출물 | 비고 |
|---|------|--------|------|
| A1 | **API 요약을 마크다운으로 정리** | `docs/EDGE_FUNCTIONS_API.md` | HTML의 탭1 내용. Request/Response/에러 코드 표로 이식. |
| A2 | **에러 코드 매핑을 마크다운으로 정리** | `docs/ERROR_CODES_MAPPING.md` | E-001~E-052 표 (코드, 영역, 발생 조건, 사용자 메시지, 처리 방법, 심각도). |
| A3 | **CHANGELOG.md 생성** | `CHANGELOG.md` (루트) | HTML의 CHANGELOG 데이터를 마크다운 형식으로 이식. 이후 릴리즈 시 여기만 갱신. |
| A4 | **원본 HTML 보관 (선택)** | `docs/api_errors_changelog.html` | 참조용으로 프로젝트에 복사해 두거나, 링크만 README/docs 인덱스에 추가. |

### Phase B — errorCodes.ts 확장

| # | 작업 | 비고 |
|---|------|------|
| B1 | **Edge Function 에러 코드 추가** | INVALID_PROJECT_ID, PARSE_FAILED, AI_TIMEOUT, INVALID_PARAMS, NOT_PAID, FILE_NOT_FOUND, PORTONE_ERROR, DB_ERROR, RESEND_ERROR, URL_GENERATE_FAILED, INVALID_EMAIL 등. 문서의 "에러 코드" 테이블과 동일한 코드명 사용. |
| B2 | **E-001~E-052 사용자 메시지 매핑** | 문서의 "사용자 메시지" 컬럼 값을 `MESSAGES` 또는 별도 맵에 추가. 코드 키는 E-001 형식 + Edge Function 코드명 혼용 가능. |
| B3 | **getErrorMessage / getInvokeMessage 유지·보완** | `data.error`가 문서의 코드(문자열)로 오는 경우 해당 메시지 반환. 기존 호출부(CustomizePage, CheckoutPage) 유지. |

### Phase C — 클라이언트 처리 방법 정합 (선택)

| # | 작업 | 비고 |
|---|------|------|
| C1 | **인증 에러 (E-001~E-005)** | 401/403 시 returnTo 저장 후 /login 리디렉션, 토스트 메시지는 문서 메시지 사용. |
| C2 | **업로드 에러 (E-010~E-014)** | 지원 형식 외/20MB 초과/Storage 실패/빈 입력/파싱 실패 시 문서의 "처리 방법"대로 인라인·토스트·재시도. |
| C3 | **AI 에러 (E-020~E-024)** | CustomizePage에서 408/503/422 등 응답 시 문서 메시지 + 재시도 버튼 또는 fallback 유도. |
| C4 | **결제 에러 (E-040~E-045)** | CheckoutPage/PaymentFailPage에서 402/409/500 시 문서 메시지, projectId 보존, 재시도/고객센터 안내. |
| C5 | **파일/다운로드 (E-050~E-052)** | JSZip 실패, signed URL 만료, 다운로드 차단 시 문서대로 토스트·get-download-url 유도·안내 모달. |

### Phase D — Edge Function 응답 정합 (선택)

| # | 작업 | 비고 |
|---|------|------|
| D1 | **ai-customize** | 실패 시 HTTP 상태코드 + body `{ error: "AI_TIMEOUT" }` 등 문서와 동일한 코드 반환. |
| D2 | **verify-payment** | 동일하게 402/409/500 + error 코드 문자열. |
| D3 | **send-email / get-download-url** | 400/404/500 + 문서의 에러 코드. |

---

## 4. 권장 진행 순서

1. **A1 → A2 → A3**  
   문서 이식으로 팀·AI가 항상 동일한 스펙을 참조할 수 있게 함.
2. **B1 → B2 → B3**  
   클라이언트에서 Edge Function·에러 코드 사용 시 문서와 일치하는 메시지를 보여줌.
3. **A4**  
   원본 HTML을 docs에 넣거나 링크 정리.
4. **C1~C5, D1~D3**  
   여유 있을 때 페이지별·Function별로 처리 방법과 응답 형식을 문서에 맞춤.

---

## 5. 완료 기준

- [x] `docs/EDGE_FUNCTIONS_API.md` 존재, 4개 Function 스펙·에러 표 기재.
- [x] `docs/ERROR_CODES_MAPPING.md` 존재, E-001~E-052 표 기재.
- [x] `CHANGELOG.md` 존재, v0.1.0~v0.9.0 이력 반영.
- [x] `src/lib/errorCodes.ts`에 문서의 Edge Function 에러 코드 + 필요 E-xxx 메시지 반영.
- [x] (선택) 주요 화면에서 문서의 "처리 방법" 적용. — C1~C5 반영(인증 리디렉션, 업로드 E-010/E-011, CustomizePage 에러 카드+재시도, PaymentFail projectId 복원, 다운로드 E-050/E-051).
- [x] (선택) Edge Function가 문서의 HTTP·error 코드 규칙으로 응답. — ai-customize: 400 INVALID_PROJECT_ID, 422 PARSE_FAILED, 408 AI_TIMEOUT.

---

## 6. docs/README.md 반영

작업 완료 후 `docs/README.md`에 다음 추가 권장:

- **API·에러·이력**: [EDGE_FUNCTIONS_API.md](EDGE_FUNCTIONS_API.md), [ERROR_CODES_MAPPING.md](ERROR_CODES_MAPPING.md), [../CHANGELOG.md](../CHANGELOG.md)

이 계획대로 진행하면 첨부 HTML의 API/에러코드/CHANGELOG가 프로젝트에 일관되게 반영됩니다.
