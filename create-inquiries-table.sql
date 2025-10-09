-- 문의 테이블 생성
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) NULL, -- 회원 문의인 경우
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  admin_response TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX idx_inquiries_inquiry_number ON inquiries(inquiry_number);

-- RLS 정책 설정
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 문의를 볼 수 있음
CREATE POLICY "관리자는 모든 문의를 관리할 수 있습니다" ON inquiries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 사용자는 본인의 문의만 볼 수 있음
CREATE POLICY "사용자는 본인의 문의만 볼 수 있습니다" ON inquiries
  FOR SELECT USING (user_id = auth.uid());

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 추가 (선택사항)
INSERT INTO inquiries (inquiry_number, name, phone, message, status) VALUES
('INQ001234', '김고객', '010-1111-2222', '금니 시세가 궁금합니다. 18K 반지 매입 문의드려요.', 'pending'),
('INQ001235', '이회원', '010-3333-4444', '매입 신청 후 언제쯤 연락이 오나요?', 'in_progress'),
('INQ001236', '박문의', '010-5555-6666', '택배로 보내는 주소가 어디인가요?', 'completed');

-- 완료
SELECT 'inquiries 테이블이 성공적으로 생성되었습니다.' as message;