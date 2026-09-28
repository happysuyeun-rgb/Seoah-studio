# Cursor Handoff — Code Audit & Remaining Work

**Date:** 2026-09-28  
**Repository:** `happysuyeun-rgb/Seoah-studio`  
**Audit basis:** GitHub `main` as of commit `8304473`  
**Latest feature commit:** `94b0425`  
**Purpose:** 현재 코드 기준으로 완료/누락/의도적 보류 항목을 구분하고, Cursor가 다음 작업을 안전하게 이어갈 수 있도록 실행 순서를 고정한다.

> 이 문서는 “무엇이 아직 안 됐는가”를 기록하는 작업 인계서다.  
> 코드에서 확인되지 않은 런타임 상태는 완료로 간주하지 않는다.

---

## 0. Executive Summary

현재 저장소는 다음 상태다.

### 코드로 확인된 완료

- Public 리뉴얼 Route와 화면
  - Home
  - Ready
  - Brand
  - Studio
  - Care
  - SaaS
  - Work
  - About
  - FAQ
  - Contact
- 회원가입 UI
  - Individual
  - Business
  - OAuth 후 account type 선택 화면
- MY SEOA UI Skeleton
  - Dashboard
  - Purchases
  - Projects
  - Proposals
  - Billing
  - Support
  - Notifications
  - Account
- Guest Contact용 코드
  - `020_guest_inquiries_account_type.sql`
  - `submit-contact` Edge Function
- Legacy Commerce Route 유지
  - templates
  - project customization
  - payment
  - legacy mypage
  - admin
  - refund
- Production MY SEOA 데이터는 가짜 데이터 대신 Empty State를 기본으로 사용
- 기존 `public.projects`는 Legacy customization session으로 유지

### 아직 구현되지 않은 핵심 기능

- Step 5–7 화면의 실제 저장 (Lead, Proposal, Contract, Engagement, Intake)
- Milestone / Review / Files / Messages / Change Request persistence
- New Admin Operations
- MY SEOA 실제 DB 데이터 연결
- 최종 New Platform 데이터 모델 / Migration
- Supabase 실제 연결 및 런타임 검증

### 가장 중요한 현재 원칙

**지금은 신규 DB Migration을 적용하지 않는다.**

먼저 UI/업무 흐름 뼈대를 완성하고,
그 뒤 최종 Domain/Data Model을 확정한 다음
정확한 SEOAH Supabase 프로젝트에만 Migration을 적용한다.

---

# 1. 확인된 즉시 보완 항목

아래는 새로운 비즈니스 기능을 만들기 전에 또는 해당 Step과 함께 정리하는 것을 권장한다.

## P0-1. MY SEOA / Admin이 Public Shell과 완전히 분리되지 않음

### 현재 코드

`src/App.tsx`에서 전체 Route가 `AppShell` 안에 있고,
`AppShell`은 항상 `GNB`를 렌더링한다.

또한 `ChatbotWidget`도 Routes 바깥에 있어
`/my/*`, `/admin`에서도 Public 경험이 섞일 수 있다.

`AppShell`은 현재 Footer만 다음에서 숨긴다.

- `/admin`
- `/my`
- `/my/*`

### 문제

MY SEOA는 고객 포털이고,
Admin은 운영 화면이므로 Public GNB/Chatbot과 분리하는 편이 구조적으로 맞다.

특히 Public GNB를 숨기면 MY SEOA 내부에서 로그아웃/홈 이동 동선도 별도로 제공해야 한다.

### 권장

대규모 Router rewrite는 하지 말고 다음 중 최소 변경안을 선택한다.

- Public / Portal / Admin 별 Layout 분리
- 또는 AppShell에서 pathname 기준 Header/Chatbot visibility 분리

### 완료 기준

- Public: Public GNB + Chatbot
- MY SEOA: Portal Navigation만
- Admin: Admin 경험만
- Legacy Route는 기존 동작 유지

