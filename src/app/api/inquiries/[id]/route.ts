import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { status, admin_response } = body
    const resolvedParams = await params

    const { data, error } = await supabase
      .from('inquiries')
      .update({
        status,
        admin_response,
        responded_at: status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) {
      console.error('문의 업데이트 실패:', error)
      return NextResponse.json(
        { success: false, message: '문의 업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '문의가 성공적으로 업데이트되었습니다.'
    })

  } catch (error) {
    console.error('문의 업데이트 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}