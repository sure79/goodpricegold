# SEO 최적화 설정 가이드

## 완료된 작업 ✅

### 1. 자동 Sitemap 생성
- **패키지**: `next-sitemap` 설치 완료
- **설정 파일**: `next-sitemap.config.js` 생성
- **빌드 스크립트**: `package.json`에 `postbuild` 추가
- **자동 생성 파일**:
  - `/sitemap.xml` - 사이트맵
  - `/robots.txt` - 검색엔진 크롤링 규칙

### 2. 메타 태그 최적화
- **위치**: `src/app/layout.tsx`
- **추가된 메타 태그**:
  - Title (템플릿 방식)
  - Description (상세 설명)
  - Keywords (금니 관련 키워드 16개)
  - Open Graph (페이스북, 카카오톡 공유)
  - Twitter Card
  - 구글 로봇 최적화
  - Canonical URL

### 3. 구조화된 데이터 (Schema.org)
- **위치**: `src/components/seo/StructuredData.tsx`
- **추가된 스키마**:
  - LocalBusiness (지역 비즈니스)
  - Service (서비스 정보)
  - BreadcrumbList (빵부스러기 네비게이션)
  - WebSite (웹사이트 검색)
  - AggregateRating (평점 정보)

### 4. 검증 파일
- **네이버**: `/public/naver-site-verification.html`
- **구글**: metadata에 verification 코드 추가

---

## 다음 단계: 검색엔진 등록 📝

### 1. 구글 서치 콘솔 (Google Search Console)

#### 1단계: 사이트 등록
1. https://search.google.com/search-console 접속
2. "속성 추가" 클릭
3. URL 입력: `https://goodgeumni.vercel.app`

#### 2단계: 소유권 확인
방법 1 (추천): HTML 태그
- 제공된 메타 태그를 받아서 `src/app/layout.tsx` 파일의 `metadata.verification.google` 값을 실제 코드로 교체

방법 2: HTML 파일
- 제공된 HTML 파일을 `/public` 폴더에 업로드

#### 3단계: 사이트맵 제출
1. 좌측 메뉴에서 "색인 생성" > "Sitemaps" 클릭
2. 사이트맵 URL 입력: `https://goodgeumni.vercel.app/sitemap.xml`
3. "제출" 클릭

---

### 2. 네이버 웹마스터 도구 (Naver Search Advisor)

#### 1단계: 사이트 등록
1. https://searchadvisor.naver.com 접속
2. "웹마스터 도구" 클릭
3. "사이트 추가" 버튼 클릭
4. URL 입력: `https://goodgeumni.vercel.app`

#### 2단계: 소유권 확인
방법 1 (추천): HTML 태그
- 제공된 메타 태그를 받아서 `src/app/layout.tsx` 파일의 `metadata.verification.other['naver-site-verification']` 값을 실제 코드로 교체

방법 2: HTML 파일
- `/public/naver-site-verification.html` 파일이 이미 생성되어 있습니다
- 네이버에서 제공하는 실제 인증 코드로 `content` 값을 교체하세요

#### 3단계: 사이트맵 제출
1. "요청" > "사이트맵 제출" 클릭
2. 사이트맵 URL 입력: `https://goodgeumni.vercel.app/sitemap.xml`
3. "확인" 클릭

#### 4단계: RSS 제출 (선택)
- 뉴스/블로그가 있다면 RSS도 제출

---

## 인증 코드 교체 방법

### 구글 서치 콘솔 인증 코드 교체

`src/app/layout.tsx` 파일에서:

```typescript
verification: {
  google: 'google-site-verification-code',  // <- 여기를 실제 코드로 교체
  other: {
    'naver-site-verification': 'naver-site-verification-code',
  },
},
```

예시:
```typescript
verification: {
  google: 'abc123def456ghi789',  // 구글에서 받은 실제 코드
  other: {
    'naver-site-verification': 'xyz789uvw456rst123',  // 네이버에서 받은 실제 코드
  },
},
```

### 네이버 웹마스터 인증 코드 교체

`public/naver-site-verification.html` 파일에서:

```html
<meta name="naver-site-verification" content="naver-site-verification-code"/>
```

를 실제 코드로 교체:

```html
<meta name="naver-site-verification" content="xyz789uvw456rst123"/>
```

---

## 배포 후 확인사항

### 1. Sitemap 확인
배포 후 다음 URL들이 정상 작동하는지 확인:
- https://goodgeumni.vercel.app/sitemap.xml
- https://goodgeumni.vercel.app/robots.txt

### 2. 메타 태그 확인
브라우저에서 F12 > Elements > `<head>` 태그 확인:
- `<meta property="og:*">` 태그들이 보여야 함
- `<script type="application/ld+json">` 구조화된 데이터가 보여야 함

### 3. 구조화된 데이터 테스트
구글 리치 결과 테스트: https://search.google.com/test/rich-results
- URL 입력: `https://goodgeumni.vercel.app`
- "URL 테스트" 클릭
- 오류가 없는지 확인

---

## SEO 최적화 키워드

현재 적용된 주요 키워드:
- 금니매입
- 금니
- 금이빨
- 금니시세
- 금니가격
- 금니매입업체
- 금니매매
- 치과금니
- 금니팔기
- 금니매입가격
- 금니감정
- 금니현금화
- 중고금니
- 금니업체
- 금니전문
- 착한금니

---

## 추가 권장사항

### 1. 정기적인 콘텐츠 업데이트
- 금니 시세 정보 매일 업데이트
- 고객 후기 추가
- 금니 관련 정보/팁 블로그 작성

### 2. 백링크 구축
- 관련 커뮤니티에 정보 공유
- 금니 관련 블로그 게스트 포스팅
- 소셜 미디어 활성화

### 3. 페이지 속도 최적화
- 이미지 최적화 (WebP 형식 사용)
- 캐싱 설정
- CDN 사용 (Vercel 자동 적용)

### 4. 모바일 최적화
- 반응형 디자인 (이미 적용됨)
- 모바일 페이지 속도 테스트
- 터치 영역 크기 최적화

---

## 문제 해결

### Sitemap이 생성되지 않는 경우
```bash
npm run build
```
빌드 후 `/public/sitemap.xml`과 `/public/robots.txt` 확인

### 구조화된 데이터 오류
- https://search.google.com/test/rich-results 에서 테스트
- 오류 메시지에 따라 `src/components/seo/StructuredData.tsx` 수정

### 검색엔진에 노출되지 않는 경우
- 최소 2-4주 소요
- 구글 서치 콘솔 "URL 검사" 기능으로 수동 색인 요청
- 네이버 웹마스터 "수집 요청" 기능 사용

---

## 연락처

문제가 발생하면:
1. 구글 서치 콘솔 도움말: https://support.google.com/webmasters
2. 네이버 웹마스터 도움말: https://searchadvisor.naver.com/guide

**SEO 최적화 완료!** 🎉
