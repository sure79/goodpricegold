'use client'

import { useState, useEffect } from 'react'
import { maskName, formatCurrency, formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

interface RecentPurchase {
  id: string
  customer_name: string
  amount: number
  created_at: string
}

export default function ApplicationStatus() {
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentPurchases()
  }, [])

  const fetchRecentPurchases = async () => {
    try {
      // 최근 정산 완료된 매입 건 조회 (개인정보 보호를 위해 최소 정보만)
      const { data, error } = await supabase
        .from('purchase_requests')
        .select('id, customer_name, total_amount, created_at')
        .in('status', ['deposited', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      if (data) {
        setRecentPurchases(data.map(item => ({
          id: item.id,
          customer_name: item.customer_name || '고객',
          amount: item.total_amount || 0,
          created_at: item.created_at
        })))
      }
    } catch (error) {
      console.error('최근 매입 현황 조회 실패:', error)
      setRecentPurchases([])
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
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-2">
          <span className="mr-2">💰</span>
          최근 매입 현황
        </div>
        <div className="text-blue-700 text-sm font-medium">
          실시간 업데이트
        </div>
      </div>

      {/* 최근 매입 내역 */}
      <div className="space-y-3">
        {recentPurchases.length > 0 ? (
          recentPurchases.map((purchase) => (
            <div key={purchase.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {maskName(purchase.customer_name)[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {maskName(purchase.customer_name)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(purchase.created_at).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">
                    {formatCurrency(purchase.amount)}
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    ✓ 입금완료
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <span className="text-4xl mb-2 block">📊</span>
            <p className="text-gray-500 text-sm">최근 매입 현황 준비 중...</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-blue-300">
        <div className="flex items-center justify-center text-blue-700 text-xs">
          <span className="mr-1">⚡</span>
          평균 처리시간: <strong className="ml-1">2-3시간</strong>
        </div>
      </div>
    </div>
  )
}
