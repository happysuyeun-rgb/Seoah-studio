# SEOAH.STUDIO Documentation Plan — 2026-09-28

> 기준 커밋: `94b0425`  
> 목적: 리뉴얼 과정에서 확정된 제품·기술·운영 결정을 잃지 않되, 문서를 계속 늘리는 대신 **소수의 기준 문서(Single Source of Truth)** 로 정리한다.
>
> 현재 원칙: **UI/업무 흐름의 뼈대를 먼저 완성하고, 최종 데이터 모델 확정 후 Migration과 실제 연동을 진행한다.**  
> `020_guest_inquiries_account_type.sql`과 `submit-contact`는 코드만 존재하며 원격 DB 적용/배포는 보류 상태다.

---

## 1. 왜 지금 문서 정리가 필요한가

현재 `docs/`에는 초기 Template SaaS 시기의 계획서, Gap 문서, Phase 문서가 많이 남아 있고, 2026-09 리뉴얼의 기준과 과거 문서가 섞여 있다.

특히 다음 문제가 있다.

- 루트 `README.md`가 현재 React/Vite 버전과 Public/MY SEOA 라우트를 반영하지 못한다.
- `PROJECT_STATUS_2026-03-17.md`는 내용은 2026-09-28까지 갱신됐지만 파일명이 과거 날짜이고, 일부 DB 적용 지침은 현재의 **Migration 보류 결정**과 맞지 않는다.
- 과거 구현 계획 문서가 여러 개 있어 어떤 문서가 현재 기준인지 판단하기 어렵다.
- 사업 운영 규칙(Discovery, 가격, 수정 범위, 권리, Care, Proposal/Contract)이 코드 밖 대화에 많이 남아 있다.
- Legacy Commerce와 New SEOAH.STUDIO의 경계를 문서로 고정하지 않으면 향후 DB/라우트 작업에서 기존 결제·다운로드 흐름을 깨뜨릴 위험이 있다.

따라서 기존 문서를 모두 다시 쓰지 않고, 아래 **6개 기준 문서**를 중심으로 정리한다.

---

# 2. Canonical Documents — 앞으로 기준으로 삼을 6개 문서

## P0-1. `PROJECT_STATUS_2026-09-28.md`

### 목적
현재 무엇이 완료됐고, 무엇이 UI-only이며, 무엇이 보류됐는지 한 곳에서 확인한다.

### 반드시 기록할 내용

- 현재 기준 커밋 / 배포 상태
- Step 1 — Design System / App Shell
- Step 2 — Public IA
- Step 3 — Contact / Signup 코드
- Step 4 — MY SEOA UI Skeleton
- 다음 단계
  - Step 5 Project Request / Leads
  - Step 6 Proposal / Contract
  - Step 7 Engagement / Intake
  - Step 8 Admin Operations
  - Final DB Design / Migration / Integration
- 실제 미적용 항목
  - Migration 020
  - submit-contact deploy
  - Guest Contact DB persistence
  - account_type 실제 DB 저장 검증
- Supabase 원본 프로젝트 ref 미확인 상태
- Vercel 현재 SEOAH.STUDIO 배포 상태
- Legacy regression 보호 범위

### 완료 기준
새로 프로젝트에 들어온 사람이 이 문서 하나로 “지금 어디까지 왔는가”를 이해할 수 있어야 한다.

---

## P0-2. `ARCHITECTURE_AND_BOUNDARIES.md`

### 목적
**Legacy Commerce를 살리면서 New SEOAH.STUDIO를 추가한다**는 핵심 구조를 고정한다.

### 반드시 기록할 내용

#### Legacy Commerce — 유지
- `templates`
- `projects` = 템플릿 커스터마이징 세션
- `orders`
- `downloads`
- PortOne 결제
- AI customize
- Refund
- 기존 `/templates/*`
- 기존 `/project/*`
- 기존 `/payment/*`
- 기존 `/mypage/*`

#### New SEOAH.STUDIO
- Public marketing
- Ready
- Studio
- Care
- SaaS
- MY SEOA
- Lead
- Proposal / Contract
- Engagement
- Intake
- Admin Operations

#### 절대 규칙
- 기존 `public.projects`를 Studio 실제 고객 프로젝트로 재사용하지 않는다.
- 새 고객 프로젝트 도메인은 `engagements`를 사용한다.
- 기존 `orders.project_id NOT NULL` 구조를 임의 변경하지 않는다.
- 기존 Commerce를 삭제·rename·대규모 refactor하지 않는다.
- 새 기능은 가능한 한 additive 방식으로 추가한다.

