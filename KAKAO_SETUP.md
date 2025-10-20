# 카카오 API 설정 가이드

착한금니 프로젝트에 카카오 로그인과 카카오톡 채널 챗봇이 통합되었습니다.

## 🔧 설정된 기능

### 1. 카카오 로그인
- 로그인 페이지에서 "카카오로 시작하기" 버튼 클릭 시 카카오 계정으로 로그인 가능
- 자동으로 Supabase 계정과 연동
- 신규 사용자는 자동으로 회원가입 처리

### 2. 카카오톡 채널 챗봇
- 화면 우측 하단에 노란색 카카오톡 버튼 추가
- 클릭 시 카카오톡 채널 챗봇 열림
- 고객 문의 및 상담 자동화

## 📋 필수 설정 사항

### 1. 카카오 개발자 센터 설정

1. **카카오 개발자 센터 접속**
   - https://developers.kakao.com 접속
   - 로그인 후 "내 애플리케이션" 메뉴로 이동

2. **애플리케이션 설정 확인**
   - 앱 키 확인: `953b0b2f6d0d9323ab7d1daabf22fc07` (현재 설정된 키)
   - 플랫폼 설정 > Web 플랫폼 등록
     - 사이트 도메인: `https://geumnikkaebi.netlify.app`
     - 로컬 개발: `http://localhost:3000`

3. **Redirect URI 설정**
   - 제품 설정 > 카카오 로그인 > Redirect URI 등록
   - `https://geumnikkaebi.netlify.app/auth/kakao/callback`
   - `http://localhost:3000/auth/kakao/callback` (로컬 개발용)

4. **동의 항목 설정**
   - 제품 설정 > 카카오 로그인 > 동의 항목
   - 필수 동의:
     - 닉네임 (profile_nickname)
     - 프로필 사진 (profile_image)
     - 카카오계정(이메일) (account_email)
   - 선택 동의:
     - 이름 (name)
     - 전화번호 (phone_number)

### 2. 카카오톡 채널 설정

1. **카카오톡 채널 생성**
   - https://center-pf.kakao.com 접속
   - "새 채널 만들기" 클릭
   - 채널명: "착한금니" (또는 원하는 이름)

2. **채널 공개 ID 설정**
   - 채널 관리 > 설정 > 검색용 아이디
   - 검색용 아이디 설정 (예: `@chakhan-geumni`)
   - 공개 ID를 `.env.local` 파일에 등록

3. **챗봇 설정**
   - 스마트채팅 또는 카카오 i 오픈빌더 연동
   - 자동응답 메시지 설정
   - 상담원 연결 설정

### 3. 환경변수 설정

`.env.local` 파일에서 다음 값을 실제 값으로 변경하세요:

```bash
# 카카오 API
NEXT_PUBLIC_KAKAO_APP_KEY=953b0b2f6d0d9323ab7d1daabf22fc07
NEXT_PUBLIC_KAKAO_REDIRECT_URI=https://geumnikkaebi.netlify.app/auth/kakao/callback
NEXT_PUBLIC_KAKAO_CHANNEL_ID=_your_channel_id  # ⚠️ 실제 채널 ID로 변경 필요!
```

**채널 ID 확인 방법:**
1. 카카오톡 채널 관리자 센터 접속
2. 채널 관리 > 설정 > 검색용 아이디
3. '@'를 제외한 ID 복사 (예: `@chakhan-geumni` → `chakhan-geumni`)
4. `_your_channel_id`를 복사한 ID로 변경

## 🚀 사용 방법

### 개발 서버 실행
```bash
cd geumnikkaebi
npm run dev
```

### 카카오 로그인 테스트
1. http://localhost:3000/login 접속
2. "카카오로 시작하기" 버튼 클릭
3. 카카오 계정 로그인
4. 동의 후 자동으로 대시보드로 이동

### 카카오톡 챗봇 테스트
1. 메인 페이지 접속
2. 우측 하단 노란색 카카오톡 버튼 클릭
3. 카카오톡 채널 챗봇 창 열림
4. 챗봇과 대화 시작

## 🔍 문제 해결

### 카카오 로그인이 작동하지 않는 경우
1. 브라우저 콘솔 확인 (`F12`)
2. 카카오 SDK 초기화 로그 확인
3. Redirect URI가 정확히 설정되었는지 확인
4. 동의 항목이 모두 설정되었는지 확인

### 카카오톡 챗봇 버튼이 작동하지 않는 경우
1. `.env.local`의 `NEXT_PUBLIC_KAKAO_CHANNEL_ID` 확인
2. `_your_channel_id`를 실제 채널 ID로 변경했는지 확인
3. 카카오톡 채널이 활성화되어 있는지 확인

### SDK 로드 오류
- 카카오 SDK는 `layout.tsx`에서 자동으로 로드됩니다
- 브라우저 콘솔에서 "카카오 SDK 초기화 완료: true" 메시지 확인

## 📚 관련 문서

- [카카오 로그인 개발 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [카카오톡 채널 개발 가이드](https://developers.kakao.com/docs/latest/ko/kakaotalk-channel/common)
- [JavaScript SDK 가이드](https://developers.kakao.com/docs/latest/ko/sdk-download/js)

## ✅ 체크리스트

카카오 기능을 정식으로 사용하기 위해 다음 항목을 확인하세요:

- [ ] 카카오 개발자 센터에서 앱 설정 완료
- [ ] Redirect URI 등록 완료
- [ ] 동의 항목 설정 완료
- [ ] 카카오톡 채널 생성 완료
- [ ] 채널 공개 ID 설정 완료
- [ ] `.env.local`에 실제 채널 ID 입력 완료
- [ ] 로컬에서 카카오 로그인 테스트 완료
- [ ] 카카오톡 챗봇 버튼 테스트 완료

## 🎯 다음 단계

1. **카카오 i 오픈빌더로 고도화**
   - 자동응답 시나리오 설정
   - FAQ 자동응답 구현
   - 상담원 연결 설정

2. **카카오 알림톡 연동**
   - 매입 신청 접수 알림
   - 감정 완료 알림
   - 입금 완료 알림

3. **카카오페이 결제 연동** (선택)
   - 추가 서비스 결제
   - 수수료 결제 등
