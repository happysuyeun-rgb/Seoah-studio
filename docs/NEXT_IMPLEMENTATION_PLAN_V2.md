# 다음 구현 계획 — cursor_guide_v2.html 기준

> **cursor_guide_v2.html**의 “다음 구현” 프롬프트를 정리하고, 현재 프로젝트 대비 **우선순위·의존관계·계획**을 수립한 문서입니다.  
> 작성일: 2025-03-17

---

## 1. v2 가이드 구조 요약

| 구분 | 내용 | 프롬프트 수 |
|------|------|-------------|
| **기존 (v1)** | 1~6주차 (W1~W6) — 셋업·인증·갤러리·업로드·AI·미리보기·결제·마이페이지·관리자·QA·배포 | 20개 |
| **보완 설계** | Use Case, 에러 처리(E-001~E-052), Edge Function API 명세, RLS, 템플릿 슬롯, 테스트 시나리오 | 6개 (S1-P1~S1-P6) |
| **고객지원** | /support, FAQ 아코디언, 1:1 문의 게시판, 관리자 문의 관리 탭 | 3개 (SP-P1~SP-P3) |
| **챗봇** | 플로팅 챗봇, 4단계 플로우, chatbot_inquiries, 관리자 챗봇 탭 | 2개 (CB-P1, CB-P2) |

**총 추가 프롬프트: 11개** (S1-P1~S1-P6, SP-P1~SP-P3, CB-P1~CB-P2)

---

## 2. 현재 프로젝트 대비 갭

- **v1 (W1~W6)**  
  - 이미 대부분 구현된 상태. (PortOne 검증, og-image, Claude·파일 파싱, Customize 5단계·3탭, 관리자 CRUD·사용자 탭, project-outputs·send-email 등 반영됨.)

- **v2 추가 분**  
  - **보완 설계**: Use Case 정리·결제 중복 방지·Realtime fallback, 에러 코드 체계(E-001~E-052), Edge Function 응답 코드·형식, RLS·Storage 정책, 슬롯 스펙·font_hint 매핑, 테스트 시나리오 실행은 **미반영 또는 부분 반영**.  
  - **고객지원**: `/support` 페이지, FAQ, 1:1 문의, 관리자 문의 탭 **미구현**.  
  - **챗봇**: 플로팅 챗봇, `chatbot_inquiries`, 관리자 챗봇 탭 **미구현**.

---

## 3. 구현 순서 제안 (의존관계 반영)

### Phase A: 보완 설계 (기반 강화)

| 순서 | ID | 항목 | 의존 | 예상 공수 | 비고 |
|------|-----|------|------|-----------|------|
| A1 | S1-P4 | RLS 권한 정책 전체 적용 | 없음 | 1일 | 5테이블 + 3 Storage. 기존 RLS 보강·정리. |
| A2 | S1-P5 | 템플릿 변수 슬롯 스펙 | 없음 | 0.5일 | ai-customize fallback·font_hint 매핑, 관리자 슬롯 감지. |
| A3 | S1-P1 | Use Case 기반 라우팅·게이트 | A1 | 0.5일 | returnTo·결제 중복 방지·Realtime 30초 폴링 fallback. |
| A4 | S1-P3 | Edge Function API 명세 보완 | 없음 | 1일 | ai-customize / verify-payment / send-email 에러 코드·응답 형식 통일. |
| A5 | S1-P2 | 에러 처리 E-001~E-052 | A3, A4 | 1~2일 | 페이지·Edge Function catch 블록에 에러 코드·토스트·리디렉션 반영. |
| A6 | S1-P6 | 테스트 시나리오 실행 및 수정 | A5 | 1일 | T-001~T-033 체크리스트 실행, 실패 항목 수정. |

**Phase A 완료 기준**: UC 흐름·에러 코드·API 명세·RLS·슬롯·테스트 시나리오가 명세와 일치.

---

### Phase B: 고객지원

