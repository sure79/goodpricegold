'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL에서 인증 코드 처리
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback 에러:', error)
          setStatus('error')
          setMessage('인증 처리 중 오류가 발생했습니다.')
          return
        }

        if (data.session) {
          setStatus('success')
          setMessage('이메일 인증이 완료되었습니다. 로그인 페이지로 이동합니다.')

          // 3초 후 로그인 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/login?verified=true')
          }, 3000)
        } else {
          setStatus('error')
          setMessage('인증 세션을 찾을 수 없습니다.')
        }
      } catch (error) {
        console.error('Auth callback 처리 에러:', error)
        setStatus('error')
        setMessage('인증 처리 중 예상치 못한 오류가 발생했습니다.')
      }
    }

    handleAuthCallback()
  }, [router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">이메일 인증을 처리하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">인증 실패</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
            >
              로그인 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="bg-green-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">인증 완료</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    </div>
  )
}