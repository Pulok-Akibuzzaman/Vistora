import { FormEvent, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router'

type AuthMode = 'login' | 'signup'

export default function Auth({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const isSignup = mode === 'signup'

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!form.email.trim() || form.password.length < 6) {
      setError('Enter a valid email and a password containing at least six characters.')
      return
    }
    if (isSignup && !form.name.trim()) {
      setError('Enter your full name.')
      return
    }
    if (isSignup && form.password !== form.confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    window.localStorage.setItem('vistora-auth-user', JSON.stringify({
      name: isSignup ? form.name.trim() : 'Ayaan Rahman',
      email: form.email.trim(),
      role: 'Student',
    }))
    const destination = (location.state as { from?: string } | null)?.from || '/dashboard'
    navigate(destination, { replace: true })
  }

  return (
    <main className="grid min-h-[calc(100vh-58px)] lg:grid-cols-2">
      <section className="hidden bg-navy-grid p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="font-mono text-xs uppercase tracking-widest text-electric-light">Vistora AI · IELTS preparation</div>
        <div className="max-w-lg">
          <div className="mb-6 h-1 w-16 bg-electric" />
          <h1 className="font-plex text-4xl font-bold leading-tight">Prepare with structure.<br />Improve with evidence.</h1>
          <p className="mt-5 text-sm leading-7 text-graphite-light">Timed IELTS 21 practice, automatic objective scoring, AI feedback, official exam-date links, and progress tracking in one focused workspace.</p>
        </div>
        <div className="grid grid-cols-3 gap-4 border-t border-navy-light pt-6">
          {[['04', 'Skills'], ['40+', 'Questions'], ['AI', 'Feedback']].map(([value, label]) => (
            <div key={label}><div className="font-mono text-xl font-bold text-electric-light">{value}</div><div className="mt-1 font-mono text-xs uppercase text-graphite-light">{label}</div></div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center bg-paper px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="label-tag">{isSignup ? 'CREATE STUDENT ACCOUNT' : 'WELCOME BACK'}</div>
          <h2 className="mt-3 font-plex text-3xl font-bold text-navy">{isSignup ? 'Start preparing for IELTS' : 'Sign in to your workspace'}</h2>
          <p className="mt-2 text-sm leading-6 text-graphite-mid">{isSignup ? 'Vistora AI is free to use. Create an account to save progress and results.' : 'Access your practice tests, results, tasks, and AI tools.'}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {isSignup && (
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Full name</span>
                <input autoComplete="name" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-sm border border-divider bg-white px-4 py-3 text-sm text-navy outline-none focus:border-electric" placeholder="Ayaan Rahman" />
              </label>
            )}
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Email address</span>
              <input type="email" autoComplete="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} className="mt-2 w-full rounded-sm border border-divider bg-white px-4 py-3 text-sm text-navy outline-none focus:border-electric" placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Password</span>
              <input type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} value={form.password} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} className="mt-2 w-full rounded-sm border border-divider bg-white px-4 py-3 text-sm text-navy outline-none focus:border-electric" placeholder="Minimum 6 characters" />
            </label>
            {isSignup && (
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">Confirm password</span>
                <input type="password" autoComplete="new-password" value={form.confirmPassword} onChange={event => setForm(current => ({ ...current, confirmPassword: event.target.value }))} className="mt-2 w-full rounded-sm border border-divider bg-white px-4 py-3 text-sm text-navy outline-none focus:border-electric" placeholder="Repeat your password" />
              </label>
            )}
            {error && <div role="alert" className="border-l-2 border-danger bg-danger/5 p-3 text-sm text-danger">{error}</div>}
            <button type="submit" className="w-full rounded-card bg-electric px-5 py-3.5 font-plex text-sm font-semibold text-white transition-colors hover:bg-electric-light">
              {isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 border-t border-divider pt-5 text-center text-sm text-graphite-mid">
            {isSignup ? 'Already have an account?' : 'New to Vistora AI?'}{' '}
            <NavLink to={isSignup ? '/login' : '/signup'} className="font-semibold text-electric hover:underline">
              {isSignup ? 'Sign in' : 'Create an account'}
            </NavLink>
          </div>
          <p className="mt-5 text-center font-mono text-xs leading-5 text-graphite-light">Demo authentication is stored in this browser. Connect your production identity provider before launch.</p>
        </div>
      </section>
    </main>
  )
}