| 순서 | ID | 항목 | 의존 | 예상 공수 | 비고 |
|------|-----|------|------|-----------|------|
| B1 | SP-P1 | /support + FAQ 아코디언 | A1(RLS) | 1일 | faqs 테이블·seed_faqs.sql, SupportPage, 라우팅. |
| B2 | SP-P2 | 1:1 문의 게시판 | B1 | 1일 | inquiries 테이블, 문의 작성·목록·상세, send-email 관리자 알림. |
| B3 | SP-P3 | 관리자 문의 관리 탭 | B2 | 0.5일 | AdminPage 4번째 탭, 답변 입력·send-email 답변 알림. |

**Phase B 완료 기준**: `/support` 접속 → FAQ·1:1 문의 동작, 관리자에서 답변·알림 동작.

---

### Phase C: 챗봇

| 순서 | ID | 항목 | 의존 | 예상 공수 | 비고 |
|------|-----|------|------|-----------|------|
| C1 | CB-P1 | 챗봇 플로팅 컴포넌트 | A1(RLS) | 1~1.5일 | chatbot_inquiries 테이블, ChatbotWidget, 4단계 플로우, send-email 관리자 알림. |
| C2 | CB-P2 | 관리자 챗봇 문의 탭 | C1 | 0.5일 | AdminPage 5번째 탭, 필터·통계·Realtime 뱃지. |

**Phase C 완료 기준**: 전 페이지 우하단 챗봇 FAB 동작, 문의 DB 저장·관리자 이메일 알림, 관리자에서 챗봇 문의 목록 확인.

---

## 4. 상세 작업 체크리스트

### Phase A — 보완 설계

- **S1-P4 RLS**
  - [ ] users: SELECT/UPDATE 본인, INSERT 트리거만, DELETE 관리자만.
  - [ ] templates: SELECT is_active, INSERT/UPDATE/DELETE is_admin.
  - [ ] projects: SELECT/INSERT/UPDATE 본인, DELETE 차단(soft delete만).
  - [ ] orders: SELECT 본인, INSERT service_role만, UPDATE/DELETE 정책 명시.
  - [ ] downloads: SELECT orders.user_id=auth.uid(), INSERT 로그인만.
  - [ ] Storage: project-uploads(본인 폴더), project-outputs(service_role 업로드·signed 읽기), thumbnails(관리자 업로드·공개 읽기).

- **S1-P5 슬롯 스펙**
  - [ ] ai-customize: 12종 슬롯 fallback, font_hint→font_url 매핑, :root·Google Fonts 주입.
  - [ ] 관리자 템플릿 모달: {{슬롯}} 감지 → variables 미리보기, 필수 슬롯 누락 시 경고.

- **S1-P1 Use Case**
  - [ ] returnTo 복구 정확히 (/auth/callback).
  - [ ] 결제 중복 방지: sessionStorage merchant_uid, PaymentSuccessPage에서 기존 paid 확인.
  - [ ] Realtime 끊김 시 30초 폴링 fallback (CustomizePage).
  - [ ] /login 접근 시 이미 로그인이면 / 리디렉션.

- **S1-P3 Edge Function API**
  - [ ] ai-customize: 400/401/403/408/422/500/503 코드, { success, error, message } 형식.
  - [ ] verify-payment: 400/401/402/409/500, AMOUNT_MISMATCH 시 환불 처리 고려.
  - [ ] send-email: 400/500, RESEND_ERROR 등.
  - [ ] 공통: processingMs, CORS, Critical 시 로그.

- **S1-P2 에러 처리**
  - [ ] E-001~E-005 인증: 토스트·리디렉션·콘솔 로그.
  - [ ] E-010~E-014 업로드: 인라인 에러·토스트·재시도.
  - [ ] E-020~E-024 AI: 타임아웃·fallback·Realtime fallback.
  - [ ] E-030~E-033 미리보기: 배너·리디렉션·롤백.
  - [ ] E-040~E-045 결제: fail 페이지·관리자 알림.
  - [ ] E-050~E-052 파일: 재다운로드 안내·Signed URL 재생성·모달.

