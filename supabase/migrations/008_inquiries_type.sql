-- 문의 유형 컬럼 추가 (1:1 문의)
ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS type text
DEFAULT '기타'
CHECK (type IN ('서비스 문의','결제 / 환불','파일 / 다운로드','AI 커스텀 오류','기타'));
