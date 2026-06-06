import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  'https://grcgaxvvswegsvbmvrqf.supabase.co'

const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_rRnMg5x9JB-9M7HXpe7fUw_8WucE-m1'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
