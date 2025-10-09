-- 금니깨비 완전한 데이터베이스 스키마
-- 실행 순서대로 테이블을 생성합니다

-- 1. 기존 테이블 확인 및 생성 (profiles, gold_prices는 이미 있음)

-- 2. 매입 신청 테이블
CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL, -- 신청번호 (자동생성: YYYYMMDD001 형식)
  user_id UUID REFERENCES profiles(id) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,

  -- 금니 정보
  items JSONB NOT NULL, -- 금니 품목 정보 [{type: '18k|14k', weight: number, description: string}]
  estimated_total_weight NUMERIC NOT NULL DEFAULT 0, -- 총 예상 중량
  estimated_price NUMERIC NOT NULL DEFAULT 0, -- 예상 매입가
  gold_price_snapshot JSONB NOT NULL, -- 신청 당시 금니 시세 스냅샷

  -- 진행 상태
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
    'received',      -- 접수완료
    'evaluating',    -- 감정중
    'evaluated',     -- 감정완료
    'approved',      -- 승인됨
    'rejected',      -- 거절됨
    'settled',       -- 정산완료
    'paid',          -- 입금완료
    'cancelled'      -- 취소됨
  )),

  -- 감정 결과
  actual_weight NUMERIC, -- 실제 중량
  actual_purity JSONB, -- 실제 순도 정보
  final_price NUMERIC, -- 최종 매입가
  evaluator_notes TEXT, -- 감정사 메모

  -- 배송 정보
  shipping_address TEXT,
  shipping_postal_code TEXT,
  tracking_number TEXT,

  -- 정산 정보
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,

  -- 시간 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evaluated_at TIMESTAMP WITH TIME ZONE,
  settled_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- 3. 정산 테이블
CREATE TABLE IF NOT EXISTS settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement_number TEXT UNIQUE NOT NULL, -- 정산번호 (S + YYYYMMDD + 001)
  purchase_request_id UUID REFERENCES purchase_requests(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,

  -- 정산 금액 정보
  gross_amount NUMERIC NOT NULL, -- 총 매입가
  commission_rate NUMERIC DEFAULT 0, -- 수수료율 (%)
  commission_amount NUMERIC DEFAULT 0, -- 수수료
  tax_amount NUMERIC DEFAULT 0, -- 세금
  net_amount NUMERIC NOT NULL, -- 실제 지급액

  -- 은행 정보
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,

  -- 정산 상태
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending',    -- 정산대기
    'processing', -- 처리중
    'completed',  -- 완료
    'failed',     -- 실패
    'cancelled'   -- 취소
  )),

  -- 정산 처리 정보
  processed_by UUID REFERENCES profiles(id), -- 처리자
  payment_reference TEXT, -- 송금 참조번호
  payment_notes TEXT, -- 정산 메모

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 4. 매일 금니 시세 히스토리 테이블 (기존 gold_prices 확장)
-- gold_prices 테이블은 이미 존재하므로 인덱스만 추가
CREATE INDEX IF NOT EXISTS idx_gold_prices_date ON gold_prices(date DESC);

-- 5. 고객 문의 테이블
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- 대기중
    'in_progress', -- 처리중
    'resolved',   -- 해결됨
    'closed'      -- 종료
  )),
  admin_reply TEXT,
  replied_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  replied_at TIMESTAMP WITH TIME ZONE
);

-- 6. 후기 테이블
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_request_id UUID REFERENCES purchase_requests(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 시스템 설정 테이블
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL, -- 'status_update', 'payment', 'system' 등
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID, -- 관련 purchase_request_id, settlement_id 등
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_purchase_requests_user_id ON purchase_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_at ON purchase_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_user_id ON settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(payment_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- 트리거 함수 - updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON purchase_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 데이터 삽입
-- 시스템 설정 기본값
INSERT INTO system_settings (key, value, description) VALUES
('commission_rate', '2.0', '기본 수수료율 (%)'),
('min_weight', '1.0', '최소 매입 중량 (g)'),
('business_hours', '{"start": "09:00", "end": "18:00", "days": ["mon", "tue", "wed", "thu", "fri"]}', '영업시간'),
('contact_info', '{"phone": "1588-0000", "email": "info@geumnikkaeb.com", "address": "서울특별시 강남구"}', '연락처 정보')
ON CONFLICT (key) DO NOTHING;

-- RLS (Row Level Security) 정책 설정
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 데이터 접근 가능
CREATE POLICY "Admins can access all purchase_requests" ON purchase_requests FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can access own purchase_requests" ON purchase_requests FOR ALL TO authenticated USING (
  user_id = auth.uid()
);

-- 정산 정책
CREATE POLICY "Admins can access all settlements" ON settlements FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can view own settlements" ON settlements FOR SELECT TO authenticated USING (
  user_id = auth.uid()
);

-- 문의 정책
CREATE POLICY "Admins can access all inquiries" ON inquiries FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can access own inquiries" ON inquiries FOR ALL TO authenticated USING (
  user_id = auth.uid() OR user_id IS NULL
);

-- 후기 정책
CREATE POLICY "Everyone can view published reviews" ON reviews FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Users can manage own reviews" ON reviews FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 알림 정책
CREATE POLICY "Users can access own notifications" ON notifications FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can access all notifications" ON notifications FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);