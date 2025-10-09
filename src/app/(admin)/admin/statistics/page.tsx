'use client'

import { useState, useEffect } from 'react'
import { getPurchaseRequests, getUsers } from '@/lib/supabase/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PurchaseRequest, User } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

interface StatCard {
  title: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function StatisticsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // 기본 30일

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [requestsData, usersData] = await Promise.all([
        getPurchaseRequests(),
        getUsers()
      ])
      setRequests(requestsData)
      setUsers(usersData)
    } catch (error) {
      console.error('통계 데이터 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 통계 계산
  const getFilteredRequests = () => {
    const daysAgo = parseInt(dateRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

    return requests.filter(request =>
      new Date(request.created_at) >= cutoffDate
    )
  }

  const filteredRequests = getFilteredRequests()
  const completedRequests = filteredRequests.filter(r => r.status === 'deposited')

  const totalRevenue = completedRequests.reduce((sum, request) =>
    sum + (request.final_price || 0), 0
  )

  const avgProcessingTime = requests.length > 0
    ? Math.round(requests.reduce((sum, request) => {
        const created = new Date(request.created_at)
        const updated = new Date(request.updated_at)
        return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      }, 0) / requests.length)
    : 0

  const statusCounts = filteredRequests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const customerCount = users.filter(u => u.role === 'customer').length

  const statCards: StatCard[] = [
    {
      title: '총 신청 수',
      value: filteredRequests.length,
      icon: DocumentCheckIcon,
      color: 'bg-blue-500'
    },
    {
      title: '완료된 거래',
      value: completedRequests.length,
      icon: ChartBarIcon,
      color: 'bg-green-500'
    },
    {
      title: '총 매출',
      value: formatCurrency(totalRevenue),
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    },
    {
      title: '고객 수',
      value: customerCount,
      icon: UsersIcon,
      color: 'bg-purple-500'
    },
    {
      title: '평균 처리 시간',
      value: `${avgProcessingTime}일`,
      icon: ClockIcon,
      color: 'bg-indigo-500'
    },
    {
      title: '평균 거래액',
      value: completedRequests.length > 0
        ? formatCurrency(totalRevenue / completedRequests.length)
        : '₩0',
      icon: StarIcon,
      color: 'bg-pink-500'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 통계 대시보드</h1>
          <p className="text-gray-600">비즈니스 성과와 주요 지표를 확인하세요</p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">최근 7일</option>
            <option value="30">최근 30일</option>
            <option value="90">최근 90일</option>
            <option value="365">최근 1년</option>
          </select>
        </div>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${card.color} rounded-md p-3`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.title}
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {card.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 상태별 통계 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">상태별 신청 현황</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">
                  {getStatusText(status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 최근 거래 내역 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">최근 완료된 거래</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  신청번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  거래금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  완료일
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {completedRequests.slice(0, 10).map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.request_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(request.final_price || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// 상태 텍스트 변환 함수
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '신청 완료',
    shipped: '발송됨',
    received: '접수 완료',
    evaluating: '감정 중',
    evaluated: '감정 완료',
    confirmed: '정산 확정',
    deposited: '입금 완료'
  }
  return statusMap[status] || status
}