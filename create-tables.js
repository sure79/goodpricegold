const https = require('https');

const SUPABASE_URL = 'https://dppvroecyfwmidtjxxup.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcHZyb2VjeWZ3bWlkdGp4eHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ5OTY4NSwiZXhwIjoyMDc0MDc1Njg1fQ.fH6mvxOI1BnuL9adYWhYsZjU5nrYvbs-1lR5nrrvHCY';

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'dppvroecyfwmidtjxxup.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function createTables() {
  console.log('🚀 Supabase 테이블 생성 시작...');

  try {
    // 1. profiles 테이블 생성
    console.log('📝 profiles 테이블 생성...');
    await executeSQL(`
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
    `);
    console.log('✅ profiles 테이블 생성 완료');

    // 2. gold_prices 테이블 생성
    console.log('📝 gold_prices 테이블 생성...');
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS gold_prices (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        base_price_18k NUMERIC NOT NULL,
        base_price_14k NUMERIC NOT NULL,
        updated_by UUID REFERENCES profiles(id),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ gold_prices 테이블 생성 완료');

    // 3. 기본 금 시세 데이터 삽입
    console.log('📝 기본 금 시세 데이터 삽입...');
    await executeSQL(`
      INSERT INTO gold_prices (date, base_price_18k, base_price_14k, updated_by)
      VALUES (CURRENT_DATE, 85000, 66000, NULL)
      ON CONFLICT (date) DO NOTHING;
    `);
    console.log('✅ 기본 금 시세 데이터 삽입 완료');

    console.log('🎉 모든 테이블 생성 완료!');

  } catch (error) {
    console.error('❌ 테이블 생성 실패:', error.message);

    // 더 간단한 방법으로 시도
    console.log('🔄 다른 방법으로 재시도...');

    try {
      // Supabase REST API를 통해 테이블 확인
      const response = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'dppvroecyfwmidtjxxup.supabase.co',
          port: 443,
          path: '/rest/v1/profiles',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY
          }
        };

        const req = https.request(options, (res) => {
          resolve(res.statusCode);
        });

        req.on('error', reject);
        req.end();
      });

      if (response === 404) {
        console.log('❌ profiles 테이블이 존재하지 않습니다.');
        console.log('📋 Supabase Dashboard에서 수동으로 SQL을 실행해야 합니다:');
        console.log('https://supabase.com/dashboard → SQL Editor');
        console.log(`
1. profiles 테이블:
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

2. gold_prices 테이블:
CREATE TABLE IF NOT EXISTS gold_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  base_price_18k NUMERIC NOT NULL,
  base_price_14k NUMERIC NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

3. 기본 데이터:
INSERT INTO gold_prices (date, base_price_18k, base_price_14k, updated_by)
VALUES (CURRENT_DATE, 85000, 66000, NULL)
ON CONFLICT (date) DO NOTHING;
        `);
      } else {
        console.log('✅ profiles 테이블이 이미 존재합니다!');
      }

    } catch (checkError) {
      console.error('❌ 테이블 확인 실패:', checkError.message);
    }
  }
}

createTables();