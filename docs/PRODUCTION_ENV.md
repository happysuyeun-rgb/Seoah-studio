# 프로덕션 환경 변수

배포 시 설정할 환경 변수 목록입니다.

## Vercel (프론트엔드)

| 변수 | 설명 | 필수 |
|------|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `VITE_PORTONE_IMP_CODE` | 아임포트(포트원) 가맹점 식별코드 | ✅ |
| `VITE_GA4_MEASUREMENT_ID` | Google Analytics 4 측정 ID (예: G-XXXXXXXXXX) | 선택 |

- Vercel 대시보드 → 프로젝트 → Settings → Environment Variables에서 등록.
- 프리뷰/프로덕션 환경별로 동일하게 넣거나, Production에만 GA4를 넣을 수 있음.

## Supabase Edge Function Secrets

Edge Function에서 사용하는 시크릿은 Supabase 대시보드에서 설정합니다.

| 시크릿 | 사용처 | 필수 |
|--------|--------|------|
| `ANTHROPIC_API_KEY` | ai-customize (Claude API 연동 시) | 선택 (미설정 시 폴백 데이터 사용) |
| `RESEND_API_KEY` | send-email (결제 완료·문의·환불 알림 이메일) | 선택 |
| `PORTONE_IMP_KEY` | verify-payment, process-refund (아임포트 REST API 키) | 결제·환불 시 권장 |
| `PORTONE_IMP_SECRET` | verify-payment, process-refund (아임포트 REST API Secret) | 결제·환불 시 권장 |
| `ADMIN_EMAIL` | send-email (환불 요청 접수 알림 수신 주소) | 환불 알림 필요 시 필수, 미설정 시 건너뜀 |

- Supabase 대시보드 → Project Settings → Edge Functions → Secrets.

## 로컬 개발 (.env.local)

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_PORTONE_IMP_CODE=imp12345678
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

- `.env.local`은 Git에 올리지 마세요 (이미 .gitignore에 포함됨).

## Supabase Storage 버킷

- **project-uploads**: 업로드 파일 (private 권장)
- **project-outputs**: 결제 완료 시 생성되는 zip (private). verify-payment에서 `{projectId}/website.zip` 업로드 후 7일 signed URL 발급.
- **thumbnails**: 템플릿 썸네일 (public). 관리자에서 업로드 시 사용.
- **refund-attachments**: 환불 요청 첨부파일 (private). RefundRequestPage에서 업로드, submit-refund-request 연동.
