import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/authContext'
import { ThemeToggle } from '../lib/theme'

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/practice', label: 'Practice Tests' },
  { to: '/exam-dates', label: 'Exam Dates' },
  { to: '/results', label: 'Results' },
  { to: '/writing', label: 'AI Writing' },
  { to: '/documents', label: 'Doc Generator' },
  { to: '/resources', label: 'Resources' },
  { to: '/community', label: 'Community' },
]

const FOOTER_LINKS = [
  {
    title: 'Platform',
    links: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Practice Tests', to: '/practice' },
      { label: 'Results', to: '/results' },
      { label: 'Official Exam Dates', to: '/exam-dates' },
    ],
  },
  {
    title: 'AI Tools',
    links: [
      { label: 'Writing Evaluation', to: '/writing' },
      { label: 'Document Generator', to: '/documents' },
      { label: 'Student Profile', to: '/profile' },
    ],
  },
  {
    title: 'Learning',
    links: [
      { label: 'Resource Library', to: '/resources' },
      { label: 'Community Forum', to: '/community' },
      { label: 'Admin Console', to: '/admin' },
    ],
  },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const isLanding = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  const isDarkHeader = isLanding || isAuthPage
  const showGuestLandingNav = isLanding && !isAuthenticated
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ST'

  useEffect(() => {
    setMobileOpen(false)
    setAccountOpen(false)
  }, [location.pathname])

  const signOut = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper-grid">
      {/* Top accent bar */}
      <div className="h-[2px] bg-gradient-to-r from-[#DC2626] via-[#BE123C] to-[#DC2626] fixed top-0 left-0 right-0 z-50" />

      {/* Header */}
      <header className={`fixed top-[2px] left-0 right-0 z-40 border-b ${isDarkHeader ? 'bg-[#0F172A]/95 border-[#1E293B]' : 'bg-surface/95 border-divider'} backdrop-blur-sm`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Wordmark */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-[#DC2626] flex items-center justify-center" style={{ borderRadius: 3, clipPath: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 12H1L7 1Z" fill="white" />
                <path d="M7 5L10 11H4L7 5Z" fill="#FCA5A5" />
              </svg>
            </div>
            <div>
              <span className={`font-bold text-sm tracking-tight ${isDarkHeader ? 'text-white' : 'text-ink'}`} style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Vistora</span>
              <span className="mono text-[10px] text-accent ml-1 tracking-widest">AI</span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {showGuestLandingNav ? (
              <>
                <a href="#features" className="px-3 py-2 text-[11px] text-subtle hover:text-white tracking-wider uppercase font-medium transition-colors" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Features</a>
                <a href="#how-it-works" className="px-3 py-2 text-[11px] text-subtle hover:text-white tracking-wider uppercase font-medium transition-colors" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>How It Works</a>
                <a href="#testimonials" className="px-3 py-2 text-[11px] text-subtle hover:text-white tracking-wider uppercase font-medium transition-colors" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Testimonials</a>
              </>
            ) : isAuthPage ? null : (
              NAV.map(n => (
                <NavLink key={n.to} to={n.to}
                  className={({ isActive }) =>
                    `px-3 py-2 text-[11px] tracking-wider uppercase font-medium transition-colors border-b-2 ${
                      isActive
                        ? 'text-accent border-[#DC2626]'
                        : isDarkHeader
                          ? 'text-slate-300 border-transparent hover:text-white hover:border-[#DC2626]/40'
                          : 'text-muted border-transparent hover:text-ink'
                    }`
                  }
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                >{n.label}</NavLink>
              ))
            )}
          </nav>

          <div className="flex items-center gap-2">
            {/* Right actions */}
            <div className="hidden sm:flex items-center gap-2">
              {!isAuthenticated ? (
                <>
                  <NavLink to="/login" className={`text-[11px] font-medium px-3 py-2 transition-colors ${isDarkHeader ? 'text-subtle hover:text-white' : 'text-muted hover:text-ink'}`} style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Sign In</NavLink>
                  <NavLink to="/signup" className="text-[11px] font-semibold text-white bg-[#DC2626] px-4 py-2 hover:bg-[#B91C1C] transition-colors" style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 3 }}>
                    Create Account
                  </NavLink>
                </>
              ) : (
                <>
                  <div className="w-px h-5 bg-divider" />
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Open account options"
                      aria-expanded={accountOpen}
                      onClick={() => setAccountOpen(open => !open)}
                      className="flex items-center gap-2 border border-transparent p-1 transition-colors hover:border-divider"
                      style={{ borderRadius: 4 }}
                    >
                      <span className="w-8 h-8 bg-violet-dim border border-rose-line flex items-center justify-center text-accent-2 text-xs font-bold" style={{ borderRadius: 4 }}>
                        {initials}
                      </span>
                      <span className="hidden xl:block text-left">
                        <span className={`block text-[10px] font-semibold ${isDarkHeader ? 'text-white' : 'text-ink'}`}>{user?.name || 'My Account'}</span>
                        <span className="block mono text-[8px] uppercase tracking-wider text-subtle">{user?.role || 'Student'} account</span>
                      </span>
                      <span className={`mono text-[9px] ${isDarkHeader ? 'text-slate-400' : 'text-subtle'}`}>⌄</span>
                    </button>
                    {accountOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 border border-divider bg-surface p-2 shadow-xl z-50" style={{ borderRadius: 4 }}>
                        <div className="border-b border-divider-soft px-3 py-2">
                          <div className="text-xs font-semibold text-ink">{user?.name}</div>
                          <div className="mt-0.5 text-[10px] text-subtle truncate">{user?.email}</div>
                        </div>
                        <NavLink to="/profile" className="mt-1 flex items-center justify-between px-3 py-2.5 text-xs text-graphite hover:bg-surface-2">
                          <span>Profile & Settings</span><span className="mono text-[9px] text-accent uppercase">{user?.role || 'STUDENT'}</span>
                        </NavLink>
                        <NavLink to="/dashboard" className="flex items-center justify-between px-3 py-2.5 text-xs text-graphite hover:bg-surface-2">
                          <span>Dashboard</span><span className="mono text-[9px] text-positive">BAND {user?.currentBand || 7.0}</span>
                        </NavLink>
                        {user?.role === 'Admin' && (
                          <NavLink to="/admin" className="flex items-center justify-between px-3 py-2.5 text-xs text-graphite hover:bg-surface-2">
                            <span>Admin console</span><span className="mono text-[9px] text-accent-2">ADMIN</span>
                          </NavLink>
                        )}
                        <button type="button" onClick={signOut} className="mt-1 block w-full border-t border-divider-soft px-3 py-2.5 text-left text-xs font-medium text-accent hover:bg-electric-soft">
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <ThemeToggle className={isDarkHeader ? 'border-[#334155] text-[#CBD5E1] hover:text-white hover:border-[#475569]' : 'border-divider text-muted hover:text-ink hover:border-line-strong'} />
            <button
              type="button"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(open => !open)}
              className={`lg:hidden h-9 w-9 border flex flex-col items-center justify-center gap-1 transition-colors ${
                isDarkHeader ? 'border-[#334155] text-white' : 'border-divider text-ink'
              }`}
              style={{ borderRadius: 3 }}
            >
              <span className="h-px w-4 bg-current" />
              <span className="h-px w-4 bg-current" />
              <span className="h-px w-4 bg-current" />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className={`lg:hidden border-t px-4 py-3 ${isDarkHeader ? 'border-[#1E293B] bg-[#0F172A]' : 'border-divider bg-surface'}`}>
            <nav className="grid gap-1">
              {!isAuthenticated ? (
                <>
                  {isLanding && [['Features', '#features'], ['How It Works', '#how-it-works'], ['Testimonials', '#testimonials']].map(([label, href]) => (
                    <a key={href} href={href} onClick={() => setMobileOpen(false)} className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-subtle hover:text-white">{label}</a>
                  ))}
                  <NavLink to="/login" className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-subtle hover:text-white">Sign in</NavLink>
                  <NavLink to="/signup" className="mt-2 bg-[#DC2626] px-3 py-3 text-center text-xs font-semibold text-white" style={{ borderRadius: 3 }}>Create account</NavLink>
                </>
              ) : (
                <>
                  {NAV.map(item => (
                    <NavLink key={item.to} to={item.to} className={({ isActive }) => `border-l-2 px-3 py-3 text-xs font-medium uppercase tracking-wider ${isActive ? 'border-[#DC2626] bg-electric-dim text-accent' : isDarkHeader ? 'border-transparent text-slate-300 hover:text-white' : 'border-transparent text-muted'}`}>{item.label}</NavLink>
                  ))}
                  <NavLink to="/profile" className={`border-l-2 border-transparent px-3 py-3 text-xs font-medium uppercase tracking-wider ${isDarkHeader ? 'text-slate-300 hover:text-white' : 'text-muted'}`}>Profile</NavLink>
                  {user?.role === 'Admin' && (
                    <NavLink to="/admin" className="border-l-2 border-transparent px-3 py-3 text-xs font-medium uppercase tracking-wider text-accent-2">Admin console</NavLink>
                  )}
                  <button type="button" onClick={signOut} className={`mt-2 border px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider ${isDarkHeader ? 'border-[#334155] text-white hover:bg-white/10' : 'border-divider text-ink'}`} style={{ borderRadius: 3 }}>Sign out</button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Page content */}
      <main key={location.pathname} className="flex-1 pt-[calc(2px+56px)] anim-page">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="theme-fixed bg-navy border-t border-[#1E293B] mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-[#DC2626] flex items-center justify-center" style={{ borderRadius: 3 }}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 12H1L7 1Z" fill="white" /><path d="M7 5L10 11H4L7 5Z" fill="#FCA5A5" /></svg>
                </div>
                <span className="text-white font-bold text-sm plex">Vistora AI</span>
              </div>
              <p className="text-ink-4 text-[11px] leading-relaxed">AI-powered IELTS preparation platform for ambitious learners worldwide.</p>
            </div>
            {FOOTER_LINKS.map(col => (
              <div key={col.title}>
                <div className="mono text-[10px] text-ink-4 tracking-widest mb-3">{col.title.toUpperCase()}</div>
                {col.links.map(link => <NavLink key={link.to} to={link.to} className="block text-muted text-[11px] hover:text-subtle transition-colors mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>{link.label}</NavLink>)}
              </div>
            ))}
          </div>
          <div className="blueprint-rule mb-4" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="mono text-[10px] text-ink-3">© 2026 VISTORA AI · ALL RIGHTS RESERVED</span>
            <span className="mono text-[10px] text-ink-3">IELTS PREPARATION PLATFORM · CSE412 EAST WEST UNIVERSITY</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
