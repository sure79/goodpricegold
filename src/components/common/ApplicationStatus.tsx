'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { maskName, formatCurrency, formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

interface RecentPurchase {
  id: string
  customer_name: string
  amount: number
  status: string
  created_at: string
}

export default function ApplicationStatus() {
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 로드
    fetchRecentPurchases()

    // 30초마다 자동 새로고침
    const interval = setInterval(() => {
      fetchRecentPurchases()
    }, 30000) // 30초

    return () => clearInterval(interval)
  }, [])

  // 상태별 라벨 및 색상 반환
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: '신청완료', color: 'text-yellow-600' },
      shipped: { label: '발송완료', color: 'text-blue-600' },
      received: { label: '입고완료', color: 'text-blue-600' },
      evaluating: { label: '감정중', color: 'text-orange-600' },
      evaluated: { label: '감정완료', color: 'text-purple-600' },
      approved: { label: '승인완료', color: 'text-green-600' },
      confirmed: { label: '확인완료', color: 'text-green-600' },
      paid: { label: '정산완료', color: 'text-green-600' },
      deposited: { label: '입금완료', color: 'text-green-600' }
    }
    return statusMap[status] || { label: '처리중', color: 'text-gray-600' }
  }

  const fetchRecentPurchases = async () => {
    try {
      // 실시간 매입 신청 현황 조회 (모든 상태 포함)
      const { data, error } = await supabase
        .from('purchase_requests')
        .select('id, customer_name, estimated_price, final_price, status, created_at')
        .order('created_at', { ascending: false })
        .limit(7)

      if (error) throw error

      if (data) {
        setRecentPurchases(data.map(item => ({
          id: item.id,
          customer_name: item.customer_name || '고객',
          amount: item.final_price || item.estimated_price || 0,
          status: item.status,
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
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-yellow-600/30">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-800 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-zinc-800 rounded"></div>
            <div className="h-4 bg-zinc-800 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl shadow-lg border border-yellow-600/30 p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-semibold mb-2">
          <span className="mr-2">💰</span>
          최근 매입 현황
        </div>
        <div className="text-yellow-300 text-sm font-medium">
          실시간 업데이트
        </div>
      </div>

      {/* 최근 매입 내역 */}
      <div className="space-y-3">
        {recentPurchases.length > 0 ? (
          recentPurchases.map((purchase) => {
            const statusInfo = getStatusInfo(purchase.status)
            return (
              <div key={purchase.id} className="bg-black rounded-lg shadow-sm p-4 hover:shadow-lg hover:shadow-yellow-500/20 transition-all border border-yellow-600/20">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">
                        {maskName(purchase.customer_name)[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-yellow-400 text-sm">
                        {maskName(purchase.customer_name)}
                      </div>
                      <div className="text-xs text-yellow-200">
                        {new Date(purchase.created_at).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          timeZone: 'UTC'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-400">
                      {formatCurrency(purchase.amount)}
                    </div>
                    <div className={`text-xs ${statusInfo.color} font-medium`}>
                      ✓ {statusInfo.label}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-black rounded-lg shadow-sm p-8 text-center border border-yellow-600/30">
            <span className="text-4xl mb-2 block">📊</span>
            <p className="text-yellow-200 text-sm">최근 매입 현황 준비 중...</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-yellow-600/30">
        <div className="flex items-center justify-center text-yellow-300 text-xs mb-4">
          <span className="mr-1">⚡</span>
          평균 처리시간: <strong className="ml-1">2-3시간</strong>
        </div>
        {recentPurchases.length > 0 && (
          <div className="text-center">
            <Link
              href="/purchase-status"
              className="inline-flex items-center text-yellow-400 px-4 py-2 rounded-lg font-medium hover:bg-zinc-800 transition-colors text-sm"
            >
              전체 매입 현황 보기
              <span className="ml-2">→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
