# Deployment and Migration Runbook

이 문서는 나중에 실행할 순서를 적어 둔 것이다. 지금 실행하지 않는다.

## 공식 대상

| 항목 | 현재 |
|------|------|
| 이름 | SEOAH.STUDIO |
| Project Ref | `qzvxypynlluqpdpmsstu` |
| Region | ap-northeast-2 |
| public schema | EMPTY |
| supabase link | 하지 않음 |
| migration | 저장소 `001`–`028`, 원격 적용 없음 |
| Edge Function | 배포 없음 |
| Storage | 없음 |
| Vercel production env | 바꾸지 않음 |
| 기존 사이트 Supabase env | 바꾸지 않음 |

public schema가 비어 있으므로, 이 대상에는 Legacy Commerce 테이블도 없다. 신규 Studio 테이블만 추가하면 현재 코드의 템플릿 구매가 동작하지 않는다.

## 001–020을 빈 데이터베이스에 쓸 수 있는가

순서대로 적용하는 전제에서 `001`–`020`은 Legacy baseline으로 재사용할 수 있다. 파일을 고치지 않는다.

`002`는 `001`의 정책을 지우고 다시 만든다. `012`는 템플릿 직접 SELECT를 막는다. `013`은 챗봇 공개 INSERT를 막는다. `020`은 `001`의 `handle_new_user`를 계정 유형이 들어가게 바꾼다. 중간만 적용하면 현재 코드와 어긋난다.

## 코드와 migration의 차이

| 차이 | 처리 |
|------|------|
| `users.updated_at` 없음 | 나중에 additive. 001은 수정하지 않음 |
| Commerce 버킷 3개가 SQL에 없음 | 나중에 버킷 생성 migration. 003은 수정하지 않음 |
| `inquiries.status`에 CHECK 없음. 코드는 `pending`, `replied`, Contact의 `new`를 함께 씀 | 020을 유지. 상태를 하나로 합치지 않음 |
| OAuth 15분 `created_at` 추정 | 코드 제안만. 이번 Step에서 수정하지 않음 |
| Studio 테이블 없음 | Group B는 `021`–`026` 초안에 있음. 결제 테이블 이름은 `studio_payments`. `engagement_payments`는 쓰지 않음. 원격 적용 없음 |

## 020

결정: **KEEP**.

`users.account_type`, `company_name`, guest `inquiries` 컬럼, 계정 유형 트리거는 최종 계정 모델과 맞다. `is_admin`을 계정 유형으로 바꾸지 않는다. Organization을 만들지 않는다. anon이 inquiries에 직접 INSERT하는 정책도 없다. Guest 쓰기는 `submit-contact` 서비스 롤이다.

020을 대체하거나 파일을 수정하지 않는다. `updated_at`과 Lead 연결은 020의 일이 아니다.

## Migration별 판단

| Migration | 목적 | 테이블 / 컬럼 | 의존 | 현재 코드 | 빈 DB | 이슈 | 조치 |
|-----------|------|----------------|------|-----------|--------|------|------|
| 001 | 초기 스키마, RLS, 가입 트리거 | users, templates, projects, orders, downloads | auth.users | Commerce 전 구간 | 가능 | 이후 정책이 이 파일을 대체 | REUSE |
| 002 | RLS 강화 | 정책만 | 001 | 주문 INSERT는 서버만 | 가능 | 001 정책을 DROP 후 재생성 | REUSE |
| 003 | Storage RLS | project-uploads, outputs, thumbnails 정책 | storage.objects | 업로드, 다운로드 | 정책은 가능 | 버킷 생성문이 없음 | REVIEW. 파일은 유지. 버킷은 나중에 |
| 004 | FAQ | faqs | users admin | FAQ 페이지 | 가능 | 없음 | REUSE |
| 005 | FAQ 시드 | faqs 행 | 004 | 공개 FAQ | 가능 | 콘텐츠 시드 | REUSE |
| 006 | 1:1 문의 | inquiries | users | Support, Admin | 가능 | user_id가 020에서 NULL 허용 | REUSE |
| 007 | 챗봇 문의 | chatbot_inquiries | users | 챗봇, Admin | 가능 | 013이 공개 INSERT를 제거 | REUSE |
| 008 | 문의 type | inquiries.type | 006 | Support 필터 | 가능 | 한국어 CHECK | REUSE |
| 009 | 프로젝트 상태 | projects.status CHECK | 001 | customize, payment | 가능 | 이름은 enum이나 실제는 CHECK | REUSE |
| 010 | 공개 템플릿 뷰 | templates_public, get_project_template_html | 001 | 갤러리, customize | 가능 | 014가 뷰를 갱신 | REUSE |
| 011 | is_admin 보호 | users 트리거 | 001 | 계정 수정 | 가능 | 없음 | REUSE |
| 012 | 템플릿 직접 조회 차단, 관리자 RPC | GRANT, RPC | 010 | Admin 템플릿 | 가능 | anon SELECT 제거 | REUSE |
| 013 | 챗봇 IP, INSERT 차단 | chatbot_inquiries.ip | 007 | submit-chatbot-inquiry | 가능 | 함수만 INSERT | REUSE |
| 014 | preview_html | templates.preview_html | 010, 012 | 미리보기 | 가능 | 없음 | REUSE |
| 015 | preview 갱신 RPC | RPC | 014 | Admin 미리보기 | 가능 | 없음 | REUSE |
| 016 | 약관 동의 | policy_agreements | users | 가입, 결제 | 가능 | 없음 | REUSE |
| 017 | 환불 요청 | refund_requests | orders, users | 환불 화면 | 가능 | 없음 | REUSE |
| 018 | 주문 환불 컬럼 | orders 환불 필드, status CHECK | 001 | 결제, 환불 | 가능 | 없음 | REUSE |
| 019 | 환불 첨부 버킷 | refund-attachments | storage | 환불 첨부 | 가능 | 이 버킷만 SQL에 있음 | REUSE |
| 020 | 계정 유형, guest 문의 | users.account_type, inquiries guest 컬럼, 트리거 | 001, 006 | 가입, Contact | 가능 | KEEP. 아래 020 결정 | REUSE |

