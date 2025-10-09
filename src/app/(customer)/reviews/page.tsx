'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getReviews, createReview, getPurchaseRequests } from '@/lib/supabase/database'
import { uploadMultipleImages } from '@/lib/supabase/storage'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import type { Review, PurchaseRequest } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function ReviewsPage() {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWriteForm, setShowWriteForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<string>('')
  const [rating, setRating] = useState(1)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [reviewImages, setReviewImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const [reviewsData, requestsData] = await Promise.all([
          getReviews(),
          getPurchaseRequests(user.id)
        ])

        // 내가 작성한 리뷰만 필터링
        const myReviews = reviewsData.filter(review => review.user_id === user.id)
        setReviews(myReviews)

        // 완료된 신청 중 리뷰가 없는 것들만
        const completedRequests = requestsData.filter(req =>
          req.status === 'deposited' &&
          !myReviews.some(review => review.purchase_request_id === req.id)
        )
        setRequests(completedRequests)
      } catch (error) {
        console.error('데이터 조회 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + reviewImages.length > 3) {
      alert('최대 3장까지 업로드할 수 있습니다.')
      return
    }

    const newFiles = [...reviewImages, ...files]
    setReviewImages(newFiles)

    const newUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newUrls])
  }

  const removeImage = (index: number) => {
    const newFiles = reviewImages.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)

    URL.revokeObjectURL(previewUrls[index])
    setReviewImages(newFiles)
    setPreviewUrls(newUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest || !title.trim() || !content.trim()) {
      alert('신청을 선택하고 제목과 후기를 작성해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      // 이미지 업로드 (선택사항)
      let imageUrls: string[] = []
      if (reviewImages.length > 0) {
        try {
          imageUrls = await uploadMultipleImages(reviewImages, 'review-images')
        } catch (imageError) {
          console.warn('이미지 업로드 실패, 텍스트만 저장:', imageError)
          // 이미지 업로드 실패해도 후기는 저장
        }
      }

      // 후기 저장
      const reviewData = {
        purchase_request_id: selectedRequest,
        user_id: user!.id,
        rating,
        title: title.trim(),
        content: content.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
        is_public: true
      }

      await createReview(reviewData)

      // 성공 후 리뷰 목록 새로고침
      const updatedReviews = await getReviews()
      const myReviews = updatedReviews.filter(review => review.user_id === user?.id)
      setReviews(myReviews)

      // 완료된 신청 목록도 업데이트
      const requestsData = await getPurchaseRequests(user?.id || '')
      const completedRequests = requestsData.filter(req =>
        req.status === 'deposited' &&
        !myReviews.some(review => review.purchase_request_id === req.id)
      )
      setRequests(completedRequests)

      // 폼 초기화
      setSelectedRequest('')
      setRating(1)
      setTitle('')
      setContent('')
      setReviewImages([])
      setPreviewUrls([])
      setShowWriteForm(false)

      alert('후기가 성공적으로 등록되었습니다!')
    } catch (error) {
      console.error('후기 등록 실패:', error)
      alert(`후기 등록에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange && onChange(star)}
            className={`text-xl ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            disabled={!interactive}
          >
            ⭐
          </button>
        ))}
      </div>
    )
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⭐ 후기 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            서비스 후기를 작성하고 관리하세요.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
        >
          ← 대시보드
        </Link>
      </div>

      {/* 후기 작성 버튼 */}
      {requests.length > 0 && !showWriteForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-blue-900">✍️ 후기를 작성해주세요!</h3>
              <p className="text-sm text-blue-700">
                완료된 거래 {requests.length}건에 대한 후기를 작성할 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => setShowWriteForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 whitespace-nowrap self-start sm:self-auto"
            >
              후기 작성
            </button>
          </div>
        </div>
      )}

      {/* 후기 작성 폼 */}
      {showWriteForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">후기 작성</h2>
            <button
              onClick={() => setShowWriteForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                거래 선택 *
              </label>
              <select
                value={selectedRequest}
                onChange={(e) => setSelectedRequest(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">후기를 작성할 거래를 선택하세요</option>
                {requests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.request_number} - {formatDate(request.created_at)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                평점 *
              </label>
              <div className="flex items-center space-x-2">
                {renderStars(rating, true, setRating)}
                <span className="text-sm text-gray-600">({rating}점)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                후기 제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="후기 제목을 입력해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                후기 내용 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="서비스 이용 경험을 자세히 작성해주세요."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사진 첨부 (선택, 최대 3장)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <label htmlFor="review-upload" className="cursor-pointer">
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded">사진 선택</span>
                      <span className="ml-2">또는 드래그하여 업로드</span>
                    </div>
                    <input
                      id="review-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG 파일 (최대 3장)</p>
                </div>
              </div>

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`후기 사진 ${index + 1}`}
                        className="w-full h-20 sm:h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={() => setShowWriteForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    등록 중...
                  </div>
                ) : (
                  '후기 등록'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 작성한 후기 목록 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">작성한 후기</h2>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">⭐</div>
            <p className="text-gray-500 mb-4">아직 작성한 후기가 없습니다.</p>
            <p className="text-sm text-gray-400">
              거래 완료 후 후기를 작성해보세요.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{review.title}</h3>
                    {renderStars(review.rating)}
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    review.is_public
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {review.is_public ? '공개' : '비공개'}
                  </span>
                </div>

                <p className="text-gray-700 mb-3">{review.content}</p>

                {review.images && review.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {review.images.map((imageUrl, index) => (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`후기 사진 ${index + 1}`}
                        className="w-full h-16 sm:h-20 object-cover rounded border cursor-pointer"
                        onClick={() => window.open(imageUrl, '_blank')}
                      />
                    ))}
                  </div>
                )}

                {review.admin_reply && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-900 mb-1">💬 관리자 답변</p>
                    <p className="text-sm text-blue-800">{review.admin_reply}</p>
                    {review.replied_at && (
                      <p className="text-xs text-blue-600 mt-1">
                        {formatDate(review.replied_at)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}