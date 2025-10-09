-- 기존 테이블들을 삭제하고 다시 생성
-- 주의: 기존 데이터가 모두 삭제됩니다!

-- 의존성 순서에 따라 테이블 삭제
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS purchase_requests CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS gold_prices CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 프로필 테이블 생성 (가장 먼저 - 다른 테이블에서 참조)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  agree_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 금시세 테이블 생성
CREATE TABLE gold_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  price_24k DECIMAL(10,2) NOT NULL,
  price_18k DECIMAL(10,2) NOT NULL,
  price_14k DECIMAL(10,2) NOT NULL,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 문의 테이블 생성
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  admin_response TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 매입 신청 테이블 생성
CREATE TABLE purchase_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  item_type TEXT NOT NULL,
  estimated_weight DECIMAL(8,2),
  item_description TEXT,
  photos TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'evaluating', 'completed', 'cancelled')),
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  notes TEXT,
  user_id UUID REFERENCES profiles(id) NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 정산 테이블 생성
CREATE TABLE settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement_number TEXT UNIQUE NOT NULL,
  purchase_request_id UUID REFERENCES purchase_requests(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 후기 테이블 생성
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_request_id UUID REFERENCES purchase_requests(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_gold_prices_date ON gold_prices(date);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX idx_inquiries_inquiry_number ON inquiries(inquiry_number);
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX idx_purchase_requests_user_id ON purchase_requests(user_id);
CREATE INDEX idx_purchase_requests_created_at ON purchase_requests(created_at);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_purchase_request_id ON settlements(purchase_request_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_purchase_request_id ON reviews(purchase_request_id);

-- RLS 정책 설정
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 금시세 정책 (모든 사용자 읽기 가능, 관리자만 쓰기)
CREATE POLICY "모든 사용자가 금시세를 조회할 수 있습니다" ON gold_prices
  FOR SELECT USING (true);

CREATE POLICY "관리자만 금시세를 관리할 수 있습니다" ON gold_prices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 문의 정책
CREATE POLICY "관리자는 모든 문의를 관리할 수 있습니다" ON inquiries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "사용자는 본인의 문의만 볼 수 있습니다" ON inquiries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "누구나 문의를 등록할 수 있습니다" ON inquiries
  FOR INSERT WITH CHECK (true);

-- 매입 신청 정책
CREATE POLICY "관리자는 모든 매입 신청을 관리할 수 있습니다" ON purchase_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "사용자는 본인의 매입 신청만 볼 수 있습니다" ON purchase_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "로그인한 사용자는 매입 신청을 할 수 있습니다" ON purchase_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 정산 정책
CREATE POLICY "관리자는 모든 정산을 관리할 수 있습니다" ON settlements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "사용자는 본인의 정산만 볼 수 있습니다" ON settlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM purchase_requests pr
      WHERE pr.id = settlements.purchase_request_id
      AND pr.user_id = auth.uid()
    )
  );

-- 후기 정책
CREATE POLICY "관리자는 모든 후기를 관리할 수 있습니다" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "모든 사용자가 공개 후기를 볼 수 있습니다" ON reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "사용자는 본인의 후기를 관리할 수 있습니다" ON reviews
  FOR ALL USING (user_id = auth.uid());

-- 프로필 정책
CREATE POLICY "관리자는 모든 프로필을 관리할 수 있습니다" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

CREATE POLICY "사용자는 본인의 프로필을 관리할 수 있습니다" ON profiles
  FOR ALL USING (id = auth.uid());

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_gold_prices_updated_at
  BEFORE UPDATE ON gold_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at
  BEFORE UPDATE ON purchase_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settlements_updated_at
  BEFORE UPDATE ON settlements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 추가
INSERT INTO gold_prices (date, price_24k, price_18k, price_14k, source) VALUES
('2024-01-15', 85000, 64000, 50000, 'manual');

INSERT INTO inquiries (inquiry_number, name, phone, message, status) VALUES
('INQ001234', '김고객', '010-1111-2222', '금니 시세가 궁금합니다. 18K 반지 매입 문의드려요.', 'pending'),
('INQ001235', '이회원', '010-3333-4444', '매입 신청 후 언제쯤 연락이 오나요?', 'in_progress'),
('INQ001236', '박문의', '010-5555-6666', '택배로 보내는 주소가 어디인가요?', 'completed');

-- 완료 메시지
SELECT '모든 테이블이 성공적으로 재생성되었습니다.' as message;