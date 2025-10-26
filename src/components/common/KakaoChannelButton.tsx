'use client'

interface KakaoChannelButtonProps {
  className?: string
  children?: React.ReactNode
}

export default function KakaoChannelButton({ className, children }: KakaoChannelButtonProps) {
  const handleKakaoChat = (e: React.MouseEvent) => {
    e.preventDefault()
    // 카카오톡 채널 링크로 새 창 열기
    window.open('http://pf.kakao.com/_xdTcxcn', '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleKakaoChat}
      className={className}
    >
      {children}
    </button>
  )
}
