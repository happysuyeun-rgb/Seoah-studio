# SEOAH.STUDIO 프로젝트 상태 — 2026-09-28

기준 코드: P3A.3 배포 전 설정. 최종 갱신일: 2026-09-29.

과거 이력은 `PROJECT_STATUS_2026-03-17.md`에 남아 있다. 그 파일은 지우지 않는다.

## 완료

- Step 5–8 UI Skeleton. 저장은 없다.
- 공식 Supabase 대상 기록: SEOAH.STUDIO, `qzvxypynlluqpdpmsstu`, ap-northeast-2.
- Step 9 도메인 결정과 흐름 감사. Canonical 문서 5개.
- Step 9.1 문서 수정. `studio_payments`, `proposal_internal_notes`, `contract_agreements`, `engagement_admin_state`.
- Step 10 SQL 초안 `021`–`026`과 적용 전 보안 보완 `027`. 저장소에만 있고 원격에는 적용하지 않음.
- Step 10.2 정적 검수. `024`에서 정책이 없는 Studio 테이블 권한을 줄임. 격리 DB 실행은 하지 않음.
- Step 10.3. Engagement 관리자 INSERT 제거. Legacy 관리자 SELECT 정책 초안 `028`. 고객 템플릿 조회는 `templates_public`과 `get_project_template_html`. 원격 적용 없음.
- Step 10.4. 이 PC에 WSL2 `2.7.14`와 Docker Desktop `4.93.0`을 설치했다. 로컬 Supabase CLI `2.118.0`로 Postgres `17.6` 임시 스택을 띄웠다. 공식 프로젝트에는 연결하지 않음.
- P0. `014`는 `preview_html`을 `templates_public` 마지막 컬럼으로 옮겼다. `003`은 Storage 초기화 때 이미 켜진 RLS를 다시 `ALTER`하지 않는다. 로컬 `db reset`으로 `001`–`028`이 한 번에 적용된다.
- P1 Preflight. 공식 프로젝트 `qzvxypynlluqpdpmsstu`는 ACTIVE_HEALTHY, Postgres 17.6, public 테이블 0, migration history 0이다. SQL은 적용하지 않았다.
- P2. 2026-09-29에 공식 프로젝트 `qzvxypynlluqpdpmsstu`에 `001`–`028`을 CLI migration으로 적용했다. 수동 SQL과 superuser 후처리는 없다.
- P2.1. `029_security_hardening.sql`로 `templates_public` 쓰기를 막고 SECURITY DEFINER 함수의 PUBLIC/anon EXECUTE를 제거했다. 공식 history는 `001`–`029`이다.
- P3A. Edge Function 9개의 인증과 스키마 의존성을 감사했다. `send-email`은 서비스 역할, 본인 문의 알림, 관리자 답변만 보낸다. 배포, secret, Auth URL은 바꾸지 않았다.
- P3A.1. `send-email`은 service role 일치 또는 `getUser`로 확인된 사용자만 받는다. anon 키 유무와 관계없이 비로그인 토큰은 사용자가 아니다. 계정 삭제는 `public.users` FK 15개를 보존 정책으로 처리하고, 챗봇 본문은 4000자 이하다. Edge Function은 배포하지 않았다.
- P3A.2. 결제는 서버 가격 49000원과 PortOne 응답이 맞을 때만 `paid`가 된다. 환불 승인은 PortOne 취소 성공 후에만 DB를 바꾼다. 업로드는 `filePaths`만 저장하고 Edge가 private bucket에서 읽는다. `030`은 로컬 검증만 했고 공식 DB에는 적용하지 않았다.
- P3A.3. 결제 `merchant_uid` 일치, `RESEND_FROM` 발신, Edge `verify_jwt`를 `supabase/config.toml`에 고정했다. `030`은 로컬에서만 다시 확인했다. 공식 history는 `001`–`029`이고 Edge Function은 0이다. 공식 `030` 적용과 Edge 배포는 아직이다.

## 보완 필요

공식 history는 `001`–`029`다. `030` 공식 적용은 남아 있다. Edge Function 배포, Vercel production env, Auth URL은 바꾸지 않았다.

