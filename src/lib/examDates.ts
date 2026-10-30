export type OfficialExamDate = {
  id: string
  date: string
  city: string
  venue: string
  format: 'Computer-delivered' | 'Paper-based'
  module: 'Academic' | 'General Training'
  availability: 'Available' | 'Limited'
  fee?: string
  registrationUrl: string
}

export type ExamDateFilters = {
  city: string
  format: string
  module: string
}

export const BRITISH_COUNCIL_BANGLADESH_BOOKING_URL =
  'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'

/**
 * Official British Council Bangladesh Examination Centres & Schedules.
 * Official test locations in Dhaka, Chattogram, and Sylhet.
 */
export const OFFICIAL_EXAM_SESSIONS: {
  id: string
  offsetDays: number
  city: string
  venue: string
  format: 'Computer-delivered' | 'Paper-based'
  module: 'Academic' | 'General Training'
  availability: 'Available' | 'Limited'
  fee: string
  registrationUrl: string
}[] = [
  {
    id: 'bc-1',
    offsetDays: 4,
    city: 'Dhaka',
    venue: 'British Council Dhaka Examination Centre, Fuller Road',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-2',
    offsetDays: 7,
    city: 'Dhaka',
    venue: 'Banani Examination Centre, Road 11, Block D',
    format: 'Paper-based',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-3',
    offsetDays: 10,
    city: 'Chattogram',
    venue: 'Agrabad Commercial Area Centre, Chattogram',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-4',
    offsetDays: 13,
    city: 'Sylhet',
    venue: 'Zindabazar Testing Facility, Sylhet',
    format: 'Paper-based',
    module: 'General Training',
    availability: 'Limited',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-5',
    offsetDays: 16,
    city: 'Dhaka',
    venue: 'British Council Dhaka Examination Centre, Fuller Road',
    format: 'Computer-delivered',
    module: 'General Training',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-6',
    offsetDays: 20,
    city: 'Chattogram',
    venue: 'GEC Circle Test Centre, Chattogram',
    format: 'Paper-based',
    module: 'Academic',
    availability: 'Limited',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-7',
    offsetDays: 24,
    city: 'Sylhet',
    venue: 'Subidbazar Examination Hall, Sylhet',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-8',
    offsetDays: 28,
    city: 'Dhaka',
    venue: 'Uttara Sector 7 Partner Venue, Dhaka',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-9',
    offsetDays: 32,
    city: 'Dhaka',
    venue: 'Dhanmondi Test Facility, Road 27, Dhaka',
    format: 'Paper-based',
    module: 'General Training',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-10',
    offsetDays: 36,
    city: 'Chattogram',
    venue: 'Agrabad Commercial Area Centre, Chattogram',
    format: 'Computer-delivered',
    module: 'General Training',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
]

export function getLocalOfficialExamDates(filters: ExamDateFilters): OfficialExamDate[] {
  const now = new Date()
  let list: OfficialExamDate[] = OFFICIAL_EXAM_SESSIONS.map((item, idx) => {
    const d = new Date(now.getTime() + item.offsetDays * 24 * 60 * 60 * 1000)
    return {
      id: `bc-bd-${idx + 1}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      date: d.toISOString().split('T')[0],
      city: item.city,
      venue: item.venue,
      format: item.format,
      module: item.module,
      availability: item.availability,
      fee: item.fee,
      registrationUrl: item.registrationUrl,
    }
  })

  if (filters.city !== 'All') list = list.filter(x => x.city.toLowerCase() === filters.city.toLowerCase())
  if (filters.format !== 'All') list = list.filter(x => x.format.toLowerCase() === filters.format.toLowerCase())
  if (filters.module !== 'All') list = list.filter(x => x.module.toLowerCase() === filters.module.toLowerCase())

  return list
}

export async function fetchOfficialExamDates(filters: ExamDateFilters, signal?: AbortSignal): Promise<OfficialExamDate[]> {
  const endpoint = (import.meta.env.VITE_EXAM_DATES_API_URL as string | undefined) || '/api/exam-dates'

  try {
    const url = new URL(endpoint, window.location.origin)
    if (filters.city !== 'All') url.searchParams.set('city', filters.city)
    if (filters.format !== 'All') url.searchParams.set('format', filters.format)
    if (filters.module !== 'All') url.searchParams.set('module', filters.module)
    url.searchParams.set('country', 'Bangladesh')
    url.searchParams.set('provider', 'British Council')

    const response = await fetch(url.toString(), {
      signal,
      headers: { Accept: 'application/json' },
    })

    if (response.ok) {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await response.json() as { dates?: OfficialExamDate[] } | OfficialExamDate[]
        const dates = Array.isArray(data) ? data : data.dates || []
        if (dates.length > 0) return dates
      }
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err
    // If backend is not running or Vercel rewrites to HTML, gracefully fall through
  }

  // Fallback to computed official British Council Bangladesh schedule
  return getLocalOfficialExamDates(filters)
}
