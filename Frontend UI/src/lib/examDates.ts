export type OfficialExamDate = {
  id: string
  date: string
  city: string
  venue: string
  format: 'Computer-delivered' | 'Paper-based'
  module: 'Academic' | 'General Training'
  availability: 'Available' | 'Limited'
  registrationUrl: string
}

export type ExamDateFilters = {
  city: string
  format: string
  module: string
}

export const BRITISH_COUNCIL_BANGLADESH_BOOKING_URL =
  'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'

export async function fetchOfficialExamDates(filters: ExamDateFilters, signal?: AbortSignal): Promise<OfficialExamDate[]> {
  const endpoint = import.meta.env.VITE_EXAM_DATES_API_URL as string | undefined
  if (!endpoint) return []

  const url = new URL(endpoint)
  if (filters.city !== 'All') url.searchParams.set('city', filters.city)
  if (filters.format !== 'All') url.searchParams.set('format', filters.format)
  if (filters.module !== 'All') url.searchParams.set('module', filters.module)
  url.searchParams.set('country', 'Bangladesh')
  url.searchParams.set('provider', 'British Council')

  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Exam date service returned ${response.status}`)
  const data = await response.json() as { dates?: OfficialExamDate[] } | OfficialExamDate[]
  return Array.isArray(data) ? data : data.dates || []
}
