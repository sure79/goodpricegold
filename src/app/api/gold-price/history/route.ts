import { NextResponse } from 'next/server'
import { getGoldPriceHistory } from '@/lib/supabase/database'

export async function GET() {
  try {
    const history = await getGoldPriceHistory(365) // 최근 1년 데이터
    return NextResponse.json(history)
  } catch (error) {
    console.error('금시세 히스토리 조회 실패:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}