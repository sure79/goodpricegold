-- 모든 사용자 데이터 완전 삭제

-- 1. 프로필 테이블 모든 데이터 삭제
DELETE FROM profiles;

-- 2. 인증 사용자 데이터 삭제 (Supabase Auth)
DELETE FROM auth.users;

-- 3. 인증 관련 세션 및 토큰 정리
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.audit_log_entries;

-- 4. 기타 인증 관련 테이블 정리
DELETE FROM auth.identities;
DELETE FROM auth.mfa_amr_claims;
DELETE FROM auth.mfa_challenges;
DELETE FROM auth.mfa_factors;
DELETE FROM auth.one_time_tokens;
DELETE FROM auth.saml_providers;
DELETE FROM auth.saml_relay_states;
DELETE FROM auth.sso_domains;
DELETE FROM auth.sso_providers;

-- 5. 테이블 시퀀스 리셋 (ID 재시작)
-- Supabase에서 UUID 사용하므로 시퀀스 리셋은 불필요

-- 완료 메시지
SELECT '모든 사용자 데이터가 삭제되었습니다. 이제 새로 회원가입할 수 있습니다.' as message;