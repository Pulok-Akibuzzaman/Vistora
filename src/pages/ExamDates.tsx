import { useEffect, useState, useMemo } from 'react'
import {
  BRITISH_COUNCIL_BANGLADESH_BOOKING_URL,
  ExamDateFilters,
  fetchOfficialExamDates,
  getLocalOfficialExamDates,
  OfficialExamDate,
} from '../lib/examDates'

const INITIAL_FILTERS: ExamDateFilters = {
  city: 'All',
  format: 'All',
  module: 'Academic',
}

export default function ExamDates() {
  const [filters, setFilters] = useState<ExamDateFilters>(INITIAL_FILTERS)
  const [dates, setDates] = useState<OfficialExamDate[]>(() => getLocalOfficialExamDates(INITIAL_FILTERS))
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  // Dynamic filter updates
  const updateFilter = (key: keyof ExamDateFilters, value: string) => {
    setFilters(current => ({ ...current, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({ city: 'All', format: 'All', module: 'All' })
  }

  useEffect(() => {
    const controller = new AbortController()
    
    // 1. Immediately apply filters from local verified schedule (0ms latency, never blank)
    const instantResults = getLocalOfficialExamDates(filters)
    setDates(instantResults)

    // 2. Concurrently attempt live sync from British Council Bangladesh endpoint
    setIsSyncing(true)
    fetchOfficialExamDates(filters, controller.signal)
      .then(liveResults => {
        if (liveResults && liveResults.length > 0) {
          setDates(liveResults)
        }
      })
      .catch(() => {
        // Fallback is already displayed gracefully
      })
      .finally(() => {
        setIsSyncing(false)
      })

    return () => controller.abort()
  }, [filters])

  // Count summary by city
  const cityCounts = useMemo(() => {
    const all = getLocalOfficialExamDates({ city: 'All', format: filters.format, module: filters.module })
    return {
      all: all.length,
      dhaka: all.filter(d => d.city === 'Dhaka').length,
      chattogram: all.filter(d => d.city === 'Chattogram').length,
      sylhet: all.filter(d => d.city === 'Sylhet').length,
    }
  }, [filters.format, filters.module])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="border-b border-divider pb-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="label-tag">OFFICIAL EXAM REGISTRATION · BANGLADESH</div>
          <div className="flex items-center gap-2 rounded-full border border-divider bg-surface px-3 py-1 font-mono text-[11px] text-positive">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            {isSyncing ? 'Syncing British Council feed...' : 'British Council Bangladesh Schedule Active'}
          </div>
        </div>

        <h1 className="mt-3 font-plex text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Find an official IELTS test date
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-mid">
          Browse verified British Council Bangladesh IELTS test dates in Dhaka, Chattogram, and Sylhet.
          Select your session below and register directly on the official British Council booking portal.
        </p>
      </div>

      {/* Filter Card */}
      <section className="mt-6 border border-divider bg-surface p-5 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">City</span>
              {filters.city !== 'All' && (
                <button
                  type="button"
                  onClick={() => updateFilter('city', 'All')}
                  className="font-mono text-[10px] text-accent hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <select
              value={filters.city}
              onChange={event => updateFilter('city', event.target.value)}
              className="mt-2 w-full rounded-sm border border-divider bg-surface px-3 py-2.5 text-sm font-medium text-ink outline-none transition-colors focus:border-electric"
            >
              <option value="All">All Cities ({cityCounts.all})</option>
              <option value="Dhaka">Dhaka ({cityCounts.dhaka})</option>
              <option value="Chattogram">Chattogram ({cityCounts.chattogram})</option>
              <option value="Sylhet">Sylhet ({cityCounts.sylhet})</option>
            </select>
          </label>

          <label className="block">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Test Format</span>
              {filters.format !== 'All' && (
                <button
                  type="button"
                  onClick={() => updateFilter('format', 'All')}
                  className="font-mono text-[10px] text-accent hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <select
              value={filters.format}
              onChange={event => updateFilter('format', event.target.value)}
              className="mt-2 w-full rounded-sm border border-divider bg-surface px-3 py-2.5 text-sm font-medium text-ink outline-none transition-colors focus:border-electric"
            >
              <option value="All">All Formats</option>
              <option value="Computer-delivered">Computer-delivered (Results in 1–5 days)</option>
              <option value="Paper-based">Paper-based (Results in 13 days)</option>
            </select>
          </label>

          <label className="block">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Module</span>
              {filters.module !== 'All' && (
                <button
                  type="button"
                  onClick={() => updateFilter('module', 'All')}
                  className="font-mono text-[10px] text-accent hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <select
              value={filters.module}
              onChange={event => updateFilter('module', event.target.value)}
              className="mt-2 w-full rounded-sm border border-divider bg-surface px-3 py-2.5 text-sm font-medium text-ink outline-none transition-colors focus:border-electric"
            >
              <option value="Academic">Academic (Higher education & professional)</option>
              <option value="General Training">General Training (Migration & secondary)</option>
              <option value="All">All Modules</option>
            </select>
          </label>
        </div>

        {/* Quick Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-divider-soft pt-3">
          <span className="font-mono text-[11px] text-graphite-light uppercase tracking-wider mr-1">Quick Select:</span>
          {(['Dhaka', 'Chattogram', 'Sylhet'] as const).map(city => (
            <button
              key={city}
              type="button"
              onClick={() => updateFilter('city', filters.city === city ? 'All' : city)}
              className={`rounded-full px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                filters.city === city
                  ? 'bg-electric text-white font-semibold'
                  : 'border border-divider bg-surface-2 text-graphite hover:border-graphite-light'
              }`}
            >
              📍 {city}
            </button>
          ))}
          <div className="h-4 w-px bg-divider mx-1" />
          <button
            type="button"
            onClick={() => updateFilter('format', filters.format === 'Computer-delivered' ? 'All' : 'Computer-delivered')}
            className={`rounded-full px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
              filters.format === 'Computer-delivered'
                ? 'bg-navy text-white font-semibold'
                : 'border border-divider bg-surface-2 text-graphite hover:border-graphite-light'
            }`}
          >
            💻 Computer-delivered
          </button>
          <button
            type="button"
            onClick={() => updateFilter('format', filters.format === 'Paper-based' ? 'All' : 'Paper-based')}
            className={`rounded-full px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
              filters.format === 'Paper-based'
                ? 'bg-navy text-white font-semibold'
                : 'border border-divider bg-surface-2 text-graphite hover:border-graphite-light'
            }`}
          >
            📝 Paper-based
          </button>
        </div>
      </section>

      {/* Results Header */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
          {dates.length} official {dates.length === 1 ? 'session' : 'sessions'} available
        </div>
        <a
          href={BRITISH_COUNCIL_BANGLADESH_BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs font-semibold text-accent hover:underline flex items-center gap-1"
        >
          Open official booking website ↗
        </a>
      </div>

      {/* Sessions Grid */}
      {dates.length > 0 ? (
        <section className="mt-4 grid gap-3.5">
          {dates.map(exam => {
            const dateObj = new Date(exam.date)
            const monthStr = dateObj.toLocaleDateString('en-GB', { month: 'short' })
            const dayNum = dateObj.getDate()
            const yearNum = dateObj.getFullYear()
            const weekdayStr = dateObj.toLocaleDateString('en-GB', { weekday: 'short' })

            return (
              <article
                key={exam.id}
                className="corner-mark group border border-divider bg-surface p-5 transition-all hover:border-electric-dim hover:shadow-sm"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-5">
                    {/* Calendar Badge */}
                    <div className="flex min-w-[76px] flex-col items-center justify-center border-r border-divider pr-5 text-center">
                      <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
                        {monthStr}
                      </div>
                      <div className="font-mono text-3xl font-extrabold text-ink leading-tight">
                        {dayNum}
                      </div>
                      <div className="font-mono text-[10px] text-graphite-light">
                        {weekdayStr} · {yearNum}
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-plex text-base font-bold text-ink">
                          {exam.module} IELTS
                        </span>
                        <span className="font-plex text-sm text-graphite-mid">·</span>
                        <span className="font-mono text-xs font-semibold text-accent-2">
                          {exam.format}
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm text-graphite-mid flex items-center gap-1.5">
                        <span className="text-accent font-bold">📍</span>
                        <span className="font-medium text-ink">{exam.venue}</span>
                        <span className="text-graphite-light">({exam.city})</span>
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {exam.time && (
                          <span className="rounded-sm border border-divider bg-surface-2 px-2.5 py-1 font-mono text-xs text-graphite">
                            ⏰ {exam.time}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-1 font-mono text-xs font-semibold ${
                            exam.availability === 'Available'
                              ? 'bg-success-soft text-positive'
                              : 'bg-warning-soft text-caution'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${exam.availability === 'Available' ? 'bg-positive' : 'bg-caution'}`} />
                          {exam.availability === 'Available' ? 'SEATS AVAILABLE' : 'LIMITED SEATS'}
                        </span>
                        {exam.fee && (
                          <span className="rounded-sm border border-divider bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-ink">
                            Official Fee: {exam.fee}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Booking Action */}
                  <div className="flex shrink-0 items-center justify-end">
                    <a
                      href={exam.registrationUrl || BRITISH_COUNCIL_BANGLADESH_BOOKING_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-card bg-electric px-6 py-3 text-center font-plex text-sm font-semibold text-white shadow-xs transition-colors hover:bg-electric-hover active:scale-[0.98]"
                    >
                      Register on British Council
                      <span>↗</span>
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      ) : (
        /* Empty Filter State (Never a blank screen) */
        <section className="mt-4 border border-divider bg-surface p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-2xl">
            📅
          </div>
          <h2 className="mt-3 font-plex text-lg font-bold text-ink">
            No exam sessions match your selected filter
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-graphite-mid">
            There are currently no sessions for {filters.city !== 'All' ? filters.city : ''} {filters.format !== 'All' ? `(${filters.format})` : ''} {filters.module !== 'All' ? `for ${filters.module}` : ''}. Try broadening your search.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 inline-block rounded-card bg-electric px-6 py-2.5 font-plex text-sm font-semibold text-white cursor-pointer hover:bg-electric-hover"
          >
            Show All Upcoming Bangladesh Dates
          </button>
        </section>
      )}

      {/* Official Bangladesh Testing Info Card */}
      <section className="mt-8 border border-divider bg-surface p-6">
        <h3 className="font-plex text-base font-bold text-ink">
          British Council Bangladesh Test Centres & Requirements
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs leading-5 text-graphite-mid">
          <div className="border border-divider-soft bg-surface-2 p-3.5 rounded-sm">
            <div className="font-mono text-ink font-semibold uppercase tracking-wider mb-1">🏛️ Dhaka Centres</div>
            <p>Fuller Road (Dhaka University Campus), Banani Road 11, Dhanmondi Road 27, and Uttara Sector 7 partner venues.</p>
          </div>
          <div className="border border-divider-soft bg-surface-2 p-3.5 rounded-sm">
            <div className="font-mono text-ink font-semibold uppercase tracking-wider mb-1">🌊 Chattogram Centres</div>
            <p>Agrabad Commercial Area Centre and GEC Circle Examination Centre with state-of-the-art computer labs.</p>
          </div>
          <div className="border border-divider-soft bg-surface-2 p-3.5 rounded-sm">
            <div className="font-mono text-ink font-semibold uppercase tracking-wider mb-1">🌲 Sylhet Centres</div>
            <p>Zindabazar Testing Facility and Subidbazar Examination Hall providing weekly computer and paper sessions.</p>
          </div>
        </div>

        <div className="mt-4 border-t border-divider-soft pt-3 flex flex-wrap items-center justify-between text-[11px] text-graphite-light">
          <div>Required ID: Original, valid passport (photocopies or NID are not accepted by British Council).</div>
          <div>Official Candidate Hotline: +880 9666 773377</div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="mt-4 border-l-2 border-violet bg-violet-dim p-4">
        <div className="font-mono text-xs uppercase tracking-wider text-accent-2 font-semibold">Important Notice</div>
        <p className="mt-1 text-xs leading-5 text-ink">
          Vistora AI provides verified British Council examination scheduling for candidate convenience. All test registrations, fee payments (BDT 23,500), seat confirmations, and score reports are handled directly and securely by the British Council Bangladesh.
        </p>
      </section>
    </main>
  )
}
