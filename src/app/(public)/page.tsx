'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore, initializeAuthOnce } from '@/stores/authStore'
import GoldPriceDisplay from '@/components/common/GoldPriceDisplay'
import ApplicationStatus from '@/components/common/ApplicationStatus'
import ReviewsDisplay from '@/components/common/ReviewsDisplay'
import ImageSlider from '@/components/common/ImageSlider'

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
    <div className="min-h-screen bg-black">
      {/* 상단 헤더 */}
      <header className="bg-black border-b border-yellow-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* 왼쪽: 로고 및 사이트명 */}
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img src="/로고3.png" alt="착한금니 로고" className="h-12 w-auto" />
              <span className="text-xl font-bold text-yellow-400">착한금니</span>
            </Link>

            {/* 오른쪽: 전화번호 및 버튼 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 text-yellow-400">
                <span className="text-xl">📞</span>
                <span className="font-semibold text-base">010-6622-9774</span>
              </div>

              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <>
                    <Link
                      href={getDashboardLink()}
                      className="bg-yellow-500 text-black px-5 py-2.5 rounded-lg font-medium hover:bg-yellow-400 transition-colors text-sm"
                    >
                      {user?.role === 'admin' ? '관리자페이지' : '마이페이지'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-yellow-300 hover:text-yellow-100 transition-colors font-medium text-sm"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-yellow-300 hover:text-yellow-100 transition-colors font-medium text-sm"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-yellow-500 text-black px-5 py-2.5 rounded-lg font-medium hover:bg-yellow-400 transition-colors text-sm"
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

      {/* 메인 이미지 슬라이더 */}
      <ImageSlider />

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

      {/* CTA 버튼 섹션 */}
      <div className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <>
                <Link
                  href="/apply"
                  className="bg-yellow-500 text-black px-10 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/50"
                >
                  지금 바로 매입 신청
                </Link>
                <Link
                  href={getDashboardLink()}
                  className="bg-black text-yellow-400 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-zinc-900 transition-all border-2 border-yellow-500"
                >
                  {user?.role === 'admin' ? '관리자페이지' : '마이페이지'}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-yellow-500 text-black px-10 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/50"
                >
                  지금 바로 매입 신청
                </Link>
                <Link
                  href="/login"
                  className="bg-black text-yellow-400 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-zinc-900 transition-all border-2 border-yellow-500"
                >
                  로그인
                </Link>
              </>
            )}
          </div>
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
            <img src="/금니종류.png" alt="금니 종류 안내" className="w-full h-auto rounded-lg shadow-lg shadow-yellow-500/20 border border-yellow-600/30" />
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
                  <p><strong className="text-yellow-300">전화:</strong> 010-6622-9774</p>
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
                  <p>착한금니 감정팀 (010-6622-9774)</p>
                  <p className="mt-4"><strong className="text-yellow-300">입금 계좌:</strong></p>
                  <p>국민은행 123456-78-901234</p>
                  <p>예금주: (주)착한금니</p>
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
