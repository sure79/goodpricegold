-- 즉시 문제 해결을 위한 간단한 SQL

-- 1. 모든 기존 정책 삭제
DROP POLICY IF EXISTS "관리자는 모든 프로필을 관리할 수 있습니다" ON profiles;
DROP POLICY IF EXISTS "사용자는 본인의 프로필을 관리할 수 있습니다" ON profiles;
DROP POLICY IF EXISTS "누구나 프로필을 생성할 수 있습니다" ON profiles;
DROP POLICY IF EXISTS "관리자만 금시세를 관리할 수 있습니다" ON gold_prices;
DROP POLICY IF EXISTS "모든 사용자가 금시세를 조회할 수 있습니다" ON gold_prices;
DROP POLICY IF EXISTS "관리자는 모든 문의를 관리할 수 있습니다" ON inquiries;
DROP POLICY IF EXISTS "사용자는 본인의 문의만 볼 수 있습니다" ON inquiries;
DROP POLICY IF EXISTS "누구나 문의를 등록할 수 있습니다" ON inquiries;

-- 2. RLS 비활성화 (임시)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE gold_prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE settlements DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- 3. 기본 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  agree_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gold_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  price_24k DECIMAL(10,2) NOT NULL,
  price_18k DECIMAL(10,2) NOT NULL,
  price_14k DECIMAL(10,2) NOT NULL,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 기본 데이터 추가 (중복 무시)
INSERT INTO gold_prices (date, price_24k, price_18k, price_14k, source)
SELECT '2024-01-15', 85000, 64000, 50000, 'manual'
WHERE NOT EXISTS (SELECT 1 FROM gold_prices WHERE date = '2024-01-15');

-- 완료 메시지
SELECT '임시 문제 해결 완료. RLS가 비활성화되었습니다.' as message;