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

이름은 여기 적는다. 값은 적지 않는다. 플랫폼이 넣는 값과 직접 넣는 값을 구분한다.

| 이름 | 구분 | 없을 때 |
|------|------|---------|
| `SUPABASE_URL` | platform provided. Edge 런타임이 넣음 | 함수가 기동 설정을 못 함 |
| `SUPABASE_SERVICE_ROLE_KEY` | platform provided. Edge 런타임이 넣음 | DB와 Storage 호출 불가 |
| `SUPABASE_ANON_KEY` | platform provided. `submit-contact`가 로그인 사용자를 구분할 때 사용 | 문의는 비로그인으로 저장 |
| `ANTHROPIC_API_KEY` | optional. `ai-customize` | 키 없이 기본 문구로 HTML을 만듦 |
| `PORTONE_IMP_KEY` 또는 `IMP_KEY` | required for payment verification and refund approval | 결제 주문 없음. 환불 승인 없음. 환불 거절은 가능 |
| `PORTONE_IMP_SECRET` 또는 `IMP_SECRET` | required for payment verification and refund approval | 위와 같음 |
| `RESEND_API_KEY` | optional. `send-email` | 메일을 건너뛰고 성공으로 반환 |
| `RESEND_FROM` | required for actual send when `RESEND_API_KEY` is set | `EMAIL_NOT_CONFIGURED`. 발송하지 않음 |
| `ADMIN_EMAIL` | required for the refund-request alert only | 환불 접수 메일만 건너뜀 |

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

- **project-uploads**: private. 화면은 경로만 저장한다.
- **project-outputs**: private. 결제 후 `{projectId}/website.zip`.
- **thumbnails**: public.
- **refund-attachments**: private.
- **engagement-files**: private. Studio 파일. Edge Function은 쓰지 않는다.
