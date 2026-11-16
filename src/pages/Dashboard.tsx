import { NavLink } from 'react-router'
import Icon from '../components/Icon'
import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '../lib/authContext'
import {
  fetchDashboardStats,
  fetchResults,
  fetchTasks,
  createTask,
  toggleTaskComplete,
  deleteTaskApi,
  type DashboardStats,
  type StoredExamResult,
  type StudyTask,
} from '../lib/api'
import { themeBg, themeText } from '../lib/theme'

function BandArc({ score, target }: { score: number | null; target: number }) {
  const r = 42, cx = 50, cy = 50
  const startAngle = -210
  const totalArc = 240
  const safeScore = score ?? 0
  const scoreAngle = startAngle + (Math.min(9, Math.max(0, safeScore)) / 9) * totalArc
  const targetAngle = startAngle + (Math.min(9, Math.max(0, target)) / 9) * totalArc

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const pt = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(toRad(angle)),
    y: cy + radius * Math.sin(toRad(angle)),
  })

  const arcPath = (from: number, to: number, r: number) => {
    const s = pt(from, r), e = pt(to, r)
    const large = to - from > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }

  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28">
      <path d={arcPath(startAngle, startAngle + totalArc, r)} fill="none" className="stroke-divider-soft" strokeWidth="7" strokeLinecap="round" />
      {score !== null && score > 0 && (
        <path d={arcPath(startAngle, scoreAngle, r)} fill="none" stroke="#DC2626" strokeWidth="7" strokeLinecap="round" />
      )}
      <path d={arcPath(scoreAngle, targetAngle, r)} fill="none" className="stroke-electric-dim" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 3" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={score !== null ? 18 : 16} fontWeight="700" className="fill-ink" fontFamily="Roboto Mono">
        {score !== null ? score.toFixed(1) : '—'}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" className="fill-subtle" fontFamily="Roboto Mono">
        {score !== null ? '/ 9.0' : 'No Attempts'}
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="6.5" className="fill-muted" fontFamily="Manrope, sans-serif">
        {score !== null ? 'Overall' : 'Diagnostic Pending'}
      </text>
    </svg>
  )
}

