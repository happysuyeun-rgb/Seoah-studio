# 추가 구현 권장 사항 + 문서 수정안

> **추가하면 좋은 것**과 **PHASE_COMPLETION_STATUS.md / CURSOR_GUIDE_GAP_CHECK.md 수정안**을 한 문서로 정리했습니다.  
> 작성일: 2025-03-17

---

# Part 1. 추가하면 좋은 것 (선택 구현)

우선순위가 낮고, 현재 플로우만으로도 서비스 가능한 항목들입니다.

---

## 1. ai-customize — .pptx/.docx 파싱

**목표**: 업로드된 .pptx, .docx에서 텍스트를 추출해 `rawText`에 붙인 뒤 Claude에 전달.

**방법**:
- Deno Edge Function에서 `https://esm.sh/mammoth` (docx 전용) 또는 docx/pptx용 다른 라이브러리 사용.
- `input_data.fileUrls` 중 확장자가 .docx/.pptx인 URL을 fetch → 바이너리 받은 뒤 라이브러리로 텍스트 추출 → `rawText`에 append.
- .pptx는 mammoth가 지원하지 않을 수 있으므로, 전용 파서 검색 후 적용.

**참고**: 현재는 .txt/.md + 직접 입력 + Claude로도 핵심 플로우는 동작합니다.

---

## 2. ai-customize — 이미지(.jpg/.png) Claude Vision

**목표**: 업로드된 이미지에서 텍스트/정보 추출 후 Claude에 넘기기.

**방법**:
- fileUrls 중 .jpg/.jpeg/.png URL을 fetch → ArrayBuffer → base64 인코딩.
- Claude Messages API 요청 시 `content`에 `type: "image"`, `source: { type: "base64", media_type: "image/jpeg", data: "<base64>" }` 블록 추가.
- 모델은 Vision 지원 버전 사용(이미 사용 중인 claude-sonnet-4-20250514 등).

**참고**: 이미지가 없어도 텍스트 기반 추출만으로 동작합니다.

---

## 3. CustomizePage — Realtime 구독

**목표**: `projects` 테이블 변경을 폴링 대신 Realtime으로 감지.

**방법**:
- `supabase.channel('project:' + projectId).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: 'id=eq.' + projectId }, payload => { ... }).subscribe()`
- `payload.new.status === 'ready'`이면 폴링 중단하고 결과 UI 표시.
- Realtime이 Supabase 프로젝트에서 활성화되어 있어야 함.

**참고**: 2초 폴링만으로도 동작하므로 선택 사항입니다.

---

## 4. 7일 만료 후 재다운로드용 API

**목표**: signed URL(7일) 만료 후에도 마이페이지에서 “다시 다운로드” 시 새 URL 발급.

**방법**:
- Edge Function(예: `get-download-url`) 추가: `order_id` 또는 `project_id` + 인증 확인 후, project-outputs의 `{projectId}/website.zip`에 대해 `createSignedUrl(path, 604800)` 호출해 새 signed URL 반환.
- MyPage “다시 다운로드”: 기존처럼 클라이언트에서 output_html로 JSZip 생성하거나, 위 API에서 받은 URL로 이동(또는 다운로드 트리거).

**참고**: 현재는 클라이언트 JSZip으로 재다운로드 가능하므로, 서비스 정책에 따라 필요 시 추가하면 됩니다.

---

## 5. 문서 유지

- 위 항목 중 어떤 것을 구현했는지 **PHASE_COMPLETION_STATUS.md**의 해당 Phase “작업 완료”에 한 줄씩 추가.
- **CURSOR_GUIDE_GAP_CHECK.md**의 해당 ID를 “부분” → “구현”으로 바꾸고 비고만 정리.

---

# Part 2. PHASE_COMPLETION_STATUS.md 수정안

아래는 **현재 구현 상태에 맞게** Phase별로 수정할 내용입니다.  
해당 섹션을 **교체**하거나 **추가**하면 됩니다.

---

## Phase 1 (변경 최소)

- **W1-P4 비고**: “예시 결과물” 섹션 타이틀 “이런 결과물을 만들 수 있어요” 반영했다고 적어도 됨(이미 반영됨).

**작업 완료 테이블에 추가할 한 줄(선택)**:
```markdown
| W1-P4 | 예시 결과물 섹션 | 완료 | 하단 섹션 타이틀 "이런 결과물을 만들 수 있어요" 적용. |
```

---

## Phase 3 — 작업 완료 내용 (교체)

**기존 Phase 3 “작업 완료 내용” 테이블 전체를 아래로 교체**:

