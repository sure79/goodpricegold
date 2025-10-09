import { NextResponse } from 'next/server'
import { ensureTodayGoldPrice } from '@/lib/supabase/database'

export async function POST() {
  try {
    console.log('🕐 매일 금니 시세 자동 동기화 시작...')

    // 오늘 날짜의 금니 시세 확인 및 생성
    const todayPrice = await ensureTodayGoldPrice()

    console.log('✅ 금니 시세 자동 동기화 완료:', {
      date: todayPrice.date,
      price_inlay: todayPrice.price_inlay,
      price_porcelain: todayPrice.price_porcelain,
      price_crown_pt: todayPrice.price_crown_pt,
      price_crown_st: todayPrice.price_crown_st,
      price_crown_at: todayPrice.price_crown_at
    })

    return NextResponse.json({
      success: true,
      message: '매일 금니 시세 동기화 완료',
      data: todayPrice
    })

  } catch (error) {
    console.error('❌ 매일 금니 시세 동기화 실패:', error)

    return NextResponse.json({
      success: false,
      message: '금니 시세 동기화 실패',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
}

// GET 메소드로도 호출 가능하도록 (수동 실행용)
export async function GET() {
  return POST()
}