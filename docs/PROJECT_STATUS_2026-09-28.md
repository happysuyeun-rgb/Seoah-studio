# SEOAH.STUDIO 프로젝트 상태 — 2026-09-28

기준 코드: `a3642e2`. 공식 DB는 적용하지 않았다. 최종 갱신일: 2026-09-29.

과거 이력은 `PROJECT_STATUS_2026-03-17.md`에 남아 있다. 그 파일은 지우지 않는다.

## 완료

- Step 5–8 UI Skeleton. 저장은 없다.
- 공식 Supabase 대상 기록: SEOAH.STUDIO, `qzvxypynlluqpdpmsstu`, ap-northeast-2.
- Step 9 도메인 결정과 흐름 감사. Canonical 문서 5개.
- Step 9.1 문서 수정. `studio_payments`, `proposal_internal_notes`, `contract_agreements`, `engagement_admin_state`.
- Step 10 SQL 초안 `021`–`026`과 적용 전 보안 보완 `027`. 저장소에만 있고 원격에는 적용하지 않음.
- Step 10.2 정적 검수. `024`에서 정책이 없는 Studio 테이블 권한을 줄임. 격리 DB 실행은 하지 않음.
- Step 10.3. Engagement 관리자 INSERT 제거. Legacy 관리자 SELECT 정책 초안 `028`. 고객 템플릿 조회는 `templates_public`과 `get_project_template_html`. 원격 적용 없음.
- Step 10.4. 이 PC에 WSL2 `2.7.14`와 Docker Desktop `4.93.0`을 설치했다. 로컬 Supabase CLI `2.118.0`로 Postgres `17.6` 임시 스택을 띄워 `001`–`028`을 시험했다. 공식 프로젝트에는 연결하지 않음.

## 보완 필요

- `014_templates_preview_html.sql`의 `templates_public`은 `preview_html`을 기존 컬럼 사이에 넣는다. 빈 데이터베이스에서는 `is_active` 컬럼 이름 변경으로 실패한다. 저장소 파일은 아직 수정하지 않았다.
- 로컬 CLI의 `postgres` 역할은 `storage.objects` 소유자가 아니라서 `003`의 `ALTER TABLE storage.objects`가 거부된다. 로컬 슈퍼유저로 적용하면 통과한다. 공식 적용 전에 실행 역할을 다시 확인한다.

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

2026-09-29 로컬 시험에서는 슈퍼유저로 `001`–`013`이 적용됐다. `014`는 뷰 정의에서 실패했다. 로컬 복사본에서만 컬럼 순서를 바꿔 `015`–`028`을 이어서 적용했다. 그 상태에서 규칙 검사 20개와 `anon` Data API(`templates` 거부, `templates_public`과 `faqs` 허용)는 통과했다.

## 다음

공식 프로젝트에는 별도 Integration 지시 전에 link, migration, Storage, Edge deploy, env 변경을 하지 않는다. 그 전에 `014` 뷰 컬럼 순서를 고친다.

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
