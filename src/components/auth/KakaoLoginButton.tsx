'use client'

import { useEffect, useState } from 'react'

interface KakaoLoginButtonProps {
  onSuccess?: (userInfo: unknown) => void
  onError?: (error: unknown) => void
}

export default function KakaoLoginButton({ onSuccess, onError }: KakaoLoginButtonProps) {
  const [isKakaoReady, setIsKakaoReady] = useState(false)

  useEffect(() => {
    // 카카오 SDK가 로드될 때까지 대기
    const checkKakao = setInterval(() => {
      if (typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized()) {
        setIsKakaoReady(true)
        clearInterval(checkKakao)
      }
    }, 100)

    return () => clearInterval(checkKakao)
  }, [])

  const handleKakaoLogin = () => {
    if (!isKakaoReady || !window.Kakao) {
      alert('카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    try {
      window.Kakao.Auth.authorize({
        redirectUri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || '',
        scope: 'profile_nickname,profile_image,account_email,phone_number,name',
      })
    } catch (error) {
      console.error('카카오 로그인 오류:', error)
      onError?.(error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleKakaoLogin}
      disabled={!isKakaoReady}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#3c1e1e] bg-[#FEE500] hover:bg-[#FDD835] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEE500] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 0C4.02944 0 0 3.35786 0 7.5C0 10.0837 1.57937 12.3465 4.02206 13.7793L3.15563 17.2441C3.10312 17.4473 3.32062 17.6123 3.50062 17.4948L7.57969 14.7832C8.04969 14.8443 8.52094 14.8755 9 14.8755C13.9706 14.8755 18 11.5176 18 7.36547C18 3.21333 13.9706 0 9 0Z"
          fill="#3c1e1e"
        />
      </svg>
      <span>카카오로 시작하기</span>
    </button>
  )
}
