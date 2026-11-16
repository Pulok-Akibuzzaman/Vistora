import { FormEvent, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../lib/authContext'

type AuthMode = 'login' | 'signup'

const TARGET_BANDS = [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0] as const
const MODULES = ['Academic', 'General Training'] as const
const TIMELINES = ['Within 1 month', '1–3 months', '3–6 months', 'Not scheduled yet'] as const
const COUNTRIES = ['United Kingdom', 'Canada', 'Australia', 'United States', 'Germany', 'Other'] as const
const FOCUS_AREAS = ['Speaking', 'Writing', 'Reading', 'Listening', 'All Skills'] as const

export default function Auth({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, signup } = useAuth()
  const isSignup = mode === 'signup'

  // Signup step: 1 = Credentials, 2 = IELTS Goals
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    targetBand: 7.5,
    examModule: 'Academic' as (typeof MODULES)[number],
    targetCountry: 'United Kingdom',
    targetTimeline: '1–3 months',
    primaryFocus: 'Speaking',
  })

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must contain at least six characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('The passwords do not match.')
      return
    }
    setStep(2)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!form.email.trim() || form.password.length < 6) {
      setError('Enter a valid email and a password containing at least six characters.')
      return
    }

    setSubmitting(true)
    try {
      if (isSignup) {
        await signup({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          targetBand: form.targetBand,
          examModule: form.examModule,
          targetCountry: form.targetCountry,
          targetTimeline: form.targetTimeline,
          primaryFocus: form.primaryFocus,
        })
      } else {
        await login(form.email.trim(), form.password)
      }
      const destination = (location.state as { from?: string } | null)?.from || '/dashboard'
      navigate(destination, { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-58px)] lg:grid-cols-2">
      {/* Left Promotional Banner */}
      <section className="theme-fixed hidden bg-navy-grid p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="font-mono text-xs uppercase tracking-widest text-electric-light">Vistora AI · IELTS preparation</div>
        <div className="max-w-lg">
          <div className="mb-6 h-1 w-16 bg-electric" />
          <h1 className="font-plex text-4xl font-bold leading-tight">
            Prepare with structure.<br />Improve with evidence.
          </h1>
          <p className="mt-5 text-sm leading-7 text-graphite-light">
            Timed IELTS practice, automatic objective scoring, AI speech & writing evaluations, official British Council exam dates, and progress tracking in one focused workspace.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 border-t border-navy-light pt-6">
          {[['04', 'Skills'], ['40+', 'Questions'], ['Puku AI', 'Evaluator']].map(([value, label]) => (
            <div key={label}>
              <div className="font-mono text-xl font-bold text-electric-light">{value}</div>
              <div className="mt-1 font-mono text-xs uppercase text-graphite-light">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Right Form Container */}
      <section className="flex items-center justify-center bg-paper px-4 py-12 sm:px-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="label-tag">
            {isSignup
              ? step === 1
                ? 'CREATE STUDENT ACCOUNT · STEP 1 OF 2'
                : 'IELTS STUDY GOALS · STEP 2 OF 2'
              : 'WELCOME BACK'}
          </div>
          <h2 className="mt-3 font-plex text-3xl font-bold text-ink">
            {isSignup
              ? step === 1
                ? 'Start preparing for IELTS'
                : 'Personalize your target goals'
              : 'Sign in to your workspace'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-graphite-mid">
            {isSignup
              ? step === 1
                ? 'Create your free account to track practice scores, essays, and speaking audio.'
                : 'Tell us your target score and exam format to calibrate your AI practice tests.'
              : 'Access your practice tests, results, tasks, and AI tools.'}
          </p>

          {/* Stepper Progress Bar */}
          {isSignup && (
            <div className="mt-6 flex items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-electric' : 'bg-divider'}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-colors ${step === 2 ? 'bg-electric' : 'bg-divider'}`} />
            </div>
          )}

          {/* =============================================================== */}
          {/* SIGN UP - STEP 1 (Credentials)                                  */}
          {/* =============================================================== */}
          {isSignup && step === 1 && (
            <form onSubmit={handleNextStep} className="mt-6 space-y-4">
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Full name</span>
                <input
                  autoComplete="name"
                  value={form.name}
                  onChange={e => setForm(c => ({ ...c, name: e.target.value }))}
                  className="mt-2 w-full rounded-sm border border-divider bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-electric"
                  placeholder="e.g. Ayaan Rahman"
                  required
                />
              </label>

              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Email address</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm(c => ({ ...c, email: e.target.value }))}
                  className="mt-2 w-full rounded-sm border border-divider bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-electric"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e => setForm(c => ({ ...c, password: e.target.value }))}
                    className="mt-2 w-full rounded-sm border border-divider bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-electric"
                    placeholder="Min 6 characters"
                    required
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Confirm password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={e => setForm(c => ({ ...c, confirmPassword: e.target.value }))}
                    className="mt-2 w-full rounded-sm border border-divider bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-electric"
                    placeholder="Repeat password"
                    required
                  />
                </label>
              </div>

              {error && <div role="alert" className="border-l-2 border-danger bg-danger/5 p-3 text-sm text-accent">{error}</div>}

              <button
                type="submit"
                className="w-full rounded-card bg-electric px-5 py-3.5 font-plex text-sm font-semibold text-white shadow-sm transition-colors hover:bg-electric-light"
              >
                Continue to IELTS Goals →
              </button>
            </form>
          )}

          {/* =============================================================== */}
          {/* SIGN UP - STEP 2 (IELTS Goals)                                  */}
          {/* =============================================================== */}
          {isSignup && step === 2 && (
            <form onSubmit={submit} className="mt-6 space-y-5">
              {/* Target Band Score */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs uppercase tracking-wider text-graphite-light">
                    Target IELTS Band Score
                  </label>
                  <span className="font-mono text-sm font-bold text-rose-600">
                    Band {form.targetBand.toFixed(1)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TARGET_BANDS.map(band => (
                    <button
                      key={band}
                      type="button"
                      onClick={() => setForm(c => ({ ...c, targetBand: band }))}
                      className={`flex-1 rounded-sm border py-2 text-center font-mono text-xs font-semibold transition-all ${
                        form.targetBand === band
                          ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                          : 'border-divider bg-surface text-ink hover:border-graphite'
                      }`}
                    >
                      {band.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Module */}
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-graphite-light">
                  IELTS Module
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {MODULES.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm(c => ({ ...c, examModule: m }))}
                      className={`rounded-sm border p-3 text-left transition-all ${
                        form.examModule === m
                          ? 'border-electric bg-electric/10 text-accent-strong font-bold'
                          : 'border-divider bg-surface text-graphite hover:border-graphite-light'
                      }`}
                    >
                      <div className="font-plex text-sm">{m}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-graphite-light">
                        {m === 'Academic' ? 'University & scholarships' : 'Work & migration'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Country & Timeline */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-graphite-light">
                    Target Country
                  </label>
                  <select
                    value={form.targetCountry}
                    onChange={e => setForm(c => ({ ...c, targetCountry: e.target.value }))}
                    className="mt-2 w-full rounded-sm border border-divider bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-electric"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-graphite-light">
                    Test Timeline
                  </label>
                  <select
                    value={form.targetTimeline}
                    onChange={e => setForm(c => ({ ...c, targetTimeline: e.target.value }))}
                    className="mt-2 w-full rounded-sm border border-divider bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-electric"
                  >
                    {TIMELINES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Primary Focus Area */}
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-graphite-light">
                  Primary Focus / Weakest Area
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {FOCUS_AREAS.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setForm(c => ({ ...c, primaryFocus: area }))}
                      className={`rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors ${
                        form.primaryFocus === area
                          ? 'border-navy bg-navy text-white font-semibold'
                          : 'border-divider bg-surface text-graphite hover:border-graphite'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div role="alert" className="border-l-2 border-danger bg-danger/5 p-3 text-sm text-accent">{error}</div>}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-card border border-divider bg-surface px-4 py-3 font-plex text-sm font-semibold text-graphite transition-colors hover:bg-surface-2"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-card bg-electric px-5 py-3 font-plex text-sm font-semibold text-white shadow-sm transition-colors hover:bg-electric-light disabled:opacity-50"
                >
                  {submitting ? 'Creating account...' : 'Create Account & Start Learning'}
                </button>
              </div>
            </form>
          )}

          {/* =============================================================== */}
          {/* SIGN IN VIEW                                                    */}
          {/* =============================================================== */}
          {!isSignup && (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Email address</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                  className="mt-2 w-full rounded-sm border border-divider bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-electric"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                  className="mt-2 w-full rounded-sm border border-divider bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-electric"
                  placeholder="Your password"
                  required
                />
              </label>

              {error && <div role="alert" className="border-l-2 border-danger bg-danger/5 p-3 text-sm text-accent">{error}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-card bg-electric px-5 py-3.5 font-plex text-sm font-semibold text-white transition-colors hover:bg-electric-light disabled:opacity-50"
              >
                {submitting ? 'Please wait...' : 'Sign in'}
              </button>
            </form>
          )}

          {/* Footer Toggle */}
          <div className="mt-6 border-t border-divider pt-5 text-center text-sm text-graphite-mid">
            {isSignup ? 'Already have an account?' : 'New to Vistora AI?'}{' '}
            <NavLink to={isSignup ? '/login' : '/signup'} className="font-semibold text-accent hover:underline">
              {isSignup ? 'Sign in' : 'Create an account'}
            </NavLink>
          </div>
          <p className="mt-5 text-center font-mono text-xs leading-5 text-graphite-light">
            Full-stack account authentication connected to your local backend server.
          </p>
        </div>
      </section>
    </main>
  )
}