```markdown
### 작업 완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W3-P1 | 자료 업로드 (SC-05) | 완료 | UploadPage: 파일 업로드(.txt~.pdf 20MB·3개), 텍스트 입력, project-uploads Storage, projects INSERT 후 /project/customize. 에러 toast. |
| W3-P1 | StepIndicator | 완료 | 5단계. UploadPage/CustomizePage 배치. |
| W3-P1 | 입력 가이드 아코디언 | 완료 | "어떤 내용을 입력하면 좋을까요?" 접기/펼치기. |
| W3-P2 | Edge Function – AI 분석 | 완료 | ai-customize: .txt/.md URL fetch 후 텍스트 추출, ANTHROPIC_API_KEY 시 Claude API 호출(30초 타임아웃), JSON 파싱·fallback, output_html/custom_params/status=ready. .pptx/.docx·이미지 Vision은 미연동. |
| W3-P3 | AI 커스터마이징 결과 (SC-06) | 완료 | CustomizePage: ai-customize invoke, 5단계 로딩 UI(①~⑤), 2초 폴링·30초 초과 재시도, ready 후 3탭(기본 정보/색상/기능 문구)·인라인 편집·"다시 적용"(클라이언트 치환), 미리보기/처음부터 다시. Realtime 구독은 미적용(폴링 사용). |
```

---

## Phase 3 — 미완료 내용 (교체)

**기존 Phase 3 “미완료 내용” 테이블 전체를 아래로 교체**:

```markdown
### 미완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W3-P2 | .pptx/.docx 파싱 | 미구현 | mammoth 등 Deno 환경에서 텍스트 추출 미연동. |
| W3-P2 | 이미지 Vision | 미구현 | .jpg/.png Claude Vision 파싱 미연동. |
| W3-P3 | Realtime 구독 | 미구현 | projects 테이블 Realtime 대신 폴링 사용. |
```

---

## Phase 3 — 필요한 작업 내용 (교체)

**기존 Phase 3 “필요한 작업 내용”을 아래로 교체**:

```markdown
### 필요한 작업 내용

1. **ai-customize 확장(선택)**  
   - .pptx/.docx: Deno에서 mammoth 또는 동일 목적 라이브러리로 텍스트 추출 후 rawText에 반영.  
   - .jpg/.png: Storage/URL에서 이미지 다운로드 후 base64 → Claude Vision content 블록으로 전달.

2. **CustomizePage(선택)**  
   - Realtime 채널로 projects 구독, status=ready 시 폴링 중단.

3. **에러 처리(보완)**  
   - UploadPage/CustomizePage/PreviewPage 등 catch 블록에서 toast.error() 호출 확인·보완.
```

---

## Phase 4 — 작업 완료 내용 (보강)

**기존 Phase 4 “작업 완료 내용” 테이블에서 아래 두 행을 추가하거나, 해당 내용이 있는 행의 비고를 아래처럼 수정**:

- verify-payment:  
  `PortOne(아임포트) REST API로 imp_uid 검증·금액 일치 후 orders INSERT. PORTONE_IMP_KEY/SECRET 미설정 시 검증 생략.`
- W4-P3 / 다운로드:  
  `결제 시 project-outputs에 zip 업로드, signed URL(7일) 생성, send-email downloadUrl 전달, downloads 테이블에 file_url INSERT.`

**추가할 행 예시**:
```markdown
| W4-P2 | PortOne 검증 | 완료 | verify-payment: 아임포트 getToken → payments/{imp_uid} 조회, status=paid·금액 일치 시에만 orders INSERT. |
| W4-P3 | project-outputs·downloads | 완료 | zip 업로드, createSignedUrl(604800), send-email downloadUrl, downloads INSERT(file_url). |
```

---

## Phase 4 — 미완료 내용 (교체)

**기존 Phase 4 “미완료 내용” 테이블 전체를 아래로 교체**:

```markdown
### 미완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| - | (없음) | - | Phase 4 명세 반영 완료. 7일 만료 후 재다운로드용 새 signed URL 발급 API는 선택. |
```

---

## Phase 4 — 필요한 작업 내용 (교체)

**기존 Phase 4 “필요한 작업 내용”을 아래로 교체**:

```markdown
### 필요한 작업 내용

1. **7일 만료 후 재다운로드(선택)**  
   - Edge Function 등으로 project-outputs 경로에 대해 새 signed URL 발급 후, 마이페이지 "다시 다운로드"에서 해당 URL 사용.
```

---

## Phase 5 — 작업 완료 내용 (보강)

