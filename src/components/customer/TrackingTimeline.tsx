'use client'

import { formatDateTime } from '@/lib/utils'
import type { PurchaseRequest, StatusHistory } from '@/types'

interface TrackingTimelineProps {
  request: PurchaseRequest
  statusHistory?: StatusHistory[]
}

export default function TrackingTimeline({ request, statusHistory = [] }: TrackingTimelineProps) {
  const steps = [
    {
      id: 'pending',
      name: '접수완료',
      description: '매입 신청이 접수되었습니다',
      icon: '📝',
    },
    {
      id: 'shipped',
      name: '발송완료',
      description: '금니를 저희에게 발송해주세요',
      icon: '📦',
    },
    {
      id: 'received',
      name: '수령완료',
      description: '금니를 수령하였습니다',
      icon: '✅',
    },
    {
      id: 'evaluating',
      name: '감정중',
      description: '전문 감정사가 정밀 검사 중입니다',
      icon: '🔍',
    },
    {
      id: 'confirmed',
      name: '정산확정',
      description: '감정이 완료되어 정산금액이 확정되었습니다',
      icon: '💰',
    },
    {
      id: 'paid',
      name: '송금완료',
      description: '정산금액이 계좌로 입금되었습니다',
      icon: '🏦',
    },
  ]

  const statusAlias: Record<string, string> = {
    approved: 'confirmed',
    deposited: 'paid',
  }

  const normalizedStatus = statusAlias[request.status] || request.status
  const currentStepIndexRaw = steps.findIndex(step => step.id === normalizedStatus)
  const currentStepIndex = currentStepIndexRaw === -1 ? steps.length - 1 : currentStepIndexRaw

  const historyMap = new Map<string, string>()
  statusHistory.forEach((history) => {
    if (!historyMap.has(history.status)) {
      historyMap.set(history.status, history.created_at)
    }
  })

  // deposited 기록은 paid 단계에 반영
  if (!historyMap.has('paid') && historyMap.has('deposited')) {
    historyMap.set('paid', historyMap.get('deposited') as string)
  }

  const fallbackTimestamps: Record<string, string | undefined> = {
    pending: request.created_at,
    shipped: request.updated_at,
    received: request.received_date,
    evaluating: request.updated_at,
    confirmed: ['confirmed', 'approved', 'paid', 'deposited'].includes(request.status) ? request.updated_at : undefined,
    paid: ['paid', 'deposited'].includes(request.status) ? request.updated_at : undefined,
  }

  const stepTimestamps = steps.reduce<Record<string, string | undefined>>((result, step) => {
    result[step.id] = historyMap.get(step.id) || fallbackTimestamps[step.id]
    return result
  }, {})

  const isCompleted = (stepIndex: number) => stepIndex <= currentStepIndex
  const isCurrent = (stepIndex: number) => stepIndex === currentStepIndex

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">진행 상황</h2>

        <div className="flow-root">
          <ul className="-mb-8">
            {steps.map((step, stepIdx) => (
              <li key={step.id}>
                <div className="relative pb-8">
                  {stepIdx !== steps.length - 1 ? (
                    <span
                      className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                        isCompleted(stepIdx) ? 'bg-amber-600' : 'bg-gray-200'
                      }`}
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          isCompleted(stepIdx)
                            ? 'bg-amber-600 text-white'
                            : isCurrent(stepIdx)
                            ? 'bg-amber-100 text-amber-600 ring-amber-100'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <span className="text-sm">{step.icon}</span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className={`text-sm font-medium ${
                          isCompleted(stepIdx) || isCurrent(stepIdx) ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </p>
                        <p className={`text-sm ${
                          isCompleted(stepIdx) || isCurrent(stepIdx) ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        {stepTimestamps[step.id]
                          ? <time>{formatDateTime(stepTimestamps[step.id] as string)}</time>
                          : <span className="text-xs text-gray-400">대기 중</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 추가 정보 */}
      {request.status === 'shipped' && request.tracking_number && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900">배송 정보</h3>
          <p className="text-sm text-blue-700 mt-1">
            택배사: {request.shipping_carrier}<br />
            운송장번호: {request.tracking_number}
          </p>
        </div>
      )}

      {request.status === 'evaluating' && request.evaluation_notes && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-orange-900">감정 진행 상황</h3>
          <p className="text-sm text-orange-700 mt-1">{request.evaluation_notes}</p>
        </div>
      )}

      {request.status === 'confirmed' && request.final_price && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900">정산 확정</h3>
          <div className="text-sm text-green-700 mt-1 space-y-1">
            <p>최종 무게: {request.final_weight}g</p>
            <p>최종 매입가: {request.final_price?.toLocaleString()}원</p>
            {request.price_difference !== 0 && (
              <p className={request.price_difference! > 0 ? 'text-green-600' : 'text-red-600'}>
                예상가 대비: {request.price_difference! > 0 ? '+' : ''}{request.price_difference?.toLocaleString()}원
              </p>
            )}
          </div>
        </div>
      )}

      {request.admin_notes && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900">관리자 메모</h3>
          <p className="text-sm text-gray-700 mt-1">{request.admin_notes}</p>
        </div>
      )}
    </div>
  )
}
