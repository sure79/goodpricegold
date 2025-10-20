# 배포 가이드

착한금니 프로젝트가 GitHub에 성공적으로 푸시되었습니다!

## 📦 GitHub 저장소

- **저장소**: https://github.com/sure79/goodpricegold
- **최신 커밋**: 카카오 로그인 및 카카오톡 채널 챗봇 통합

## 🚀 Netlify 배포 (현재 배포 중)

### 1. Netlify 대시보드 접속
1. https://app.netlify.com 로그인
2. 프로젝트 선택: `geumnikkaebi`

### 2. 환경변수 추가 (필수!)

**Site Configuration > Environment Variables**에서 다음 환경변수를 추가하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vvyptsmzpvrurrhnrhjq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eXB0c216cHZydXJyaG5yaGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjIwMDksImV4cCI6MjA3NDE5ODAwOX0.vwdQTnxBkhS590UhWuir_52Q_6hIyNTyXfqzsCQISq8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eXB0c216cHZydXJyaG5yaGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYyMjAwOSwiZXhwIjoyMDc0MTk4MDA5fQ.n9XYmigPBHiU9ofpJFXrNBxV71LRIeeb-9vFK9fcOZQ

# App URL
NEXT_PUBLIC_APP_URL=https://geumnikkaebi.netlify.app

# 카카오 API (신규 추가!)
NEXT_PUBLIC_KAKAO_APP_KEY=953b0b2f6d0d9323ab7d1daabf22fc07
NEXT_PUBLIC_KAKAO_REDIRECT_URI=https://geumnikkaebi.netlify.app/auth/kakao/callback
NEXT_PUBLIC_KAKAO_CHANNEL_ID=_Efrpn
```

### 3. 카카오 개발자 센터 설정 업데이트

**중요**: 프로덕션 배포를 위해 카카오 개발자 센터에서 설정을 업데이트해야 합니다.

1. **플랫폼 설정**
   - https://developers.kakao.com 접속
   - 내 애플리케이션 > 앱 설정 > 플랫폼
   - Web 플랫폼 추가: `https://geumnikkaebi.netlify.app`

2. **Redirect URI 추가**
   - 제품 설정 > 카카오 로그인 > Redirect URI
   - 추가: `https://geumnikkaebi.netlify.app/auth/kakao/callback`

### 4. 재배포 트리거

환경변수 추가 후:
1. Netlify 대시보드에서 **"Trigger deploy"** 클릭
2. 또는 GitHub에 새로운 커밋 푸시 시 자동 배포

---

## 🔄 Vercel로 배포 (대안)

Vercel에서도 배포 가능합니다. Vercel이 Next.js에 최적화되어 있어 권장됩니다.

### 1. Vercel 프로젝트 생성

```bash
# Vercel CLI 설치 (없는 경우)
npm i -g vercel

# 프로젝트 디렉토리에서 실행
cd geumnikkaebi
vercel
```

대화형 프롬프트에서:
- Set up and deploy? **Y**
- Which scope? **본인 계정 선택**
- Link to existing project? **N**
- Project name? **goodpricegold** (또는 원하는 이름)
- In which directory is your code located? **./**
- Want to override settings? **N**

### 2. Vercel 환경변수 설정

**Vercel Dashboard**에서:
1. 프로젝트 선택
2. Settings > Environment Variables
3. 위의 Netlify 환경변수와 동일하게 추가
4. **중요**: `NEXT_PUBLIC_APP_URL`과 `NEXT_PUBLIC_KAKAO_REDIRECT_URI`를 Vercel URL로 변경

예:
```bash
NEXT_PUBLIC_APP_URL=https://goodpricegold.vercel.app
NEXT_PUBLIC_KAKAO_REDIRECT_URI=https://goodpricegold.vercel.app/auth/kakao/callback
```

### 3. 카카오 개발자 센터에 Vercel URL 추가

- 플랫폼: `https://goodpricegold.vercel.app`
- Redirect URI: `https://goodpricegold.vercel.app/auth/kakao/callback`

### 4. 프로덕션 배포

```bash
vercel --prod
```

---

## ✅ 배포 후 체크리스트

배포 완료 후 다음 사항을 확인하세요:

### 기본 기능
- [ ] 메인 페이지 정상 로드
- [ ] 이미지 및 로고 정상 표시
- [ ] 로그인/회원가입 페이지 접근 가능
- [ ] Supabase 연결 정상 (개발자 도구 콘솔 확인)

### 카카오 통합
- [ ] 로그인 페이지에서 "카카오로 시작하기" 버튼 표시
- [ ] 카카오 로그인 클릭 시 카카오 인증 페이지로 이동
- [ ] 카카오 로그인 후 대시보드로 정상 리다이렉트
- [ ] 우측 하단 카카오톡 챗봇 버튼 표시
- [ ] 카카오톡 챗봇 버튼 클릭 시 채널 챗봇 열림

### 디버깅
브라우저 개발자 도구 (F12) 콘솔에서 확인:
- `카카오 SDK 초기화 완료: true` 메시지 출력
- 에러 메시지 없음

---

## 🔧 문제 해결

### 카카오 로그인이 작동하지 않는 경우

**증상**: 카카오 로그인 후 에러 발생

**해결**:
1. 카카오 개발자 센터에서 Redirect URI가 정확한지 확인
2. 환경변수 `NEXT_PUBLIC_KAKAO_REDIRECT_URI`가 배포 URL과 일치하는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 카카오톡 챗봇 버튼이 작동하지 않는 경우

**증상**: 버튼 클릭 시 아무 반응 없음

**해결**:
1. 환경변수 `NEXT_PUBLIC_KAKAO_CHANNEL_ID`가 `_Efrpn`으로 설정되었는지 확인
2. 카카오톡 채널이 활성화되어 있는지 확인
3. 브라우저 콘솔에서 "카카오 SDK 초기화 완료: true" 확인

### 환경변수가 적용되지 않는 경우

**해결**:
1. Netlify/Vercel 대시보드에서 환경변수 다시 확인
2. 재배포 트리거 (Trigger deploy)
3. 캐시 클리어 후 재배포

---

## 📊 배포 상태 모니터링

### Netlify
- 대시보드: https://app.netlify.com
- 배포 로그에서 에러 확인
- Functions 로그에서 서버리스 함수 에러 확인

### Vercel
- 대시보드: https://vercel.com/dashboard
- Deployments 탭에서 빌드 로그 확인
- Real-time logs로 런타임 에러 모니터링

---

## 🎯 다음 단계

1. **도메인 연결**
   - Netlify/Vercel에서 커스텀 도메인 설정
   - DNS 레코드 업데이트
   - SSL 인증서 자동 발급

2. **성능 최적화**
   - 이미지 최적화 (WebP 포맷)
   - 코드 스플리팅 개선
   - CDN 캐싱 설정

3. **모니터링 설정**
   - Sentry 연동 (에러 추적)
   - Google Analytics 설정
   - 성능 모니터링 도구 추가

---

## 📞 지원

문제가 발생하면:
1. GitHub Issues: https://github.com/sure79/goodpricegold/issues
2. `KAKAO_SETUP.md` 파일 참고
3. 브라우저 개발자 도구 콘솔 확인

**배포 성공을 축하합니다!** 🎉
