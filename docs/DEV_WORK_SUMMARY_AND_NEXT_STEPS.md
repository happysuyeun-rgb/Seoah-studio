# 개발 작업 정리 — AI 구현분 vs 직접 작업분

> 지금까지 AI가 수행한 개발 작업과, **직접 진행해야 할 작업**을 구분해 정리한 문서입니다.  
> 작성일: 2025-03-17

---

## 1. AI가 지금까지 개발한 내용

### 1.1 개발 전용 로그인 (OAuth 없이 로그인 테스트)

| 구분 | 내용 |
|------|------|
| **목적** | localhost에서 마이페이지·결제·관리자 등 전체 화면을 OAuth 없이 확인 |
| **방법 1** | **LoginPage.tsx**: `import.meta.env.DEV`일 때만 "⚠ 개발 전용" 섹션 표시. 이메일/비밀번호 입력 + "개발 로그인" → `supabase.auth.signInWithPassword()`. 기본값은 `VITE_DEV_EMAIL`, `VITE_DEV_PASSWORD`. Supabase 실패 시 "목업 로그인 (Supabase 없음)" 버튼으로 방법 2 전환. |
| **방법 2** | **authStore.ts**: `getDevMockAuth()` — `localStorage['dev-login'] === 'true'`일 때 목업 유저/세션 반환. `signOut` 시 `dev-login`, `dev-admin` 제거. **App.tsx AuthListener**: 목업 사용 시 Supabase 세션으로 덮어쓰지 않음. **AdminRoute / AdminPage**: 목업 유저일 때 `localStorage['dev-admin']`으로 `is_admin` 판단 → "DEV 관리자 ON" 시 `/admin` 접근 가능. |
| **플로팅** | **DevFloatingButtons.tsx**: DEV일 때만 우상단 표시. "DEV 로그인" / "DEV 로그아웃" / "DEV 관리자 ON·OFF" (리로드로 반영). |
| **환경 변수** | `.env.local.example`에 `VITE_DEV_EMAIL`, `VITE_DEV_PASSWORD` 주석 예시 추가. |

**주의**: 모든 분기는 `import.meta.env.DEV`로만 동작하므로 **운영 빌드에는 포함되지 않음**. 기존 카카오/구글 OAuth·Supabase auth 설정은 변경하지 않음.

---

### 1.2 UploadPage.tsx JSX 구조 수정

| 구분 | 내용 |
|------|------|
| **증상** | Vite `plugin:vite:oxc` 오류 — "Unterminated regular expression", "main에 해당하는 JSX 닫는 태그를 예상했습니다" (145행 `<main>`, 346행 부근). |
| **원인** | 그리드 레이아웃에서 닫는 `</div>`가 하나 더 있어, `<aside>`와 형제인 그리드 컨테이너가 버튼 블록 다음에 잘못 닫힘. |
| **수정** | 버튼 블록 직후의 **중복 `</div>` 한 개 제거**하여 `main` → 그리드 `div` → 왼쪽 컬럼 `div` / `aside` → 그리드 `</div>` → `</main>` 구조로 정리. |

---

### 1.3 템플릿 목록 로드 실패 시 에러 노출

| 구분 | 내용 |
|------|------|
| **위치** | **TemplateGalleryPage.tsx** — "템플릿 목록을 불러오지 못했습니다." 표시 시. |
| **수정** | `useQuery`의 `error`를 사용해 **개발 환경(`import.meta.env.DEV`)에서만** 실제 오류 메시지( Supabase/네트워크 등)를 화면에 표시. "다시 시도" 버튼은 유지. |
| **목적** | 환경 변수 오류, 테이블 없음, RLS 등 원인 파악을 사용자가 직접 할 수 있도록 함. |

---

## 2. 직접 해야 할 작업 — 한 번만 하면 되는 것

### 2.1 Supabase 프로젝트·환경 설정

| 순서 | 작업 | 참고 |
|------|------|------|
| 1 | Supabase 프로젝트 생성 후 **URL**, **anon key**를 `.env.local`에 설정 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) | `.env.local.example` 참고. 설정 후 `npm run dev` 재시작. |
| 2 | Authentication → Providers에서 **Kakao / Google** 활성화, Redirect URI 등록 | `https://<project>.supabase.co/auth/v1/callback` 등. |
| 3 | **개발용 테스트 유저**(방법 1 사용 시): Authentication → Users → Add user → 이메일 `test@seoah.studio`, 비밀번호 `Test1234!` | 로그인 페이지 "개발 로그인"에서 사용. |
| 4 | (선택) `.env.local`에 `VITE_DEV_EMAIL`, `VITE_DEV_PASSWORD` 추가 | 로그인 폼 기본값. 없어도 기본 이메일은 코드에 있음. |

