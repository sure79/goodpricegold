'use client'

import { useState, useEffect } from 'react'
import { GOLD_TYPES, type GoldType } from '@/types'
import { useCountUp } from '@/hooks/useCountUp'

interface GoldPrice {
  id: string
  date: string
  price_porcelain: number
  price_inlay_s: number
  price_inlay: number
  price_crown_pt: number
  price_crown_st: number
  price_crown_at: number
  updated_at?: string
}

export default function GoldPriceDisplay() {
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)
  const [loading, setLoading] = useState(true)

  // 각 금 종류별 카운트업 훅 (early return 전에 호출해야 함)
  const porcelainCount = useCountUp(goldPrice?.price_porcelain || 0, { duration: 2000, delay: 100 })
  const inlaySCount = useCountUp(goldPrice?.price_inlay_s || 0, { duration: 2000, delay: 200 })
  const inlayCount = useCountUp(goldPrice?.price_inlay || 0, { duration: 2000, delay: 300 })
  const crownPtCount = useCountUp(goldPrice?.price_crown_pt || 0, { duration: 2000, delay: 400 })
  const crownStCount = useCountUp(goldPrice?.price_crown_st || 0, { duration: 2000, delay: 500 })
  const crownAtCount = useCountUp(goldPrice?.price_crown_at || 0, { duration: 2000, delay: 600 })

  useEffect(() => {
    fetchGoldPrice()
  }, [])

  const fetchGoldPrice = async () => {
    try {
      const response = await fetch('/api/gold-price/current')
      if (response.ok) {
        const data = await response.json()
        setGoldPrice(data)
      }
    } catch (error) {
      console.error('금 시세 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-yellow-600/30">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-800 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-zinc-800 rounded"></div>
            <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!goldPrice) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-yellow-600/30">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">💰 오늘의 금니 시세</h3>
        <p className="text-yellow-200">시세 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const getAnimatedPrice = (key: string) => {
    switch (key) {
      case 'porcelain': return porcelainCount.count
      case 'inlay_s': return inlaySCount.count
      case 'inlay': return inlayCount.count
      case 'crown_pt': return crownPtCount.count
      case 'crown_st': return crownStCount.count
      case 'crown_at': return crownAtCount.count
      default: return 0
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const goldTypeColors = {
    porcelain: { bg: 'from-yellow-400 to-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400' },
    inlay_s: { bg: 'from-yellow-400 to-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400' },
    inlay: { bg: 'from-yellow-400 to-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400' },
    crown_pt: { bg: 'from-yellow-400 to-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400' },
    crown_st: { bg: 'from-yellow-400 to-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400' },
    crown_at: { bg: 'from-yellow-400 to-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400' }
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl shadow-lg border border-yellow-600/30 p-4 md:p-6">
      <div className="text-center mb-4 md:mb-6">
        <div className="inline-flex items-center bg-yellow-500 text-black px-4 py-2 rounded-full text-base md:text-sm font-semibold mb-2">
          <span className="mr-2 text-xl md:text-base">📊</span>
          실시간 금니 시세
        </div>
        <div className="text-yellow-300 text-base md:text-sm font-medium">
          {formatDate(goldPrice.date)} 기준
        </div>
      </div>

      <div className="space-y-3 md:space-y-3">
        {Object.entries(GOLD_TYPES).map(([key, label]) => {
          const animatedPrice = getAnimatedPrice(key)
          const colors = goldTypeColors[key as GoldType]

          return (
            <div key={key} className={`bg-black rounded-lg shadow-md p-4 md:p-4 border-l-4 ${colors.border}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-12 h-12 md:w-10 md:h-10 bg-gradient-to-r ${colors.bg} rounded-full flex items-center justify-center mr-3`}>
                    <span className="text-black font-bold text-sm md:text-xs">{label.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-yellow-400 text-lg md:text-base">{label}</div>
                    <div className="text-base md:text-sm text-yellow-200">1g당 매입가</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl md:text-2xl font-bold ${colors.text} transition-all duration-100`}>
                    {formatPrice(animatedPrice)}
                  </div>
                  <div className="text-base md:text-sm text-yellow-200">원</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-yellow-600/30">
        <p className="text-sm md:text-xs text-yellow-300 text-center leading-relaxed">
          💡 표준 합금 기준 단가이며, 실제 감정 시 함량이 높을 경우 금액이 인상될 수 있습니다.
        </p>
      </div>
    </div>
  )
}