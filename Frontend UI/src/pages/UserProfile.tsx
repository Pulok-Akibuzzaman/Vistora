import { NavLink } from 'react-router'

const ACHIEVEMENTS = [
  { icon: 'B7', title: 'First Band 7', desc: 'Achieved Band 7 on a practice test', earned: true, date: '2026-08-14' },
  { icon: '30', title: '30-Day Streak', desc: 'Studied for 30 consecutive days', earned: true, date: '2026-09-01' },
  { icon: '50', title: 'Essay Veteran', desc: 'Submitted 50 essays for evaluation', earned: true, date: '2026-09-10' },
  { icon: 'RS', title: 'Resource Scholar', desc: 'Read 100 study materials', earned: false, progress: 74 },
  { icon: 'B8', title: 'Band 8 Club', desc: 'Achieve Band 8.0 on any test', earned: false, progress: 85 },
  { icon: 'CL', title: 'Community Leader', desc: 'Receive 100 upvotes on forum posts', earned: false, progress: 42 },
]

const HISTORY = [
  { date: '2026-09-23', activity: 'Writing Evaluation — Task 2: Crime & Punishment', score: '7.5', type: 'Writing' },
  { date: '2026-09-22', activity: 'Reading Practice — Passage 3: Renewable Energy', score: '8/13', type: 'Reading' },
  { date: '2026-09-21', activity: 'Full Mock Test #5 — Academic Module', score: '7.25', type: 'Full Test' },
  { date: '2026-09-20', activity: 'Listening — Section 4: Urban Planning Lecture', score: '9/10', type: 'Listening' },
  { date: '2026-09-19', activity: 'Writing Evaluation — Task 1: Bar Chart', score: '7.0', type: 'Writing' },
  { date: '2026-09-18', activity: 'Resource: Academic Word List Sub-list 1', score: '—', type: 'Resource' },
  { date: '2026-09-17', activity: 'Full Mock Test #4 — Academic Module', score: '6.75', type: 'Full Test' },
]

const BAND_HISTORY = [
  { month: 'Apr', score: 5.5 }, { month: 'May', score: 6.0 }, { month: 'Jun', score: 6.0 },
  { month: 'Jul', score: 6.5 }, { month: 'Aug', score: 6.75 }, { month: 'Sep', score: 6.875 },
]

function BandProgressChart() {
  const w = 360, h = 80, pad = { l: 30, r: 16, t: 12, b: 22 }
  const min = 5, max = 8
  const xs = BAND_HISTORY.map((_, i) => pad.l + (i / (BAND_HISTORY.length - 1)) * (w - pad.l - pad.r))
  const ys = BAND_HISTORY.map(d => pad.t + ((max - d.score) / (max - min)) * (h - pad.t - pad.b))
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  const area = path + ` L${xs[xs.length - 1].toFixed(1)},${(h - pad.b).toFixed(1)} L${xs[0].toFixed(1)},${(h - pad.b).toFixed(1)} Z`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <defs>
        <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BE123C" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#BE123C" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[5.5, 6, 6.5, 7].map(v => {
        const y = pad.t + ((max - v) / (max - min)) * (h - pad.t - pad.b)
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#F1F5F9" strokeWidth="1" />
            <text x={pad.l - 4} y={y + 4} textAnchor="end" fontSize="8" fill="#CBD5E1" fontFamily="IBM Plex Mono">{v}</text>
          </g>
        )
      })}
      <path d={area} fill="url(#bandGrad)" />
      <path d={path} fill="none" stroke="#BE123C" strokeWidth="2" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r="3" fill="#BE123C" />
          <text x={x} y={h - 4} textAnchor="middle" fontSize="8" fill="#CBD5E1" fontFamily="IBM Plex Mono">{BAND_HISTORY[i].month}</text>
        </g>
      ))}
    </svg>
  )
}

