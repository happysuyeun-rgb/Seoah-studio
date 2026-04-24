# Changelog

SEOAH.STUDIO 개발 이력. 기능 추가(✦) · 버그 수정(⚑) · 유지보수(◎) · 주의(⚠)

---

## [v0.9.1] — 2026-03-17 (latest)

### ✦ feat

- **환불 요청 관리자 알림** — submit-refund-request에서 환불 접수 시 send-email(refund_alert) 호출. ADMIN_EMAIL 환경 변수로 수신. 실패해도 환불 요청 저장 유지.
- **send-email refund_alert 타입** — 주문번호·요청 사유·결제 금액 포함 관리자 알림 이메일.
- **verify-payment payment_method 저장** — PortOne 응답의 pay_method(card/phone/vbank 등)를 orders.payment_method에 저장.
- **SC-16 처리 히스토리 타임라인** — RefundRequestPage 환불 요청 상세에 3단계 타임라인(접수→검토→처리 완료) 추가.
- **F-047·SC-13 문서화** — refund_alert + ADMIN_EMAIL 건너뜀 명시. Admin 6탭, 미리보기 재생성 컴포넌트. E-portone 에러 케이스 추가.
- **templates.preview_html** — 관리자 재생성 버튼 연동 문서 추가.
- **M 정책** — M-001~004, M-007, M-008 완료. M-009 templatesMock DEV 폴백 추가.

---

## [v0.9.0] — 2026-03-18

### ✦ feat

- **DEV 로그인 우회** — import.meta.env.DEV 조건부 이메일/비밀번호 로그인 + 목업 유저 주입 (LoginPage, authStore, DevFloatingButtons)
- **SC-11 SupportPage** — 히어로 문구, 비밀글 자물쇠 아이콘, 문의 유형 드롭다운(5종), 제출 완료 UI
- **SC-13 AdminPage** — 5탭 구조(템플릿·주문·사용자·문의·챗봇), Realtime 뱃지, 주문 테이블 이메일·플랜 컬럼
- **SC-14 NotFoundPage** — 404 전용 페이지 + Route path="*" 연결
- **SC-10 MyPage** — 프로필 헤더(아바타·이니셜·이름·이메일·로그아웃), URL hash 탭, 카드 썸네일
- **SC-08 CheckoutPage** — output_html 미리보기 iframe(160px), 결제수단 안내 문구
- **SC-09 PaymentSuccessPage** — checkFadeIn 애니메이션, 이메일 발송 안내 문구
- **SC-07 PreviewPage** — 사이드바 브랜드 정보(custom_params), 모바일 fixed 하단 고정
- **SC-05 UploadPage** — 드래그앤드롭, 글자수 카운터(50자 기준), 선택 템플릿 사이드바, .pptx/.docx·이미지 안내 배너
- **SC-02 LoginPage** — ← 홈으로 링크, 로고 클릭 홈 이동
- **F-022b get-download-url** — 7일 만료 후 signed URL 재발급 Edge Function
- **HomePage** — 카테고리별 템플릿 수 Supabase count 실시간 조회, 뱃지 표시
- document.title 페이지별 개별 설정 (SC-P8)

### ⚑ fix

- UploadPage JSX 닫는 태그 중복으로 인한 Vite 빌드 오류 수정
- SupportPage formType useState 선언 누락 버그 수정

### ◎ chore

- TemplateGalleryPage — DEV 환경에서 에러 메시지 상세 표시

---

## [v0.8.0] — 2026-03-17

### ✦ feat

- GAP-P1: get-download-url Edge Function 명세 설계
- GAP-P2: .pptx/.docx 업로드 안내 배너, 이미지/PDF 안내 배너 (UploadPage)
- 보완 설계 문서 v1.0 — Use Case, 에러케이스, API명세, RLS, 슬롯스펙, 테스트시나리오
- Cursor 프롬프트 가이드 v2 — 보완 섹션 13개 추가 (S1-P1~P6, SP-P1~P3, CB-P1~P2)
- 고객지원 페이지(/support) 설계 — FAQ + 1:1 문의 + 챗봇 통합
- 챗봇 플로팅 컴포넌트 설계 (4단계 플로우, chatbot_inquiries 테이블)

### ◎ chore

- 기능정의서 + 화면설계서 통합 HTML v3 — SC 갭 체크 반영
- F-009 mammoth 미연동, F-010b Vision 미연동, F-015 Realtime 미적용 상태 명시

---

## [v0.7.0] — 2026-03-17

### ✦ feat

- Phase 5 완료 — AdminPage 관리자 대시보드 3탭 (템플릿 CRUD, 주문 통계, 사용자)
- Phase 5 완료 — MyPage 프로젝트 목록, 다운로드 내역, 재다운로드
- Phase 5 완료 — PaymentFailPage + ErrorBoundary + Toast 시스템
- Phase 6 완료 — SEO 메타태그, OG 태그, GA4 이벤트 추적, Vercel 배포 설정
- Phase 6 완료 — send-email Edge Function (Resend, 결제완료/문의알림/답변알림)

### ◎ chore

- og-image.png public 배치, og:image 메타 반영

---

## [v0.6.0] — 2026-03-17

### ✦ feat

- Phase 4 완료 — CheckoutPage + 포트원 SDK IMP.request_pay()
- Phase 4 완료 — verify-payment Edge Function (포트원 REST API 검증, orders INSERT)
- Phase 4 완료 — PaymentSuccessPage + JSZip HTML zip 다운로드
- Phase 4 완료 — project-outputs 버킷 zip 업로드 + signed URL(7일) + downloads INSERT

---

## [v0.5.0] — 2026-03-17

### ✦ feat

- Phase 3 완료 — UploadPage (파일 업로드, Storage, 텍스트 입력, StepIndicator)
- Phase 3 완료 — ai-customize Edge Function (.txt/.md 파싱, Claude API, 변수 치환, CSS 주입)
- Phase 3 완료 — CustomizePage (5단계 로딩 UI, 2초 폴링, 3탭 결과 카드, 인라인 편집)

### ◎ chore

- .pptx/.docx mammoth 미연동, 이미지 Vision 미연동 — Phase 3 보완 예정

---

## [v0.4.0] — 2026-03-17

### ✦ feat

- Phase 2 완료 — TemplateGalleryPage (카테고리 탭, 태그 필터, 스켈레톤 6카드)
- Phase 2 완료 — TemplateDetailPage (iframe 미리보기, 뷰 토글, 데모 데이터 치환)
- Phase 2 완료 — 샘플 템플릿 3종 + seed_templates.sql

---

## [v0.3.0] — 2026-03-17

### ✦ feat

- Phase 1 완료 — 프로젝트 셋업 (React 18 + TypeScript + Vite + TailwindCSS + Supabase)
- Phase 1 완료 — DB 스키마 8개 테이블 + RLS 정책 + auth.users 트리거
- Phase 1 완료 — 카카오 + 구글 OAuth + AuthCallbackPage + ProtectedRoute
- Phase 1 완료 — HomePage (히어로, How it works, 카테고리 3종, 예시 결과물)

---

## [v0.1.0] — 2026-03-17

### ◎ chore

- 프로젝트 초기화 — SEOAH.STUDIO AI Template Customization SaaS
- 기능정의서 v1.0, 화면설계서 v1.0, Cursor 프롬프트 가이드 v1.0 작성
- 보완 설계 문서, 고객지원 설계, 챗봇 설계 완료