- **S1-P6 테스트**
  - [ ] T-001~T-016 Happy Path 수동 실행 및 수정.
  - [ ] T-020~T-029 에러 시나리오 실행 및 수정.
  - [ ] T-030~T-033 모바일(375px) 실행 및 수정.
  - [ ] Lighthouse LCP·업로드·zip 성능 확인.

---

### Phase B — 고객지원

- **SP-P1**
  - [ ] faqs 테이블 생성, RLS(SELECT is_active, INSERT/UPDATE/DELETE 관리자).
  - [ ] seed_faqs.sql (서비스 3·결제 2·파일 2).
  - [ ] SupportPage.tsx, 라우팅 /support.
  - [ ] FAQ 탭: 검색·카테고리·아코디언(하나만 열림).

- **SP-P2**
  - [ ] inquiries 테이블, RLS(본인·관리자).
  - [ ] 1:1 문의 탭: 목록·상세 모달·글쓰기 폼·비밀글·상태 뱃지.
  - [ ] 문의 접수 시 send-email 관리자 알림.

- **SP-P3**
  - [ ] AdminPage 탭 4: 문의 관리.
  - [ ] 답변 입력 → inquiries UPDATE, send-email 답변 알림(inquiry_answered).
  - [ ] Realtime inquiries 구독 → 뱃지 갱신.

---

### Phase C — 챗봇

- **CB-P1**
  - [ ] chatbot_inquiries 테이블, RLS(INSERT 전체, SELECT 관리자).
  - [ ] ChatbotWidget.tsx, App.tsx에 전역 배치.
  - [ ] FAB·패널·4단계 플로우(카테고리→내용→이름→이메일).
  - [ ] 로그인 시 이름·이메일 자동 채움.
  - [ ] 접수 완료 시 INSERT + send-email 관리자 알림.

- **CB-P2**
  - [ ] AdminPage 탭 5: 챗봇 문의.
  - [ ] 카테고리·날짜 필터, 통계 카드, Realtime 뱃지.

---

## 5. DB 스키마 추가 요약 (v2)

| 테이블 | 용도 |
|--------|------|
| **faqs** | FAQ 아코디언 (category, question, answer, order_num, is_active) |
| **inquiries** | 1:1 문의 (user_id, type, title, content, email, is_private, status, admin_answer, answered_at) |
| **chatbot_inquiries** | 챗봇 문의 (user_id nullable, category, content, name, email) |

Storage 버킷은 기존(project-uploads, project-outputs, thumbnails) 유지. RLS만 v2 명세에 맞게 정리.

---

## 6. 권장 진행 순서 (한 줄 요약)

1. **S1-P4** RLS 정책 정리  
2. **S1-P5** 슬롯 스펙·font_hint 매핑  
3. **S1-P1** Use Case(returnTo, 결제 중복, Realtime fallback)  
4. **S1-P3** Edge Function 에러 코드·응답 형식  
5. **S1-P2** 에러 처리 E-001~E-052  
6. **S1-P6** 테스트 시나리오 실행·수정  
7. **SP-P1** → **SP-P2** → **SP-P3** 고객지원  
8. **CB-P1** → **CB-P2** 챗봇  

---

## 7. 참고

- v2 프롬프트 원문은 **cursor_guide_v2.html**의 `SUPP_SECTIONS`(보완 설계), `support`(고객지원), `chatbot`(챗봇) 배열에서 복사해 사용하면 됩니다.
- 각 항목 완료 시 **PHASE_COMPLETION_STATUS.md** 또는 **docs/NEXT_IMPLEMENTATION_PLAN_V2.md**의 체크리스트에 반영하면 이후 진행 상황 추적에 유리합니다.

이 문서를 “다음 구현 계획” 기준으로 사용하고, 필요 시 순서나 세부 항목만 조정하면 됩니다.
