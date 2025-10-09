-- 긴급 인증 시스템 완전 초기화

-- 1. 모든 auth 관련 데이터 완전 삭제
TRUNCATE auth.audit_log_entries;
TRUNCATE auth.refresh_tokens;
TRUNCATE auth.instances;
TRUNCATE auth.sessions;
TRUNCATE auth.mfa_amr_claims;
TRUNCATE auth.mfa_challenges;
TRUNCATE auth.mfa_factors;
TRUNCATE auth.identities;
TRUNCATE auth.users CASCADE;

-- 2. profiles 테이블 완전 삭제
TRUNCATE profiles CASCADE;

-- 3. 테이블 재생성 (완전히 새로 시작)
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'customer',
  agree_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS 완전 비활성화
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 5. 시퀀스 및 제약조건 초기화
-- UUID는 시퀀스가 없으므로 생략

-- 6. 테스트 데이터 추가
INSERT INTO profiles (id, name, phone, email, role) VALUES
('12345678-1234-1234-1234-123456789012', '테스트사용자', '010-0000-0000', 'test@test.com', 'customer');

-- 완료 메시지
SELECT '인증 시스템이 완전히 초기화되었습니다. 이제 새로운 회원가입이 가능합니다.' as message;