'use client'

import { useState, useEffect } from 'react'
import { GOLD_TYPES, type GoldType } from '@/types'

interface GoldPrice {
  id: string
  date: string
  price_inlay: number
  price_porcelain: number
  price_crown_pt: number
  price_crown_st: number
  price_crown_at: number
  updated_at?: string
}

export default function GoldPriceDisplay() {
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!goldPrice) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 오늘의 금니 시세</h3>
        <p className="text-gray-500">시세 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const goldTypeColors = {
    inlay: { bg: 'from-blue-400 to-blue-500', border: 'border-blue-500', text: 'text-blue-600' },
    porcelain: { bg: 'from-blue-300 to-blue-400', border: 'border-blue-400', text: 'text-blue-500' },
    crown_pt: { bg: 'from-blue-500 to-blue-600', border: 'border-blue-600', text: 'text-blue-700' },
    crown_st: { bg: 'from-blue-400 to-blue-500', border: 'border-blue-500', text: 'text-blue-600' },
    crown_at: { bg: 'from-blue-600 to-blue-700', border: 'border-blue-700', text: 'text-blue-800' }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-4 md:p-6">
      <div className="text-center mb-4 md:mb-6">
        <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-base md:text-sm font-semibold mb-2">
          <span className="mr-2 text-xl md:text-base">📊</span>
          실시간 금니 시세
        </div>
        <div className="text-blue-700 text-base md:text-sm font-medium">
          {formatDate(goldPrice.date)} 기준
        </div>
      </div>

      <div className="space-y-3 md:space-y-3">
        {Object.entries(GOLD_TYPES).map(([key, label]) => {
          const priceKey = `price_${key}` as keyof GoldPrice
          const price = goldPrice[priceKey] as number
          const colors = goldTypeColors[key as GoldType]

          return (
            <div key={key} className={`bg-white rounded-lg shadow-md p-4 md:p-4 border-l-4 ${colors.border}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-12 h-12 md:w-10 md:h-10 bg-gradient-to-r ${colors.bg} rounded-full flex items-center justify-center mr-3`}>
                    <span className="text-white font-bold text-sm md:text-xs">{label.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg md:text-base">{label}</div>
                    <div className="text-base md:text-sm text-gray-500">1개당 매입가</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl md:text-2xl font-bold ${colors.text}`}>
                    {formatPrice(price)}
                  </div>
                  <div className="text-base md:text-sm text-gray-500">원</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-yellow-300">
        <p className="text-sm md:text-xs text-yellow-700 text-center leading-relaxed">
          💡 <strong>최고가 보장:</strong> 타사 대비 최고가 매입을 약속드립니다<br/>
          * 왕관 및 정제 수수료 등의 별도 변동
        </p>
      </div>
    </div>
  )
}