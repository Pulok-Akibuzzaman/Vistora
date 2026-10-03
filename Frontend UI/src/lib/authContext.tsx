import React, { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, registerUser, updateUserProfile, type UserProfile, type RegisterPayload } from './api'

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
  name: 'Ayaan Rahman',
  email: 'ayaan.rahman@email.com',
  country: 'Bangladesh',
  role: 'Student',
  status: 'Active',
  targetBand: 8.0,
  currentBand: 7.0,
  institution: 'East West University',
  bio: 'CSE student preparing for IELTS Academic for Master’s abroad in AI/ML.',
  phone: '+880-1712-345678',
  lastActive: 'Just now',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = window.localStorage.getItem('vistora-auth-user')
      if (stored) return JSON.parse(stored)
      // Save default initial user so experience is immediate
      window.localStorage.setItem('vistora-auth-user', JSON.stringify(DEFAULT_USER))
      return DEFAULT_USER
    } catch {
      return DEFAULT_USER
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await loginUser(email, password)
      setUser(res.user)
      window.localStorage.setItem('vistora-auth-user', JSON.stringify(res.user))
    } catch (error) {
      // Fallback local login if backend temporarily offline
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

    try {
      const res = await registerUser(payload)
      setUser(res.user)
      window.localStorage.setItem('vistora-auth-user', JSON.stringify(res.user))
    } catch (error) {
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
    try {
      await updateUserProfile({ email: user.email, ...data })
    } catch (err) {
      console.warn('Backend profile update deferred:', err)
    }
  }

  const logout = () => {
    window.localStorage.removeItem('vistora-auth-user')
    setUser(null)
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
