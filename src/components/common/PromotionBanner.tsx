'use client'

import { useState, useEffect } from 'react'

const PROMOTIONS = [
  {
    icon: '🎁',
    text: '첫 거래 고객 1만원 추가 지급',
    bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
  },
  {
    icon: '👥',
    text: '친구 소개시 두 사람 각각 1만원 추가 지급',
    bg: 'bg-gradient-to-r from-orange-500 to-yellow-500'
  }
]

export default function PromotionBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMOTIONS.length)
    }, 4000) // 4초마다 전환

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full overflow-hidden" style={{ zIndex: 50 }}>
      <div className="relative h-12 sm:h-14 flex items-center justify-center">
        {PROMOTIONS.map((promo, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center justify-center px-4 transition-all duration-700 ${promo.bg} ${
              index === currentIndex
                ? 'opacity-100 translate-y-0'
                : index < currentIndex
                  ? 'opacity-0 -translate-y-full'
                  : 'opacity-0 translate-y-full'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">{promo.icon}</span>
              <p className="text-white font-bold text-xs sm:text-sm md:text-base text-center">
                {promo.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1.5">
        {PROMOTIONS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-4'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`프로모션 ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
