'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { getReviews, createReview, updateReview, deleteReview } from '@/lib/supabase/database'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { formatDate } from '@/lib/utils'

interface AdminReview {
  id: string
  user_id: string | null
  customer_name: string
  content: string
  rating: number
  transaction_amount?: number
  is_public: boolean
  created_at: string
  updated_at?: string
}

interface ReviewFormData {
  customer_name: string
  content: string
  rating: number
  transaction_amount: number
  is_public: boolean
}

export default function AdminReviewsPage() {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'public' | 'private'>('all')
  const [selectedRating, setSelectedRating] = useState(5)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ReviewFormData>({
    defaultValues: {
      rating: 5,
      is_public: true
    }
  })

  const fetchReviews = async () => {
    try {
      const data = await getReviews()
      // API에서 받은 데이터를 AdminReview 형태로 변환
      const adminReviews: AdminReview[] = data.map(review => ({
        id: review.id,
        user_id: review.user_id,
        customer_name: review.title || '익명', // title을 customer_name으로 사용
        content: review.content,
        rating: review.rating,
        transaction_amount: undefined, // 기본 Review 타입에는 없음
        is_public: review.is_public,
        created_at: review.created_at,
        updated_at: review.updated_at
      }))
      setReviews(adminReviews)
    } catch (error) {
      console.error('후기 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const filteredReviews = reviews.filter(review => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'public') return review.is_public
    if (filterStatus === 'private') return !review.is_public
    return true
  })

  const onSubmit = async (data: ReviewFormData) => {
    if (!user) return

    try {
      setIsSubmitting(true)

      const reviewData = {
        purchase_request_id: 'admin-generated', // 관리자가 생성한 후기 표시
        user_id: user.id, // 관리자 ID
        title: data.customer_name, // customer_name을 title로 사용
        content: data.content,
        rating: selectedRating, // 클릭형 별점 사용
        is_public: data.is_public
      }

      await createReview(reviewData)
      await fetchReviews() // 목록 새로고침
      setShowCreateForm(false)
      setSelectedRating(5) // 별점 초기화
      reset()
      alert('후기가 성공적으로 등록되었습니다.')
    } catch (error) {
      console.error('후기 등록 실패:', error)
      alert('후기 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePublicStatus = async (reviewId: string, currentStatus: boolean) => {
    try {
      await updateReview(reviewId, { is_public: !currentStatus })
      await fetchReviews() // 목록 새로고침
      alert(`후기가 ${!currentStatus ? '공개' : '비공개'}로 변경되었습니다.`)
    } catch (error) {
      console.error('상태 변경 실패:', error)
      alert('상태 변경에 실패했습니다.')
    }
  }

  const handleDeleteReview = async (reviewId: string, customerName: string) => {
    if (!confirm(`${customerName}님의 후기를 삭제하시겠습니까?`)) return

    try {
      await deleteReview(reviewId)
      await fetchReviews() // 목록 새로고침
      alert('후기가 삭제되었습니다.')
    } catch (error) {
      console.error('후기 삭제 실패:', error)
      alert('후기 삭제에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">후기 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            고객 후기를 관리하고 새로운 기본 후기를 작성할 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          새 후기 작성
        </button>
      </div>

      {/* 필터링 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-md ${filterStatus === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
          >
            전체 ({reviews.length})
          </button>
          <button
            onClick={() => setFilterStatus('public')}
            className={`px-4 py-2 rounded-md ${filterStatus === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
          >
            공개 ({reviews.filter(r => r.is_public).length})
          </button>
          <button
            onClick={() => setFilterStatus('private')}
            className={`px-4 py-2 rounded-md ${filterStatus === 'private' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}
          >
            비공개 ({reviews.filter(r => !r.is_public).length})
          </button>
        </div>
      </div>

      {/* 후기 작성 폼 */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">새 후기 작성</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  고객명 *
                </label>
                <input
                  {...register('customer_name', { required: '고객명을 입력해주세요' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="홍길동"
                />
                {errors.customer_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거래금액
                </label>
                <input
                  {...register('transaction_amount', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                평점 *
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className={`text-3xl transition-colors duration-200 hover:scale-110 transform ${
                      star <= selectedRating
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-3 text-sm text-gray-600">({selectedRating}점)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                후기 내용 *
              </label>
              <textarea
                {...register('content', { required: '후기 내용을 입력해주세요' })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="고객 후기를 작성해주세요..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                {...register('is_public')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                공개 후기로 등록
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? '등록 중...' : '후기 등록'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 후기 목록 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            후기 목록 ({filteredReviews.length}개)
          </h3>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 후기가 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{review.customer_name}</span>
                      <div className="flex items-center">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i} className="text-yellow-400">⭐</span>
                        ))}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        review.is_public
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {review.is_public ? '공개' : '비공개'}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-2">{review.content}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>등록일: {formatDate(review.created_at)}</span>
                      {review.transaction_amount && (
                        <span>거래금액: {review.transaction_amount.toLocaleString()}원</span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => togglePublicStatus(review.id, review.is_public)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        review.is_public
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {review.is_public ? '비공개' : '공개'}
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id, review.customer_name)}
                      className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}