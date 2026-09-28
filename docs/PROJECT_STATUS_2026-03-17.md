# SEOAH.STUDIO 프로젝트 상태 보고서

> **최종 갱신일:** 2026-09-28 (Admin Operations UI skeleton, Supabase 대상 기록)  
> **기준 문서:** full_spec_v2_2_final.html (기능정의서 + 화면설계서 v2.2), SEOAH_STUDIO_Master_Planning_v4.html

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

### 1.3 리뉴얼 Step 1 — 셸 (2026-09-27)

| 구분 | 항목 | 상태 | 비고 |
|------|------|------|------|
| UI | Design token (Deep Ink / Soft White / Signal Blue) | ✅ 완료 | `tailwind.config.js`, `src/index.css`. 기존 `primary`는 Signal Blue 별칭 |
| UI | App Shell, Public GNB, Footer, PageContainer | ✅ 완료 | Legacy 라우트 유지. Admin에서는 푸터 숨김 유지 |
| UI | Button, SectionHeading, 타이포(Pretendard) | ✅ 완료 | 홈 섹션 제목에 SectionHeading 적용. 본문 카드·플로우는 유지 |
| 범위 | DB, RLS, 결제, Edge Function, Auth, Admin 로직 | 미변경 | Legacy Commerce 유지 |

### 1.4 리뉴얼 Step 2 — Public Website (2026-09-27)

| 구분 | 항목 | 상태 | 비고 |
|------|------|------|------|
| UI | Home 및 Public IA | ✅ 완료 | `/ready` `/brand` `/studio` `/care` `/saas` `/work` `/about` `/faq` `/contact` |
| UI | GNB | ✅ 완료 | Ready, Studio, Care, SaaS, Work, About, Contact, Login, 프로젝트 의뢰하기 |
| 데이터 | FAQ 조회 | ✅ 완료 | 기존 `faqs` SELECT만. 스키마 변경 없음 |
| UI | Home visual refinement | ✅ 완료 | 섹션 폭 1280px, Hero 1360px. 라우트·카피·저장 로직 유지 |
| UI | Home conversion polish | ✅ 완료 | Hero composition, Ready preview, Care/Work/Footer. DB·저장 로직 미변경 |
| 데이터 | Guest Contact | ✅ 코드 완료 | `submit-contact` 작성. 첨부 입력은 화면에서 제거. migration 020과 함수 배포는 Supabase 프로젝트 연결 후 |
| 인증 | 회원가입 / account_type | ✅ 완료 | `/signup`, `/account-type`. `users.account_type`는 nullable. `is_admin` 유지 |
| 범위 | Lead, Studio 의뢰 저장 | UI만 | Step 5에서 다단계 의뢰 화면과 `/admin/leads` 화면을 추가. DB 저장은 하지 않음 |
| UI | MY SEOA 포털 | ✅ 화면만 | `/my` 및 하위 화면. 데이터는 빈 상태. DB·기존 `/mypage` 유지 |

### 1.5 리뉴얼 Step 5 — Project Request / Admin Leads UI (2026-09-28)

| 구분 | 항목 | 상태 | 비고 |
|------|------|------|------|
| P0 | Public / MY SEOA / Admin 크롬 분리 | ✅ 완료 | `/my`, `/admin`에서 Public GNB·Footer·Chatbot 숨김. `/mypage`는 Public 크롬 유지 |
| P0 | AdminRoute | ✅ 완료 | 권한 없음은 `<Navigate>`로 이동. `is_admin` 정책 유지 |
| P0 | FAQ 템플릿 안내 문구 | ✅ 완료 | `/templates` 단독 경로처럼 보이지 않게 수정 |
| P0 | Contact 첨부 dead code | ✅ 완료 | `attachmentError` 삭제. 문의 검증은 유지 |
| UI | `/studio/request` | ✅ 화면만 | 11단계 초안. 운영 제출은 Contact로 넘김. DB 저장 없음 |
| UI | `/admin/leads` | ✅ 화면만 | 운영 빌드는 빈 목록. 개발 빌드만 Example fixture |
| 범위 | Proposal, Contract, Engagement, migration | Proposal·Contract 화면만 | Step 6. 저장·서명·결제·Engagement는 없음 |

### 1.6 리뉴얼 Step 6 — Proposal / Contract UI (2026-09-28)

| 구분 | 항목 | 상태 | 비고 |
|------|------|------|------|
| UI | `/admin/proposals` 작성·미리보기 | ✅ 화면만 | 고객 문서와 같은 `ProposalDocument`. 저장 없음 |
| UI | `/my/proposals` 검토 | ✅ 화면만 | 승인·수정요청·거절은 개발 흐름. 운영은 빈 목록 |
| UI | `/admin/contracts`, `/my/contracts/:id` | ✅ 화면만 | 동의와 계약금 안내. PortOne·Engagement 없음 |
| 원칙 | Engagement 생성 조건 | 문서만 | Proposal Approved + Contract Agreed + Deposit Paid 이후. Step 6에서는 만들지 않음 |

### 1.7 리뉴얼 Step 7 — Engagement / Intake UI (2026-09-28)

| 구분 | 항목 | 상태 | 비고 |
|------|------|------|------|
| UI | `/admin/engagements` | ✅ 화면만 | 라벨 Projects. 운영은 빈 목록 |
| UI | `/my/projects` | ✅ 화면만 | 기존 메뉴 유지. Engagement mapper |
| UI | Intake, Milestone, Review, Files, Messages, Change Request | ✅ 화면만 | 업로드·저장·결제 없음 |
| 원칙 | `public.projects` | 유지 | Studio 프로젝트로 재사용하지 않음. engagements 테이블 없음 |

