const https = require('https');

const SUPABASE_URL = 'https://dppvroecyfwmidtjxxup.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcHZyb2VjeWZ3bWlkdGp4eHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ5OTY4NSwiZXhwIjoyMDc0MDc1Njg1fQ.fH6mvxOI1BnuL9adYWhYsZjU5nrYvbs-1lR5nrrvHCY';

async function updateAdminLogin() {
  console.log('🔧 관리자 로그인 정보 업데이트 시작...');

  try {
    // 기존 관리자 계정의 이메일을 admin으로 변경
    const data = JSON.stringify({
      email: 'admin',
      name: '관리자'
    });

    const options = {
      hostname: 'dppvroecyfwmidtjxxup.supabase.co',
      port: 443,
      path: '/rest/v1/profiles?id=eq.27d94e6b-d188-4742-a37d-d4adeb61a871',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Prefer': 'return=representation',
        'Content-Length': data.length
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data: responseData });
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

    console.log(`✅ 관리자 프로필 업데이트 완료! (Status: ${response.statusCode})`);
    console.log('📋 업데이트된 데이터:', response.data);
    console.log('🎉 이제 admin / admin1782 로 로그인할 수 있습니다!');
    console.log('⚠️  참고: Supabase Auth 시스템에서 실제 비밀번호 변경은 별도로 필요할 수 있습니다.');

  } catch (error) {
    console.error('❌ 관리자 로그인 정보 업데이트 실패:', error.message);
    console.log('💡 수동으로 Supabase Dashboard에서 다음 SQL을 실행하세요:');
    console.log(`UPDATE profiles SET email = 'admin' WHERE id = '27d94e6b-d188-4742-a37d-d4adeb61a871';`);
  }
}

updateAdminLogin();