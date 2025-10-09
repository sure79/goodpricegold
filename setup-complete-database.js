const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://dppvroecyfwmidtjxxup.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcHZyb2VjeWZ3bWlkdGp4eHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ5OTY4NSwiZXhwIjoyMDc0MDc1Njg1fQ.fH6mvxOI1BnuL9adYWhYsZjU5nrYvbs-1lR5nrrvHCY';

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'dppvroecyfwmidtjxxup.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/sql',
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

async function setupCompleteDatabase() {
  console.log('🚀 금니깨비 완전한 데이터베이스 설정 시작...');

  try {
    // SQL 파일 읽기
    const sqlContent = fs.readFileSync('./complete-database-schema.sql', 'utf8');

    // SQL을 문장별로 분리 (세미콜론 기준)
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 총 ${sqlStatements.length}개의 SQL 문장을 실행합니다...`);

    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      console.log(`\n[${i + 1}/${sqlStatements.length}] 실행 중...`);

      try {
        await executeSQL(statement);
        console.log(`✅ 성공`);
      } catch (error) {
        // 일부 오류는 무시 (이미 존재하는 테이블 등)
        if (error.message.includes('already exists') ||
            error.message.includes('duplicate') ||
            error.message.includes('already defined')) {
          console.log(`⚠️  스킵 (이미 존재): ${error.message.substring(0, 100)}...`);
        } else {
          console.log(`❌ 오류: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 데이터베이스 설정 완료!');
    console.log('\n📋 생성된 테이블:');
    console.log('- profiles (사용자 프로필)');
    console.log('- gold_prices (금니 시세)');
    console.log('- purchase_requests (매입 신청)');
    console.log('- settlements (정산)');
    console.log('- inquiries (문의)');
    console.log('- reviews (후기)');
    console.log('- system_settings (시스템 설정)');
    console.log('- notifications (알림)');

    // 샘플 데이터 생성
    console.log('\n📊 샘플 데이터 생성 중...');
    await createSampleData();

  } catch (error) {
    console.error('❌ 데이터베이스 설정 실패:', error.message);
  }
}

async function createSampleData() {
  try {
    // 1. 오늘 금니 시세가 없으면 생성
    await executeSQL(`
      INSERT INTO gold_prices (date, base_price_18k, base_price_14k, updated_by)
      VALUES (CURRENT_DATE, 85000, 66000, NULL)
      ON CONFLICT (date) DO NOTHING;
    `);

    // 2. 최근 7일간의 금니 시세 히스토리 생성
    for (let i = 1; i <= 7; i++) {
      const basePrice18k = 85000 + Math.floor(Math.random() * 4000) - 2000; // 83000-87000 범위
      const basePrice14k = 66000 + Math.floor(Math.random() * 3000) - 1500; // 64500-67500 범위

      await executeSQL(`
        INSERT INTO gold_prices (date, base_price_18k, base_price_14k, updated_by)
        VALUES (CURRENT_DATE - INTERVAL '${i}' DAY, ${basePrice18k}, ${basePrice14k}, NULL)
        ON CONFLICT (date) DO NOTHING;
      `);
    }

    // 3. 샘플 매입 신청 데이터 생성
    const sampleRequests = [
      {
        request_number: '20250922001',
        customer_name: '김고객',
        customer_phone: '010-1234-5678',
        items: JSON.stringify([{type: '18k', weight: 5.2, description: '반지 2개'}]),
        estimated_total_weight: 5.2,
        estimated_price: 442000,
        status: 'evaluating'
      },
      {
        request_number: '20250921001',
        customer_name: '이고객',
        customer_phone: '010-2345-6789',
        items: JSON.stringify([{type: '14k', weight: 3.8, description: '목걸이 1개'}]),
        estimated_total_weight: 3.8,
        estimated_price: 250800,
        status: 'paid'
      }
    ];

    // 관리자 ID 가져오기
    const adminId = '27d94e6b-d188-4742-a37d-d4adeb61a871'; // 이전에 생성한 관리자 ID

    for (const request of sampleRequests) {
      await executeSQL(`
        INSERT INTO purchase_requests (
          request_number, user_id, customer_name, customer_phone,
          items, estimated_total_weight, estimated_price, status,
          gold_price_snapshot, created_at
        ) VALUES (
          '${request.request_number}', '${adminId}', '${request.customer_name}', '${request.customer_phone}',
          '${request.items}', ${request.estimated_total_weight}, ${request.estimated_price}, '${request.status}',
          '{"18k": 85000, "14k": 66000}', NOW() - INTERVAL '${Math.floor(Math.random() * 5)}' DAY
        ) ON CONFLICT (request_number) DO NOTHING;
      `);
    }

    console.log('✅ 샘플 데이터 생성 완료');

  } catch (error) {
    console.log('⚠️  샘플 데이터 생성 중 일부 오류 발생:', error.message);
  }
}

setupCompleteDatabase();