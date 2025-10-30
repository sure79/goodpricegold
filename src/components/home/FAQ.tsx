'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const FAQ_DATA: FAQItem[] = [
  {
    question: '금니 택배 발송, 안전한가요?',
    answer: '네, 안전합니다. 등기우편이나 택배 사용 시 배송 추적이 가능하며, 만약의 분실에 대비하여 보험 처리가 가능합니다. 또한 신청 시 운송장 번호를 등록하시면 실시간으로 배송 현황을 확인할 수 있습니다. 15년간 단 한 건의 분실 사고도 없었습니다.'
  },
  {
    question: '감정 결과가 마음에 안 들면 어떤가요?',
    answer: '감정 결과에 만족하지 못하시면 전액 무료로 반환해드립니다. 반송 택배비까지 저희가 부담하며, 고객님께서 부담하실 비용은 전혀 없습니다. 감정 결과는 사진과 함께 상세히 안내드리므로, 충분히 검토하신 후 결정하실 수 있습니다.'
  },
  {
    question: '입금은 언제 되나요?',
    answer: '고객님께서 감정 결과를 승인하시면 즉시 정산이 진행되며, 평일 오후 3시 이전 승인 건은 당일 입금, 오후 3시 이후 승인 건은 익일 오전 중 입금됩니다. 주말/공휴일 승인 건은 다음 영업일에 입금 처리됩니다. 입금 즉시 문자로 알려드립니다.'
  },
  {
    question: '다른 업체보다 정말 비싸게 사나요?',
    answer: '네, 저희는 실시간 국제 금 시세를 반영하여 업계 최고가로 매입합니다. 중간 유통 마진을 최소화하고, 대량 거래를 통해 더 높은 가격을 제시할 수 있습니다. 타사 견적과 비교해보시고 더 낮은 가격이면 그 이상으로 매입해드립니다. (가격 비교 보증제)'
  },
  {
    question: '금니 종류를 모르는데 신청 가능한가요?',
    answer: '물론입니다! 금니 종류를 정확히 모르셔도 전혀 문제없습니다. 전문 감정사가 정밀 장비로 순도와 종류를 정확하게 감정해드립니다. 신청서에는 "크라운", "인레이", "브릿지" 등 대략적인 형태만 선택하시거나 "모름"으로 선택하시면 됩니다.'
  },
  {
    question: '무게를 어떻게 재나요?',
    answer: '무게를 모르셔도 됩니다! 신청서에 무게는 선택사항이며, 저희가 정밀 전자저울로 0.01g 단위까지 정확하게 측정해드립니다. 측정 결과는 사진과 함께 전송해드리므로 투명하게 확인하실 수 있습니다. 일반적으로 크라운 1개는 1-3g, 인레이는 0.5-1.5g 정도입니다.'
  },
  {
    question: '수수료가 있나요?',
    answer: '아니요, 일체의 수수료가 없습니다! 감정비, 택배비(반송 시), 수수료 등 어떠한 추가 비용도 받지 않습니다. 감정된 최종 금액을 100% 그대로 입금해드립니다. 숨은 비용이 전혀 없는 투명한 거래를 약속드립니다.'
  },
  {
    question: '택배 분실되면 어떻게 하나요?',
    answer: '택배 분실 시 운송사 보험으로 보상받으실 수 있습니다. 등기우편이나 보험 가입 택배를 이용하시고, 운송장 번호를 저희에게 알려주시면 더욱 안전합니다. 만약의 경우 저희가 보상 절차를 적극 도와드리며, 15년간 분실 사고가 없었습니다.'
  },
  {
    question: '환불/반환 정책은 어떻게 되나요?',
    answer: '감정 결과 통보 후 24시간 이내에 승인/거부를 선택하실 수 있습니다. 거부하시면 택배비 저희 부담으로 무료 반환해드립니다. 감정 전이라도 언제든 신청 취소 가능하며, 이 경우에도 반송비는 저희가 부담합니다. 고객님의 부담은 0원입니다.'
  },
  {
    question: '신분증이 필요한가요?',
    answer: '금니 매입 시 신분증은 필요하지 않습니다. 회원가입 시 이름과 전화번호만 있으면 되며, 정산금을 받으실 계좌 정보만 정확히 입력해주시면 됩니다. 개인정보는 철저히 보호되며, 매입 목적 외에는 절대 사용하지 않습니다.'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="py-16 bg-zinc-900 relative" style={{ zIndex: 10 }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 제목 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-yellow-500 text-black px-6 py-3 rounded-full text-sm font-bold mb-4">
            <span className="mr-2">❓</span>
            자주 묻는 질문
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
            FAQ
          </h2>
          <p className="text-base text-yellow-200 max-w-2xl mx-auto">
            고객님들이 자주 궁금해하시는 내용을 모았습니다
          </p>
        </div>

        {/* FAQ 아코디언 */}
        <div className="space-y-4">
          {FAQ_DATA.map((faq, index) => (
            <div
              key={index}
              className="bg-black rounded-xl border border-yellow-600/30 overflow-hidden hover:border-yellow-500 transition-all"
            >
              {/* 질문 */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    Q{index + 1}
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-yellow-400">
                    {faq.question}
                  </h3>
                </div>
                <div
                  className={`text-yellow-400 text-2xl transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </div>
              </button>

              {/* 답변 */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 pt-2 bg-zinc-900/50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      A
                    </div>
                    <p className="text-yellow-200 text-sm md:text-base leading-relaxed flex-1">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 추가 문의 안내 */}
        <div className="mt-12 bg-gradient-to-br from-black to-zinc-900 rounded-xl p-8 border-2 border-yellow-600/30 text-center">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">
            추가 문의사항이 있으신가요?
          </h3>
          <p className="text-yellow-200 mb-6 text-sm md:text-base">
            언제든지 편하게 연락주세요. 친절하게 상담해드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:010-8325-9774"
              className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <span className="mr-2">📞</span>
              전화 상담: 010-8325-9774
            </a>
            <a
              href="http://pf.kakao.com/_xegMuG/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              <span className="mr-2">💬</span>
              카카오톡 상담
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
