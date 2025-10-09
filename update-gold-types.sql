-- 금니 종류 테이블 구조 수정
-- 기존: 14k, 18k 만 있음
-- 수정: 인레이, 포세린, 크라운PT, 크라운ST, 크라운AT

-- 1. 기존 테이블 삭제 및 재생성
DROP TABLE IF EXISTS gold_prices CASCADE;

CREATE TABLE gold_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,

  -- 5가지 금니 종류별 가격
  price_inlay NUMERIC NOT NULL DEFAULT 161670,      -- 인레이
  price_porcelain NUMERIC NOT NULL DEFAULT 169890,   -- 포세린
  price_crown_pt NUMERIC NOT NULL DEFAULT 144310,    -- 크라운PT
  price_crown_st NUMERIC NOT NULL DEFAULT 112350,    -- 크라운ST
  price_crown_at NUMERIC NOT NULL DEFAULT 91340,     -- 크라운AT

  source TEXT DEFAULT 'manual',
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX idx_gold_prices_date ON gold_prices(date DESC);

-- 3. RLS 정책 설정
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gold prices" ON gold_prices
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gold prices" ON gold_prices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 4. 오늘 날짜 기본 데이터 삽입
INSERT INTO gold_prices (
  date,
  price_inlay,
  price_porcelain,
  price_crown_pt,
  price_crown_st,
  price_crown_at,
  source
)
VALUES (
  CURRENT_DATE,
  161670,
  169890,
  144310,
  112350,
  91340,
  'manual'
)
ON CONFLICT (date) DO UPDATE SET
  price_inlay = EXCLUDED.price_inlay,
  price_porcelain = EXCLUDED.price_porcelain,
  price_crown_pt = EXCLUDED.price_crown_pt,
  price_crown_st = EXCLUDED.price_crown_st,
  price_crown_at = EXCLUDED.price_crown_at,
  updated_at = NOW();