const DEFAULT_SKILLS = [
  { skill: 'Reading', score: null, hasAttempts: false, attemptsCount: 0, target: 8.0, color: '#94A3B8', bg: '#F1F5F9' },
  { skill: 'Listening', score: null, hasAttempts: false, attemptsCount: 0, target: 8.0, color: '#94A3B8', bg: '#F1F5F9' },
  { skill: 'Writing', score: null, hasAttempts: false, attemptsCount: 0, target: 8.0, color: '#94A3B8', bg: '#F1F5F9' },
  { skill: 'Speaking', score: null, hasAttempts: false, attemptsCount: 0, target: 8.0, color: '#94A3B8', bg: '#F1F5F9' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [newTask, setNewTask] = useState('')
  const [examResults, setExamResults] = useState<StoredExamResult[]>([])
  const [selectedResultId, setSelectedResultId] = useState<string>('')

  // Load live data from backend
  useEffect(() => {
    const loadData = () => {
      // Always apply the response: null means there are no results left, so old stats must be cleared
      fetchDashboardStats(user?.email, user?.targetBand).then(setStats).catch(() => {})

      fetchTasks(user?.id).then(setTasks).catch(() => {})

      fetchResults(user?.email, user?.id).then(results => {
        setExamResults(results)
        if (results.length > 0) setSelectedResultId(results[0].id)
        else setSelectedResultId('')
      }).catch(() => {})
    }

    loadData()

    window.addEventListener('vistora:result-saved', loadData)
    window.addEventListener('storage', loadData)
    return () => {
      window.removeEventListener('vistora:result-saved', loadData)
      window.removeEventListener('storage', loadData)
    }
  }, [user?.email, user?.id, user?.targetBand])

  const addTask = async (event: FormEvent) => {
    event.preventDefault()
    const title = newTask.trim()
    if (!title) return
    try {
      const task = await createTask(title, 'Today', user?.id)
      setTasks(current => [task, ...current])
    } catch {
      const localTask: StudyTask = { id: Date.now(), title, due: 'Today', complete: false }
      setTasks(current => [localTask, ...current])
    }
    setNewTask('')
  }

  const toggleTask = async (id: number, currentComplete: boolean) => {
    setTasks(current => current.map(t => t.id === id ? { ...t, complete: !currentComplete } : t))
    try {
      await toggleTaskComplete(id, !currentComplete, user?.id)
    } catch {}
  }

  const deleteTask = async (id: number) => {
    setTasks(current => current.filter(t => t.id !== id))
    try {
      await deleteTaskApi(id, user?.id)
    } catch {}
  }

  const completedTasks = tasks.filter(task => task.complete).length
  const selectedResult = examResults.find(result => result.id === selectedResultId) || examResults[0]

  const scoredAttempts = examResults.filter(r => typeof r.overallBand === 'number' && r.overallBand > 0)
  const overallBand: number | null = stats?.overallBand && stats.overallBand > 0
    ? stats.overallBand
    : scoredAttempts.length > 0
      ? scoredAttempts.reduce((s, r) => s + (r.overallBand || 0), 0) / scoredAttempts.length
      : null
  const targetBand = stats?.targetBand ?? (user?.targetBand || 8.0)
  const skillScores = stats?.skillScores ?? DEFAULT_SKILLS.map(skill => ({ ...skill, target: targetBand }))
  const activities = stats?.recentActivities ?? []
  const weeklyProgress = stats?.weeklyProgress ?? [
    { day: 'Mon', mins: 65 }, { day: 'Tue', mins: 90 }, { day: 'Wed', mins: 45 },
    { day: 'Thu', mins: 120 }, { day: 'Fri', mins: 80 }, { day: 'Sat', mins: 30 }, { day: 'Sun', mins: 15 }
  ]
  const maxMins = Math.max(...weeklyProgress.map(d => d.mins), 1)

  const firstName = user?.name ? user.name.split(' ')[0] : 'Learner'

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <div className="label-tag mb-1">STUDENT DASHBOARD · ACADEMIC PREPARATION</div>
          <h1 className="text-2xl font-bold text-ink plex tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-sm text-muted mt-0.5">
            Current Overall Band:{' '}
            <span className="mono text-accent font-semibold">
              {overallBand !== null ? overallBand.toFixed(1) : '— (No attempts yet)'}
            </span>{' '}
            · Target:{' '}
            <span className="mono text-ink font-medium">{targetBand.toFixed(1)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NavLink
            to="/practice"
            className="bg-[#DC2626] text-white text-xs font-semibold px-4 py-2.5 hover:bg-[#B91C1C] transition-colors shadow-sm"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}
          >
            <Icon name="headphones" /> Start Listening Practice
          </NavLink>
          <NavLink
            to="/writing"
            className="bg-navy text-white text-xs font-semibold px-4 py-2.5 hover:bg-navy-mid transition-colors shadow-sm"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}
          >
            <Icon name="pen" /> AI Essay Evaluation
          </NavLink>
          <NavLink
            to="/documents"
            className="border border-divider bg-surface text-ink text-xs font-semibold px-4 py-2.5 hover:border-line-strong hover:bg-surface-2 transition-colors shadow-sm"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}
          >
            <Icon name="file" /> AI Doc Generator
          </NavLink>
        </div>
      </div>

      {/* Top row: band + skills */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 mb-4">
        {/* Overall Band card */}
        <div className="bg-surface border border-divider p-6 w-full lg:w-64 corner-mark" style={{ borderRadius: 4 }}>
          <div className="label-tag mb-4">OVERALL BAND SCORE</div>
          <div className="flex flex-col items-center">
            <BandArc score={overallBand} target={targetBand} />
            <div className="mt-3 text-center">
              <div className="text-[11px] text-subtle">
                Target: <span className="mono text-accent font-medium">{targetBand.toFixed(1)}</span>
              </div>
              <div className="text-[11px] text-subtle mt-0.5">
                Gap:{' '}
                <span className="mono text-accent-2 font-medium">
                  {overallBand !== null
                    ? (targetBand > overallBand ? `+${(targetBand - overallBand).toFixed(1)}` : 'Target Met ✓')
                    : `Goal: ${targetBand.toFixed(1)}`}
                </span>
              </div>
            </div>
          </div>
          <div className="blueprint-rule mt-4" />
          <div className="mt-3 space-y-2">
            <div className="mono text-[10px] text-subtle tracking-widest">PROGRESS TOWARDS GOAL</div>
            <div className="prog-bar">
              <div className="prog-bar-fill bg-[#DC2626]" style={{ width: overallBand !== null ? `${Math.min(100, (overallBand / targetBand) * 100)}%` : '0%' }} />
            </div>
            <div className="mono text-[11px] text-graphite">
              {overallBand !== null ? `${Math.min(100, Math.round((overallBand / targetBand) * 100))}% — ` : '0% — '}
              <span className="text-positive font-medium">{overallBand !== null ? 'Active Track' : 'Start First Practice Test'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Skill breakdown */}
        <div className="bg-surface border border-divider" style={{ borderRadius: 4 }}>
          <div className="px-6 py-4 border-b border-divider-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-1 h-4 bg-[#DC2626]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-ink plex">Live Skill Breakdown (Computed from Your Attempts)</span>
            </div>
            <span className="mono text-[10px] text-subtle">{examResults.length} test records evaluated</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-divider-soft">
            {skillScores.map(s => {
              const hasScore = s.hasAttempts && typeof s.score === 'number' && s.score > 0
              const scoreVal = hasScore ? (s.score as number) : 0
              const linkPath = s.skill === 'Listening' ? '/practice'
                             : s.skill === 'Reading' ? '/practice'
                             : s.skill === 'Writing' ? '/writing'
                             : '/practice'
              const linkAction = s.skill === 'Listening' ? 'Start listening test →'
                               : s.skill === 'Reading' ? 'Start reading test →'
                               : s.skill === 'Writing' ? 'Evaluate an essay →'
                               : 'Take speaking interview →'

              return (
                <div key={s.skill} className="bg-surface p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink-2 plex">{s.skill}</span>
                        {s.hasAttempts && s.attemptsCount ? (
                          <span className="mono text-[9px] px-1.5 py-0.5 bg-paper text-subtle border border-divider-soft rounded">
                            {s.attemptsCount} {s.attemptsCount === 1 ? 'record' : 'records'}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="mono text-xs text-subtle">Target: {s.target.toFixed(1)}</span>
                        {hasScore ? (
                          <span className="mono text-base font-bold" style={{ color: themeText(s.color) }}>
                            Band {scoreVal.toFixed(1)}
                          </span>
                        ) : (
                          <span className="mono text-[11px] text-subtle font-medium px-2 py-0.5 bg-surface-2 rounded border border-divider-soft">
                            Unassessed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="prog-bar mb-2">
                      <div
                        className="prog-bar-fill transition-all duration-500"
                        style={{
                          width: `${hasScore ? (scoreVal / 9) * 100 : 0}%`,
                          background: hasScore ? s.color : '#E2E8F0'
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="prog-bar flex-1 mr-2" style={{ height: 2 }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${(s.target / 9) * 100}%`,
                            background: themeBg('#E2E8F0'),
                            borderRadius: 1
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-subtle">
                        {hasScore ? (
                          scoreVal < s.target
                            ? `+${(s.target - scoreVal).toFixed(1)} needed`
                            : 'Target met ✓'
                        ) : (
                          <NavLink to={linkPath} className="text-accent hover:underline font-medium">
                            {linkAction}
                          </NavLink>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Middle row: Activities & Study Time */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 mb-4">
        {/* Recent activities from real test attempts */}
        <div className="bg-surface border border-divider" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-divider-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-ink plex">Recent Activity & Submissions</span>
            </div>
            <NavLink to="/results" className="text-[11px] text-accent hover:underline">
              View full report →
            </NavLink>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-divider-faint">
                {['TYPE', 'ACTIVITY', 'SCORE', 'TIME', 'STATUS'].map(h => (
                  <th key={h} className="mono text-[9px] text-faint tracking-widest font-medium text-left px-5 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                activities.map(a => (
                  <tr key={a.id} className="border-b border-divider-faint hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3">
                      <span className="mono text-[9px] font-medium px-1.5 py-0.5"
                        style={{
                          borderRadius: 2,
                          color: themeText(a.type === 'Writing' ? '#BE123C' : a.type === 'Test' ? '#0F172A' : '#DC2626'),
                          background: themeBg(a.type === 'Writing' ? '#FFE4E6' : a.type === 'Test' ? '#F1F5F9' : '#FEE2E2'),
                        }}>
                        {a.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-ink-2 font-medium">{a.title}</td>
                    <td className="px-5 py-3 mono text-[12px] text-graphite font-semibold">{a.score}</td>
                    <td className="px-5 py-3 mono text-[11px] text-subtle">{a.time}</td>
                    <td className="px-5 py-3">
                      <span className="mono text-[9px] px-2 py-0.5 border tracking-widest rounded bg-emerald-50 text-emerald-800 border-emerald-200">
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-subtle">
                    No exam activity recorded yet. Start your first practice session!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Weekly study time */}
        <div className="bg-surface border border-divider p-5" style={{ borderRadius: 4 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-4 bg-[#DC2626]" style={{ borderRadius: 1 }} />
            <span className="text-sm font-semibold text-ink plex">Study Time</span>
          </div>
          <div className="label-tag mb-3">THIS WEEK · {weeklyProgress.reduce((a, b) => a + b.mins, 0)} MINS TOTAL</div>
          <div className="flex items-end justify-between h-24 gap-1.5 mb-2">
            {weeklyProgress.map(d => (
              <div key={d.day} className="flex flex-col items-center flex-1 gap-1">
                <div className="w-full relative flex-1 flex items-end">
                  <div
                    className="w-full transition-all duration-700"
                    style={{
                      height: d.mins ? `${(d.mins / maxMins) * 100}%` : '4px',
                      background: d.mins >= 90 ? '#DC2626' : themeBg(d.mins ? '#FEE2E2' : '#F1F5F9'),
                      borderRadius: '2px 2px 0 0',
                      minHeight: 4,
                    }}
                  />
                </div>
                <span className="mono text-[9px] text-faint">{d.day[0]}</span>
              </div>
            ))}
          </div>
          <div className="blueprint-rule mt-3 mb-3" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[11px] text-muted">Daily avg this week</span>
              <span className="mono text-[11px] text-graphite font-medium">
                {Math.round(weeklyProgress.reduce((a, b) => a + b.mins, 0) / 7)} min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-muted">Active streak</span>
              <span className="mono text-[11px] text-accent-2 font-medium">6 days active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-muted">Tests completed</span>
              <span className="mono text-[11px] text-graphite font-medium">{examResults.length} sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Recommendations */}
      {stats?.recommendations && stats.recommendations.length > 0 && (
        <div className="mb-4 bg-surface border border-divider p-5" style={{ borderRadius: 4 }}>
          <div className="label-tag mb-3">ADAPTIVE AI RECOMMENDATIONS FOR YOUR SCORE</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stats.recommendations.map(rec => (
              <div key={rec.title} className="p-4 border border-divider rounded-sm flex flex-col justify-between hover:border-electric transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="mono text-[9px] px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-bold">{rec.priority}</span>
                  </div>
                  <h3 className="font-plex text-sm font-bold text-ink">{rec.title}</h3>
                  <p className="mt-1 text-xs text-graphite-mid leading-5">{rec.desc}</p>
                </div>
                <NavLink to={rec.link} className="mt-4 text-xs font-semibold text-accent hover:underline block">
                  Start Practice →
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study task tracker */}
      <div className="bg-surface border border-divider mb-4" style={{ borderRadius: 4 }}>
        <div className="px-5 py-4 border-b border-divider-soft flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1 h-4 bg-[#DC2626]" style={{ borderRadius: 1 }} />
            <span className="text-sm font-semibold text-ink plex">Study Task Tracker</span>
            <span className="mono text-[9px] text-accent bg-electric-dim px-2 py-0.5" style={{ borderRadius: 2 }}>LIVE SYNC</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 prog-bar">
              <div className="prog-bar-fill bg-[#DC2626]" style={{ width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%` }} />
            </div>
            <span className="mono text-[10px] text-muted">{completedTasks}/{tasks.length} complete</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
          <form onSubmit={addTask} className="p-5 border-b lg:border-b-0 lg:border-r border-divider-soft">
            <label htmlFor="new-study-task" className="label-tag">ADD A STUDY TASK</label>
            <textarea
              id="new-study-task"
              value={newTask}
              onChange={event => setNewTask(event.target.value)}
              placeholder="e.g. Listen to Cambridge 18 Test 2 Part 3"
              rows={3}
              className="mt-3 w-full resize-none border border-divider bg-surface-2 px-3 py-2.5 text-[12px] leading-relaxed text-ink outline-none focus:border-[#DC2626]"
              style={{ borderRadius: 3 }}
            />
            <button
              type="submit"
              disabled={!newTask.trim()}
              className="mt-2 w-full bg-navy px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-mid disabled:opacity-40"
              style={{ borderRadius: 3, fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              Add Task
            </button>
            <p className="mt-3 text-[10px] leading-relaxed text-subtle">Tasks are synchronized dynamically with your platform backend.</p>
          </form>

          <div className="divide-y divide-divider-soft">
            {tasks.length ? tasks.map(task => (
              <div key={task.id} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2">
                <button
                  type="button"
                  aria-label={task.complete ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                  onClick={() => toggleTask(task.id, task.complete)}
                  className={`h-5 w-5 flex-shrink-0 border flex items-center justify-center mono text-[10px] transition-colors ${task.complete ? 'border-[#DC2626] bg-[#DC2626] text-white' : 'border-line-strong bg-surface text-transparent hover:border-[#DC2626]'}`}
                  style={{ borderRadius: 2 }}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`text-[12px] font-medium transition-colors ${task.complete ? 'text-subtle line-through' : 'text-ink-2'}`}>{task.title}</div>
                  <div className="mono text-[9px] text-subtle mt-0.5">{task.due.toUpperCase()}</div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="mono text-[9px] text-faint opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-accent transition-all"
                >
                  REMOVE
                </button>
              </div>
            )) : (
              <div className="flex min-h-40 flex-col items-center justify-center p-6 text-center">
                <div className="mono text-xs font-semibold text-ink">ALL CLEAR</div>
                <p className="mt-1 text-[11px] text-subtle">Add your next study task to keep momentum.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exam results review */}
      <div className="bg-surface border border-divider mb-4" style={{ borderRadius: 4 }}>
        <div className="px-5 py-4 border-b border-divider-soft flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
            <span className="text-sm font-semibold text-ink plex">Live Exam Results Archive</span>
            <span className="mono text-[9px] text-accent-2 bg-violet-dim px-2 py-0.5" style={{ borderRadius: 2 }}>{examResults.length} RECORDED</span>
          </div>
          <NavLink to="/results" className="mono text-[10px] text-accent hover:underline">Full diagnostic reports →</NavLink>
        </div>

        {selectedResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
            <div className="border-b lg:border-b-0 lg:border-r border-divider-soft">
              {examResults.map(result => (
                <button
                  key={result.id}
                  onClick={() => setSelectedResultId(result.id)}
                  className={`w-full text-left p-4 border-b border-divider-faint transition-colors flex items-start justify-between ${selectedResultId === result.id ? 'bg-surface-2 border-l-2 border-l-[#DC2626]' : 'hover:bg-surface-2'}`}
                >
                  <div>
                    <div className="text-xs font-semibold text-ink plex">{result.testTitle}</div>
                    <div className="mono text-[10px] text-subtle mt-1">
                      {new Date(result.completedAt).toLocaleDateString()} · {result.testType}
                    </div>
                  </div>
                  <span className="mono text-xs font-bold text-accent">
                    {result.overallBand !== null
                      ? `Band ${result.overallBand}`
                      : result.correctAnswers !== undefined && result.totalQuestions
                        ? `${result.correctAnswers}/${result.totalQuestions}`
                        : 'Pending'}
                  </span>
                </button>
              ))}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-divider-soft">
                <div>
                  <div className="label-tag mb-1">{selectedResult.source.toUpperCase()} EVALUATION</div>
                  <h3 className="text-base font-bold text-ink plex">{selectedResult.testTitle}</h3>
                </div>
                <div className="text-right">
                  <div className="mono text-2xl font-bold text-accent">
                    {selectedResult.overallBand !== null ? selectedResult.overallBand.toFixed(1) : '—'}
                  </div>
                  <div className="mono text-[9px] text-subtle">OVERALL BAND</div>
                </div>
              </div>
              <p className="mt-4 text-xs leading-6 text-ink-4">{selectedResult.comment}</p>
              {selectedResult.correctAnswers !== undefined && (
                <div className="mt-4 p-3 bg-surface-2 border border-divider rounded flex items-center justify-between">
                  <span className="text-xs font-medium text-ink">Raw Score: {selectedResult.correctAnswers} / {selectedResult.totalQuestions}</span>
                  <span className="mono text-xs font-bold text-accent">
                    {Math.round((selectedResult.correctAnswers / (selectedResult.totalQuestions || 1)) * 100)}% Accuracy
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-subtle">No test results saved yet.</div>
        )}
      </div>
    </div>
  )
}