**기존 Phase 5 “작업 완료 내용”에 아래 내용 반영**:

- W5-P1: 삭제(deleted_at), 다시 다운로드 버튼 구현됨.
- W5-P2: 템플릿 CRUD(새 템플릿 추가·수정·비활성화), 주문 기간 필터(오늘/이번 주/전체), 주문 통계 카드(이번 달 매출·총 주문·결제 완료·신규 사용자), 사용자 탭(이름·이메일·가입일·프로젝트 수·결제 횟수) 구현됨.

**추가할 행 예시**:
```markdown
| W5-P1 | 삭제·다시 다운로드 | 완료 | 프로젝트 카드 "삭제" confirm 후 deleted_at UPDATE. 다운로드 내역 "다시 다운로드" 버튼. |
| W5-P2 | 템플릿 CRUD | 완료 | 새 템플릿 추가(이름·카테고리·태그·HTML·썸네일), 수정·비활성화. |
| W5-P2 | 주문 기간 필터·통계 | 완료 | 오늘/이번 주/전체 필터, 이번 달 매출·총 주문·결제 완료·신규 사용자(이번 달) 카드. |
| W5-P2 | 사용자 탭 | 완료 | 이름·이메일·가입일·프로젝트 수·결제 횟수 테이블. |
```

---

## Phase 5 — 미완료 내용 (교체)

**기존 Phase 5 “미완료 내용” 테이블 전체를 아래로 교체**:

```markdown
### 미완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| W5-P3 | catch toast | 부분 | 주요 경로에 toast 적용됨. 필요 시 나머지 API 실패 경로 보완. |
```

---

## Phase 5 — 필요한 작업 내용 (교체)

**기존 Phase 5 “필요한 작업 내용”을 아래로 교체**:

```markdown
### 필요한 작업 내용

1. **전역 에러(보완)**  
   - 남은 API/Edge Function 실패 경로에 toast.error() 적용(필요 시).
```

---

## Phase 6 — 작업 완료 내용 (보강)

**Phase 6 “작업 완료 내용”에 아래 행 추가**:

```markdown
| W6-P3 | project-outputs·signed URL | 완료 | verify-payment에서 zip 업로드, 7일 signed URL 생성, send-email downloadUrl 전달. |
| W6-P4 | og-image.png | 완료 | public/og-image.png 배치, index.html og:image 메타 반영. |
```

---

## Phase 6 — 미완료 내용 (교체)

**기존 Phase 6 “미완료 내용” 테이블 전체를 아래로 교체**:

```markdown
### 미완료 내용

| ID | 항목 | 상태 | 비고 |
|----|------|------|------|
| - | (없음) | - | Phase 6 명세 반영 완료. |
```

---

## Phase 6 — 필요한 작업 내용 (교체)

**기존 Phase 6 “필요한 작업 내용”을 아래로 교체**:

```markdown
### 필요한 작업 내용

1. **운영·모니터링(선택)**  
   - GA4 이벤트·에러 로그·Supabase/Resend 사용량 점검 등.
```

---

# Part 3. CURSOR_GUIDE_GAP_CHECK.md 수정안

아래는 **현재 구현 상태**에 맞춰 “요약”과 “주차별 상세”를 고친 내용입니다.  
해당 섹션을 **교체**하면 됩니다.

---

## 요약 (교체)

**기존 “요약” 표를 아래로 교체**:

```markdown
## 요약

| 구분 | 개수 | 비고 |
|------|------|------|
| **가이드 항목** | 20개 프롬프트 + 부록 | W1~W6 주차별 |
| **완전 구현** | 대부분 | W1~W2 전부, W3-P1·W3-P2(.txt/.md+Claude+30초)·W3-P3(5단계+3탭+다시 적용), W4~W6 핵심(PortOne·project-outputs·downloads·CRUD·사용자 탭·og-image 등) |
| **부분 구현** | 3개 | W3-P2(.pptx/.docx·이미지 Vision), W3-P3(Realtime 미적용), 7일 만료 후 재다운로드 API |
| **미구현** | 0개 | - |
```

---

## 1주차 (W1) — 상태만 수정

**W1-P4 행만 아래처럼 수정**:
- 상태: `⚠️ 부분` → `✅ 구현`
- 비고: `"이런 결과물을 만들 수 있어요" 타이틀 적용 완료.`

**“미구현/보완” 문단 삭제.**

---

## 3주차 (W3) — 표 + 미구현 문단 (교체)

