'use client'

import Link from 'next/link'
import ReviewsDisplay from '@/components/common/ReviewsDisplay'

export default function PublicReviewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">고객 후기 모아보기</h1>
          <p className="text-sm sm:text-base text-gray-600">
            실제 고객님들이 남겨주신 생생한 후기입니다. 서비스 품질과 정산 속도를 확인하세요.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              지금 시작하기
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 rounded-md bg-white text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-50"
            >
              로그인
            </Link>
          </div>
        </header>

        <ReviewsDisplay />

        <section className="bg-white border border-blue-100 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900">후기를 남기고 싶으신가요?</h2>
          <p className="mt-2 text-sm text-gray-600">
            정산까지 완료한 고객이라면 마이페이지 &gt; 후기관리 메뉴에서 직접 후기를 작성하실 수 있습니다. 서비스 개선에 큰 힘이 됩니다.
          </p>
          <div className="mt-4">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              후기 작성하러 가기
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
