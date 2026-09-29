# SEOAH.STUDIO

AI로 랜딩 템플릿을 코드까지 커스터마이징하는 템플릿 SaaS (Phase 1)

## 스택

- React 18 + TypeScript + Vite
- TailwindCSS
- Supabase (Auth, DB, Storage, Edge Functions)
- React Router v6, Zustand, React Query
- PortOne(아임포트) 결제

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # Supabase URL/Key, PortOne IMP_CODE 입력
npm run dev
```

## 환경 변수 (.env.local)

| 변수 | 설명 |
|------|------|
| VITE_SUPABASE_URL | Supabase 프로젝트 URL |
| VITE_SUPABASE_ANON_KEY | Supabase anon key |
| VITE_PORTONE_IMP_CODE | 아임포트 가맹점 식별코드 |

## Supabase 설정

스키마는 `supabase/migrations`의 `001`부터 `030`까지가 기준이다. SQL Editor에 migration을 붙여 넣어 부트스트랩하지 않는다. 적용은 Supabase CLI migration으로 한다. 공식 프로젝트에 어디까지 적용됐는지는 `docs/PROJECT_STATUS_2026-09-28.md`와 `docs/DEPLOYMENT_MIGRATION_RUNBOOK.md`를 본다.

Storage bucket은 migration이 만든다. `project-uploads`, `project-outputs`, `thumbnails`, `refund-attachments`, `engagement-files`의 5개이고 `thumbnails`만 public이다.

Edge Function은 9개다. `ai-customize`, `delete-account`, `get-download-url`, `process-refund`, `send-email`, `submit-refund-request`, `verify-payment`, `submit-contact`, `submit-chatbot-inquiry`. 게이트웨이 JWT 설정은 `supabase/config.toml`에 있다.

이메일 가입이 기본이다. Google 또는 Kakao OAuth는 필요하면 그때 따로 켠다.

## 라우트

| 경로 | 설명 |
|------|------|
| / | 홈 (카테고리 3종, CTA) |
| /login | 로그인 (이메일. OAuth는 별도 설정) |
| /auth/callback | OAuth 콜백 |
| /templates/:category | 템플릿 갤러리 |
| /templates/detail/:id | 템플릿 상세(iframe 미리보기) |
| /project/upload | 자료 업로드 |
| /project/customize | AI 커스터마이징 결과 |
| /project/preview | 최종 미리보기 |
| /project/checkout | 결제 |
| /payment/success | 결제 완료 + HTML zip 다운로드 |
| /payment/fail | 결제 실패 |
| /mypage | 마이페이지 |
| /admin | 관리자 (is_admin 사용자만) |

## Phase 진행 현황

- **단계별 완료/미완료/필요 작업** 정리: [docs/PHASE_COMPLETION_STATUS.md](docs/PHASE_COMPLETION_STATUS.md)  
  - Phase 1~6별 “작업 완료 내용”, “미완료 내용”, “필요한 작업 내용”을 정리해 두었습니다.  
  - Phase를 완료할 때마다 해당 문서를 갱신해 사용하면 됩니다.

## Phase 2/3 예정

- Vercel URL 배포, PDF/PPT/Figma 변환
- Claude API 연동으로 실제 AI 커스터마이징
- Resend 이메일 발송, GA4, OG 메타