---

## P0-2. Studio 프로젝트 의뢰 CTA가 아직 Mock Form에 연결됨

### 현재 코드

`src/components/marketing/nav.ts`

```
REQUEST_PATH = '/studio#request'
```

`src/pages/StudioPage.tsx`에는 간단한 Name / Email / Project Type / Message form이 남아 있다.

Submit 시 저장되지 않고:

```
toast.info('문의 접수를 준비하고 있습니다.')
```

만 실행된다.

### 문제

실제 고객에게는 “보낼 수 있는 form”처럼 보이지만 저장되지 않는다.

### 처리

Step 5에서 반드시:

- `/studio/request` route 생성
- Project Request 다단계 Flow 구현
- 모든 Project CTA를 새 route로 연결
- 기존 inline mock form 제거 또는 실제 Contact CTA로 대체

DB 저장은 아직 하지 않는다.

### Production 원칙

실제 저장되지 않는 form에 성공처럼 보이는 UX를 만들지 않는다.

---

## P0-3. Contact 화면은 실제 백엔드 연결이 아직 검증되지 않음

### 현재 코드

`ContactPage.tsx`는 실제로:

```
supabase.functions.invoke('submit-contact')
```

를 호출한다.

그러나:

- SEOAH Supabase project ref 미확인
- Migration 020 미적용
- submit-contact 미배포
- Guest insert 실제 검증 없음

### 의미

**코드는 구현됐지만 서비스 기능은 검증되지 않았다.**

Production에서 Contact를 실제 접수 기능으로 간주하면 안 된다.

### 향후 완료 조건

- 정확한 Supabase project 확인
- Migration 검토/적용
- submit-contact deploy
- guest submit
- signed-in submit
- Admin display
- RLS 직접 접근 차단

모두 실제 검증 후에만 “완료” 처리한다.

---

## P0-4. Signup / OAuth account_type도 런타임 미검증

### 코드 상태

- `/signup` 존재
- `/account-type` 존재
- auth metadata에 `account_type`, `company_name` 전달
- Migration 020 trigger에 account_type 처리 코드 존재

### 미검증

- 실제 email signup
- confirmation ON/OFF
- Google
- Kakao
- account_type DB 저장
- company_name DB 저장
- OAuth onboarding

### 추가 기술 부채

`AuthCallbackPage.tsx`는 OAuth 신규 사용자 판별에
“created_at이 15분 이내” heuristic을 사용한다.

이는 임시 기준으로는 동작할 수 있지만 최종 onboarding 판별로는 취약하다.

### 향후 개선

실제 DB 연결 시:

- onboarding state 또는 명확한 account_type 상태를 기준으로 routing
- 기존 OAuth 사용자를 불필요하게 block하지 않음
- `is_admin`과 account_type은 계속 완전 분리

---

## P0-5. AdminRoute에서 render 중 navigate 호출

### 현재 코드

`src/components/AdminRoute.tsx`

권한이 없을 때 render 과정에서:

```
navigate('/', { replace: true })
return null
```

을 수행한다.

### 권장

React render 중 imperative navigation 대신
`<Navigate />` 또는 effect 기반 처리로 변경한다.

### 범위

작은 안정화 수정만 한다.
Admin auth logic 자체를 rewrite하지 않는다.

---

## P0-6. FAQ에 실제 존재하지 않는 경로 표현이 있음

### 현재 문구

`src/pages/FaqPage.tsx`

“현재 공개된 템플릿은 `/templates` 갤러리에서 그대로 볼 수 있습니다.”

### 실제 Route

현재는:

- `/templates/:category`
- `/templates/detail/:id`

이며 `/templates` 단독 Route는 없다.

### 처리

둘 중 하나:

- FAQ 문구를 “Ready 페이지에서 기존 갤러리로 이동할 수 있습니다” 등으로 수정
- 또는 필요성이 명확한 경우에만 `/templates` redirect 추가