## 공식 데이터베이스

| 항목 | 상태 |
|------|------|
| public schema | `001`–`029` 적용. 테이블 30, 뷰 `templates_public`, 함수 11 |
| link | CLI가 `qzvxypynlluqpdpmsstu`에 연결됨 |
| migration | history `001`–`029` |
| Edge Function | 배포하지 않음 |
| Storage | bucket 5개. `thumbnails`만 public |
| production env | 변경 없음 |

`001`–`029`은 2026-09-29 공식 DB에 적용되어 있다. 020은 KEEP다. 고객, 관리자 계정, 템플릿 행은 넣지 않았다. `005`의 FAQ 시드만 있다.

2026-09-29 로컬 clean reset은 `postgres` 역할만으로 `001`–`028`을 한 번에 적용했다. 수동 SQL과 superuser 후처리는 쓰지 않았다. 규칙 검사 20개와 `anon` Data API(`templates` 거부, `templates_public`과 `faqs` 허용)는 통과했다. `authenticated`는 본인 `users` 행만 읽었다.

2026-09-29 P1은 적용 전에 공식 프로젝트를 읽기만 했다. 그때 public 테이블과 migration history는 0이었다.

2026-09-29 P2에서 `db push`가 `001`–`028`을 적용했다. public 테이블 30개는 모두 RLS가 켜져 있고 정책은 102개다. FK 45, CHECK 29, trigger 15다. bucket은 `project-uploads`, `project-outputs`, `thumbnails`, `refund-attachments`, `engagement-files`이고 `thumbnails`만 public이다. `anon`은 `templates`를 거부하고 `templates_public`과 `faqs`는 읽는다. `authenticated`는 본인 `users` 행만 보고 타인 행은 보지 못한다. Engagement 직접 INSERT는 `42501`이다. `create_engagement_from_contract`는 `service_role`만 EXECUTE한다. 검증용 행은 트랜잭션에서 롤백했고, `auth.users`는 0이다.

2026-09-29 P2.1은 `templates_public`을 security definer 투영으로 유지했다. `security_invoker`로 바꾸면 `anon`에게 `templates`의 안전 컬럼 SELECT가 열려 직접 조회 계약이 깨진다. 로컬 Data API에서 `html_template`은 두 방식 모두 막혔고, A는 뷰 SELECT만 남겼다. 그래서 A를 선택했다. Advisor의 `security_definer_view` ERROR는 이 선택의 결과로 남으며, 뷰 쓰기는 제거된 상태다. `admin_*`, `get_project_template_html`, `is_admin`의 `authenticated` EXECUTE는 Admin UI와 RLS에 필요해서 유지한다. `handle_new_user`와 `users_protect_is_admin`은 PUBLIC/anon/authenticated EXECUTE를 없앴고, 가입 trigger와 `is_admin` 보호 trigger는 동작한다.

Performance Advisor backlog, 이번 단계에서 수정하지 않음: unindexed foreign keys 12, `auth_rls_initplan` 27, multiple permissive policies 30, unused indexes 47.

## 다음

공식 `030` 적용과 Edge Function 배포는 다음 단계다. Vercel env와 Auth Site URL은 바꾸지 않는다. Site URL은 `http://localhost:3000` 그대로다.

이 PC에서 사용자가 직접 한 일:

- WSL2 설치 UAC 승인
- Docker Desktop 라이선스 동의. Kubernetes는 끄고 Docker Hub 로그인은 하지 않음.

UI로 남은 것:

- Proposal Draft → Preview → Send
- Proposal Approved → Contract 준비 연결
- Project Request sessionStorage stale cleanup
- Modal full focus trap
- Project Request 필수 입력 기준

## 기준 문서

- `ARCHITECTURE_AND_BOUNDARIES.md`
- `PRODUCT_IA_AND_FLOWS.md`
- `DOMAIN_AND_DATA_MODEL_DECISIONS.md`
- `BUSINESS_RULES_AND_SERVICE_POLICY.md`
- `DEPLOYMENT_MIGRATION_RUNBOOK.md`
