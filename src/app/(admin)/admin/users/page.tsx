'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getUsers, getPurchaseRequests, deleteUser } from '@/lib/supabase/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { User, PurchaseRequest } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, dateFilter, sortBy])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [usersData, requestsData] = await Promise.all([
        getUsers(),
        getPurchaseRequests()
      ])
      setUsers(usersData)
      setRequests(requestsData)
    } catch (error) {
      console.error('데이터 조회 실패:', error)
      alert('데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 역할 필터
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
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
        case 'year':
          filterDate.setDate(now.getDate() - 365)
          break
      }

      if (dateFilter !== 'all') {
        filtered = filtered.filter(user => new Date(user.created_at) >= filterDate)
      }
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'total_transactions':
          return (b.total_transactions || 0) - (a.total_transactions || 0)
        case 'total_amount':
          return (b.total_amount || 0) - (a.total_amount || 0)
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredUsers(filtered)
  }

  const getUserRequests = (userId: string) => {
    return requests.filter(req => req.user_id === userId)
  }

  const getUserStats = (userId: string) => {
    const userRequests = getUserRequests(userId)
    const completedRequests = userRequests.filter(req => req.status === 'deposited')
    const totalAmount = completedRequests.reduce((sum, req) => sum + (req.estimated_price || 0), 0)

    return {
      totalRequests: userRequests.length,
      completedRequests: completedRequests.length,
      totalAmount,
      lastRequestDate: userRequests.length > 0 ? userRequests[0].created_at : null
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'customer':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자'
      case 'customer':
        return '고객'
      default:
        return '알 수 없음'
    }
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      setIsDeleting(true)
      await deleteUser(userToDelete.id)

      // 목록에서 삭제된 사용자 제거
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id))
      setShowDeleteModal(false)
      setUserToDelete(null)

      alert('회원이 성공적으로 삭제되었습니다.')
    } catch (error) {
      console.error('회원 삭제 실패:', error)
      alert(error instanceof Error ? error.message : '회원 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
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
          <h1 className="text-2xl font-bold text-gray-900">👥 회원 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            등록된 회원 정보를 조회하고 관리하세요.
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    전체 회원
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {users.length}
                  </dd>
                </dl>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    활성 고객
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {users.filter(u => u.role === 'customer').length}
                  </dd>
                </dl>
              </div>
              <div className="text-4xl">🛍️</div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    이번 달 신규
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {users.filter(u => {
                      const userDate = new Date(u.created_at)
                      const now = new Date()
                      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
                    }).length}
                  </dd>
                </dl>
              </div>
              <div className="text-4xl">✨</div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    관리자
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </dd>
                </dl>
              </div>
              <div className="text-4xl">⚙️</div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름, 전화번호, 이메일"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              역할
            </label>
            <select
              id="role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">전체</option>
              <option value="customer">고객</option>
              <option value="admin">관리자</option>
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              가입일
            </label>
            <select
              id="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">전체</option>
              <option value="today">오늘</option>
              <option value="week">최근 1주일</option>
              <option value="month">최근 1개월</option>
              <option value="year">최근 1년</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              정렬
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="created_at">가입일순</option>
              <option value="name">이름순</option>
              <option value="total_transactions">거래횟수순</option>
              <option value="total_amount">거래금액순</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchData}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>총 {filteredUsers.length}명의 회원</span>
          <span>마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
        </div>
      </div>

      {/* 회원 목록 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">회원이 없습니다</h3>
            <p className="text-gray-500">필터 조건을 변경하거나 새로고침을 해보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    회원정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    거래 통계
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const stats = getUserStats(user.id)
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">
                            {user.phone}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          신청: {stats.totalRequests}건
                        </div>
                        <div className="text-sm text-gray-500">
                          완료: {stats.completedRequests}건
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(stats.totalAmount)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(user.created_at)}
                        </div>
                        {stats.lastRequestDate && (
                          <div className="text-sm text-gray-500">
                            최근: {formatDate(stats.lastRequestDate)}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleUserClick(user)}
                            className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                          >
                            상세보기
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              삭제
                            </button>
                          )}
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

      {/* 사용자 상세 모달 */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">회원 상세 정보</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">기본 정보</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">이름:</span>
                    <span className="text-sm font-medium">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">전화번호:</span>
                    <span className="text-sm font-medium">{selectedUser.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">이메일:</span>
                    <span className="text-sm font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">역할:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${getRoleColor(selectedUser.role)}`}>
                      {getRoleText(selectedUser.role)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">가입일:</span>
                    <span className="text-sm font-medium">{formatDate(selectedUser.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* 거래 통계 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">거래 통계</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{getUserStats(selectedUser.id).totalRequests}</div>
                    <div className="text-sm text-blue-800">총 신청</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{getUserStats(selectedUser.id).completedRequests}</div>
                    <div className="text-sm text-green-800">완료된 거래</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center col-span-2">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(getUserStats(selectedUser.id).totalAmount)}
                    </div>
                    <div className="text-sm text-purple-800">총 거래 금액</div>
                  </div>
                </div>
              </div>

              {/* 최근 신청 내역 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">최근 신청 내역</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getUserRequests(selectedUser.id).slice(0, 5).map(request => (
                    <div key={request.id} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium">{request.request_number}</div>
                          <div className="text-xs text-gray-500">{formatDate(request.created_at)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatCurrency(request.estimated_price || 0)}</div>
                          <div className="text-xs text-gray-500">{request.status}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getUserRequests(selectedUser.id).length === 0 && (
                    <p className="text-gray-500 text-center py-4">신청 내역이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">회원 삭제 확인</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isDeleting}
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-md font-medium text-gray-900">
                    정말로 이 회원을 삭제하시겠습니까?
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    이 작업은 되돌릴 수 없습니다.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">이름:</span>
                    <span>{userToDelete.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">이메일:</span>
                    <span>{userToDelete.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">가입일:</span>
                    <span>{formatDate(userToDelete.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700">
                  <strong>주의:</strong> 회원 삭제 시 해당 회원의 모든 데이터(매입 신청, 거래 기록 등)가 함께 영향을 받을 수 있습니다.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white mr-2" />
                    삭제 중...
                  </>
                ) : (
                  '삭제'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}