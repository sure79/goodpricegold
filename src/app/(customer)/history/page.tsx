'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPurchaseRequests } from '@/lib/supabase/database'
import { formatCurrency, formatDate, getStatusText, getStatusColor } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import type { PurchaseRequest } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function HistoryPage() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const abortController = new AbortController()

    const fetchRequests = async () => {
      if (!user) return

      try {
        const data = await getPurchaseRequests(user.id)

        // 컴포넌트가 언마운트되지 않았을 때만 상태 업데이트
        if (!abortController.signal.aborted) {
          setRequests(data)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('신청 내역 조회 실패:', error)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchRequests()

    // cleanup 함수
    return () => {
      abortController.abort()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">신청 내역</h1>
          <p className="mt-1 text-sm text-gray-600">
            총 {requests.length}건의 매입 신청 내역입니다.
          </p>
        </div>
        <Link
          href="/apply"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 whitespace-nowrap"
        >
          새 신청
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">아직 신청 내역이 없습니다.</p>
          <Link
            href="/apply"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
          >
            첫 번째 신청하기
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.request_number}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">신청일</p>
                          <p className="font-medium">{formatDate(request.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">매입 품목</p>
                          <p className="font-medium">
                            {request.items && request.items.length > 0
                              ? request.items.map(item => `${item.type} ${item.quantity}개`).join(', ')
                              : '정보 없음'
                            }
                          </p>
                        </div>
                        {request.final_price && (
                          <div>
                            <p className="text-gray-500">최종 매입가</p>
                            <p className="font-medium text-amber-600">
                              {formatCurrency(request.final_price)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex justify-between sm:justify-end">
                        <Link
                          href={`/tracking/${request.request_number}`}
                          className="text-amber-600 hover:text-amber-500 text-sm font-medium"
                        >
                          상세보기 →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}