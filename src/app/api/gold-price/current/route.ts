import { NextResponse } from 'next/server'
import { getCurrentGoldPrice } from '@/lib/supabase/database'

export async function GET() {
  try {
    const goldPrice = await getCurrentGoldPrice()

    if (!goldPrice) {
      // 기본 시세 반환 (테이블에 데이터가 없을 때)
      const defaultPrice = {
        id: 'default',
        date: new Date().toISOString().split('T')[0],
        base_price_18k: 85000,
        base_price_14k: 66000,
        updated_by: 'system',
        updated_at: new Date().toISOString()
      }
      return NextResponse.json(defaultPrice)
    }

    return NextResponse.json(goldPrice)
  } catch (error) {
    console.error('금 시세 조회 실패:', error)
    // 오류 발생 시에도 기본값 반환
    const defaultPrice = {
      id: 'default',
      date: new Date().toISOString().split('T')[0],
      base_price_18k: 85000,
      base_price_14k: 66000,
      updated_by: 'system',
      updated_at: new Date().toISOString()
    }
    return NextResponse.json(defaultPrice)
  }
}