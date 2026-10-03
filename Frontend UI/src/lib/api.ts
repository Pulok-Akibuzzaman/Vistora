/**
 * Full-Stack Client API for CSE412 IELTS Preparation Platform
 * Connects Frontend UI with local Express backend (Port 5001 / Vite /api proxy)
 */

export const API_BASE = '/api'
export const DIRECT_BACKEND_URL = 'http://localhost:5001'

export interface BackendHealth {
  connected: boolean
  service?: string
  totalAudioFiles?: number
  availableBooks?: string[]
  databaseExists?: boolean
  uptimeSeconds?: number
  error?: string
}

export interface AudioItem {
  book: string
  test: number
  part: number
  filename: string
  relativePath: string
  sizeBytes: number
  sizeFormatted: string
  label: string
  streamUrl: string
}

export interface AudioCatalog {
  totalFiles: number
  books: Record<string, {
    book: string
    title: string
    tests: Record<number, {
      testNumber: number
      title: string
      parts: Record<number, AudioItem>
    }>
  }>
  filesList: AudioItem[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
  country: string
  role: 'Student' | 'Instructor' | 'Admin'
  status: 'Active' | 'Invited' | 'Suspended'
  targetBand: number
  currentBand: number
  institution?: string
  bio?: string
  phone?: string
  lastActive?: string
  createdAt?: string
  examModule?: 'Academic' | 'General Training'
  targetTimeline?: string
  targetCountry?: string
  primaryFocus?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role?: string
  country?: string
  targetBand?: number
  examModule?: 'Academic' | 'General Training'
  targetTimeline?: string
  targetCountry?: string
  primaryFocus?: string
}

export interface StoredExamResult {
  id: string
  userId?: string
  userName?: string
  testTitle: string
  testType: 'Full Test' | 'Reading' | 'Listening' | 'Writing' | 'Speaking'
  completedAt: string
  overallBand: number | null
  skillBands?: Partial<Record<'Listening' | 'Reading' | 'Writing' | 'Speaking', number>>
  correctAnswers?: number
  totalQuestions?: number
  userAnswers?: Record<number | string, any>
  comment: string
  source: 'AI' | 'Automatic' | 'Pending AI'
}

export interface StudyTask {
  id: number
  userId?: string
  title: string
  due: string
  complete: boolean
}

export interface ForumReply {
  id: string
  author: string
  avatar: string
  time: string
  content: string
}

export interface ForumThread {
  id: number
  category: string
  title: string
  author: string
  avatar: string
  country: string
  time: string
  replies: number
  views: number
  upvotes: number
  pinned: boolean
  solved: boolean
  preview: string
  content: string
  tags: string[]
  replyList?: ForumReply[]
}

export interface DashboardStats {
  skillScores: {
    skill: string
    score: number | null
    target: number
    color: string
    bg: string
    hasAttempts?: boolean
    attemptsCount?: number
  }[]
  overallBand: number
  targetBand: number
  totalTestsCompleted: number
  recentActivities: {
    id: string
    type: string
    title: string
    score: string
    time: string
    status: string
  }[]
  recommendations: {
    title: string
    desc: string
    priority: string
    link: string
  }[]
  weeklyProgress: {
    day: string
    mins: number
  }[]
}

export interface WritingEvaluationResult {
  band: number
  ta: number
  cc: number
  lr: number
  gra: number
  wordCount: number
  minWords: number
  paragraphCount: number
  academicWordCount: number
  detectedAcademicWords: string[]
  summary: string
  grammar: {
    type: string
    text: string
    issue: string
    fix: string
  }[]
  vocab: {
    word: string
    level: string
    suggestion: string
    note: string
  }[]
  improvements: string[]
  aiEngine?: string
  criteriaFeedback?: {
    ta?: string
    cc?: string
    lr?: string
    gra?: string
  }
}

// --------------------------------------------------------------------------
// Core Connection & Audio
// --------------------------------------------------------------------------

export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) })
    if (res.ok) {
      const data = await res.json()
      return { connected: true, ...data }
    }
  } catch {
    try {
      const directRes = await fetch(`${DIRECT_BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(3000) })
      if (directRes.ok) {
        const data = await directRes.json()
        return { connected: true, ...data }
      }
    } catch (err: any) {
      return { connected: false, error: err?.message || 'Failed to connect to backend server' }
    }
  }
  return { connected: false, error: 'Backend server returned non-200 status' }
}

export async function fetchAudioCatalog(): Promise<AudioCatalog | null> {
  try {
    const res = await fetch(`${API_BASE}/audio/catalog`)
    if (res.ok) return await res.json()
  } catch {
    try {
      const directRes = await fetch(`${DIRECT_BACKEND_URL}/api/audio/catalog`)
      if (directRes.ok) return await directRes.json()
    } catch {
      return null
    }
  }
  return null
}

export function getStreamUrl(book: string | number, test: string | number, part: string | number): string {
  const cleanBook = String(book).replace(/[^0-9]/g, '')
  return `${API_BASE}/audio/stream/${cleanBook}/${test}/${part}`
}

export async function fetchPdfResources() {
  try {
    const res = await fetch(`${API_BASE}/resources`)
    if (res.ok) return await res.json()
  } catch {
    return { pdfs: [] }
  }
  return { pdfs: [] }
}

// --------------------------------------------------------------------------
// User Authentication & Profiles
// --------------------------------------------------------------------------

export async function loginUser(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Login failed')
  }
  return await res.json()
}

export async function registerUser(payload: RegisterPayload): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Registration failed')
  }
  return await res.json()
}

export async function updateUserProfile(profile: Partial<UserProfile> & { email: string }): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Profile update failed')
  }
  const data = await res.json()
  return data.user
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  const res = await fetch(`${API_BASE}/users`)
  if (!res.ok) throw new Error('Failed to fetch users')
  const data = await res.json()
  return data.users
}

export async function inviteUser(data: { name: string; email: string; country?: string; role?: string; status?: string }): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create user')
  }
  const result = await res.json()
  return result.user
}

export async function toggleUserStatus(id: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/${id}/status`, {
    method: 'PATCH',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to toggle status')
  }
  const result = await res.json()
  return result.user
}

// --------------------------------------------------------------------------
// Exam Results & Dashboard Analytics
// --------------------------------------------------------------------------

export async function fetchResults(): Promise<StoredExamResult[]> {
  let backendResults: StoredExamResult[] = []
  try {
    const res = await fetch(`${API_BASE}/results`)
    if (res.ok) {
      const data = await res.json()
      backendResults = data.results || []
    }
  } catch {}

  try {
    const raw = window.localStorage.getItem('vistora-exam-results')
    const local: StoredExamResult[] = raw ? JSON.parse(raw) : []
    const seen = new Set(backendResults.map(r => r.id))
    const combined = [...backendResults]
    for (const item of local) {
      if (!seen.has(item.id)) {
        combined.push(item)
        seen.add(item.id)
      }
    }
    return combined
  } catch {
    return backendResults
  }
}

export async function saveExamResultApi(result: StoredExamResult): Promise<StoredExamResult> {
  try {
    const res = await fetch(`${API_BASE}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    })
    if (res.ok) {
      const data = await res.json()
      return data.result
    }
  } catch {}
  return result
}

export async function deleteExamResultApi(id: string): Promise<boolean> {
  // 1. Remove from local storage cache immediately
  try {
    const raw = window.localStorage.getItem('vistora-exam-results')
    if (raw) {
      const local: StoredExamResult[] = JSON.parse(raw)
      const updated = local.filter(item => item.id !== id)
      window.localStorage.setItem('vistora-exam-results', JSON.stringify(updated))
    }
  } catch {}

  // 2. Remove from backend server database
  try {
    const res = await fetch(`${API_BASE}/results/${id}`, { method: 'DELETE' })
    return res.ok
  } catch {
    return true
  }
}

export async function fetchDashboardStats(email?: string): Promise<DashboardStats | null> {
  try {
    const url = email ? `${API_BASE}/dashboard/stats?email=${encodeURIComponent(email)}` : `${API_BASE}/dashboard/stats`
    const res = await fetch(url)
    if (res.ok) return await res.json()
  } catch {}
  return null
}

// --------------------------------------------------------------------------
// Study Tasks
// --------------------------------------------------------------------------

export async function fetchTasks(): Promise<StudyTask[]> {
  try {
    const res = await fetch(`${API_BASE}/tasks`)
    if (res.ok) {
      const data = await res.json()
      return data.tasks
    }
  } catch {}
  return []
}

export async function createTask(title: string, due?: string): Promise<StudyTask> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, due }),
  })
  if (!res.ok) throw new Error('Failed to create task')
  const data = await res.json()
  return data.task
}

export async function toggleTaskComplete(id: number, complete: boolean): Promise<StudyTask> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ complete }),
  })
  if (!res.ok) throw new Error('Failed to update task')
  const data = await res.json()
  return data.task
}

export async function deleteTaskApi(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' })
  return res.ok
}

// --------------------------------------------------------------------------
// AI Writing Evaluation & Document Generator
// --------------------------------------------------------------------------

export async function evaluateEssayApi(task: '1' | '2', prompt: string, essay: string): Promise<WritingEvaluationResult> {
  const res = await fetch(`${API_BASE}/writing/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, prompt, essay }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Evaluation failed')
  }
  return await res.json()
}

export async function generateDocumentApi(
  documentType: string,
  details: Record<string, string>,
  candidate?: { name: string; country: string }
): Promise<{ content: string; source?: string }> {
  const res = await fetch(`${API_BASE}/documents/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentType, details, candidate }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Document generation failed')
  }
  const data = await res.json()
  return { content: data.content, source: data.source }
}

export interface SpeakingCriterionFeedback {
  band: number
  feedback: string
}

export interface SpeakingSampleUpgrade {
  original: string
  improved: string
  reason: string
}

export interface SpeakingEvaluationResult {
  overallBand: number
  wpm: number
  criteria: {
    fluencyCoherence: SpeakingCriterionFeedback
    lexicalResource: SpeakingCriterionFeedback
    grammaticalAccuracy: SpeakingCriterionFeedback
    pronunciation: SpeakingCriterionFeedback
  }
  summary: string
  strengths: string[]
  improvements: string[]
  sampleUpgrades?: SpeakingSampleUpgrade[]
  source: string
}

export async function evaluateSpeakingApi(params: {
  part?: number
  title?: string
  questions?: string[]
  transcript: string
  durationSeconds?: number
  wordCount?: number
  userId?: string
  userName?: string
  testTitle?: string
}): Promise<SpeakingEvaluationResult> {
  const res = await fetch(`${API_BASE}/speaking/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Speaking evaluation failed')
  }
  return await res.json()
}


// --------------------------------------------------------------------------
// Community Forum
// --------------------------------------------------------------------------

export async function fetchForumThreads(category?: string, query?: string): Promise<ForumThread[]> {
  const params = new URLSearchParams()
  if (category && category !== 'All Topics') params.set('category', category)
  if (query) params.set('query', query)

  const res = await fetch(`${API_BASE}/forum/threads?${params.toString()}`)
  if (!res.ok) return []
  const data = await res.json()
  return data.threads
}

export async function createForumThreadApi(data: { title: string; category: string; content: string; tags?: string[]; author?: string }): Promise<ForumThread> {
  const res = await fetch(`${API_BASE}/forum/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to post thread')
  }
  const json = await res.json()
  return json.thread
}

export async function replyToForumThreadApi(threadId: number, content: string, author?: string): Promise<{ reply: ForumReply; thread: ForumThread }> {
  const res = await fetch(`${API_BASE}/forum/threads/${threadId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, author }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to post reply')
  }
  return await res.json()
}

export async function upvoteForumThreadApi(threadId: number): Promise<number> {
  const res = await fetch(`${API_BASE}/forum/threads/${threadId}/upvote`, {
    method: 'POST',
  })
  if (!res.ok) return 0
  const data = await res.json()
  return data.upvotes
}
