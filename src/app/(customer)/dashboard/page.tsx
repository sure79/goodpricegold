'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusText, getStatusColor } from '@/lib/utils'
import { getPurchaseRequests, updatePurchaseRequestStatus } from '@/lib/supabase/database'
import { useAuthStore } from '@/stores/authStore'
import type { PurchaseRequest } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function CustomerDashboard() {
  const { user } = useAuthStore()
  const [allRequests, setAllRequests] = useState<PurchaseRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [confirming, setConfirming] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        console.log('Fetching data for user:', user.id)

        // 실제 데이터베이스에서 가져오기
        const userRequests = await getPurchaseRequests(user.id)

        console.log('Fetched requests:', userRequests.length)

        setAllRequests(userRequests)
      } catch (error) {
        console.error('데이터 조회 실패:', error)

        // 에러가 발생해도 빈 배열로 설정
        setAllRequests([])
      }

      setIsLoading(false)
    }

    fetchData()
  }, [user])

  const handleConfirmEvaluation = async (requestId: string) => {
    try {
      setConfirming(requestId)
      await updatePurchaseRequestStatus(requestId, 'confirmed')

      // 로컬 상태 업데이트
      setAllRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: 'confirmed' as PurchaseRequest['status'], updated_at: new Date().toISOString() }
            : req
        )
      )

      alert('감정 결과를 확인했습니다. 정산 절차가 진행됩니다.')
    } catch (error) {
      console.error('확인 처리 실패:', error)
      alert('확인 처리에 실패했습니다.')
    } finally {
      setConfirming(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const recentRequests = allRequests.slice(0, 5)
  const totalTransactions = allRequests.length
  // 완료된 거래의 최종 가격 합계
  const totalAmount = allRequests
    .filter(r => r.status === 'deposited' && r.final_price)
    .reduce((sum, r) => sum + (r.final_price || 0), 0)
  const activeRequests = allRequests.filter(r => !['paid', 'cancelled', 'deposited'].includes(r.status)).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🪙 마이페이지</h1>
        <p className="mt-1 text-sm text-gray-600">
          안녕하세요, {user?.name}님! 금니 매입 현황을 확인하세요.
        </p>
      </div>

      {/* 진행 현황 요약 */}
      <div className="bg-gradient-to-r from-blue-50 to-yellow-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">📊 현재 진행 현황</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {allRequests.filter(r => ['received', 'evaluating'].includes(r.status)).length}
            </div>
            <div className="text-sm text-gray-600">처리 중</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {allRequests.filter(r => r.status === 'evaluated').length}
            </div>
            <div className="text-sm text-gray-600">감정 완료</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {allRequests.filter(r => ['confirmed', 'paid'].includes(r.status)).length}
            </div>
            <div className="text-sm text-gray-600">정산 중</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {allRequests.filter(r => r.status === 'deposited').length}
            </div>
            <div className="text-sm text-gray-600">완료</div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">📦</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">총 거래 횟수</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalTransactions}회</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">총 정산 금액</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalAmount)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">🔄</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">진행중인 신청</dt>
                  <dd className="text-lg font-medium text-gray-900">{activeRequests}건</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">빠른 액션</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/apply"
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📝</div>
                <h4 className="font-medium text-blue-900">매입 신청</h4>
                <p className="text-sm text-blue-700">새로운 금니 매입 신청</p>
              </div>
            </Link>

            <Link
              href="/history"
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <h4 className="font-medium text-blue-900">신청 내역</h4>
                <p className="text-sm text-blue-700">과거 신청 내역 확인</p>
              </div>
            </Link>

            <Link
              href="/reviews"
              className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">⭐</div>
                <h4 className="font-medium text-purple-900">후기 작성</h4>
                <p className="text-sm text-purple-700">서비스 후기 관리</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 최근 신청 내역 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">최근 신청 내역</h3>
              <Link href="/history" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                전체 보기
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">아직 신청 내역이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{request.request_number}</p>
                        <p className="text-sm text-gray-500">{formatDate(request.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                        {request.status === 'evaluated' && request.final_price && (
                          <p className="text-sm text-gray-900 mt-1">
                            최종가: {formatCurrency(request.final_price)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 감정 완료된 경우 추가 정보 표시 */}
                    {request.status === 'evaluated' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {request.final_weight && (
                            <div>
                              <span className="text-gray-500">최종 무게:</span>
                              <span className="ml-1 font-medium">{request.final_weight}g</span>
                            </div>
                          )}
                          {request.final_price && (
                            <div>
                              <span className="text-gray-500">최종 매입가:</span>
                              <span className="ml-1 font-medium text-green-600">{formatCurrency(request.final_price)}</span>
                            </div>
                          )}
                        </div>

                        {request.evaluation_notes && (
                          <div className="mt-2">
                            <span className="text-gray-500 text-sm">감정 메모:</span>
                            <p className="text-sm text-gray-700 mt-1">{request.evaluation_notes}</p>
                          </div>
                        )}

                        {request.evaluation_images && request.evaluation_images.length > 0 && (
                          <div className="mt-3">
                            <span className="text-gray-500 text-sm">감정 사진:</span>
                            <div className="flex space-x-2 mt-1">
                              {request.evaluation_images.slice(0, 3).map((imageUrl, index) => (
                                <img
                                  key={index}
                                  src={imageUrl}
                                  alt={`감정 사진 ${index + 1}`}
                                  className="w-16 h-16 sm:w-12 sm:h-12 object-cover rounded border cursor-pointer"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                />
                              ))}
                              {request.evaluation_images.length > 3 && (
                                <div className="flex items-center justify-center w-16 h-16 sm:w-12 sm:h-12 bg-gray-100 rounded border text-xs text-gray-600">
                                  +{request.evaluation_images.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex justify-between items-center">
                          <Link
                            href={`/tracking/${request.request_number}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            자세히 보기 →
                          </Link>

                          {request.status === 'evaluated' && (
                            <button
                              onClick={() => handleConfirmEvaluation(request.id)}
                              disabled={confirming === request.id}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                              {confirming === request.id ? (
                                <div className="flex items-center">
                                  <LoadingSpinner size="sm" className="mr-1" />
                                  처리중...
                                </div>
                              ) : (
                                '확인 완료'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
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
