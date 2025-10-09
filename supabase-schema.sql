-- 금니깨비 Supabase 데이터베이스 스키마
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  address TEXT,
  postal_code TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  total_transactions INTEGER DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 금 시세 테이블
CREATE TABLE IF NOT EXISTS gold_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  base_price_18k NUMERIC NOT NULL,
  base_price_14k NUMERIC NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 매입 신청 테이블
CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  request_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  postal_code TEXT,
  items JSONB NOT NULL, -- GoldItem[] 배열
  estimated_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'shipped', 'received', 'evaluating', 'confirmed', 'paid')
  ),
  tracking_number TEXT,
  shipping_carrier TEXT,
  received_date TIMESTAMP WITH TIME ZONE,
  evaluation_notes TEXT,
  evaluation_images TEXT[], -- 이미지 URL 배열
  final_weight NUMERIC,
  final_price NUMERIC,
  price_difference NUMERIC,
  admin_notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 상태 변경 이력 테이블
CREATE TABLE IF NOT EXISTS status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES purchase_requests(id) NOT NULL,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 정산 테이블
CREATE TABLE IF NOT EXISTS settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES purchase_requests(id) NOT NULL,
  settlement_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  final_amount NUMERIC NOT NULL,
  deduction_amount NUMERIC DEFAULT 0,
  deduction_reason TEXT,
  net_amount NUMERIC NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (
    payment_method IN ('bank_transfer', 'cash')
  ),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'processing', 'completed', 'failed')
  ),
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_proof_url TEXT,
  processed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 리뷰 테이블
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES purchase_requests(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  images TEXT[], -- 이미지 URL 배열
  is_visible BOOLEAN DEFAULT TRUE,
  admin_reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('status_change', 'settlement', 'review_reply')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_gold_prices_date ON gold_prices(date);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_user_id ON purchase_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_request_number ON purchase_requests(request_number);
CREATE INDEX IF NOT EXISTS idx_status_history_request_id ON status_history(request_id);
CREATE INDEX IF NOT EXISTS idx_settlements_user_id ON settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_request_id ON settlements(request_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_request_id ON reviews(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성

-- 프로필: 본인 정보만 조회/수정 가능, 관리자는 모든 프로필 조회 가능
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 금 시세: 모든 사용자 조회 가능, 관리자만 수정 가능
CREATE POLICY "Anyone can view gold prices" ON gold_prices
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gold prices" ON gold_prices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 매입 신청: 본인 신청만 조회/생성 가능, 관리자는 모든 신청 관리 가능
CREATE POLICY "Users can view own requests" ON purchase_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create requests" ON purchase_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all requests" ON purchase_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 상태 이력: 해당 신청의 소유자나 관리자만 조회 가능
CREATE POLICY "Users can view own request history" ON status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM purchase_requests
      WHERE id = request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all history" ON status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create history" ON status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 정산: 본인 정산만 조회 가능, 관리자는 모든 정산 관리 가능
CREATE POLICY "Users can view own settlements" ON settlements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all settlements" ON settlements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 리뷰: 본인 리뷰만 생성/수정 가능, 공개된 리뷰는 모든 사용자 조회 가능
CREATE POLICY "Anyone can view public reviews" ON reviews
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own reviews" ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 알림: 본인 알림만 조회/수정 가능
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- 함수: 신청 번호 자동 생성
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  sequence_num TEXT;
BEGIN
  current_date_str := TO_CHAR(NOW(), 'YYYYMMDD');

  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0') INTO sequence_num
  FROM purchase_requests
  WHERE request_number LIKE current_date_str || '%';

  RETURN current_date_str || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- 함수: 정산 번호 자동 생성
CREATE OR REPLACE FUNCTION generate_settlement_number()
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  sequence_num TEXT;
BEGIN
  current_date_str := TO_CHAR(NOW(), 'YYYYMMDD');

  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0') INTO sequence_num
  FROM settlements
  WHERE settlement_number LIKE 'S' || current_date_str || '%';

  RETURN 'S' || current_date_str || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 신청 번호 자동 생성
CREATE OR REPLACE FUNCTION set_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := generate_request_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_request_number
  BEFORE INSERT ON purchase_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_request_number();

-- 트리거: 정산 번호 자동 생성
CREATE OR REPLACE FUNCTION set_settlement_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.settlement_number IS NULL OR NEW.settlement_number = '' THEN
    NEW.settlement_number := generate_settlement_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_settlement_number
  BEFORE INSERT ON settlements
  FOR EACH ROW
  EXECUTE FUNCTION set_settlement_number();

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_purchase_requests_updated_at
  BEFORE UPDATE ON purchase_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 기본 금 시세 데이터 삽입
INSERT INTO gold_prices (date, base_price_18k, base_price_14k, updated_by)
VALUES (CURRENT_DATE, 85000, 66000, NULL)
ON CONFLICT (date) DO NOTHING;

-- 완료 메시지
SELECT 'Supabase 스키마 설정이 완료되었습니다!' as message;