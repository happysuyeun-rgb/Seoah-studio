# v2.1 설계서 반영 — 작업 내역 & 다음 액션

작성일: 2026-03-18  
기준 문서: `full_spec_v2_1_final (1).html` (기능정의서 + 화면설계서 v2.1)

---

## 1) 이번 세션에서 반영된 주요 변경 사항(완료)

### A. 문서/계획서
- **작업 계획서 작성/갱신**
  - `docs/SPEC_V2_1_IMPLEMENTATION_PLAN.md`  
  - v2.1 기준 추가 구현/보완 항목, Phase A~D 순서, 체크리스트 반영

---

### B. UI/페이지 (스펙 문구/상태 반영)
- **HomePage 히어로 문구 스펙 통일**
  - `src/pages/HomePage.tsx`  
  - h1/부제 스펙 문구로 수정
- **MyPage 상태 라벨 확장**
  - `src/pages/MyPage.tsx`  
  - `parsing`, `error`, `fulfilled` 라벨 추가
- **CustomizePage 상태기계/타임아웃/에러 UX**
  - `src/pages/CustomizePage.tsx`  
  - 60초 타임아웃, 30초 경고 문구
  - `status=error`일 때 “재시도/1:1 문의” CTA
  - 폴링: `ready` 또는 `error` 시 중단

---

### C. DB/Migrations (v2.1 스키마/보안)
- **projects.status 체크 제약 추가(v2.1)**
  - `supabase/migrations/009_projects_status_enum.sql`
  - 허용 값: `draft | parsing | ready | pending_payment | paid | fulfilled | error`

- **templates html_template 비공개화(P0 보안-B)**
  - `supabase/migrations/010_templates_public_view.sql`
    - `templates_public` 뷰 생성(공개 조회용)
    - `get_project_template_html(project_id)` RPC(프로젝트 소유자만 템플릿 HTML 조회)
  - `supabase/migrations/012_templates_lockdown_admin_rpcs.sql`
    - `templates` 테이블에 대해 `anon/authenticated` 권한 **REVOKE**
    - `templates_public`는 `anon/authenticated` **SELECT GRANT**
    - 관리자 템플릿 CRUD를 RPC로 전환 (`admin_list_templates`, `admin_upsert_template`, `admin_set_template_active`)

- **is_admin 변경 보호(P0 보안-C)**
  - `supabase/migrations/011_users_protect_is_admin.sql`
  - `users` UPDATE에서 `is_admin` 변경 무시(트리거)

- **챗봇 Rate Limit(P0 보안-D) + 클라이언트 direct insert 차단**
  - `supabase/migrations/013_chatbot_rate_limit.sql`
    - `chatbot_inquiries`에 `ip`, `user_agent` 컬럼 + 인덱스
    - 기존 `INSERT all` 정책 제거(클라이언트 직접 INSERT 차단)

- **SC-04(템플릿 상세 미리보기) + 보안 동시 만족**
  - 공개용 `preview_html` 컬럼 분리 및 공개 뷰 제공
  - `supabase/migrations/014_templates_preview_html.sql`
    - `templates.preview_html` 컬럼 추가
    - `templates_public` 뷰에 `preview_html` 포함
    - `admin_upsert_template_v2(..., p_preview_html, ...)` RPC 추가
  - 운영 편의: 기존 템플릿도 한 번에 preview 채우기
  - `supabase/migrations/015_admin_update_preview_html.sql`
    - `admin_update_template_preview_html(p_id, p_preview_html)` RPC 추가

---

### D. Supabase Edge Functions
- **ai-customize v2.1 상태기계 + XSS sanitize + 표준 error 객체**
  - `supabase/functions/ai-customize/index.ts`
  - 동작:
    - 진입 시 `projects.status='parsing'`
    - 실패/타임아웃 시 `status='error'`
    - 성공 시 `status='ready'` + `output_html/custom_params` 저장
    - 저장 전 `sanitize-html`로 HTML 정화(XSS 방지)
  - 응답:
    - `traceId` 포함
    - 실패 시 `error: { code, message, detail? }` 형태로 통일

- **verify-payment traceId + 표준 error 객체**
  - `supabase/functions/verify-payment/index.ts`
  - 결제 검증 후 zip 업로드 + signedUrl 생성 + downloads 기록까지 성공하면 `projects.status='fulfilled'`로 전환

- **get-download-url 표준 error 객체**
  - `supabase/functions/get-download-url/index.ts`

- **send-email 표준 error 객체**
  - `supabase/functions/send-email/index.ts`

- **챗봇 접수 Edge Function 신규 + Rate Limit**
  - `supabase/functions/submit-chatbot-inquiry/index.ts` (신규)
  - IP당 1분 5건 제한(429)
  - 저장 후 관리자 알림 이메일(`send-email`) 호출

---

