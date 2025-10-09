'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore, initializeAuthOnce } from '@/stores/authStore'
import GoldPriceDisplay from '@/components/common/GoldPriceDisplay'
import ApplicationStatus from '@/components/common/ApplicationStatus'
import ReviewsDisplay from '@/components/common/ReviewsDisplay'
import FeatureSlider from '@/components/common/FeatureSlider'

export default function HomePage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const isLoggedIn = !!user

  useEffect(() => {
    // 앱 전역 초기화 (한 번만)
    initializeAuthOnce()
  }, []) // initialize 함수 제거 - 무한 루프 방지

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    return user.role === 'admin' ? '/admin' : '/dashboard'
  }
  return (
    <div className="min-h-screen bg-white">
      {/* 상단 프로모션 배너 */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="text-xl">🎁</span>
          <span className="font-bold text-sm md:text-base">신규 회원 가입 시 만원 추가 혜택!</span>
          <Link href="/signup" className="ml-2 bg-white text-amber-600 px-4 py-1 rounded-full text-xs md:text-sm font-semibold hover:bg-gray-100 transition-colors">
            지금 가입하기
          </Link>
        </div>
      </div>

      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4 md:gap-0">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img src="/로고3.png" alt="착한금니 로고" className="h-24 md:h-20 w-auto" />
            </Link>

            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 w-full md:w-auto">
              <div className="flex items-center space-x-2 text-gray-900">
                <span className="text-xl md:text-base">📞</span>
                <span className="font-semibold text-lg md:text-base">010-6622-9774</span>
              </div>

              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <>
                    <Link
                      href={getDashboardLink()}
                      className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
                    >
                      {user?.role === 'admin' ? '관리자페이지' : '마이페이지'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 히어로 섹션 */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* 착한금니 로고 */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <img src="/로고3.png" alt="착한금니 로고" className="w-48 h-48 md:w-40 md:h-40" />
              </div>
            </div>

            {/* 메인 제목 */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              <span className="block">대한민국 NO.1</span>
              <span className="block" style={{color: '#d4af37'}}>금니매입 전문</span>
            </h1>

            {/* 서브 제목 */}
            <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              15년 전통의 믿을 수 있는 금니매입 서비스<br/>
              <span className="font-medium text-gray-900">정확한 감정 • 최고가 매입 • 당일 입금</span>
            </p>

            {/* 주요 특징 슬라이드 */}
            <div className="mb-12">
              <FeatureSlider />
            </div>

            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/apply"
                    className="bg-gray-900 text-white px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-gray-800 transition-all shadow-sm"
                  >
                    지금 바로 매입 신청
                  </Link>
                  <Link
                    href={getDashboardLink()}
                    className="bg-white text-gray-900 px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-gray-50 transition-all border border-gray-300"
                  >
                    {user?.role === 'admin' ? '관리자페이지' : '마이페이지'}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="bg-gray-900 text-white px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-gray-800 transition-all shadow-sm"
                  >
                    지금 바로 매입 신청
                  </Link>
                  <Link
                    href="/login"
                    className="bg-white text-gray-900 px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-gray-50 transition-all border border-gray-300"
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>

            {/* 실시간 매입 현황 */}
            <div className="bg-white rounded-xl p-6 max-w-2xl mx-auto border border-gray-200 shadow-sm">
              <div className="text-gray-900 font-semibold mb-4 text-sm">📊 오늘 매입 현황</div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-gray-900">127건</div>
                  <div className="text-sm text-gray-500 mt-1">오늘</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">2시간</div>
                  <div className="text-sm text-gray-500 mt-1">평균 시간</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 시세, 신청현황, 후기 섹션 */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 섹션 제목 */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              실시간 매입 정보
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              정확한 시세와 투명한 처리 현황을 실시간으로 확인하세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GoldPriceDisplay />
            <ApplicationStatus />
            <ReviewsDisplay />
          </div>
        </div>
      </div>

      {/* 이용 절차 안내 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <p className="text-sm font-semibold tracking-wide uppercase mb-3" style={{color: '#d4af37'}}>이용 방법</p>
            <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              금니 매입이 처음이라도, 이렇게 진행돼요
            </p>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              회원가입부터 정산까지 한눈에 확인하고, 각 단계마다 안내 메시지를 받아 안심하고 거래하세요.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { icon: '📝', title: '회원가입 · 로그인', description: '간단한 정보 입력으로 가입하고, 로그인하면 마이페이지에서 모든 진행 상황을 확인할 수 있습니다.' },
              { icon: '📦', title: '매입 신청 & 택배 발송', description: '사진과 기본 정보를 등록하면 신청번호가 발급되고, 안내에 따라 안전하게 택배를 발송합니다.' },
              { icon: '📥', title: '입고 확인', description: '택배가 도착하면 즉시 입고 상태로 전환되고, 문자/알림으로 수령 사실을 알려드립니다.' },
              { icon: '🔍', title: '전문 감정', description: '전문 감정사가 순도·중량을 측정하고 결과와 예상 정산액을 앱에서 확인할 수 있습니다.' },
              { icon: '👍', title: '결과 확인', description: '감정 결과가 마음에 드시면 "확인 완료"를 눌러 주세요. 궁금한 점은 메모나 문의로 남길 수 있습니다.' },
              { icon: '💳', title: '정산 완료', description: '확인 즉시 정산이 진행되고, 입금이 완료되면 문자와 마이페이지에서 입금 내역을 확인할 수 있습니다.' },
            ].map((step) => (
              <div key={step.title} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start space-x-3 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="text-2xl flex-shrink-0" aria-hidden>
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <p className="text-sm font-semibold tracking-wide uppercase mb-3" style={{color: '#d4af37'}}>특징</p>
            <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 착한금니를 선택해야 할까요?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center bg-white rounded-xl p-8 border border-gray-200 hover:shadow-md transition-all">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">최고가 매입</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                실시간 금 시세를 반영한 최고가 매입으로 고객님께 최대한의 이익을 제공합니다.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-8 border border-gray-200 hover:shadow-md transition-all">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">정확한 감정</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                전문 감정사가 정밀 검사를 통해 정확한 순도와 중량을 측정합니다.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-8 border border-gray-200 hover:shadow-md transition-all">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">신속한 정산</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                감정 완료 후 즉시 정산 처리하여 빠른 입금 서비스를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        {/* 상단 CTA 섹션 */}
        <div className="bg-gray-800 py-12 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              지금 바로 금니를 최고가에 매입하세요!
            </h3>
            <p className="text-gray-300 text-base mb-6">
              15년 전통의 믿을 수 있는 금니매입 전문가가 정확한 감정으로 최고가를 제공합니다
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="bg-white text-gray-900 px-7 py-3 rounded-lg font-semibold text-base hover:bg-gray-100 transition-colors"
              >
                무료 견적 받기
              </Link>
              <a
                href="tel:010-6622-9774"
                className="bg-gray-700 text-white px-7 py-3 rounded-lg font-semibold text-base hover:bg-gray-600 transition-colors"
              >
                📞 전화 상담 (무료)
              </a>
            </div>
          </div>
        </div>

        <div className="text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* 회사 정보 */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-6">
                  <img src="/로고3.png" alt="착한금니 로고" className="h-32 w-auto mr-4" />
                </div>
                <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                  <strong>대한민국 NO.1 금니매입 전문기업</strong><br/>
                  15년간 축적된 노하우와 전문 감정사의 정확한 평가로<br/>
                  고객님의 소중한 금니를 최고가에 매입해드립니다.
                </p>

                <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <span className="mr-3">🏢</span>
                    <span><strong>사업자등록번호:</strong> 101-28-66901</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="mr-3">📋</span>
                    <span><strong>통신판매업:</strong> 제2025-울산남구-0646호</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="mr-3">👤</span>
                    <span><strong>대표:</strong> 진병관</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="mr-3">🏬</span>
                    <span><strong>주소:</strong> 울산광역시 남구 남중로108번길 36, 2층 202호</span>
                  </div>
                </div>
              </div>

              {/* 고객센터 */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🎧</span>
                  고객센터
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                    <p className="text-gray-400 text-xs font-medium mb-1">📞 상담 전화</p>
                    <p className="text-xl font-bold text-white">010-6622-9774</p>
                    <p className="text-gray-500 text-xs mt-1">통화료 무료</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-400 mb-1 text-xs">📧 이메일 문의</p>
                      <p className="text-gray-300 text-sm">support@geumnikkaebi.com</p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-400 mb-1 text-xs">⏰ 운영시간</p>
                      <div className="text-gray-300 space-y-1 text-sm">
                        <p>평일: 09:00 - 18:00</p>
                        <p>토요일: 09:00 - 15:00</p>
                        <p className="text-gray-500">일요일 및 공휴일 휴무</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 서비스 안내 */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📦</span>
                  매입 안내
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="font-medium text-gray-400 mb-2 text-xs">📦 택배 발송 주소</p>
                    <div className="text-gray-300 space-y-1 text-sm">
                      <p>울산광역시 남구 남중로108번길 36</p>
                      <p>2층 202호</p>
                      <p className="text-white">착한금니 감정팀</p>
                      <p className="font-semibold">📞 010-6622-9774</p>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="font-medium text-gray-400 mb-2 text-xs">💳 입금 계좌</p>
                    <div className="text-gray-300 space-y-1 text-sm">
                      <p>국민은행 123456-78-901234</p>
                      <p>예금주: (주)착한금니</p>
                      <p className="text-xs text-gray-400 mt-2">
                        💡 당일 입금 보장
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 보증 및 인증 배지 */}
            <div className="border-t border-gray-700 pt-8 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                <div className="bg-gray-800 text-gray-300 rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl mb-1">🛡️</div>
                  <div className="text-xs font-medium">안전거래보장</div>
                </div>
                <div className="bg-gray-800 text-gray-300 rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="text-xs font-medium">SSL 보안인증</div>
                </div>
                <div className="bg-gray-800 text-gray-300 rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl mb-1">💎</div>
                  <div className="text-xs font-medium">전문감정보증</div>
                </div>
                <div className="bg-gray-800 text-gray-300 rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs font-medium">당일입금보장</div>
                </div>
                <div className="bg-gray-800 text-gray-300 rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs font-medium">최고가보장</div>
                </div>
              </div>
            </div>

            {/* 하단 저작권 */}
            <div className="border-t border-gray-800 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <div className="text-sm text-gray-500 mb-4 md:mb-0">
                  <p>&copy; 2024 착한금니(주). All rights reserved.</p>
                  <p className="mt-1 text-xs">본 사이트의 모든 콘텐츠는 저작권법의 보호를 받습니다.</p>
                </div>
                <div className="flex space-x-4 text-sm">
                  <a href="#" className="text-gray-500 hover:text-white transition-colors">이용약관</a>
                  <a href="#" className="text-gray-500 hover:text-white transition-colors">개인정보처리방침</a>
                  <a href="#" className="text-gray-500 hover:text-white transition-colors">사업자정보확인</a>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600">
                  착한금니는 정부 인증 금속매입업체로서 투명하고 안전한 거래를 약속드립니다 • 호스팅 제공: (주)착한금니
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
