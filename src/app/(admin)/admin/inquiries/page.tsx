'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface Inquiry {
  id: string
  inquiry_number: string
  name: string
  phone: string
  message: string
  user_id?: string
  status: 'pending' | 'in_progress' | 'completed'
  admin_response?: string
  created_at: string
  responded_at?: string
  updated_at: string
}

export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchInquiries()
  }, [])

  useEffect(() => {
    filterInquiries()
  }, [inquiries, searchTerm, statusFilter])

  const fetchInquiries = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/inquiries')
      const result = await response.json()

      if (result.success) {
        setInquiries(result.data)
      } else {
        console.error('문의 조회 실패:', result.message)
      }
    } catch (error) {
      console.error('문의 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterInquiries = () => {
    let filtered = [...inquiries]

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(inquiry =>
        inquiry.inquiry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.phone.includes(searchTerm) ||
        inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter)
    }

    // 최신순으로 정렬
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredInquiries(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중'
      case 'in_progress':
        return '처리 중'
      case 'completed':
        return '완료'
      default:
        return '알 수 없음'
    }
  }

  const handleStatusUpdate = async (inquiryId: string, newStatus: string) => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        await fetchInquiries()
        alert('상태가 업데이트되었습니다.')
      } else {
        alert('상태 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('상태 업데이트 오류:', error)
      alert('상태 업데이트 중 오류가 발생했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  const handleResponse = async () => {
    if (!selectedInquiry || !responseText.trim()) {
      alert('응답 내용을 입력해주세요.')
      return
    }

    try {
      setUpdating(true)
      const response = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'completed',
          admin_response: responseText
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchInquiries()
        setShowResponseModal(false)
        setSelectedInquiry(null)
        setResponseText('')
        alert('응답이 완료되었습니다.')
      } else {
        alert('응답 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('응답 저장 오류:', error)
      alert('응답 저장 중 오류가 발생했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  const openResponseModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setResponseText(inquiry.admin_response || '')
    setShowResponseModal(true)
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
          <h1 className="text-2xl font-bold text-gray-900">💬 문의 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            고객 문의를 관리하고 응답을 처리하세요.
          </p>
        </div>
        <Link
          href="/admin"
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          대시보드로 돌아가기
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    전체 문의
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {inquiries.length}
                  </dd>
                </dl>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    대기 중
                  </dt>
                  <dd className="text-3xl font-semibold text-yellow-600">
                    {inquiries.filter(i => i.status === 'pending').length}
                  </dd>
                </dl>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    완료
                  </dt>
                  <dd className="text-3xl font-semibold text-green-600">
                    {inquiries.filter(i => i.status === 'completed').length}
                  </dd>
                </dl>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="문의번호, 이름, 연락처, 내용"
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
              <option value="pending">대기 중</option>
              <option value="in_progress">처리 중</option>
              <option value="completed">완료</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchInquiries}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>총 {filteredInquiries.length}건의 문의</span>
          <span>마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
        </div>
      </div>

      {/* 문의 목록 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">문의가 없습니다</h3>
            <p className="text-gray-500">필터 조건을 변경하거나 새로고침을 해보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    문의번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    문의내용
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    접수일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {inquiry.inquiry_number}
                      </div>
                      {inquiry.user_id && (
                        <div className="text-xs text-blue-600">회원</div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {inquiry.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {inquiry.phone}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {inquiry.message}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                        {getStatusText(inquiry.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(inquiry.created_at)}
                      </div>
                      {inquiry.responded_at && (
                        <div className="text-sm text-gray-500">
                          응답: {formatDate(inquiry.responded_at)}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <select
                          value={inquiry.status}
                          onChange={(e) => handleStatusUpdate(inquiry.id, e.target.value)}
                          disabled={updating}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">대기 중</option>
                          <option value="in_progress">처리 중</option>
                          <option value="completed">완료</option>
                        </select>

                        <button
                          onClick={() => openResponseModal(inquiry)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          응답
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 응답 모달 */}
      {showResponseModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">문의 응답</h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">원본 문의</h4>
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">문의번호:</span> {selectedInquiry.inquiry_number}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">고객:</span> {selectedInquiry.name} ({selectedInquiry.phone})
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">문의내용:</span>
                </p>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                  {selectedInquiry.message}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관리자 응답
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="고객에게 보낼 응답을 입력하세요..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowResponseModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleResponse}
                disabled={updating || !responseText.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? '저장 중...' : '응답 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}