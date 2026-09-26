import { useEffect, useState } from 'react'
import {
  BRITISH_COUNCIL_BANGLADESH_BOOKING_URL,
  ExamDateFilters,
  fetchOfficialExamDates,
  OfficialExamDate,
} from '../lib/examDates'

const INITIAL_FILTERS: ExamDateFilters = {
  city: 'All',
  format: 'All',
  module: 'Academic',
}

export default function ExamDates() {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [dates, setDates] = useState<OfficialExamDate[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable' | 'error'>('loading')

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    fetchOfficialExamDates(filters, controller.signal)
      .then(results => {
        setDates(results)
        setStatus(results.length ? 'ready' : 'unavailable')
      })
      .catch(error => {
        if (error.name !== 'AbortError') setStatus('error')
      })
    return () => controller.abort()
  }, [filters])

  const updateFilter = (key: keyof ExamDateFilters, value: string) => {
    setFilters(current => ({ ...current, [key]: value }))
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="border-b border-divider pb-7">
        <div className="label-tag">OFFICIAL EXAM REGISTRATION · BANGLADESH</div>
        <h1 className="mt-2 font-plex text-3xl font-bold tracking-tight text-navy">Find an official IELTS test date</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-mid">
          Search available British Council IELTS sessions, then continue to the official website to confirm availability, fees, and registration.
        </p>
      </div>

      <section className="mt-6 border border-divider bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">City</span>
            <select value={filters.city} onChange={event => updateFilter('city', event.target.value)} className="mt-2 w-full rounded-sm border border-divider bg-white px-3 py-3 text-sm text-navy outline-none focus:border-electric">
              <option>All</option><option>Dhaka</option><option>Chattogram</option><option>Sylhet</option>
            </select>
          </label>
          <label>
            <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Test format</span>
            <select value={filters.format} onChange={event => updateFilter('format', event.target.value)} className="mt-2 w-full rounded-sm border border-divider bg-white px-3 py-3 text-sm text-navy outline-none focus:border-electric">
              <option>All</option><option>Computer-delivered</option><option>Paper-based</option>
            </select>
          </label>
          <label>
            <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Module</span>
            <select value={filters.module} onChange={event => updateFilter('module', event.target.value)} className="mt-2 w-full rounded-sm border border-divider bg-white px-3 py-3 text-sm text-navy outline-none focus:border-electric">
              <option>Academic</option><option>General Training</option><option>All</option>
            </select>
          </label>
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">
          {status === 'ready' ? `${dates.length} official sessions found` : 'British Council date service'}
        </div>
        <a href={BRITISH_COUNCIL_BANGLADESH_BOOKING_URL} target="_blank" rel="noreferrer" className="font-mono text-xs font-semibold text-electric hover:underline">
          Open official booking website ↗
        </a>
      </div>

      {status === 'loading' && (
        <section className="mt-4 border border-divider bg-white p-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-electric-dim border-t-electric" />
          <p className="mt-4 text-sm text-graphite-mid">Checking official test availability...</p>
        </section>
      )}

      {status === 'ready' && (
        <section className="mt-4 grid gap-3">
          {dates.map(exam => (
            <article key={exam.id} className="corner-mark border border-divider bg-white p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-5">
                  <div className="border-r border-divider pr-5 text-center">
                    <div className="font-mono text-xs uppercase text-electric">{new Date(exam.date).toLocaleDateString('en-GB', { month: 'short' })}</div>
                    <div className="font-mono text-3xl font-bold text-navy">{new Date(exam.date).getDate()}</div>
                    <div className="font-mono text-xs text-graphite-light">{new Date(exam.date).getFullYear()}</div>
                  </div>
                  <div>
                    <h2 className="font-plex text-base font-semibold text-navy">{exam.module} IELTS · {exam.format}</h2>
                    <p className="mt-1 text-sm text-graphite-mid">{exam.venue} · {exam.city}</p>
                    <span className={`mt-3 inline-block rounded-sm px-2 py-1 font-mono text-xs ${exam.availability === 'Available' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'}`}>{exam.availability.toUpperCase()}</span>
                  </div>
                </div>
                <a href={exam.registrationUrl || BRITISH_COUNCIL_BANGLADESH_BOOKING_URL} target="_blank" rel="noreferrer" className="rounded-card bg-electric px-6 py-3 text-center font-plex text-sm font-semibold text-white">
                  Register on British Council ↗
                </a>
              </div>
            </article>
          ))}
        </section>
      )}

      {(status === 'unavailable' || status === 'error') && (
        <section className="mt-4 border border-divider bg-white p-8">
          <div className="max-w-2xl">
            <div className="font-mono text-xs uppercase tracking-wider text-warning">Live date feed not connected</div>
            <h2 className="mt-2 font-plex text-xl font-bold text-navy">Check current dates on the official website</h2>
            <p className="mt-3 text-sm leading-6 text-graphite-mid">
              British Council controls live availability and registration. Continue to its official Bangladesh booking page to see current sessions and complete payment securely.
            </p>
            <a href={BRITISH_COUNCIL_BANGLADESH_BOOKING_URL} target="_blank" rel="noreferrer" className="mt-6 inline-block rounded-card bg-electric px-6 py-3 font-plex text-sm font-semibold text-white">
              View official test dates ↗
            </a>
          </div>
        </section>
      )}

      <section className="mt-4 border-l-2 border-violet bg-violet-dim p-5">
        <div className="font-mono text-xs uppercase tracking-wider text-violet">Important</div>
        <p className="mt-2 text-xs leading-5 text-navy">Vistora AI does not sell IELTS tests or process registration payments. Dates can change, and a place is confirmed only after registration on the official British Council website.</p>
      </section>
    </main>
  )
}
