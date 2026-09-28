import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router'
import { fetchResults, deleteExamResultApi, type StoredExamResult } from '../lib/api'
import { useAuth } from '../lib/authContext'

const FILTERS = ['All', 'Full Test', 'Reading', 'Listening', 'Writing', 'Speaking'] as const

function ResultDetail({ result, userName }: { result: StoredExamResult; userName: string }) {
  const descriptor = result.overallBand === null
    ? 'Awaiting AI evaluation'
    : result.overallBand >= 8
      ? 'Very Good User'
      : result.overallBand >= 7
        ? 'Good User'
        : result.overallBand >= 6
          ? 'Competent User'
          : 'Developing User'

  return (
    <div>
      <section className="corner-mark border border-divider bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="label-tag">PRACTICE REPORT · {result.source.toUpperCase()}</div>
            <h1 className="mt-3 font-plex text-2xl font-bold text-ink">{result.testTitle}</h1>
            <div className="mt-2 font-mono text-xs text-graphite-light">
              {userName.toUpperCase()} · IELTS PREPARATION · {new Date(result.completedAt).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-rose-100 font-mono text-2xl font-bold text-rose-600">
              {result.overallBand === null ? '—' : result.overallBand.toFixed(1)}
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">Overall band</div>
              <div className="mt-1 font-plex text-base font-semibold text-ink">{descriptor}</div>
            </div>
          </div>
        </div>
        <div className="mt-7 border-l-2 border-rose-500 bg-rose-50/50 p-5 text-sm leading-6 text-ink">{result.comment}</div>
      </section>

      {result.skillBands && Object.keys(result.skillBands).length > 0 && (
        <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Object.entries(result.skillBands).map(([skill, band]) => (
            <div key={skill} className="border border-divider bg-surface p-5">
              <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">{skill}</div>
              <div className="mt-2 font-mono text-3xl font-bold text-accent">{band?.toFixed(1)}</div>
              <div className="mt-3 h-1 bg-divider">
                <div className="h-full bg-electric" style={{ width: `${((band || 0) / 9) * 100}%` }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {result.correctAnswers !== undefined && (
        <section className="mt-4 border border-divider bg-surface p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">Objective score</div>
              <div className="mt-1">
                <span className="font-mono text-3xl font-bold text-ink">{result.correctAnswers}</span>
                <span className="font-mono text-sm text-graphite-light"> / {result.totalQuestions}</span>
              </div>
            </div>
            <div className="w-full sm:max-w-md">
              <div className="h-2 bg-divider">
                <div
                  className="h-full bg-electric"
                  style={{ width: `${(result.correctAnswers / (result.totalQuestions || 1)) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-right font-mono text-xs text-graphite-light">
                {Math.round((result.correctAnswers / (result.totalQuestions || 1)) * 100)}% accuracy
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mt-4 border border-divider bg-surface">
        <div className="border-b border-divider px-6 py-5">
          <h2 className="font-plex text-lg font-bold text-ink">Score explanation</h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b border-divider p-6 md:border-b-0 md:border-r">
            <div className="font-mono text-xs uppercase tracking-wider text-positive">What went well</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-graphite">
              <li>— The completed sections demonstrate an effective understanding of the test format.</li>
              <li>— Responses were submitted within the selected timed conditions.</li>
              {result.overallBand !== null && result.overallBand >= 6.5 && (
                <li>— Performance indicates a functional command of complex academic English.</li>
              )}
            </ul>
          </div>
          <div className="p-6">
            <div className="font-mono text-xs uppercase tracking-wider text-caution">How to improve</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-graphite">
              <li>— Review every incorrect or incomplete response before starting another mock test.</li>
              <li>— Practise the weakest skill under shorter, focused timed sessions.</li>
              <li>— Retake the same module after targeted review and compare both scores.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="theme-fixed mt-4 border border-divider bg-navy p-6 text-white">
        <div className="font-mono text-xs uppercase tracking-widest text-electric-light">Recommended next steps</div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {['Review mistakes and source evidence', 'Complete one focused skill session', 'Retake after three days of review'].map(
            (step, index) => (
              <div key={step} className="flex gap-3 border border-navy-light p-4">
                <span className="font-mono text-xs text-electric-light">0{index + 1}</span>
                <span className="text-sm leading-5">{step}</span>
              </div>
            )
          )}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <NavLink to="/practice" className="rounded-card bg-electric px-6 py-3 font-plex text-sm font-semibold text-white">
          Take another test
        </NavLink>
        <button onClick={() => window.print()} className="rounded-card border border-divider bg-surface px-6 py-3 font-plex text-sm font-semibold text-ink">
          Print or save PDF
        </button>
      </div>
    </div>
  )
}

export default function Results() {
  const { user } = useAuth()
  const [results, setResults] = useState<StoredExamResult[]>([])
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [selectedId, setSelectedId] = useState<string>('')

  useEffect(() => {
    fetchResults().then(data => {
      setResults(data)
      if (data.length > 0) setSelectedId(data[0].id)
    }).catch(() => {})
  }, [])

  const filteredResults = useMemo(
    () => (filter === 'All' ? results : results.filter(result => result.testType === filter)),
    [filter, results]
  )

  const selectedResult = results.find(result => result.id === selectedId) || filteredResults[0]

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const ok = await deleteExamResultApi(id)
    if (ok) {
      setResults(prev => prev.filter(r => r.id !== id))
    }
  }

  const currentUserName = user?.name || 'Ayaan Rahman'

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="border-b border-divider pb-6">
        <div className="label-tag">RESULTS CENTRE · {currentUserName.toUpperCase()}</div>
        <h1 className="mt-2 font-plex text-3xl font-bold tracking-tight text-ink">Exam results and feedback</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-mid">
          Review full-test and individual-skill results, examiner comments, and personalized next steps.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map(item => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-sm border px-3 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
                filter === item ? 'border-line-ink bg-navy text-white' : 'border-divider bg-surface text-graphite-mid hover:border-slate-400'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
        <aside className="h-fit border border-divider bg-surface">
          <div className="border-b border-divider px-5 py-4 flex items-center justify-between">
            <div>
              <div className="font-plex text-sm font-semibold text-ink">Saved attempts</div>
              <div className="mt-1 font-mono text-xs text-graphite-light">{filteredResults.length} results recorded</div>
            </div>
            <NavLink to="/practice" className="mono text-[10px] text-accent hover:underline">+ New Test</NavLink>
          </div>
          <div className="divide-y divide-divider max-h-[700px] overflow-y-auto">
            {filteredResults.map(result => (
              <div
                key={result.id}
                onClick={() => setSelectedId(result.id)}
                className={`w-full border-l-2 p-4 text-left transition-colors cursor-pointer group flex items-start justify-between gap-2 ${
                  selectedResult?.id === result.id ? 'border-l-rose-600 bg-rose-50/40' : 'border-l-transparent hover:bg-surface-2'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-plex text-xs font-semibold leading-5 text-ink truncate block">
                      {result.testTitle}
                    </span>
                    <span className="font-mono text-sm font-bold text-rose-600 flex-shrink-0">
                      {result.overallBand === null ? '—' : result.overallBand.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] uppercase text-graphite-light">
                    <span>{result.testType}</span>
                    <span>{new Date(result.completedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  type="button"
                  title="Delete record"
                  onClick={e => handleDelete(result.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-subtle hover:text-rose-600 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ))}
            {!filteredResults.length && (
              <div className="p-8 text-center text-sm text-graphite-light">
                No results match this filter. Take a test to record your score!
              </div>
            )}
          </div>
        </aside>

        {selectedResult ? (
          <ResultDetail result={selectedResult} userName={currentUserName} />
        ) : (
          <section className="border border-divider bg-surface p-10 text-center">
            <h2 className="font-plex text-lg font-semibold text-ink">No result selected</h2>
            <p className="mt-2 text-sm text-graphite-mid">Complete a test to generate your first diagnostic report.</p>
          </section>
        )}
      </div>
    </main>
  )
}
