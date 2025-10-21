'use client'

import { useState, useEffect } from 'react'

interface KakaoChannelButtonProps {
  className?: string
  children?: React.ReactNode
}

export default function KakaoChannelButton({ className, children }: KakaoChannelButtonProps) {
  const [isKakaoReady, setIsKakaoReady] = useState(false)

  useEffect(() => {
    const checkKakao = setInterval(() => {
      if (typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized()) {
        setIsKakaoReady(true)
        clearInterval(checkKakao)
      }
    }, 100)

    return () => clearInterval(checkKakao)
  }, [])

  const handleKakaoChat = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!isKakaoReady || !window.Kakao) {
      alert('카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    const channelId = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_ID || '_xdTcxcn'

    console.log('카카오톡 채널 챗봇 열기:', channelId)

    try {
      window.Kakao.Channel.chat({
        channelPublicId: channelId,
      })
    } catch (error) {
      console.error('카카오톡 채널 챗봇 오류:', error)
      alert('카카오톡 채널을 열 수 없습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <button
      onClick={handleKakaoChat}
      disabled={!isKakaoReady}
      className={className}
    >
      {children}
    </button>
  )
}
