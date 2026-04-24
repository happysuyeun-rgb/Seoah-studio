# SEOAH.STUDIO Phase 단계별 완료 현황

> 각 Phase 완료 시점별 **작업완료 내용**, **미완료 내용**, **필요한 작업 내용**을 정리한 문서입니다.  
> 마지막 업데이트: 2025-03-17 (문서 갱신: 완료 항목 반영)

---

## Phase 1 – 프로젝트 셋업 + DB + 인증 + 랜딩

### 작업 완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W1-P1 | 프로젝트 초기 셋업 | 완료 | React 18 + TypeScript + Vite, TailwindCSS, Supabase Client v2, React Router v6, Zustand, React Query 적용. `src/` 구조 (components, pages, hooks, lib, store, types) 및 라우트 구성 완료. `.env.local.example` 제공. |
| W1-P2 | Supabase DB 스키마 + RLS | 완료 | `supabase/migrations/001_initial_schema.sql`: users, templates, projects, orders, downloads 5개 테이블, RLS 정책, auth.users → public.users 트리거. users에 is_admin 컬럼 포함. |
| W1-P3 | 카카오 + 구글 OAuth 로그인 | 완료 | LoginPage(카카오/구글 버튼, redirectTo /auth/callback), AuthCallbackPage(returnTo 처리), authStore(user/session/isLoading/signOut, onAuthStateChange), ProtectedRoute, GNB(로그인/마이페이지/로그아웃) 구현. |
| W1-P4 | 랜딩 (SC-01) | 완료 | HomePage: 히어로, How it works 4단계, 카테고리 3종(포트폴리오/랜딩/앱 MVP), CTA·카테고리 클릭 시 로그인 여부에 따라 갤러리 또는 로그인으로 이동. |

### 미완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| - | shadcn/ui 도입 | 미적용 | 명세의 “TailwindCSS (shadcn/ui optional)”은 선택 사항으로 두고, 현재는 Tailwind만 사용. |
| - | Supabase 실제 연동 검증 | 미완료 | 로컬에서 Supabase 프로젝트 생성·URL/Key 설정·Auth Provider(Kakao/Google) 설정 후 직접 로그인 플로우 검증 필요. |

### 필요한 작업 내용

1. **Supabase 대시보드 설정**  
   - Project 생성 후 URL, anon key를 `.env.local`에 반영.  
   - Authentication → Providers에서 Kakao/Google 활성화 및 각 플랫폼에서 Redirect URI `https://<project>.supabase.co/auth/v1/callback` 등록.

2. **실행 검증**  
   - `npm run dev` 후 홈 → 로그인 → 콜백 → 랜딩 복귀 플로우 확인.

---

## Phase 2 – 템플릿 갤러리 + 상세 + 시드

### 작업 완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W2-P1 | 템플릿 갤러리 (SC-03) | 완료 | TemplateGalleryPage: useParams(category), React Query로 templates 조회(category, is_active), 카테고리 탭, **unique 태그 필터 버튼**(전체/태그별), empty 시 문구 분리. 카드 "미리보기"/"이 템플릿 사용" → projectStore + /project/upload. |
| W2-P2 | 템플릿 상세 (SC-04) | 완료 | TemplateDetailPage: id로 template fetch, DEMO_DATA로 {{변수}} 치환 후 iframe 미리보기. **뷰포트 전환 버튼**(데스크톱 1280px/태블릿 768px/모바일 375px)으로 iframe wrapper max-width 적용. "이 템플릿으로 시작하기" → /project/upload. |
| W2-P3 | 시드 템플릿 3개 + DB 시드 | 완료 | `supabase/seed_templates.sql`: portfolio/homepage/app-mvp 카테고리별 1개씩, html_template({{변수}} 포함), thumbnail_url placeholder. |

### 미완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| - | (없음) | - | Phase 2 갤러리·상세 요구사항은 반영 완료. |

### 필요한 작업 내용

1. **시드 실행**  
   - Supabase SQL Editor에서 `001_initial_schema.sql` 실행 후 `seed_templates.sql` 실행해 갤러리 데이터 확인.

---

## Phase 3 – 자료 업로드 + AI 분석 + 커스터마이징

### 작업 완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W3-P1 | 자료 업로드 (SC-05) | 완료 | UploadPage: 파일 업로드(.txt,.md,.pptx,.docx,.jpg,.jpeg,.png,.pdf, 20MB·3개), 텍스트 입력, “AI 커스터마이징 시작” 시 projects INSERT + Storage(project-uploads, path userId/projectId/filename) 업로드 후 /project/customize. 에러 시 toast. |
| W3-P1 | StepIndicator | 완료 | 5단계. UploadPage/CustomizePage 배치. |
| W3-P1 | 입력 가이드 아코디언 | 완료 | "어떤 내용을 입력하면 좋을까요?" 접기/펼치기. |
| W3-P2 | Edge Function – AI 분석 | 완료(스켈톤) | `supabase/functions/ai-customize/index.ts`: projectId로 project·template 조회, 현재는 **폴백 데이터**로 html 치환 후 output_html/custom_params/status=ready 업데이트. Claude API·파일 내용 파싱 미연동. |
| W3-P3 | AI 커스터마이징 결과 (SC-06) | 완료 | CustomizePage: currentProjectId로 ai-customize invoke, 2초 폴링으로 status=ready 대기, “약 20~30초” 안내, ready 시 “미리보기 확인”/“처음부터 다시” 버튼. |

