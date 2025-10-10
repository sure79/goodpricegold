'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getPurchaseRequests } from '@/lib/supabase/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PurchaseRequest } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function SettlementManagement() {
  const [depositedRequests, setDepositedRequests] = useState<PurchaseRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<PurchaseRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [depositedRequests, searchTerm, startDate, endDate])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const requestsData = await getPurchaseRequests()
      // deposited 상태만 필터링
      const deposited = requestsData.filter(req => req.status === 'deposited')
      setDepositedRequests(deposited)
    } catch (error) {
      console.error('데이터 조회 실패:', error)
      alert('데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = [...depositedRequests]

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.phone.includes(searchTerm) ||
        req.account_number?.includes(searchTerm)
      )
    }

    // 시작일 필터
    if (startDate) {
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.created_at)
        const filterDate = new Date(startDate)
        return reqDate >= filterDate
      })
    }

    // 종료일 필터
    if (endDate) {
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.created_at)
        const filterDate = new Date(endDate)
        filterDate.setHours(23, 59, 59, 999) // 종료일의 끝까지 포함
        return reqDate <= filterDate
      })
    }

    // 최신순으로 정렬
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredRequests(filtered)
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
          <h1 className="text-2xl font-bold text-gray-900">💳 정산 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            입금 완료된 매입 건을 관리하세요.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            대시보드로 돌아가기
          </Link>
        </div>
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
              placeholder="신청번호, 고객명, 전화번호, 계좌번호"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              시작일
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              종료일
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchData}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>총 {filteredRequests.length}건의 정산</span>
          <span>총 정산금액: {formatCurrency(filteredRequests.reduce((sum, req) => sum + (req.final_price || req.estimated_price || 0), 0))}</span>
        </div>
      </div>

      {/* 정산 목록 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">입금완료 내역이 없습니다</h3>
            <p className="text-gray-500">신청관리에서 입금완료 처리된 건이 자동으로 표시됩니다.</p>
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
                    정산금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    계좌정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    입금일자
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  return (
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
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(request.final_price || request.estimated_price || 0)}
                        </div>
                        {request.final_price && request.estimated_price && (
                          <div className="text-sm text-gray-500">
                            예상: {formatCurrency(request.estimated_price)}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {request.bank_name} {request.account_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.customer_name}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          입금완료
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(request.updated_at)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 통계 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">정산 통계</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 mb-2">
              입금 완료
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredRequests.length}건
            </div>
            <div className="text-sm text-gray-500">
              {formatCurrency(filteredRequests.reduce((sum, req) => sum + (req.final_price || req.estimated_price || 0), 0))}
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 mb-2">
              평균 금액
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredRequests.length > 0
                ? formatCurrency(filteredRequests.reduce((sum, req) => sum + (req.final_price || req.estimated_price || 0), 0) / filteredRequests.length)
                : '₩0'}
            </div>
            <div className="text-sm text-gray-500">
              건당 평균
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800 mb-2">
              전체 현황
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {depositedRequests.length}건
            </div>
            <div className="text-sm text-gray-500">
              총 입금완료 건수
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
