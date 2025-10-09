// Supabase Auth 기반 인증 시스템
import { supabase } from './client'
import type { User } from '@/types'

export async function signUp(email: string, password: string, userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
  try {
    console.log('회원가입 시도:', { email, userData: { ...userData, password: '[HIDDEN]' } })

    // 1. Supabase Auth에 사용자 등록 (이메일 확인 없이 즉시 가능)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
        }
      }
    })

    console.log('Supabase auth 응답:', { authData, authError })

    if (authError) {
      console.error('Auth 에러:', authError)

      // 사용자 친화적인 에러 메시지
      if (authError.message.includes('already registered')) {
        throw new Error('이미 등록된 이메일입니다.')
      } else if (authError.message.includes('Invalid email')) {
        throw new Error('유효하지 않은 이메일 형식입니다.')
      } else if (authError.message.includes('Password')) {
        throw new Error('비밀번호는 최소 6자 이상이어야 합니다.')
      } else {
        throw new Error(`회원가입 실패: ${authError.message}`)
      }
    }

    if (!authData.user) {
      throw new Error('사용자 생성에 실패했습니다.')
    }

    // 2. 트리거가 자동으로 프로필을 생성할 때까지 잠시 대기 후 조회
    console.log('트리거에 의한 프로필 자동 생성 대기 중...')

    // 잠시 대기 (트리거 실행 시간)
    await new Promise(resolve => setTimeout(resolve, 100))

    // 트리거로 생성된 프로필 조회
    let retries = 3
    let profileData = null

    while (retries > 0 && !profileData) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profile) {
        profileData = profile
        console.log('트리거로 생성된 프로필 조회 성공:', profile.email)
      } else if (profileError) {
        console.log(`프로필 조회 재시도 중... (${4 - retries}/3)`)
        retries--
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
    }

    if (!profileData) {
      // 트리거가 실패한 경우 수동 생성
      console.log('트리거 실패, 수동으로 프로필 생성 중...')
      const { data: manualProfile, error: manualError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          role: email === 'admin@admin.com' ? 'admin' : 'customer'
        })
        .select()
        .single()

      if (manualError) {
        throw new Error(`프로필 생성 실패: ${manualError.message}`)
      }

      profileData = manualProfile
    }

    // 즉시 로그인 처리 (이메일 확인 불필요)
    if (authData.session) {
      console.log('회원가입 후 자동 로그인 성공')
    }

    return { user: profileData, success: true, session: authData.session }
  } catch (error) {
    console.error('회원가입 전체 에러:', error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('로그인 시도:', { email, password: '[HIDDEN]' })
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key (앞 20자):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20))

    // Supabase 연결 테스트
    try {
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      console.log('Supabase 연결 테스트:', { testData, testError })
    } catch (testErr) {
      console.error('Supabase 연결 실패:', testErr)
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('Supabase 로그인 응답:', { data: !!data, error })

    if (error) {
      console.error('상세 에러 정보:', error)
      throw error
    }
    if (!data.user) throw new Error('로그인에 실패했습니다.')

    // profiles 테이블에서 사용자 정보 가져오기
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) throw profileError

    return { user: profileData, success: true }
  } catch (error) {
    throw error
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // profiles 테이블에서 사용자 정보 가져오기
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.log('Profile not found, attempting to create missing profile for user:', user.email)

      // profiles가 없는 기존 사용자를 위한 복구 로직
      try {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown',
            phone: user.user_metadata?.phone || null,
            email: user.email,
            role: user.email === 'admin@admin.com' ? 'admin' : 'customer'
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create missing profile:', createError)
          return null
        }

        console.log('Successfully created missing profile for user:', user.email)
        return newProfile
      } catch (createError) {
        console.error('Error creating missing profile:', createError)
        return null
      }
    }

    return profileData
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}