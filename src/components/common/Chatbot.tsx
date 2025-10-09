'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  message: string
  timestamp: Date
}

interface InquiryFormData {
  name: string
  phone: string
  message: string
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<InquiryFormData>()

  useEffect(() => {
    // 로그인 상태 확인
    const currentUser = localStorage.getItem('currentUser')
    const loginStatus = localStorage.getItem('isLoggedIn')

    if (loginStatus === 'true' && currentUser) {
      setIsLoggedIn(true)
      setUser(JSON.parse(currentUser))
    }

    // 초기 인사 메시지
    setMessages([
      {
        id: '1',
        type: 'bot',
        message: '안녕하세요! 착한금니 고객센터입니다. 🎭\n궁금한 점이 있으시면 언제든 문의해주세요!',
        timestamp: new Date()
      }
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // cleanup function
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (type: 'user' | 'bot', message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const getAutoReply = (userMessage: string) => {
    const message = userMessage.toLowerCase()

    if (message.includes('시세') || message.includes('가격')) {
      return '현재 금니 시세는 홈페이지 상단에서 실시간으로 확인하실 수 있습니다.\n\n📊 오늘의 시세:\n• 18K: 홈페이지에서 확인\n• 14K: 홈페이지에서 확인\n\n정확한 감정을 위해서는 매입 신청을 해주시면 전문가가 정밀 감정해드립니다!'
    }

    if (message.includes('매입') || message.includes('신청')) {
      return '📝 매입 신청 절차 안내:\n\n1. 로그인 후 "매입 신청" 클릭\n2. 금니 정보 및 사진 업로드\n3. 신청 완료 후 택배 발송\n4. 전문가 감정 후 연락\n5. 만족 시 즉시 입금\n\n💡 팁: 다양한 각도에서 촬영한 사진을 올려주시면 더 정확한 감정이 가능합니다!'
    }

    if (message.includes('택배') || message.includes('발송') || message.includes('주소')) {
      return '📦 택배 발송 안내:\n\n📍 보내실 주소:\n서울특별시 강남구 테헤란로 123\n금니깨비 빌딩 5층\n\n👤 받는 분: 금니깨비 감정팀\n📞 연락처: 010-1234-5678\n\n⚠️ 주의사항:\n• 신청번호 반드시 기재\n• 등기우편/택배 이용 권장\n• 운송장 번호 문자 알림'
    }

    if (message.includes('시간') || message.includes('기간') || message.includes('언제')) {
      return '⏰ 처리 시간 안내:\n\n• 신청 접수: 즉시\n• 첫 연락: 신청 후 24시간 내\n• 감정 완료: 택배 도착 후 1-2일\n• 입금 처리: 감정 승인 후 즉시\n\n빠른 처리를 원하시면 오전에 신청해주세요!'
    }

    if (message.includes('수수료') || message.includes('비용') || message.includes('수수료')) {
      return '💰 수수료 안내:\n\n✅ 무료 서비스:\n• 감정 수수료: 무료\n• 택배 반송비: 무료 (불만족시)\n• 상담 및 문의: 무료\n\n💡 투명한 수수료 정책으로 고객 만족도 98%를 유지하고 있습니다!'
    }

    if (message.includes('안전') || message.includes('보험') || message.includes('분실')) {
      return '🔒 안전 보장 서비스:\n\n• 택배 보험 자동 적용\n• 분실/파손 시 100% 보상\n• CCTV 감시하에 감정 진행\n• 전 과정 사진/영상 기록\n\n고객님의 소중한 금니를 안전하게 보호합니다!'
    }

    if (message.includes('반송') || message.includes('취소') || message.includes('거절')) {
      return '↩️ 반송 서비스:\n\n감정 결과가 만족스럽지 않으시면:\n• 반송비 무료\n• 24시간 내 발송\n• 원래 포장 상태 유지\n• 추가 비용 일체 없음\n\n고객 만족이 최우선입니다!'
    }

    // 기본 응답
    return '문의해주셔서 감사합니다! 😊\n\n더 구체적인 도움이 필요하시면:\n• 전화: 010-1234-5678\n• 영업시간: 평일 9:00-18:00\n• 토요일: 9:00-15:00\n\n친절하게 안내해드리겠습니다!'
  }

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return

    // 사용자 메시지 추가
    addMessage('user', currentMessage)

    // 이전 타이머 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 자동 응답 생성
    timeoutRef.current = setTimeout(() => {
      const reply = getAutoReply(currentMessage)
      addMessage('bot', reply)
      timeoutRef.current = null
    }, 1000)

    setCurrentMessage('')
  }

  const handleInquirySubmit = async (data: InquiryFormData) => {
    try {
      // 문의 내용을 메시지로 추가
      addMessage('user', `[문의 등록]\n이름: ${data.name}\n연락처: ${data.phone}\n문의내용: ${data.message}`)

      // 실제 DB에 저장
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          message: data.message,
          user_id: 'anonymous'
        })
      })

      const result = await response.json()

      setTimeout(() => {
        if (result.success) {
          addMessage('bot', `${data.name}님, 문의를 접수했습니다! 📝\n\n빠른 시일 내에 ${data.phone}로 연락드리겠습니다.\n\n접수번호: ${result.data.inquiry_number}\n\n감사합니다! 😊`)
        } else {
          addMessage('bot', `죄송합니다. 문의 접수 중 오류가 발생했습니다. 😔\n\n다시 시도해주시거나 직접 연락주세요.\n\n📞 고객센터: 010-1234-5678`)
        }
      }, 1000)

      reset()
      setShowInquiryForm(false)
    } catch (error) {
      console.error('문의 제출 오류:', error)
      setTimeout(() => {
        addMessage('bot', `죄송합니다. 문의 접수 중 오류가 발생했습니다. 😔\n\n다시 시도해주시거나 직접 연락주세요.\n\n📞 고객센터: 010-1234-5678`)
      }, 1000)

      reset()
      setShowInquiryForm(false)
    }
  }

