# full_spec_v2.1_final 반영 — 추가 구현·보완 계획

> **full_spec_v2_1_final (1).html** (기능정의서 + 화면설계서 v2.1) 기준으로,  
> **추가 구현이 필요한 항목**과 **보완해야 할 점**을 정밀하게 정리한 작업 계획입니다.  
> 작성일: 2025-03-18

---

## 1. 문서 v2.1 요약

- **버전:** 기능정의서 + 화면설계서 v2.1 (2026.03.18)
- **신규 섹션:** 프로젝트 상태기계(parsing/error), Edge Function 표준 스펙(traceId), Claude JSON Schema v1.0, 보안 ADDENDUM(P0~P2)
- **문서 내 코드 리뷰 결론:** SC-02 홈복귀, SC-05 드래그앤드롭·글자수·사이드바, SC-07 브랜드정보, SC-08 썸네일·결제수단, SC-09 체크아이콘·이메일안내, SC-10 프로필·hash탭·썸네일, SC-11 히어로·비밀글·유형, SC-13 이메일·플랜, SC-14 404는 **이미 반영됨**으로 기록됨.
- **SupportPage formType:** 버그 수정 완료(이미 반영).

---

## 2. 즉시 처리 (코드 변경 소량)

| # | 항목 | 스펙 요구 | 현재 상태 | 작업 내용 |
|---|------|-----------|-----------|-----------|
| 1 | **HomePage h1·부제** | 스펙: "하나의 랜딩으로 프로젝트 완성" 등 (SC-01 히어로) | "파일 하나로 웹사이트 완성", "메모·PPT·이미지를 업로드하면..." | h1을 **"하나의 랜딩으로 프로젝트 완성"**, 부제를 **"피티·문서·이미지를 넣으면 AI가 코드까지 커스터마이징한 랜딩을 만들어 드립니다."** 로 통일 (기존 DESIGN_SUPPLEMENT 등과 동일 문구). |
| 2 | **SC-11 고객지원 히어로** | "무엇을 도와드릴까요?" + "FAQ에서 빠르게 답변을 찾거나, 1:1 문의를 남겨주세요." | **이미 반영됨** (SupportPage 153행) | 추가 작업 없음. |

---

## 3. v2.1 상태기계 (projects.status)

| # | 항목 | 스펙 요구 | 현재 상태 | 작업 내용 |
|---|------|-----------|-----------|-----------|
| 3 | **parsing 상태** | ai-customize 실행 중 → status = `parsing`. UI: "AI 처리 중" 뱃지 + 로딩 | 현재 draft → ready 직행. parsing 미사용 | ai-customize 진입 시 projects.status = `parsing` UPDATE. CustomizePage에서 status === 'parsing' 이면 로딩 UI. ready/error 시 기존대로. |
| 4 | **error 상태** | 60초 초과 또는 Edge Function 실패 시 status = `error`. UI: "오류" 뱃지 + "재시도/문의" CTA | 30초 타임아웃 후 클라이언트만 "다시 시도". DB status는 변경 없음 | ai-customize 실패/타임아웃 시 Edge Function에서 status = `error` UPDATE. CustomizePage에서 status === 'error' 이면 에러 카드 + 재시도. (타임아웃 30초→60초는 스펙 선택 적용) |
| 5 | **60초 폴링 타임아웃** | 60초 초과 시 error 전환. 30초 경고 메시지 "시간이 걸리고 있습니다..." | 30초 타임아웃 | CustomizePage 타임아웃 60초로 확대 시, 30초 구간에서 "시간이 걸리고 있습니다. 잠시만 기다려주세요." 문구 노출. |
| 6 | **마이페이지 상태 뱃지** | draft / parsing / ready / pending_payment / paid / error 등 스펙 표기 | statusLabel에 draft, ready, pending_payment, paid 있음. parsing·error 없음 | statusLabel에 **parsing → "AI 처리 중"**, **error → "오류"** 추가. |

---

## 4. Edge Function 표준 응답 (traceId)