export default function UserProfile() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Profile header */}
      <div className="bg-white border border-[#E2E8F0] p-6 mb-4 corner-mark" style={{ borderRadius: 4 }}>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 bg-[#FFE4E6] border-2 border-[#FECDD3] flex items-center justify-center text-[#BE123C] text-xl font-bold" style={{ borderRadius: 5 }}>AR</div>
          <div className="flex-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#0F172A] plex">Ayaan Rahman</h1>
                <div className="text-sm text-[#64748B] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>ayaan.rahman@email.com</div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="mono text-[10px] text-[#94A3B8] border border-[#E2E8F0] px-2 py-0.5" style={{ borderRadius: 2 }}>Bangladesh</span>
                  <span className="mono text-[10px] text-[#94A3B8] border border-[#E2E8F0] px-2 py-0.5" style={{ borderRadius: 2 }}>IELTS Academic</span>
                  <span className="mono text-[10px] text-white bg-[#BE123C] px-2 py-0.5" style={{ borderRadius: 2 }}>STUDENT</span>
                </div>
              </div>
              <button className="border border-[#E2E8F0] text-[#64748B] text-xs px-4 py-2 hover:border-[#CBD5E1] transition-colors" style={{ borderRadius: 3, fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Edit Profile
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t border-[#F1F5F9]">
              {[
                ['CURRENT BAND', '6.88'],
                ['TARGET BAND', '8.0'],
                ['DAYS ACTIVE', '127'],
                ['ESSAYS SUBMITTED', '52'],
                ['TESTS COMPLETED', '18'],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="mono text-[9px] text-[#CBD5E1] tracking-widest">{l}</div>
                  <div className="mono text-lg font-bold text-[#0F172A] mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <div className="space-y-4">
          {/* Band progression */}
          <div className="bg-white border border-[#E2E8F0] p-5" style={{ borderRadius: 4 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-[#0F172A] plex">Band Score Progression</span>
              <span className="ml-auto mono text-[10px] text-[#94A3B8]">APR — SEP 2026</span>
            </div>
            <BandProgressChart />
            <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
              <div><div className="mono text-[10px] text-[#94A3B8]">IMPROVEMENT</div><div className="mono font-semibold text-[#059669]">+1.375 bands</div></div>
              <div className="text-right"><div className="mono text-[10px] text-[#94A3B8]">PROJECTED BY EXAM</div><div className="mono font-semibold text-[#BE123C]">7.5 – 8.0</div></div>
            </div>
          </div>

          {/* Learning history */}
          <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
            <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center gap-3">
              <span className="w-1 h-4 bg-[#DC2626]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-[#0F172A] plex">Learning History</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F8FAFC]">
                  {['DATE', 'ACTIVITY', 'SCORE', 'TYPE'].map(h => (
                    <th key={h} className="mono text-[9px] text-[#CBD5E1] tracking-widest text-left px-5 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((h, i) => (
                  <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                    <td className="mono text-[11px] text-[#94A3B8] px-5 py-3">{h.date}</td>
                    <td className="text-[12px] text-[#374151] px-5 py-3" style={{ fontFamily: 'Inter, sans-serif' }}>{h.activity}</td>
                    <td className="mono text-[12px] text-[#374151] font-semibold px-5 py-3">{h.score}</td>
                    <td className="px-5 py-3">
                      <span className="mono text-[9px] px-1.5 py-0.5" style={{
                        borderRadius: 2,
                        color: h.type === 'Writing' ? '#BE123C' : h.type === 'Full Test' ? '#0F172A' : h.type === 'Resource' ? '#059669' : '#DC2626',
                        background: h.type === 'Writing' ? '#FFE4E6' : h.type === 'Full Test' ? '#F1F5F9' : h.type === 'Resource' ? '#F0FDF4' : '#FEE2E2',
                      }}>{h.type.toUpperCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Exam info */}
          <div className="bg-[#0F172A] bg-navy-grid p-5" style={{ borderRadius: 4 }}>
            <div className="label-tag text-[#475569] mb-4">EXAM REGISTRATION</div>
            <div className="space-y-3">
              {[['Test Date', '15 Nov 2026'], ['Location', 'British Council, Dhaka'], ['Test Type', 'IELTS Academic'], ['Days Remaining', '53']].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="text-[11px] text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</span>
                  <span className={`mono text-[11px] font-semibold ${l === 'Days Remaining' ? 'text-[#F87171]' : 'text-white'}`}>{v}</span>
                </div>
              ))}
            </div>
            <NavLink to="/exam-dates" className="block mt-4 text-center mono text-[10px] text-[#DC2626] border border-[#1E3A5F] py-2 hover:bg-[#1E293B] transition-colors" style={{ borderRadius: 3 }}>
              View Official Test Dates →
            </NavLink>
          </div>

          {/* Achievements */}
          <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
            <div className="px-4 py-4 border-b border-[#F1F5F9] flex items-center gap-2">
              <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-[#0F172A] plex">Achievements</span>
              <span className="mono text-[10px] text-[#94A3B8] ml-auto">3/6 earned</span>
            </div>
            <div className="p-4 space-y-3">
              {ACHIEVEMENTS.map(a => (
                <div key={a.title} className={`flex items-start gap-3 p-3 border ${a.earned ? 'border-[#E2E8F0] bg-[#F8FAFC]' : 'border-dashed border-[#F1F5F9]'}`} style={{ borderRadius: 3, opacity: a.earned ? 1 : 0.7 }}>
                  <span className={`text-xl ${!a.earned && 'grayscale opacity-40'}`}>{a.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[12px] font-semibold text-[#0F172A] plex">{a.title}</span>
                      {a.earned && <span className="mono text-[9px] text-white bg-[#059669] px-1.5 py-0.5" style={{ borderRadius: 2 }}>EARNED</span>}
                    </div>
                    <span className="text-[10px] text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>{a.desc}</span>
                    {!a.earned && a.progress && (
                      <div className="mt-1.5">
                        <div className="prog-bar"><div className="prog-bar-fill bg-[#BE123C]" style={{ width: `${a.progress}%` }} /></div>
                        <span className="mono text-[9px] text-[#CBD5E1] mt-0.5 block">{a.progress}%</span>
                      </div>
                    )}
                    {a.earned && <div className="mono text-[9px] text-[#CBD5E1] mt-0.5">{a.date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
