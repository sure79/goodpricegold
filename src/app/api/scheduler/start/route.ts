import { NextResponse } from 'next/server'
import { startDailyGoldPriceSync } from '@/lib/scheduler'

export async function POST() {
  try {
    startDailyGoldPriceSync()

    return NextResponse.json({
      success: true,
      message: '매일 금니 시세 자동 동기화 스케줄러 시작됨'
    })

  } catch (error) {
    console.error('스케줄러 시작 실패:', error)

    return NextResponse.json({
      success: false,
      message: '스케줄러 시작 실패',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}