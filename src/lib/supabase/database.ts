import { supabase } from './client'
import type { PurchaseRequest, Settlement, Review, GoldPrice, User, StatusHistory } from '@/types'

// 안전한 데이터베이스 쿼리를 위한 유틸리티 함수
async function safeQuery<T>(queryFn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: Error = new Error('Unknown error')

  for (let i = 0; i < maxRetries; i++) {
    try {
      // timeout 설정 (10초)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      })

      const result = await Promise.race([queryFn(), timeoutPromise])
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Query attempt ${i + 1} failed:`, error)

      // 재시도할 수 없는 에러들
      if ((error as { code?: string }).code === 'PGRST116' || lastError.message?.includes('unauthorized')) {
        throw error
      }

      // 마지막 시도가 아니면 잠시 대기
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  throw lastError
}

export async function createPurchaseRequest(request: Omit<PurchaseRequest, 'id' | 'created_at' | 'updated_at'>) {
  console.log('Creating purchase request with data:', request)

  return await safeQuery(async () => {
    // 실제 테이블 구조에 맞춰 필수 필드들 포함
    const minimalRequest = {
      user_id: request.user_id,
      request_number: request.request_number,
      customer_name: request.customer_name,
      phone: request.phone,
      bank_name: request.bank_name,
      account_number: request.account_number,
      email: request.email || '',
      status: request.status || 'pending',
      estimated_price: request.estimated_price || 0,
      item_type: request.items && request.items.length > 0 ? request.items[0].type : '18k',
      customer_images: request.customer_images || []
    }

    console.log('Sending minimal request:', minimalRequest)

    const { data, error } = await supabase
      .from('purchase_requests')
      .insert(minimalRequest)
      .select()
      .single()

    if (error) {
      console.error('Purchase request creation error:', error)
      console.error('Request data:', minimalRequest)

      // If table doesn't exist or has schema issues, create fallback response
      if (error.code === 'PGRST205' || error.code === 'PGRST204' || error.message.includes('table') || error.message.includes('column')) {
        console.error('Database error - returning fallback response:', error.message)
        const fallbackRequest = {
          id: 'temp-' + Date.now(),
          ...request,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        return fallbackRequest as PurchaseRequest
      }

      throw error
    }

    console.log('Purchase request created successfully:', data)
    return { ...data, items: request.items } as PurchaseRequest
  })
}

export async function getPurchaseRequests(userId?: string) {
  return await safeQuery(async () => {
    let query = supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('table')) {
        console.warn('Purchase requests table not found, returning empty array')
        return []
      }
      throw error
    }

    // items 필드가 없는 경우 기본값 설정
    const requestsWithItems = data.map(request => ({
      ...request,
      items: request.items || [{
        type: request.item_type || '18k',
        purity: request.item_type || '18k',
        quantity: 1,
        weight: request.final_weight || 0
      }]
    }))

    return requestsWithItems as PurchaseRequest[]
  })
}

export async function getPurchaseRequest(id: string) {
  const { data, error } = await supabase
    .from('purchase_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as PurchaseRequest
}

export async function getStatusHistory(requestId: string) {
  try {
    const { data, error } = await supabase
      .from('status_history')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('table')) {
        console.warn('Status history table not found, returning empty array')
        return []
      }
      throw error
    }

    return (data || []) as StatusHistory[]
  } catch (error) {
    console.error('Get status history failed:', error)
    return []
  }
}

export async function updatePurchaseRequestStatus(
  id: string,
  status: PurchaseRequest['status'],
  adminId?: string,
  notes?: string
) {
  try {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('상태 업데이트 에러:', error)
      throw error
    }

    // status_history 테이블이 존재하는 경우에만 기록
    if (adminId) {
      try {
        await supabase
          .from('status_history')
          .insert({
            request_id: id,
            status,
            changed_by: adminId,
            notes
          })
      } catch (historyError) {
        console.warn('상태 히스토리 저장 실패:', historyError)
      }
    }


    return data as PurchaseRequest
  } catch (error) {
    console.error('Purchase request status update failed:', error)
    throw error
  }
}

export async function updateEvaluationResult(
  id: string,
  evaluationData: {
    final_weight?: number;
    final_price?: number;
    evaluation_notes?: string;
    evaluation_images?: string[];
  },
  adminId?: string
) {
  try {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update({
        ...evaluationData,
        status: 'evaluated',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('감정 결과 업데이트 에러:', error)
      throw error
    }

    // 상태 히스토리 기록
    if (adminId) {
      try {
        await supabase
          .from('status_history')
          .insert({
            request_id: id,
            status: 'evaluated',
            changed_by: adminId,
            notes: '감정 완료'
          })
      } catch (historyError) {
        console.warn('상태 히스토리 저장 실패:', historyError)
      }
    }

    return data as PurchaseRequest
  } catch (error) {
    console.error('Evaluation result update failed:', error)
    throw error
  }
}

export async function getSettlements(userId?: string) {
  try {
    let query = supabase
      .from('settlements')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('table')) {
        console.warn('Settlements table not found, returning empty array')
        return []
      }
      throw error
    }
    return data as Settlement[]
  } catch (error) {
    console.error('Get settlements failed:', error)
    return []
  }
}

export async function createSettlement(settlement: Omit<Settlement, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('settlements')
    .insert(settlement)
    .select()
    .single()

  if (error) throw error
  return data as Settlement
}

export async function getReviews(isPublic?: boolean) {
  try {
    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('table')) {
        console.warn('Reviews table not found, returning empty array')
        return []
      }
      throw error
    }
    return data as Review[]
  } catch (error) {
    console.error('Get reviews failed:', error)
    return []
  }
}

export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()

    if (error) {
      console.error('Create review error:', error)
      throw new Error(`후기 등록에 실패했습니다: ${error.message}`)
    }
    return data as Review
  } catch (error) {
    console.error('Create review failed:', error)
    throw error
  }
}

export async function updateReview(id: string, updates: Partial<Omit<Review, 'id' | 'created_at'>>) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update review error:', error)
      throw new Error(`후기 수정에 실패했습니다: ${error.message}`)
    }
    return data as Review
  } catch (error) {
    console.error('Update review failed:', error)
    throw error
  }
}

export async function deleteReview(id: string) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete review error:', error)
      throw new Error(`후기 삭제에 실패했습니다: ${error.message}`)
    }
    return { success: true }
  } catch (error) {
    console.error('Delete review failed:', error)
    throw error
  }
}

export async function getCurrentGoldPrice() {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('gold_prices')
      .select('*')
      .eq('date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Gold prices table not found, using default values:', error)
    }

    // 데이터가 없으면 기본값 반환
    if (!data) {
      return {
        id: 'default',
        date: today,
        price_porcelain: 169890,
        price_inlay_s: 165000,
        price_inlay: 161670,
        price_crown_pt: 144310,
        price_crown_st: 112350,
        price_crown_at: 91340,
        updated_by: 'system',
        updated_at: new Date().toISOString()
      } as GoldPrice
    }

    return data as GoldPrice
  } catch (error) {
    console.warn('Failed to fetch gold price, using defaults:', error)
    // 에러 발생시에도 기본값 반환
    const today = new Date().toISOString().split('T')[0]
    return {
      id: 'default',
      date: today,
      price_porcelain: 169890,
      price_inlay_s: 165000,
      price_inlay: 161670,
      price_crown_pt: 144310,
      price_crown_st: 112350,
      price_crown_at: 91340,
      updated_by: 'system',
      updated_at: new Date().toISOString()
    } as GoldPrice
  }
}

export async function updateGoldPrice(price: Omit<GoldPrice, 'id'>) {
  const priceData = {
    date: price.date,
    price_porcelain: price.price_porcelain,
    price_inlay_s: price.price_inlay_s,
    price_inlay: price.price_inlay,
    price_crown_pt: price.price_crown_pt,
    price_crown_st: price.price_crown_st,
    price_crown_at: price.price_crown_at,
    source: 'manual',
    updated_by: price.updated_by || 'admin',
    updated_at: price.updated_at || new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('gold_prices')
    .upsert(priceData, { onConflict: 'date' })
    .select()
    .single()

  if (error) throw error

  return data as GoldPrice
}

// 매입 신청 통계
export async function getPurchaseRequestStats() {
  const today = new Date().toISOString().split('T')[0]
  const thisMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0')

  try {
    // 오늘 신규 신청
    const { data: todayRequests } = await supabase
      .from('purchase_requests')
      .select('id')
      .gte('created_at', today + 'T00:00:00Z')
      .lt('created_at', today + 'T23:59:59Z')

    // 처리 대기 건수
    const { data: pendingRequests } = await supabase
      .from('purchase_requests')
      .select('id')
      .in('status', ['received', 'evaluating', 'evaluated', 'approved'])

    // 이번 달 활성 사용자
    const { data: monthlyUsers } = await supabase
      .from('purchase_requests')
      .select('user_id')
      .gte('created_at', thisMonth + '-01T00:00:00Z')

    // 이번 달 매입액 (정산 완료된 것만)
    const { data: monthlyRevenue } = await supabase
      .from('settlements')
      .select('net_amount')
      .eq('payment_status', 'completed')
      .gte('created_at', thisMonth + '-01T00:00:00Z')

    const todayCount = todayRequests?.length || 0
    const pendingCount = pendingRequests?.length || 0
    const activeUsers = new Set(monthlyUsers?.map(r => r.user_id)).size
    const totalRevenue = monthlyRevenue?.reduce((sum, s) => sum + (s.net_amount || 0), 0) || 0

    return {
      todayRequests: todayCount,
      pendingRequests: pendingCount,
      monthlyRevenue: totalRevenue,
      activeUsers,
      avgProcessingTime: 3.2, // 실제 계산 필요
      satisfactionRate: 95.8 // 실제 계산 필요
    }
  } catch (error) {
    console.error('통계 조회 실패:', error)
    return {
      todayRequests: 0,
      pendingRequests: 0,
      monthlyRevenue: 0,
      activeUsers: 0,
      avgProcessingTime: 0,
      satisfactionRate: 0
    }
  }
}

// 신청번호 자동 생성
export async function generateRequestNumber() {
  const today = new Date()
  const dateString = today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0')

  // 오늘 날짜의 마지막 신청번호 조회
  const { data } = await supabase
    .from('purchase_requests')
    .select('request_number')
    .like('request_number', `${dateString}%`)
    .order('request_number', { ascending: false })
    .limit(1)

  let sequence = 1
  if (data && data.length > 0) {
    const lastNumber = data[0].request_number
    const lastSequence = parseInt(lastNumber.slice(-3))
    sequence = lastSequence + 1
  }

  return `${dateString}${String(sequence).padStart(3, '0')}`
}


// 매입 신청과 함께 실시간 시세 계산
export async function createPurchaseRequestWithPrice(
  requestData: Omit<PurchaseRequest, 'id' | 'created_at' | 'updated_at' | 'request_number' | 'gold_price_snapshot' | 'estimated_price'>
) {
  // 현재 금니 시세 가져오기
  const currentPrice = await getCurrentGoldPrice()
  if (!currentPrice) {
    throw new Error('현재 금니 시세를 가져올 수 없습니다.')
  }

  // 예상 매입가 계산
  let estimatedPrice = 0
  for (const item of requestData.items) {
    const priceKey = `price_${item.type}` as keyof typeof currentPrice
    const itemPrice = (currentPrice[priceKey] as number) || 0

    // 개수당 가격 계산 (가격은 이미 개당 가격임)
    estimatedPrice += itemPrice * item.quantity * 0.85 // 85% 적용 (수수료 고려)
  }

  // 신청번호 생성
  const requestNumber = await generateRequestNumber()

  // 신청 데이터 생성 - 기본 필드만 포함
  const request = {
    ...requestData,
    request_number: requestNumber,
    estimated_price: Math.floor(estimatedPrice),
    status: requestData.status || 'pending' as const
  }

  return createPurchaseRequest(request)
}

// 회원 관리
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as User[]
}

// 별칭
export const getUsers = getAllUsers

export async function deleteUser(userId: string) {
  try {
    // 1. 사용자와 관련된 데이터 삭제 (관련 테이블의 데이터도 함께 삭제)
    // 먼저 profiles 테이블에서 삭제
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile deletion error:', profileError)
      throw new Error(`프로필 삭제 실패: ${profileError.message}`)
    }

    // 2. Supabase Auth에서 사용자 삭제
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth deletion error:', authError)
      throw new Error(`인증 사용자 삭제 실패: ${authError.message}`)
    }

    console.log('사용자 삭제 완료:', userId)
    return { success: true }
  } catch (error) {
    console.error('User deletion failed:', error)
    throw error
  }
}

export async function updateUserRole(userId: string, role: 'customer' | 'admin') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as User
}

// 금니 시세 히스토리
export async function getGoldPriceHistory(days: number = 30) {
  try {
    const { data, error } = await supabase
      .from('gold_prices')
      .select('*')
      .order('date', { ascending: false })
      .limit(days)

    if (error) {
      console.warn('Gold price history fetch failed:', error)
      return []
    }

    // 데이터를 코드에서 사용하는 형태로 변환
    const historyData = data?.map(item => ({
      ...item,
      base_price_18k: item.price_18k,
      base_price_14k: item.price_14k,
      updated_by: 'admin'
    })) || []

    return historyData as GoldPrice[]
  } catch (error) {
    console.error('Get gold price history failed:', error)
    return []
  }
}

// 매일 자동으로 이전 시세를 복사하여 오늘 시세 생성
export async function ensureTodayGoldPrice() {
  const today = new Date().toISOString().split('T')[0]

  // 오늘 시세가 이미 있는지 확인
  const { data: existingPrice } = await supabase
    .from('gold_prices')
    .select('*')
    .eq('date', today)
    .single()

  if (existingPrice) {
    return existingPrice as GoldPrice
  }

  // 가장 최근 시세 가져오기
  const { data: latestPrice } = await supabase
    .from('gold_prices')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)

  if (latestPrice && latestPrice.length > 0) {
    // 이전 시세를 오늘 날짜로 복사
    const newPrice = {
      date: today,
      price_porcelain: latestPrice[0].price_porcelain,
      price_inlay_s: latestPrice[0].price_inlay_s,
      price_inlay: latestPrice[0].price_inlay,
      price_crown_pt: latestPrice[0].price_crown_pt,
      price_crown_st: latestPrice[0].price_crown_st,
      price_crown_at: latestPrice[0].price_crown_at,
      updated_by: 'system',
      updated_at: new Date().toISOString()
    }

    return updateGoldPrice(newPrice)
  } else {
    // 기본 시세 생성
    const defaultPrice = {
      date: today,
      price_porcelain: 169890,
      price_inlay_s: 165000,
      price_inlay: 161670,
      price_crown_pt: 144310,
      price_crown_st: 112350,
      price_crown_at: 91340,
      updated_by: 'system',
      updated_at: new Date().toISOString()
    }

    return updateGoldPrice(defaultPrice)
  }
}
