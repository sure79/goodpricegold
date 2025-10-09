'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentGoldPrice, getGoldPriceHistory } from '@/lib/supabase/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { GoldPrice } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import GoldPriceManagement from '@/components/admin/GoldPriceManagement'

export default function SettingsPage() {
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([])
  const [currentPrice, setCurrentPrice] = useState<GoldPrice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    autoSync: true,
    syncTime: '09:00',
    priceMargin: 15, // 기본 15% 마진
    notifications: true,
    smsAlerts: false,
    emailAlerts: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [priceHistory, current] = await Promise.all([
        getGoldPriceHistory(30),
        getCurrentGoldPrice()
      ])

      setGoldPrices(priceHistory)
      setCurrentPrice(current)
    } catch (error) {
      console.error('데이터 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: boolean | string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = () => {
    // 관리자 UI 설정은 브라우저에 로컬 저장
    localStorage.setItem('adminSettings', JSON.stringify(settings))
    alert('설정이 저장되었습니다.')
  }

  const calculatePriceWithMargin = (basePrice: number) => {
    return Math.floor(basePrice * (1 - settings.priceMargin / 100))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚙️ 시스템 설정</h1>
          <p className="mt-1 text-sm text-gray-600">
            시세 관리, 알림 설정 및 시스템 환경을 관리하세요.
          </p>
        </div>
        <Link
          href="/admin"
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          대시보드로 돌아가기
        </Link>
      </div>

      {/* 시세 관리 섹션 */}
      <GoldPriceManagement />

      {/* 시세 설정 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">💰 시세 설정</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">자동 동기화 설정</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">매일 자동 시세 업데이트</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSync}
                      onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    동기화 시간
                  </label>
                  <input
                    type="time"
                    value={settings.syncTime}
                    onChange={(e) => handleSettingChange('syncTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">매입가 설정</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기본 마진 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={settings.priceMargin}
                    onChange={(e) => handleSettingChange('priceMargin', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    시세에서 차감할 기본 마진 (수수료, 순도 고려)
                  </p>
                </div>

                {currentPrice && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">예상 매입가</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>인레이 ({formatCurrency(currentPrice.price_inlay)})</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(calculatePriceWithMargin(currentPrice.price_inlay))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>포세린 ({formatCurrency(currentPrice.price_porcelain)})</span>
                        <span className="font-medium text-yellow-600">
                          {formatCurrency(calculatePriceWithMargin(currentPrice.price_porcelain))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 알림 설정 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">🔔 알림 설정</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">알림 활성화</span>
                <p className="text-xs text-gray-500">새로운 신청 및 중요 이벤트 알림</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">SMS 알림</span>
                <p className="text-xs text-gray-500">긴급 상황 시 SMS 발송</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsAlerts}
                  onChange={(e) => handleSettingChange('smsAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">이메일 알림</span>
                <p className="text-xs text-gray-500">일일 보고서 및 요약 정보</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 시세 히스토리 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">📊 시세 히스토리</h2>
        </div>
        <div className="p-6">
          {goldPrices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">시세 히스토리가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      인레이 시세
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      포세린 시세
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      변동률
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {goldPrices.slice(0, 10).map((price, index) => {
                    const prevPrice = goldPrices[index + 1]
                    const changeInlay = prevPrice
                      ? ((price.price_inlay - prevPrice.price_inlay) / prevPrice.price_inlay * 100)
                      : 0

                    return (
                      <tr key={price.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(price.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {formatCurrency(price.price_inlay)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-600">
                          {formatCurrency(price.price_porcelain)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {prevPrice ? (
                            <span className={changeInlay >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {changeInlay >= 0 ? '+' : ''}{changeInlay.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          설정 저장
        </button>
      </div>
    </div>
  )
}