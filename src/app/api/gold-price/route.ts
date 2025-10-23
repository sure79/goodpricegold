import { NextRequest, NextResponse } from 'next/server'
import { getCurrentGoldPrice, updateGoldPrice } from '@/lib/supabase/database'

export async function GET() {
  try {
    const currentPrice = await getCurrentGoldPrice()
    return NextResponse.json(currentPrice)
  } catch (error) {
    console.error('금 시세 조회 실패:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { price_porcelain, price_inlay_s, price_inlay, price_crown_pt, price_crown_st, price_crown_at, updated_by = 'admin' } = body

    const priceData = {
      date: new Date().toISOString().split('T')[0],
      price_porcelain,
      price_inlay_s,
      price_inlay,
      price_crown_pt,
      price_crown_st,
      price_crown_at,
      updated_by,
      updated_at: new Date().toISOString()
    }

    const updatedPrice = await updateGoldPrice(priceData)
    return NextResponse.json(updatedPrice)
  } catch (error) {
    console.error('금 시세 업데이트 실패:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}