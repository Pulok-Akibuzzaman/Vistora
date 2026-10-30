// js/data/examDatesData.js

export const OFFICIAL_EXAM_DATES = [
  {
    id: 'bc-1',
    city: 'Dhaka',
    venue: 'British Council Dhaka Examination Centre, Fuller Road',
    format: 'Computer-delivered',
    module: 'Academic',
    dateOffset: 5,
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'
  },
  {
    id: 'bc-2',
    city: 'Dhaka',
    venue: 'Banani Examination Centre, Road 11',
    format: 'Paper-based',
    module: 'Academic',
    dateOffset: 8,
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'
  },
  {
    id: 'bc-3',
    city: 'Chattogram',
    venue: 'Agrabad Commercial Area Centre, Chattogram',
    format: 'Computer-delivered',
    module: 'Academic',
    dateOffset: 12,
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'
  },
  {
    id: 'bc-4',
    city: 'Sylhet',
    venue: 'Zindabazar Testing Facility, Sylhet',
    format: 'Paper-based',
    module: 'General Training',
    dateOffset: 15,
    availability: 'Limited',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'
  },
  {
    id: 'bc-5',
    city: 'Dhaka',
    venue: 'British Council Dhaka Examination Centre, Fuller Road',
    format: 'Computer-delivered',
    module: 'General Training',
    dateOffset: 19,
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'
  },
  {
    id: 'bc-6',
    city: 'Chattogram',
    venue: 'GEC Circle Test Centre, Chattogram',
    format: 'Paper-based',
    module: 'Academic',
    dateOffset: 22,
    availability: 'Limited',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'
  },
  {
    id: 'bc-7',
    city: 'Sylhet',
    venue: 'Subidbazar Examination Hall, Sylhet',
    format: 'Computer-delivered',
    module: 'Academic',
    dateOffset: 26,
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'
  },
  {
    id: 'bc-8',
    city: 'Dhaka',
    venue: 'Uttara Sector 7 Partner Venue, Dhaka',
    format: 'Computer-delivered',
    module: 'Academic',
    dateOffset: 30,
    availability: 'Available',
    fee: 'BDT 23,500',
    registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'
  }
];

export function getComputedExamDates() {
  const now = new Date();
  return OFFICIAL_EXAM_DATES.map(item => {
    const d = new Date(now.getTime() + item.dateOffset * 24 * 60 * 60 * 1000);
    return {
      ...item,
      dateString: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      isoDate: d.toISOString().split('T')[0]
    };
  });
}
