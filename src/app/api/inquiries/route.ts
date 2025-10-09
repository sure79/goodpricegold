import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, message, user_id } = body

    // 문의 데이터베이스에 저장
    const inquiryData = {
      name,
      phone,
      message,
      user_id: user_id || null,
      status: 'pending',
      inquiry_number: `INQ${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('inquiries')
      .insert(inquiryData)
      .select()
      .single()

    if (error) {
      console.error('문의 저장 실패:', error)

      // 테이블 관련 에러 처리
      if (error.code === 'PGRST205' || error.message?.includes('table')) {
        console.error('inquiries 테이블에 접근할 수 없습니다:', error)
        return NextResponse.json(
          { success: false, message: '현재 문의 접수 시스템에 문제가 있습니다. 잠시 후 다시 시도해주세요.' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { success: false, message: '문의 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '문의가 성공적으로 접수되었습니다.'
    })

  } catch (error) {
    console.error('문의 처리 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('문의 조회 실패:', error)
      return NextResponse.json(
        { success: false, message: '문의 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('문의 조회 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}