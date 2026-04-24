# 설계 보완 재점검 — 현재 기준

> **SCREEN_SPEC_GAP_AND_SUPPLEMENTS.md**와 **PHASE_COMPLETION_STATUS.md**를 기준으로,  
> **지금 코드베이스**를 다시 점검해 **이미 반영된 항목**과 **실제로 보완이 필요한 항목**만 정리했습니다.  
> 작성일: 2025-03-17

---

## 1. 이미 반영된 항목 (보완 완료)

아래는 설계서/갭 문서에서는 “누락·권장”으로 되어 있었으나, **현재 구현에 이미 반영**되어 있습니다.

| 화면/구분 | 스펙 요구 | 현재 구현 상태 |
|-----------|-----------|----------------|
| **SC-01** | 카테고리 label "홈페이지" | `src/types/index.ts` CATEGORIES에서 `homepage` label **"홈페이지"** 적용됨. |
| **SC-01** | 카테고리 카드 템플릿 수 뱃지 | HomePage에서 `countsByCategory` 조회 후 카드에 "N개 템플릿" 뱃지 표시. |
| **SC-02** | "← 홈으로" 링크 | LoginPage 하단에 "← 홈으로" 버튼 있음. |
| **SC-02** | 서비스 설명 문구 | "로그인하면 AI 자동 커스터마이징을 시작할 수 있습니다." 적용됨. |
| **SC-03** | 스켈레톤 로딩 6카드 | TemplateGalleryPage `isLoading` 시 6개 스켈레톤 카드 표시. |
| **SC-03** | empty "준비 중입니다" | `templates.length === 0` 시 "준비 중입니다. 다른 카테고리를 확인해보세요." + 타 카테고리 유도. |
| **SC-05** | 선택 템플릿 사이드바 | UploadPage 우측 `<aside>`에 썸네일·이름·"템플릿 변경" 링크 있음. |
| **SC-05** | 파일 탭 / 직접입력 탭 | `uploadTab` 'file' | 'text' 탭 전환 UI 적용. |
| **SC-05** | 드래그앤드롭 | 파일 영역에 `onDragOver` / `onDrop` 등 처리됨. |
| **SC-05** | 글자 수 카운터 | textarea 하단에 "{charCount} / 50자 이상" 표시. |
| **SC-06** | "약 20~30초 소요됩니다" | CustomizePage 로딩 안내 문구에 포함. |
| **SC-07** | 사이드바 템플릿·브랜드 요약 | PreviewPage 우측에 적용 템플릿명·회사명·슬로건·메인 컬러 표시. |
| **SC-08** | 결과물 썸네일 | CheckoutPage에 output_html iframe 미니 미리보기(160px) 있음. |
| **SC-08** | 결제 수단 안내 | "신용·체크카드 및 휴대폰 결제가 가능합니다." 문구 있음. |
| **SC-09** | 완료 체크 아이콘(페이드인) | PaymentSuccessPage에 check 아이콘 + `checkFadeIn` 애니메이션 적용. |
| **SC-09** | 이메일 발송 안내 | "입력하신 이메일로 다운로드 링크가 발송되었습니다." 문구 있음. |
| **SC-10** | 프로필 헤더 | MyPage 상단에 아바타·이름·이메일·로그아웃 영역 있음. |
| **SC-10** | 탭 #projects / #downloads | hash 기반 탭 전환 + hashchange 리스너 적용. |
| **SC-10** | 프로젝트 카드 썸네일 | `templates.thumbnail_url` 표시, 없으면 템플릿명 텍스트. |
| **SC-10** | 삭제 버튼 | 프로젝트 카드별 삭제 + confirm 후 `projects.deleted_at` 업데이트. |
| **SC-10** | 다시 다운로드 | 다운로드 내역 행별 "다시 다운로드" (JSZip 또는 get-download-url). |
| **SC-11** | 히어로 "무엇을 도와드릴까요?" | SupportPage 상단 제목에 적용. |
| **SC-11** | 문의 목록 비밀글 아이콘 | 문의 목록 행에 `is_private` 시 자물쇠 SVG 아이콘 표시. |
| **SC-11** | 1:1 문의 유형 | 문의 폼에 유형 드롭다운, inquiries `type` 사용. |
| **SC-13** | 주문 테이블 이메일·플랜 | AdminPage 주문 테이블에 `users.email`, `plan_type` 컬럼 표시. |
| **SC-14** | 404 전용 페이지 | NotFoundPage 컴포넌트 + "홈으로 이동" 버튼, `Route path="*"` 연결. |
| **SC-14** | 에러 바운더리 | ErrorBoundary 컴포넌트 존재, App 루트 래핑. |

---

## 2. 실제로 보완이 필요한 설계 내용

아래만 **추가/변경**하면 full_spec_v2·Phase 문서와의 정합성이 맞습니다.

### 2.1 화면 스펙 (선택·낮은 우선순위)