불필요한 신규 Route를 만들기보다는 문구 수정 우선.

---

## P0-7. Contact Attachment 관련 죽은 코드 정리

### 현재

Contact UI에서는 첨부 input을 제거했지만
`src/lib/contactSchema.ts`에는 다음이 남아 있다.

- `allowedExtensions`
- `maxAttachmentBytes`
- `attachmentError()`

### 처리

현재 사용하지 않으므로 제거.

향후 attachment를 실제 구현할 때
Storage 정책과 함께 다시 설계한다.

---

# 2. MY SEOA — 현재는 UI Skeleton, 실제 기능은 미연결

## 확인된 좋은 구조

`src/features/my-seoa/portalData.ts`는 production 기본값을 모두 빈 배열로 두고 있다.

`mockData.ts`의 예시 데이터는 실제 portal 화면에서 사용하지 않는다.

따라서 가짜 고객/주문/프로젝트를 실제 데이터처럼 노출하지 않는 원칙은 지켜지고 있다.

## 남은 작업

### Purchases

향후 Legacy 데이터를 실제로 연결:

- orders
- downloads
- refund_requests

필요하면 Ready 신상품 도메인 도입 이후 mapper 추가.

### Projects

`/my/projects`는 Engagement display mapper를 사용한다. 운영 빌드는 빈 목록이다.

실제 Studio 프로젝트는 절대 legacy `projects`에서 읽지 않는다.

`engagements` 테이블은 아직 없다.

### Proposals

Admin 작성·미리보기와 고객 검토 UI는 Step 6에서 있다. 저장과 상태 mutation은 없다.

### Billing

UI shell only.

향후 기존 orders/payment history와
새 Studio payment schedule을 구분해서 표시해야 한다.

### Support

현재 UI type status:

- New
- Open
- Waiting Customer
- Resolved
- Closed

Legacy inquiries는 현재 `pending / replied` 중심이다.

실제 연결 시 status mapper를 명확히 둔다.
DB status를 UI string에 직접 결합하지 않는다.

### Account

Name / Email만 Auth Store에서 표시.

아직 없음:

- account_type 실제 조회
- company_name 실제 조회
- security action
- notification setting
- new portal에서의 account deletion 동선

Legacy `/mypage/settings`의 기능을 삭제하지 않는다.

---

# 3. Step 5 — DONE (UI) / REMAINING (저장)

## DONE

- `/studio/request` 11단계 UI, local state
- 제출은 Contact handoff. DB 저장 없음
- `src/features/leads/`
- `/admin/leads`, Lead Detail
- Qualification, Recommended Path, Internal Notes, Create Proposal 이동

상태: NEW, CONTACTED, CONSULTATION, PROPOSAL, WON, LOST. 화면만.

## REMAINING

- Lead 저장
- Project Request Description 등 필수 입력 범위 최종 결정
- Project Request sessionStorage handoff의 stale data cleanup

---

# 4. Step 6 — DONE (UI) / REMAINING (저장·결제·연결)

## DONE

- `/admin/proposals` 목록, 작성, 상세, 편집, Preview
- 고객 `/my/proposals` 검토: Approve, Request Revision, Reject. 저장 없음
- `/admin/contracts`, `/my/contracts/:id`
- Version 표시, Agreement UI, Deposit Required UI
- 전자서명과 결제 연결 없음

## REMAINING

- Proposal / Contract 저장
- Admin Proposal의 Draft → Preview → Send UI shell 보완
- Proposal Approved → Admin Contract 준비/생성 UI 연결
- Modal full focus trap 보완
- 전자서명, PortOne, Engagement 자동 생성

---

# 5. Step 7 — DONE (UI / domain skeleton) / REMAINING (저장)

## DONE

