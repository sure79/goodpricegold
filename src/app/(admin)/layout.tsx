'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/common/Header'
import Sidebar from '@/components/common/Sidebar'
import { useAuthStore, initializeAuthOnce } from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isInitialized, initialize } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // 앱 전역 초기화 (한 번만)
    initializeAuthOnce()
  }, []) // 빈 배열로 변경 - 한 번만 실행

  useEffect(() => {
    console.log('Admin Layout Effect:', { user, isLoading, isInitialized, userRole: user?.role })

    if (isInitialized && !isLoading) {
      if (!user) {
        console.log('No user found, redirecting to login')
        try {
          router.push('/login')
        } catch (error) {
          console.error('Router push error:', error)
          window.location.href = '/login'
        }
        return
      }

      if (user.role !== 'admin') {
        console.log('User is not admin, role:', user.role, 'redirecting to dashboard')
        try {
          router.push('/dashboard')
        } catch (error) {
          console.error('Router push error:', error)
          window.location.href = '/dashboard'
        }
        return
      }

      console.log('Admin user confirmed, staying on admin page')
    }
  }, [user, isLoading, isInitialized]) // router 제거 - 무한 루프 방지

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}