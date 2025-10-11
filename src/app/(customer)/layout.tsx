'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Header from '@/components/common/Header'
import { useAuthStore, initializeAuthOnce } from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorBoundary from '@/components/common/ErrorBoundary'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isInitialized, initialize } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 앱 전역 초기화 (한 번만)
    initializeAuthOnce()
  }, []) // 빈 배열로 변경 - 한 번만 실행

  useEffect(() => {
    console.log('Customer Layout 효과 실행:', {
      isInitialized,
      isLoading,
      user: user?.email,
      role: user?.role,
      pathname
    })

    if (isInitialized && !isLoading) {
      if (!user) {
        console.log('사용자 없음 - 로그인 페이지로 리다이렉트 시도')
        // 현재 페이지가 이미 로그인 페이지가 아닌 경우에만 리다이렉트
        if (pathname !== '/login') {
          console.log('로그인 페이지로 리다이렉트:', pathname)
          try {
            router.push('/login')
          } catch (error) {
            console.error('Router push error:', error)
            window.location.href = '/login'
          }
        }
        return
      }

      if (user.role === 'admin') {
        console.log('관리자 사용자 - 관리자 페이지로 리다이렉트')
        try {
          router.push('/admin')
        } catch (error) {
          console.error('Router push error:', error)
          window.location.href = '/admin'
        }
        return
      }

      console.log('고객 사용자 - 현재 페이지 유지')
    }
  }, [user, isLoading, isInitialized, pathname]) // router 제거 - 무한 루프 방지

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || user.role === 'admin') {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Header />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  )
}