| # | 항목 | 스펙 요구 | 현재 상태 | 작업 내용 |
|---|------|-----------|-----------|-----------|
| 7 | **표준 성공 응답** | `{ "success": true, "data": { ... }, "traceId": "uuid-v4" }` | `{ success: true, projectId, processingMs }` 등 | 각 Edge Function 성공 시 **traceId** (uuid-v4) 필드 추가. 클라이언트는 기존 data 사용 유지. |
| 8 | **표준 실패 응답** | `{ "success": false, "error": { "code", "message", "detail" }, "traceId": "uuid-v4" }` | `{ success: false, error: "CODE", message: "..." }` | 실패 시 **error**를 `{ code, message, detail? }` 객체로, **traceId** 추가. 클라이언트 getInvokeMessage는 data.error?.code 또는 data.error (문자열) 둘 다 처리하도록 보완. |

---

## 5. 보안 ADDENDUM — P0 (런칭 전 필수)

| # | 항목 | 스펙 요구 | 현재 상태 | 작업 내용 |
|---|------|-----------|-----------|-----------|
| 9 | **[보안-A] XSS Sanitize** | output_html 저장 전 DOMPurify sanitize. 스크립트 인젝션 방지 | 미적용 | ai-customize Edge Function에서 output_html 저장 직전 **DOMPurify.sanitize(html)** 적용 (Deno: esm.sh/dompurify). 클라이언트 PreviewPage "저장" 시에도 동일 적용 권장. |
| 10 | **[보안-B] html_template 노출 최소화** | 비로그인 SELECT 시 html_template 제외. templates_public 뷰 | 현재 templates 테이블 is_active=true면 전체 컬럼 조회 | Supabase에 **templates_public** 뷰 생성: id, name, category, thumbnail_url, variables, tags, is_active (html_template 제외). 갤러리/상세는 이 뷰 또는 select 시 html_template 제외하도록 쿼리 변경. |
| 11 | **[보안-C] is_admin 보호** | users UPDATE에서 is_admin 변경 차단. DB 트리거 | 미적용 | **트리거:** users UPDATE 시 OLD.is_admin != NEW.is_admin 이면 예외 발생 또는 NEW.is_admin := OLD.is_admin. (관리자만 is_admin 변경 가능하게 하려면 service_role 전용 함수로만 변경 등) |
| 12 | **[보안-D] 챗봇 Rate Limit** | chatbot_inquiries IP Rate Limit (1분 5건). CAPTCHA 검토 | 미적용 | Edge Function 또는 API 레벨에서 IP당 1분 5건 제한. 또는 Supabase RPC + rate limit 미들웨어. (선택: CAPTCHA) |
| 13 | **[안정성-A] 폴링 타임아웃·error 상태** | 60초 초과 시 status=error + "재시도/문의" CTA | 30초 타임아웃, error 상태 미반영 | 3·4·5번과 연동. Edge Function 내 60초 제한 또는 클라이언트 60초 후 status 재조회해 error면 에러 UI. |
| 14 | **[결제-A] 결제 멱등성** | verify-payment imp_uid 기준 멱등 처리 | 이미 ALREADY_PAID로 중복 결제 차단 | imp_uid + merchant_uid 기준 동일 요청 재처리 시 기존 주문 반환(동일 응답)하도록 명시적 멱등 처리 추가 권장. |

---

## 6. DB·스키마 정합 (v2.1)

| # | 항목 | 스펙 요구 | 현재 상태 | 작업 내용 |
|---|------|-----------|-----------|-----------|
| 15 | **projects.status 값** | draft | parsing | ready | pending_payment | paid | fulfilled | error | 마이그레이션에 parsing, error, fulfilled 명시 | 001 스키마에 이미 있는지 확인. 없으면 마이그레이션으로 **parsing, error, fulfilled** 허용(CHECK 또는 주석) 추가. |
| 16 | **inquiries 컬럼명** | 스펙 표: type, title, content, email, is_private, status, admin_answer, answered_at | 006: subject, body. 008: type 추가. admin_reply, replied_at 사용 가능 | 스펙은 title/content. 현재 subject/body. **유지**해도 됨(매핑만 문서화). admin_answer ↔ admin_reply, answered_at ↔ replied_at 동일 처리. |

---

## 7. Claude JSON Schema v1.0 (선택)

