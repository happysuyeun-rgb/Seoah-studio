# full_spec_v2_2_final 반영 — 추가 사항 분석 & 개발 구현 계획

> **full_spec_v2_2_final.html** (기능정의서 + 화면설계서 v2.2, 2026.03.22) 기준  
> **v2.1 대비 추가·변경 사항** 정리 및 **개발 구현 계획**  
> 작성일: 2026-03-17

---

## 1. v2.2 핵심 변경 요약

| 구분 | v2.1 | v2.2 |
|------|------|------|
| 화면 수 | 14 | **19** (+5) |
| DB 테이블 | 8 | **15** (+7) |
| phase vs priority | phase만 | **phase(개발단계) + priority(런칭우선순위)** 분리 |
| 신규 보완 항목 | - | **20+** |

---

## 2. v2.1 대비 추가된 항목 (신규)

### 2.1 신규 화면 (5개)

| ID | 화면명 | URL | 영역 | 우선순위 | 설명 |
|----|--------|-----|------|----------|------|
| **SC-15** | 약관·개인정보·환불정책 | `/terms` · `/privacy` · `/refund` | 공개 | **P0** | 정책 3종 페이지. 결제 전 동의 링크. |
| **SC-16** | 환불 요청/처리 | `/mypage/refund/:orderId` · `/admin/refunds` | 고객·관리자 | **P0** | 환불 요청 제출 + 관리자 승인/거절 |
| **SC-17** | 계정 설정/회원탈퇴 | `/mypage/settings` | 고객 | **P0** | 프로필·알림·탈퇴 버튼 |
| **SC-18** | 공유 링크 뷰어 | `/share/:token` | 공개 | P2 | 읽기 전용 공유 (비밀번호·만료 옵션) |
| **SC-19** | 운영·감사 로그 | `/admin/logs` | 관리자 | P1 | admin_logs 조회·필터·diff 모달 |

### 2.2 신규 DB 테이블 (7개)

| 테이블 | 설명 | 관련 기능 |
|--------|------|-----------|
| **policy_agreements** | 정책 동의 로그 | F-046 (terms/privacy/refund/marketing) |
| **refund_requests** | 환불 요청 상세 | F-047 (사유·첨부·검토·승인/거절) |
| **project_versions** | 프로젝트 버전 스냅샷 | F-043 (AI 생성본·수정본·복원) |
| **admin_logs** | 운영·감사 로그 | F-049 (템플릿·FAQ·문의·환불 등) |
| **faq_search_logs** | FAQ 검색어 분석 | F-050 (검색어·결과 수·문의 전환) |
| **project_shares** | 읽기 전용 공유 링크 | F-051 (토큰·비밀번호·만료) |
| **project_share_views** | 공유 링크 조회 로그 | F-051 |

### 2.3 orders 테이블 확장 (v2.2)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| **payment_method** | text | card / phone 등 결제 수단 |
| **refunded_amount** | integer | 환불 금액 (원) |
| **refunded_at** | timestamptz | 환불 완료 시각 |
| **receipt_url** | text | PG 영수증 확인 링크 |

### 2.3a templates.preview_html (v2.1 확장)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| **preview_html** | text | 데모 데이터로 치환된 미리보기 HTML. 관리자 "미리보기 전체 재생성" 버튼으로 일괄 갱신. admin_update_template_preview_html RPC 연동. |

### 2.4 신규 RLS 정책 (4종)

- `policy_agreements` — 본인 INSERT/SELECT, 관리자 UPDATE
- `refund_requests` — 본인 INSERT/SELECT, 관리자 UPDATE
- `admin_logs` — 관리자만 SELECT, INSERT는 Edge Fn/관리자 액션
- `project_shares` — token 검증 시 공개 SELECT, 본인 INSERT/UPDATE

### 2.5 신규 기능 (정책·운영 F-040~051)

