import { NextRequest, NextResponse } from 'next/server'
import { createPurchaseRequest, getPurchaseRequests } from '@/lib/supabase/database'
import { getCurrentUser } from '@/lib/supabase/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const requests = await getPurchaseRequests(user.role === 'admin' ? undefined : user.id)
    return NextResponse.json(requests)
  } catch (error) {
    console.error('신청 목록 조회 실패:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const newRequest = await createPurchaseRequest({
      ...body,
      user_id: user.id
    })

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error('신청 생성 실패:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}