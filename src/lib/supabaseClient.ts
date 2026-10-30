import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vjtwqmsqtxpkhuhqmvhk.supabase.co'
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdHdxbXNxdHhwa2h1aHFtdmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTI0MDAsImV4cCI6MjA2MTYyODQwMH0.dummy_key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
