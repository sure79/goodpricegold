const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dppvroecyfwmidtjxxup.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcHZyb2VjeWZ3bWlkdGp4eHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ5OTY4NSwiZXhwIjoyMDc0MDc1Njg1fQ.fH6mvxOI1BnuL9adYWhYsZjU5nrYvbs-1lR5nrrvHCY'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function setupDatabase() {
  console.log('🚀 Supabase 데이터베이스 스키마 설정 시작...')

  try {
    // 1. 프로필 테이블 생성
    console.log('📝 profiles 테이블 생성...')
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    if (profilesError) {
      console.error('❌ profiles 테이블 생성 실패:', profilesError)
    } else {
      console.log('✅ profiles 테이블 생성 완료')
    }

    // 2. 금 시세 테이블 생성
    console.log('📝 gold_prices 테이블 생성...')
    const { error: goldPricesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS gold_prices (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          date DATE NOT NULL UNIQUE,
          base_price_18k NUMERIC NOT NULL,
          base_price_14k NUMERIC NOT NULL,
          updated_by UUID REFERENCES profiles(id),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (goldPricesError) {
      console.error('❌ gold_prices 테이블 생성 실패:', goldPricesError)
    } else {
      console.log('✅ gold_prices 테이블 생성 완료')
    }

    // 3. 매입 신청 테이블 생성
    console.log('📝 purchase_requests 테이블 생성...')
    const { error: requestsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS purchase_requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES profiles(id) NOT NULL,
          request_number TEXT NOT NULL UNIQUE,
          customer_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          address TEXT NOT NULL,
          postal_code TEXT,
          items JSONB NOT NULL,
          estimated_price NUMERIC NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (
            status IN ('pending', 'shipped', 'received', 'evaluating', 'confirmed', 'paid')
          ),
          tracking_number TEXT,
          shipping_carrier TEXT,
          received_date TIMESTAMP WITH TIME ZONE,
          evaluation_notes TEXT,
          evaluation_images TEXT[],
          final_weight NUMERIC,
          final_price NUMERIC,
          price_difference NUMERIC,
          admin_notes TEXT,
          assigned_to UUID REFERENCES profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (requestsError) {
      console.error('❌ purchase_requests 테이블 생성 실패:', requestsError)
    } else {
      console.log('✅ purchase_requests 테이블 생성 완료')
    }

    // 4. 기본 금 시세 데이터 삽입
    console.log('📝 기본 금 시세 데이터 삽입...')
    const { error: insertError } = await supabase
      .from('gold_prices')
      .upsert({
        date: new Date().toISOString().split('T')[0],
        base_price_18k: 85000,
        base_price_14k: 66000,
        updated_by: null
      }, {
        onConflict: 'date'
      })

    if (insertError) {
      console.error('❌ 기본 금 시세 데이터 삽입 실패:', insertError)
    } else {
      console.log('✅ 기본 금 시세 데이터 삽입 완료')
    }

    console.log('🎉 데이터베이스 설정 완료!')

  } catch (error) {
    console.error('💥 데이터베이스 설정 중 오류 발생:', error)
  }
}

setupDatabase()