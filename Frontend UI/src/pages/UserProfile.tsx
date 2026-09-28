import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'
import { useAuth } from '../lib/authContext'
import { fetchResults, type StoredExamResult } from '../lib/api'

export default function UserProfile() {
  const { user, updateProfile } = useAuth()
  const [results, setResults] = useState<StoredExamResult[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    country: user?.country || 'Bangladesh',
    targetBand: user?.targetBand || 8.0,
    institution: user?.institution || 'East West University',
    bio: user?.bio || '',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchResults().then(setResults).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        country: user.country || 'Bangladesh',
        targetBand: user.targetBand || 8.0,
        institution: user.institution || 'East West University',
        bio: user.bio || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(editForm)
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  // Calculate dynamic stats
  const testsCompleted = results.filter(r => r.testType !== 'Writing').length
  const essaysSubmitted = results.filter(r => r.testType === 'Writing').length
  
  const scoreAttempts = results.filter(r => typeof r.overallBand === 'number')
  const calculatedCurrentBand = scoreAttempts.length > 0
    ? (scoreAttempts.reduce((acc, r) => acc + (r.overallBand || 0), 0) / scoreAttempts.length).toFixed(2)
    : (user?.currentBand || 7.0).toFixed(2)

  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ST'

  // Dynamic band trajectory
  const bandHistory = scoreAttempts.slice(0, 6).reverse().map((r, i) => ({
    label: `T${i + 1}`,
    score: r.overallBand || 6.5,
  }))

  const minBand = 5.0
  const maxBand = 9.0

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Profile header */}
      <div className="bg-surface border border-divider p-6 mb-4 corner-mark" style={{ borderRadius: 4 }}>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 bg-violet-dim border-2 border-rose-line flex items-center justify-center text-accent-2 text-xl font-bold" style={{ borderRadius: 5 }}>
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-ink plex">{user?.name}</h1>
                <div className="text-sm text-muted mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{user?.email}</div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="mono text-[10px] text-muted border border-divider px-2 py-0.5" style={{ borderRadius: 2 }}>{user?.country || 'Bangladesh'}</span>
                  <span className="mono text-[10px] text-muted border border-divider px-2 py-0.5" style={{ borderRadius: 2 }}>{user?.institution || 'East West University'}</span>
                  <span className="mono text-[10px] text-white bg-[#BE123C] px-2 py-0.5 uppercase tracking-wider" style={{ borderRadius: 2 }}>{user?.role || 'STUDENT'}</span>
                </div>
                {user?.bio && (
                  <p className="mt-3 text-xs leading-5 text-ink-4 max-w-2xl">{user.bio}</p>
                )}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="border border-divider text-ink font-semibold text-xs px-4 py-2 hover:bg-surface-2 transition-colors shadow-sm"
                style={{ borderRadius: 3, fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                ✏️ Edit Profile
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t border-divider-soft">
              {[
                ['CURRENT BAND', calculatedCurrentBand],
                ['TARGET BAND', (user?.targetBand || 8.0).toFixed(1)],
                ['TESTS COMPLETED', String(testsCompleted)],
                ['ESSAYS EVALUATED', String(essaysSubmitted)],
                ['TOTAL ATTEMPTS', String(results.length)],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="mono text-[9px] text-subtle tracking-widest">{l}</div>
                  <div className="mono text-lg font-bold text-ink mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-sm border border-divider bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h2 className="font-plex text-lg font-bold text-ink">Edit Your Profile</h2>
              <button onClick={() => setIsEditing(false)} className="text-graphite hover:text-ink text-sm font-mono">✕</button>
            </div>
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">Full Name</label>
                <input
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase text-graphite-light">Country</label>
                  <input
                    value={editForm.country}
                    onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                    className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase text-graphite-light">Target Band</label>
                  <select
                    value={editForm.targetBand}
                    onChange={e => setEditForm({ ...editForm, targetBand: Number(e.target.value) })}
                    className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric bg-surface"
                  >
                    {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(b => (
                      <option key={b} value={b}>Band {b.toFixed(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">Institution / University</label>
                <input
                  value={editForm.institution}
                  onChange={e => setEditForm({ ...editForm, institution: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric"
                  placeholder="e.g. East West University"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">Study Goal / Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric"
                  placeholder="Share your IELTS target and study objectives..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-sm border border-divider px-4 py-2 text-xs font-semibold text-graphite hover:bg-surface-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-sm bg-electric px-5 py-2 text-xs font-semibold text-white hover:bg-electric-light disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Left column */}
        <div className="space-y-4">
          {/* Real Activity History */}
          <div className="bg-surface border border-divider" style={{ borderRadius: 4 }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-divider-soft">
              <div>
                <div className="label-tag mb-0.5">EXAM & PRACTICE HISTORY</div>
                <h2 className="text-sm font-semibold text-ink plex">Recent Attempt Records ({results.length})</h2>
              </div>
              <NavLink to="/results" className="mono text-[11px] text-accent hover:underline">
                View All Results →
              </NavLink>
            </div>
            <div className="divide-y divide-divider-faint">
              {results.slice(0, 6).map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-surface-2 transition-colors">
                  <div>
                    <div className="text-xs font-semibold text-ink plex">{item.testTitle}</div>
                    <div className="mono text-[10px] text-subtle mt-1">
                      {new Date(item.completedAt).toLocaleDateString()} · {item.testType} · {item.source}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="mono text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                      {item.overallBand !== null ? `Band ${item.overallBand}` : `${item.correctAnswers}/${item.totalQuestions}`}
                    </span>
                  </div>
                </div>
              ))}
              {results.length === 0 && (
                <div className="p-8 text-center text-sm text-subtle">
                  No attempts recorded yet. <NavLink to="/practice" className="text-accent font-semibold underline">Take a test</NavLink> to see your progress here!
                </div>
              )}
            </div>
          </div>

          {/* IELTS Target & Milestones */}
          <div className="bg-surface border border-divider p-5" style={{ borderRadius: 4 }}>
            <div className="label-tag mb-3">STUDY MILESTONES & ACHIEVEMENTS</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Baseline Established', desc: 'Completed initial diagnostic assessment', earned: results.length > 0 },
                { title: 'Listening Specialist', desc: 'Achieved Band 7.5+ in Listening exam', earned: results.some(r => r.testType === 'Listening' && (r.overallBand || 0) >= 7.5) },
                { title: 'Essay Submitter', desc: 'Submitted at least one writing evaluation', earned: essaysSubmitted > 0 },
                { title: 'Band 8 Target Club', desc: `Targeting Band ${(user?.targetBand || 8.0).toFixed(1)} for international graduate entry`, earned: true },
              ].map(ach => (
                <div key={ach.title} className={`p-3 border rounded-sm flex items-start gap-3 ${ach.earned ? 'border-emerald-200 bg-emerald-50/50' : 'border-divider bg-surface-2 opacity-60'}`}>
                  <span className="text-lg">{ach.earned ? '🏆' : '🔒'}</span>
                  <div>
                    <div className="text-xs font-semibold text-ink">{ach.title}</div>
                    <div className="text-[11px] text-muted mt-0.5">{ach.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Band Trajectory & Actions */}
        <div className="space-y-4">
          {/* Band Progress Chart */}
          <div className="bg-surface border border-divider p-5" style={{ borderRadius: 4 }}>
            <div className="label-tag mb-1">SCORE TRAJECTORY</div>
            <h3 className="text-sm font-semibold text-ink plex mb-3">Band Score History</h3>
            {bandHistory.length > 1 ? (
              <div className="space-y-2">
                {bandHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-8 font-mono text-[10px] text-subtle">{item.label}</span>
                    <div className="flex-1 bg-surface-3 h-3 rounded overflow-hidden">
                      <div
                        className="bg-rose-600 h-full rounded transition-all duration-500"
                        style={{ width: `${((item.score - minBand) / (maxBand - minBand)) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-ink w-8 text-right">{item.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-subtle">
                Take 2 or more tests to plot your live score trajectory chart.
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-divider-soft flex justify-between items-center text-xs">
              <span className="text-muted">Target Band:</span>
              <span className="font-mono font-bold text-rose-600">{user?.targetBand?.toFixed(1) || '8.0'}</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-surface border border-divider p-5 space-y-2.5" style={{ borderRadius: 4 }}>
            <div className="label-tag mb-2">QUICK ACTIONS</div>
            <NavLink to="/practice" className="block w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold text-center rounded transition-colors">
              🎧 Start Cambridge Listening Test
            </NavLink>
            <NavLink to="/writing" className="block w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold text-center rounded transition-colors">
              ✍️ AI Writing Evaluation
            </NavLink>
            <NavLink to="/documents" className="block w-full py-2.5 px-3 border border-divider hover:bg-surface-2 text-ink text-xs font-semibold text-center rounded transition-colors">
              📄 Generate SOP / CV
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}
