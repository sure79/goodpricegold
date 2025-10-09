'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  DocumentPlusIcon,
  ClockIcon,
  ArchiveBoxIcon,
  CreditCardIcon,
  StarIcon,
  UserIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const customerNavigation = [
  { name: '대시보드', href: '/dashboard', icon: HomeIcon },
  { name: '매입신청', href: '/apply', icon: DocumentPlusIcon },
  { name: '진행상황', href: '/tracking', icon: ClockIcon },
  { name: '신청내역', href: '/history', icon: ArchiveBoxIcon },
  { name: '정산내역', href: '/settlements', icon: CreditCardIcon },
  { name: '후기관리', href: '/reviews', icon: StarIcon },
  { name: '프로필', href: '/profile', icon: UserIcon },
]

const adminNavigation = [
  { name: '대시보드', href: '/admin', icon: HomeIcon },
  { name: '신청관리', href: '/admin/requests', icon: DocumentPlusIcon },
  { name: '정산관리', href: '/admin/settlements', icon: CreditCardIcon },
  { name: '회원관리', href: '/admin/users', icon: UsersIcon },
  { name: '문의관리', href: '/admin/inquiries', icon: ChatBubbleLeftRightIcon },
  { name: '통계', href: '/admin/statistics', icon: ChartBarIcon },
  { name: '후기관리', href: '/admin/reviews', icon: StarIcon },
  { name: '설정', href: '/admin/settings', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  if (!user) return null

  const navigation = user.role === 'admin' ? adminNavigation : customerNavigation

  return (
    <div className="flex flex-col w-full lg:w-64 bg-white shadow-sm">
      <div className="flex-1 flex flex-col pt-2 lg:pt-5 pb-4 overflow-y-auto">
        <nav className="mt-2 lg:mt-5 flex-1 px-2">
          {/* Mobile: Horizontal scroll, Desktop: Vertical stack */}
          <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-3 lg:px-2 py-2 text-xs lg:text-sm font-medium rounded-md whitespace-nowrap flex-shrink-0'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-2 lg:mr-3 flex-shrink-0 h-5 w-5 lg:h-6 lg:w-6'
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-xs sm:text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
