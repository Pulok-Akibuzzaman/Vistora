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
  if (!userEmail) return []
  try {
    const userStored = window.localStorage.getItem(`${STORAGE_KEY}_${userEmail.toLowerCase().trim()}`)
    if (userStored) return JSON.parse(userStored)
    return []
  } catch {
    return []
  }
}

import { saveExamResultApi } from './api'

export function saveExamResult(result: StoredExamResult, userEmail?: string) {
  const email = (result.userEmail || userEmail)?.toLowerCase().trim()
  if (email) {
    result.userEmail = email
    const userKey = `${STORAGE_KEY}_${email}`
    const userResults = getExamResults(email).filter(item => item.id !== result.id)
    window.localStorage.setItem(userKey, JSON.stringify([result, ...userResults].slice(0, 50)))
  }

  // Asynchronously synchronize directly to Supabase public.exam_results
  saveExamResultApi(result as any).catch(() => {})

  try {
    window.dispatchEvent(new CustomEvent('vistora:result-saved', { detail: result }))
  } catch {}
}
