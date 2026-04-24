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

1. **SQL 실행**  
   `supabase/migrations/001_initial_schema.sql` → 대시보드 SQL Editor에서 실행  
   (또는 Supabase CLI: `supabase db push`)

2. **시드 템플릿**  
   `supabase/seed_templates.sql` 실행 (선택)

3. **Auth**  
   Authentication → Providers에서 Kakao, Google OAuth 활성화 및 키 설정

4. **Storage**  
   버킷 생성: `project-uploads` (private), `project-outputs` (private), `thumbnails` (public)

5. **Edge Functions**  
   - `ai-customize`: 프로젝트 입력 기반 AI 커스터마이징 (현재 폴백 HTML 반환)  
   - `verify-payment`: 결제 검증 및 orders INSERT  

   배포: `supabase functions deploy ai-customize`, `supabase functions deploy verify-payment`

## 라우트

| 경로 | 설명 |
|------|------|
| / | 홈 (카테고리 3종, CTA) |
| /login | 로그인 (카카오/구글) |
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
