export type StoredExamResult = {
  id: string
  testTitle: string
  testType: 'Full Test' | 'Reading' | 'Listening' | 'Writing' | 'Speaking'
  completedAt: string
  overallBand: number | null
  skillBands?: Partial<Record<'Listening' | 'Reading' | 'Writing' | 'Speaking', number>>
  correctAnswers?: number
  totalQuestions?: number
  comment: string
  source: 'AI' | 'Automatic' | 'Pending AI'
}

const STORAGE_KEY = 'vistora-exam-results'

const DEFAULT_RESULTS: StoredExamResult[] = [
  {
    id: 'demo-full-1',
    testTitle: 'IELTS 21 — Complete Academic Test 1',
    testType: 'Full Test',
    completedAt: '2026-09-22T10:30:00.000Z',
    overallBand: 6.5,
    skillBands: { Listening: 7.5, Reading: 6.5, Writing: 6, Speaking: 6.5 },
    comment: 'A competent overall performance. Listening is the strongest skill; Writing needs more precise development and grammatical control.',
    source: 'AI',
  },
  {
    id: 'demo-reading-1',
    testTitle: 'IELTS 21 — Reading Test 1 · Part 1',
    testType: 'Reading',
    completedAt: '2026-09-20T08:15:00.000Z',
    overallBand: 7,
    correctAnswers: 10,
    totalQuestions: 13,
    comment: 'Strong factual scanning. Review the distinction between FALSE and NOT GIVEN.',
    source: 'Automatic',
  },
]

export function getExamResults(): StoredExamResult[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_RESULTS
  } catch {
    return DEFAULT_RESULTS
  }
}

export function saveExamResult(result: StoredExamResult) {
  const results = getExamResults().filter(item => item.id !== result.id)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([result, ...results].slice(0, 30)))
}
