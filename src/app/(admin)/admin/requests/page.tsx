'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getPurchaseRequests, updatePurchaseRequestStatus, updateEvaluationResult } from '@/lib/supabase/database'
import { uploadMultipleImages } from '@/lib/supabase/storage'
import { formatCurrency, formatDate, getStatusText, getStatusColor } from '@/lib/utils'
import type { PurchaseRequest } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const STATUS_OPTIONS = [
  { value: 'pending', label: '신청 완료', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'received', label: '접수 완료', color: 'bg-blue-100 text-blue-800' },
  { value: 'evaluating', label: '감정 중', color: 'bg-purple-100 text-purple-800' },
  { value: 'evaluated', label: '감정 완료', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'confirmed', label: '정산 확정', color: 'bg-green-100 text-green-800' },
  { value: 'deposited', label: '입금 완료', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelled', label: '취소됨', color: 'bg-red-100 text-red-800' }
]

export default function RequestManagement() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<PurchaseRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null)
  const [evaluationData, setEvaluationData] = useState({
    final_weight: '',
    final_price: '',
    evaluation_notes: '',
    evaluation_images: [] as File[]
  })
  const [evaluationPreviewUrls, setEvaluationPreviewUrls] = useState<string[]>([])
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter, dateFilter])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const data = await getPurchaseRequests()
      setRequests(data)
    } catch (error) {
      console.error('신청 목록 조회 실패:', error)
      alert('신청 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = [...requests]

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.phone.includes(searchTerm) ||
        (req.email && req.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter)
    }

    // 날짜 필터
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setDate(now.getDate() - 30)
          break
      }

      if (dateFilter !== 'all') {
        filtered = filtered.filter(req => new Date(req.created_at) >= filterDate)
      }
    }

    // 최신순으로 정렬
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredRequests(filtered)
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      setUpdating(requestId)
      await updatePurchaseRequestStatus(requestId, newStatus as PurchaseRequest['status'])

      // 로컬 상태 업데이트
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: newStatus as PurchaseRequest['status'], updated_at: new Date().toISOString() }
            : req
        )
      )

      alert('상태가 업데이트되었습니다.')
    } catch (error) {
      console.error('상태 업데이트 실패:', error)
      alert('상태 업데이트에 실패했습니다.')
    } finally {
      setUpdating(null)
    }
  }

  const getItemsDisplay = (items: { type: string; weight?: number; description?: string }[]) => {
    if (!items || items.length === 0) return '정보 없음'

    return items.map(item => {
      const type = item.type === '18k' ? '18K' : '14K'
      const weight = item.weight ? `${item.weight}g` : ''
      const description = item.description || ''
      return `${type} ${weight} ${description}`.trim()
    }).join(', ')
  }

  const openEvaluationModal = (request: PurchaseRequest) => {
    setSelectedRequest(request)
    setEvaluationData({
      final_weight: request.final_weight?.toString() || '',
      final_price: request.final_price?.toString() || '',
      evaluation_notes: request.evaluation_notes || '',
      evaluation_images: []
    })
    setEvaluationPreviewUrls([])
    setShowEvaluationModal(true)
  }

  const handleEvaluationImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + evaluationData.evaluation_images.length > 5) {
      alert('최대 5장까지 업로드할 수 있습니다.')
      return
    }

    const newFiles = [...evaluationData.evaluation_images, ...files]
    setEvaluationData(prev => ({ ...prev, evaluation_images: newFiles }))

    const newUrls = files.map(file => URL.createObjectURL(file))
    setEvaluationPreviewUrls(prev => [...prev, ...newUrls])
  }

  const removeEvaluationImage = (index: number) => {
    const newFiles = evaluationData.evaluation_images.filter((_, i) => i !== index)
    const newUrls = evaluationPreviewUrls.filter((_, i) => i !== index)

    URL.revokeObjectURL(evaluationPreviewUrls[index])

    setEvaluationData(prev => ({ ...prev, evaluation_images: newFiles }))
    setEvaluationPreviewUrls(newUrls)
  }

  const submitEvaluationResult = async () => {
    if (!selectedRequest) return

    try {
      setIsSubmittingEvaluation(true)

      // 감정 사진 업로드
      let imageUrls: string[] = []
      if (evaluationData.evaluation_images.length > 0) {
        try {
          imageUrls = await uploadMultipleImages(evaluationData.evaluation_images, 'evaluation-images')
        } catch (uploadError) {
          console.error('감정 사진 업로드 실패:', uploadError)
          alert('감정 사진 업로드에 실패했습니다.')
          return
        }
      }

      // 기존 감정 이미지와 새 이미지 합치기
      const allEvaluationImages = [
        ...(selectedRequest.evaluation_images || []),
        ...imageUrls
      ]

      const updateData = {
        final_weight: evaluationData.final_weight ? parseFloat(evaluationData.final_weight) : undefined,
        final_price: evaluationData.final_price ? parseFloat(evaluationData.final_price) : undefined,
        evaluation_notes: evaluationData.evaluation_notes || undefined,
        evaluation_images: allEvaluationImages.length > 0 ? allEvaluationImages : undefined
      }

      await updateEvaluationResult(selectedRequest.id, updateData, 'admin')

      // 로컬 상태 업데이트
      setRequests(prev =>
        prev.map(req =>
          req.id === selectedRequest.id
            ? {
                ...req,
                ...updateData,
                status: 'evaluated',
                updated_at: new Date().toISOString()
              }
            : req
        )
      )

      setShowEvaluationModal(false)
      alert('감정 결과가 저장되었습니다.')
    } catch (error) {
      console.error('감정 결과 저장 실패:', error)
      alert('감정 결과 저장에 실패했습니다.')
    } finally {
      setIsSubmittingEvaluation(false)
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
          <h1 className="text-2xl font-bold text-gray-900">📋 신청 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            매입 신청을 관리하고 처리 상태를 업데이트하세요.
          </p>
        </div>
        <Link
          href="/admin"
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          대시보드로 돌아가기
        </Link>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="신청번호, 고객명, 전화번호, 이메일"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              기간
            </label>
            <select
              id="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="today">오늘</option>
              <option value="week">최근 1주일</option>
              <option value="month">최근 1개월</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchRequests}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>총 {filteredRequests.length}건의 신청</span>
          <span>마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
        </div>
      </div>

      {/* 신청 목록 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">신청이 없습니다</h3>
            <p className="text-gray-500">필터 조건을 변경하거나 새로고침을 해보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신청정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    계좌번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    품목정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사진
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최종 가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.request_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(request.created_at)}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.phone}
                        </div>
                        {request.email && (
                          <div className="text-sm text-gray-500">
                            {request.email}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.bank_name && request.account_number ? (
                          <div className="space-y-1">
                            <div className="bg-blue-50 px-2 py-1 rounded text-xs font-semibold text-blue-800">
                              {request.bank_name}
                            </div>
                            <div className="bg-gray-50 px-2 py-1 rounded text-xs font-mono text-gray-700">
                              {request.account_number}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">미입력</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {getItemsDisplay(request.items)}
                      </div>
                    </td>

                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex space-x-1 sm:space-x-2 flex-wrap">
                        {request.customer_images && request.customer_images.length > 0 ? (
                          request.customer_images.slice(0, 3).map((imageUrl, index) => (
                            <div key={index} className="relative mb-1">
                              <img
                                src={imageUrl}
                                alt={`고객 업로드 사진 ${index + 1}`}
                                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(imageUrl, '_blank')}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="text-xs sm:text-sm text-gray-500 py-2">사진 없음</div>
                        )}
                        {request.customer_images && request.customer_images.length > 3 && (
                          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-lg border border-gray-300 text-xs text-gray-600">
                            +{request.customer_images.length - 3}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.final_price ? (
                          <span className="text-green-600 font-semibold">
                            {formatCurrency(request.final_price)}
                          </span>
                        ) : (
                          <span className="text-gray-400">미감정</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                          disabled={updating === request.id}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        {(request.status === 'evaluating' || request.status === 'evaluated') && (
                          <button
                            onClick={() => openEvaluationModal(request)}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          >
                            감정결과
                          </button>
                        )}

                        {updating === request.id && (
                          <LoadingSpinner size="sm" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 상태별 통계 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">상태별 현황</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {STATUS_OPTIONS.map(status => {
            const count = requests.filter(req => req.status === status.value).length
            return (
              <div key={status.value} className="text-center">
                <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${status.color} mb-2`}>
                  {status.label}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 감정 결과 입력 모달 */}
      {showEvaluationModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  감정 결과 입력 - {selectedRequest.request_number}
                </h3>
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* 고객 업로드 사진 */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">고객 업로드 사진</h4>
                  <div className="flex space-x-2 overflow-x-auto">
                    {selectedRequest.customer_images && selectedRequest.customer_images.length > 0 ? (
                      selectedRequest.customer_images.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`고객 사진 ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500">업로드된 사진이 없습니다.</p>
                    )}
                  </div>
                </div>

                {/* 감정 결과 입력 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      최종 무게 (g)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={evaluationData.final_weight}
                      onChange={(e) => setEvaluationData(prev => ({ ...prev, final_weight: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      최종 매입가 (원)
                    </label>
                    <input
                      type="number"
                      value={evaluationData.final_price}
                      onChange={(e) => setEvaluationData(prev => ({ ...prev, final_price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    감정 메모
                  </label>
                  <textarea
                    rows={3}
                    value={evaluationData.evaluation_notes}
                    onChange={(e) => setEvaluationData(prev => ({ ...prev, evaluation_notes: e.target.value }))}
                    placeholder="감정 결과, 특이사항 등을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 감정 사진 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    감정 사진 추가
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <label htmlFor="evaluation-upload" className="cursor-pointer">
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded">사진 선택</span>
                          <span className="ml-2">또는 드래그하여 업로드</span>
                        </div>
                        <input
                          id="evaluation-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleEvaluationImageUpload}
                          className="sr-only"
                        />
                      </label>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG 파일 (최대 5장)</p>
                    </div>
                  </div>

                  {/* 감정 사진 미리보기 */}
                  {evaluationPreviewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {evaluationPreviewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`감정 사진 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeEvaluationImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 기존 감정 사진 */}
                  {selectedRequest.evaluation_images && selectedRequest.evaluation_images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">기존 감정 사진</p>
                      <div className="flex space-x-2 overflow-x-auto">
                        {selectedRequest.evaluation_images.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`기존 감정 사진 ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={submitEvaluationResult}
                  disabled={isSubmittingEvaluation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingEvaluation ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      저장 중...
                    </div>
                  ) : (
                    '감정 결과 저장'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}