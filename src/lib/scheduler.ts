// 매일 금니 시세 자동 저장 스케줄러

let dailySyncInterval: NodeJS.Timeout | null = null

export function startDailyGoldPriceSync() {
  // 이미 실행 중이면 중지
  if (dailySyncInterval) {
    clearInterval(dailySyncInterval)
  }

  console.log('🚀 매일 금니 시세 자동 동기화 스케줄러 시작')

  // 매일 오전 9시에 실행하도록 설정
  const scheduleDaily = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0) // 오전 9시로 설정

    const msUntilTomorrow = tomorrow.getTime() - now.getTime()

    // 내일 오전 9시까지의 시간 계산
    setTimeout(() => {
      // 첫 실행
      executeDailySync()

      // 그 후 24시간마다 반복
      dailySyncInterval = setInterval(() => {
        executeDailySync()
      }, 24 * 60 * 60 * 1000) // 24시간

    }, msUntilTomorrow)
  }

  // 즉시 한 번 실행 (서버 시작 시)
  executeDailySync()

  // 스케줄 시작
  scheduleDaily()
}

export function stopDailyGoldPriceSync() {
  if (dailySyncInterval) {
    clearInterval(dailySyncInterval)
    dailySyncInterval = null
    console.log('⏹️ 매일 금니 시세 자동 동기화 스케줄러 중지')
  }
}

async function executeDailySync() {
  try {
    console.log('🔄 매일 금니 시세 자동 동기화 실행...')

    // 내부 API 호출
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/gold-price/daily-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ 매일 금니 시세 자동 동기화 성공:', result)
    } else {
      console.error('❌ 매일 금니 시세 자동 동기화 API 호출 실패:', response.status)
    }

  } catch (error) {
    console.error('❌ 매일 금니 시세 자동 동기화 실행 실패:', error)
  }
}

// 수동 실행 함수 (관리자가 필요 시 호출)
export async function manualGoldPriceSync() {
  return executeDailySync()
}