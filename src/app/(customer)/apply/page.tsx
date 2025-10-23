'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createPurchaseRequestWithPrice } from '@/lib/supabase/database'
import { uploadMultipleImages } from '@/lib/supabase/storage'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'

import { GoldType, GOLD_TYPES } from '@/types'

interface ApplicationFormData {
  customer_name: string
  phone: string
  bank_name: string
  account_number: string
  item_description: string
  item_type: GoldType
  quantity: number
  estimated_weight: number | null
}

export default function ApplyPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  // Cleanup: URL 객체들 해제
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 모든 URL 객체 해제
      previewUrls.forEach(url => {
        URL.revokeObjectURL(url)
      })
    }
  }, [previewUrls])

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [requestNumber, setRequestNumber] = useState('')
  const [companyAddress, setCompanyAddress] = useState('울산광역시 남구 삼산로 280, 착한금니 빌딩 5층')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    defaultValues: {
      customer_name: user?.name || '',
      phone: user?.phone || '',
      bank_name: '',
      account_number: '',
    },
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + photos.length > 5) {
      alert('최대 5장까지 업로드할 수 있습니다.')
      return
    }

    // 큰 파일도 모두 저장 (용량 제한 제거)
    const newFiles = [...photos, ...files]
    setPhotos(newFiles)

    // 미리보기 URL 생성
    const newUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newUrls])
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('복사되었습니다!')
    } catch (err) {
      // 복사 실패 시 fallback
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('복사되었습니다!')
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)

    // 기존 URL 해제
    URL.revokeObjectURL(previewUrls[index])

    setPhotos(newPhotos)
    setPreviewUrls(newUrls)
  }

  const onSubmit = async (data: ApplicationFormData) => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    if (photos.length === 0) {
      alert('금니 사진을 최소 1장 이상 업로드해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      // 사진 업로드
      let imageUrls: string[] = []
      if (photos.length > 0) {
        try {
          imageUrls = await uploadMultipleImages(photos)
          console.log('사진 업로드 완료:', imageUrls)
        } catch (uploadError) {
          console.error('사진 업로드 실패:', uploadError)
          alert('사진 업로드에 실패했습니다. 다시 시도해주세요.')
          return
        }
      }

      // 실제 Supabase에 신청 생성
      const requestData = {
        user_id: user.id,
        customer_name: data.customer_name,
        phone: data.phone,
        bank_name: data.bank_name,
        account_number: data.account_number,
        email: user.email || '',
        address: '', // 기본값 설정
        status: 'pending' as const,
        customer_images: imageUrls, // 업로드된 사진 URL들 추가
        items: [{
          type: '18k' as GoldType, // 기본값으로 18k 설정
          quantity: data.quantity || 1,
          weight: data.estimated_weight || 0,
          description: data.item_description
        }]
      }

      console.log('Submitting request data:', requestData)
      const newRequest = await createPurchaseRequestWithPrice(requestData)

      setRequestNumber(newRequest.request_number)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('신청 실패:', error)

      let errorMessage = '신청에 실패했습니다. 다시 시도해주세요.'

      if (error instanceof Error) {
        console.error('Error details:', error.message)
        if (error.message.includes('permission')) {
          errorMessage = '권한이 없습니다. 로그인을 확인해주세요.'
        } else if (error.message.includes('duplicate')) {
          errorMessage = '이미 처리 중인 신청이 있습니다.'
        } else if (error.message.includes('validation')) {
          errorMessage = '입력 정보를 확인해주세요.'
        } else {
          errorMessage = `오류: ${error.message}`
        }
      }

      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">🪙 금니 매입 신청</h1>
        <p className="mt-1 text-sm text-gray-600">
          금니 사진과 기본 정보를 입력하면 전문가가 감정 후 연락드립니다.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">기본 정보</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 *
                </label>
                <input
                  {...register('customer_name', { required: '이름을 입력해주세요' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.customer_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  휴대폰 번호 *
                </label>
                <input
                  {...register('phone', { required: '휴대폰 번호를 입력해주세요' })}
                  type="tel"
                  placeholder="010-1234-5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  은행명 *
                </label>
                <select
                  {...register('bank_name', { required: '은행을 선택해주세요' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">은행 선택</option>
                  <option value="국민은행">국민은행</option>
                  <option value="신한은행">신한은행</option>
                  <option value="우리은행">우리은행</option>
                  <option value="하나은행">하나은행</option>
                  <option value="농협은행">농협은행</option>
                  <option value="기업은행">기업은행</option>
                  <option value="카카오뱅크">카카오뱅크</option>
                  <option value="토스뱅크">토스뱅크</option>
                  <option value="새마을금고">새마을금고</option>
                  <option value="신협">신협</option>
                  <option value="우체국">우체국</option>
                  <option value="경남은행">경남은행</option>
                  <option value="광주은행">광주은행</option>
                  <option value="대구은행">대구은행</option>
                  <option value="부산은행">부산은행</option>
                  <option value="전북은행">전북은행</option>
                  <option value="제주은행">제주은행</option>
                  <option value="기타">기타</option>
                </select>
                {errors.bank_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.bank_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계좌번호 *
                </label>
                <input
                  {...register('account_number', {
                    required: '계좌번호를 입력해주세요',
                    pattern: {
                      value: /^[0-9-]+$/,
                      message: '올바른 계좌번호를 입력해주세요 (숫자와 하이픈만 가능)'
                    }
                  })}
                  type="text"
                  placeholder="123456-78-901234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.account_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.account_number.message}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500">
              정산금을 입금받을 계좌 정보를 정확히 입력해주세요
            </p>
          </div>

          {/* 금니 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">금니 정보</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  개수 *
                </label>
                <input
                  {...register('quantity', {
                    required: '개수를 입력해주세요',
                    min: { value: 1, message: '1개 이상 입력해주세요' }
                  })}
                  type="number"
                  defaultValue={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예상 무게 (g)
                </label>
                <input
                  {...register('estimated_weight', {
                    min: { value: 0.1, message: '0.1g 이상 입력해주세요' }
                  })}
                  type="number"
                  step="0.1"
                  placeholder="모르면 비워두세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.estimated_weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimated_weight.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">무게를 모르시면 비워두시고 신청해주세요</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  금니 설명 *
                </label>
                <textarea
                  {...register('item_description', { required: '금니 설명을 입력해주세요' })}
                  rows={3}
                  placeholder="반지, 목걸이, 귀걸이 등 금니의 종류와 특징을 간단히 설명해주세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.item_description && (
                  <p className="mt-1 text-sm text-red-600">{errors.item_description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* 사진 업로드 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">금니 사진 *</h3>
            <p className="text-sm text-gray-600">
              정확한 감정을 위해 다양한 각도에서 촬영한 사진을 업로드해주세요. (최대 5장)
            </p>

            <label htmlFor="photo-upload" className="block border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  📷
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium text-blue-600">사진 선택</span>
                  <span className="pl-1">하거나 드래그하여 업로드</span>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG 파일 (용량 제한 없음)</p>
              </div>
              <input
                id="photo-upload"
                name="photo-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="sr-only"
              />
            </label>

            {/* 사진 미리보기 */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`금니 사진 ${index + 1}`}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 안내사항 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-blue-400 mr-2">ℹ️</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">매입 절차 안내</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>신청 접수 후 24시간 내 연락드립니다</li>
                  <li>전문가 감정을 통해 정확한 시세를 제공합니다</li>
                  <li>감정 결과에 만족하시면 즉시 입금 처리됩니다</li>
                  <li>불만족시 무료로 반환해드립니다</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  신청 중...
                </div>
              ) : (
                '매입 신청하기'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 신청 완료 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">매입 신청이 완료되었습니다!</h3>
              <p className="text-sm text-gray-600">신청번호: <span className="font-mono font-semibold">{requestNumber}</span></p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                📦 금니 발송 안내
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-blue-700 font-medium mb-2">보내실 주소:</p>
                  <div className="bg-white border border-blue-300 rounded p-3">
                    <p className="font-mono text-sm text-gray-800">{companyAddress}</p>
                    <button
                      onClick={() => copyToClipboard(companyAddress)}
                      className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      📋 주소 복사
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-blue-700 font-medium mb-2">받는 분:</p>
                  <div className="bg-white border border-blue-300 rounded p-3">
                    <p className="font-mono text-sm text-gray-800">착한금니 감정팀</p>
                    <button
                      onClick={() => copyToClipboard('착한금니 감정팀')}
                      className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      📋 이름 복사
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-blue-700 font-medium mb-2">연락처:</p>
                  <div className="bg-white border border-blue-300 rounded p-3">
                    <p className="font-mono text-sm text-gray-800">010-1234-5678</p>
                    <button
                      onClick={() => copyToClipboard('010-1234-5678')}
                      className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      📋 번호 복사
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                  <p className="text-xs text-blue-800">
                    <strong>📝 주의사항:</strong><br/>
                    • 택배 발송 시 신청번호({requestNumber})를 반드시 기재해주세요<br/>
                    • 분실 방지를 위해 등기우편 또는 택배 이용을 권장합니다<br/>
                    • 발송 후 운송장 번호를 문자로 알려주시면 더욱 안전합니다
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => copyToClipboard(`${companyAddress}\n착한금니 감정팀\n010-1234-5678\n신청번호: ${requestNumber}`)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
              >
                📋 전체 정보 복사
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    router.push('/dashboard')
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  마이페이지로
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    router.push(`/tracking/${requestNumber}`)
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  신청 추적
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}