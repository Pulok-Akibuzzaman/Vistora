// js/lib/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Read config from injected window.__ENV__ or localStorage or default placeholders
const defaultUrl = 'https://xyzcompany.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const SUPABASE_URL = 
  (typeof window !== 'undefined' && (window.__ENV__?.VITE_SUPABASE_URL || localStorage.getItem('VISTORA_SUPABASE_URL'))) ||
  '';

export const SUPABASE_ANON_KEY = 
  (typeof window !== 'undefined' && (window.__ENV__?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('VISTORA_SUPABASE_ANON_KEY'))) ||
  '';

export const isSupabaseConfigured = () => {
  return Boolean(
    SUPABASE_URL && 
    SUPABASE_ANON_KEY && 
    SUPABASE_URL.startsWith('http') && 
    !SUPABASE_URL.includes('xyzcompany')
  );
};

// Create the client with secure browser session settings
export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    })
  : null;

/** Helper to allow user/tester to set Supabase credentials directly in browser UI */
export function setSupabaseConfig(url, anonKey) {
  if (url && anonKey) {
    localStorage.setItem('VISTORA_SUPABASE_URL', url.trim());
    localStorage.setItem('VISTORA_SUPABASE_ANON_KEY', anonKey.trim());
    window.location.reload();
  }
}