  const commonQuestions = [
    '금니 시세가 궁금해요',
    '매입 신청 방법을 알고 싶어요',
    '택배 발송 주소를 알려주세요',
    '처리 시간이 얼마나 걸리나요?',
    '수수료가 있나요?'
  ]

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition-all z-50"
      >
        💬
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border z-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-amber-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-semibold">🪙 착한금니 고객센터</h3>
          <p className="text-xs opacity-90">친절하게 도와드릴게요!</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg text-sm ${
                msg.type === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-line">{msg.message}</div>
              <div className={`text-xs mt-1 opacity-70`}>
                {msg.timestamp.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 자주 묻는 질문 */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">자주 묻는 질문:</p>
          <div className="space-y-1">
            {commonQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentMessage(question)
                  setTimeout(() => handleSendMessage(), 100)
                }}
                className="block w-full text-left text-xs bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="p-4 border-t">
        {!isLoggedIn && !showInquiryForm && (
          <button
            onClick={() => setShowInquiryForm(true)}
            className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 mb-2"
          >
            📝 문의하기 (비회원)
          </button>
        )}

        {showInquiryForm && (
          <form onSubmit={handleSubmit(handleInquirySubmit)} className="space-y-2 mb-2">
            <input
              {...register('name', { required: '이름을 입력해주세요' })}
              placeholder="이름"
              className="w-full text-xs p-2 border rounded"
            />
            <input
              {...register('phone', { required: '연락처를 입력해주세요' })}
              placeholder="연락처"
              className="w-full text-xs p-2 border rounded"
            />
            <textarea
              {...register('message', { required: '문의내용을 입력해주세요' })}
              placeholder="문의내용"
              rows={2}
              className="w-full text-xs p-2 border rounded resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-amber-600 text-white py-1 px-2 rounded text-xs hover:bg-amber-700"
              >
                문의 등록
              </button>
              <button
                type="button"
                onClick={() => setShowInquiryForm(false)}
                className="flex-1 bg-gray-400 text-white py-1 px-2 rounded text-xs hover:bg-gray-500"
              >
                취소
              </button>
            </div>
          </form>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isLoggedIn ? `${user?.name}님, 궁금한 점을 물어보세요!` : '메시지를 입력하세요...'}
            className="flex-1 text-sm p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim()}
            className="bg-amber-600 text-white px-3 py-2 rounded text-sm hover:bg-amber-700 disabled:opacity-50"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  )
}