| ID | 기능 | Phase | Priority | 핵심 내용 |
|----|------|-------|----------|-----------|
| F-040 | 회원탈퇴/계정삭제 | P1 | **P0** | projects·inquiries 비식별화, orders 보존 |
| F-041 | AI 재생성 정책 | P1 | P1 | 재생성 횟수 제한, 이력 저장 |
| F-042 | 템플릿 검수/린트 | P1 | P1 | 슬롯 검증·금지 태그·smoke test |
| F-043 | 프로젝트 버전 히스토리 | P2 | P2 | project_versions, 이전 버전 복원 |
| F-044 | SEO 메타 자동 생성 | P2 | P2 | meta title·description·og 자동 생성 |
| F-045 | og:image 기본 생성 | P2 | P2 | 1200×630 OG 이미지 (이미 일부 완료) |
| F-046 | 약관·개인정보·환불정책 동의 | P1 | **P0** | 결제 전 필수 3종 체크박스, policy_agreements 저장 |
| F-047 | 환불 요청/처리 | P1 | **P0** | refund_requests, 첨부파일, 관리자 승인/거절. 환불 접수 시 send-email(type: refund_alert) 관리자 알림. ADMIN_EMAIL 미설정 시 건너뜀 |
| F-048 | 자동저장/임시저장 | P1 | P1 | localStorage + projects draft sync |
| F-049 | 운영·감사 로그 | P1 | P1 | admin_logs, 민감 작업 기록 |
| F-050 | FAQ 검색어 분석 | P2 | P2 | faq_search_logs, 관리자 대시보드 |
| F-051 | 읽기 전용 공유 링크 | P2 | P2 | project_shares, 비밀번호·만료 |

### 2.6 신규 테스트 케이스 (T-034~042)

| ID | 카테고리 | 내용 |
|----|----------|------|
| T-034 | 결제 | 필수 정책 3종 미동의 시 결제 시도 → 버튼 비활성 |
| T-035 | 결제 | 마케팅 이메일 미동의 상태 결제 → policy_agreements marketing=false 저장 |
| T-036 | 결제 | 환불 요청 제출 성공 → refund_requests + orders.status |
| T-037 | 결제 | 동일 주문 환불 중복 요청 → 기존 요청 안내 |
| T-038 | 관리자 | 환불 승인 처리 → admin_logs 기록 |
| T-039 | 마이페이지 | 회원탈퇴 후 재로그인 → 신규 사용자 플로우 |
| T-040 | 공유 | 만료된 공유 링크 접근 → 만료 안내 |
| T-041 | 공유 | 비밀번호 공유 3회 오류 → 일시 잠금 |
| T-042 | 관리자 | 템플릿 수정/환불 승인 후 감사 로그 생성 |

### 2.7 누락 정책 항목 (M-001~009)

| ID | 항목 | 우선순위 | 상태 | 내용 |
|----|------|----------|------|------|
| M-001 | 이용약관/개인정보/환불정책 | **P0** | ✅ 완료 | TermsPage·PrivacyPage·RefundPage. CheckoutPage 동의 체크박스 |
| M-002 | 파일 보관/자동 삭제 정책 | P0 | 부분 정의 | 업로드 원본 30일 자동 삭제 배치 미구현 |
| M-003 | 회원탈퇴/계정삭제 플로우 | **P0** | ✅ 완료 | MyPageSettingsPage + delete-account Edge Function |
| M-004 | 환불 요청/처리 운영 플로우 | **P0** | ✅ 완료 | RefundRequestPage + process-refund + Admin 환불 탭 |
| M-005 | 로그/모니터링/장애 대응 | P1 | 부분 정의 | admin_logs와 함께 Phase F 구현 예정 |
| M-006 | 다운로드 전달 방식 일원화 | P1 | 혼재 | 클라이언트 JSZip + 서버 Storage 혼재 |
| M-007 | 마케팅 이메일 수신 동의 분리 | **P0** | ✅ 완료 | CheckoutPage 마케팅 체크박스, MyPageSettings 토글 |
| M-008 | 미성년자 이용 제한 | **P0** | ✅ 완료 | TermsPage 제3조 만 14세 미만 이용 제한 명시 |
| M-009 | templatesMock DEV 전용 폴백 | P1 | ✅ 완료 | Supabase 미설정 시 templatesMock 목업 폴백. import.meta.env.DEV/빌드 시 트리 없음 |

### 2.8 기존 화면 스펙 보완 (SC-05, SC-07, SC-08 등)