### 1.8 공개 사이트 — 맨 위로 (2026-09-28)

| 구분 | 항목 | 상태 | 비고 |
|------|------|------|------|
| UI | 맨 위로 버튼 | ✅ | 공개 페이지. 스크롤 후에만 표시. MY SEOA·Admin에는 없음 |

### 1.9 리뉴얼 Step 8 — Admin Operations UI (2026-09-28)

| 구분 | 항목 | 상태 | 비고 |
|------|------|------|------|
| UI | `/admin/dashboard` | ✅ 화면만 | `/admin`은 기존 Commerce 관리 화면 |
| UI | Customers, Products, Payments, Intake, Care, Support | ✅ 화면만 | 저장 없음. Production은 빈 목록 |
| UI | SaaS, Content, Analytics, Settings | ✅ 화면만 | 차트·비밀 키 입력 없음 |
| 연결 | Orders, Chatbot | 안내 | Legacy Admin으로 이동. 재구현하지 않음 |

---

## 2. 구현 예정 (미완료)

### 2.0 리뉴얼 다음 단계 (Step 4 이후, 승인 전 착수 금지)

| # | 항목 | 비고 |
|---|------|------|
| R1 | Public IA 페이지 (Brand, Studio, SaaS, Work, About, Contact) | ✅ Step 2에서 페이지 생성 |
| R2 | 회원가입 Individual / Business | ✅ Step 3. Guest Contact 포함. 첨부 저장·문의 이메일 자동 연결은 이후 |
| R3 | MY SEOA 데이터 연결 | UI skeleton은 Step 4. 주문·다운로드·문의 조회는 아직 연결하지 않음 |
| R4 | Studio Lead UI, `/admin/leads` | 화면은 Step 5. 저장은 아직 없음 |
| R4b | Proposal / Contract UI | 화면은 Step 6. 저장·서명·결제·Engagement는 없음 |
| R5 | engagements 스키마 | 화면은 Step 7. 테이블은 Final Integration 전 만들지 않음. 기존 `projects` 재사용 금지 |
| R6 | Admin Operations UI | 화면은 Step 8. `/admin` Legacy 유지. 저장·권한 분리·데이터 통합은 이후 |

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

### 리뉴얼 Step 3

| 항목 | 완료 | 미완료 |
|------|:----:|:------:|
| Guest Contact 저장 (Edge Function) | ✅ | |
| users.account_type / 회원가입 | ✅ | |
| Contact 첨부파일 Storage | | ⬜ |
| 가입 후 guest 문의 이메일 자동 연결 | | ⬜ |
| MY SEOA 화면 | ✅ | 데이터 연결 ⬜ |
| Studio 의뢰 / Admin Leads 화면 | ✅ | 저장 ⬜ |
| Proposal / Contract 화면 | ✅ | 저장·결제 ⬜ |
| Engagement / Intake 화면 | ✅ | 저장·업로드 ⬜ |
| 공개 사이트 맨 위로 버튼 | ✅ | |
| Admin Operations 화면 | ✅ | 저장·통합 ⬜ |

---

## 5. 사용자 직접 작업 항목 & 방법

공식 Supabase 대상은 기록만 되어 있습니다. Final Data Model과 별도 Integration 지시 전까지 아래는 실행하지 않습니다.

- 프로젝트: SEOAH.STUDIO
- Ref: `qzvxypynlluqpdpmsstu`
- Region: ap-northeast-2
- 상태: ACTIVE_HEALTHY
- public schema: 비어 있음
- Migration
- Edge Function deploy
- Supabase link
- DB push
- Vercel Production env 교체
- 기존 사이트 Supabase env 변경

### 5.1 Supabase Migration — Final Integration 단계까지 보류

지금 실행할 작업이 아닙니다. 대상 ref는 `qzvxypynlluqpdpmsstu`로 확인됐지만 public schema는 비어 있습니다. 최종 데이터 모델과 별도 Integration 지시 전까지 적용하지 않습니다.

`supabase db push`를 실행하지 않습니다. SQL Editor에서 마이그레이션을 적용하지 않습니다. 다른 Supabase 프로젝트에도 적용하지 않습니다.

나중에 대상이 확정되면 볼 파일:

- `supabase/migrations/016_policy_agreements.sql`
- `supabase/migrations/017_refund_requests_and_bucket.sql`
- `supabase/migrations/018_orders_refund_columns.sql`
- `supabase/migrations/019_refund_attachments_bucket.sql`
- `supabase/migrations/020_guest_inquiries_account_type.sql`

---

### 5.2 Edge Function 배포 — Final Integration 단계까지 보류

지금 실행할 작업이 아닙니다. 대상 ref는 확인됐지만 함수를 배포하지 않고, `supabase link`도 하지 않습니다. 기존 사이트의 env도 바꾸지 않습니다.

나중에 대상이 확정되면 배포 대상이 되는 함수:

- `ai-customize`
- `verify-payment`
- `get-download-url`
- `send-email`
- `submit-chatbot-inquiry`
- `submit-refund-request`
- `process-refund`
- `delete-account`
- `submit-contact` (챗봇 함수와 같이 JWT 검증을 끄고, 함수 안에서 로그인 토큰만 따로 확인)

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
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | ai-customize, verify-payment, process-refund, submit-refund-request, submit-chatbot-inquiry, submit-contact, get-download-url, delete-account |
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
