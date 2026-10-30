import { useEffect, useMemo, useState } from 'react'
import {
  fetchAllUsers,
  inviteUser,
  toggleUserStatus,
  fetchResults,
  fetchAudioCatalog,
  type UserProfile,
  type AudioCatalog,
} from '../lib/api'
import { useAuth } from '../lib/authContext'

export default function AdminDashboard() {
  const { user: currentAdmin } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [resultsCount, setResultsCount] = useState<number>(0)
  const [catalog, setCatalog] = useState<AudioCatalog | null>(null)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<'All' | 'Student' | 'Instructor' | 'Admin'>('All')

  // Invite user modal state
  const [inviteOpen, setInviteOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserCountry, setNewUserCountry] = useState('Bangladesh')
  const [newUserRole, setNewUserRole] = useState<'Student' | 'Instructor' | 'Admin'>('Student')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')

  useEffect(() => {
    fetchAllUsers().then(setUsers).catch(() => {})
    fetchResults().then(res => setResultsCount(res.length)).catch(() => {})
    fetchAudioCatalog().then(setCatalog).catch(() => {})
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesQuery = `${user.name} ${user.email} ${user.country}`.toLowerCase().includes(query.toLowerCase())
      return matchesQuery && (role === 'All' || user.role === role)
    })
  }, [query, role, users])

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await toggleUserStatus(id)
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)))
    } catch {}
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim() || !newUserEmail.trim()) return
    setInviting(true)
    setInviteError('')
    try {
      const created = await inviteUser({
        name: newUserName,
        email: newUserEmail,
        country: newUserCountry,
        role: newUserRole,
        status: 'Active',
      })
      setUsers(prev => [created, ...prev])
      setInviteOpen(false)
      setNewUserName('')
      setNewUserEmail('')
    } catch (err: any) {
      setInviteError(err?.message || 'Failed to create user')
    } finally {
      setInviting(false)
    }
  }

  const activeLearners = users.filter(u => u.status === 'Active' && u.role === 'Student').length
  const totalAudioTracks = catalog?.totalFiles || 73
  const availableBooks = catalog ? Object.keys(catalog.books).length : 4

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-divider pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label-tag mb-2">ADMIN CONSOLE · PLATFORM CONTROL</div>
          <h1 className="font-plex text-2xl font-bold tracking-tight text-ink">Workspace Administration</h1>
          <p className="mt-1 text-sm text-graphite-mid">Manage learners, staff access, exam modules, and platform activity.</p>
        </div>
        <div className="border-l-2 border-violet pl-3">
          <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">Signed in as</div>
          <div className="font-plex text-sm font-semibold text-ink">{currentAdmin?.name || 'Administrator'}</div>
        </div>
      </div>

      {/* Metrics Row */}
      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Registered users', String(users.length), `${users.filter(u => u.status === 'Active').length} Active`],
          ['Active learners', String(activeLearners), `${users.length ? Math.round((activeLearners / users.length) * 100) : 0}% of accounts`],
          ['Tests completed', String(resultsCount), 'Across all modules'],
          ['Indexed audio files', String(totalAudioTracks), `Cambridge Books ${availableBooks} online`],
        ].map(([label, value, detail], index) => (
          <div key={label} className="corner-mark border border-divider bg-surface p-5">
            <div className={`mb-4 h-1 w-8 ${index % 2 ? 'bg-violet' : 'bg-electric'}`} />
            <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">{label}</div>
            <div className="mt-1 font-mono text-2xl font-bold text-ink">{value}</div>
            <div className="mt-2 text-xs text-graphite-mid">{detail}</div>
          </div>
        ))}
      </section>

      {/* Invite User Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-sm border border-divider bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h2 className="font-plex text-lg font-bold text-ink">Invite / Create Platform User</h2>
              <button onClick={() => setInviteOpen(false)} className="text-graphite hover:text-ink text-sm font-mono">✕</button>
            </div>
            <form onSubmit={handleInviteUser} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">Full Name</label>
                <input
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="e.g. Farhan Chowdhury"
                  className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="e.g. farhan@email.com"
                  className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase text-graphite-light">Country</label>
                  <input
                    value={newUserCountry}
                    onChange={e => setNewUserCountry(e.target.value)}
                    className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase text-graphite-light">Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as any)}
                    className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric bg-surface"
                  >
                    <option value="Student">Student</option>
                    <option value="Instructor">Instructor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              {inviteError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded">
                  {inviteError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="rounded-sm border border-divider px-4 py-2 text-xs font-semibold text-graphite hover:bg-surface-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="rounded-sm bg-electric px-5 py-2 text-xs font-semibold text-white hover:bg-electric-light disabled:opacity-50"
                >
                  {inviting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: User Table & Audio Catalog Overview */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <section className="border border-divider bg-surface">
          <div className="border-b border-divider p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-plex text-sm font-semibold text-ink">Platform User Accounts</h2>
                <p className="mt-1 text-xs text-graphite-light">{filteredUsers.length} accounts matching filters</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search by name, email, country..."
                  className="rounded-sm border border-divider bg-surface-2 px-3 py-2 text-xs text-ink outline-none focus:border-electric"
                />
                <select
                  value={role}
                  onChange={event => setRole(event.target.value as any)}
                  className="rounded-sm border border-divider bg-surface px-3 py-2 font-mono text-xs text-graphite"
                >
                  <option value="All">All Roles</option>
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
                <button
                  onClick={() => setInviteOpen(true)}
                  className="rounded-sm bg-electric px-4 py-2 font-plex text-xs font-semibold text-white hover:bg-electric-light transition-colors"
                >
                  + Add User
                </button>
              </div>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-divider bg-surface-2">
                {['USER', 'ROLE', 'STATUS', 'TARGET BAND', 'ACTION'].map(label => (
                  <th key={label} className="px-5 py-3 text-left font-mono text-xs font-medium tracking-wider text-graphite-light">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-surface-2 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-plex text-xs font-semibold text-ink">{user.name}</div>
                    <div className="font-mono text-[11px] text-graphite-light">{user.email} · {user.country}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : user.role === 'Instructor' ? 'bg-blue-100 text-blue-800' : 'bg-surface-3 text-ink-2'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                      user.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-ink">
                    Band {user.targetBand ? user.targetBand.toFixed(1) : '7.5'}
                  </td>
                  <td className="px-5 py-4">
                    {user.role !== 'Admin' && (
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`font-mono text-xs px-2.5 py-1 rounded border transition-colors ${
                          user.status === 'Active'
                            ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Right: Audio Database Modules */}
        <section className="border border-divider bg-surface p-5 space-y-4">
          <div className="border-b border-divider pb-3">
            <div className="label-tag mb-1">LOCAL REPOSITORY CATALOG</div>
            <h2 className="font-plex text-sm font-semibold text-ink">Connected Audio Modules</h2>
          </div>
          <div className="space-y-3">
            {catalog && Object.keys(catalog.books).map(bookKey => {
              const book = catalog.books[bookKey]
              const testCount = Object.keys(book.tests).length
              return (
                <div key={bookKey} className="p-3 bg-surface-2 border border-divider rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-ink">{book.title}</span>
                    <span className="mono text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">ONLINE</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-graphite-light">
                    {testCount} Tests · Full HTTP 206 Streaming
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
