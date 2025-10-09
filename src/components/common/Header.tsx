'use client'

import Link from 'next/link'
import { BellIcon, UserIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

export default function Header() {
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  const handleLogout = async () => {
    try {
      await logout()
      // layout에서 자동으로 리다이렉트 처리하므로 여기서는 제거
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/로고3.png" alt="착한금니" className="h-16 sm:h-20 md:h-24 w-auto" />
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <>
                <button className="relative p-2 text-gray-400 hover:text-gray-600">
                  <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center space-x-1 sm:space-x-2">
                  <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{user.name}</span>
                    <span className="text-xs text-gray-500">
                      {user.role === 'admin' ? '관리자' : '고객'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-gray-700"
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}