### E. 프론트 데이터 경로 변경(보안/호환)
- **TemplateGallery/Detail는 templates_public 사용**
  - `src/pages/TemplateGalleryPage.tsx`
  - `src/pages/TemplateDetailPage.tsx`
- **CustomizePage는 template html을 RPC로만 조회**
  - `src/pages/CustomizePage.tsx`
  - `get_project_template_html` RPC 사용
- **HomePage 템플릿 카운트도 templates_public로 조회**
  - `src/pages/HomePage.tsx`
- **관리자 템플릿 CRUD도 RPC로 전환**
  - `src/pages/AdminPage.tsx`

---

### F. 에러 메시지 호환(표준 error 객체 수용)
- `src/lib/errorCodes.ts`
  - `getInvokeMessage()`가 `error`가 문자열이든 객체든 모두 처리
- `src/pages/CustomizePage.tsx`, `src/pages/CheckoutPage.tsx`, `src/pages/MyPage.tsx`
  - UNAUTHORIZED/FORBIDDEN 판별 로직이 문자열/객체 둘 다 지원
  - `get-download-url` 응답은 신규(`data.downloadUrl`) / 구형(`downloadUrl`) 둘 다 호환

---

### G. OG 이미지
- **OG 메타를 실제 PNG로 완성**
  - `public/og-image.svg` (원본)
  - `public/og-image.png` (생성본)
  - `scripts/generate-og-image.mjs` (SVG→PNG 생성 스크립트)
  - `index.html`: `og:image`, `twitter:image`를 `/og-image.png`로 설정

---

## 2) 설치/추가된 패키지
- `dompurify` (+ `@types/dompurify`)
- `sharp` (devDependency) — `og-image.svg` → `og-image.png` 변환용

---

## (로컬 개발 편의) Supabase 미설정 폴백
- `src/mocks/templatesMock.ts`
- `TemplateGalleryPage`, `TemplateDetailPage`, `HomePage`에서 `isSupabaseConfigured=false`일 때 로컬 Mock 데이터로 화면을 렌더링하도록 임시 폴백 추가

이 항목은 운영 스펙 변경이 아니라, `.env.local` 미설정 상태에서도 로컬 UI 확인을 돕기 위한 개발 편의입니다.

---

## 3) 사용자가 해야 하는 작업(필수/권장)

### (필수) Supabase에 마이그레이션 적용
아래 신규 SQL이 실제 DB에 적용되어야 합니다.
- `009_projects_status_enum.sql`
- `010_templates_public_view.sql`
- `011_users_protect_is_admin.sql`
- `012_templates_lockdown_admin_rpcs.sql`
- `013_chatbot_rate_limit.sql`
- `014_templates_preview_html.sql`
- `015_admin_update_preview_html.sql`
  - (참고) `fulfilled` 전환은 Edge Function 로직 변경이므로 추가 DB 마이그레이션은 필요 없습니다.

적용 방식(예):
- Supabase CLI 사용 시: `supabase db push`
- 또는 Supabase SQL Editor에서 마이그레이션 순서대로 실행

### (필수) Edge Function 배포
아래 함수들을 배포/업데이트해야 합니다.
- `ai-customize`
- `verify-payment`
- `get-download-url`
- `send-email`
- `submit-chatbot-inquiry` (신규)

### (필수) AdminPage에서 SC-04 미리보기 초기화
`preview_html`은 템플릿 저장 시 생성됩니다. 기존 템플릿은 비어있을 수 있습니다.
- `/admin` → 템플릿 관리 → **“미리보기 전체 재생성”** 클릭  
  (또는 개별 템플릿 “재생성”)

### (권장) 환경 변수 확인
- Claude 실연동: `ANTHROPIC_API_KEY`
- PortOne 검증: `PORTONE_IMP_KEY`, `PORTONE_IMP_SECRET` (또는 `IMP_KEY`, `IMP_SECRET`)
- 이메일: `RESEND_API_KEY`, `ADMIN_EMAIL`(또는 `RESEND_FROM`)

### (권장) 런타임 점검 체크리스트
- 로그인/세션 만료 후 EF 호출 시 401/403 처리 정상인지
- 템플릿 상세(SC-04)에서 iframe 미리보기 정상 표시되는지(재생성 후)
- 챗봇: 1분 5회 초과 시 429가 나오는지
- 템플릿 원본 유출 방지: 비로그인 상태에서 `templates` 직접 SELECT가 불가능한지

---

## 4) 남아있는 선택 작업(스펙상 Phase D/추가)
- Claude JSON Schema v1.0: `schema_version: "1.0"` 주입/검증(선택)
- 결제 멱등성 강화(verify-payment): imp_uid/merchant_uid 기준 완전 멱등 처리(선택)
- 기타 성능/운영(P1/P2): 감사로그, 템플릿 버전관리 등

