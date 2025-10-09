'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { getCurrentGoldPrice } from '@/lib/supabase/database'
import type { GoldPrice, GoldItem, GoldType } from '@/types'
import { GOLD_TYPES } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface CalculatorProps {
  onCalculated?: (items: GoldItem[], totalPrice: number) => void
}

export default function Calculator({ onCalculated }: CalculatorProps) {
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)
  const [items, setItems] = useState<GoldItem[]>([
    { type: 'inlay', quantity: 1, weight: 3.5 }
  ])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        const price = await getCurrentGoldPrice()
        setGoldPrice(price)
      } catch (error) {
        console.error('금 시세 조회 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGoldPrice()
  }, [])

  const addItem = () => {
    setItems([...items, { type: 'inlay', quantity: 1, weight: 3.5 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof GoldItem, value: string | number) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setItems(updatedItems)
  }

  const calculateTotalPrice = () => {
    if (!goldPrice) return 0

    return items.reduce((total, item) => {
      const priceKey = `price_${item.type}` as keyof GoldPrice
      const basePrice = goldPrice[priceKey] as number
      const itemWeight = item.weight || 3.5
      const itemPrice = basePrice * item.quantity
      return total + itemPrice
    }, 0)
  }

  const totalPrice = calculateTotalPrice()

  useEffect(() => {
    if (onCalculated) {
      onCalculated(items, totalPrice)
    }
  }, [items, totalPrice, onCalculated])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    )
  }

  if (!goldPrice) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">현재 금 시세 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-amber-900 mb-2">오늘의 금니 시세</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(GOLD_TYPES).map(([key, label]) => {
            const priceKey = `price_${key}` as keyof GoldPrice
            const price = goldPrice[priceKey] as number
            return (
              <div key={key}>
                <p className="text-sm text-amber-700">{label}</p>
                <p className="text-lg font-bold text-amber-900">{formatCurrency(price)}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">매입 품목</h3>
          <button
            onClick={addItem}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
          >
            품목 추가
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">금니 종류</label>
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(index, 'type', e.target.value as GoldType)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  >
                    {Object.entries(GOLD_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">수량</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="flex items-end">
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="w-full px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">예상 매입가</h3>
            <p className="text-sm text-gray-600">
              * 실제 매입가는 정밀 검사 후 확정됩니다
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-amber-600">{formatCurrency(totalPrice)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}