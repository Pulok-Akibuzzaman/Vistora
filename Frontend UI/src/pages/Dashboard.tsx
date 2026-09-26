import { NavLink } from 'react-router'
import { FormEvent, useEffect, useState } from 'react'
import { getExamResults } from '../lib/results'

const SKILL_SCORES = [
  { skill: 'Reading', score: 7.0, target: 7.5, color: '#DC2626', bg: '#FEE2E2' },
  { skill: 'Listening', score: 7.5, target: 8.0, color: '#BE123C', bg: '#FFE4E6' },
  { skill: 'Writing', score: 6.5, target: 7.0, color: '#DC2626', bg: '#FEE2E2' },
  { skill: 'Speaking', score: 6.0, target: 7.0, color: '#BE123C', bg: '#FFE4E6' },
]

const ACTIVITIES = [
  { type: 'Writing', title: 'Task 2: Environmental Policy Essay', score: '6.5', time: '2h ago', status: 'evaluated' },
  { type: 'Reading', title: 'Academic Reading — Passage 3', score: '8/13', time: '5h ago', status: 'complete' },
  { type: 'Listening', title: 'Section 4 — Lecture: Urban Planning', score: '9/10', time: '1d ago', status: 'complete' },
  { type: 'Test', title: 'Full Mock Test #4 — Academic', score: '6.75', time: '2d ago', status: 'complete' },
  { type: 'Writing', title: 'Task 1: Bar Chart Description', score: '7.0', time: '3d ago', status: 'evaluated' },
]

const RECOMMENDATIONS = [
  { title: 'Improve Coherence & Cohesion', desc: 'Your Writing Task 2 essays lack clear topic sentences. Practice paragraph structuring with our guided exercises.', priority: 'HIGH', link: '/writing' },
  { title: 'Expand Academic Vocabulary', desc: 'Increase your Academic Word List coverage — target 500 words from AWL Sub-list 1–4 before your exam.', priority: 'MEDIUM', link: '/resources' },
  { title: 'Speaking Fluency Drills', desc: 'Your Speaking Part 2 timing needs improvement. Complete three timed monologue exercises this week.', priority: 'MEDIUM', link: '/practice' },
]

const WEEKLY_PROGRESS = [
  { day: 'Mon', mins: 65 }, { day: 'Tue', mins: 90 }, { day: 'Wed', mins: 45 },
  { day: 'Thu', mins: 120 }, { day: 'Fri', mins: 80 }, { day: 'Sat', mins: 30 }, { day: 'Sun', mins: 0 },
]

const maxMins = Math.max(...WEEKLY_PROGRESS.map(d => d.mins))

type StudyTask = {
  id: number
  title: string
  due: string
  complete: boolean
}

const DEFAULT_TASKS: StudyTask[] = [
  { id: 1, title: 'Complete Listening Test 1 · Part 2', due: 'Today', complete: false },
  { id: 2, title: 'Review mistakes from Reading Passage 1', due: 'Tomorrow', complete: false },
  { id: 3, title: 'Write one Task 2 introduction', due: 'This week', complete: true },
]

function BandArc({ score, target }: { score: number; target: number }) {
  const r = 42, cx = 50, cy = 50
  const startAngle = -210
  const totalArc = 240
  const scoreAngle = startAngle + (score / 9) * totalArc
  const targetAngle = startAngle + (target / 9) * totalArc

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
      <path d={arcPath(startAngle, startAngle + totalArc, r)} fill="none" stroke="#F1F5F9" strokeWidth="7" strokeLinecap="round" />
      <path d={arcPath(startAngle, scoreAngle, r)} fill="none" stroke="#DC2626" strokeWidth="7" strokeLinecap="round" />
      <path d={arcPath(scoreAngle, targetAngle, r)} fill="none" stroke="#FEE2E2" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 3" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="#0F172A" fontFamily="IBM Plex Mono">{score.toFixed(1)}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" fill="#94A3B8" fontFamily="IBM Plex Mono">/ 9.0</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="6.5" fill="#64748B" fontFamily="Inter, sans-serif">Overall</text>
    </svg>
  )
}

const overallBand = (SKILL_SCORES.reduce((a, s) => a + s.score, 0) / 4).toFixed(1)
const targetBand = (SKILL_SCORES.reduce((a, s) => a + s.target, 0) / 4).toFixed(1)

