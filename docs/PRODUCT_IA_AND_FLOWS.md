# Product IA and Flows

기준: Step 5–8 UI와 Step 9 데이터 결정. 화면이 저장된다고 말하지 않는다.

## Studio 흐름

```text
Public
→ Project Request
→ Lead
→ Proposal
→ Contract
→ Deposit
→ Engagement
→ Intake
→ Planning
→ Design
→ Development
→ QA
→ Review
→ Revision / Approval
→ Launch
→ Completed
→ Care / Support
```

Project Request는 Lead를 만든다. 짧은 Contact 문의는 Lead가 아니다.

Proposal은 보내기 전까지 Draft다. 고객 승인 상태가 `APPROVED`다.

Contract 동의는 체크, 이름, 시각의 기록이다. 이번 모델은 그 기록을 담을 자리만 정하고, 전자서명은 만들지 않는다.

Engagement는 아래 셋이 모두 끝난 뒤에만 생긴다.

- Proposal `APPROVED`
- Contract `AGREED`
- Deposit `PAID`

하나라도 없으면 Engagement 행을 만들지 않는다. 화면에서 미리 보여 주는 준비 상태와, 행이 존재하는 상태를 구분한다.

Intake가 없으면 Ready to Start를 만족한 것으로 보지 않는다. Intake는 있는데 필수 항목이 0개면, 필수 승인 조건은 충족이다. 이 계산은 `meetsReadyToStart`와 같다.

고객 진행 단계는 준비, 기획, 디자인, 제작, 검토, 완료다. 일시중지와 취소는 단계가 아니다. 그 경우 마지막으로 저장한 `progress_stage`를 유지한다.

Care와 Support는 완료 이후의 운영이다. Care 구독 테이블과 Support 티켓 테이블은 첫 스키마에 넣지 않는다.

## Ready Commerce 흐름

```text
Ready
→ Template
→ Customize (projects)
→ Order
→ Payment
→ Download
→ Refund
```

Template은 `templates`다. 맞춤 세션은 `projects`다. 결제와 다운로드는 `orders`, `downloads`다. 환불은 `refund_requests`와 `orders`의 환불 상태다.

이 흐름은 Studio Lead나 Engagement를 만들지 않는다.

## 문의의 경계

| 입력 | 저장 위치 | 의미 |
|------|-----------|------|
| Contact 폼 | `inquiries` | 판매 전 짧은 문의. Guest 가능 |
| Project Request | `leads` | 제작 의뢰. Guest 가능 |
| Legacy 1:1 문의 | `inquiries` | 로그인 사용자의 기존 문의. 상태 `pending` / `replied` |
| 챗봇 | `chatbot_inquiries` | 챗봇 접수. Support 티켓이 아님 |
| 프로젝트 지원 | 나중에 `support_tickets` | 구매 또는 프로젝트 이후 지원 |

Contact를 자동으로 Lead로 복제하지 않는다. 운영자가 상담으로 올릴 때만 Lead를 만든다.

## 고객 화면과 관리 화면

고객은 MY SEOA에서 자신의 Proposal, Contract, Engagement를 본다. Draft Proposal, 내부 메모, 내부 메시지, admin audience 파일과 활동, `DRAFT` / `UNDER_REVIEW` 변경 요청은 고객 화면에 없다.

관리자는 `/admin/dashboard`에서 기존 Lead, Proposal, Contract, Engagement 화면으로 이동한다. Orders와 Chatbot과 Templates는 Legacy `/admin`에 둔다.

## 아직 화면만 있는 운영 구역

Customers, Products, Payments 통합, Care, SaaS, Support, Content, Analytics, Settings는 빈 운영 자리다. 첫 데이터베이스 마이그레이션의 테이블이 아니다.