REPLACE와 DO NOT APPLY는 없다. 순서를 건너뛰거나 파일 내용을 고치는 적용은 하지 않는다.

## Edge Function이 적용 전에 필요로 하는 것

시크릿 값은 이 문서에 적지 않는다. 이름만 적는다.

| 함수 | 테이블 | 버킷 | 시크릿 이름 |
|------|--------|------|-------------|
| ai-customize | projects, templates | 없음 | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY |
| verify-payment | projects, orders, downloads, users | project-outputs | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PORTONE_IMP_KEY 또는 IMP_KEY, PORTONE_IMP_SECRET 또는 IMP_SECRET |
| get-download-url | orders, downloads | project-outputs | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| send-email | 없음 | 없음 | RESEND_API_KEY, ADMIN_EMAIL, RESEND_FROM |
| submit-chatbot-inquiry | chatbot_inquiries | 없음 | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| submit-refund-request | orders, refund_requests | 없음 | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL |
| process-refund | users, refund_requests, orders | 없음 | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PORTONE_IMP_KEY, PORTONE_IMP_SECRET |
| delete-account | users, projects, inquiries, policy_agreements | 없음 | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| submit-contact | inquiries | 없음 | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY |

`submit-contact`는 020의 nullable `user_id`와 guest 컬럼이 있어야 한다. 챗봇은 013 이후 클라이언트 INSERT가 막히므로 함수 배포가 필요하다. 둘 다 아직 배포하지 않는다.

## Legacy가 깨지면 안 되는 의존

| 기능 | 의존 |
|------|------|
| 템플릿 목록, 상세 | templates_public, preview_html |
| 업로드 | projects, project-uploads |
| customize | projects, templates.html_template RPC, ai-customize |
| preview | projects.output_html, status |
| checkout, payment | orders, projects.status, verify-payment, PortOne 시크릿 |
| download | downloads, project-outputs, get-download-url |
| refund | refund_requests, orders 환불 상태, refund-attachments |
| legacy mypage | projects, orders, downloads, users |
| legacy admin | templates RPC, orders, users, inquiries, chatbot_inquiries, refund_requests |

이 기능은 Studio 테이블이 없어도 동작해야 한다. Studio 외래 키를 `projects`나 `orders`에 붙이면 안 된다.

## 021–028 초안

저장소에 다음 파일이 있다. 이 파일들이 있어도 원격 적용은 아직 금지다.

- `021_users_account_foundation.sql`
- `022_studio_sales_domain.sql`
- `023_studio_delivery_domain.sql`
- `024_studio_rls.sql`
- `025_storage_bootstrap.sql`
- `026_studio_service_functions.sql`
- `027_legacy_data_api_grants.sql`
- `028_legacy_admin_rls.sql`

`027`은 2026-05-30 이후 신규 Supabase 프로젝트에서 public 테이블이 Data API에 자동 노출되지 않는 기본값을 보완한다. 권한은 기존 RLS와 현재 클라이언트 호출에 맞춘다.

- `anon`: `faqs` SELECT, `templates_public` SELECT
- `authenticated`: `users` SELECT/UPDATE/DELETE, `projects` SELECT/INSERT/UPDATE, `orders` SELECT/UPDATE, `downloads` SELECT/INSERT, `faqs` SELECT/INSERT/UPDATE/DELETE, `inquiries` SELECT/INSERT/UPDATE/DELETE, `chatbot_inquiries` SELECT, `policy_agreements` SELECT/INSERT, `refund_requests` SELECT/INSERT, `templates_public` SELECT
- `service_role`: 위 Legacy 테이블 ALL, `templates_public` SELECT
- `templates` 직접 권한은 `anon`과 `authenticated`에 주지 않는다

