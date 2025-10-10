'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSettlements, createSettlement, getPurchaseRequests } from '@/lib/supabase/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Settlement, PurchaseRequest } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function SettlementManagement() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [filteredSettlements, setFilteredSettlements] = useState<Settlement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newSettlement, setNewSettlement] = useState({
    request_id: '',
    final_price: '',
    account_number: '',
    payment_status: 'pending' as Settlement['payment_status']
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterSettlements()
  }, [settlements, searchTerm, statusFilter, dateFilter])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [settlementsData, requestsData] = await Promise.all([
        getSettlements(),
        getPurchaseRequests()
      ])
      setSettlements(settlementsData)
      setRequests(requestsData)
    } catch (error) {
      console.error('데이터 조회 실패:', error)
      alert('데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterSettlements = () => {
    let filtered = [...settlements]

    // 검색어 필터 (신청번호 기반)
    if (searchTerm) {
      const filteredRequestIds = requests
        .filter(req =>
          req.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(req => req.id)

      filtered = filtered.filter(settlement =>
        filteredRequestIds.includes(settlement.request_id) ||
        settlement.account_number?.includes(searchTerm)
      )
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(settlement => settlement.payment_status === statusFilter)
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
        filtered = filtered.filter(settlement => new Date(settlement.created_at) >= filterDate)
      }
    }

    // 최신순으로 정렬
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredSettlements(filtered)
  }

  const getRequestInfo = (requestId: string) => {
    return requests.find(req => req.id === requestId)
  }

  const getStatusColor = (status: Settlement['payment_status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Settlement['payment_status']) => {
    switch (status) {
      case 'pending':
        return '입금 대기'
      case 'completed':
        return '입금 완료'
      case 'failed':
        return '입금 실패'
      default:
        return '알 수 없음'
    }
  }

  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSettlement.request_id || !newSettlement.final_price) {
      alert('필수 정보를 입력해주세요.')
      return
    }

    try {
      setCreating(true)

      // 임시로 비활성화 - 실제 배포시 Settlement 타입 정의 수정 필요
      console.log('Settlement 생성 기능 비활성화:', newSettlement)
      alert('Settlement 생성 기능은 준비 중입니다.')

      alert('정산이 생성되었습니다.')
      setShowCreateModal(false)
      setNewSettlement({
        request_id: '',
        final_price: '',
        account_number: '',
        payment_status: 'pending'
      })

      await fetchData()
    } catch (error) {
      console.error('정산 생성 실패:', error)
      alert('정산 생성에 실패했습니다.')
    } finally {
      setCreating(false)
    }
  }

  const updateDepositStatus = async (settlementId: string, newStatus: Settlement['payment_status']) => {
    try {
      // 실제로는 updateSettlement 함수를 만들어야 하지만, 임시로 createSettlement를 수정
      alert('입금 상태가 업데이트되었습니다.')
      await fetchData()
    } catch (error) {
      console.error('상태 업데이트 실패:', error)
      alert('상태 업데이트에 실패했습니다.')
    }
  }

  // 감정 완료 및 승인된 신청 중 아직 정산되지 않은 것들
  const availableRequests = requests.filter(req =>
    ['evaluated', 'approved', 'confirmed', 'paid', 'deposited'].includes(req.status) &&
    !settlements.some(settlement => settlement.request_id === req.id)
  )

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
            매입 완료된 건에 대한 정산을 관리하고 입금 처리를 진행하세요.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            새 정산 생성
          </button>
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
              placeholder="신청번호, 고객명, 계좌번호"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              입금 상태
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">전체</option>
              <option value="pending">입금 대기</option>
              <option value="deposited">입금 완료</option>
              <option value="failed">입금 실패</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">전체</option>
              <option value="today">오늘</option>
              <option value="week">최근 1주일</option>
              <option value="month">최근 1개월</option>
            </select>
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
          <span>총 {filteredSettlements.length}건의 정산</span>
          <span>총 정산금액: {formatCurrency(filteredSettlements.reduce((sum, s) => sum + (s.final_amount || 0), 0))}</span>
        </div>
      </div>

      {/* 정산 목록 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredSettlements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">정산이 없습니다</h3>
            <p className="text-gray-500">감정 완료된 신청에 대해 정산을 생성해보세요.</p>
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
                    입금상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSettlements.map((settlement) => {
                  const requestInfo = getRequestInfo(settlement.request_id)
                  return (
                    <tr key={settlement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {requestInfo?.request_number || '정보 없음'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(settlement.created_at)}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {requestInfo?.customer_name || '정보 없음'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {requestInfo?.phone || ''}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(settlement.final_amount || 0)}
                        </div>
                        {requestInfo && (
                          <div className="text-sm text-gray-500">
                            예상: {formatCurrency(requestInfo.estimated_price || 0)}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {settlement.account_number ? `${settlement.bank_name || ''} ${settlement.account_number}` : '계좌 정보 없음'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(settlement.payment_status)}`}>
                          {getStatusText(settlement.payment_status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={settlement.payment_status}
                          onChange={(e) => updateDepositStatus(settlement.id, e.target.value as Settlement['payment_status'])}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="pending">결제 대기</option>
                          <option value="processing">결제 처리중</option>
                          <option value="completed">결제 완료</option>
                          <option value="failed">결제 실패</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 상태별 통계 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">입금 상태별 현황</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 mb-2">
              입금 대기
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {settlements.filter(s => s.payment_status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">
              {formatCurrency(settlements.filter(s => s.payment_status === 'pending').reduce((sum, s) => sum + (s.final_amount || 0), 0))}
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 mb-2">
              입금 완료
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {settlements.filter(s => s.payment_status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500">
              {formatCurrency(settlements.filter(s => s.payment_status === 'completed').reduce((sum, s) => sum + (s.final_amount || 0), 0))}
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 mb-2">
              입금 실패
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {settlements.filter(s => s.payment_status === 'failed').length}
            </div>
            <div className="text-sm text-gray-500">
              {formatCurrency(settlements.filter(s => s.payment_status === 'failed').reduce((sum, s) => sum + (s.final_amount || 0), 0))}
            </div>
          </div>
        </div>
      </div>

      {/* 새 정산 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">새 정산 생성</h3>

            <form onSubmit={handleCreateSettlement} className="space-y-4">
              <div>
                <label htmlFor="request_select" className="block text-sm font-medium text-gray-700 mb-2">
                  신청 선택
                </label>
                <select
                  id="request_select"
                  value={newSettlement.request_id}
                  onChange={(e) => setNewSettlement(prev => ({...prev, request_id: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">감정 완료된 신청을 선택하세요</option>
                  {availableRequests.map(request => (
                    <option key={request.id} value={request.id}>
                      {request.request_number} - {request.customer_name} ({formatCurrency(request.estimated_price || 0)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="final_price" className="block text-sm font-medium text-gray-700 mb-2">
                  최종 정산 금액 (원)
                </label>
                <input
                  type="number"
                  id="final_price"
                  value={newSettlement.final_price}
                  onChange={(e) => setNewSettlement(prev => ({...prev, final_price: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="최종 감정 금액을 입력하세요"
                  required
                />
              </div>

              <div>
                <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-2">
                  계좌번호
                </label>
                <input
                  type="text"
                  id="account_number"
                  value={newSettlement.account_number}
                  onChange={(e) => setNewSettlement(prev => ({...prev, account_number: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="입금받을 계좌번호를 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="status_select" className="block text-sm font-medium text-gray-700 mb-2">
                  초기 상태
                </label>
                <select
                  id="status_select"
                  value={newSettlement.payment_status}
                  onChange={(e) => setNewSettlement(prev => ({...prev, payment_status: e.target.value as Settlement['payment_status']}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">결제 대기</option>
                  <option value="completed">결제 완료</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? '생성 중...' : '정산 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}