### 함께 기록할 기술 구조
- React / TypeScript / Vite
- Supabase Auth / DB / Storage / Edge Functions
- React Query
- Zustand
- PortOne
- Vercel
- Public AppShell / MY SEOA Portal / Admin 분리 방향

### 완료 기준
Cursor나 다른 개발자가 “어떤 기존 코드를 건드리면 안 되는지” 명확하게 알 수 있어야 한다.

---

## P0-3. `PRODUCT_IA_AND_FLOWS.md`

### 목적
페이지 목록이 아니라 **사업 흐름과 고객 여정**을 기준으로 IA를 기록한다.

### Public IA

- HOME
- READY
- STUDIO
- CARE
- SAAS
- WORK
- ABOUT
- FAQ
- CONTACT
- LOGIN / SIGNUP

### MY SEOA

- Dashboard
- Purchases
- Projects
- Proposals
- Billing
- Support
- Notifications
- Account

### 핵심 고객 Flow

#### Ready
제품 탐색 → 상세 → 선택 → 기존 Commerce/향후 Product 구매 → MY SEOA

#### Studio
Studio 소개 → Project Request → Lead → Consultation/Qualification → Proposal → Contract → Deposit → Engagement → Intake → Production → Review → Launch

#### Care
서비스 확인 → 문의/제안 → 선택형 운영 계약

#### SaaS
Product 소개 → Early Access / Trial → 향후 Workspace

### MY SEOA Dashboard가 답해야 하는 질문

1. 지금 어디까지 진행됐나?
2. 내가 지금 해야 할 일이 있나?
3. 구매/결제/문의 상태는 어떤가?

### 완료 기준
각 Route가 왜 존재하는지와 전후 흐름을 코드 없이 설명할 수 있어야 한다.

---

## P0-4. `DOMAIN_AND_DATA_MODEL_DECISIONS.md`

### 목적
DB를 바로 만들지 않더라도 **도메인 이름과 경계**를 먼저 확정한다.

### 현재 확정된 도메인

#### Existing
- users
- templates
- projects — Legacy customization session
- orders
- downloads
- inquiries
- refund_requests

#### Planned
- products
- leads
- proposals
- proposal_versions
- contracts
- contract_versions
- engagements
- engagement_milestones
- engagement_files
- engagement_messages
- engagement_change_requests
- engagement_activities
- intake
- care subscriptions
- organizations / workspaces — SaaS 단계

### 핵심 모델 결정

- `users.account_type = individual | business | null`
- `is_admin`은 account_type과 완전히 별개
- Business 가입만으로 Organization을 생성하지 않는다.
- `products`는 장기적으로 Ready/APX/Brand/Care/SaaS를 포괄할 수 있다.
- 기존 `templates`는 즉시 교체하지 않고 향후 `legacy_template_id` 등으로 연결 가능하게 한다.
- Engagement 상태와 고객 표시 상태는 분리한다.
- Payment 상태와 Project 상태는 분리한다.
- Proposal/Contract는 version overwrite가 아니라 version history를 전제로 한다.

### Migration 원칙

- 최종 뼈대 확정 전 신규 비즈니스 테이블 Migration은 적용하지 않는다.
- 기존 Migration 001~019를 덮어쓰지 않는다.
- 020은 최종 DB 설계 시 재검토 후 유지/수정/대체 여부를 결정한다.
- 공식 대상 ref는 `qzvxypynlluqpdpmsstu`다. Final Data Model과 별도 Integration 지시 전 이 프로젝트를 포함해 어떤 프로젝트에도 Migration을 적용하지 않는다.

### 완료 기준
나중에 스키마 작업을 시작할 때 “이름부터 다시 논의”하지 않아도 되어야 한다.

---

## P0-5. `BUSINESS_RULES_AND_SERVICE_POLICY.md`

### 목적
코드만으로 알 수 없는 서비스 운영 규칙을 기록한다.

### Studio / Discovery

- Discovery Sprint: 30만원
- 기간: 3~5일
- 본 계약 시 전액 차감
- 산출:
  - 서비스 정의
  - 핵심 사용자/문제
  - 핵심 기능
  - 화면 목록
  - MVP 포함/제외 범위
  - 예상 일정
  - 정식 견적
- 상세 IA / wireframe / DB/API / 구현 설계는 본계약 이후

### 가격 Guide

- Basic MVP: 590~790만원
- Standard MVP: 790~1,200만원
- Advanced: 1,200만원~
- 최종 금액은 Discovery 이후 확정

### Care

