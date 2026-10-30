// js/lib/auth.js
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const LOCAL_USER_KEY = 'vistora_current_user';

/**
 * Get stored offline/cached user
 */
export function getCachedUser() {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Get current session and profile
 */
export async function getCurrentUser() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return null;

      const user = session.user;
      // Fetch corresponding profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const combined = {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || user.user_metadata?.full_name || user.email.split('@')[0],
        avatarUrl: profile?.avatar_url || '',
        role: profile?.role || 'student',
        targetBand: profile?.target_band || 7.5,
        targetExamDate: profile?.target_exam_date || '',
        institution: profile?.institution || 'East West University',
        bio: profile?.bio || ''
      };

      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(combined));
      return combined;
    } catch (err) {
      console.warn('[Vistora Auth] Error loading Supabase user:', err);
      return getCachedUser();
    }
  }

  // Fallback to cached demo user for offline or unconfigured states
  return getCachedUser();
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) throw error;
    return getCurrentUser();
  }

  // Local fallback simulation if Supabase is not configured yet
  const mockUser = {
    id: 'demo-' + Date.now().toString().slice(-4),
    email: email.trim(),
    fullName: email.split('@')[0],
    role: email.includes('admin') ? 'admin' : 'student',
    targetBand: 7.5,
    institution: 'East West University'
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
  return mockUser;
}

/**
 * Register a new user account
 */
export async function signUp(email, password, fullName = '') {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() }
      }
    });
    if (error) throw error;
    return data.user;
  }

  // Local fallback
  const mockUser = {
    id: 'usr-' + Date.now().toString().slice(-4),
    email: email.trim(),
    fullName: fullName.trim() || email.split('@')[0],
    role: 'student',
    targetBand: 7.5
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
  return mockUser;
}

/**
 * Sign out
 */
export async function signOut() {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(LOCAL_USER_KEY);
  window.location.href = 'login.html';
}

/**
 * Route protection guard
 */
export async function requireAuth(targetRole = null) {
  const user = await getCurrentUser();
  if (!user) {
    const current = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `login.html?redirect=${current}`;
    return null;
  }

  if (targetRole && user.role !== targetRole) {
    alert(`Access denied. This page requires ${targetRole} privileges.`);
    window.location.href = 'dashboard.html';
    return null;
  }

  return user;
}

/**
 * Update user profile
 */
export async function updateProfile(fields) {
  const current = await getCurrentUser();
  if (!current) throw new Error('Not authenticated');

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: fields.fullName,
        target_band: fields.targetBand,
        target_exam_date: fields.targetExamDate || null,
        bio: fields.bio,
        institution: fields.institution,
        updated_at: new Date().toISOString()
      })
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;
  }

  const updated = { ...current, ...fields };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
  return updated;
}