**W3-P2 행**:
- 상태: `❌ 미구현` → `⚠️ 부분`
- 비고: `.txt/.md fetch·Claude API·30초 타임아웃·fallback 구현. .pptx/.docx(mammoth)·이미지 Vision 미연동.`

**W3-P3 행**:
- 상태: `⚠️ 부분` → `✅ 구현`
- 비고: `5단계 로딩 UI, 3탭(기본 정보/색상/기능 문구), 인라인 편집·"다시 적용", 30초 초과 재시도. Realtime 미적용(폴링 사용).`

**“미구현” 문단을 아래로 교체**:

```markdown
**부분 구현**
- **W3-P2**: .pptx/.docx 텍스트 추출(mammoth 등), .jpg/.png Claude Vision 미연동. 필요 시 추후 확장.
- **W3-P3**: Realtime 구독 미적용(폴링으로 대체). 선택 사항.
```

---

## 4주차 (W4) — 표 + 미구현 문단 (교체)

**W4-P2 행**:
- 상태: `⚠️ 부분` → `✅ 구현`
- 비고: `아임포트 getToken → payments/{imp_uid} 조회, status=paid·금액 일치 시 orders INSERT.`

**W4-P3 행 비고**:  
`project-outputs zip 업로드, signed URL(7일), send-email downloadUrl, downloads.file_url INSERT 반영.`

**“미구현” 문단을 아래로 교체**:

```markdown
**선택**
- 7일 만료 후 재다운로드 시 새 signed URL 발급 API(미구현 시 클라이언트 JSZip으로 대체 가능).
```

---

## 5주차 (W5) — 표 + 미구현 문단 (교체)

**W5-P2 행**:
- 상태: `⚠️ 부분` → `✅ 구현`
- 비고: `템플릿 CRUD(추가·수정·비활성화), 주문 기간 필터·통계 카드(신규 사용자 포함), 사용자 탭(프로젝트 수·결제 횟수).`

**“미구현” 문단 삭제.**

---

## 6주차 (W6) — 표 + 미구현 문단 (교체)

**W6-P3 행**:
- 상태: `⚠️ 부분` → `✅ 구현`
- 비고: `verify-payment에서 zip 업로드·signed URL(604800초)·send-email downloadUrl 전달.`

**W6-P4 행**:
- 비고: `og-image.png public 배치·og:image 메타 반영 완료.`

**“미구현” 문단 삭제.**

---

## 우선순위 정리 (교체)

**“우선순위 정리” 섹션 전체를 아래로 교체**:

```markdown
## 우선순위 정리 (가이드 완성도 기준)

1. **선택 강화**
   - **W3-P2**: .pptx/.docx(mammoth), .jpg/.png(Claude Vision) 파싱.
   - **W3-P3**: Realtime 구독 적용.
   - **7일 만료 후 재다운로드**: signed URL 재발급 API.

2. **문서**
   - PHASE_COMPLETION_STATUS.md, 본 문서를 구현 상태에 맞게 주기적으로 갱신.
```

---

## 결론 (교체)

**“결론” 섹션 전체를 아래로 교체**:

```markdown
## 결론

- **가이드/Phase 필수 항목은 구현 완료.** (홈 예시 결과물, PortOne 검증, og-image, Claude·파일 파싱·30초, Customize 5단계·3탭·다시 적용, 관리자 CRUD·사용자 탭, project-outputs·signed URL·downloads·이메일 downloadUrl 등)
- **선택적으로 보완할 수 있는 것**: .pptx/.docx·이미지 Vision, Realtime, 7일 만료 후 재다운로드 API.
- **문서**: PHASE_COMPLETION_STATUS.md, CURSOR_GUIDE_GAP_CHECK.md를 위 수정안 또는 최신 구현에 맞게 갱신하면 됨.
```

---

# Part 4. 적용 방법

1. **PHASE_COMPLETION_STATUS.md**  
   - Part 2의 Phase별 지시에 따라 해당 “작업 완료” / “미완료” / “필요한 작업” 블록을 **교체**하거나 **추가**합니다.

2. **CURSOR_GUIDE_GAP_CHECK.md**  
   - Part 3의 “요약”, “주차별 상세”, “우선순위 정리”, “결론”을 해당 위치에 **교체**합니다.

3. **추가 구현**  
   - Part 1의 1~4번은 필요할 때만 순서대로 구현하고, 구현한 항목은 위 문서 수정안처럼 “작업 완료”/비고에 반영하면 됩니다.

이 문서(ADDITIONS_AND_DOC_REVISIONS.md)는 “추가하면 좋은 것”과 “문서 수정안”을 함께 참고하기 위한 정리본입니다.
