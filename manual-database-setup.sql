-- 금니깨비 데이터베이스 수동 설정
-- Supabase Dashboard SQL Editor에서 하나씩 실행하세요

-- 1. 매입 신청 테이블
CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  items JSONB NOT NULL,
  estimated_total_weight NUMERIC NOT NULL DEFAULT 0,
  estimated_price NUMERIC NOT NULL DEFAULT 0,
  gold_price_snapshot JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
    'received', 'evaluating', 'evaluated', 'approved', 'rejected', 'settled', 'paid', 'cancelled'
  )),
  actual_weight NUMERIC,
  actual_purity JSONB,
  final_price NUMERIC,
  evaluator_notes TEXT,
  shipping_address TEXT,
  shipping_postal_code TEXT,
  tracking_number TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evaluated_at TIMESTAMP WITH TIME ZONE,
  settled_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- 2. 정산 테이블
CREATE TABLE IF NOT EXISTS settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement_number TEXT UNIQUE NOT NULL,
  purchase_request_id UUID REFERENCES purchase_requests(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  gross_amount NUMERIC NOT NULL,
  commission_rate NUMERIC DEFAULT 0,
  commission_amount NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
  )),
  processed_by UUID REFERENCES profiles(id),
  payment_reference TEXT,
  payment_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 3. 후기 테이블
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

-- 4. 시스템 설정 테이블
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_purchase_requests_user_id ON purchase_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_at ON purchase_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_user_id ON settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(payment_status);
CREATE INDEX IF NOT EXISTS idx_gold_prices_date ON gold_prices(date DESC);

-- 6. 샘플 데이터 삽입
INSERT INTO purchase_requests (
  request_number, user_id, customer_name, customer_phone,
  items, estimated_total_weight, estimated_price, status,
  gold_price_snapshot, created_at
) VALUES (
  '20250922001', '27d94e6b-d188-4742-a37d-d4adeb61a871', '김고객', '010-1234-5678',
  '[{"type": "18k", "weight": 5.2, "description": "반지 2개"}]', 5.2, 442000, 'evaluating',
  '{"18k": 85000, "14k": 66000}', NOW() - INTERVAL '1 day'
), (
  '20250921001', '27d94e6b-d188-4742-a37d-d4adeb61a871', '이고객', '010-2345-6789',
  '[{"type": "14k", "weight": 3.8, "description": "목걸이 1개"}]', 3.8, 250800, 'paid',
  '{"18k": 84000, "14k": 65500}', NOW() - INTERVAL '2 days'
), (
  '20250920001', '27d94e6b-d188-4742-a37d-d4adeb61a871', '박고객', '010-3456-7890',
  '[{"type": "18k", "weight": 2.1, "description": "귀걸이"}]', 2.1, 178500, 'settled',
  '{"18k": 85000, "14k": 66000}', NOW() - INTERVAL '3 days'
) ON CONFLICT (request_number) DO NOTHING;

-- 7. 최근 7일간 금니 시세 히스토리 생성
INSERT INTO gold_prices (date, base_price_18k, base_price_14k, updated_by)
VALUES
  (CURRENT_DATE - INTERVAL '1 day', 84500, 65800, NULL),
  (CURRENT_DATE - INTERVAL '2 days', 86200, 67100, NULL),
  (CURRENT_DATE - INTERVAL '3 days', 85800, 66800, NULL),
  (CURRENT_DATE - INTERVAL '4 days', 83900, 65200, NULL),
  (CURRENT_DATE - INTERVAL '5 days', 85300, 66400, NULL),
  (CURRENT_DATE - INTERVAL '6 days', 86800, 67800, NULL),
  (CURRENT_DATE - INTERVAL '7 days', 84200, 65600, NULL)
ON CONFLICT (date) DO NOTHING;

-- 8. 시스템 설정 기본값
INSERT INTO system_settings (key, value, description) VALUES
('commission_rate', '"2.0"', '기본 수수료율 (%)'),
('min_weight', '"1.0"', '최소 매입 중량 (g)'),
('business_hours', '{"start": "09:00", "end": "18:00", "days": ["mon", "tue", "wed", "thu", "fri"]}', '영업시간'),
('contact_info', '{"phone": "1588-0000", "email": "info@geumnikkaeb.com", "address": "서울특별시 강남구"}', '연락처 정보')
ON CONFLICT (key) DO NOTHING;