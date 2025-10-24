'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { maskName, formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

interface PurchaseRequest {
  id: string
  customer_name: string
  estimated_price: number
  final_price: number | null
  status: string
  created_at: string
}

export default function PurchaseStatusPage() {
  const [purchases, setPurchases] = useState<PurchaseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const itemsPerPage = 20

  useEffect(() => {
    fetchPurchases()
  }, [page])

  // 상태별 라벨 및 색상 반환
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
      pending: { label: '신청완료', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      shipped: { label: '발송완료', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      received: { label: '입고완료', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      evaluating: { label: '감정중', color: 'text-orange-600', bgColor: 'bg-orange-100' },
      evaluated: { label: '감정완료', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      approved: { label: '승인완료', color: 'text-green-600', bgColor: 'bg-green-100' },
      confirmed: { label: '확인완료', color: 'text-green-600', bgColor: 'bg-green-100' },
      paid: { label: '정산완료', color: 'text-green-600', bgColor: 'bg-green-100' },
      deposited: { label: '입금완료', color: 'text-green-600', bgColor: 'bg-green-100' }
    }
    return statusMap[status] || { label: '처리중', color: 'text-gray-600', bgColor: 'bg-gray-100' }
  }

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      const { data, error, count } = await supabase
        .from('purchase_requests')
        .select('id, customer_name, estimated_price, final_price, status, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      if (data) {
        setPurchases(prev => page === 1 ? data : [...prev, ...data])
        setHasMore(data.length === itemsPerPage)
      }
    } catch (error) {
      console.error('매입 현황 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-zinc-900 to-black border-b border-yellow-600/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">
                실시간 매입 현황
              </h1>
              <p className="text-yellow-200">
                전체 고객님의 금니 매입 신청 현황을 실시간으로 확인하세요
              </p>
            </div>
            <Link
              href="/"
              className="px-6 py-3 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="container mx-auto px-4 py-8">
        {loading && page === 1 ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-zinc-900 rounded-lg p-6 border border-yellow-600/30 animate-pulse">
                <div className="h-6 bg-zinc-800 rounded mb-2"></div>
                <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 매입 현황 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {purchases.map((purchase) => {
                const statusInfo = getStatusInfo(purchase.status)
                const amount = purchase.final_price || purchase.estimated_price
                return (
                  <div
                    key={purchase.id}
                    className="bg-gradient-to-br from-zinc-900 to-black rounded-lg shadow-lg border border-yellow-600/30 p-6 hover:shadow-xl hover:shadow-yellow-500/20 transition-all"
                  >
                    {/* 고객명과 날짜 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-lg">
                            {maskName(purchase.customer_name)[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-yellow-400 text-lg">
                            {maskName(purchase.customer_name)}
                          </div>
                          <div className="text-xs text-yellow-200">
                            {new Date(purchase.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              timeZone: 'UTC'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </div>
                    </div>

                    {/* 금액 */}
                    <div className="bg-black rounded-lg p-4 border border-yellow-600/20">
                      <div className="text-sm text-yellow-200 mb-1">
                        {purchase.final_price ? '최종 매입가' : '예상 매입가'}
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {formatCurrency(amount)}
                      </div>
                    </div>

                    {/* 신청 시간 */}
                    <div className="mt-4 flex items-center text-xs text-yellow-200">
                      <span className="mr-1">⏰</span>
                      {new Date(purchase.created_at).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'UTC'
                      })} 신청
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 더보기 버튼 */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '로딩 중...' : '더 보기'}
                </button>
              </div>
            )}

            {/* 데이터 없음 */}
            {purchases.length === 0 && !loading && (
              <div className="bg-zinc-900 rounded-lg p-12 text-center border border-yellow-600/30">
                <span className="text-6xl mb-4 block">📊</span>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                  매입 현황이 없습니다
                </h3>
                <p className="text-yellow-200 mb-6">
                  첫 번째 매입 신청자가 되어보세요!
                </p>
                <Link
                  href="/apply"
                  className="inline-block px-6 py-3 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                >
                  매입 신청하기
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
