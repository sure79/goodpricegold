'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getPurchaseRequests } from '@/lib/supabase/database'
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { PurchaseRequest } from '@/types'

export default function TrackingIndexPage() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return

      try {
        const data = await getPurchaseRequests(user.id)
        setRequests(data)
      } catch (error) {
        console.error('신청 목록 조회 실패:', error)
        setRequests([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [user])

  const groupedRequests = useMemo(() => {
    if (!requests.length) return []

    return [
      {
        title: '진행 중',
        description: '접수부터 정산 확정 전까지의 신청입니다.',
        items: requests.filter((request) => !['deposited', 'paid', 'cancelled'].includes(request.status)),
      },
      {
        title: '완료',
        description: '정산이 완료된 신청입니다.',
        items: requests.filter((request) => ['deposited', 'paid'].includes(request.status)),
      },
    ]
  }, [requests])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!requests.length) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">📦 신청 추적</h1>
          <p className="mt-1 text-sm text-gray-600">
            아직 진행 중인 신청이 없습니다. 새 신청을 만들어 진행 상황을 확인해보세요.
          </p>
        </header>

        <div className="text-center py-12 bg-white shadow rounded-lg">
          <p className="text-gray-500 mb-4">등록된 매입 신청이 없습니다.</p>
          <Link
            href="/apply"
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            매입 신청하러 가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">📦 신청 추적</h1>
        <p className="text-sm text-gray-600">
          신청 상태를 단계별로 확인하고, 자세한 정보는 각 신청 상세 페이지에서 확인할 수 있습니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groupedRequests.map((group) => (
          <section key={group.title} className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
                  <p className="text-sm text-gray-500">{group.description}</p>
                </div>
                {group.items.length > 0 && (
                  <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-blue-50 text-blue-700">
                    {group.items.length}건
                  </span>
                )}
              </div>

              {group.items.length === 0 ? (
                <p className="text-sm text-gray-500">해당 상태의 신청이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {group.items.map((request) => (
                    <article key={request.id} className="border border-gray-100 rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{request.request_number}</h3>
                          <p className="text-xs text-gray-500">신청일 {formatDate(request.created_at)}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                        <div>
                          <span className="text-gray-500">신청자</span>
                          <p className="font-medium text-gray-800">{request.customer_name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">예상가</span>
                          <p className="font-medium text-gray-800">{formatCurrency(request.estimated_price || 0)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 sm:justify-between">
                        <Link
                          href={`/tracking/${request.request_number}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          진행 상황 보기 →
                        </Link>
                        {request.tracking_number && (
                          <span className="text-xs text-gray-500">운송장 {request.tracking_number}</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