- `src/features/engagements/`, `src/features/intake/`
- Admin `/admin/engagements`, `/admin/engagements/:id` (라벨은 Projects)
- 고객 `/my/projects`, `/my/projects/:id`에 Engagement mapper 연결. 메뉴명은 Projects
- Intake는 Engagement Detail 탭. 별도 route 없음
- 고객 단계: 준비, 기획, 디자인, 제작, 검토, 완료
- Admin status는 mapper로만 고객 단계가 된다
- Milestone, Review, Files, Messages, Change Request, Activity, Payments는 화면과 타입만
- 운영 빌드는 빈 목록. DEV fixture만 예시 데이터
- Legacy `public.projects`는 사용하지 않음. `engagements` 테이블은 만들지 않음

## REMAINING

- Engagement, Intake, Milestone, Review, File, Message, Change Request, Activity, Payment 저장
- Storage, 실제 업로드, 실시간 메시지, 승인 저장, 결제 연결
- READY_TO_START 자동 전이
- Step 6에서 넘어온 누락:
  - Admin Proposal의 Draft → Preview → Send UI shell 보완
  - Proposal Approved → Admin Contract 준비/생성 UI 연결
  - Project Request sessionStorage handoff의 stale data cleanup
  - Modal full focus trap 보완
  - Project Request Description 등 필수 입력 범위 최종 결정

---

# 6. Step 8 — New Admin Operations 미구현

현재 `AdminPage.tsx`는 약 40KB의 Legacy Admin page이며
기존 Commerce 관리 기능이 중심이다.

### 원칙

기존 AdminPage를 한 번에 rewrite하지 않는다.

신규 기능은 별도 route로 추가:

- `/admin/leads`
- `/admin/proposals`
- `/admin/contracts`
- `/admin/engagements`
- 이후 Products / Care / SaaS 등

공통 Admin shell이 필요해지는 시점에 점진적으로 분리한다.

---

# 7. 최종 DB / Integration 단계에서 해야 할 일

아래는 UI Skeleton 완료 전에는 실행하지 않는다.

## 7.1 Supabase 원본 프로젝트 식별

현재 저장소에는 실제 project ref가 없고
현재 확인한 Supabase 계정에서도 SEOAH 프로젝트가 식별되지 않았다.

먼저:

1. Vercel env 또는 기존 배포 환경에서 `VITE_SUPABASE_URL` 확인
2. project ref 확인
3. 해당 DB가 기존 SEOAH 데이터인지 read-only 확인

검증 대상:

- users
- templates
- projects
- orders
- downloads
- inquiries
- refund_requests

## 7.2 Final Data Model

UI/업무 흐름이 확정된 뒤 최종 설계:

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
- SaaS organizations/workspaces

## 7.3 Migration

- 001~019 수정 금지
- 020은 그대로 적용한다고 가정하지 말 것
- 최종 schema와 함께 재검토
- 기존 데이터 보존
- additive 우선
- backup/rollback 계획 후 적용

## 7.4 RLS / Edge

실제 역할별 검증:

- Guest
- Customer
- Admin
- SaaS Owner/Admin/Member 향후

## 7.5 MY SEOA 실제 데이터

DB 연결 시 page에서 직접 Supabase 호출을 늘리지 않는다.

신규 영역에 query/service mapper layer를 둔다.

예:

- `features/my-seoa/data/`
- React Query hooks
- legacy row → portal domain mapper
- new domain row → portal domain mapper

---

# 8. Security / Production Readiness

## Raw IP 저장

`submit-contact`는 rate limit 목적으로 문의 row에 raw IP를 저장한다.

향후 Production 전 결정:

- 실제 저장 필요 여부
- retention
- truncate/hash 여부
- 개인정보 처리방침 반영 여부

법률 문구로 단정하지 말고 정책 검토 대상으로 유지.

## IP Header fallback

현재 `x-forwarded-for`가 없으면 `unknown`을 사용한다.

이 경우 환경에 따라 여러 사용자가 하나의 `unknown` rate-limit 그룹이 될 수 있다.

