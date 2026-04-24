# Cursor 가이드(cursor_guide.html) 대비 구현 점검

> `cursor_guide.html`의 프롬프트(20개)와 부록 기준으로 **구현됨 / 부분 / 미구현**을 정리했습니다.  
> 기준일: 2025-03-17

---

## 요약

| 구분 | 개수 | 비고 |
|------|------|------|
| **가이드 항목** | 20개 프롬프트 + 부록 | W1~W6 주차별 |
| **완전 구현** | 대부분 | 라우팅, 인증, 갤러리, 업로드, AI 스켈레톤, 미리보기, 결제, 마이페이지, 관리자 기본, 에러/토스트, QA·반응형·이메일·SEO |
| **부분 구현** | 5개 | 아래 “부분 구현” 참고 |
| **미구현** | 6개 | 아래 “미구현” 참고 |

---

## 주차별 상세

### 1주차 (W1) — 프로젝트 셋업 + DB + 인증 + 홈

| ID | 가이드 요구사항 | 상태 | 비고 |
|----|-----------------|------|------|
| W1-P1 | React+TS+Vite+Tailwind+Supabase+Router+Zustand+React Query, 폴더 구조, 라우팅 | ✅ 구현 | shadcn/ui는 미도입(가이드에서 optional) |
| W1-P2 | 5개 테이블 + RLS + auth→users 트리거 | ✅ 구현 | `001_initial_schema.sql`, users에 is_admin 포함 |
| W1-P3 | 카카오/구글 OAuth, LoginPage, AuthCallback, authStore, ProtectedRoute, GNB | ✅ 구현 | |
| W1-P4 | 홈: 히어로, How it works 4단계, 카테고리 3종, **예시 결과물 섹션** | ⚠️ 부분 | “이런 결과물을 만들 수 있어요” 타이틀 없음. 하단에 placeholder 카드 3개만 있음 |

**미구현/보완**
- 홈 하단 섹션 타이틀을 **“이런 결과물을 만들 수 있어요”**로 하고, 가이드와 동일한 “예시 결과물” 의미로 정리하면 가이드와 일치.

---

### 2주차 (W2) — 템플릿 갤러리 + 상세 + 시드

| ID | 가이드 요구사항 | 상태 | 비고 |
|----|-----------------|------|------|
| W2-P1 | 갤러리: category, React Query, 태그 필터, 카드 그리드, projectStore, 미리보기/선택 | ✅ 구현 | |
| W2-P2 | 상세: iframe, DEMO_DATA 치환, 뷰 토글 1280/768/375 | ✅ 구현 | |
| W2-P3 | 샘플 템플릿 3종 + seed_templates.sql | ✅ 구현 | |

**미구현** 없음.

---

### 3주차 (W3) — 업로드 + AI 파이프라인

| ID | 가이드 요구사항 | 상태 | 비고 |
|----|-----------------|------|------|
| W3-P1 | StepIndicator 5단계, 파일 업로드(.txt~.pdf 20MB·3개), 텍스트 입력, **입력 가이드 아코디언**, Storage project-uploads, projects INSERT 후 /project/customize | ✅ 구현 | |
| W3-P2 | Edge Function: **Claude API**, 파일 파싱(.txt/.md, mammoth, Vision), 30초 타임아웃, output_html/custom_params/status=ready | ❌ 미구현 | 현재 **폴백 데이터**로만 치환. Claude·파일 파싱·타임아웃 미연동 |
| W3-P3 | CustomizePage: Edge Function 호출, **Realtime 구독**, **단계별 로딩 ①~⑤**, **완료 후 추출 결과 카드 3종**, **인라인 편집 + “다시 적용”**, 30초 초과 재시도 | ⚠️ 부분 | 호출·폴링·30초 초과 재시도·미리보기/처음부터 다시 ✅. Realtime, 5단계 애니메이션, 결과 3탭(기본정보/색상/기능), 인라인 편집·“다시 적용” ❌ |

**미구현**
- **W3-P2**: Claude API 호출, Storage에서 파일 읽기, mammoth/Vision 파싱, 30초 타임아웃 후 fallback.
- **W3-P3**: Realtime으로 `projects` 구독, ①~⑤ 단계별 로딩 UI, 완료 후 “브랜드 정보 / 컬러 팔레트 / 주요 내용 요약” 카드 3종, 인라인 편집 및 “다시 적용”(클라이언트 치환).

---

### 4주차 (W4) — 미리보기 + 결제 + 다운로드

| ID | 가이드 요구사항 | 상태 | 비고 |
|----|-----------------|------|------|
| W4-P1 | output_html iframe, 뷰 토글, **수정 모드**(postMessage contentEditable), 저장, 우측 사이드바(요약, AI 재생성, 결제 CTA) | ✅ 구현 | enableEdit postMessage + contentEditable 스크립트 포함 |
| W4-P2 | PLANS UI, 포트원 SDK, **verify-payment에서 PortOne REST API로 imp_uid 검증** | ⚠️ 부분 | 결제창·verify-payment 호출·orders INSERT ✅. **PortOne REST API 검증·금액 일치** TODO |
| W4-P3 | 결제 완료 페이지, **JSZip 다운로드**, downloads INSERT | ✅ 구현 | **project-outputs Storage + signed URL(7일) + 이메일 링크**는 미구현(가이드 W6-P3와 연결) |

