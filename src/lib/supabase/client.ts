import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 10000)
  },
  global: {
    headers: {
      'cache-control': 'no-cache',
    },
  }
})

export default supabase