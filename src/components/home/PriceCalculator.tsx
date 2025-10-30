'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface GoldPrice {
  base_price_18k: number
  base_price_14k: number
  updated_at: string
}

export default function PriceCalculator() {
  const router = useRouter()
  const [goldPrices, setGoldPrices] = useState<GoldPrice | null>(null)
  const [selectedType, setSelectedType] = useState<'crown_at' | 'inlay'>('crown_at')
  const [weight, setWeight] = useState<string>('1.0')
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoldPrices()
  }, [])

  const calculatePrice = useCallback(() => {
    if (!goldPrices) {
      setEstimatedPrice(0)
      return
    }

    const weightNum = parseFloat(weight)
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      setEstimatedPrice(0)
      return
    }

    // 크라운at: 14k 시세 기준 (약 58% 금 함량)
    // 인레이: 18k 시세 기준 (약 75% 금 함량)
    let pricePerGram = 0
    if (selectedType === 'crown_at') {
      pricePerGram = goldPrices.base_price_14k
    } else {
      pricePerGram = goldPrices.base_price_18k
    }

    const totalPrice = Math.floor(pricePerGram * weightNum)
    setEstimatedPrice(totalPrice)
  }, [goldPrices, weight, selectedType])

  useEffect(() => {
    calculatePrice()
  }, [calculatePrice])

  const fetchGoldPrices = async () => {
    try {
      const response = await fetch('/api/gold-price/current')
      if (!response.ok) {
        throw new Error('API 호출 실패')
      }
      const data = await response.json()
      setGoldPrices(data)
    } catch (error) {
      console.error('시세 조회 실패:', error)
      // 기본값 설정
      setGoldPrices({
        base_price_18k: 85000,
        base_price_14k: 66000,
        updated_at: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApplyClick = () => {
    router.push('/apply')
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-2xl p-8 border-2 border-yellow-400">
        <div className="animate-pulse">
          <div className="h-8 bg-yellow-400/50 rounded mb-4"></div>
          <div className="h-20 bg-yellow-400/50 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-yellow-400">
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
          💰 간편 견적 계산기
        </h3>
        <p className="text-sm md:text-base text-black/80 font-medium">
          금니 종류와 무게를 입력하면 예상 매입가를 확인할 수 있습니다
        </p>
      </div>

      <div className="bg-white/95 backdrop-blur rounded-xl p-6 space-y-5">
        {/* 금니 종류 선택 */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            금니 종류
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedType('crown_at')}
              className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                selectedType === 'crown_at'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-900 shadow-md'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-yellow-400'
              }`}
            >
              <div className="text-lg mb-1">👑</div>
              <div className="text-sm">크라운 at</div>
              <div className="text-xs text-gray-500 mt-1">14k 기준</div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('inlay')}
              className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                selectedType === 'inlay'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-900 shadow-md'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-yellow-400'
              }`}
            >
              <div className="text-lg mb-1">🦷</div>
              <div className="text-sm">인레이</div>
              <div className="text-xs text-gray-500 mt-1">18k 기준</div>
            </button>
          </div>
        </div>

        {/* 무게 입력 */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            예상 무게 (g)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-lg font-semibold text-gray-900"
              placeholder="무게를 입력하세요"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              g
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            💡 무게를 모르시면 평균 1-3g 정도입니다
          </p>
        </div>

        {/* 예상 금액 */}
        <div className="bg-gradient-to-br from-black to-zinc-900 rounded-xl p-6 text-center border-2 border-yellow-500 shadow-lg">
          <div className="text-sm font-medium text-yellow-300 mb-2">
            예상 매입가
          </div>
          <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3">
            {formatCurrency(estimatedPrice)}
          </div>
          <div className="text-xs text-yellow-200/80">
            {goldPrices && (
              <>
                기준 시세: {selectedType === 'crown_at' ? '14k' : '18k'} {formatCurrency(selectedType === 'crown_at' ? goldPrices.base_price_14k : goldPrices.base_price_18k)}/g
                <br />
                최종 금액은 정밀 감정 후 확정됩니다
              </>
            )}
          </div>
        </div>

        {/* 신청 버튼 */}
        <button
          onClick={handleApplyClick}
          className="w-full bg-gradient-to-r from-black to-zinc-900 text-yellow-400 py-4 rounded-xl font-bold text-lg hover:from-zinc-900 hover:to-black transition-all shadow-lg hover:shadow-xl border-2 border-yellow-500"
        >
          🚀 지금 바로 매입 신청하기
        </button>

        {/* 안내 문구 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800 leading-relaxed">
            ℹ️ <strong>안내:</strong> 위 금액은 예상 금액이며, 실제 매입가는 전문 감정 후 확정됩니다.
            정확한 순도와 무게를 측정하여 최고가로 매입해드립니다.
          </p>
        </div>
      </div>
    </div>
  )
}
