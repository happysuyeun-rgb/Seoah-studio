# SEOAH.STUDIO 프로젝트 상태 — 2026-09-28

기준 코드: P0 migration bootstrap. 공식 DB는 적용하지 않았다. 최종 갱신일: 2026-09-29.

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

## 보완 필요

공식 적용 전에 남은 코드 결함은 없다. 공식 프로젝트 적용 자체는 아직 하지 않는다.

## 공식 데이터베이스

| 항목 | 상태 |
|------|------|
| public schema | EMPTY |
| link | 없음 |
| migration | 파일 `001`–`028`은 저장소에 있음. 원격 적용 없음 |
| Edge Function | 없음 |
| Storage | 없음 |
| production env | 변경 없음 |

`001`–`020`은 나중에 Legacy baseline으로 재사용할 수 있다. `021`–`026`은 Studio 초안이고, `027`은 Legacy Data API 명시 권한, `028`은 관리자 전체 조회 SELECT 정책이다. 020은 KEEP다. 공식 프로젝트에는 아무것도 적용하지 않는다.

2026-09-29 로컬 clean reset은 `postgres` 역할만으로 `001`–`028`을 한 번에 적용했다. 수동 SQL과 superuser 후처리는 쓰지 않았다. 규칙 검사 20개와 `anon` Data API(`templates` 거부, `templates_public`과 `faqs` 허용)는 통과했다. `authenticated`는 본인 `users` 행만 읽었다.

## 다음

공식 프로젝트에는 별도 Integration 지시 전에 link, migration, Storage, Edge deploy, env 변경을 하지 않는다.

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
