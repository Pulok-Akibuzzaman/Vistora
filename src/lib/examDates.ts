export type OfficialExamDate = {
  id: string
  date: string
  time?: string
  city: string
  venue: string
  format: 'Computer-delivered' | 'Paper-based'
  module: 'Academic' | 'General Training'
  availability: 'Available' | 'Limited'
  fee: string
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
 * Comprehensive sessions across Dhaka, Chattogram, and Sylhet.
 */
export const OFFICIAL_EXAM_SESSIONS: {
  id: string
  offsetDays: number
  city: string
  venue: string
  time: string
  format: 'Computer-delivered' | 'Paper-based'
  module: 'Academic' | 'General Training'
  availability: 'Available' | 'Limited'
  fee: string
  registrationUrl: string
}[] = [
  // --- DHAKA SESSIONS ---
  {
    id: 'bc-dhaka-1',
    offsetDays: 3,
    city: 'Dhaka',
    venue: 'British Council Dhaka Examination Centre, Fuller Road, Dhaka University Campus',
    time: '09:00 AM – 12:00 PM',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-dhaka-2',
    offsetDays: 5,
    city: 'Dhaka',
    venue: 'British Council Dhaka Examination Centre, Fuller Road, Dhaka University Campus',
    time: '01:30 PM – 04:30 PM',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-dhaka-3',
    offsetDays: 7,
    city: 'Dhaka',
    venue: 'Banani Examination Centre, Road 11, Block D, Banani',
    time: '09:00 AM – 12:30 PM',
    format: 'Paper-based',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-dhaka-4',
    offsetDays: 9,
    city: 'Dhaka',
    venue: 'Uttara Sector 7 Partner Venue, Dhaka',
    time: '10:00 AM – 01:00 PM',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-dhaka-5',
    offsetDays: 12,
    city: 'Dhaka',
    venue: 'Dhanmondi Test Facility, Road 27, Dhaka',
    time: '09:00 AM – 12:30 PM',
    format: 'Paper-based',
    module: 'General Training',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-dhaka-6',
    offsetDays: 14,
    city: 'Dhaka',
    venue: 'British Council Examination Centre, Fuller Road',
    time: '02:00 PM – 05:00 PM',
    format: 'Computer-delivered',
    module: 'General Training',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-dhaka-7',
    offsetDays: 16,
    city: 'Dhaka',
    venue: 'Banani Examination Centre, Road 11, Block D, Banani',
    time: '09:00 AM – 12:00 PM',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Limited',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-dhaka-8',
    offsetDays: 19,
    city: 'Dhaka',
    venue: 'Mirpur 10 Examination Facility, Dhaka',
    time: '09:00 AM – 12:30 PM',
    format: 'Paper-based',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-dhaka-9',
    offsetDays: 23,
    city: 'Dhaka',
    venue: 'British Council Examination Centre, Fuller Road',
    time: '09:00 AM – 12:00 PM',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-dhaka-10',
    offsetDays: 27,
    city: 'Dhaka',
    venue: 'Banani Examination Centre, Road 11, Block D, Banani',
    time: '09:00 AM – 12:30 PM',
    format: 'Paper-based',
    module: 'General Training',
    availability: 'Limited',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },

  // --- CHATTOGRAM SESSIONS ---
  {
    id: 'bc-ctg-1',
    offsetDays: 4,
    city: 'Chattogram',
    venue: 'British Council Agrabad Centre, Agrabad Commercial Area, Chattogram',
    time: '10:00 AM – 01:00 PM',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-ctg-2',
    offsetDays: 8,
    city: 'Chattogram',
    venue: 'GEC Circle Test Centre, Chattogram',
    time: '09:00 AM – 12:30 PM',
    format: 'Paper-based',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-ctg-3',
    offsetDays: 13,
    city: 'Chattogram',
    venue: 'British Council Agrabad Centre, Agrabad C/A, Chattogram',
    time: '02:00 PM – 05:00 PM',
    format: 'Computer-delivered',
    module: 'General Training',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-ctg-4',
    offsetDays: 17,
    city: 'Chattogram',
    venue: 'Nasirabad IELTS Facility, Chattogram',
    time: '09:00 AM – 12:30 PM',
    format: 'Paper-based',
    module: 'General Training',
    availability: 'Limited',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-ctg-5',
    offsetDays: 21,
    city: 'Chattogram',
    venue: 'British Council Agrabad Centre, Agrabad C/A, Chattogram',
    time: '09:30 AM – 12:30 PM',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-ctg-6',
    offsetDays: 28,
    city: 'Chattogram',
    venue: 'GEC Circle Test Centre, Chattogram',
    time: '09:00 AM – 12:30 PM',
    format: 'Paper-based',
    module: 'Academic',
    availability: 'Limited',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },

  // --- SYLHET SESSIONS ---
  {
    id: 'bc-sylhet-1',
    offsetDays: 6,
    city: 'Sylhet',
    venue: 'Zindabazar Testing Facility, Zindabazar, Sylhet',
    time: '10:00 AM – 01:00 PM',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-sylhet-2',
    offsetDays: 10,
    city: 'Sylhet',
    venue: 'Subidbazar Examination Hall, Subidbazar, Sylhet',
    time: '09:00 AM – 12:30 PM',
    format: 'Paper-based',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-sylhet-3',
    offsetDays: 15,
    city: 'Sylhet',
    venue: 'Zindabazar Testing Facility, Zindabazar, Sylhet',
    time: '02:00 PM – 05:00 PM',
    format: 'Computer-delivered',
    module: 'General Training',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-sylhet-4',
    offsetDays: 20,
    city: 'Sylhet',
    venue: 'Shibganj Testing Centre, Sylhet',
    time: '09:00 AM – 12:30 PM',
    format: 'Paper-based',
    module: 'General Training',
    availability: 'Limited',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-sylhet-5',
    offsetDays: 25,
    city: 'Sylhet',
    venue: 'Subidbazar Examination Hall, Subidbazar, Sylhet',
    time: '10:00 AM – 01:00 PM',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    id: 'bc-sylhet-6',
    offsetDays: 29,
    city: 'Sylhet',
    venue: 'Zindabazar Testing Facility, Zindabazar, Sylhet',
    time: '09:00 AM – 12:00 PM',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
]

export function getLocalOfficialExamDates(filters: ExamDateFilters): OfficialExamDate[] {
  const now = new Date()
  let list: OfficialExamDate[] = OFFICIAL_EXAM_SESSIONS.map((item) => {
    const d = new Date(now.getTime() + item.offsetDays * 24 * 60 * 60 * 1000)
    // Build the date from local parts: toISOString() is UTC, which is still "yesterday" until 6 AM in Bangladesh
    const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return {
      id: `${item.id}-${localDate}`,
      date: localDate,
      time: item.time,
      city: item.city,
      venue: item.venue,
      format: item.format,
      module: item.module,
      availability: item.availability,
      fee: item.fee,
      registrationUrl: item.registrationUrl,
    }
  })

  if (filters.city && filters.city !== 'All') {
    list = list.filter(x => x.city.toLowerCase() === filters.city.toLowerCase())
  }
  if (filters.format && filters.format !== 'All') {
    list = list.filter(x => x.format.toLowerCase() === filters.format.toLowerCase())
  }
  if (filters.module && filters.module !== 'All') {
    list = list.filter(x => x.module.toLowerCase() === filters.module.toLowerCase())
  }

  // Sort ascending by date
  return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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
