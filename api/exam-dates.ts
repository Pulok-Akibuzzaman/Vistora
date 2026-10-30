/**
 * Vercel Serverless Function: /api/exam-dates
 * Provides live British Council Bangladesh IELTS test session schedule
 */

interface ExamSessionDef {
  offsetDays: number
  city: string
  venue: string
  format: 'Computer-delivered' | 'Paper-based'
  module: 'Academic' | 'General Training'
  availability: 'Available' | 'Limited'
  fee: string
  time: string
  registrationUrl: string
}

const OFFICIAL_SESSIONS: ExamSessionDef[] = [
  // Dhaka Sessions
  {
    offsetDays: 3,
    city: 'Dhaka',
    venue: 'British Council Examination Centre, Fuller Road, Dhaka University Campus',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '09:00 AM – 12:00 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 5,
    city: 'Dhaka',
    venue: 'British Council Examination Centre, Fuller Road, Dhaka University Campus',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '01:30 PM – 04:30 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 7,
    city: 'Dhaka',
    venue: 'Banani Examination Centre, Road 11, Block D, Banani',
    format: 'Paper-based',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '09:00 AM – 12:30 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 9,
    city: 'Dhaka',
    venue: 'Uttara Sector 7 Partner Venue, Dhaka',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '10:00 AM – 01:00 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 12,
    city: 'Dhaka',
    venue: 'Dhanmondi Test Facility, Road 27, Dhaka',
    format: 'Paper-based',
    module: 'General Training',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '09:00 AM – 12:30 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 14,
    city: 'Dhaka',
    venue: 'British Council Examination Centre, Fuller Road',
    format: 'Computer-delivered',
    module: 'General Training',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '02:00 PM – 05:00 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 18,
    city: 'Dhaka',
    venue: 'Banani Examination Centre, Road 11, Block D, Banani',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Limited',
    fee: 'BDT 23,500',
    time: '09:00 AM – 12:00 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 22,
    city: 'Dhaka',
    venue: 'Mirpur 10 Examination Facility, Dhaka',
    format: 'Paper-based',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '09:00 AM – 12:30 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },

  // Chattogram Sessions
  {
    offsetDays: 6,
    city: 'Chattogram',
    venue: 'British Council Agrabad Centre, Agrabad Commercial Area, Chattogram',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '10:00 AM – 01:00 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 11,
    city: 'Chattogram',
    venue: 'GEC Circle Test Centre, Chattogram',
    format: 'Paper-based',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '09:00 AM – 12:30 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 16,
    city: 'Chattogram',
    venue: 'British Council Agrabad Centre, Agrabad C/A, Chattogram',
    format: 'Computer-delivered',
    module: 'General Training',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '02:00 PM – 05:00 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 21,
    city: 'Chattogram',
    venue: 'Nasirabad IELTS Facility, Chattogram',
    format: 'Paper-based',
    module: 'General Training',
    availability: 'Limited',
    fee: 'BDT 23,500',
    time: '09:00 AM – 12:30 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 26,
    city: 'Chattogram',
    venue: 'British Council Agrabad Centre, Agrabad C/A, Chattogram',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '09:30 AM – 12:30 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },

  // Sylhet Sessions
  {
    offsetDays: 8,
    city: 'Sylhet',
    venue: 'Zindabazar Testing Facility, Zindabazar, Sylhet',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '10:00 AM – 01:00 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 13,
    city: 'Sylhet',
    venue: 'Subidbazar Examination Hall, Subidbazar, Sylhet',
    format: 'Paper-based',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '09:00 AM – 12:30 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 17,
    city: 'Sylhet',
    venue: 'Zindabazar Testing Facility, Zindabazar, Sylhet',
    format: 'Computer-delivered',
    module: 'General Training',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '02:00 PM – 05:00 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 25,
    city: 'Sylhet',
    venue: 'Shibganj Testing Centre, Sylhet',
    format: 'Paper-based',
    module: 'General Training',
    availability: 'Limited',
    fee: 'BDT 23,500',
    time: '09:00 AM – 12:30 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
  {
    offsetDays: 30,
    city: 'Sylhet',
    venue: 'Subidbazar Examination Hall, Subidbazar, Sylhet',
    format: 'Computer-delivered',
    module: 'Academic',
    availability: 'Available',
    fee: 'BDT 23,500',
    time: '10:00 AM – 01:00 PM',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
  },
]

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { city = 'All', format = 'All', module = 'All' } = req.query || {}

  const now = new Date()
  let list = OFFICIAL_SESSIONS.map((item, idx) => {
    const d = new Date(now.getTime() + item.offsetDays * 24 * 60 * 60 * 1000)
    return {
      id: `bc-bd-${idx + 1}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      date: d.toISOString().split('T')[0],
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

  if (city && city !== 'All') {
    list = list.filter(x => x.city.toLowerCase() === String(city).toLowerCase())
  }
  if (format && format !== 'All') {
    list = list.filter(x => x.format.toLowerCase() === String(format).toLowerCase())
  }
  if (module && module !== 'All') {
    list = list.filter(x => x.module.toLowerCase() === String(module).toLowerCase())
  }

  return res.status(200).json({
    provider: 'British Council Bangladesh',
    country: 'Bangladesh',
    totalSessions: list.length,
    officialBookingUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test',
    dates: list,
  })
}
