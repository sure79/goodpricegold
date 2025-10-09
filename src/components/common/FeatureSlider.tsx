'use client'

import { useState, useEffect } from 'react'

const features = [
  {
    icon: '⚡',
    title: '감정 후 즉시 정산',
    description: '당일 입금',
    bgColor: 'from-yellow-400 to-orange-400'
  },
  {
    icon: '🔍',
    title: '전문 감정사 직접 측정',
    description: '정확한 감정',
    bgColor: 'from-blue-400 to-cyan-400'
  },
  {
    icon: '💰',
    title: '타사 대비 최고 가격',
    description: '최고가 보장',
    bgColor: 'from-orange-400 to-red-400'
  }
]

export default function FeatureSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length)
    }, 3000) // 3초마다 자동 슬라이드

    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4">
      {/* 슬라이드 컨테이너 */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ height: '400px' }}>
        {features.map((feature, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 translate-x-0'
                : index < currentIndex
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
            }`}
          >
            <div className={`h-full w-full bg-gradient-to-br ${feature.bgColor} flex flex-col items-center justify-center p-8`}>
              {/* 아이콘 */}
              <div className="text-9xl mb-8 animate-bounce">
                {feature.icon}
              </div>

              {/* 제목 */}
              <h3 className="text-5xl md:text-6xl font-black text-white mb-6 text-center leading-tight drop-shadow-lg">
                {feature.title}
              </h3>

              {/* 설명 */}
              <p className="text-3xl md:text-4xl font-bold text-white/90 text-center">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center gap-3 mt-6">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentIndex
                ? 'w-12 h-4 bg-yellow-400 rounded-full'
                : 'w-4 h-4 bg-white/40 rounded-full hover:bg-white/60'
            }`}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>

      {/* 좌우 화살표 (선택사항) */}
      <button
        onClick={() => goToSlide((currentIndex - 1 + features.length) % features.length)}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-4 rounded-r-2xl transition-all"
        aria-label="이전 슬라이드"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goToSlide((currentIndex + 1) % features.length)}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-4 rounded-l-2xl transition-all"
        aria-label="다음 슬라이드"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
