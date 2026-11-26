import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (typeof window !== 'undefined' ? window.localStorage.getItem('VISTORA_SUPABASE_URL') || '' : '')

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (typeof window !== 'undefined' ? window.localStorage.getItem('VISTORA_SUPABASE_ANON_KEY') || '' : '')

export const isSupabaseConfigured = () => {
  return (
    Boolean(SUPABASE_URL) &&
    !SUPABASE_URL.includes('placeholder') &&
    SUPABASE_URL.startsWith('https://') &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_ANON_KEY.includes('placeholder')
  )
}

export const supabase = createClient(
  isSupabaseConfigured() ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? SUPABASE_ANON_KEY : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