| ID | 내용 | 비고 |
|----|------|------|
| **SC-01** | 예시 결과물 갤러리 | 현재 플레이스홀더 박스 3개 → 실제 결과물 스크린샷/캡처로 교체 권장 (선택). |
| **SC-11** | 고객지원 상단 설명 문구 | 스펙에 "히어로 + 설명" 세부 문구가 있으면 그대로 통일 (현재도 "무엇을 도와드릴까요?" 등으로 구현됨). |

### 2.2 Phase별 기능·백엔드 (문서와 동일)

- **Phase 3**  
  - ai-customize: Claude API 실제 연동, .txt/.md·.pptx/.docx·이미지 파싱, 30초 타임아웃·폴백.  
  - CustomizePage: (선택) Realtime 구독, ready 후 3탭 편집 UI·"다시 생성".  
  - 에러 처리: CustomizePage·PreviewPage 등 남은 실패 경로에 `toast.error` 적용.

- **Phase 4**  
  - verify-payment: PortOne REST API로 imp_uid 검증·금액·상태 확인 후 orders INSERT.  
  - 다운로드: project-outputs 버킷 zip 업로드 → signed URL(7일) → downloads.file_url 저장 (현재는 클라이언트 zip 위주).

- **Phase 5**  
  - 관리자: 템플릿 CRUD UI, 주문 기간 필터(오늘/이번 주/전체), 사용자 관리 탭(이미 users 탭·프로젝트 수 등 있음 — 스펙과 요구 수준만 맞추면 됨).

- **Phase 6**  
  - **og-image**: `public/og-image.png` 제작·배치, `index.html` og:image 메타 반영.  
  - (선택) 이메일·다운로드: signed URL 생성 후 send-email의 downloadUrl 전달.

### 2.3 기타 설계 보완 제안 (SCREEN_SPEC 2절)

- 접근성: 44px 터치 영역·aria-label 등 (이미 상당 부분 적용됨).  
- 로딩 일관성: 전역 스피너/스켈레톤 패턴 정리 (선택).  
- 결제 실패 문구: "다시 시도하기" vs "다시 결제하기" 등 스펙 문구로 통일 (선택).  
- 관리자 문의 필터: 전체/답변대기/답변완료 (선택).  
- SEO·메타: 페이지별 title·description·og (일부 적용, og-image만 확정 보완).

---

## 3. 체크리스트 요약 (현재 기준)

| 항목 | 상태 |
|------|------|
| SC-01: 카테고리 템플릿 수 뱃지, label "홈페이지" | ✅ 완료 |
| SC-01: 예시 결과물 실자료 | ⬜ 선택 |
| SC-02: ← 홈으로, 서비스 설명 문구 | ✅ 완료 |
| SC-03: 스켈레톤 6카드, empty "준비 중입니다" | ✅ 완료 |
| SC-05: 선택 템플릿 사이드바, 글자 수, 드래그앤드롭, 탭 | ✅ 완료 |
| SC-06: "약 20~30초" 안내 | ✅ 완료 |
| SC-07: 사이드바 템플릿·브랜드 요약 | ✅ 완료 |
| SC-08: 결과물 썸네일, 결제 수단 안내 | ✅ 완료 |
| SC-09: 완료 체크 아이콘, 이메일 안내 문구 | ✅ 완료 |
| SC-10: 프로필 헤더, hash 탭, 카드 썸네일, 삭제, 다시 다운로드 | ✅ 완료 |
| SC-11: 히어로 "무엇을 도와드릴까요?", 비밀글 아이콘, 문의 유형 | ✅ 완료 |
| SC-13: 주문 테이블 이메일·플랜 | ✅ 완료 |
| SC-14: 404 전용 페이지, 에러 바운더리 | ✅ 완료 |
| Phase 3~4: ai-customize, verify-payment, 다운로드 Storage | ⬜ 보완 필요 |
| Phase 5: 관리자 템플릿 CRUD, 주문 기간 필터 등 | ⬜ 보완 필요 |
| Phase 6: og-image | ⬜ 보완 필요 |

---

## 4. 문서와의 관계

- **SCREEN_SPEC_GAP_AND_SUPPLEMENTS.md**: 초기 갭 분석 문서. 위 "이미 반영된 항목"은 여기서 권장했던 것 중 현재 구현된 부분입니다.  
- **PHASE_COMPLETION_STATUS.md**: Phase별 완료/미완료/필요 작업이 정확히 정리되어 있으므로, 기능·백엔드 보완 시 해당 Phase 섹션을 기준으로 진행하면 됩니다.  
- 이 파일(**DESIGN_SUPPLEMENT_RECHECK.md**)은 **화면 스펙 보완**이 어디까지 되었는지만 재점검한 결과이므로, Phase 문서를 대체하지 않습니다.

이후 설계 변경이나 새 스펙이 생기면 이 문서의 2절·3절을 갱신하면 됩니다.