- **SC-05 (업로드)**: 자동저장 상태, 복구 모달 (F-048)
- **SC-07 (미리보기)**: 재생성 횟수 배지, 이전 버전 보기 (F-041, F-043)
- **SC-08 (결제)**: 정책 동의 체크박스 3종 필수 + 마케팅 별도 (F-046)
- **SC-10 (마이페이지)**: 프로필 헤더, URL hash 탭, 썸네일 (일부 v2.1에서 반영)
- **SC-13 (관리자)**: 6탭(템플릿·주문·사용자·문의·챗봇·환불). 미리보기 전체 재생성 버튼. process-refund 연동. E-portone 에러 시 수동 처리 안내

---

## 3. 개발 구현 계획 — Phase별

### Phase E — P0 런칭 전 필수 (SC-15, SC-16, SC-17, F-046, F-047, F-040, M-007, M-008)

**목표:** 결제·개인정보 법적 요건 충족. 런칭 전 반드시 완료.

| 순서 | 작업 | 상세 | 예상 소요 |
|------|------|------|-----------|
| E1 | **DB 마이그레이션** | policy_agreements, refund_requests 테이블 + RLS. orders 확장(payment_method, refunded_amount 등) | 0.5일 |
| E2 | **SC-15 정책 페이지** | TermsPage, PrivacyPage, RefundPage. /terms, /privacy, /refund 라우트. 목차·본문 마크다운 | 1일 |
| E3 | **F-046 정책 동의 UI** | CheckoutPage에 필수 3종 + 마케팅 별도 체크박스. policy_agreements INSERT. 링크 연결 | 0.5일 |
| E4 | **SC-16 환불 요청** | RefundRequestPage (/mypage/refund/:orderId). 사유·첨부 업로드. refund-attachments bucket. 처리 히스토리 타임라인(접수→검토→처리 완료) | 1일 |
| E5 | **F-047 환불 처리** | refund-request Edge Function. 관리자 승인/거절 UI. 포트원 환불 API 연동 | 1.5일 |
| E6 | **SC-17 계정 설정·탈퇴** | MyPageSettingsPage (/mypage/settings). F-040 탈퇴 플로우. 비식별화 Edge Function | 1일 |
| E7 | **M-007, M-008** | 마케팅 체크박스 분리, 약관에 만 14세 미만 제한 명시 | 0.5일 |

**Phase E 총 예상:** 5~6일

---

### Phase F — P1 운영 안정화 (SC-19, F-049, F-048, F-041)

**목표:** 감사 로그, 자동저장, 재생성 정책.

| 순서 | 작업 | 상세 | 예상 소요 |
|------|------|------|-----------|
| F1 | **admin_logs 테이블 + RLS** | 마이그레이션 016 | 0.25일 |
| F2 | **F-049 감사 로그** | 템플릿·문의·환불 등 관리자 액션 시 admin_logs INSERT | 0.5일 |
| F3 | **SC-19 운영 로그 화면** | AdminLogsPage (/admin/logs). 기간·유형 필터, diff 모달 | 1일 |
| F4 | **F-048 자동저장** | UploadPage, PreviewPage draft sync. localStorage + 복구 모달 | 1일 |
| F5 | **F-041 재생성 정책** | project_versions 또는 재생성 횟수 저장. PreviewPage 배지·확인 모달 | 0.5일 |

**Phase F 총 예상:** 3~4일

---

### Phase G — P2 고도화 (SC-18, F-051, F-043, F-050, F-044, F-045)

**목표:** 공유 링크, 버전 히스토리, FAQ 분석, SEO/OG.

| 순서 | 작업 | 상세 | 예상 소요 |
|------|------|------|-----------|
| G1 | **project_shares, project_share_views** | 마이그레이션 | 0.25일 |
| G2 | **SC-18 공유 링크 뷰어** | ShareViewerPage (/share/:token). 비밀번호·만료 검증 | 1일 |
| G3 | **F-051 공유 링크 생성** | 마이페이지/PreviewPage에서 공유 링크 생성 UI | 0.5일 |
| G4 | **project_versions 테이블** | 마이그레이션 | 0.25일 |
| G5 | **F-043 버전 히스토리** | PreviewPage 이전 버전 드롭다운, 복원 | 0.5일 |
| G6 | **faq_search_logs** | FAQ 검색 시 로그 저장 | 0.25일 |
| G7 | **F-050 FAQ 검색어 분석** | Admin 대시보드 상위 검색어 | 0.5일 |
| G8 | **F-044, F-045 SEO/OG** | 메타 자동 생성, og:image (일부 완료) | 0.5일 |

