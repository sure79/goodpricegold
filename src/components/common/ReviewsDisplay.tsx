'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getReviews } from '@/lib/supabase/database'
import { maskName } from '@/lib/utils'
import type { Review } from '@/types'

interface ReviewWithUserName extends Review {
  user_name?: string
}

export default function ReviewsDisplay() {
  const [reviews, setReviews] = useState<ReviewWithUserName[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()

    // 5분마다 실시간으로 후기 새로고침
    const interval = setInterval(fetchReviews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      // 공개된 후기만 가져오기
      const publicReviews = await getReviews(true)

      // 사용자 이름 마스킹 처리
      const reviewsWithMaskedNames = publicReviews.map(review => ({
        ...review,
        user_name: maskUserName(review.user_id)
      }))

      // 최신 순으로 정렬하고 최대 5개만 표시
      const latestReviews = reviewsWithMaskedNames
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setReviews(latestReviews)
    } catch (error) {
      console.error('후기 조회 실패:', error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  // 사용자 ID를 기반으로 마스킹된 이름 생성
  const maskUserName = (userId: string) => {
    const surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const surname = surnames[hash % surnames.length]
    return `${surname}**`
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ⭐
      </span>
    ))
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200 p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-2">
          <span className="mr-2">⭐</span>
          고객 후기
        </div>
        <div className="text-purple-700 text-sm font-medium">
          실제 이용고객 후기
        </div>
      </div>

      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="flex text-sm">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {review.user_name || '익명'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                {review.content}
              </p>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <span className="text-4xl mb-2 block">💬</span>
            <p className="text-gray-500 text-sm">후기 준비 중...</p>
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="mt-6 pt-4 border-t border-purple-300 text-center">
          <Link
            href="/testimonials"
            className="inline-flex items-center text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors text-sm"
          >
            전체 후기 보기
            <span className="ml-2">→</span>
          </Link>
        </div>
      )}
    </div>
  )
}
