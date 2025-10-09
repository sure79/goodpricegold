'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import StatsCards from '@/components/admin/StatsCards'
import GoldPriceManagement from '@/components/admin/GoldPriceManagement'
import { getPurchaseRequests, getSettlements, getPurchaseRequestStats } from '@/lib/supabase/database'
import { formatCurrency, formatDate, getStatusText, getStatusColor } from '@/lib/utils'
import type { PurchaseRequest, Settlement } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AdminDashboard() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [stats, setStats] = useState({
    todayRequests: 0,
    pendingRequests: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
    avgProcessingTime: 0,
    satisfactionRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsData, settlementsData, statsData] = await Promise.all([
          getPurchaseRequests(),
          getSettlements(),
          getPurchaseRequestStats(),
        ])

        setRequests(requestsData)
        setSettlements(settlementsData)
        setStats(statsData)
      } catch (error) {
        console.error('데이터 로딩 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }


  const recentRequests = requests.slice(0, 10)
  const urgentRequests = requests.filter(r => r.status === 'received' || r.status === 'evaluating').slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-gray-600">
          전체 서비스 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <StatsCards stats={stats} />

      {/* 금니 시세 관리 */}
      <GoldPriceManagement />

      {/* 빠른 액션 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">빠른 액션</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/requests"
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <h4 className="font-medium text-blue-900">신청 관리</h4>
                <p className="text-sm text-blue-700">매입 신청 처리</p>
              </div>
            </Link>

            <Link
              href="/admin/settlements"
              className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">💳</div>
                <h4 className="font-medium text-green-900">정산 처리</h4>
                <p className="text-sm text-green-700">입금 및 정산 관리</p>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <h4 className="font-medium text-purple-900">회원 관리</h4>
                <p className="text-sm text-purple-700">고객 정보 관리</p>
              </div>
            </Link>

            <Link
              href="/admin/inquiries"
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-medium text-blue-900">문의 관리</h4>
                <p className="text-sm text-blue-700">고객 문의 및 응답 관리</p>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <h4 className="font-medium text-blue-900">설정</h4>
                <p className="text-sm text-blue-700">시세 및 시스템 설정</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 우선 처리 항목 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">우선 처리 항목</h3>
              <Link href="/admin/requests" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                전체 보기
              </Link>
            </div>

            {urgentRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">우선 처리할 항목이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {urgentRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{request.request_number}</p>
                        <p className="text-sm text-gray-500">{request.customer_name}</p>
                        <p className="text-xs text-gray-400">{formatDate(request.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                        <p className="text-sm text-gray-900 mt-1">{formatCurrency(request.estimated_price || 0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 최근 신청 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">최근 신청</h3>
              <Link href="/admin/requests" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                전체 보기
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">최근 신청이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {recentRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{request.request_number}</p>
                        <p className="text-sm text-gray-500">{request.customer_name}</p>
                        <p className="text-xs text-gray-400">{formatDate(request.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                        <p className="text-sm text-gray-900 mt-1">{formatCurrency(request.estimated_price || 0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}