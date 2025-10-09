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
  updated_by?: string
  updated_at?: string
}

export default function GoldPriceManagement() {
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [formData, setFormData] = useState({
    price_inlay: '',
    price_porcelain: '',
    price_crown_pt: '',
    price_crown_st: '',
    price_crown_at: ''
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
          price_inlay: data.price_inlay?.toString() || '',
          price_porcelain: data.price_porcelain?.toString() || '',
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
          price_inlay: parseInt(formData.price_inlay),
          price_porcelain: parseInt(formData.price_porcelain),
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">인레이</span>
                <span className="font-semibold text-amber-600">
                  {formatPrice(goldPrice.price_inlay)}원
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">포세린</span>
                <span className="font-semibold text-yellow-600">
                  {formatPrice(goldPrice.price_porcelain)}원
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">크라운PT</span>
                <span className="font-semibold text-orange-600">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(GOLD_TYPES).map(([key, label]) => (
              <div key={key}>
                <label htmlFor={`price_${key}`} className="block text-sm font-medium text-gray-700 mb-2">
                  {label} (1개당)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id={`price_${key}`}
                    name={`price_${key}`}
                    value={formData[`price_${key}` as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder={`예: ${key === 'inlay' ? '161670' : key === 'porcelain' ? '169890' : key === 'crown_pt' ? '144310' : key === 'crown_st' ? '112350' : '91340'}`}
                    required
                  />
                  <span className="absolute right-3 top-2 text-gray-500">원</span>
                </div>
                {formData[`price_${key}` as keyof typeof formData] && (
                  <p className="mt-1 text-sm text-gray-600">
                    {formatPrice(parseInt(formData[`price_${key}` as keyof typeof formData]))}원
                  </p>
                )}
              </div>
            ))}
          </div>

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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              📊 시세 히스토리 보기
            </a>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={fetchCurrentPrice}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                className="px-6 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
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