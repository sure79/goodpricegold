'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSettlements } from '@/lib/supabase/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import type { Settlement } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function SettlementsPage() {
  const { user } = useAuthStore()
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSettlements = async () => {
      if (!user) return

      try {
        console.log('정산 내역 조회 시작 - 사용자 ID:', user.id)
        const data = await getSettlements(user.id)
        console.log('정산 내역 조회 결과:', data.length, '건')
        setSettlements(data)
      } catch (error) {
        console.error('정산 내역 조회 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettlements()
  }, [user])

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '처리 대기'
      case 'processing': return '처리 중'
      case 'completed': return '송금 완료'
      case 'failed': return '처리 실패'
      default: return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
          <h1 className="text-2xl font-bold text-gray-900">💳 정산 내역</h1>
          <p className="mt-1 text-sm text-gray-600">
            총 {settlements.length}건의 정산 내역입니다.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-amber-600 hover:text-amber-500 text-sm font-medium"
        >
          ← 대시보드
        </Link>
      </div>

      {settlements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl text-gray-300 mb-4">💳</div>
          <p className="text-gray-500 mb-4">아직 정산 내역이 없습니다.</p>
          <p className="text-sm text-gray-400">
            감정이 완료되고 확인을 완료하시면 정산이 진행됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {settlements.map((settlement) => (
            <div key={settlement.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    정산번호: {settlement.settlement_number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    처리일: {formatDate(settlement.created_at)}
                  </p>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(settlement.payment_status)}`}>
                  {getPaymentStatusText(settlement.payment_status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">최종 매입가</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(settlement.final_amount)}
                  </p>
                </div>

                {settlement.deduction_amount > 0 && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-600 mb-1">
                      차감액 {settlement.deduction_reason && `(${settlement.deduction_reason})`}
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      -{formatCurrency(settlement.deduction_amount)}
                    </p>
                  </div>
                )}

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">실 정산액</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(settlement.net_amount)}
                  </p>
                </div>
              </div>

              {settlement.payment_method && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">정산 방법</p>
                      <p className="font-medium">
                        {settlement.payment_method === 'bank_transfer' ? '계좌 이체' : '현금'}
                      </p>
                    </div>

                    {settlement.payment_date && (
                      <div>
                        <p className="text-gray-500 mb-1">송금 완료일</p>
                        <p className="font-medium">{formatDate(settlement.payment_date)}</p>
                      </div>
                    )}
                  </div>

                  {settlement.bank_name && settlement.account_number && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">송금 계좌:</span> {settlement.bank_name} {settlement.account_number} ({settlement.account_holder})
                      </p>
                    </div>
                  )}
                </div>
              )}

              {settlement.payment_status === 'completed' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-green-400 mr-2">✅</div>
                    <div className="text-sm text-green-800">
                      <p className="font-medium">정산이 완료되었습니다</p>
                      <p>계좌를 확인해보세요. 문의사항이 있으시면 고객센터로 연락주세요.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 정산 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">💡 정산 안내</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• 감정 완료 후 고객님이 확인을 완료하시면 정산이 시작됩니다.</p>
          <p>• 정산 처리는 영업일 기준 1-2일 소요됩니다.</p>
          <p>• 계좌 정보 변경이 필요하시면 고객센터로 연락주세요.</p>
          <p>• 정산 완료 후 영수증이 필요하시면 별도 요청해주세요.</p>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="font-medium text-blue-900">고객센터: 1588-1234 (평일 09:00-18:00)</p>
        </div>
      </div>
    </div>
  )
}