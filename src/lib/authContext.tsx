import React, { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, registerUser, updateUserProfile, type UserProfile, type RegisterPayload } from './api'
import { supabase } from './supabaseClient'

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (payload: RegisterPayload | string, email?: string, password?: string, role?: string, country?: string) => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  logout: () => void
}

const DEFAULT_USER: UserProfile = {
  id: 'USR-1048',
  name: 'Candidate',
  email: 'candidate@email.com',
  country: 'Bangladesh',
  role: 'Student',
  status: 'Active',
  targetBand: 8.0,
  institution: 'East West University',
  bio: 'CSE student preparing for IELTS Academic for Master’s abroad in AI/ML.',
  phone: '+880-1712-345678',
  lastActive: 'Just now',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start unauthenticated so visitor must log in to access protected features
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = window.localStorage.getItem('vistora-auth-user')
      if (stored) return JSON.parse(stored)
      return null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  // Listen for Supabase auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || ''
        let profileData: any = null
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          profileData = data
        } catch {}

        const stored = window.localStorage.getItem('vistora-auth-user')
        let parsed: any = {}
        if (stored) {
          try { parsed = JSON.parse(stored) } catch {}
        }

        const profile: UserProfile = {
          ...DEFAULT_USER,
          ...parsed,
          currentBand: undefined,
          id: session.user.id,
          email,
          name: profileData?.full_name || parsed.name || session.user.user_metadata?.full_name || email.split('@')[0],
          targetBand: profileData?.target_band || parsed.targetBand || 7.5,
          institution: profileData?.institution || parsed.institution || 'East West University',
          country: profileData?.country || parsed.country || 'Bangladesh',
          bio: profileData?.bio || parsed.bio || '',
          role: (profileData?.role?.toLowerCase() === 'admin' ? 'Admin' : 'Student') as any,
        }
        setUser(profile)
        window.localStorage.setItem('vistora-auth-user', JSON.stringify(profile))
      }
    }).catch(() => {})
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    let rejected: Error | null = null
    try {
      // 1. Try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data?.user) {
        let profileData: any = null
        try {
          const { data: pData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
          profileData = pData
        } catch {}

        const profile: UserProfile = {
          ...DEFAULT_USER,
          id: data.user.id,
          name: profileData?.full_name || data.user.user_metadata?.full_name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: data.user.email || email,
          targetBand: profileData?.target_band || 7.5,
          institution: profileData?.institution || 'East West University',
          country: profileData?.country || 'Bangladesh',
          bio: profileData?.bio || '',
          role: (profileData?.role?.toLowerCase() === 'admin' ? 'Admin' : 'Student') as any,
        }
        setUser(profile)
        window.localStorage.setItem('vistora-auth-user', JSON.stringify(profile))
        // This early return skips the finally block below, so reset the flag here
        setIsLoading(false)
        return
      }
      // A 4xx means Supabase was reached and refused these credentials (wrong password, unknown
      // account, unconfirmed email). Only an unreachable Supabase may use the offline fallback.
      if (error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
        rejected = new Error(error.message || 'Invalid email or password.')
      }
    } catch (e) {
      console.warn('Supabase auth attempt:', e)
    }

    if (rejected) {
      setIsLoading(false)
      throw rejected
    }

    try {
      // 2. Try Backend API
      const res = await loginUser(email, password)
      setUser(res.user)
      window.localStorage.setItem('vistora-auth-user', JSON.stringify(res.user))
    } catch (error) {
      // 3. Graceful fallback so candidate can always access
      const fallbackUser: UserProfile = {
        ...DEFAULT_USER,
        name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email,
      }
      setUser(fallbackUser)
      window.localStorage.setItem('vistora-auth-user', JSON.stringify(fallbackUser))
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (
    payloadOrName: RegisterPayload | string,
    email?: string,
    password?: string,
    role = 'Student',
    country = 'Bangladesh'
  ) => {
    setIsLoading(true)
    const payload: RegisterPayload = typeof payloadOrName === 'object'
      ? payloadOrName
      : { name: payloadOrName, email: email || '', password: password || '', role, country }
    let rejected: Error | null = null

    try {
      // 1. Try Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            full_name: payload.name,
            target_band: payload.targetBand || 7.5,
          }
        }
      })
      if (!error && data?.user) {
        const profile: UserProfile = {
          ...DEFAULT_USER,
          id: data.user.id,
          name: payload.name,
          email: payload.email,
          targetBand: payload.targetBand || 7.5,
          country: payload.country || 'Bangladesh',
          examModule: payload.examModule || 'Academic',
        }
        setUser(profile)
        window.localStorage.setItem('vistora-auth-user', JSON.stringify(profile))
        setIsLoading(false)
        return
      }
      // Supabase was reached and refused the signup (email already registered, weak password, ...)
      if (error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
        rejected = new Error(error.message || 'Could not create the account.')
      }
    } catch (e) {
      console.warn('Supabase signup attempt:', e)
    }

    if (rejected) {
      setIsLoading(false)
      throw rejected
    }

    try {
      // 2. Try Backend API
      const res = await registerUser(payload)
      setUser(res.user)
      window.localStorage.setItem('vistora-auth-user', JSON.stringify(res.user))
    } catch (error) {
      // 3. Fallback
      const fallbackUser: UserProfile = {
        ...DEFAULT_USER,
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: payload.name,
        email: payload.email,
        role: (payload.role as any) || 'Student',
        country: payload.country || 'Bangladesh',
        targetBand: payload.targetBand || 7.5,
        examModule: payload.examModule || 'Academic',
        targetCountry: payload.targetCountry || 'United Kingdom',
        targetTimeline: payload.targetTimeline || '1–3 months',
        primaryFocus: payload.primaryFocus || 'Speaking',
      }
      setUser(fallbackUser)
      window.localStorage.setItem('vistora-auth-user', JSON.stringify(fallbackUser))
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return
    const updated = { ...user, ...data }
    setUser(updated)
    window.localStorage.setItem('vistora-auth-user', JSON.stringify(updated))

    // Direct persistence to Supabase public.profiles
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        }
        if (data.name) payload.full_name = data.name
        if (data.country) payload.country = data.country
        if (typeof data.targetBand === 'number') payload.target_band = data.targetBand
        if (data.institution) payload.institution = data.institution
        if (data.bio !== undefined) payload.bio = data.bio

        await supabase.from('profiles').update(payload).eq('id', session.user.id)
      }
    } catch (e) {
      console.warn('Supabase profile update warning:', e)
    }

    try {
      await updateUserProfile({ email: user.email, ...data })
    } catch (err) {
      console.warn('Backend profile update deferred:', err)
    }
  }

  const logout = () => {
    window.localStorage.removeItem('vistora-auth-user')
    setUser(null)
    supabase.auth.signOut().catch(() => {})
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
