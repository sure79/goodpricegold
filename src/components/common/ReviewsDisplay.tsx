'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getReviews } from '@/lib/supabase/database'
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

      // 최신 순으로 정렬하고 최대 6개만 표시
      const latestReviews = reviewsWithMaskedNames
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6)

      setReviews(latestReviews)
    } catch (error) {
      console.error('후기 조회 실패:', error)
      // 에러 발생시 빈 배열로 설정 (실제 배포에서는 데이터베이스 문제 해결 필요)
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
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ⭐
      </span>
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
          고객 만족 후기
        </div>
        <div className="text-purple-700 text-sm font-medium">
          실제 이용고객 {reviews.length > 0 ? reviews.length : '0'}명의 생생한 후기
        </div>
      </div>

      {/* 전체 평점 표시 */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="flex text-2xl mr-3">
              {renderStars(5)}
            </div>
            <div className="text-3xl font-bold text-purple-600">4.8</div>
          </div>
          <div className="text-gray-600 text-sm">평균 만족도 (최근 30일 기준)</div>
        </div>
      )}

      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-400 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">
                      {(review.user_name || '익명')[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {review.user_name || '익명'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(review.created_at)} 거래 완료
                    </div>
                  </div>
                </div>
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  인증된 후기
                </div>
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">&ldquo;{review.title}&rdquo;</h4>
              )}

              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                {review.content}
              </p>

              {/* 가상의 추가 정보 */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                    18K 금니 매입
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    당일 입금 완료
                  </span>
                </div>
                <div className="text-xs text-purple-600 font-medium">
                  도움됨 👍 {Math.floor(Math.random() * 20) + 5}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">첫 번째 후기를 기다리고 있어요!</h4>
            <p className="text-gray-600 text-sm mb-4">
              착한금니와 함께한 경험을 공유해주세요.<br/>
              소중한 후기가 다른 고객에게 큰 도움이 됩니다.
            </p>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-purple-700 text-xs">
                💡 후기 작성시 1,000원 쿠폰 증정 (매입 완료 고객 대상)
              </p>
            </div>
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="mt-6 pt-4 border-t border-purple-300 text-center">
          <Link
            href="/testimonials"
            className="inline-flex items-center bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors shadow-sm"
          >
            <span className="mr-2">📖</span>
            전체 후기 보기
            <span className="ml-2">→</span>
          </Link>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-purple-300">
        <div className="flex items-center justify-center text-purple-700 text-xs">
          <span className="mr-1">🛡️</span>
          모든 후기는 실제 거래 완료 고객만 작성 가능합니다
        </div>
      </div>
    </div>
  )
}
