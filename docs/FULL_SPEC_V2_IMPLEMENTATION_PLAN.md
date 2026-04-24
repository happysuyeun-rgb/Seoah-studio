# full_spec_v2 기능정의서·화면설계서 — 다음 구현 계획

> **full_spec_v2 (1).html** 기준으로 현재 구현 현황을 점검하고, **다음에 구현할 항목**을 우선순위별로 정리한 문서입니다.  
> 작성일: 2025-03-17

---

## 1. 스펙 요약 (full_spec_v2 기준)

| 구분 | 내용 |
|------|------|
| **기능** | 41개 (F-001~F-039 + F-022b 등). 인증·템플릿·업로드·AI·미리보기·결제·마이페이지·고객지원·관리자 |
| **화면** | 14개 (SC-01~SC-14). 공개 5 + 고객 7 + 관리자 1 + 에러 1 |
| **DB** | 8테이블. users, templates, projects, orders, downloads, faqs, inquiries, chatbot_inquiries |
| **에러** | E-001~E-052 (인증·업로드·AI·미리보기·결제·파일전달) |
| **테스트** | T-001~T-033 (Happy Path 16 + 에러 10 + 모바일 4) |

---

## 2. 현재 구현 현황 매핑

### 2.1 이미 반영된 항목 (Phase 1 MVP)

| 스펙 ID | 항목 | 비고 |
|---------|------|------|
| F-001~003 | 카카오·구글 OAuth, 세션/로그아웃, returnTo | LoginPage, AuthCallbackPage, GNB |
| F-004~006 | 제품 카테고리, 템플릿 갤러리, 상세 미리보기 | HomePage, TemplateGalleryPage, TemplateDetailPage |
| F-007~008 | 파일 업로드, 텍스트 직접 입력 | UploadPage, Storage project-uploads |
| F-010~015 | AI 파싱(.txt/.md), 컬러 추출, 슬롯 치환, CSS 주입, 저장, 2초 폴링 | ai-customize Edge Function, CustomizePage |
| F-016~017 | 라이브 미리보기, 뷰 토글 | PreviewPage |
| F-019~022 | 결제 플랜 UI, 포트원, verify-payment, HTML zip 다운로드 | CheckoutPage, PaymentSuccessPage |
| F-022b | 재다운로드 signed URL 재발급 | get-download-url Edge Function, MyPage |
| F-027~029 | 프로젝트 목록, 재편집, 다운로드 내역·재다운로드 | MyPage |
| F-030~035 | FAQ 아코디언, 1:1 문의, 챗봇 FAB, 문의 알림, 관리자 문의·챗봇 탭, 답변 이메일 | SupportPage, ChatbotWidget, AdminPage, send-email |
| F-036~038 | 템플릿 CRUD, 주문·매출 현황, 사용자 목록 | AdminPage |
| RLS·Storage | 5테이블 + 3 Storage 정책 | 002_rls_v2, 003_storage_v2 |
| 슬롯 12종 | fallback, font_hint→URL, :root·Google Fonts | ai-customize, slotSpec.ts |
| 업로드 안내 | .pptx/.docx 노란 배너, .jpg/.png/.pdf 파란 배너, 가이드 표 | UploadPage (미연동 기능 사용자 안내) |
| SC-01~14 | 화면 구조·IA | 라우트·GNB·각 페이지 존재 |

### 2.2 미연동·부분 구현 (스펙에 “⚠ 미연동” 표기)

| 스펙 ID | 항목 | 현재 상태 | 다음 구현 여부 |
|---------|------|-----------|----------------|
| **F-009** | .pptx/.docx 텍스트 파싱 (mammoth) | 업로드·Storage만. AI 추출 안 함. 노란 배너 안내 추가됨 | **선택** — mammoth 연동 시 Edge Function에서 .pptx/.docx 파싱 후 텍스트 전달 |
| **F-010b** | 이미지 Claude Vision 파싱 | 업로드·Storage만. AI 추출 안 함. 파란 배너 안내 추가됨 | **선택** — ai-customize에서 .jpg/.png base64 → Claude Vision content 블록 |
| **F-015** | 완료 감지 방식 | 2초 폴링 구현. Realtime 구독 미적용 | **변경 없음** (스펙: “Realtime 미적용 — 선택 사항”) |
| **F-018** | 미리보기 내 수동 수정 (contenteditable) | Phase 2. postMessage "enableEdit" | **Phase 2** — PreviewPage iframe + contenteditable + 저장 시 output_html UPDATE |
| **F-039** | 관리자 Realtime 알림 (탭 뱃지) | 미적용 | **선택** — Supabase Realtime 구독으로 신규 문의/주문 시 뱃지 갱신 |

### 2.3 Phase 2·3 (스펙 명시)

