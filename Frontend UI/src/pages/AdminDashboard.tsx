import { useMemo, useState } from 'react'

type UserRole = 'Student' | 'Instructor' | 'Admin'
type UserStatus = 'Active' | 'Invited' | 'Suspended'

type PlatformUser = {
  id: string
  name: string
  email: string
  country: string
  role: UserRole
  status: UserStatus
  lastActive: string
}

const INITIAL_USERS: PlatformUser[] = [
  { id: 'USR-1048', name: 'Ayaan Rahman', email: 'ayaan.rahman@email.com', country: 'Bangladesh', role: 'Student', status: 'Active', lastActive: 'Now' },
  { id: 'USR-1047', name: 'Nusrat Jahan', email: 'nusrat.jahan@email.com', country: 'Bangladesh', role: 'Student', status: 'Active', lastActive: '12 min ago' },
  { id: 'USR-1046', name: 'Fahim Hasan', email: 'fahim.hasan@email.com', country: 'Bangladesh', role: 'Student', status: 'Invited', lastActive: 'Not joined' },
  { id: 'USR-1045', name: 'Sarah Ahmed', email: 'sarah.ahmed@vistora.ai', country: 'United Kingdom', role: 'Instructor', status: 'Active', lastActive: '1 hour ago' },
  { id: 'USR-0001', name: 'Vistora Administrator', email: 'admin@vistora.ai', country: 'Bangladesh', role: 'Admin', status: 'Active', lastActive: 'Now' },
]

const MODULES = [
  { name: 'IELTS 21 · Listening Test 1', type: 'Listening', items: '40 questions', status: 'Published' },
  { name: 'IELTS 21 · Academic Reading Test 1', type: 'Reading', items: '40 questions', status: 'Published' },
  { name: 'IELTS 21 · Academic Writing Test 1', type: 'Writing', items: '2 tasks', status: 'Published' },
  { name: 'IELTS 21 · Speaking Test 1', type: 'Speaking', items: '3 parts', status: 'Published' },
]

export default function AdminDashboard() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<'All' | UserRole>('All')

  const filteredUsers = useMemo(() => users.filter(user => {
    const matchesQuery = `${user.name} ${user.email} ${user.country}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (role === 'All' || user.role === role)
  }), [query, role, users])

  const toggleUserStatus = (id: string) => {
    setUsers(current => current.map(user => user.id === id && user.role !== 'Admin'
      ? { ...user, status: user.status === 'Suspended' ? 'Active' : 'Suspended' }
      : user))
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-divider pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label-tag mb-2">ADMIN CONSOLE · PLATFORM CONTROL</div>
          <h1 className="font-plex text-2xl font-bold tracking-tight text-navy">Workspace Administration</h1>
          <p className="mt-1 text-sm text-graphite-mid">Manage learners, staff access, exam modules, and platform activity.</p>
        </div>
        <div className="border-l-2 border-violet pl-3">
          <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">Signed in as</div>
          <div className="font-plex text-sm font-semibold text-navy">Vistora Administrator</div>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Total users', '1,248', '+82 this month'],
          ['Active learners', '932', '74.7% of users'],
          ['Tests completed', '3,671', '+14.2% this week'],
          ['Published modules', '4', 'IELTS 21 · Test 1'],
        ].map(([label, value, detail], index) => (
          <div key={label} className="corner-mark border border-divider bg-white p-5">
            <div className={`mb-4 h-1 w-8 ${index % 2 ? 'bg-violet' : 'bg-electric'}`} />
            <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">{label}</div>
            <div className="mt-1 font-mono text-2xl font-bold text-navy">{value}</div>
            <div className="mt-2 text-xs text-graphite-mid">{detail}</div>
          </div>
        ))}
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <section className="border border-divider bg-white">
          <div className="border-b border-divider p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-plex text-sm font-semibold text-navy">User management</h2>
                <p className="mt-1 text-xs text-graphite-light">{filteredUsers.length} accounts shown</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search users..." className="rounded-sm border border-divider bg-slate-50 px-3 py-2 text-xs text-navy outline-none focus:border-electric" />
                <select value={role} onChange={event => setRole(event.target.value as 'All' | UserRole)} className="rounded-sm border border-divider bg-white px-3 py-2 font-mono text-xs text-graphite">
                  <option>All</option><option>Student</option><option>Instructor</option><option>Admin</option>
                </select>
                <button className="rounded-sm bg-electric px-4 py-2 font-plex text-xs font-semibold text-white">Invite user</button>
              </div>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-divider bg-slate-50">
                {['USER', 'ROLE', 'STATUS', 'LAST ACTIVE', 'ACTION'].map(label => <th key={label} className="px-5 py-3 text-left font-mono text-xs font-medium tracking-wider text-graphite-light">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-divider last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="font-plex text-sm font-semibold text-navy">{user.name}</div>
                    <div className="mt-0.5 text-xs text-graphite-light">{user.email} · {user.country}</div>
                  </td>
                  <td className="px-5 py-4"><span className={`rounded-sm px-2 py-1 font-mono text-xs ${user.role === 'Admin' ? 'bg-violet-dim text-violet' : user.role === 'Instructor' ? 'bg-electric-dim text-electric' : 'bg-slate-50 text-graphite'}`}>{user.role.toUpperCase()}</span></td>
                  <td className="px-5 py-4"><span className={`font-mono text-xs ${user.status === 'Active' ? 'text-success' : user.status === 'Suspended' ? 'text-danger' : 'text-warning'}`}>{user.status}</span></td>
                  <td className="px-5 py-4 font-mono text-xs text-graphite-light">{user.lastActive}</td>
                  <td className="px-5 py-4">
                    <button disabled={user.role === 'Admin'} onClick={() => toggleUserStatus(user.id)} className="font-mono text-xs text-electric disabled:text-graphite-light">{user.status === 'Suspended' ? 'Restore' : 'Suspend'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside className="space-y-4">
          <section className="border border-divider bg-white">
            <div className="border-b border-divider px-5 py-4">
              <h2 className="font-plex text-sm font-semibold text-navy">Role permissions</h2>
            </div>
            <div className="divide-y divide-divider">
              {[
                ['Student', 'Practice tests, AI tools, resources and personal progress'],
                ['Instructor', 'Review submissions and monitor assigned learners'],
                ['Admin', 'Manage users, roles, modules and platform settings'],
              ].map(([name, description]) => (
                <div key={name} className="p-5">
                  <div className="font-mono text-xs font-semibold uppercase tracking-wider text-violet">{name}</div>
                  <p className="mt-2 text-xs leading-5 text-graphite-mid">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-divider bg-navy p-5 text-white">
            <div className="font-mono text-xs uppercase tracking-widest text-electric-light">Content status</div>
            <div className="mt-4 space-y-4">
              {MODULES.map(module => (
                <div key={module.name} className="border-b border-navy-light pb-3 last:border-0 last:pb-0">
                  <div className="font-plex text-xs font-semibold">{module.name}</div>
                  <div className="mt-1 flex justify-between font-mono text-xs text-graphite-light"><span>{module.items}</span><span className="text-success">{module.status}</span></div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}