### 미완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W3-P2 | Claude API 연동 | 미완료 | 실제 Claude 호출, 파일(.txt/.md 스토리지 읽기, .pptx/.docx mammoth, 이미지 Vision) 파싱 후 JSON 추출 미구현. |
| W3-P2 | 타임아웃·폴백 | 부분 | Edge Function 내 30초 타임아웃·폴백 로직 미구현. 현재는 무조건 폴백 데이터로 완료. |
| W3-P3 | Realtime 구독 | 미완료 | projects 테이블 Realtime 구독으로 status 변경 감지 미구현. 현재는 폴링만 사용. |
| W3-P3 | 결과 3탭 편집 UI | 미완료 | “커스터마이징 결과” 3탭(기본 정보/색상/기능 문구) 및 인라인 편집·“다시 생성” 버튼 미구현. |

### 필요한 작업 내용

1. **ai-customize Edge Function 고도화**  
   - input_data.fileUrls 기반으로 Storage에서 파일 다운로드.  
   - .txt/.md: 텍스트 읽기. .pptx/.docx: Deno에서 mammoth 등으로 텍스트 추출. .jpg/.png: Claude Vision으로 텍스트 추출.  
   - Claude API 호출(claude-sonnet-4-20250514), JSON 스키마(company, headline, description, feature_1~3, cta, contact, color_primary, color_secondary, font_hint) 응답 받아 html 치환 및 CSS :root/Google Fonts 반영.  
   - 30초 타임아웃 시 fallback 객체로 처리.

2. **CustomizePage**  
   - Realtime(선택), ready 후 3탭 편집 UI, “다시 생성” 시 ai-customize 재호출.  
3. **에러 처리(보완)**  
   - UploadPage/CustomizePage/PreviewPage 등 catch 블록에서 toast.error() 호출 확인·보완.

---

## Phase 4 – 최종 미리보기 + 결제 + 다운로드

### 작업 완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W4-P1 | 최종 미리보기 (SC-07) | 완료 | PreviewPage: output_html을 iframe srcdoc로 표시, 편집 모드 ON/OFF(postMessage contentEditable), “저장” 시 iframe HTML로 projects.output_html UPDATE. 우측 사이드바(결과 요약, “AI 설정으로”, “결제하고 다운로드” → status=pending_payment 후 /project/checkout). |
| W4-P2 | 결제 (SC-08) | 완료 | CheckoutPage: PLANS(html/url/pdf/ppt/figma), HTML만 available. index.html에 아임포트 스크립트, IMP.request_pay 호출. 성공 시 verify-payment Edge Function 호출(imp_uid, merchant_uid, amount, projectId, planType) 후 /payment/success?projectId=... 실패 시 /payment/fail. |
| W4-P2 | verify-payment Edge Function | 완료(스켈톤) | `supabase/functions/verify-payment/index.ts`: Authorization으로 user 확인, orders INSERT, projects.status=paid. PortOne REST API로 imp_uid 검증·금액 일치 로직은 TODO. |
| W4-P1 | 데스크톱/태블릿/모바일 뷰 전환 | 완료 | PreviewPage: 1280/768/375 뷰포트 전환 버튼, iframe wrapper max-width 적용. |
| W4-P3 | 결제 완료 + HTML zip (SC-09) | 완료 | PaymentSuccessPage: projectId로 paid 주문 확인, “HTML 파일 다운로드” 시 JSZip으로 index.html 포함 zip 생성·다운로드, downloads 테이블 INSERT. |

### 미완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W4-P2 | PortOne 실제 검증 | 미완료 | verify-payment 내 PortOne REST API 호출 및 금액·상태 검증 미구현. |
| W4-P3 | 다운로드 URL 영구 보관 | 미완료 | 명세의 “project-outputs Storage + signed URL(7일)” 생성·downloads.file_url 저장·이메일 링크 등 미구현. 현재는 클라이언트에서만 zip 생성. |

### 필요한 작업 내용

1. **verify-payment**  
   - PortOne API로 imp_uid 조회 후 금액·상태 검증, 검증 성공 시에만 orders INSERT 및 projects.status=paid.

2. **다운로드 경로**  
   - 결제 완료 시 project-outputs 버킷에 zip 업로드 → signed URL 생성(604800초) → downloads.file_url 저장.  
   - PaymentSuccessPage에서 “다운로드” 시 해당 URL로 이동하거나, 기존처럼 클라이언트 zip 유지 시 file_url은 “클라이언트 생성” 등으로 구분.


