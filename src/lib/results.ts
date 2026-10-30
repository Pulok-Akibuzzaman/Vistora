export type StoredExamResult = {
  id: string
  userId?: string
  userName?: string
  userEmail?: string
  testTitle: string
  testType: 'Full Test' | 'Reading' | 'Listening' | 'Writing' | 'Speaking'
  testNumber?: number
  part?: number
  completedAt: string
  overallBand: number | null
  skillBands?: Partial<Record<'Listening' | 'Reading' | 'Writing' | 'Speaking', number>>
  correctAnswers?: number
  totalQuestions?: number
  comment: string
  source: 'AI' | 'Automatic' | 'Pending AI'
}

const STORAGE_KEY = 'vistora-exam-results'

const DEFAULT_RESULTS: StoredExamResult[] = []

export function getExamResults(userEmail?: string): StoredExamResult[] {
  try {
    if (userEmail) {
      const userStored = window.localStorage.getItem(`${STORAGE_KEY}_${userEmail}`)
      if (userStored) return JSON.parse(userStored)
      // Check global storage filtered strictly by userEmail
      const globalStored = window.localStorage.getItem(STORAGE_KEY)
      if (globalStored) {
        const list: StoredExamResult[] = JSON.parse(globalStored)
        return list.filter(r => r.userEmail && r.userEmail.toLowerCase() === userEmail.toLowerCase())
      }
      return []
    }
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_RESULTS
  } catch {
    return DEFAULT_RESULTS
  }
}

import { saveExamResultApi } from './api'

export function saveExamResult(result: StoredExamResult, userEmail?: string) {
  const email = result.userEmail || userEmail
  if (email) {
    const userKey = `${STORAGE_KEY}_${email}`
    const userResults = getExamResults(email).filter(item => item.id !== result.id)
    window.localStorage.setItem(userKey, JSON.stringify([result, ...userResults].slice(0, 50)))
  }
  try {
    const globalRaw = window.localStorage.getItem(STORAGE_KEY)
    const globalResults: StoredExamResult[] = globalRaw ? JSON.parse(globalRaw) : []
    const updated = [result, ...globalResults.filter(item => item.id !== result.id)].slice(0, 100)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}

  // Asynchronously synchronize directly to Supabase public.exam_results
  saveExamResultApi(result as any).catch(() => {})
}
