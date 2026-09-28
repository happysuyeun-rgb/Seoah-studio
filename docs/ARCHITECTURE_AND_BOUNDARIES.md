# Architecture and Boundaries

기준: GitHub `main` `8e2feac` 이후 Step 9 설계. 코드의 domain type이 이 문서와 다르면 코드가 우선이고, 이 문서를 다시 맞춘다.

이 문서는 설계다. Migration, link, RLS 적용, Storage 생성, Edge deploy, Vercel env 변경을 지시하지 않는다.

## 두 개의 제품 경계

SEOAH.STUDIO는 한 앱 안에 두 도메인을 둔다.

| 영역 | 고객이 보는 것 | 데이터 |
|------|----------------|--------|
| Legacy Commerce | Ready 템플릿 구매 | `templates`, `projects`, `orders`, `downloads`, `refund_requests` |
| New Studio | 의뢰부터 제작, 이후 지원 | `leads` 이후의 Studio 테이블 |

`public.projects`는 템플릿 커스터마이징 세션이다. Studio 고객 프로젝트로 쓰지 않는다. Studio 프로젝트의 이름은 `engagements`다.

`orders`는 Commerce 결제다. Studio 계약금, 중도금, 잔금은 `studio_payments`다. 계약금은 Engagement보다 먼저 계약에 붙을 수 있다. 두 결제는 연결하지 않는다. `engagement_payments`라는 이름은 쓰지 않는다.

## 신원

Auth user가 있으면 `public.users` 한 행이 계정이다. 별도 `customers` 테이블은 만들지 않는다.

`account_type`은 `individual` 또는 `business`다. `is_admin`은 계정 유형과 별개다. Business 가입은 Organization을 만들지 않는다.

Guest는 계정이 없다. Contact 문의와 Lead는 이메일로 남길 수 있고, 이후 같은 이메일의 계정에 연결할 수 있다.

## 앱 경계

- 공개 사이트: `/`와 마케팅 경로. GNB, Footer, Chatbot, 맨 위로.
- MY SEOA: `/my`와 `/my/*`. 고객용 Studio 화면. 내부 메모, 내부 메시지, admin audience를 그리지 않는다.
- Legacy 구매: `/templates`, `/project/*`, `/payment/*`, `/mypage`.
- Admin: `/admin`은 기존 Commerce 관리. `/admin/dashboard` 이하는 새 운영 화면. 권한은 `users.is_admin`만 사용한다.

## 공식 데이터베이스

| 항목 | 값 |
|------|-----|
| 이름 | SEOAH.STUDIO |
| Ref | `qzvxypynlluqpdpmsstu` |
| Region | ap-northeast-2 |
| public schema | EMPTY |
| 연결 | 하지 않음 |

현재 운영 사이트의 env를 이 ref로 바꾸지 않는다. 이 프로젝트에는 Legacy 데이터도 Studio 데이터도 없다.

## 아직 하지 않는 것

SaaS Organization, Workspace, Care 구독, Products 통합 테이블, 전자서명, PortOne Studio 결제, Realtime 메시지.
