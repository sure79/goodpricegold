'use client'

import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function ProfilePage() {
  const { user, isInitialized, isLoading } = useAuthStore()

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12 bg-white shadow rounded-lg">
        <p className="text-gray-600">사용자 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">👤 내 정보</h1>
        <p className="text-sm text-gray-600">
          가입 시 입력한 기본 정보를 확인하고 변경이 필요하면 고객센터로 문의해주세요.
        </p>
      </header>

      <section className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>
            <p className="text-sm text-gray-500 mt-1">회원 가입 시 입력하신 정보입니다.</p>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-gray-500">이름</dt>
              <dd className="mt-1 text-base font-medium text-gray-900">{user.name}</dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">이메일</dt>
              <dd className="mt-1 text-base font-medium text-gray-900">{user.email || '미등록'}</dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">휴대폰 번호</dt>
              <dd className="mt-1 text-base font-medium text-gray-900">{user.phone || '미등록'}</dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">회원 등급</dt>
              <dd className="mt-1 text-base font-medium text-gray-900">
                {user.total_amount && user.total_amount > 5000000 ? 'Gold 회원' : '일반 회원'}
              </dd>
            </div>
          </dl>

          {user.address && (
            <div>
              <dt className="text-sm text-gray-500">주소</dt>
              <dd className="mt-1 text-base font-medium text-gray-900">{user.address}</dd>
            </div>
          )}
        </div>
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded-lg p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-amber-900 mb-3">정보 변경이 필요하신가요?</h2>
        <p className="text-sm text-amber-800">
          고객센터로 연락주시면 신속하게 도와드리겠습니다. 개인정보 보호를 위해 웹에서 직접 수정 기능은 준비 중입니다.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <a
            href="tel:01012345678"
            className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700"
          >
            고객센터 전화 (010-1234-5678)
          </a>
          <Link
            href="mailto:support@geumnikkaeb.com"
            className="inline-flex items-center justify-center px-4 py-2 bg-white text-amber-700 text-sm font-medium rounded-md border border-amber-200 hover:bg-amber-100"
          >
            이메일 문의
          </Link>
        </div>
      </section>
    </div>
  )
}
