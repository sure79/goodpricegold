-- 금니깨비 데이터베이스 수정된 설정
-- Supabase Dashboard SQL Editor에서 하나씩 실행하세요

-- 1. 매입 신청 테이블 (수정된 버전)
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
  final_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_purchase_requests_user_id ON purchase_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_at ON purchase_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_user_id ON settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(payment_status);
CREATE INDEX IF NOT EXISTS idx_gold_prices_date ON gold_prices(date DESC);

-- 5. 최근 7일간 금니 시세 히스토리 생성
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