- Website Care Mini: 9.9만원/월
- Website Care: 19.9만원/월
- Product Care: 49만원~/월
- 신규 페이지/기능/대규모 구조 변경/외부 유료 비용은 기본 범위 제외
- 향후 반드시 확정:
  - 요청 1건의 정의
  - 월 처리 한도
  - 이월
  - 응답시간
  - 긴급 대응

### 수정 / Scope

분류:
- SCOPE_IN
- MINOR_CHANGE
- CHANGE_REQUEST
- BUG

원칙:
- 수정 1회 = 피드백 묶음 1회
- 승인된 단계는 lock
- BUG와 Change Request 구분
- Change Request는 비용/일정 영향 확인 후 고객 승인

### 권리 / 소스

- Customer Assets
- Client-specific Deliverables
- Studio Assets
- 기본 납품 = Managed Delivery
- Full Source = 추가 계약/비용
- Studio 공통 라이브러리/재사용 모듈은 별도

### 결제 / 환불

- Ready / Custom / SaaS 정책을 구분
- Custom은 단순 “계약금 환불불가” 문구로 처리하지 않고 진행률/산출물/외부비용 기준 설계
- 최종 약관은 법률 검토 대상

### 완료 기준
견적서·계약서·Admin 운영을 만들 때 다시 정책을 추측하지 않아야 한다.

---

## P0-6. `DEPLOYMENT_MIGRATION_RUNBOOK.md`

### 목적
“무엇을 어느 환경에 적용했는지”를 추적하는 안전 문서다.

### 현재 반드시 기록할 상태

#### GitHub
- repository: `happysuyeun-rgb/Seoah-studio`
- main 최신 기준: `94b0425`

#### Vercel
- SEOAH.STUDIO latest commit deployment: 성공
- 별도 `my-chapter` Preview 실패는 SEOAH.STUDIO와 별도 프로젝트

#### Supabase
- Frontend env:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Edge Function env:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - 필요 시 `SUPABASE_ANON_KEY`
- 공식 Supabase 대상: SEOAH.STUDIO / `qzvxypynlluqpdpmsstu` / ap-northeast-2 / ACTIVE_HEALTHY / public schema EMPTY
- 기록만 됨. `supabase link` 미연결. Vercel·기존 사이트 env는 바꾸지 않음
- Migration 020: **파일만 존재 / 미적용**
- submit-contact: **파일만 존재 / 미배포**

### 향후 배포 절차

공식 대상 ref `qzvxypynlluqpdpmsstu`는 기록됐다. 아래는 Final Data Model과 별도 Integration 지시 뒤에만 진행한다. 지금 실행하지 않는다.

1. 대상은 SEOAH.STUDIO `qzvxypynlluqpdpmsstu`. 기존 사이트 env는 그때까지 유지
2. public schema가 비어 있음을 다시 확인. 기존 Commerce 데이터는 이 프로젝트에 없음
3. 최종 schema와 migration 재검토
4. Backup / rollback 기준 결정
5. Migration dry review
6. 적용
7. Edge Function deploy
8. Auth / RLS / Guest / Admin 실제 검증
9. Legacy Commerce regression test
10. Production deploy

### 완료 기준
“적용한 줄 알았는데 안 됨” 또는 “다른 프로젝트에 잘못 적용”되는 사고를 막아야 한다.

---

# 3. P1 — 위 6개 이후 필요한 문서

P0 문서가 정리된 뒤 필요할 때만 만든다.

| 문서 | 작성 시점 | 이유 |
|---|---|---|
| `AUTH_AND_ACCOUNT_MODEL.md` | Signup/OAuth 최종 연결 전 | Individual/Business/OAuth/Organization 역할 정리 |
| `PROJECT_STATUS_MODEL.md` | Engagement 구현 전 | Admin 상태, 고객 상태, Milestone, Action Required 기준 |
| `PROPOSAL_CONTRACT_SPEC.md` | Step 6 확정 후 | Proposal/Contract 필드·version·approval 흐름 |
| `ADMIN_OPERATIONS.md` | Step 8 확정 후 | Leads/Projects/Support/Refund 운영 |
| `QA_RELEASE_CHECKLIST_V2.md` | DB 연결 시작 전 | Legacy + New 플랫폼 통합 회귀 테스트 |
| `SECURITY_AND_PRIVACY_NOTES.md` | Production 연결 전 | RLS, service role, IP 저장/보존, secret 관리 |

문서가 6개 이상 더 늘어날 필요가 생기면 먼저 기존 기준 문서에 합칠 수 있는지 검토한다.

