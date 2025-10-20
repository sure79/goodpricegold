'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function KakaoSDKInit() {
  useEffect(() => {
    const initKakao = () => {
      if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
        try {
          const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY
          if (appKey) {
            window.Kakao.init(appKey)
            console.log('카카오 SDK 초기화 완료:', window.Kakao.isInitialized())
          } else {
            console.error('카카오 앱 키가 설정되지 않았습니다.')
          }
        } catch (error) {
          console.error('카카오 SDK 초기화 오류:', error)
        }
      }
    }

    // SDK 로드 대기
    const checkInterval = setInterval(() => {
      if (window.Kakao) {
        initKakao()
        clearInterval(checkInterval)
      }
    }, 100)

    return () => clearInterval(checkInterval)
  }, [])

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
      integrity="sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