FAQ 쓰기, `users` DELETE, `orders` UPDATE, `inquiries` DELETE는 현재 화면에 호출이 없다. 002·004·006의 관리자 RLS가 그 권한을 전제로 하므로 초안에서는 유지한다. `024`는 정책이 없는 Studio 권한을 뺐다. `contract_agreements`는 SELECT, `studio_payments`는 SELECT/UPDATE, `engagement_activities`는 SELECT/INSERT만 `authenticated`에 준다. `engagements`는 SELECT/UPDATE만 준다.

`028`은 `public.is_admin()`을 재사용해 관리자 SELECT를 추가한다. 대상은 `users`, 삭제되지 않은 `projects`, `orders`다. `inquiries`, `chatbot_inquiries`, `refund_requests`의 관리자 SELECT는 006·007·017에 이미 있다. 새 GRANT는 없다.

적용 전 Dashboard의 Data API 설정과 Security Advisor 결과를 다시 확인한다.

2026-09-29에 이 PC의 Docker Desktop `4.93.0`과 Supabase CLI `2.118.0`로 임시 Postgres `17.6`에만 시험했다. 공식 프로젝트는 사용하지 않았다.

`storage.objects`의 소유자는 `supabase_storage_admin`이고, Storage 초기화 시점에 RLS는 이미 켜져 있다. migration 역할 `postgres`는 소유자가 아니라 `ALTER TABLE storage.objects`만 실패하고, POLICY 생성과 삭제는 된다. 그래서 `003`에서 그 `ALTER`를 뺐다. `014`는 `preview_html`을 뷰의 마지막 컬럼으로 둔다. 이후 `db reset`은 `001`–`028`을 한 번에 적용한다. 규칙 검사 20개와 `anon` Data API 확인도 통과했다.

## Data API 계약

코드 호출, GRANT, RLS가 같은 작업을 가리킨다. `templates` 직접 SELECT는 `anon`과 `authenticated`에 없다. `html_template`은 프로젝트 소유자 RPC 또는 관리자 RPC로만 읽는다.

| 화면 또는 함수 | 대상 | 역할 | 작업 | RLS 또는 함수 조건 | 직접 접근 |
| --- | --- | --- | --- | --- | --- |
| TemplateGalleryPage, TemplateDetailPage | `templates_public` | anon, authenticated | SELECT | view가 `is_active`만 노출 | `templates` 금지 |
| UploadPage | `templates_public` | authenticated | SELECT | 같은 view. 컬럼은 id, name, category, thumbnail_url | `templates` 금지 |
| MyPage, PreviewPage | `projects` 후 `templates_public` | authenticated | SELECT | `projects_select_own`. 템플릿 이름과 썸네일만 view | embed `templates` 금지 |
| CustomizePage | `get_project_template_html` | authenticated | EXECUTE | 본인 프로젝트의 `html_template`만 | 임의 template id 금지 |
| AdminPage 템플릿 | `admin_list_templates`, `admin_upsert_template_v2`, `admin_set_template_active` | admin | EXECUTE | 함수 안에서 `is_admin` | `templates` 직접 금지 |
| ai-customize | `templates` | service_role | SELECT | Edge Function. 브라우저 권한 아님 | 고객 직접 금지 |
| AdminPage 사용자 | `users` | admin | SELECT | `users_select_own`, `028` `users_select_admin` | |
| AdminPage 프로젝트 수 | `projects` | admin | SELECT `user_id` | `028` `projects_select_admin`, `deleted_at` 없음 | |
| AdminPage 주문 | `orders`, embed `users.email` | admin | SELECT | `028` `orders_select_admin`, `users_select_admin` | |
| AdminPage 문의 | `inquiries` | admin | SELECT, UPDATE | `inquiries_select_admin`, `inquiries_update_admin` | |
| AdminPage 챗봇 | `chatbot_inquiries` | admin | SELECT | `chatbot_inquiries_select_admin` | INSERT 금지 |
| AdminPage 환불 | `refund_requests`, embed `orders`, `users` | admin | SELECT | `refund_requests_select_admin`와 `028`의 orders/users SELECT | UPDATE는 service_role |
| 고객 본인 | `users`, `projects`, `orders`, `downloads` | authenticated | 본인 SELECT/UPDATE 또는 INSERT | `*_own` 정책. `orders` INSERT 없음 | |
| Engagement 생성 | `create_engagement_from_contract` | service_role | EXECUTE | APPROVED, AGREED, DEPOSIT PAID | authenticated INSERT 금지 |

