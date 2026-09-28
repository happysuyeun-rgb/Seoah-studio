# SEOAH.STUDIO 문서 인덱스

> **2026-09-28 리뉴얼 문서화 기준:** [DOCUMENTATION_PLAN_2026-09-28.md](DOCUMENTATION_PLAN_2026-09-28.md)  
> 현재는 기존 문서를 바로 삭제하지 않고, 위 계획에 따라 Canonical 문서로 순차 통합합니다.
> **Cursor 작업 인계 / 잔여 작업:** [CURSOR_HANDOFF_REMAINING_WORK_2026-09-28.md](CURSOR_HANDOFF_REMAINING_WORK_2026-09-28.md)  
> 현재 코드 기준 누락·보류·다음 구현 순서를 정리한 실행 문서입니다.

개발 진행 시 **어떤 문서를 언제 보면 좋은지** 정리한 목차입니다.

---

## 1. 처음 셋업·진행 상황 파악

| 문서 | 용도 |
|------|------|
| [../README.md](../README.md) | 스택, 로컬 실행, 환경 변수, Supabase 기본 설정, 라우트 요약. **처음 클론 후 필독.** |
| [.env.local.example](../.env.local.example) | 환경 변수 키 목록. 복사 후 `.env.local`에 값 입력. |
| [PRODUCTION_ENV.md](PRODUCTION_ENV.md) | 배포(Vercel)·Edge Function 시크릿 등 **프로덕션 환경 변수** 정리. |
| [PHASE_COMPLETION_STATUS.md](PHASE_COMPLETION_STATUS.md) | **Phase 1~6별 완료/미완료/필요 작업** 상세. 다음에 할 일 정할 때 기준 문서. |

---

## 2. 설계·화면 스펙 보완

| 문서 | 용도 |
|------|------|
| [DESIGN_SUPPLEMENT_RECHECK.md](DESIGN_SUPPLEMENT_RECHECK.md) | **현재 구현 기준** 설계 보완 재점검. "이미 반영된 항목" vs "실제로 보완 필요한 항목" 구분. |
| [SCREEN_SPEC_GAP_AND_SUPPLEMENTS.md](SCREEN_SPEC_GAP_AND_SUPPLEMENTS.md) | full_spec_v2 화면 설계(SC-01~SC-14) 대조·누락·보완 제안 원본. |
| [ADDITIONS_AND_DOC_REVISIONS.md](ADDITIONS_AND_DOC_REVISIONS.md) | 추가 구현 권장 사항 + Phase 문서 수정안. |

---

## 3. AI 작업·직접 작업 구분

| 문서 | 용도 |
|------|------|
| [DEV_WORK_SUMMARY_AND_NEXT_STEPS.md](DEV_WORK_SUMMARY_AND_NEXT_STEPS.md) | **AI가 한 작업** 요약 + **직접 해야 할 작업**(한 번만 할 것 / 기능·보완) 구분. |

---

## 4. API·에러코드·CHANGELOG

| 문서 | 용도 |
|------|------|
| [EDGE_FUNCTIONS_API.md](EDGE_FUNCTIONS_API.md) | **Edge Function API 요약** — ai-customize, verify-payment, send-email, get-download-url Request/Response/에러 코드. |
| [ERROR_CODES_MAPPING.md](ERROR_CODES_MAPPING.md) | **에러 코드 매핑** — E-001~E-052 + Edge Function 코드별 사용자 메시지·처리 방법·심각도. |
| [../CHANGELOG.md](../CHANGELOG.md) | **CHANGELOG** — 버전별 변경 이력 (v0.1.0 ~ v0.9.0). |
| [API_ERRORS_CHANGELOG_WORK_PLAN.md](API_ERRORS_CHANGELOG_WORK_PLAN.md) | API/에러코드/CHANGELOG 반영 **작업 계획** (Phase B·C·D 남음). |

## 5. QA·배포

| 문서 | 용도 |
|------|------|
| [QA_CHECKLIST.md](QA_CHECKLIST.md) | 배포 전·릴리즈 전 **수동 테스트** 체크리스트. |

---

## 6. 기타 참고 (필요 시)

| 문서 | 용도 |
|------|------|
| [REMAINING_GAPS.md](REMAINING_GAPS.md) | 과거 갭 정리. DESIGN_SUPPLEMENT_RECHECK와 중복될 수 있음. |
| [CURSOR_GUIDE_GAP_CHECK.md](CURSOR_GUIDE_GAP_CHECK.md) | Cursor/AI 가이드 대조용. |
| [SPEC_V3_GAP_AND_SUPPLEMENTS.md](SPEC_V3_GAP_AND_SUPPLEMENTS.md) | 스펙 v3 기준 갭·보완. |
| [NEXT_IMPLEMENTATION_PLAN_V2.md](NEXT_IMPLEMENTATION_PLAN_V2.md), [FULL_SPEC_V2_IMPLEMENTATION_PLAN.md](FULL_SPEC_V2_IMPLEMENTATION_PLAN.md) | 과거 구현 계획. Phase 문서로 대체된 부분 있음. |

---

## 추천 읽기 순서 (신규 합류·오랜만에 재진입 시)

1. **../README.md** → 로컬 실행·env·Supabase 기본  
2. **PHASE_COMPLETION_STATUS.md** → 지금 Phase·남은 작업  
3. **DESIGN_SUPPLEMENT_RECHECK.md** → 화면 스펙 쪽에서 뭘 더 할지  
4. **DEV_WORK_SUMMARY_AND_NEXT_STEPS.md** → 직접 할 설정·기능 정리  

배포 전에는 **PRODUCTION_ENV.md** + **QA_CHECKLIST.md** 확인.
