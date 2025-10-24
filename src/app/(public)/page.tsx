'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore, initializeAuthOnce } from '@/stores/authStore'
import GoldPriceDisplay from '@/components/common/GoldPriceDisplay'
import ApplicationStatus from '@/components/common/ApplicationStatus'
import ReviewsDisplay from '@/components/common/ReviewsDisplay'
import ImageSlider from '@/components/common/ImageSlider'
import KakaoChannelButton from '@/components/common/KakaoChannelButton'

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

  const handlePhoneCopy = async () => {
    try {
      await navigator.clipboard.writeText('010-8325-9774')
      alert('전화번호가 복사되었습니다!')
    } catch (err) {
      console.error('복사 실패:', err)
      alert('전화번호: 010-8325-9774')
    }
  }
  return (
    <div className="min-h-screen bg-black">
      {/* 상단 헤더 */}
      <header className="bg-black border-b border-yellow-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 md:py-6">
            {/* 첫 번째 줄: 로고 + 중간 텍스트(lg에서만) + 버튼 */}
            <div className="flex justify-between items-center">
              {/* 왼쪽: 로고 + 하단 문구 */}
              <div className="flex flex-col items-start">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                  <img src="/로고3.png" alt="착한금니 로고" className="h-16 md:h-20 object-contain" />
                </Link>
                <span className="text-[10px] md:text-sm font-medium text-yellow-300 mt-1">폐금 금이빨 전문매입업체</span>
              </div>

              {/* 중간: 새로운 텍스트 (lg 이상에서만 표시) */}
              <div className="hidden lg:block text-center px-4">
                <p className="text-sm md:text-base font-medium text-yellow-300 leading-relaxed">
                  온라인 택배로 간편하게,<br />정직한 검수로 믿음을 전합니다.
                </p>
              </div>

              {/* 오른쪽: 버튼들 */}
              <div className="flex items-center gap-2 md:gap-3">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="text-yellow-300 hover:text-yellow-100 transition-colors font-medium text-xs md:text-sm px-3 md:px-4 py-2 whitespace-nowrap"
                  >
                    로그아웃
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-yellow-300 hover:text-yellow-100 transition-colors font-medium text-xs md:text-sm px-3 md:px-4 py-2 whitespace-nowrap"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-yellow-500 text-black px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors text-xs md:text-sm whitespace-nowrap"
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* 두 번째 줄: 모바일/태블릿용 중간 텍스트 (lg 미만에서만 표시) */}
            <div className="lg:hidden text-center mt-3 pt-3 border-t border-yellow-600/30">
              <p className="text-xs md:text-sm font-medium text-yellow-300 leading-relaxed">
                온라인 택배로 간편하게, 정직한 검수로 믿음을 전합니다.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 이미지 슬라이더 */}
      <ImageSlider />

      {/* CTA 버튼 섹션 */}
      <div className="py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 매입 신청 및 마이페이지 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/apply"
                  className="bg-yellow-500 text-black px-8 py-3 md:px-10 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/50 text-center"
                >
                  매입 신청
                </Link>
                <Link
                  href={getDashboardLink()}
                  className="bg-black text-yellow-400 px-8 py-3 md:px-10 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-zinc-900 transition-all border-2 border-yellow-500 text-center"
                >
                  {user?.role === 'admin' ? '관리자페이지' : '마이페이지'}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-yellow-500 text-black px-8 py-3 md:px-10 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/50 text-center"
                >
                  매입 신청
                </Link>
                <Link
                  href="/login"
                  className="bg-black text-yellow-400 px-8 py-3 md:px-10 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-zinc-900 transition-all border-2 border-yellow-500 text-center"
                >
                  로그인
                </Link>
              </>
            )}
          </div>

          {/* 전화상담 및 카톡상담 */}
          <div className="flex flex-col gap-4 justify-center max-w-md mx-auto">
            <a
              href="tel:010-8325-9774"
              className="bg-green-600 text-white px-8 py-3 md:px-10 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>📞</span>
              <span>전화상담 010-8325-9774</span>
            </a>
            <KakaoChannelButton
              className="bg-yellow-400 text-black px-8 py-3 md:px-10 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-yellow-300 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <img src="/카톡로고.png" alt="카카오톡" className="h-5 md:h-6 w-auto" />
              <span>카톡상담</span>
            </KakaoChannelButton>
          </div>
        </div>
      </div>

      {/* 소개 문구 */}
      <div className="bg-gradient-to-b from-zinc-900 to-black py-8 border-b border-yellow-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-3">
            대한민국 최고가 매입 금니 전문 업체
          </h2>
          <p className="text-base md:text-lg text-yellow-200">
            15년 전통 • 정확한 감정 • 당일 입금 • 최고가 보장
          </p>
        </div>
      </div>

      {/* 금니 종류 안내 */}
      <div className="py-12 bg-black border-t border-yellow-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-3">
              금니 종류 안내
            </h2>
            <p className="text-base text-yellow-200">
              다양한 금니 종류를 확인하세요
            </p>
          </div>
          <div className="w-full">
            <img src="/금니종류2.png" alt="금니 종류 안내" className="w-full h-auto rounded-lg shadow-lg shadow-yellow-500/20 border border-yellow-600/30" />
          </div>
        </div>
      </div>

      {/* 시세, 신청현황, 후기 섹션 */}
      <div className="py-16 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
              실시간 매입 정보
            </h2>
            <p className="text-base text-yellow-200 max-w-2xl mx-auto">
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
      <section className="py-16 bg-black border-t border-yellow-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <p className="text-sm font-semibold tracking-wide uppercase mb-3 text-yellow-500">이용 방법</p>
            <p className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
              간편한 금니 매입 절차
            </p>
            <p className="text-base text-yellow-200 max-w-2xl mx-auto">
              회원가입부터 정산까지 한눈에 확인하세요
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { icon: '📝', title: '회원가입 · 로그인', description: '간단한 정보 입력으로 가입하고 로그인하세요' },
              { icon: '📦', title: '매입 신청 & 택배 발송', description: '사진과 기본 정보를 등록하고 안전하게 택배를 발송합니다' },
              { icon: '📥', title: '입고 확인', description: '택배 도착 시 즉시 입고 상태로 전환됩니다' },
              { icon: '🔍', title: '전문 감정', description: '전문 감정사가 순도·중량을 측정합니다' },
              { icon: '👍', title: '결과 확인', description: '감정 결과를 확인하고 승인하세요' },
              { icon: '💳', title: '정산 완료', description: '확인 즉시 정산이 진행되고 당일 입금됩니다' },
            ].map((step, index) => (
              <div key={step.title} className="bg-zinc-900 border border-yellow-600/30 rounded-xl p-5 flex items-start space-x-3 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 transition-all">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold text-sm mb-2">
                    {index + 1}
                  </div>
                  <div className="text-2xl" aria-hidden>
                    {step.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-yellow-400 mb-1.5">{step.title}</h3>
                  <p className="text-sm text-yellow-200 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <div className="py-16 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <p className="text-sm font-semibold tracking-wide uppercase mb-3 text-yellow-500">특징</p>
            <p className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
              왜 착한금니를 선택해야 할까요?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center bg-black rounded-xl p-8 border border-yellow-600/30 hover:shadow-lg hover:shadow-yellow-500/20 hover:border-yellow-500 transition-all">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-bold text-yellow-400 mb-3">최고가 매입</h3>
              <p className="text-sm text-yellow-200 leading-relaxed">
                실시간 금 시세를 반영한 최고가 매입
              </p>
            </div>

            <div className="text-center bg-black rounded-xl p-8 border border-yellow-600/30 hover:shadow-lg hover:shadow-yellow-500/20 hover:border-yellow-500 transition-all">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-yellow-400 mb-3">정확한 감정</h3>
              <p className="text-sm text-yellow-200 leading-relaxed">
                전문 감정사의 정밀한 순도와 중량 측정
              </p>
            </div>

            <div className="text-center bg-black rounded-xl p-8 border border-yellow-600/30 hover:shadow-lg hover:shadow-yellow-500/20 hover:border-yellow-500 transition-all">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-bold text-yellow-400 mb-3">신속한 정산</h3>
              <p className="text-sm text-yellow-200 leading-relaxed">
                감정 완료 후 즉시 정산 및 당일 입금
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-yellow-600/30">
        <div className="text-yellow-400 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* 회사 정보 */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <img src="/로고3.png" alt="착한금니 로고" className="h-16 w-auto" />
                  <h3 className="text-lg font-bold text-yellow-400">착한금니</h3>
                </div>
                <div className="space-y-2 text-sm text-yellow-200">
                  <p><strong className="text-yellow-300">사업자등록번호:</strong> 101-28-66901</p>
                  <p><strong className="text-yellow-300">통신판매업:</strong> 제2025-울산남구-0646호</p>
                  <p><strong className="text-yellow-300">대표:</strong> 진병관</p>
                  <p><strong className="text-yellow-300">주소:</strong> 울산광역시 남구 남중로108번길 36, 2층 202호</p>
                </div>
              </div>

              {/* 고객센터 */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-4">고객센터</h3>
                <div className="space-y-2 text-sm text-yellow-200">
                  <p><strong className="text-yellow-300">전화:</strong> 010-8325-9774</p>
                  <p><strong className="text-yellow-300">이메일:</strong> support@geumnikkaebi.com</p>
                  <p><strong className="text-yellow-300">운영시간:</strong></p>
                  <p>평일: 09:00 - 18:00</p>
                  <p>토요일: 09:00 - 15:00</p>
                  <p className="text-yellow-300/70">일요일 및 공휴일 휴무</p>
                </div>
              </div>

              {/* 매입 안내 */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-4">매입 안내</h3>
                <div className="space-y-2 text-sm text-yellow-200">
                  <p><strong className="text-yellow-300">택배 발송 주소:</strong></p>
                  <p>울산광역시 남구 남중로108번길 36, 2층 202호</p>
                  <p>착한금니 감정팀 (010-8325-9774)</p>
                  <p className="mt-4"><strong className="text-yellow-300">입금 계좌:</strong></p>
                  <p>KB국민은행 674701-04-558280</p>
                  <p>예금주: 진병관(착한금니)</p>
                </div>
              </div>
            </div>

            {/* 하단 저작권 */}
            <div className="border-t border-yellow-600/30 pt-6 text-center">
              <p className="text-sm text-yellow-300/70">&copy; 2024 착한금니(주). All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
