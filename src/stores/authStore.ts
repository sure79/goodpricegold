import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser, signOut } from '@/lib/supabase/auth'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: async () => {
        try {
          await signOut()
          set({ user: null, isInitialized: true })
        } catch (error) {
          console.error('로그아웃 실패:', error)
          // 에러가 발생해도 로컬 상태는 초기화
          set({ user: null, isInitialized: true })
        }
      },
      initialize: async () => {
        const { isInitialized, isLoading } = get()
        console.log('Initialize called:', { isInitialized, isLoading, isInitializing })

        if (isInitialized || isLoading || isInitializing) {
          console.log('Initialize skipped - already running or completed')
          return
        }

        try {
          isInitializing = true
          set({ isLoading: true })
          console.log('Auth 초기화 시작')

          // Supabase Auth 상태 확인
          const { data: { session }, error } = await supabase.auth.getSession()
          console.log('Session result:', { session: !!session, error })

          if (error) {
            console.error('세션 가져오기 실패:', error)
            set({ user: null, isInitialized: true, isLoading: false })
            return
          }

          if (session?.user) {
            console.log('Session found, getting current user...')
            const user = await getCurrentUser()
            console.log('Current user result:', user)
            set({ user, isInitialized: true, isLoading: false })
            console.log('Auth 초기화 완료 - 로그인됨:', user?.email, 'role:', user?.role)
          } else {
            console.log('No session found')
            set({ user: null, isInitialized: true, isLoading: false })
            console.log('Auth 초기화 완료 - 로그인 안됨')
          }
        } catch (error) {
          console.error('인증 상태 확인 실패:', error)
          set({ user: null, isInitialized: true, isLoading: false })
        } finally {
          isInitializing = false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      skipHydration: true,
    }
  )
)

// 전역 변수로 리스너 등록 상태 관리
let authSubscription: { unsubscribe: () => void } | null = null
let isListenerSetup = false
let isInitializing = false // 초기화 중복 호출 방지

// 앱 전역에서 한 번만 실행되는 초기화 함수
let isGlobalInit = false
export const initializeAuthOnce = async () => {
  if (isGlobalInit) return
  isGlobalInit = true

  try {
    // 1. 인증 상태 초기화
    const { initialize } = useAuthStore.getState()
    await initialize()

    // 2. 리스너 설정 (한 번만)
    if (!isListenerSetup && !authSubscription) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          const { setUser, isInitialized } = useAuthStore.getState()

          // 초기화가 완료된 후에만 상태 변화에 반응
          if (!isInitialized) return

          console.log('Auth state change:', event, !!session)

          if (event === 'SIGNED_OUT') {
            setUser(null)
          } else if (event === 'SIGNED_IN' && session?.user) {
            const user = await getCurrentUser()
            setUser(user)
          }
        } catch (error) {
          console.error('Auth listener 에러:', error)
        }
      })

      authSubscription = subscription
      isListenerSetup = true
      console.log('전역 Auth listener 설정 완료')
    }
  } catch (error) {
    console.error('전역 Auth 초기화 실패:', error)
  }
}

// 인증 리스너 설정 함수 (중복 호출 방지) - 더 이상 사용하지 않음
export const setupAuthListener = () => {
  // 이제 initializeAuthOnce로 대체
  return authSubscription
}

// 리스너 정리 함수 - 앱 종료 시에만 호출
export const cleanupAuthListener = () => {
  try {
    if (authSubscription) {
      authSubscription.unsubscribe()
      authSubscription = null
      isListenerSetup = false
      isGlobalInit = false
      console.log('Auth listener 정리 완료')
    }
  } catch (error) {
    console.error('Auth listener 정리 실패:', error)
  }
}