import { NextRequest, NextResponse } from 'next/server'
import { getPurchaseRequest } from '@/lib/supabase/database'
import { getCurrentUser } from '@/lib/supabase/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const resolvedParams = await params
    const purchaseRequest = await getPurchaseRequest(resolvedParams.id)

    // 고객은 자신의 신청만 조회 가능
    if (user.role !== 'admin' && purchaseRequest.user_id !== user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    return NextResponse.json(purchaseRequest)
  } catch (error) {
    console.error('신청 상세 조회 실패:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}