---

## Phase 5 – 마이페이지 + 관리자 + 에러 처리

### 작업 완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W5-P1 | 마이페이지 (SC-10) | 완료 | MyPage: ProtectedRoute, projects 조회(user_id, deleted_at NULL, template join), 상태별 라벨(draft/ready/pending_payment/paid), “보기” 시 currentProjectId 설정 후 preview 또는 payment/success 이동. 다운로드 내역(downloads join orders) 테이블. Empty state + “시작하기” CTA. |
| W5-P2 | 관리자 콘솔 (SC-11) | 완료(기본) | AdminPage: AdminRoute(is_admin 체크), templates 목록 테이블, orders 목록 테이블. users.is_admin migration에 포함됨. |
| W5-P3 | 결제 실패 + 에러 처리 | 완료 | PaymentFailPage(?message= 표시, “다시 결제”/mailto:support@seoah.studio). ErrorBoundary 컴포넌트 + App 루트 래핑. Toast + toastStore(success/error/info), 최대 3개 표시. |

### 미완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W5-P1 | “삭제” 버튼 | 미완료 | 프로젝트 카드별 “삭제” + confirm 후 projects.deleted_at 업데이트 미구현. |
| W5-P1 | 다운로드 “다시 다운로드” | 미완료 | 다운로드 내역 행별 “다시 다운로드” 버튼(JSZip 동일 로직 또는 file_url) 미구현. |
| W5-P2 | 템플릿 CRUD UI | 미완료 | “새 템플릿 추가” 폼(이름, 카테고리, 태그, HTML textarea, 썸네일 Storage 업로드), “수정”/“비활성화” 버튼 미구현. |
| W5-P2 | 주문 기간 필터 | 미완료 | 주문 목록 “오늘/이번 주/전체” 필터 미구현. |
| W5-P2 | 사용자 관리 탭 | 미완료 | 사용자 목록(이름/이메일/가입일/프로젝트 수) 3번 탭 미구현. |
| W5-P3 | catch 시 toast 호출 | 부분 | UploadPage 등 일부만 toast.error 적용. CustomizePage, PreviewPage 등 모든 에러 경로에 toast 적용 필요. |

### 필요한 작업 내용

1. **마이페이지**  
   - 프로젝트 카드에 “삭제” 버튼 추가, confirm 후 `projects.deleted_at = now()` UPDATE.  
   - 다운로드 테이블에 “다시 다운로드” 버튼, order → project → output_html로 zip 생성 또는 file_url 사용.

2. **관리자**  
   - 템플릿 탭: 추가 폼(이름, category select, 태그, html_template textarea, thumbnails 버킷 업로드), 행별 수정/비활성화.  
   - 사용자 탭: users 목록 + 프로젝트 수 등.

2. **전역 에러**  
   - 남은 API/Edge Function 실패 경로에 toast.error 적용(필요 시).

---

## Phase 6 – QA + 반응형 + 이메일 + SEO/배포

### 작업 완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| - | .gitignore | 완료 | .env, .env.local, .env.production 무시. |
| - | index.html title | 완료 | "SEOAH.STUDIO – AI로 랜딩 템플릿 코드 완성" 등 적용. |
| W6-P1 | QA 체크리스트 | 완료 | docs/QA_CHECKLIST.md 작성, 플로우별 수동 테스트 항목 정리. |
| W6-P1 | sessionStorage 복원 | 완료 | projectStore getStoredProjectId, Customize/Preview/Checkout에서 currentProjectId 복원. |
| W6-P2 | 반응형 44px·375px | 완료 | 버튼 min-h 44px, 375/768/1280 대응. |
| W6-P3 | send-email | 완료(스켈레톤) | Edge Function(Resend), verify-payment 성공 시 invoke. |
| W6-P4 | PRODUCTION_ENV·GA4·vercel | 완료 | PRODUCTION_ENV.md, analytics.ts·페이지 이벤트, vercel.json rewrites. |
### 미완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W6-P4 | og-image.png | 미완료 | public에 og-image 제작·배치 미완료. |

### 필요한 작업 내용

1. **og-image**  
   - og-image.png 제작 후 public에 배치, index.html og:image 메타 반영.

2. **이메일·다운로드 고도화(선택)**  
   - project-outputs 버킷 + signed URL(7일) 생성 후 send-email의 downloadUrl로 전달.

---

## 문서 유지 방법

- **Phase를 한 단계 마칠 때마다** 이 파일을 열어 해당 Phase의 “작업 완료 내용”을 보강하고, “미완료 내용”에서 완료된 항목을 제거한 뒤 “필요한 작업 내용”을 갱신합니다.
- 새 Phase를 시작할 때는 해당 섹션의 “필요한 작업 내용”을 실제 작업 항목으로 활용하면 됩니다.
