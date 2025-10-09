'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import TrackingTimeline from '@/components/customer/TrackingTimeline'
import { getStatusHistory } from '@/lib/supabase/database'
import { supabase } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusText } from '@/lib/utils'
import type { PurchaseRequest, StatusHistory } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function TrackingPage() {
  const params = useParams()
  const [request, setRequest] = useState<PurchaseRequest | null>(null)
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRequest = async () => {
      if (!params.id) return

      try {
        // request_number로 데이터베이스에서 조회
        const { data, error } = await supabase
          .from('purchase_requests')
          .select('*')
          .eq('request_number', params.id)
          .single()

        if (error) {
          console.error('신청 정보 조회 실패:', error)
          setError('신청 정보를 찾을 수 없습니다.')
        } else {
          // items 필드가 없으면 기본값 설정
          const requestWithItems = {
            ...data,
            items: data.items || [{
              type: data.item_type || '18k',
              purity: data.item_type || '18k',
              quantity: 1,
              weight: data.final_weight || 0
            }]
          }
          setRequest(requestWithItems)

          const history = await getStatusHistory(requestWithItems.id)
          setStatusHistory(history)
        }
      } catch (error) {
        console.error('신청 정보 조회 실패:', error)
        setError('신청 정보를 불러올 수 없습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequest()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || '신청 정보를 찾을 수 없습니다.'}</p>
        <Link
          href="/history"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
        >
          신청 내역으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-0">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">매입 신청 추적</h1>
          <Link
            href="/history"
            className="text-amber-600 hover:text-amber-500 text-sm font-medium"
          >
            ← 전체 내역
          </Link>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          신청번호: {request.request_number}
        </p>
      </div>

      {/* 신청 정보 요약 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">신청 정보</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">기본 정보</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">신청자:</span> {request.customer_name}</p>
              <p><span className="font-medium">연락처:</span> {request.phone}</p>
              <p><span className="font-medium">신청일:</span> {formatDate(request.created_at)}</p>
              <p><span className="font-medium">상태:</span>
                <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                  {getStatusText(request.status)}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">매입 품목</h3>
            <div className="space-y-1 text-sm">
              {request.items.map((item, index) => (
                <p key={index}>
                  {item.type} × {item.quantity}개
                  {item.weight && ` (${item.weight}g)`}
                </p>
              ))}
              {request.final_price && (
                <p className="font-medium text-green-600 pt-2 border-t">
                  최종 매입가: {formatCurrency(request.final_price)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 감정 결과 (감정 완료 시) */}
      {request.status === 'evaluated' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">🔍 감정 결과</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">감정 정보</h3>
              <div className="space-y-2 text-sm">
                {request.final_weight && (
                  <p><span className="font-medium">최종 무게:</span> {request.final_weight}g</p>
                )}
                {request.final_price && (
                  <p><span className="font-medium">최종 매입가:</span>
                    <span className="ml-1 text-lg font-semibold text-green-600">
                      {formatCurrency(request.final_price)}
                    </span>
                  </p>
                )}
              </div>

              {request.evaluation_notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">감정 메모</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{request.evaluation_notes}</p>
                  </div>
                </div>
              )}
            </div>

            {request.evaluation_images && request.evaluation_images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">감정 사진</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {request.evaluation_images.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`감정 사진 ${index + 1}`}
                      className="w-full h-20 sm:h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(imageUrl, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-amber-400 mr-2">💡</div>
              <div className="text-sm text-amber-800">
                <p className="font-medium">감정 결과에 대해</p>
                <p>감정 결과에 동의하시면 &quot;확인 완료&quot; 버튼을 클릭해주세요. 정산 절차가 시작됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 진행 상황 타임라인 */}
      <TrackingTimeline request={request} statusHistory={statusHistory} />

      {/* 발송 안내 (shipped 상태가 아닐 때) */}
      {request.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-amber-900 mb-3">📦 금니 발송 안내</h3>
          <div className="space-y-3 text-sm text-amber-800">
            <div>
              <h4 className="font-medium">발송 주소</h4>
              <p>서울특별시 강남구 테헤란로 123, 착한금니 빌딩 2층</p>
              <p>우편번호: 06234</p>
            </div>
            <div>
              <h4 className="font-medium">발송 시 주의사항</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>안전한 포장재 사용 (뽁뽁이, 에어캡 등)</li>
                <li>등기우편 또는 택배 이용 권장</li>
                <li>운송장 번호를 별도 보관</li>
                <li>신청번호 {request.request_number} 메모 동봉</li>
              </ul>
            </div>
            <div className="bg-amber-100 border border-amber-300 rounded p-3">
              <p className="font-medium">💡 발송 후에는</p>
              <p>운송장 번호와 택배사명을 고객센터(1588-1234)로 알려주시면 더욱 빠른 처리가 가능합니다.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
