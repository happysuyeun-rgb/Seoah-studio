# SEOAH.STUDIO 프로젝트 상태 보고서

> **최종 갱신일:** 2026-03-17 (설정: 가입일·마케팅 토글 반영, Edge Function 환경변수 검증)  
> **기준 문서:** full_spec_v2_2_final.html (기능정의서 + 화면설계서 v2.2)

---

## 목차

1. [개발 구현 완료 내역](#1-개발-구현-완료-내역)
2. [구현 예정 (미완료)](#2-구현-예정-미완료)
3. [보완 필요 항목](#3-보완-필요-항목)
4. [완료/미완료 요약표](#4-완료미완료-요약표)
5. [사용자 직접 작업 항목 & 방법](#5-사용자-직접-작업-항목--방법)

---

## 1. 개발 구현 완료 내역

### 1.1 v2.1 (이전 완료)

| 구분 | 항목 | 상태 | 비고 |
|------|------|------|------|
| UI | HomePage h1·부제 스펙 문구 | ✅ 완료 | |
| UI | MyPage statusLabel (parsing, error, fulfilled) | ✅ 완료 | |
| UI | CustomizePage 60초 타임아웃, 30초 경고, error CTA | ✅ 완료 | |
| DB | 009~015 마이그레이션 (status, templates, is_admin, chatbot, preview_html) | ✅ 완료 | |
| EF | ai-customize (parsing/error/ready, XSS sanitize, traceId) | ✅ 완료 | |
| EF | verify-payment (fulfilled 전환, traceId) | ✅ 완료 | |
| EF | get-download-url, send-email (traceId) | ✅ 완료 | |
| EF | submit-chatbot-inquiry (Rate Limit, 관리자 알림) | ✅ 완료 | |
| 보안 | templates_public 뷰, html_template 비공개 | ✅ 완료 | |
| 보안 | is_admin 변경 차단 트리거 | ✅ 완료 | |
| OG | og-image.png, 메타 반영 | ✅ 완료 | |
| Mock | Supabase 미설정 시 templatesMock 폴백 | ✅ 완료 | |

### 1.2 v2.2 Phase E (P0) — 이번 세션 완료

| 구분 | 항목 | 상태 | 파일/위치 |
|------|------|------|-----------|
| DB | policy_agreements 테이블 + RLS | ✅ 완료 | 016_policy_agreements.sql |
| DB | refund_requests 테이블 + RLS | ✅ 완료 | 017_refund_requests_and_bucket.sql |
| DB | orders 확장 (payment_method, refunded_amount, refunded_at, receipt_url, status CHECK) | ✅ 완료 | 018_orders_refund_columns.sql |
| DB | refund-attachments Storage bucket | ✅ 완료 | 019_refund_attachments_bucket.sql |
| 화면 | SC-15 TermsPage (/terms) | ✅ 완료 | src/pages/TermsPage.tsx |
| 화면 | SC-15 PrivacyPage (/privacy) | ✅ 완료 | src/pages/PrivacyPage.tsx |
| 화면 | SC-15 RefundPage (/refund) | ✅ 완료 | src/pages/RefundPage.tsx |
| 화면 | F-046 CheckoutPage 정책 동의 3종 + 마케팅 별도 | ✅ 완료 | src/pages/CheckoutPage.tsx |
| 화면 | SC-16 RefundRequestPage (/mypage/refund/:orderId) | ✅ 완료 | src/pages/RefundRequestPage.tsx |
| 화면 | SC-17 MyPageSettingsPage (/mypage/settings) | ✅ 완료 | src/pages/MyPageSettingsPage.tsx |
| 화면 | Admin 6탭(템플릿·주문·사용자·문의·챗봇·환불) | ✅ 완료 | src/pages/AdminPage.tsx |
| 화면 | Admin 미리보기 전체 재생성 컴포넌트 | ✅ 완료 | src/components/AdminPreviewRebuildButton.tsx |
| 화면 | 전역 Footer (정책 링크 3종, 저작권) | ✅ 완료 | src/components/Footer.tsx |
| 화면 | MyPageSettings 가입일 표시 + 마케팅 이메일 토글 | ✅ 완료 | src/pages/MyPageSettingsPage.tsx |
| 화면 | MyPage 설정 링크, 환불 요청 버튼 | ✅ 완료 | src/pages/MyPage.tsx |
| EF | submit-refund-request | ✅ 완료 | supabase/functions/submit-refund-request/ |
| EF | process-refund (승인/거절, PortOne 환불 API, 이메일) | ✅ 완료 | supabase/functions/process-refund/ |
| EF | delete-account (비식별화, Auth 삭제) | ✅ 완료 | supabase/functions/delete-account/ |
| EF | send-email refund_approved, refund_rejected, refund_alert 타입 | ✅ 완료 | supabase/functions/send-email/index.ts |
| EF | submit-refund-request 관리자 알림 이메일 (refund_alert) | ✅ 완료 | supabase/functions/submit-refund-request/ |
| EF | verify-payment payment_method 저장 (PortOne pay_method) | ✅ 완료 | supabase/functions/verify-payment/ |
| EF | Edge Function 환경변수 검증 (Deno.env.get ! 제거) | ✅ 완료 | supabase/functions/* |
| 화면 | SC-16 RefundRequestPage 처리 히스토리 타임라인 | ✅ 완료 | src/pages/RefundRequestPage.tsx |
| 정책 | M-001~004, M-007, M-008 완료 | ✅ 완료 | 이용약관·회원탈퇴·환불·마케팅·미성년자 |
| 정책 | M-009 templatesMock DEV 폴백 | ✅ 완료 | Supabase 미설정 시 목업 폴백 |

---

## 2. 구현 예정 (미완료)

### 2.1 Phase F (P1)

| # | 항목 | 비고 |
|---|------|------|
| F1 | admin_logs 테이블 + RLS | 마이그레이션 |
| F2 | F-049 감사 로그 | 템플릿·문의·환불 등 관리자 액션 시 admin_logs INSERT |
| F3 | SC-19 운영·감사 로그 화면 (/admin/logs) | 기간·유형 필터, diff 모달 |
| F4 | F-048 자동저장 | UploadPage, PreviewPage draft sync, localStorage, 복구 모달 |
| F5 | F-041 재생성 정책 | project_versions 또는 횟수 저장, PreviewPage 배지·확인 모달 |
| F6 | process-refund에 admin_logs 기록 | admin_logs 테이블 생성 후 연동 |

### 2.2 Phase G (P2)

| # | 항목 | 비고 |
|---|------|------|
| G1 | project_shares, project_share_views 테이블 | 마이그레이션 |
| G2 | SC-18 공유 링크 뷰어 (/share/:token) | 비밀번호·만료 검증 |
| G3 | F-051 공유 링크 생성 UI | 마이페이지/PreviewPage |
| G4 | project_versions 테이블 | 마이그레이션 |
| G5 | F-043 버전 히스토리 | PreviewPage 이전 버전 드롭다운, 복원 |
| G6 | faq_search_logs, F-050 FAQ 검색어 분석 | Admin 대시보드 |
| G7 | F-044, F-045 SEO/OG 메타 보완 | og:image 일부 완료 |

---

## 3. 보완 필요 항목

| # | 항목 | 현재 상태 | 보완 방향 |
|---|------|-----------|-----------|
| 1 | 정책 페이지 목차 | 없음 | SC-15: 좌측 sticky 목차 앵커 (선택) |

---

## 4. 완료/미완료 요약표

### Phase E (P0) — 런칭 전 필수

| 항목 | 완료 | 미완료 |
|------|:----:|:------:|
| policy_agreements, refund_requests 테이블 | ✅ | |
| orders 테이블 확장 | ✅ | |
| /terms, /privacy, /refund 페이지 | ✅ | |
| CheckoutPage 정책 동의 3종 + 마케팅 | ✅ | |
| 환불 요청 페이지 + EF | ✅ | |
| 관리자 환불 승인/거절 UI | ✅ | |
| /mypage/settings 회원탈퇴 | ✅ | |
| M-001~004, M-007, M-008, M-009 | ✅ | |
| 푸터 정책 링크 | ✅ | |
| SC-17 알림 토글 | ✅ | |
| 가입일 표시 | ✅ | |
| 환불 관리자 알림 | ✅ | |
| payment_method 저장 | ✅ | |
| Edge Function 환경변수 검증 | ✅ | |
| SC-16 처리 히스토리 타임라인 | ✅ | |

### Phase F (P1)

| 항목 | 완료 | 미완료 |
|------|:----:|:------:|
| admin_logs 테이블 | | ⬜ |
| 감사 로그 기록 | | ⬜ |
| /admin/logs 화면 | | ⬜ |
| 자동저장 + 복구 모달 | | ⬜ |
| 재생성 횟수 배지 | | ⬜ |

### Phase G (P2)

| 항목 | 완료 | 미완료 |
|------|:----:|:------:|
| project_shares, project_share_views | | ⬜ |
| /share/:token 뷰어 | | ⬜ |
| project_versions, 이전 버전 보기 | | ⬜ |
| faq_search_logs, 검색어 분석 | | ⬜ |
| SEO/OG 메타 보완 | 일부 | ⬜ |

---

## 5. 사용자 직접 작업 항목 & 방법

### 5.1 필수 — Supabase 마이그레이션 적용

**방법 1: Supabase CLI**
```bash
cd c:\Dev\seoah
supabase db push
```

**방법 2: SQL Editor에서 수동 실행**
1. Supabase 대시보드 → SQL Editor
2. 아래 순서대로 실행:
   - `supabase/migrations/016_policy_agreements.sql`
   - `supabase/migrations/017_refund_requests_and_bucket.sql`
   - `supabase/migrations/018_orders_refund_columns.sql`
   - `supabase/migrations/019_refund_attachments_bucket.sql`

> ⚠ v2.1 마이그레이션(009~015)이 아직 적용되지 않았다면, 먼저 001~015를 순서대로 적용한 후 016~019를 적용하세요.

---

### 5.2 필수 — Edge Function 배포

```bash
cd c:\Dev\seoah
supabase functions deploy ai-customize
supabase functions deploy verify-payment
supabase functions deploy get-download-url
supabase functions deploy send-email
supabase functions deploy submit-chatbot-inquiry
supabase functions deploy submit-refund-request
supabase functions deploy process-refund
supabase functions deploy delete-account
```

---

### 5.3 필수 — 환경 변수 설정

Supabase 대시보드 → Project Settings → Edge Functions → Secrets

> **환경변수 검증:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`는 Supabase가 자동 주입하지만, 누락 시 500 응답 및 `{ code: 'ENV_MISSING', message: '서버 환경 설정 오류' }` 반환. 각 함수에서 실제 사용하는 변수만 검증. `ADMIN_EMAIL`은 선택(미설정 시 해당 기능 건너뜀).

| 변수명 | 용도 | 비고 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Claude API (ai-customize) | 실연동 시 |
| `PORTONE_IMP_KEY` | PortOne 결제 검증 | verify-payment, process-refund |
| `PORTONE_IMP_SECRET` | PortOne 결제 검증 | verify-payment, process-refund |
| `RESEND_API_KEY` | 이메일 발송 | send-email |
| `ADMIN_EMAIL` | 관리자 알림 수신 이메일 (환불 요청 접수 시) | 환불 알림 필요 시 필수, 미설정 시 건너뜀 |

**검증 대상별 함수:**

| 검증 변수 | 적용 함수 |
|-----------|-----------|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | ai-customize, verify-payment, process-refund, submit-refund-request, submit-chatbot-inquiry, get-download-url, delete-account |
| `ADMIN_EMAIL` | 검증 없음 (선택 변수, 없으면 해당 기능 건너뜀) |

---

### 5.4 필수 — Admin 미리보기 초기화

1. `/admin` 접속
2. 템플릿 관리 탭
3. **"미리보기 전체 재생성"** 버튼 클릭 (`AdminPreviewRebuildButton`)

`templates.preview_html` 컬럼(v2.1 마이그레이션 014)에 데모 데이터 치환 HTML이 저장됨. 기존 템플릿의 preview_html이 비어있을 수 있으므로 초기화 권장.

---

### 5.5 권장 — 프론트엔드 .env

프로젝트 루트 `.env.local` (또는 `.env`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PORTONE_IMP_CODE=your-imp-code
```

---

### 5.6 권장 — 런타임 점검

- [ ] 로그인/세션 만료 후 Edge Function 호출 시 401/403 정상 처리
- [ ] 템플릿 상세 iframe 미리보기 정상 표시
- [ ] 챗봇 1분 5회 초과 시 429 응답
- [ ] 결제 플로우 → 정책 동의 → 결제 → 다운로드
- [ ] 환불 요청 → 관리자 승인/거절
- [ ] 회원탈퇴 후 재로그인

---

## 6. 문서 갱신 규칙

개발 작업 완료 시 이 문서를 다음과 같이 수시로 업데이트합니다:

1. **최종 갱신일** 상단 날짜 수정
2. **1. 개발 구현 완료 내역** — 새로 완료한 항목 추가, 체크 표시
3. **2. 구현 예정** — 완료된 항목은 해당 섹션에서 제거하고 1번으로 이동
4. **3. 보완 필요** — 처리된 항목 제거
5. **4. 완료/미완료 요약표** — 체크 상태 갱신
6. **5. 사용자 직접 작업** — 변경 사항 반영

---

*이 문서는 `docs/PROJECT_STATUS_YYYY-MM-DD.md` 형식으로 유지하며, 개발 진행에 따라 갱신됩니다.*