### 2.2 DB 마이그레이션·시드

| 순서 | 작업 | 참고 |
|------|------|------|
| 1 | Supabase SQL Editor 또는 `supabase db reset` 등으로 **마이그레이션** 실행 (`001_initial_schema.sql`, `002_rls_v2_policies.sql` 등) | `templates` 테이블·RLS가 있어야 갤러리 로드 가능. |
| 2 | **시드**: `supabase/seed_templates.sql` 실행 | 갤러리에 표시할 샘플 템플릿 3개. |

"템플릿 목록을 불러오지 못했습니다"가 나오면 개발 환경에서 표시되는 **에러 문구**를 보고, 테이블 없음/RLS/네트워크 등 원인 확인.

---

## 3. 직접 해야 할 작업 — 기능·문서 보완 (문서 기준)

아래는 **PHASE_COMPLETION_STATUS.md**, **SCREEN_SPEC_GAP_AND_SUPPLEMENTS.md**, **ADDITIONS_AND_DOC_REVISIONS.md**에 이미 정리된 항목 중, 직접 진행할 작업만 요약한 것입니다.

### 3.1 Phase 3 — AI·커스터마이징

| 항목 | 내용 |
|------|------|
| ai-customize 고도화 | Claude API 실제 연동, .txt/.md 스토리지 읽기, .pptx/.docx(mammoth 등)·이미지 Vision 파싱, 30초 타임아웃·폴백. |
| CustomizePage | (선택) Realtime 구독, ready 후 3탭 편집 UI·"다시 생성". |
| 에러 처리 | CustomizePage·PreviewPage 등 남은 API 실패 경로에 `toast.error` 적용. |

### 3.2 Phase 4 — 결제·다운로드

| 항목 | 내용 |
|------|------|
| verify-payment | PortOne REST API로 `imp_uid` 조회·금액·상태 검증 후에만 orders INSERT, `projects.status=paid`. |
| 다운로드 | 결제 완료 시 project-outputs 버킷에 zip 업로드 → signed URL(7일) 생성 → `downloads.file_url` 저장. (현재는 클라이언트 zip만 가능.) |

### 3.3 Phase 5 — 마이페이지·관리자

| 항목 | 내용 |
|------|------|
| 마이페이지 | 프로젝트 카드 "삭제" 버튼 + `projects.deleted_at` 업데이트. 다운로드 내역 "다시 다운로드" 버튼. |
| 관리자 | 템플릿 CRUD UI(추가/수정/비활성화). 주문 기간 필터(오늘/이번 주/전체). 사용자 관리 탭. |
| 전역 에러 | 남은 API/Edge Function 실패 경로에 `toast.error` 적용. |

### 3.4 Phase 6·기타

| 항목 | 내용 |
|------|------|
| og-image | `public/og-image.png` 제작·배치, `index.html` og:image 메타 반영. |
| (선택) 이메일·다운로드 | project-outputs + signed URL 생성 후 send-email의 downloadUrl로 전달. |

### 3.5 화면 스펙 갭 보완 (SCREEN_SPEC_GAP_AND_SUPPLEMENTS.md 기준)

- **즉시 권장**: SC-02 "← 홈으로", SC-09 결제 완료 체크 아이콘·이메일 안내, SC-14 404 전용 페이지.
- **단기**: SC-05 선택 템플릿 사이드바·글자 수·드래그앤드롭, SC-08 결제 썸네일·결제 수단 안내, SC-10 프로필 헤더·hash 탭, SC-03 스켈레톤, SC-01 카테고리 템플릿 수 뱃지 등.
- **선택**: 예시 결과물 실자료, SC-11 히어로·비밀글 아이콘, SC-13 주문 테이블 이메일·플랜, F-031 문의 유형 등.

자세한 우선순위·체크리스트는 `docs/SCREEN_SPEC_GAP_AND_SUPPLEMENTS.md` 4·5절 참고.

---

## 4. 문서 유지

- Phase를 마칠 때마다 **PHASE_COMPLETION_STATUS.md**의 해당 Phase "작업 완료"·"미완료"·"필요한 작업"을 갱신.
- 이 파일(**DEV_WORK_SUMMARY_AND_NEXT_STEPS.md**)은 AI가 새로 작업할 때마다 "1. AI가 지금까지 개발한 내용"을 추가·수정하고, "2·3"은 프로젝트 상태에 맞게 필요한 만큼 수정하면 됩니다.