실제 Edge runtime header를 확인하고 fallback 정책을 보완한다.

## Contact CORS

Public intake 특성상 현재 `*` CORS가 반드시 오류는 아니지만,
Production 보안 검토 시 허용 Origin 정책을 재검토한다.

---

# 9. Documentation Drift — 반드시 정리

## Root README

현재 `README.md`는 오래된 상태다.

예:

- “AI Template Customization SaaS (Phase 1)” 중심
- React 18 표기
- React Router v6 표기
- Public / MY SEOA 신규 route 미반영

실제 `package.json`은 현재:

- React 19
- React Router 7
- Vite 8

따라서 Canonical 문서 작성과 함께 README를 갱신한다.

## PROJECT_STATUS_2026-03-17.md

파일 내용은 2026-09-28까지 일부 갱신됐으나
현재 의사결정과 충돌하는 부분이 있다.

특히 “사용자 직접 작업”에서:

- migration 020 적용
- submit-contact deploy

를 필수 실행처럼 적고 있다.

현재 결정은 **DB 적용을 최종 뼈대 이후로 보류**이므로
새 `PROJECT_STATUS_2026-09-28.md`로 교체해야 한다.

## CHANGELOG

2026-09 리뉴얼 변경사항이 아직 정식 version entry로 정리되지 않았다.

큰 Step이 안정화된 뒤 한 번에 기록한다.
작은 수정마다 version을 남발하지 않는다.

---

# 10. QA / CI 누락

현재 `package.json`에는:

- dev
- build
- lint
- preview

만 있고 별도 test script가 없다.

Repository에도 현재 기준 GitHub Actions CI가 확인되지 않았다.

### 권장 시점

Step 5~8 UI Skeleton이 끝난 후,
DB integration 전에 최소 자동 검증 추가를 검토한다.

예:

- npm ci
- npm run build
- typecheck
- 핵심 route smoke test

Legacy full lint 부채가 있다면
CI 도입을 위해 기존 오류를 무리하게 대규모 수정하지 않는다.

---

# 11. Content / Commercial Readiness Backlog

코드 오류는 아니지만 판매 사이트 완성도를 위해 남아 있다.

## Ready

현재 새 Ready product card는 “준비 중” placeholder 중심.
실제 판매 제품/상세/가격/CTA가 아직 없다.

## Work

Case study placeholder만 존재.

실제 공개 가능한 작업 정리 후 연결.

가짜 고객/성과/로고를 만들지 않는다.

## Login

현재 문구:

“로그인하면 AI 자동 커스텀을 시작할 수 있습니다.”

이는 과거 Template SaaS 정체성이 강하다.

New SEOAH.STUDIO 기준으로 로그인 카피와 시각 스타일을
나중에 Portal/Auth polish 단계에서 수정한다.

---

# 12. Deployment Status

GitHub status 기준:

## Feature commit `94b0425`

Vercel: **success**

즉 현재 리뉴얼 feature commit 자체는 Preview/Deploy build에 성공한 이력이 있다.

## Latest docs commit `8304473`

Vercel: **failure**

Target 상태는 코드 build error가 아니라:

`upgradeToPro=build-rate-limit`

로 연결된다.

따라서 현재 확인 가능한 범위에서는
최신 docs commit 배포 실패를 애플리케이션 코드 regression으로 판단하지 않는다.

Vercel build quota/rate limit가 풀린 뒤 재배포 확인.

---

# 13. Cursor 실행 우선순위

## Phase A — 작은 안정화 정리

Step 5와 함께 또는 직전에 처리:

1. MY SEOA / Admin Public Shell 분리
2. AdminRoute render-time navigate 수정
3. FAQ `/templates` 잘못된 표현 수정
4. Contact attachment dead code 삭제
5. Studio mock form은 Step 5에서 제거
6. Login 등 구 Legacy copy는 별도 polish backlog로 기록

