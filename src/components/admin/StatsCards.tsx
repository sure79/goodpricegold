'use client'

import { formatCurrency, formatNumber } from '@/lib/utils'

interface StatsCardsProps {
  stats: {
    todayRequests: number
    pendingRequests: number
    monthlyRevenue: number
    activeUsers: number
    avgProcessingTime: number
    satisfactionRate: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      name: '오늘 신규 신청',
      value: formatNumber(stats.todayRequests),
      icon: '📝',
      color: 'bg-blue-500',
      suffix: '건'
    },
    {
      name: '처리 대기',
      value: formatNumber(stats.pendingRequests),
      icon: '⏳',
      color: 'bg-yellow-500',
      suffix: '건'
    },
    {
      name: '이번 달 매입액',
      value: formatCurrency(stats.monthlyRevenue),
      icon: '💰',
      color: 'bg-green-500',
      suffix: ''
    },
    {
      name: '활성 사용자',
      value: formatNumber(stats.activeUsers),
      icon: '👥',
      color: 'bg-purple-500',
      suffix: '명'
    },
    {
      name: '평균 처리시간',
      value: stats.avgProcessingTime.toFixed(1),
      icon: '⚡',
      color: 'bg-orange-500',
      suffix: '일'
    },
    {
      name: '고객 만족도',
      value: stats.satisfactionRate.toFixed(1),
      icon: '⭐',
      color: 'bg-pink-500',
      suffix: '%'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${card.color} rounded-md flex items-center justify-center`}>
                  <span className="text-white text-lg">{card.icon}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {card.value}{card.suffix}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}