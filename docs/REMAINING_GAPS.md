# 구현 여부 점검 — 남은 미구현/선택 항목

> 기준: cursor_guide.html + PHASE_COMPLETION_STATUS.md 대비 **현재 코드베이스**  
> 갱신일: 2025-03-17 (최근 구현 반영 후 재점검)

---

## ✅ 이미 반영된 항목 (이번에 확인·보완한 것)

| 항목 | 상태 |
|------|------|
| 환불 요청 시 관리자 알림 이메일 (refund_alert) | ✅ 반영 |
| verify-payment payment_method 저장 (PortOne pay_method) | ✅ 반영 |
| SC-16 환불 요청 상세 처리 히스토리 타임라인 | ✅ 반영 |
| 홈 "이런 결과물을 만들 수 있어요" | ✅ 반영 |
| verify-payment PortOne REST API 검증 | ✅ 반영 |
| og-image.png public 배치 | ✅ 반영 |
| ai-customize Claude API + .txt/.md 파싱 + 30초 타임아웃 | ✅ 반영 |
| CustomizePage 5단계 로딩 + 3탭 + 인라인 편집 + 다시 적용 | ✅ 반영 |
| 관리자 템플릿 CRUD + 사용자 탭 + 주문 기간 필터 | ✅ 반영 |
| project-outputs zip 업로드 + signed URL(7일) + send-email downloadUrl | ✅ 반영 |
| verify-payment에서 downloads INSERT(file_url) | ✅ 반영 |
| 관리자 사용자 탭 "결제 횟수" 컬럼 | ✅ 반영 |
| 관리자 주문 현황 "신규 사용자 (이번 달)" 카드 | ✅ 반영 |
| SC-13 6탭 + 미리보기 전체 재생성 컴포넌트 | ✅ 반영 |
| E-portone 환불 API 실패 처리 (수동 처리 안내) | ✅ 반영 |
| M-001~004, M-007, M-008, M-009 | ✅ 반영 |

---

## ⚠️ 부분 구현 / 선택 사항

### 1. W3-P2 ai-customize — .pptx/.docx, 이미지 Vision

| 항목 | 현재 | 비고 |
|------|------|------|
| .txt / .md | ✅ URL fetch 후 텍스트 추출 | 구현됨 |
| .pptx / .docx | ❌ 미구현 | 가이드: mammoth 등으로 텍스트 추출. Deno에서 mammoth/esm.sh 연동 필요 |
| .jpg / .png (이미지) | ❌ 미구현 | 가이드: Claude Vision으로 텍스트 추출. API에 image 블록 + base64 전달 필요 |
| Claude API + 30초 타임아웃 | ✅ 구현 | ANTHROPIC_API_KEY 설정 시 동작 |

**정리**: .pptx/.docx·이미지는 가이드 명세에는 있으나, 현재는 **텍스트(.txt/.md) + 직접 입력 + Claude** 만으로도 핵심 플로우는 동작. 필요 시 추후 확장 가능.

---

### 2. W3-P3 CustomizePage — Realtime 구독

| 항목 | 현재 | 비고 |
|------|------|------|
| status 감지 | 2초 폴링 | 구현됨 |
| Realtime 구독 | ❌ 미구현 | 가이드: "Supabase Realtime으로 projects 테이블 구독" (선택 사항으로도 해석 가능) |

**정리**: 폴링으로 동작하므로 **선택** 개선. Realtime 적용 시 배포/연결 설정 필요.

---

### 3. downloads.file_url — 7일 이후 재다운로드

| 항목 | 현재 | 비고 |
|------|------|------|
| 결제 시 zip 업로드 + signed URL | ✅ verify-payment에서 수행 | 7일 유효 |
| downloads 테이블에 file_url 저장 | ✅ 반영 | order_id, file_type, file_url INSERT |
| 7일 만료 후 "다시 다운로드" | ⚠️ 제한적 | MyPage에서는 기존처럼 output_html로 JSZip 재생성. file_url이 있으면 그 URL 사용(만료 전까지) |

**정리**: 7일 이내는 이메일/마이페이지에서 저장된 URL 사용 가능. 7일 이후 재다운로드는 **project-outputs 경로로 새 signed URL 발급**하는 API가 있으면 완전히 충족됨(현재는 클라이언트 JSZip으로 대체).

---

## 📋 문서 미갱신 (구현은 됐는데 문서만 과거 상태)

다음 문서들은 **이미 구현된 항목**이 여전히 "미완료"로 적혀 있을 수 있습니다.

| 문서 | 권장 조치 |
|------|-----------|
| **PHASE_COMPLETION_STATUS.md** | Phase 3·4·5·6의 "작업 완료"에 Claude/3탭/PortOne/CRUD/사용자 탭/og-image/downloads.file_url 등 반영 후, "미완료"에서 해당 항목 제거 |
| **CURSOR_GUIDE_GAP_CHECK.md** | "미구현" 목록을 위 **부분 구현/선택** 항목만 남기고, 나머지는 "구현됨"으로 정리 |

---

## 🔧 정리: 추가로 구현하면 좋은 것 (우선순위 낮음)

1. **ai-customize**  
   - .pptx/.docx: Deno에서 mammoth(또는 유사 라이브러리)로 텍스트 추출 후 rawText에 추가.  
   - .jpg/.png: Storage에서 다운로드 → base64 → Claude Vision 메시지에 image 블록으로 전달.

2. **CustomizePage**  
   - Realtime 채널로 `projects` 변경 구독 후 `status === 'ready'` 시 폴링 중단(선택).

3. **7일 만료 후 재다운로드**  
   - Edge Function 또는 API: `projectId`/`orderId` 받아서 project-outputs 경로로 새 signed URL 생성 후 반환.  
   - MyPage "다시 다운로드"에서 해당 API 호출 후 리다이렉트(선택).

4. **문서**  
   - PHASE_COMPLETION_STATUS.md, CURSOR_GUIDE_GAP_CHECK.md를 위 내용 기준으로 수정.

---

## 결론

- **가이드/Phase 기준으로 필수 플로우는 구현된 상태**입니다.  
- **남은 것은**  
  - **부분**: .pptx/.docx·이미지 파싱, Realtime, 7일 이후 재다운로드용 API  
  - **문서**: 완료 현황/갭 체크 문서 갱신  
입니다.  
원하시면 문서 갱신용 수정안(문단별 치환안)도 정리해 드리겠습니다.