### 금지

- Legacy Commerce refactor
- DB migration
- Supabase link
- Edge deploy
- payment/refund 변경

---

## Phase B — UI / Workflow Skeleton

순서 고정:

1. Step 5 — Project Request + Leads
2. Step 6 — Proposal + Contract
3. Step 7 — Engagement + Intake
4. Step 8 — New Admin Operations

각 Step마다:

- domain UI type 정의
- Production fake data 금지
- DEV mock 분리
- build
- typecheck
- changed-file lint
- Desktop/Mobile 확인

---

## Phase C — Canonical Documentation

다음 기준 문서를 완성:

1. `PROJECT_STATUS_2026-09-28.md`
2. `ARCHITECTURE_AND_BOUNDARIES.md`
3. `PRODUCT_IA_AND_FLOWS.md`
4. `DOMAIN_AND_DATA_MODEL_DECISIONS.md`
5. `BUSINESS_RULES_AND_SERVICE_POLICY.md`
6. `DEPLOYMENT_MIGRATION_RUNBOOK.md`

기존 문서는 즉시 삭제하지 않고 Historical 처리.

---

## Phase D — Final Data & Runtime Integration

UI/업무 흐름 확정 뒤에만:

1. Supabase 원본 식별
2. Existing DB read-only audit
3. Final schema
4. Migration review
5. Migration apply
6. Edge deploy
7. MY SEOA real data
8. Lead/Proposal/Contract/Engagement persistence
9. RLS/security verification
10. Legacy regression
11. Production QA

---

# 14. Cursor에게 주는 작업 원칙

다음 규칙을 모든 후속 작업에서 유지한다.

1. **기존 `projects`는 Legacy customization session이다.**
2. Studio 고객 프로젝트에 기존 `projects`를 사용하지 않는다.
3. 새 프로젝트 domain은 `engagements`.
4. `orders.project_id NOT NULL`을 임의로 변경하지 않는다.
5. Existing payment/download/refund/AI customize 흐름을 보호한다.
6. 새 DB migration은 지금 만들거나 적용하지 않는다.
7. Mock data는 production에 표시하지 않는다.
8. 실제 저장되지 않는 UI를 성공한 것처럼 보여주지 않는다.
9. AdminPage에 새 기능을 계속 붙이지 말고 신규 route를 사용한다.
10. 한 Step을 끝내고 검증한 뒤 다음 Step으로 이동한다.
11. 작업 후 변경 파일/route/build/typecheck/lint/legacy 영향 여부를 보고한다.
12. 실제 코드와 문서가 충돌하면 코드 상태를 먼저 보고하고 임의로 과거 문서를 사실로 간주하지 않는다.

---

# 15. 현재 다음 작업

현재 가장 자연스러운 다음 작업은:

> **Step 5 — Studio Project Request + Lead / Admin Leads UI Skeleton**

단, Step 5 작업 안에서 다음 P0 cleanup을 함께 포함한다.

- `/studio#request` → `/studio/request`
- 기존 Studio mock submit 제거
- Public / MY SEOA shell boundary 정리
- AdminRoute navigation 안정화
- FAQ 잘못된 route copy 수정
- Contact attachment dead code 삭제

그 뒤 Step 6으로 이동한다.

---

## Audit Note

이 문서는 GitHub 저장소의 코드/설정에서 직접 확인된 내용과,
이미 명시적으로 결정된 리뉴얼 구조를 기준으로 작성했다.

다음은 아직 확인된 사실로 간주하지 않는다.

- 어떤 Supabase 프로젝트가 실제 Production DB인지
- Migration 020이 적용됐는지
- submit-contact가 실제 배포됐는지
- Google/Kakao signup이 실제 성공하는지
- Production Contact가 실제 문의를 저장하는지

이 항목들은 Runtime Integration 단계에서 실제 환경 검증이 필요하다.
