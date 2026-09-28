# SEOAH.STUDIO 프로젝트 상태 — 2026-09-28

기준 코드: Step 10.2 검수. Step 9는 설계만 기록했고, DB 적용은 하지 않았다. 최종 갱신일: 2026-09-29.

과거 이력은 `PROJECT_STATUS_2026-03-17.md`에 남아 있다. 그 파일은 지우지 않는다.

## 완료

- Step 5–8 UI Skeleton. 저장은 없다.
- 공식 Supabase 대상 기록: SEOAH.STUDIO, `qzvxypynlluqpdpmsstu`, ap-northeast-2.
- Step 9 도메인 결정과 흐름 감사. Canonical 문서 5개.
- Step 9.1 문서 수정. `studio_payments`, `proposal_internal_notes`, `contract_agreements`, `engagement_admin_state`.
- Step 10 SQL 초안 `021`–`026`과 적용 전 보안 보완 `027`. 저장소에만 있고 원격에는 적용하지 않음.
- Step 10.2 정적 검수. `024`에서 정책이 없는 Studio 테이블 권한을 줄임. 격리 DB 실행은 하지 않음.

## 공식 데이터베이스

| 항목 | 상태 |
|------|------|
| public schema | EMPTY |
| link | 없음 |
| migration | 파일 `001`–`027`은 저장소에 있음. 원격 적용 없음 |
| Edge Function | 없음 |
| Storage | 없음 |
| production env | 변경 없음 |

`001`–`020`은 나중에 Legacy baseline으로 재사용할 수 있다. `021`–`026`은 Studio 초안이고, `027`은 2026-05-30 이후 신규 Supabase 프로젝트에 필요한 Legacy Data API 명시 권한이다. 020은 KEEP다. 아무것도 적용하지 않는다.

## 다음

별도 Integration 지시 전에 migration, link, RLS, Storage, Edge deploy, env 변경을 하지 않는다.

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