| # | 항목 | 스펙 요구 | 현재 상태 | 작업 내용 |
|---|------|-----------|-----------|-----------|
| 17 | **schema_version** | Claude 파싱 결과에 "schema_version": "1.0" 포함 | custom_params에 없음 | ai-customize에서 Claude 응답 파싱 후 **custom_params.schema_version = "1.0"** 주입. (선택) Zod/JSON Schema 검증 단계 추가. |

---

## 8. Phase 3~4 · 기타 (문서 잔여 작업)

| # | 항목 | 스펙 요구 | 현재 상태 | 작업 내용 |
|---|------|-----------|-----------|-----------|
| 18 | **ai-customize Claude 실연동** | .txt/.md 파싱 + Claude API 실호출 | 폴백/실연동 혼용 | ANTHROPIC_API_KEY 설정 시 실호출. 이미 구현된 경우 검증만. |
| 19 | **verify-payment PortOne 실검증** | imp_uid 포트원 REST API 검증 | 구현됨. 검증 로직 점검 | PortOne 토큰 + payments API 호출 확인. 금액·상태 검증 유지. |
| 20 | **og-image.png** | public 배치 + og:image 메타 | 미배치 또는 누락 | **og-image.png** 제작 후 public 배치. index.html og:image 메타 반영. |
| 21 | **결제 실패 문구** | "다시 시도하기" 등 스펙 통일 | PaymentFailPage "다시 시도하기" | 문서에 "다시 시도하기"로 되어 있으면 유지. "다시 결제하기" 요구 시 버튼 문구만 변경. |

---

## 9. 작업 진행 순서 제안

### Phase A — 즉시 (1~2일) ✅ 완료
1. **HomePage h1·부제** 문구 수정 (항목 1) — 완료.
2. **SupportPage** 히어로 부가 문구 — 이미 반영됨.
3. **마이페이지 statusLabel**에 parsing, error, fulfilled 추가 (항목 6) — 완료.

### Phase B — 상태기계 (2~3일) ✅ 완료
4. **projects.status parsing/error** (항목 3, 4, 5, 15): 마이그레이션 009, ai-customize parsing/error, CustomizePage 60초 타임아웃·30초 경고·error 시 재시도/문의 CTA 반영 완료.

### Phase C — 보안 P0 (런칭 전) ✅ 완료
5. **[보안-A] XSS Sanitize** (항목 9): ai-customize sanitize-html, PreviewPage/CustomizePage DOMPurify 반영 완료.
6. **[보안-B] html_template 제외** (항목 10): templates_public 뷰, get_project_template_html RPC, 갤러리/상세/CustomizePage 전환 완료.
7. **[보안-C] is_admin 보호** (항목 11): users_protect_is_admin 트리거(011) 반영 완료.

### Phase D — 표준화·선택 ✅ (traceId 완료)
8. **Edge Function traceId** (항목 7, 8): ai-customize·verify-payment 모든 응답에 traceId(uuid-v4) 포함 완료. 클라이언트 호환 유지.
9. **[보안-D] 챗봇 Rate Limit** (항목 12): 선택.
10. **결제 멱등성** (항목 14): verify-payment 강화.
11. **Claude schema_version** (항목 17): 선택.
12. **og-image** (항목 20).

---

## 10. 완료 기준 체크리스트

- [x] HomePage h1·부제 스펙 문구 반영
- [x] SupportPage 히어로 부가 문구 "FAQ에서 빠르게..." (이미 반영됨)
- [x] MyPage statusLabel에 parsing / error / fulfilled 추가
- [x] projects.status parsing / error 반영 (DB + CustomizePage 로직, Phase B)
- [ ] 60초 타임아웃 + 30초 경고 메시지 (선택)
- [x] Edge Function 응답에 traceId 포함 (ai-customize, verify-payment)
- [x] [보안-A] output_html 저장 전 DOMPurify/sanitize-html
- [x] [보안-B] html_template 비공개(뷰 또는 select 제외)
- [x] [보안-C] is_admin 변경 차단 트리거
- [ ] og-image.png 배치 + 메타

이 계획서는 **full_spec_v2_1_final (1).html** 내용을 기준으로 작성되었습니다.  
진행 시 위 순서대로 Phase A → B → C → D 적용을 권장합니다.
