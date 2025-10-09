import { NextResponse } from 'next/server'
import { getPurchaseRequestStats } from '@/lib/supabase/database'

export async function GET() {
  try {
    // 현재 접수 상태를 대기 건수 기반으로 판단
    const stats = await getPurchaseRequestStats()

    const currentStatus = {
      is_open: true, // 기본적으로 접수 열림
      message: stats.pendingRequests > 10
        ? `현재 처리 대기 건수가 많습니다 (${stats.pendingRequests}건). 평소보다 처리 시간이 길어질 수 있습니다.`
        : "정상 접수 중입니다",
      pending_count: stats.pendingRequests,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(currentStatus)
  } catch (error) {
    console.error('접수 상태 조회 실패:', error)

    // 에러 발생시 기본 상태 반환
    const fallbackStatus = {
      is_open: true,
      message: "정상 접수 중입니다",
      pending_count: 0,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(fallbackStatus)
  }
}