| 스펙 ID | 항목 | 비고 |
|---------|------|------|
| F-023 | Vercel 자동 배포 URL | Phase 2. Vercel Deploy API → 고객 전용 URL |
| F-024 | PDF/PPT/Figma 변환 | Phase 3. Puppeteer, pptxgenjs, Figma API |
| 결제 플랜 | HTML만 활성, URL·PDF·PPT·Figma “출시 예정” | 현재 HTML만 활성화된 상태 유지 가능 |

### 2.4 DB·스키마 정합성 (선택)

| 스펙 | 현재 프로젝트 | 조치 |
|------|----------------|------|
| faqs.order_num | sort_order 사용 | 동일 목적. 이름만 다름 — 변경 불필요 |
| inquiries: type, title, content, admin_answer, answered_at | subject, body, admin_reply, replied_at | 동일 기능. 이름만 다름 — 변경 불필요 |
| chatbot_inquiries.user_id | nullable | 이미 nullable — 일치 |

---

## 3. 다음 구현 계획 (우선순위)

### 3.1 즉시 진행 권장 (스펙 충족·UX 보완)

| 순서 | 항목 | 내용 | 예상 |
|------|------|------|------|
| 1 | **테스트 시나리오 실행** | T-001~T-033 수동 실행. 실패 항목 수정 (에러 메시지, 리디렉션, 토스트 등) | 1일 |
| 2 | **에러 처리 보강** | E-050/E-051/E-052 등 파일전달 영역: zip 실패 시 안내 문구, signed URL 만료 시 재시도 유도, 다운로드 차단 시 모달 안내 (선택) | 0.5일 |
| 3 | **관리자 Realtime 뱃지 (선택)** | F-039. inquiries·chatbot_inquiries·orders Realtime 구독 → 신규 건 수 탭 뱃지 표시 | 0.5일 |

### 3.2 Phase 2 (기능 확장)

| 순서 | 항목 | 내용 | 예상 |
|------|------|------|------|
| 1 | **미리보기 수동 수정 (F-018)** | PreviewPage: 수정 모드 토글 → postMessage "enableEdit" → iframe 내 텍스트 contenteditable → “변경 저장” 시 output_html UPDATE | 1일 |
| 2 | **Vercel URL 배포 (F-023)** | 결제 플랜에 “URL” 추가. Vercel Deploy API 호출 → 고객 전용 URL 발급·signed URL 7일 | 1~2일 |
| 3 | **.pptx/.docx 파싱 (F-009)** | Edge Function에서 mammoth(또는 동일 목적 라이브러리)로 텍스트 추출 후 Claude 입력에 포함. Deno 호환성 확인 | 1일 |
| 4 | **이미지 Claude Vision (F-010b)** | ai-customize에서 .jpg/.png 등 base64 인코딩 후 Claude Vision content 블록으로 전달해 텍스트·정보 추출 | 1일 |

### 3.3 Phase 3 (추가 전달물)

| 항목 | 내용 |
|------|------|
| F-024 | PDF(Puppeteer), PPT(pptxgenjs), Figma(REST API) 변환 및 다운로드 |

### 3.4 유지·변경 없음

- **Realtime 구독**: CustomizePage는 2초 폴링 유지 (스펙 “Realtime 미적용 — 선택 사항”).
- **ai-customize·verify-payment·send-email**: 에러 코드·응답 형식만 정리했으면 추가 변경 없음.
- **downloads·orders 스키마**: 변경 없음.

---

## 4. 체크리스트 요약

- [ ] **T-001~T-033** 수동 실행 후 실패 항목 수정
- [ ] **E-050~E-052** 파일전달 에러 안내·모달 보강 (선택)
- [ ] **F-039** 관리자 Realtime 뱃지 (선택)
- [ ] **F-018** 미리보기 contenteditable 수동 수정 (Phase 2)
- [ ] **F-023** Vercel URL 배포 (Phase 2)
- [ ] **F-009** .pptx/.docx mammoth 연동 (Phase 2)
- [ ] **F-010b** 이미지 Claude Vision 연동 (Phase 2)
- [ ] **F-024** PDF/PPT/Figma 변환 (Phase 3)

---

## 5. 참고

- **기능정의서·화면설계서 원본**: `full_spec_v2 (1).html` (기능 41개, 화면 14개, DB 8테이블, RLS, 슬롯, 에러 52개, 테스트 33개).
- **기존 v2 계획서**: `NEXT_IMPLEMENTATION_PLAN_V2.md` (cursor_guide_v2 기준 Phase A/B/C).  
- 이 문서는 **full_spec_v2** 기준으로 “이미 구현된 것”과 “다음에 할 것”을 정리한 것이며, 실제 스프린트는 위 우선순위와 Phase 2/3 순서로 반영하면 됩니다.
