'use client'

import { useState, useEffect } from 'react'
import { GOLD_TYPES, type GoldType } from '@/types'

interface GoldPrice {
  id: string
  date: string
  price_porcelain: number
  price_inlay_s: number
  price_inlay: number
  price_crown_pt: number
  price_crown_st: number
  price_crown_at: number
  updated_by?: string
  updated_at?: string
}

export default function GoldPriceManagement() {
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [formData, setFormData] = useState({
    price_porcelain: '',
    price_inlay_s: '',
    price_inlay: '',
    price_crown_pt: '',
    price_crown_st: '',
    price_crown_at: ''
  })

  // 14k, 18k 기본 입력값
  const [baseGoldPrices, setBaseGoldPrices] = useState({
    gold_14k: '',
    gold_18k: ''
  })

  // 자동 계산된 가격들
  const [calculatedPrices, setCalculatedPrices] = useState({
    crown_at: 0,
    crown_st: 0,
    crown_pt: 0,
    inlay: 0,
    inlay_s: 0,
    porcelain: 0
  })

  useEffect(() => {
    fetchCurrentPrice()
  }, [])

  const fetchCurrentPrice = async () => {
    try {
      const response = await fetch('/api/gold-price/current')
      if (response.ok) {
        const data = await response.json()
        setGoldPrice(data)
        setFormData({
          price_porcelain: data.price_porcelain?.toString() || '',
          price_inlay_s: data.price_inlay_s?.toString() || '',
          price_inlay: data.price_inlay?.toString() || '',
          price_crown_pt: data.price_crown_pt?.toString() || '',
          price_crown_st: data.price_crown_st?.toString() || '',
          price_crown_at: data.price_crown_at?.toString() || ''
        })
      }
    } catch (error) {
      console.error('금 시세 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/gold-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_porcelain: parseInt(formData.price_porcelain),
          price_inlay_s: parseInt(formData.price_inlay_s),
          price_inlay: parseInt(formData.price_inlay),
          price_crown_pt: parseInt(formData.price_crown_pt),
          price_crown_st: parseInt(formData.price_crown_st),
          price_crown_at: parseInt(formData.price_crown_at)
        })
      })

      if (response.ok) {
        const updatedPrice = await response.json()
        setGoldPrice(updatedPrice)
        alert('금 시세가 업데이트되었습니다.')
      } else {
        alert('금 시세 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('금 시세 업데이트 실패:', error)
      alert('서버 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDailySync = async () => {
    try {
      setSyncing(true)
      const response = await fetch('/api/gold-price/daily-sync', {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          await fetchCurrentPrice() // 업데이트된 시세 다시 조회
          alert('매일 시세 동기화가 완료되었습니다.')
        } else {
          alert('시세 동기화에 실패했습니다: ' + result.message)
        }
      } else {
        alert('시세 동기화에 실패했습니다.')
      }
    } catch (error) {
      console.error('시세 동기화 실패:', error)
      alert('서버 오류가 발생했습니다.')
    } finally {
      setSyncing(false)
    }
  }

  // 14k, 18k 입력 시 자동 계산
  const handleBaseGoldPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numericValue = value.replace(/[^0-9]/g, '')

    setBaseGoldPrices(prev => {
      const updated = {
        ...prev,
        [name]: numericValue
      }

      // 자동 계산 실행
      calculatePrices(updated.gold_14k, updated.gold_18k)

      return updated
    })
  }

  // 금니 가격 자동 계산
  const calculatePrices = (gold14k: string, gold18k: string) => {
    const gold14kNum = parseFloat(gold14k) || 0
    const gold18kNum = parseFloat(gold18k) || 0

    // 14k 기준 계산
    const crown_at = Math.floor(gold14kNum * 1.2)
    const crown_st = Math.floor(crown_at * 1.15)
    const crown_pt = Math.floor(crown_at * 1.2)

    // 18k 기준 계산
    const inlay = Math.floor(gold18kNum * 1.2)
    const inlay_s = Math.floor(inlay * 1.6) // 중간 계산값 (포세린 계산을 위해)
    const porcelain = Math.floor(inlay_s * 1.3)

    // 계산된 가격 업데이트
    setCalculatedPrices({
      crown_at,
      crown_st,
      crown_pt,
      inlay,
      inlay_s, // UI 표시용
      porcelain
    })

    // formData도 업데이트 (저장을 위해)
    setFormData({
      price_porcelain: porcelain.toString(),
      price_inlay_s: inlay_s.toString(),
      price_inlay: inlay.toString(),
      price_crown_pt: crown_pt.toString(),
      price_crown_st: crown_st.toString(),
      price_crown_at: crown_at.toString()
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // 숫자만 입력 가능하도록 필터링
    const numericValue = value.replace(/[^0-9]/g, '')
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">💰 금니 시세 관리</h2>
        <p className="text-sm text-gray-600 mt-1">
          오늘의 금니 시세를 설정하고 관리합니다.
        </p>
      </div>

      <div className="p-6">
        {/* 현재 시세 표시 */}
        {goldPrice && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">현재 설정된 시세</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">포세린</span>
                <span className="font-semibold text-yellow-600">
                  {formatPrice(goldPrice.price_porcelain)}원
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">인레이S</span>
                <span className="font-semibold text-purple-600">
                  {formatPrice(goldPrice.price_inlay_s)}원
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">인레이</span>
                <span className="font-semibold text-blue-600">
                  {formatPrice(goldPrice.price_inlay)}원
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">크라운PT</span>
                <span className="font-semibold text-blue-700">
                  {formatPrice(goldPrice.price_crown_pt)}원
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">크라운ST</span>
                <span className="font-semibold text-rose-600">
                  {formatPrice(goldPrice.price_crown_st)}원
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">크라운AT</span>
                <span className="font-semibold text-red-600">
                  {formatPrice(goldPrice.price_crown_at)}원
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              마지막 업데이트: {goldPrice.updated_at ? new Date(goldPrice.updated_at).toLocaleString('ko-KR') : '정보 없음'}
            </div>
          </div>
        )}

        {/* 시세 수정 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 14k, 18k 기본 입력란 */}
          <div className="bg-gradient-to-r from-yellow-50 to-blue-50 border-2 border-yellow-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 기본 금 시세 입력</h3>
            <p className="text-sm text-gray-600 mb-4">14k와 18k 금니 가격만 입력하면 나머지 금니 종류의 가격이 자동으로 계산됩니다.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="gold_14k" className="block text-lg font-bold text-gray-800 mb-2">
                  🥇 금니 14K (1g당)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="gold_14k"
                    name="gold_14k"
                    value={baseGoldPrices.gold_14k}
                    onChange={handleBaseGoldPriceChange}
                    className="w-full px-4 py-3 text-lg border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="예: 35000"
                    required
                  />
                  <span className="absolute right-4 top-3 text-gray-600 font-medium">원</span>
                </div>
                {baseGoldPrices.gold_14k && (
                  <p className="mt-2 text-sm font-semibold text-yellow-700">
                    {formatPrice(parseInt(baseGoldPrices.gold_14k))}원
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="gold_18k" className="block text-lg font-bold text-gray-800 mb-2">
                  🥇 금니 18K (1g당)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="gold_18k"
                    name="gold_18k"
                    value={baseGoldPrices.gold_18k}
                    onChange={handleBaseGoldPriceChange}
                    className="w-full px-4 py-3 text-lg border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 45000"
                    required
                  />
                  <span className="absolute right-4 top-3 text-gray-600 font-medium">원</span>
                </div>
                {baseGoldPrices.gold_18k && (
                  <p className="mt-2 text-sm font-semibold text-blue-700">
                    {formatPrice(parseInt(baseGoldPrices.gold_18k))}원
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 자동 계산된 금니 종류별 가격 표시 */}
          {(baseGoldPrices.gold_14k || baseGoldPrices.gold_18k) && (
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 자동 계산된 금니 종류별 가격</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 14k 기준 계산 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-3">14K 기준</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">크라운 AT</span>
                      <span className="font-bold text-red-600">{formatPrice(calculatedPrices.crown_at)}원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">크라운 ST</span>
                      <span className="font-bold text-rose-600">{formatPrice(calculatedPrices.crown_st)}원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">크라운 PT</span>
                      <span className="font-bold text-blue-700">{formatPrice(calculatedPrices.crown_pt)}원</span>
                    </div>
                  </div>
                </div>

                {/* 18k 기준 계산 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3">18K 기준</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">포세린</span>
                      <span className="font-bold text-yellow-600">{formatPrice(calculatedPrices.porcelain)}원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">인레이S</span>
                      <span className="font-bold text-purple-600">{formatPrice(calculatedPrices.inlay_s)}원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">인레이</span>
                      <span className="font-bold text-blue-600">{formatPrice(calculatedPrices.inlay)}원</span>
                    </div>
                  </div>
                </div>

                {/* 계산 공식 안내 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">📐 계산 공식</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><strong>14K 기준:</strong></p>
                    <p>• 크라운 AT = 14K × 1.2</p>
                    <p>• 크라운 ST = AT × 1.15</p>
                    <p>• 크라운 PT = AT × 1.2</p>
                    <p className="mt-2"><strong>18K 기준:</strong></p>
                    <p>• 인레이 = 18K × 1.2</p>
                    <p>• 인레이S = 인레이 × 1.6</p>
                    <p>• 포세린 = 인레이S × 1.3</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-blue-400 mr-2">ℹ️</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">시세 설정 안내</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>입력한 시세는 즉시 홈페이지에 반영됩니다.</li>
                  <li>시세는 오늘 날짜 기준으로 저장됩니다.</li>
                  <li>실제 매입가는 금니의 상태와 순도에 따라 달라질 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <a
              href="/admin/gold-prices"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              📊 시세 히스토리 보기
            </a>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={fetchCurrentPrice}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleDailySync}
                disabled={syncing}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? '동기화 중...' : '시세 동기화'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '시세 업데이트'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}