export default function Dashboard() {
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = window.localStorage.getItem('vistora-study-tasks')
      return saved ? JSON.parse(saved) : DEFAULT_TASKS
    } catch {
      return DEFAULT_TASKS
    }
  })
  const [newTask, setNewTask] = useState('')
  const [examResults] = useState(getExamResults)
  const [selectedResultId, setSelectedResultId] = useState(() => getExamResults()[0]?.id || '')

  useEffect(() => {
    window.localStorage.setItem('vistora-study-tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (event: FormEvent) => {
    event.preventDefault()
    const title = newTask.trim()
    if (!title) return
    setTasks(current => [...current, { id: Date.now(), title, due: 'Not scheduled', complete: false }])
    setNewTask('')
  }

  const completedTasks = tasks.filter(task => task.complete).length
  const selectedResult = examResults.find(result => result.id === selectedResultId) || examResults[0]

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <div className="label-tag mb-1">STUDENT DASHBOARD · ACADEMIC MODULE</div>
          <h1 className="text-2xl font-bold text-[#0F172A] plex tracking-tight">Welcome back, Ayaan</h1>
          <p className="text-sm text-[#64748B] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Exam date: <span className="mono text-[#374151] font-medium">2026-11-15</span> — <span className="text-[#DC2626] font-medium">53 days remaining</span>
          </p>
        </div>
        <NavLink to="/practice"
          className="bg-[#DC2626] text-white text-xs font-semibold px-5 py-2.5 hover:bg-[#B91C1C] transition-colors"
          style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}>
          + Start Practice Session
        </NavLink>
      </div>

      {/* Top row: band + skills */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 mb-4">
        {/* Overall Band card */}
        <div className="bg-white border border-[#E2E8F0] p-6 w-64 corner-mark" style={{ borderRadius: 4 }}>
          <div className="label-tag mb-4">OVERALL BAND SCORE</div>
          <div className="flex flex-col items-center">
            <BandArc score={parseFloat(overallBand)} target={parseFloat(targetBand)} />
            <div className="mt-3 text-center">
              <div className="text-[11px] text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Target: <span className="mono text-[#DC2626] font-medium">{targetBand}</span>
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-0.5">Gap: <span className="mono text-[#BE123C] font-medium">+{(parseFloat(targetBand) - parseFloat(overallBand)).toFixed(1)}</span></div>
            </div>
          </div>
          <div className="blueprint-rule mt-4" />
          <div className="mt-3 space-y-2">
            <div className="mono text-[10px] text-[#94A3B8] tracking-widest">EXAM READINESS</div>
            <div className="prog-bar"><div className="prog-bar-fill bg-[#DC2626]" style={{ width: '74%' }} /></div>
            <div className="mono text-[11px] text-[#374151]">74% — <span className="text-[#64748B] font-normal">On Track</span></div>
          </div>
        </div>

        {/* Skill breakdown */}
        <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
          <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center gap-3">
            <span className="w-1 h-4 bg-[#DC2626]" style={{ borderRadius: 1 }} />
            <span className="text-sm font-semibold text-[#0F172A] plex">Skill Breakdown</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-y divide-[#F1F5F9]">
            {SKILL_SCORES.map(s => (
              <div key={s.skill} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#1E293B] plex">{s.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="mono text-xs text-[#94A3B8]">→ {s.target}</span>
                    <span className="mono text-base font-bold" style={{ color: s.color }}>{s.score}</span>
                  </div>
                </div>
                <div className="prog-bar mb-2">
                  <div className="prog-bar-fill" style={{ width: `${(s.score / 9) * 100}%`, background: s.color }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="prog-bar flex-1 mr-2" style={{ height: 2 }}>
                    <div className="h-full" style={{ width: `${(s.target / 9) * 100}%`, background: '#E2E8F0', borderRadius: 1 }} />
                  </div>
                  <span className="text-[10px] text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {s.score < s.target ? `+${(s.target - s.score).toFixed(1)} needed` : 'Target met ✓'}
                  </span>
                </div>

                {/* Micro-bars for sub-skills */}
                <div className="mt-3 space-y-1.5">
                  {s.skill === 'Writing' && [['Task 1', 0.72], ['Task 2', 0.65], ['Coherence', 0.60]].map(([l, v]) => (
                    <div key={l as string} className="flex items-center gap-2">
                      <span className="mono text-[9px] text-[#CBD5E1] w-16">{l as string}</span>
                      <div className="flex-1 h-1 bg-[#F1F5F9]" style={{ borderRadius: 1 }}>
                        <div className="h-full" style={{ width: `${(v as number) * 100}%`, background: s.color, opacity: 0.6, borderRadius: 1 }} />
                      </div>
                      <span className="mono text-[9px] text-[#94A3B8]">{((v as number) * 9).toFixed(1)}</span>
                    </div>
                  ))}
                  {s.skill === 'Reading' && [['True/False/NG', 0.75], ['MCQ', 0.82], ['Matching', 0.70]].map(([l, v]) => (
                    <div key={l as string} className="flex items-center gap-2">
                      <span className="mono text-[9px] text-[#CBD5E1] w-20 truncate">{l as string}</span>
                      <div className="flex-1 h-1 bg-[#F1F5F9]" style={{ borderRadius: 1 }}>
                        <div className="h-full" style={{ width: `${(v as number) * 100}%`, background: s.color, opacity: 0.6, borderRadius: 1 }} />
                      </div>
                      <span className="mono text-[9px] text-[#94A3B8]">{((v as number) * 9).toFixed(1)}</span>
                    </div>
                  ))}
                  {s.skill === 'Listening' && [['Section 1–2', 0.88], ['Section 3', 0.80], ['Section 4', 0.76]].map(([l, v]) => (
                    <div key={l as string} className="flex items-center gap-2">
                      <span className="mono text-[9px] text-[#CBD5E1] w-16">{l as string}</span>
                      <div className="flex-1 h-1 bg-[#F1F5F9]" style={{ borderRadius: 1 }}>
                        <div className="h-full" style={{ width: `${(v as number) * 100}%`, background: s.color, opacity: 0.6, borderRadius: 1 }} />
                      </div>
                      <span className="mono text-[9px] text-[#94A3B8]">{((v as number) * 9).toFixed(1)}</span>
                    </div>
                  ))}
                  {s.skill === 'Speaking' && [['Part 1', 0.72], ['Part 2', 0.60], ['Part 3', 0.65]].map(([l, v]) => (
                    <div key={l as string} className="flex items-center gap-2">
                      <span className="mono text-[9px] text-[#CBD5E1] w-12">{l as string}</span>
                      <div className="flex-1 h-1 bg-[#F1F5F9]" style={{ borderRadius: 1 }}>
                        <div className="h-full" style={{ width: `${(v as number) * 100}%`, background: s.color, opacity: 0.6, borderRadius: 1 }} />
                      </div>
                      <span className="mono text-[9px] text-[#94A3B8]">{((v as number) * 9).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 mb-4">
        {/* Recent activities */}
        <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-[#0F172A] plex">Recent Activity</span>
            </div>
            <span className="text-[11px] text-[#DC2626] cursor-pointer hover:underline" style={{ fontFamily: 'Inter, sans-serif' }}>View history →</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F8FAFC]">
                {['TYPE', 'ACTIVITY', 'SCORE', 'TIME', 'STATUS'].map(h => (
                  <th key={h} className="mono text-[9px] text-[#CBD5E1] tracking-widest font-medium text-left px-5 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIVITIES.map((a, i) => (
                <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <span className="mono text-[9px] font-medium px-1.5 py-0.5"
                      style={{
                        borderRadius: 2,
                        color: a.type === 'Writing' ? '#BE123C' : a.type === 'Test' ? '#0F172A' : '#DC2626',
                        background: a.type === 'Writing' ? '#FFE4E6' : a.type === 'Test' ? '#F1F5F9' : '#FEE2E2',
                      }}>
                      {a.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#1E293B] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{a.title}</td>
                  <td className="px-5 py-3 mono text-[12px] text-[#374151] font-semibold">{a.score}</td>
                  <td className="px-5 py-3 mono text-[11px] text-[#94A3B8]">{a.time}</td>
                  <td className="px-5 py-3">
                    <span className={`mono text-[9px] px-2 py-0.5 border tracking-widest`}
                      style={{ borderRadius: 2, color: '#059669', background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                      {a.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Weekly study time */}
        <div className="bg-white border border-[#E2E8F0] p-5" style={{ borderRadius: 4 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-4 bg-[#DC2626]" style={{ borderRadius: 1 }} />
            <span className="text-sm font-semibold text-[#0F172A] plex">Study Time</span>
          </div>
          <div className="label-tag mb-3">THIS WEEK · 430 MINS TOTAL</div>
          <div className="flex items-end justify-between h-24 gap-1.5 mb-2">
            {WEEKLY_PROGRESS.map(d => (
              <div key={d.day} className="flex flex-col items-center flex-1 gap-1">
                <div className="w-full relative flex-1 flex items-end">
                  <div
                    className="w-full transition-all duration-700"
                    style={{
                      height: d.mins ? `${(d.mins / maxMins) * 100}%` : '4px',
                      background: d.day === 'Thu' ? '#DC2626' : d.mins ? '#FEE2E2' : '#F1F5F9',
                      borderRadius: '2px 2px 0 0',
                      minHeight: 4,
                    }}
                  />
                </div>
                <span className="mono text-[9px] text-[#CBD5E1]">{d.day[0]}</span>
              </div>
            ))}
          </div>
          <div className="blueprint-rule mt-3 mb-3" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[11px] text-[#64748B]" style={{ fontFamily: 'Inter, sans-serif' }}>Daily avg this week</span>
              <span className="mono text-[11px] text-[#374151] font-medium">61 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-[#64748B]" style={{ fontFamily: 'Inter, sans-serif' }}>Streak</span>
              <span className="mono text-[11px] text-[#BE123C] font-medium">6 days · active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-[#64748B]" style={{ fontFamily: 'Inter, sans-serif' }}>Sessions completed</span>
              <span className="mono text-[11px] text-[#374151] font-medium">14 / 21</span>
            </div>
          </div>
        </div>
      </div>

      {/* Study task tracker */}
      <div className="bg-white border border-[#E2E8F0] mb-4" style={{ borderRadius: 4 }}>
        <div className="px-5 py-4 border-b border-[#F1F5F9] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1 h-4 bg-[#DC2626]" style={{ borderRadius: 1 }} />
            <span className="text-sm font-semibold text-[#0F172A] plex">Study Task Tracker</span>
            <span className="mono text-[9px] text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5" style={{ borderRadius: 2 }}>SAVED LOCALLY</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 prog-bar">
              <div className="prog-bar-fill bg-[#DC2626]" style={{ width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%` }} />
            </div>
            <span className="mono text-[10px] text-[#64748B]">{completedTasks}/{tasks.length} complete</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
          <form onSubmit={addTask} className="p-5 border-b lg:border-b-0 lg:border-r border-[#F1F5F9]">
            <label htmlFor="new-study-task" className="label-tag">ADD A STUDY TASK</label>
            <textarea
              id="new-study-task"
              value={newTask}
              onChange={event => setNewTask(event.target.value)}
              placeholder="e.g. Review questions 14–20"
              rows={3}
              className="mt-3 w-full resize-none border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[12px] leading-relaxed text-[#0F172A] outline-none focus:border-[#DC2626]"
              style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif' }}
            />
            <button
              type="submit"
              disabled={!newTask.trim()}
              className="mt-2 w-full bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1E293B] disabled:opacity-40"
              style={{ borderRadius: 3, fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              Add Task
            </button>
            <p className="mt-3 text-[10px] leading-relaxed text-[#94A3B8]">Tasks are stored in this browser and remain available when you return.</p>
          </form>

          <div className="divide-y divide-[#F1F5F9]">
            {tasks.length ? tasks.map(task => (
              <div key={task.id} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-[#F8FAFC]">
                <button
                  type="button"
                  aria-label={task.complete ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                  onClick={() => setTasks(current => current.map(item => item.id === task.id ? { ...item, complete: !item.complete } : item))}
                  className={`h-5 w-5 flex-shrink-0 border flex items-center justify-center mono text-[10px] transition-colors ${task.complete ? 'border-[#DC2626] bg-[#DC2626] text-white' : 'border-[#CBD5E1] bg-white text-transparent hover:border-[#DC2626]'}`}
                  style={{ borderRadius: 2 }}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`text-[12px] font-medium transition-colors ${task.complete ? 'text-[#94A3B8] line-through' : 'text-[#1E293B]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{task.title}</div>
                  <div className="mono text-[9px] text-[#94A3B8] mt-0.5">{task.due.toUpperCase()}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setTasks(current => current.filter(item => item.id !== task.id))}
                  className="mono text-[9px] text-[#CBD5E1] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-[#DC2626] transition-all"
                >
                  REMOVE
                </button>
              </div>
            )) : (
              <div className="flex min-h-40 flex-col items-center justify-center p-6 text-center">
                <div className="mono text-xs font-semibold text-[#0F172A]">ALL CLEAR</div>
                <p className="mt-1 text-[11px] text-[#94A3B8]">Add your next study task to keep momentum.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exam results */}
      <div className="bg-white border border-[#E2E8F0] mb-4" style={{ borderRadius: 4 }}>
        <div className="px-5 py-4 border-b border-[#F1F5F9] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
            <span className="text-sm font-semibold text-[#0F172A] plex">Exam Results</span>
            <span className="mono text-[9px] text-[#BE123C] bg-[#FFE4E6] px-2 py-0.5" style={{ borderRadius: 2 }}>{examResults.length} SAVED</span>
          </div>
          <NavLink to="/practice" className="mono text-[10px] text-[#DC2626] hover:underline">Take another test →</NavLink>
        </div>

        {selectedResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
            <div className="border-b lg:border-b-0 lg:border-r border-[#F1F5F9]">
              {examResults.map(result => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => setSelectedResultId(result.id)}
                  className={`w-full border-b border-[#F1F5F9] p-4 text-left transition-colors last:border-0 ${selectedResult.id === result.id ? 'bg-[#F8FAFC] border-l-2 border-l-[#BE123C]' : 'bg-white border-l-2 border-l-transparent hover:bg-[#F8FAFC]'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-plex text-[12px] font-semibold leading-snug text-[#0F172A]">{result.testTitle}</span>
                    <span className={`mono flex-shrink-0 text-sm font-bold ${result.overallBand === null ? 'text-[#94A3B8]' : 'text-[#BE123C]'}`}>{result.overallBand === null ? '—' : result.overallBand.toFixed(1)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="mono text-[9px] uppercase text-[#94A3B8]">{result.testType}</span>
                    <span className="mono text-[9px] text-[#CBD5E1]">{new Date(result.completedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="label-tag">SELECTED RESULT · {selectedResult.source.toUpperCase()}</div>
                  <h3 className="mt-2 font-plex text-base font-semibold text-[#0F172A]">{selectedResult.testTitle}</h3>
                  <p className="mt-1 text-[11px] text-[#94A3B8]">{new Date(selectedResult.completedAt).toLocaleString()}</p>
                </div>
                <div className="border-l-2 border-[#BE123C] pl-4">
                  <div className="mono text-[9px] uppercase tracking-widest text-[#94A3B8]">Estimated band</div>
                  <div className="mono text-3xl font-bold text-[#BE123C]">{selectedResult.overallBand === null ? 'Pending' : selectedResult.overallBand.toFixed(1)}</div>
                </div>
              </div>

              {selectedResult.skillBands && (
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {Object.entries(selectedResult.skillBands).map(([skill, band]) => (
                    <div key={skill} className="border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                      <div className="mono text-[9px] uppercase text-[#94A3B8]">{skill}</div>
                      <div className="mono mt-1 text-lg font-bold text-[#DC2626]">{band?.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedResult.correctAnswers !== undefined && (
                <div className="mt-5 flex items-center gap-4 border-y border-[#F1F5F9] py-3">
                  <div><span className="mono text-xl font-bold text-[#0F172A]">{selectedResult.correctAnswers}</span><span className="mono text-[10px] text-[#94A3B8]"> / {selectedResult.totalQuestions} correct</span></div>
                  <div className="prog-bar flex-1"><div className="prog-bar-fill bg-[#DC2626]" style={{ width: `${(selectedResult.correctAnswers / (selectedResult.totalQuestions || 1)) * 100}%` }} /></div>
                </div>
              )}

              <div className="mt-5 border-l-2 border-[#DC2626] bg-[#F8FAFC] p-4">
                <div className="mono text-[9px] uppercase tracking-wider text-[#DC2626]">COMMENTS</div>
                <p className="mt-2 text-[12px] leading-relaxed text-[#374151]">{selectedResult.comment}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="mono text-xs font-semibold text-[#0F172A]">NO RESULTS YET</div>
            <p className="mt-2 text-[11px] text-[#94A3B8]">Complete a practice test to create your first result.</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
        <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center gap-3">
          <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
          <span className="text-sm font-semibold text-[#0F172A] plex">AI Study Recommendations</span>
          <span className="mono text-[9px] text-[#BE123C] bg-[#FFE4E6] px-2 py-0.5 ml-1" style={{ borderRadius: 2 }}>PERSONALIZED</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-[#F1F5F9]">
          {RECOMMENDATIONS.map(r => (
            <div key={r.title} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[13px] font-semibold text-[#0F172A] plex leading-snug">{r.title}</span>
                <span className={`mono text-[9px] px-1.5 py-0.5 ml-2 flex-shrink-0`}
                  style={{ borderRadius: 2, color: r.priority === 'HIGH' ? '#DC2626' : '#D97706', background: r.priority === 'HIGH' ? '#FEF2F2' : '#FFFBEB' }}>
                  {r.priority}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>{r.desc}</p>
              <NavLink to={r.link} className="mono text-[10px] text-[#DC2626] hover:underline tracking-wide">
                Start Exercise →
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