`supabase db push`와 공식 프로젝트 SQL Editor 실행은 하지 않는다. 2026-09-29 로컬 시험은 위 기록대로 임시 Docker에서만 했다.

## 2026-09-29 공식 Preflight

대상은 SEOAH.STUDIO, `qzvxypynlluqpdpmsstu`, ap-northeast-2, ACTIVE_HEALTHY, Postgres 17.6이다. 공식 DB는 변경하지 않았다.

| 항목 | 결과 |
| --- | --- |
| public 테이블, 뷰, 함수, RLS 정책 | 0 |
| `supabase_migrations` | 스키마 없음. history 0 |
| `auth.users` | 0 |
| `storage.objects` 소유자 | `supabase_storage_admin` |
| `storage.objects` RLS | 이미 활성. 정책 0 |
| bucket | 없음 |
| Auth | 이메일 사용 가능. OAuth provider는 모두 꺼짐. 가입 확인 메일은 켜짐 |
| Site URL | `http://localhost:3000`. redirect URL은 비어 있음 |
| Data API 노출 스키마 | config 비교에서 `api.schemas` 차이가 없음. CLI 기본값인 `public`, `graphql_public`과 같음 |
| migration 파일 | `001`–`028` 누락 없음 |

이 프로젝트의 public 기본 권한은 새 테이블과 함수에 `anon`, `authenticated`, `service_role`을 포함한다. `024`와 `027`이 그 권한을 걷고 필요한 권한만 다시 준다. `027`은 이 기본값과 충돌하지 않고, 적용 순서 안에서 필요하다. `003`의 `ALTER TABLE storage.objects` 제거는 공식 프로젝트에도 맞다. RLS가 이미 켜져 있기 때문이다.

SECURITY DEFINER 함수의 최종 `search_path`는 `public` 또는 빈 문자열이다. `001`의 `handle_new_user`는 `020`에서 교체된다. `create_engagement_from_contract`는 `service_role`만 EXECUTE한다. 관리자 RPC는 `authenticated`에 열려 있고 함수 안에서 `is_admin`을 확인한다. 공식 적용을 막는 결함은 없다.

적용 순서는 `001` → `028`이다. 하나라도 실패하면 즉시 멈춘다. 파일을 건너뛰거나, 수동 SQL로 중간 상태를 고치거나, 실패한 이력을 남긴 채 뒤를 성공 처리하지 않는다.

이 DB에는 고객 데이터가 없다. 실패하면 부분 스키마와 migration history를 함께 비운 뒤에만 `001`부터 다시 시작한다. history만 남으면 다음 적용이 이미 기록된 버전을 건너뛴다. 그 정리는 별도 지시가 있기 전에 실행하지 않는다. 로컬 `db reset`을 공식 프로젝트에 대응시켜 실행하지 않는다.

적용이 성공해도 Vercel production env는 바로 바꾸지 않는다. 순서는 DB 적용, DB 검증, Storage/Edge/Auth, staging 또는 로컬 클라이언트 확인, Legacy Commerce regression, Studio persistence, 그 다음 production env 결정이다.

적용 뒤 확인할 것:

- 테이블, 뷰, 함수, FK, CHECK, trigger, RLS, policy, grant, bucket
- 규칙 20개. Engagement INSERT 거부, 잘못된 proposal/contract version 거부, milestone 교차 거부, contract당 Deposit 1개, contract당 Engagement 1개
- `create_engagement_from_contract`의 실패 4가지, 성공, `WAITING_CONTENT`, 중복 거부, `deposit.engagement_id` 연결
- anon Data API: `templates` 거부, `templates_public`과 `faqs` 허용
- authenticated 본인 행, admin 전체 SELECT

## 실행 금지

공식 프로젝트 `qzvxypynlluqpdpmsstu`에는 다음 지시가 있기 전에 하지 않는다.

- supabase link
- supabase db push
- migration apply
- CREATE TABLE, ALTER TABLE
- RLS 적용
- Edge Function deploy
- Storage bucket 생성
- Vercel production env 변경
- 기존 사이트 Supabase env 변경

## 나중에 적용할 때의 순서

1. 대상이 `qzvxypynlluqpdpmsstu`인지 확인한다. P1에서 확인했다.
2. public schema가 비어 있는지 확인한다. P1에서 테이블 0, history 0이었다.
3. 현재 운영 env를 바꾸지 않은 상태에서 `001`–`028`을 순서대로 적용한다. bucket은 `019`와 `025`에 있다. 별도 Commerce bucket migration을 추가하지 않는다.
4. 위 Preflight의 적용 후 검사를 실행한다.
5. Edge Function을 배포한다.
6. Legacy 구매 경로와 Studio 빈 화면을 확인한다.
7. 그때만 production env 전환을 별도로 결정한다.

3번부터는 승인 없이 실행하지 않는다.
