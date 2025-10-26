'use client'

// 카카오톡 채널 직접 링크로 이동 (로그인 불필요)
export default function Chatbot() {
  const handleKakaoChat = () => {
    // 카카오톡 채널 링크로 새 창 열기
    window.open('http://pf.kakao.com/_xdTcxcn', '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleKakaoChat}
      className="fixed bottom-6 right-6 bg-[#FEE500] text-[#3c1e1e] p-4 rounded-full shadow-lg hover:bg-[#FDD835] transition-all z-50 flex items-center gap-2"
      title="카카오톡 채널로 문의하기"
    >
      <svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 0C4.02944 0 0 3.35786 0 7.5C0 10.0837 1.57937 12.3465 4.02206 13.7793L3.15563 17.2441C3.10312 17.4473 3.32062 17.6123 3.50062 17.4948L7.57969 14.7832C8.04969 14.8443 8.52094 14.8755 9 14.8755C13.9706 14.8755 18 11.5176 18 7.36547C18 3.21333 13.9706 0 9 0Z"
          fill="#3c1e1e"
        />
      </svg>
    </button>
  )
}