---

# 4. 기존 문서 정리 계획

## 유지
기존 구현 근거가 있는 문서는 당장 삭제하지 않는다.

- `EDGE_FUNCTIONS_API.md`
- `ERROR_CODES_MAPPING.md`
- `PRODUCTION_ENV.md`
- `QA_CHECKLIST.md`
- `CHANGELOG.md`

## Current 문서로 교체 후 Historical 처리 후보

- `PROJECT_STATUS_2026-03-17.md`
- `PHASE_COMPLETION_STATUS.md`
- `DEV_WORK_SUMMARY_AND_NEXT_STEPS.md`
- `NEXT_IMPLEMENTATION_PLAN_V2.md`
- `FULL_SPEC_V2_IMPLEMENTATION_PLAN.md`
- `SPEC_V2_1_IMPLEMENTATION_PLAN.md`
- `SPEC_V2_2_ADDITIONS_AND_IMPLEMENTATION_PLAN.md`
- `SPEC_V3_GAP_AND_SUPPLEMENTS.md`
- 각종 Gap/Recheck 문서

### 원칙

1. 지금 바로 삭제하지 않는다.
2. 새 Canonical 문서가 완성된 후 `Historical / Legacy Reference`로 표시한다.
3. 중복된 과거 계획서는 추후 `docs/archive/` 이동을 검토한다.
4. 기존 설계 근거가 유실되지 않도록 삭제보다 archive를 우선한다.

---

# 5. 문서 작성 순서

### 1차 — 지금 바로 필요한 것
1. `PROJECT_STATUS_2026-09-28.md`
2. `ARCHITECTURE_AND_BOUNDARIES.md`
3. `PRODUCT_IA_AND_FLOWS.md`

이 세 문서가 있으면 Step 5~8 개발 중 방향이 흔들리지 않는다.

### 2차 — DB 설계 전에
4. `DOMAIN_AND_DATA_MODEL_DECISIONS.md`
5. `BUSINESS_RULES_AND_SERVICE_POLICY.md`

### 3차 — 실제 연결 직전에
6. `DEPLOYMENT_MIGRATION_RUNBOOK.md`
7. QA / Security 문서

---

# 6. 문서화하지 않을 것

다음은 별도 문서를 만들지 않는다.

- 개별 컴포넌트 사용법
- 단순 CSS 결정
- 한 번 쓰고 버릴 Cursor 프롬프트
- 화면마다 별도의 상세 명세 파일
- mock data 설명
- 코드에서 바로 확인 가능한 단순 type 목록
- 완료된 작은 수정마다 별도 Markdown

이런 내용은 코드, commit, CHANGELOG 또는 해당 Canonical 문서의 작은 섹션으로 충분하다.

---

# 7. 문서 유지 규칙

- 모든 기준 문서 상단에 **Last Updated**와 **Status**를 둔다.
- 사실 / 계획 / 보류를 구분한다.
- “구현됨”과 “코드만 작성됨”과 “원격 적용됨”을 구분한다.
- DB 작업은 반드시 다음 4단계 상태로 적는다.
  - Designed
  - Code Written
  - Applied
  - Verified
- 오래된 내용은 지우기보다 Historical로 명확히 표시한다.
- 개발 단계가 끝날 때마다 문서 전체를 다시 쓰지 않고 변경된 결정만 갱신한다.

---

# 8. 오늘의 문서화 완료 기준

2026-09-28 문서화 작업의 완료 기준은 다음과 같다.

- [x] 문서화 대상과 우선순위 정의
- [ ] Current Project Status 작성
- [ ] Architecture / Legacy Boundary 작성
- [ ] Product IA / Customer Flow 작성
- [ ] Domain / Data Model Decisions 작성
- [ ] Business Rules 작성
- [ ] Deployment / Migration Runbook 작성
- [ ] `docs/README.md`를 새 Canonical 문서 기준으로 정리
- [ ] 루트 `README.md`를 현재 stack / route / setup 기준으로 갱신
- [ ] 과거 문서에 Historical 표기 또는 archive 정책 적용

---

## 결정

앞으로 SEOAH.STUDIO 문서는 **“많이 쓰는 것”이 아니라 “다음 개발자가 잘못된 결정을 하지 않게 만드는 것”**을 기준으로 유지한다.

현재 가장 먼저 작성해야 할 문서는:

> **Project Status → Architecture Boundaries → Product IA/Flows**

이며, DB Migration 문서는 UI/업무 뼈대가 충분히 확정된 뒤 최종 schema와 함께 마무리한다.
