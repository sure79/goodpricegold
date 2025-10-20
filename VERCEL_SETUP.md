# Vercel 배포 설정 가이드

## 📋 Vercel 배포 URL

**프로덕션 URL**: https://goodgeumni.vercel.app

## 🔧 카카오 리다이렉트 URL

카카오 개발자 센터에서 다음 URL을 설정하세요:

### 1. 카카오 개발자 센터 설정

https://developers.kakao.com 접속 후:

#### Redirect URI 설정
**제품 설정 > 카카오 로그인 > Redirect URI**에 추가:

```
https://goodgeumni.vercel.app/auth/kakao/callback
```

#### Web 플랫폼 추가
**앱 설정 > 플랫폼 > Web**에 추가:

```
https://goodgeumni.vercel.app
```

## 🚀 자동 배포 확인

Vercel은 GitHub와 연동되어 있어 자동 배포가 설정되어 있습니다:

1. **GitHub 푸시 시 자동 배포**
   - `master` 브랜치에 푸시하면 프로덕션 자동 배포
   - 다른 브랜치는 프리뷰 배포

2. **배포 확인**
   - Vercel 대시보드: https://vercel.com/dashboard
   - 프로젝트 선택: `geumnikkaebi`
   - Deployments 탭에서 배포 상태 확인

## ⚙️ Vercel 환경변수 설정

**중요**: Vercel 대시보드에서 환경변수를 설정해야 합니다!

### 방법 1: Vercel 대시보드에서 설정

1. https://vercel.com/dashboard 접속
2. 프로젝트 `geumnikkaebi` 선택
3. **Settings > Environment Variables** 클릭
4. 다음 환경변수 추가:

```bash
# 카카오 API (이미 설정되어 있으면 업데이트)
NEXT_PUBLIC_KAKAO_APP_KEY=953b0b2f6d0d9323ab7d1daabf22fc07
NEXT_PUBLIC_KAKAO_REDIRECT_URI=https://goodgeumni.vercel.app/auth/kakao/callback
NEXT_PUBLIC_KAKAO_CHANNEL_ID=_Efrpn
```

**Environment**: Production, Preview, Development 모두 선택

### 방법 2: Vercel CLI로 설정

```bash
cd geumnikkaebi

# 카카오 앱 키
vercel env add NEXT_PUBLIC_KAKAO_APP_KEY
# 입력: 953b0b2f6d0d9323ab7d1daabf22fc07
# Environment: Production, Preview, Development 선택

# 카카오 리다이렉트 URI
vercel env add NEXT_PUBLIC_KAKAO_REDIRECT_URI
# 입력: https://goodgeumni.vercel.app/auth/kakao/callback
# Environment: Production, Preview, Development 선택

# 카카오 채널 ID
vercel env add NEXT_PUBLIC_KAKAO_CHANNEL_ID
# 입력: _Efrpn
# Environment: Production, Preview, Development 선택
```

## 🔄 재배포

환경변수 추가 후 재배포가 필요합니다:

### 방법 1: Vercel 대시보드
1. Deployments 탭
2. 최신 배포 선택
3. **Redeploy** 버튼 클릭

### 방법 2: GitHub 푸시
```bash
git add .
git commit -m "Update environment variables"
git push origin master
```

### 방법 3: Vercel CLI
```bash
vercel --prod
```

## ✅ 배포 확인 체크리스트

배포 완료 후 다음을 확인하세요:

### 기본 기능
- [ ] https://goodgeumni.vercel.app 접속 가능
- [ ] 메인 페이지 정상 로드
- [ ] 이미지 및 로고 정상 표시

### 카카오 통합
- [ ] 로그인 페이지에서 "카카오로 시작하기" 버튼 표시
- [ ] 카카오 로그인 클릭 시 카카오 인증 페이지로 이동
- [ ] 카카오 로그인 후 대시보드로 정상 리다이렉트
- [ ] 우측 하단 카카오톡 챗봇 버튼 표시 (노란색)
- [ ] 카카오톡 챗봇 버튼 클릭 시 채널 챗봇 열림

### 디버깅
브라우저 개발자 도구 (F12) 콘솔에서:
- [ ] "카카오 SDK 초기화 완료: true" 메시지 출력
- [ ] 에러 메시지 없음

## 🔍 문제 해결

### 카카오 로그인이 작동하지 않는 경우

**증상**: 카카오 로그인 후 에러 발생

**해결 방법**:
1. 카카오 개발자 센터에서 Redirect URI 확인
   - `https://goodgeumni.vercel.app/auth/kakao/callback` 정확히 입력되었는지 확인
2. Vercel 환경변수 확인
   - `NEXT_PUBLIC_KAKAO_REDIRECT_URI`가 올바른지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 환경변수가 적용되지 않는 경우

**해결 방법**:
1. Vercel 대시보드에서 환경변수 다시 확인
2. 재배포 실행 (Redeploy)
3. 브라우저 캐시 클리어 후 재접속

### 카카오톡 챗봇 버튼이 작동하지 않는 경우

**해결 방법**:
1. `NEXT_PUBLIC_KAKAO_CHANNEL_ID`가 `_Efrpn`로 설정되었는지 확인
2. 카카오톡 채널이 활성화되어 있는지 확인
3. 브라우저 콘솔에서 "카카오 SDK 초기화 완료" 확인

## 📊 배포 모니터링

### Vercel 대시보드
- **URL**: https://vercel.com/dashboard
- **프로젝트**: geumnikkaebi
- **배포 로그**: Deployments > 배포 선택 > Logs
- **런타임 로그**: Functions 탭에서 실시간 로그 확인

### 유용한 Vercel CLI 명령어

```bash
# 배포 목록 확인
vercel ls

# 현재 프로젝트 정보
vercel inspect

# 로그 확인
vercel logs

# 환경변수 목록
vercel env ls

# 프로덕션 배포
vercel --prod
```

## 🎯 다음 단계

1. **커스텀 도메인 설정**
   - Vercel Dashboard > Settings > Domains
   - 원하는 도메인 추가 및 DNS 설정

2. **성능 최적화**
   - Edge Functions 활용
   - 이미지 최적화 (Vercel Image Optimization)
   - 캐싱 전략 개선

3. **모니터링 도구 연동**
   - Vercel Analytics 활성화
   - Sentry 연동 (에러 추적)
   - Google Analytics 설정

## 📞 지원

문제가 발생하면:
1. Vercel 문서: https://vercel.com/docs
2. GitHub Issues: https://github.com/sure79/goodpricegold/issues
3. 카카오 설정 가이드: `KAKAO_SETUP.md` 참고

**배포 성공을 축하합니다!** 🎉
