import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    // 최근 7일간의 일별 접수 현황 조회
    const recentStatus = []

    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      // 해당 날짜의 신청 건수 조회
      const { data: dayRequests } = await supabase
        .from('purchase_requests')
        .select('id, status')
        .gte('created_at', dateStr + 'T00:00:00Z')
        .lt('created_at', dateStr + 'T23:59:59Z')

      const totalRequests = dayRequests?.length || 0
      const completedRequests = dayRequests?.filter(req => req.status === 'deposited').length || 0
      const pendingRequests = dayRequests?.filter(req => !['deposited'].includes(req.status)).length || 0

      recentStatus.push({
        id: `day-${i}`,
        date: dateStr,
        total_requests: totalRequests,
        completed_requests: completedRequests,
        pending_requests: pendingRequests
      })
    }

    return NextResponse.json(recentStatus)
  } catch (error) {
    console.error('최근 접수 현황 조회 실패:', error)

    // 에러 발생시 기본 데이터 반환
    const fallbackStatus = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)

      return {
        id: `day-${i}`,
        date: date.toISOString().split('T')[0],
        total_requests: 0,
        completed_requests: 0,
        pending_requests: 0
      }
    })

    return NextResponse.json(fallbackStatus)
  }
}