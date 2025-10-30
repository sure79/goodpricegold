'use client'

import { useState, useEffect } from 'react'

const POPUP_BANNERS = ['/배너1.png', '/배너2.png']

export default function EventPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dontShowToday, setDontShowToday] = useState(false)

  useEffect(() => {
    // 오늘 하루 보지 않기 체크 확인
    const hideUntil = localStorage.getItem('eventPopupHideUntil')
    if (hideUntil) {
      const hideDate = new Date(hideUntil)
      const now = new Date()
      if (now < hideDate) {
        // 아직 숨김 기간이 유효함
        return
      }
    }

    // 팝업 표시
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // 4초마다 배너 전환
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % POPUP_BANNERS.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isVisible])

  const handleClose = () => {
    if (dontShowToday) {
      // 내일 자정까지 숨김
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      localStorage.setItem('eventPopupHideUntil', tomorrow.toISOString())
    }
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/70 z-50"
        onClick={handleClose}
      />

      {/* 팝업 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden relative">
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
            aria-label="닫기"
          >
            ✕
          </button>

          {/* 배너 이미지 슬라이더 */}
          <div className="relative w-full overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {POPUP_BANNERS.map((banner, index) => (
                <div key={index} className="min-w-full">
                  <img
                    src={banner}
                    alt={`이벤트 배너 ${index + 1}`}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>

            {/* 인디케이터 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {POPUP_BANNERS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`배너 ${index + 1}로 이동`}
                />
              ))}
            </div>
          </div>

          {/* 하단 옵션 */}
          <div className="p-4 bg-gray-50 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">오늘 하루 보지 않기</span>
            </label>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors text-sm font-medium"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