**미구현**
- **W4-P2**: verify-payment 내 PortOne REST API 호출 및 금액·상태 검증 후에만 orders INSERT.
- **W4-P3**: 다운로드 영구 보관용 project-outputs 버킷 + signed URL(7일) + downloads.file_url + 이메일 링크( W6-P3와 동일).

---

### 5주차 (W5) — 마이페이지 + 관리자 + 에러 처리

| ID | 가이드 요구사항 | 상태 | 비고 |
|----|-----------------|------|------|
| W5-P1 | 마이페이지: #projects, #downloads, 프로젝트 카드(**계속 편집**, **삭제**), 다운로드 테이블(**재다운로드**) | ✅ 구현 | 삭제(deleted_at), 다시 다운로드 버튼 있음 |
| W5-P2 | AdminRoute, is_admin, **탭 3종: 템플릿 CRUD / 주문 현황(기간 필터) / 사용자 목록** | ⚠️ 부분 | 템플릿·주문 목록 + **주문 기간 필터(오늘/이번 주/전체)** ✅. **템플릿 CRUD(추가·수정·비활성화)**, **사용자 탭** ❌ |
| W5-P3 | PaymentFailPage, ErrorBoundary, Toast, catch 블록 toast | ✅ 구현 | |

**미구현**
- **W5-P2**:  
  - 템플릿 관리: “새 템플릿 추가” 폼(이름, 카테고리, 태그, HTML textarea, 썸네일 thumbnails 업로드), 행별 수정·비활성화(is_active=false).  
  - 사용자 탭: 이름/이메일/가입일/프로젝트 수/결제 횟수.

---

### 6주차 (W6) — QA + 모바일 + 이메일 + 배포

| ID | 가이드 요구사항 | 상태 | 비고 |
|----|-----------------|------|------|
| W6-P1 | 로딩 스피너, **sessionStorage currentProjectId 복구**, Edge Function 전 session 확인, empty state | ✅ 구현 | getStoredProjectId, QA_CHECKLIST.md |
| W6-P2 | 375/768/1280, 버튼 44px, 페이지별 모바일 레이아웃 | ✅ 구현 | |
| W6-P3 | send-email Edge Function(Resend), verify-payment 성공 시 invoke, **signed URL(7일) downloadUrl** | ⚠️ 부분 | send-email 스켈레톤 + invoke ✅. **project-outputs signed URL 생성 후 downloadUrl** 전달 ❌ |
| W6-P4 | 메타·OG, GA4, vercel.json, PRODUCTION_ENV.md, .gitignore | ✅ 구현 | **og-image.png** 제작·배치만 미완료 |

**미구현**
- **W6-P3**: 결제 완료 시 project-outputs 버킷에 파일 업로드 후 **signed URL(604800초)** 생성해 send-email의 `downloadUrl`로 전달.
- **W6-P4**: **og-image.png** 제작 후 `public/` 배치.

---

## 부록(외부 서비스) 대비

- Supabase: buckets **project-uploads**, **project-outputs**, **thumbnails** — 마이그레이션에 버킷 생성이 있으면 완료, 없으면 대시보드에서 수동 생성 필요.
- 카카오/구글/포트원/Anthropic/Resend/Vercel: 가이드대로 설정하면 됨. 코드 상에서는 **ANTHROPIC_API_KEY**, **RESEND_API_KEY**, **PORTONE_API_KEY** 등 Edge Function용 시크릿만 연동 여부 확인하면 됨.

---

## 우선순위 정리 (가이드 완성도 기준)

1. **필수로 보완하면 가이드와 거의 일치**
   - **W4-P2**: verify-payment에서 PortOne REST API 검증.
   - **W6-P4**: og-image.png 제작·배치.

2. **기능 강화(가이드 명세 충실도)**
   - **W3-P2**: ai-customize에 Claude API + 파일 파싱 + 30초 타임아웃.
   - **W3-P3**: CustomizePage Realtime, 5단계 로딩 UI, 결과 3탭 + 인라인 편집·“다시 적용”.
   - **W5-P2**: 관리자 템플릿 CRUD, 사용자 탭.
   - **W6-P3**: project-outputs + signed URL(7일) 후 send-email downloadUrl.

3. **문구/UI만 맞추면 됨**
   - **W1-P4**: 홈 하단 섹션 타이틀 “이런 결과물을 만들 수 있어요” 추가.

---

## 결론

- **이미 구현된 것**: 라우팅, 인증, 갤러리, 업로드, StepIndicator, 입력 가이드, AI 스켈레톤, Customize 폴링·타임아웃·재시도, 미리보기(뷰포트·수정 모드·저장), 결제·결제 완료·다운로드(JSZip), 마이페이지(삭제·재다운로드), 관리자(주문 목록·기간 필터), 에러/토스트, QA·sessionStorage·반응형·send-email 호출·SEO·배포 설정.
- **가이드 대비 빠진 것**:  
  - **PortOne 실제 검증**, **og-image.png**, **Claude·파일 파싱·30초 타임아웃**, **Customize Realtime + 5단계 UI + 결과 3탭 + 인라인 편집·다시 적용**, **관리자 템플릿 CRUD + 사용자 탭**, **project-outputs + signed URL(7일) + 이메일 downloadUrl**, **홈 “이런 결과물을 만들 수 있어요” 타이틀.**

이 문서를 기준으로 `PHASE_COMPLETION_STATUS.md`와 작업 목록을 맞춰 가면 됩니다.