**Phase G 총 예상:** 3~4일

---

## 4. 라우팅 추가 계획

```
// App.tsx 추가 라우트
/terms              → TermsPage
/privacy            → PrivacyPage
/refund             → RefundPage
/mypage/settings    → MyPageSettingsPage (ProtectedRoute)
/mypage/refund/:orderId → RefundRequestPage (ProtectedRoute)
/share/:token       → ShareViewerPage (공개)
/admin/refunds      → AdminPage 내 탭 또는 별도 컴포넌트
/admin/logs         → AdminLogsPage (AdminRoute)
```

---

## 5. DB 마이그레이션 파일 계획

| 번호 | 파일명 | 내용 |
|------|--------|------|
| 016 | `016_policy_agreements.sql` | policy_agreements 테이블 + RLS |
| 017 | `017_refund_requests.sql` | refund_requests 테이블 + RLS. refund-attachments bucket |
| 018 | `018_orders_refund_columns.sql` | orders에 payment_method, refunded_amount, refunded_at, receipt_url |
| 019 | `019_admin_logs.sql` | admin_logs 테이블 + RLS |
| 020 | `020_project_versions.sql` | project_versions 테이블 + RLS |
| 021 | `021_faq_search_logs.sql` | faq_search_logs 테이블 |
| 022 | `022_project_shares.sql` | project_shares, project_share_views + RLS |

---

## 6. Edge Function 추가 계획

| 함수명 | 역할 |
|--------|------|
| **submit-refund-request** | 환불 요청 제출. refund_requests INSERT. 첨부 업로드 처리. 환불 접수 시 send-email(refund_alert)로 관리자 알림. ADMIN_EMAIL 미설정 시 발송 건너뜀. |
| **process-refund** | 관리자 승인/거절. 포트원 환불 API. orders.status UPDATE. send-email. admin_logs. |
| **delete-account** | 회원탈퇴. projects·inquiries 비식별화. Auth 사용자 삭제. |
| **create-share-link** | project_shares INSERT. 토큰 생성. (또는 RPC) |
| **log-admin-action** | admin_logs INSERT. (또는 클라이언트→RPC) |

---

## 7. 우선순위 요약

| 우선순위 | 항목 | Phase |
|----------|------|-------|
| **P0 (런칭 전 필수)** | SC-15, SC-16, SC-17, F-046, F-047, F-040, M-007, M-008 | Phase E |
| **P1 (운영 안정화)** | SC-19, F-049, F-048, F-041 | Phase F |
| **P2 (고도화)** | SC-18, F-051, F-043, F-050, F-044, F-045 | Phase G |

---

## 8. 완료 기준 체크리스트 (v2.2)

### Phase E (P0)
- [ ] policy_agreements, refund_requests 테이블 생성
- [ ] orders 테이블 확장 (refund 관련 컬럼)
- [ ] /terms, /privacy, /refund 페이지 구현
- [ ] CheckoutPage 정책 동의 3종 + 마케팅 분리
- [ ] 환불 요청 페이지 + Edge Function
- [ ] 관리자 환불 승인/거절 UI
- [ ] /mypage/settings 회원탈퇴
- [ ] M-007, M-008 반영

### Phase F (P1)
- [ ] admin_logs 테이블
- [ ] 감사 로그 기록 (템플릿·문의·환불)
- [ ] /admin/logs 화면
- [ ] 자동저장 + 복구 모달
- [ ] 재생성 횟수 배지

### Phase G (P2)
- [ ] project_shares, project_share_views
- [ ] /share/:token 뷰어
- [ ] project_versions, 이전 버전 보기
- [ ] faq_search_logs, 검색어 분석
- [ ] SEO/OG 메타 보완

---

이 계획서는 **full_spec_v2_2_final.html** 내용을 기준으로 작성되었습니다.  
**Phase E → F → G** 순서로 진행하는 것을 권장합니다.
