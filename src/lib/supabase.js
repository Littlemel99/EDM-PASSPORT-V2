import { createClient } from '@supabase/supabase-js'

export const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  'https://grcgaxvvswegsvbmvrqf.supabase.co'

const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_rRnMg5x9JB-9M7HXpe7fUw_8WucE-m1'

function getBrowserAuthStorage() {
  if (typeof window === 'undefined') return undefined
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

const browserAuthStorage = getBrowserAuthStorage()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    ...(browserAuthStorage ? { storage: browserAuthStorage } : {}),
  },
})
