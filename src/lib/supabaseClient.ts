import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (typeof window !== 'undefined' ? window.localStorage.getItem('VISTORA_SUPABASE_URL') || '' : '') ||
  'https://vistora-placeholder.supabase.co'

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (typeof window !== 'undefined' ? window.localStorage.getItem('VISTORA_SUPABASE_ANON_KEY') || '' : '') ||
  'sb_publishable_MzVmnMwTb7_g88g_mEKU-A_u6_45vgx'

export const isSupabaseConfigured = () => {
  return (
    Boolean(SUPABASE_URL) &&
    !SUPABASE_URL.includes('placeholder') &&
    SUPABASE_URL.startsWith('https://')
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
