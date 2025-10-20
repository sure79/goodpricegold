'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const handleKakaoCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          throw new Error('카카오 로그인이 취소되었습니다.')
        }

        if (!code) {
          throw new Error('인증 코드가 없습니다.')
        }

        // 카카오 SDK로 토큰 요청
        const response = await fetch('https://kauth.kakao.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || '',
            redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || '',
            code,
          }),
        })

        const tokenData = await response.json()

        if (tokenData.error) {
          throw new Error(tokenData.error_description || '토큰 요청 실패')
        }

        // 카카오 사용자 정보 가져오기
        const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        })

        const kakaoUser = await userResponse.json()

        if (!kakaoUser.id) {
          throw new Error('사용자 정보를 가져올 수 없습니다.')
        }

        // 카카오 사용자 정보로 Supabase 인증 처리
        const email = kakaoUser.kakao_account?.email || `kakao_${kakaoUser.id}@kakao.local`
        const name = kakaoUser.kakao_account?.name || kakaoUser.kakao_account?.profile?.nickname || '카카오 사용자'
        const phone = kakaoUser.kakao_account?.phone_number?.replace('+82 ', '0').replace(/-/g, '') || null

        // Supabase에서 기존 사용자 확인
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single()

        if (existingProfile) {
          // 기존 사용자 - 비밀번호로 로그인 (카카오 ID 사용)
          const password = `kakao_${kakaoUser.id}`

          try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            })

            if (signInError) {
              // 비밀번호가 다른 경우 업데이트 시도
              console.log('기존 사용자 로그인 실패, 세션 생성 시도')

              // 관리자 권한으로 사용자 세션 생성
              const { data: { user }, error: sessionError } = await supabase.auth.signInWithPassword({
                email,
                password: `kakao_${kakaoUser.id}`,
              })

              if (sessionError) {
                throw new Error('로그인에 실패했습니다.')
              }
            }
          } catch (loginError) {
            console.error('로그인 오류:', loginError)
            throw new Error('로그인에 실패했습니다.')
          }
        } else {
          // 신규 사용자 - 회원가입
          const password = `kakao_${kakaoUser.id}`

          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                phone,
              },
            },
          })

          if (signUpError) {
            throw new Error(`회원가입 실패: ${signUpError.message}`)
          }

          if (!authData.user) {
            throw new Error('사용자 생성에 실패했습니다.')
          }

          // 프로필 생성 대기
          await new Promise(resolve => setTimeout(resolve, 100))

          // 프로필 확인 및 생성
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single()

          if (!profile) {
            // 수동 프로필 생성
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                name,
                phone,
                email,
                role: 'customer',
              })

            if (insertError) {
              console.error('프로필 생성 실패:', insertError)
            }
          }
        }

        // 로그인 성공 - 대시보드로 이동
        router.push('/dashboard')
      } catch (error: unknown) {
        console.error('카카오 로그인 처리 오류:', error)
        const errorMessage = error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.'
        setError(errorMessage)

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    handleKakaoCallback()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold mb-2">로그인 실패</p>
            <p>{error}</p>
            <p className="text-sm mt-2">잠시 후 로그인 페이지로 이동합니다...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">카카오 로그인 처리 중...</p>
    </div>
  )
}
