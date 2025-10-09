'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { signUp } from '@/lib/supabase/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface SignupFormData {
  name: string
  phone: string
  email: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
  agreePrivacy: boolean
  agreeMarketing: boolean
}

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>()

  const password = watch('password')

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      // 필수 약관 동의 체크
      if (!data.agreeTerms) {
        setError('서비스 이용약관에 동의해주세요.')
        setIsLoading(false)
        return
      }

      if (!data.agreePrivacy) {
        setError('개인정보 처리방침에 동의해주세요.')
        setIsLoading(false)
        return
      }

      const { name, phone, email, password, agreeMarketing } = data

      // Supabase 인증 사용
      const { user, success, session } = await signUp(email, password, {
        name,
        phone,
        email,
        role: 'customer' as const,
        total_transactions: 0,
        total_amount: 0,
      })

      if (!success) {
        throw new Error('회원가입에 실패했습니다.')
      }

      // 회원가입 성공 - 즉시 로그인으로 대시보드 이동
      setSuccess('회원가입이 완료되었습니다! 대시보드로 이동합니다.')

      setTimeout(() => {
        // 사용자 역할에 따라 리다이렉트
        if (user.email === 'admin@admin.com') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '회원가입에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 회원가입 혜택 배너 */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-center shadow-lg">
          <div className="text-white">
            <div className="text-3xl font-bold mb-2">🎁 신규 가입 혜택</div>
            <div className="text-2xl font-extrabold mb-1">만원 추가 혜택!</div>
            <div className="text-sm opacity-90">지금 가입하고 첫 거래 시 만원 추가 적용</div>
          </div>
        </div>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            착한금니 회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-900">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-medium text-amber-600 hover:text-amber-500">
              로그인
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                이름
              </label>
              <input
                {...register('name', { required: '이름을 입력해주세요' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="이름을 입력하세요"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                휴대폰 번호
              </label>
              <input
                {...register('phone', {
                  required: '휴대폰 번호를 입력해주세요',
                  pattern: {
                    value: /^010-?\d{4}-?\d{4}$/,
                    message: '올바른 휴대폰 번호를 입력해주세요 (010-0000-0000)',
                  },
                })}
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="010-0000-0000"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                이메일
              </label>
              <input
                {...register('email', {
                  required: '이메일을 입력해주세요',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '올바른 이메일 형식이 아닙니다',
                  },
                })}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="이메일을 입력하세요"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                비밀번호
              </label>
              <input
                {...register('password', {
                  required: '비밀번호를 입력해주세요',
                  minLength: {
                    value: 6,
                    message: '비밀번호는 최소 6자 이상이어야 합니다',
                  },
                })}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="비밀번호를 입력하세요"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                비밀번호 확인
              </label>
              <input
                {...register('confirmPassword', {
                  required: '비밀번호 확인을 입력해주세요',
                  validate: (value) =>
                    value === password || '비밀번호가 일치하지 않습니다',
                })}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="비밀번호를 다시 입력하세요"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* 개인정보 동의 */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">약관 동의</h3>

              <div className="space-y-3">
                {/* 서비스 이용약관 */}
                <div className="flex items-start">
                  <input
                    {...register('agreeTerms', { required: '서비스 이용약관에 동의해주세요' })}
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <label className="text-sm text-gray-700">
                      <span className="text-red-500">[필수]</span> 서비스 이용약관에 동의합니다
                    </label>
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                      <strong>제1조 (목적)</strong><br/>
                      본 약관은 착한금니(이하 &ldquo;회사&rdquo;)가 제공하는 금니 매입 서비스(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.<br/><br/>

                      <strong>제2조 (정의)</strong><br/>
                      1. &ldquo;서비스&rdquo;란 회사가 제공하는 온라인 금니 매입 중개 서비스를 의미합니다.<br/>
                      2. &ldquo;이용자&rdquo;란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원을 말합니다.<br/><br/>

                      <strong>제3조 (약관의 효력 및 변경)</strong><br/>
                      1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력이 발생합니다.<br/>
                      2. 회사는 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있습니다.
                    </div>
                  </div>
                </div>
                {errors.agreeTerms && (
                  <p className="text-sm text-red-600 ml-7">{errors.agreeTerms.message}</p>
                )}

                {/* 개인정보 처리방침 */}
                <div className="flex items-start">
                  <input
                    {...register('agreePrivacy', { required: '개인정보 처리방침에 동의해주세요' })}
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <label className="text-sm text-gray-700">
                      <span className="text-red-500">[필수]</span> 개인정보 처리방침에 동의합니다
                    </label>
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                      <strong>1. 개인정보의 처리목적</strong><br/>
                      회사는 다음의 목적을 위하여 개인정보를 처리합니다:<br/>
                      - 서비스 제공 및 계약의 이행<br/>
                      - 회원 관리 및 본인 확인<br/>
                      - 금니 매입 서비스 제공<br/>
                      - 고객 문의 처리 및 AS 서비스<br/><br/>

                      <strong>2. 처리하는 개인정보의 항목</strong><br/>
                      - 필수항목: 성명, 휴대폰번호, 이메일주소<br/>
                      - 선택항목: 주소 (택배 발송시)<br/><br/>

                      <strong>3. 개인정보의 처리 및 보유기간</strong><br/>
                      회원탈퇴 시까지 또는 서비스 종료 시까지 보유합니다.<br/>
                      단, 관련 법령에 의해 보존이 필요한 경우 해당 기간까지 보유합니다.
                    </div>
                  </div>
                </div>
                {errors.agreePrivacy && (
                  <p className="text-sm text-red-600 ml-7">{errors.agreePrivacy.message}</p>
                )}

                {/* 마케팅 정보 수신 동의 */}
                <div className="flex items-start">
                  <input
                    {...register('agreeMarketing')}
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <label className="text-sm text-gray-700">
                      <span className="text-blue-500">[선택]</span> 마케팅 정보 수신에 동의합니다
                    </label>
                    <div className="mt-1 text-xs text-gray-500">
                      금니 시세 변동 알림, 이벤트 정보, 프로모션 혜택 등을 문자/이메일로 받아보실 수 있습니다. (선택사항)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                '회원가입'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
