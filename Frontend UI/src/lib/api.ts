/**
 * Client API for communicating with local CSE412 Backend Audio Server
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

export interface PdfResource {
  filename: string
  sizeFormatted: string
  url: string
}

/**
 * Checks connection to backend audio server (tries proxy first, falls back to direct port 5001)
 */
export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) })
    if (res.ok) {
      const data = await res.json()
      return { connected: true, ...data }
    }
  } catch {
    // If Vite proxy fails, try direct connection
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

/**
 * Fetches the indexed audio catalog
 */
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

/**
 * Formats stream URL for a given book, test, and part
 */
export function getStreamUrl(book: string | number, test: string | number, part: string | number): string {
  const cleanBook = String(book).replace(/[^0-9]/g, '')
  return `${API_BASE}/audio/stream/${cleanBook}/${test}/${part}`
}
