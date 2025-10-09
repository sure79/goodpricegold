'use client'

import { useState, useEffect } from 'react'

interface StatusData {
  is_open: boolean
  message: string
  updated_at: string
}

interface RecentData {
  id: string
  date: string
  total_requests: number
  completed_requests: number
  pending_requests: number
}

export default function ApplicationStatus() {
  const [status, setStatus] = useState<StatusData | null>(null)
  const [recentStats, setRecentStats] = useState<RecentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatusData()
  }, [])

  const fetchStatusData = async () => {
    try {
      const [statusResponse, recentResponse] = await Promise.all([
        fetch('/api/reception-status/current'),
        fetch('/api/reception-status/recent')
      ])

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setStatus(statusData)
      }

      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        setRecentStats(recentData)
      }
    } catch (error) {
      console.error('신청 현황 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-2">
          <span className="mr-2">🚀</span>
          매입 신청 현황
        </div>
        <div className="text-blue-700 text-sm font-medium">
          실시간 업데이트
        </div>
      </div>

      {/* 현재 접수 상태 */}
      {status && (
        <div className={`bg-white rounded-lg shadow-sm p-4 mb-6 border-l-4 ${
          status.is_open
            ? 'border-green-500'
            : 'border-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
                status.is_open
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}>
                <span className={`text-2xl ${
                  status.is_open ? 'text-green-600' : 'text-red-600'
                }`}>
                  {status.is_open ? '🟢' : '🔴'}
                </span>
              </div>
              <div>
                <div className={`font-semibold text-lg ${
                  status.is_open ? 'text-green-900' : 'text-red-900'
                }`}>
                  {status.is_open ? '접수 중' : '접수 마감'}
                </div>
                <div className="text-gray-600 text-sm">
                  {status.message}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 오늘의 처리 현황 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          오늘의 처리 현황
        </h4>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">45</div>
            <div className="text-sm text-blue-700">신규 접수</div>
          </div>
          <div className="text-center bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">38</div>
            <div className="text-sm text-green-700">완료</div>
          </div>
          <div className="text-center bg-yellow-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-600">7</div>
            <div className="text-sm text-yellow-700">진행중</div>
          </div>
        </div>
      </div>

      {/* 최근 처리 현황 */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-blue-900">최근 7일간 처리 현황</h4>
        {recentStats.length > 0 ? (
          recentStats.map((stat) => (
            <div key={stat.id} className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(stat.date).toLocaleDateString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex space-x-3 text-sm">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                    <span className="text-blue-600 font-medium">{stat.total_requests}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-green-600 font-medium">{stat.completed_requests}</span>
                  </div>
                  {stat.pending_requests > 0 && (
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                      <span className="text-yellow-600 font-medium">{stat.pending_requests}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <span className="text-4xl mb-2 block">📈</span>
            <p className="text-gray-500 text-sm">처리 현황 데이터 준비 중...</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-blue-300">
        <div className="flex items-center justify-center text-blue-700 text-xs">
          <span className="mr-1">⚡</span>
          평균 처리시간: <strong className="ml-1">2-3시간</strong>
        </div>
      </div>
    </div>
  )
}