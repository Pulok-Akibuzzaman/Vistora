import { useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchAllUsers,
  inviteUser,
  toggleUserStatus,
  fetchResults,
  fetchAudioCatalog,
  saveCustomSharepointUrl,
  deleteCustomSharepointUrl,
  getAllSharepointAudioTracks,
  type UserProfile,
  type AudioCatalog,
} from '../lib/api'
import { useAuth } from '../lib/authContext'
import {
  getCustomTests,
  saveCustomTest,
  deleteCustomTest,
  extractTextFromPdfFile,
  scanIeltsExamWithAi,
  generateTypeScriptDataset,
  type CustomTest,
} from '../lib/customTests'
import type { ReadingPassage, ReadingQuestion } from '../data/readingTest21'
import { NavLink } from 'react-router'

export default function AdminDashboard() {
  const { user: currentAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'pdf-scanner' | 'sharepoint-audio'>('users')

  // User accounts state
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

  // --------------------------------------------------------------------------
  // PDF Book Scanner & AI Importer State
  // --------------------------------------------------------------------------
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [rawText, setRawText] = useState('')
  const [bookNumber, setBookNumber] = useState('22')
  const [testNumber, setTestNumber] = useState(1)
  const [testTitle, setTestTitle] = useState('Cambridge IELTS 22 — Academic Reading Test 1')
  const [testModule, setTestModule] = useState<'Academic' | 'General Training'>('Academic')
  const [testDuration, setTestDuration] = useState(60)
  const [isScanning, setIsScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState<string>('')
  const [scanError, setScanError] = useState<string>('')

  // Scanned / Extracted test preview state
  const [scannedPassages, setScannedPassages] = useState<ReadingPassage[]>([])
  const [scannedAnswers, setScannedAnswers] = useState<Record<number, string | string[]>>({})
  const [publishedTests, setPublishedTests] = useState<CustomTest[]>(() => getCustomTests())
  const [publishSuccessMsg, setPublishSuccessMsg] = useState('')

  // --------------------------------------------------------------------------
  // SharePoint Audio Links Manager State
  // --------------------------------------------------------------------------
  const [audioBook, setAudioBook] = useState('18')
  const [audioTest, setAudioTest] = useState(1)
  const [audioPart, setAudioPart] = useState(1)
  const [sharepointUrl, setSharepointUrl] = useState('')
  const [audioTracks, setAudioTracks] = useState(() => getAllSharepointAudioTracks())
  const [testAudioSrc, setTestAudioSrc] = useState('')
  const [audioSavedMsg, setAudioSavedMsg] = useState('')
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchAllUsers().then(setUsers).catch(() => {})
    fetchResults().then(res => setResultsCount(res.length)).catch(() => {})
    fetchAudioCatalog().then(setCatalog).catch(() => {})
  }, [])

  const reloadAudioTracks = () => {
    setAudioTracks(getAllSharepointAudioTracks())
  }

  const reloadPublishedTests = () => {
    setPublishedTests(getCustomTests())
  }

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

  // --------------------------------------------------------------------------
  // PDF Book Scanning Handler
  // --------------------------------------------------------------------------
  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfFile(file)
    setScanError('')
    setScanStatus(`Reading ${file.name} in browser...`)

    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const extracted = await extractTextFromPdfFile(file)
        setRawText(extracted)
        setScanStatus(`Extracted ${extracted.length} characters from ${file.name}. Ready for AI scan.`)
      } else {
        const text = await file.text()
        setRawText(text)
        setScanStatus(`Loaded ${file.name}. Ready for AI scan.`)
      }
    } catch (err: any) {
      setScanError(`Failed to read file: ${err?.message || 'Unknown error'}`)
      setScanStatus('')
    }
  }

  const handleRunAiScan = async () => {
    if (!rawText.trim()) {
      setScanError('Please select a PDF file or paste the exam text below.')
      return
    }

    setIsScanning(true)
    setScanError('')
    setPublishSuccessMsg('')
    setScanStatus('Scanning text with Puku.sh AI (puku-ai-2.8)... parsing passages, questions, and verified keys.')

    try {
      const result = await scanIeltsExamWithAi(rawText, {
        book: bookNumber,
        testNumber,
        title: testTitle,
      })

      if (!result || result.passages.length === 0) {
        throw new Error('AI could not parse structured IELTS passages. Please check the raw text.')
      }

      setScannedPassages(result.passages)
      setScannedAnswers(result.answers)
      const qCount = result.passages.flatMap(p => p.questions).length
      setScanStatus(`Successfully scanned ${result.passages.length} passage(s) and ${qCount} questions! Review below.`)
    } catch (err: any) {
      setScanError(err?.message || 'Scan failed. Please verify API key and text format.')
      setScanStatus('')
    } finally {
      setIsScanning(false)
    }
  }

  const handlePublishCustomTest = () => {
    if (scannedPassages.length === 0) {
      setScanError('No scanned test data to publish. Run AI scan first.')
      return
    }

    const customId = `custom-r${bookNumber}-t${testNumber}-${Date.now().toString().slice(-4)}`
    const newTest: CustomTest = {
      id: customId,
      title: testTitle || `Cambridge IELTS ${bookNumber} Test ${testNumber} Reading`,
      book: bookNumber,
      testNumber,
      type: 'Reading',
      module: testModule,
      duration: testDuration,
      difficulty: 'Official Cambridge format',
      status: 'New',
      passages: scannedPassages,
      answers: scannedAnswers,
      createdAt: new Date().toISOString(),
      author: currentAdmin?.name || 'Administrator',
    }

    saveCustomTest(newTest)
    reloadPublishedTests()
    setPublishSuccessMsg(`Test "${newTest.title}" published successfully! It is now live under Practice Tests.`)
  }

  const handleDownloadDataset = () => {
    if (scannedPassages.length === 0) return
    const customId = `custom-r${bookNumber}-t${testNumber}`
    const mockTest: CustomTest = {
      id: customId,
      title: testTitle,
      book: bookNumber,
      testNumber,
      type: 'Reading',
      module: testModule,
      duration: testDuration,
      difficulty: 'Official format',
      status: 'New',
      passages: scannedPassages,
      answers: scannedAnswers,
      createdAt: new Date().toISOString(),
    }
    const tsCode = generateTypeScriptDataset(mockTest)
    const blob = new Blob([tsCode], { type: 'text/typescript;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `readingTest${bookNumber}_${testNumber}.ts`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteCustomTest = (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom test?')) {
      deleteCustomTest(id)
      reloadPublishedTests()
    }
  }

  // --------------------------------------------------------------------------
  // SharePoint Audio Links Handlers
  // --------------------------------------------------------------------------
  const handleSaveSharepointLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sharepointUrl.trim()) return

    saveCustomSharepointUrl(audioBook, audioTest, audioPart, sharepointUrl.trim())
    reloadAudioTracks()
    setAudioSavedMsg(`SharePoint link saved for Book ${audioBook} · Test ${audioTest} · Part ${audioPart}!`)
    setTimeout(() => setAudioSavedMsg(''), 4000)
  }

  const handleDeleteSharepointTrack = (key: string) => {
    deleteCustomSharepointUrl(key)
    reloadAudioTracks()
  }

  const handleTestAudioPlayback = (url: string) => {
    setTestAudioSrc(url)
    if (audioPreviewRef.current) {
      audioPreviewRef.current.load()
      audioPreviewRef.current.play().catch(err => {
        console.warn('Audio play error:', err)
      })
    }
  }

  // Security Access Barrier
  if (currentAdmin && currentAdmin.role !== 'Admin') {
    return (
      <main className="mx-auto max-w-[800px] px-4 py-16 text-center">
        <div className="corner-mark border border-rose-200 bg-rose-50/50 p-8 text-ink">
          <div className="font-mono text-xs uppercase tracking-widest text-rose-600">Access Restricted</div>
          <h1 className="mt-2 font-plex text-2xl font-bold text-ink">Administrator Privileges Required</h1>
          <p className="mt-3 text-sm text-graphite-mid">
            You are currently signed in as <strong>{currentAdmin.name}</strong> ({currentAdmin.email}) with the role of <strong>{currentAdmin.role}</strong>. Only verified platform administrators can view and manage workspace controls.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <NavLink to="/dashboard" className="rounded bg-electric px-5 py-2.5 text-xs font-semibold text-white hover:bg-electric-light">
              Return to Student Dashboard
            </NavLink>
            <NavLink to="/practice" className="rounded border border-divider px-5 py-2.5 text-xs font-semibold text-ink hover:bg-surface-2">
              Go to Practice Tests
            </NavLink>
          </div>
        </div>
      </main>
    )
  }

  const activeLearners = users.filter(u => u.status === 'Active' && u.role === 'Student').length
  const totalAudioTracks = audioTracks.length
  const availableBooks = Array.from(new Set(audioTracks.map(t => t.book))).length

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-divider pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label-tag mb-2">ADMIN CONSOLE · SUPERUSER CONTROL</div>
          <h1 className="font-plex text-2xl font-bold tracking-tight text-ink">Workspace Administration</h1>
          <p className="mt-1 text-sm text-graphite-mid">
            Manage learners, staff accounts, AI-powered PDF exam ingestion, and external audio streaming.
          </p>
        </div>
        <div className="border-l-2 border-violet pl-3">
          <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">Signed in as Administrator</div>
          <div className="font-plex text-sm font-semibold text-ink">{currentAdmin?.name || 'Pulok Akibuzzaman'}</div>
          <div className="font-mono text-[11px] text-accent">{currentAdmin?.email || 'pulok519@gmail.com'}</div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-divider pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded transition-colors ${
            activeTab === 'users' ? 'bg-electric text-white font-bold' : 'bg-surface border border-divider text-graphite hover:text-ink'
          }`}
        >
          👥 Platform Users & Staff ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('pdf-scanner')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded transition-colors ${
            activeTab === 'pdf-scanner' ? 'bg-electric text-white font-bold' : 'bg-surface border border-divider text-graphite hover:text-ink'
          }`}
        >
          📚 IELTS PDF Exam Scanner & Importer ({publishedTests.length} published)
        </button>
        <button
          onClick={() => setActiveTab('sharepoint-audio')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded transition-colors ${
            activeTab === 'sharepoint-audio' ? 'bg-electric text-white font-bold' : 'bg-surface border border-divider text-graphite hover:text-ink'
          }`}
        >
          🎧 SharePoint Audio Links & Streaming ({totalAudioTracks} tracks)
        </button>
      </div>

      {/* Metrics Row */}
      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Registered users', String(users.length), `${users.filter(u => u.status === 'Active').length} Active Accounts`],
          ['Active learners', String(activeLearners), `${users.length ? Math.round((activeLearners / users.length) * 100) : 0}% of accounts`],
          ['Tests completed', String(resultsCount), 'Across all student attempts'],
          ['Audio Tracks Online', String(totalAudioTracks), `Cambridge Books ${availableBooks} mapped`],
        ].map(([label, value, detail], index) => (
          <div key={label} className="corner-mark border border-divider bg-surface p-5">
            <div className={`mb-4 h-1 w-8 ${index % 2 ? 'bg-violet' : 'bg-electric'}`} />
            <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">{label}</div>
            <div className="mt-1 font-mono text-2xl font-bold text-ink">{value}</div>
            <div className="mt-2 text-xs text-graphite-mid">{detail}</div>
          </div>
        ))}
      </section>

      {/* ==================================================================== */}
      {/* TAB 1: USERS & ACCOUNTS */}
      {/* ==================================================================== */}
      {activeTab === 'users' && (
        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
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
            <div className="overflow-x-auto">
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
            </div>
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
      )}

      {/* ==================================================================== */}
      {/* TAB 2: IELTS PDF EXAM SCANNER & AI IMPORTER */}
      {/* ==================================================================== */}
      {activeTab === 'pdf-scanner' && (
        <div className="mt-6 space-y-6">
          <section className="border border-divider bg-surface p-6">
            <div className="border-b border-divider pb-4">
              <div className="label-tag mb-1">AUTOMATED PAST PAPER INGESTION</div>
              <h2 className="font-plex text-lg font-bold text-ink">British Council / Cambridge IELTS PDF Book Scanner</h2>
              <p className="mt-1 text-xs text-graphite-mid">
                Upload any official examination PDF book or past paper. Puku.sh AI (<code className="text-electric">puku-ai-2.8</code>) will scan the passages, extract all 40 questions with options, format them to official IELTS computer-delivered standards, and publish them directly to the platform.
              </p>
            </div>

            {/* Ingestion Parameters Form */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">Book Identifier</label>
                <input
                  value={bookNumber}
                  onChange={e => setBookNumber(e.target.value)}
                  placeholder="e.g. 21, 22, BC-Mock"
                  className="mt-1 w-full rounded border border-divider bg-surface-2 p-2.5 text-xs text-ink outline-none focus:border-electric font-mono"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">Test Number</label>
                <input
                  type="number"
                  value={testNumber}
                  onChange={e => setTestNumber(parseInt(e.target.value, 10) || 1)}
                  className="mt-1 w-full rounded border border-divider bg-surface-2 p-2.5 text-xs text-ink outline-none focus:border-electric font-mono"
                  min={1}
                  max={20}
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">Exam Module</label>
                <select
                  value={testModule}
                  onChange={e => setTestModule(e.target.value as any)}
                  className="mt-1 w-full rounded border border-divider bg-surface-2 p-2.5 text-xs text-ink outline-none focus:border-electric font-mono"
                >
                  <option value="Academic">Academic Reading</option>
                  <option value="General Training">General Training Reading</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">Allocated Minutes</label>
                <input
                  type="number"
                  value={testDuration}
                  onChange={e => setTestDuration(parseInt(e.target.value, 10) || 60)}
                  className="mt-1 w-full rounded border border-divider bg-surface-2 p-2.5 text-xs text-ink outline-none focus:border-electric font-mono"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block font-mono text-xs uppercase text-graphite-light">Test Title Display</label>
              <input
                value={testTitle}
                onChange={e => setTestTitle(e.target.value)}
                placeholder="e.g. Cambridge IELTS 22 — Academic Reading Test 1"
                className="mt-1 w-full rounded border border-divider bg-surface-2 p-2.5 text-xs text-ink outline-none focus:border-electric"
              />
            </div>

            {/* Upload Area */}
            <div className="mt-5 border-2 border-dashed border-divider hover:border-electric rounded p-6 bg-surface-2 text-center transition-colors">
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf,.txt,.json"
                onChange={handlePdfFileChange}
                className="hidden"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="text-3xl mb-2">📄</div>
                <div className="font-plex text-sm font-semibold text-ink">
                  {pdfFile ? pdfFile.name : 'Click to Upload British Council / Cambridge IELTS PDF Book'}
                </div>
                <div className="mt-1 font-mono text-xs text-graphite-light">
                  Supports .pdf, .txt, or past paper JSON extracts (Text is parsed in-browser)
                </div>
              </label>
            </div>

            {/* Or Paste Raw Text */}
            <div className="mt-4">
              <label className="block font-mono text-xs uppercase text-graphite-light">
                Or Paste Passage / Question Text Directly
              </label>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste reading passages, questions, and instructions here..."
                rows={5}
                className="mt-1 w-full rounded border border-divider bg-surface-2 p-3 text-xs text-ink font-mono outline-none focus:border-electric"
              />
            </div>

            {scanStatus && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded font-mono">
                ✓ {scanStatus}
              </div>
            )}
            {scanError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded font-mono">
                ✕ {scanError}
              </div>
            )}
            {publishSuccessMsg && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-xs text-blue-900 rounded font-mono">
                🎉 {publishSuccessMsg}
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={handleRunAiScan}
                disabled={isScanning || !rawText.trim()}
                className="rounded bg-electric px-6 py-2.5 text-xs font-semibold text-white hover:bg-electric-light transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isScanning ? '⚡ Puku AI Scanning Exam...' : '⚡ Scan & Extract Questions with Puku AI'}
              </button>
              {scannedPassages.length > 0 && (
                <>
                  <button
                    onClick={handlePublishCustomTest}
                    className="rounded bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                  >
                    🚀 Publish Test to Exam Simulator
                  </button>
                  <button
                    onClick={handleDownloadDataset}
                    className="rounded border border-divider bg-surface px-5 py-2.5 text-xs font-semibold text-ink hover:bg-surface-2 transition-colors font-mono"
                  >
                    💾 Download TypeScript (.ts) Dataset
                  </button>
                  <NavLink
                    to="/practice"
                    className="rounded border border-electric text-electric px-5 py-2.5 text-xs font-semibold hover:bg-electric-soft transition-colors"
                  >
                    Go Test in Simulator →
                  </NavLink>
                </>
              )}
            </div>
          </section>

          {/* Scanned Data Preview Panel */}
          {scannedPassages.length > 0 && (
            <section className="border border-divider bg-surface p-6">
              <div className="flex items-center justify-between border-b border-divider pb-4">
                <div>
                  <h3 className="font-plex text-base font-bold text-ink">Extracted Passages & Questions Preview</h3>
                  <p className="mt-0.5 text-xs text-graphite-mid">
                    {scannedPassages.length} passage(s) · {scannedPassages.flatMap(p => p.questions).length} total questions extracted
                  </p>
                </div>
                <div className="font-mono text-xs text-electric bg-surface-2 px-3 py-1 rounded border border-divider">
                  Verified Band 9 Key Attached
                </div>
              </div>

              <div className="mt-4 space-y-6">
                {scannedPassages.map((passage, pIdx) => (
                  <div key={pIdx} className="border border-divider rounded p-4 bg-surface-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-electric">PART {passage.part} · Questions {passage.range[0]}–{passage.range[1]}</span>
                      <span className="font-mono text-[11px] text-graphite-light">{passage.paragraphs.length} Paragraphs</span>
                    </div>
                    <h4 className="mt-2 font-plex text-sm font-bold text-ink">{passage.title}</h4>
                    {passage.subtitle && <p className="text-xs italic text-graphite-mid">{passage.subtitle}</p>}

                    {/* Questions Sample */}
                    <div className="mt-4 space-y-3">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-graphite-light">Questions Sample:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {passage.questions.slice(0, 6).map(q => (
                          <div key={q.id} className="p-3 bg-surface border border-divider rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-ink">Q{q.id} ({q.kind})</span>
                              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Key: {String(scannedAnswers[q.id] || '—')}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-ink line-clamp-2">{q.prompt}</p>
                            {q.instruction && <p className="mt-1 font-mono text-[10px] text-graphite-light">{q.instruction}</p>}
                          </div>
                        ))}
                      </div>
                      {passage.questions.length > 6 && (
                        <div className="text-center font-mono text-xs text-graphite-light pt-2">
                          + {passage.questions.length - 6} more questions extracted and ready to publish
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Currently Published Custom Tests */}
          <section className="border border-divider bg-surface p-6">
            <div className="border-b border-divider pb-3">
              <h3 className="font-plex text-sm font-bold text-ink">Admin-Published Tests in Exam Simulator</h3>
              <p className="mt-0.5 text-xs text-graphite-mid">
                These tests are active and selectable by students in <NavLink to="/practice" className="text-electric underline">Practice Tests</NavLink>.
              </p>
            </div>
            {publishedTests.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-graphite-light">
                No custom tests published yet. Upload a past paper PDF above to create one.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-divider">
                {publishedTests.map(test => (
                  <div key={test.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-plex text-xs font-bold text-ink">{test.title}</div>
                      <div className="font-mono text-[11px] text-graphite-light">
                        Book {test.book} · Test {test.testNumber} · {test.module} · {test.passages.flatMap(p => p.questions).length} Qs · {test.duration} mins
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <NavLink
                        to="/practice"
                        className="rounded border border-divider px-3 py-1 font-mono text-xs text-ink hover:bg-surface-2"
                      >
                        Launch Test →
                      </NavLink>
                      <button
                        onClick={() => handleDeleteCustomTest(test.id)}
                        className="rounded border border-rose-200 text-rose-600 px-3 py-1 font-mono text-xs hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: SHAREPOINT AUDIO LINKS & STREAMING */}
      {/* ==================================================================== */}
      {activeTab === 'sharepoint-audio' && (
        <div className="mt-6 space-y-6">
          <section className="border border-divider bg-surface p-6">
            <div className="border-b border-divider pb-4">
              <div className="label-tag mb-1">EXTERNAL REPOSITORY STREAMING</div>
              <h2 className="font-plex text-lg font-bold text-ink">SharePoint & OneDrive Audio Links Manager</h2>
              <p className="mt-1 text-xs text-graphite-mid">
                Configure direct streaming links from institutional SharePoint / OneDrive for Cambridge IELTS Listening tests. Any link added here takes effect immediately in both local development and live production deployments.
              </p>
            </div>

            {/* Audio URL Form */}
            <form onSubmit={handleSaveSharepointLink} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-graphite-light">Cambridge Book</label>
                  <input
                    value={audioBook}
                    onChange={e => setAudioBook(e.target.value)}
                    placeholder="e.g. 18, 19, 20, 21, 22"
                    className="mt-1 w-full rounded border border-divider bg-surface-2 p-2.5 text-xs text-ink outline-none focus:border-electric font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase text-graphite-light">Test Number (1–4)</label>
                  <input
                    type="number"
                    value={audioTest}
                    onChange={e => setAudioTest(parseInt(e.target.value, 10) || 1)}
                    min={1}
                    max={10}
                    className="mt-1 w-full rounded border border-divider bg-surface-2 p-2.5 text-xs text-ink outline-none focus:border-electric font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase text-graphite-light">Part Number (1–4)</label>
                  <input
                    type="number"
                    value={audioPart}
                    onChange={e => setAudioPart(parseInt(e.target.value, 10) || 1)}
                    min={1}
                    max={4}
                    className="mt-1 w-full rounded border border-divider bg-surface-2 p-2.5 text-xs text-ink outline-none focus:border-electric font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">
                  Direct SharePoint / OneDrive Audio Download URL
                </label>
                <div className="mt-1 flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={sharepointUrl}
                    onChange={e => setSharepointUrl(e.target.value)}
                    placeholder="https://ewubd-my.sharepoint.com/:u:/g/personal/.../?download=1"
                    className="flex-1 rounded border border-divider bg-surface-2 p-2.5 text-xs text-ink outline-none focus:border-electric font-mono min-w-0"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestAudioPlayback(sharepointUrl)}
                      disabled={!sharepointUrl.trim()}
                      className="flex-1 sm:flex-none rounded border border-divider bg-surface px-4 py-2 text-xs font-mono text-ink hover:bg-surface-2 disabled:opacity-50"
                    >
                      ▶ Test Audio
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none rounded bg-electric px-5 py-2 text-xs font-semibold text-white hover:bg-electric-light transition-colors"
                    >
                      Save Audio Link
                    </button>
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-graphite-light font-mono">
                  Tip: SharePoint sharing links should include <code>?download=1</code> at the end for direct audio streaming.
                </div>
              </div>

              {audioSavedMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded font-mono">
                  ✓ {audioSavedMsg}
                </div>
              )}

              {/* Inline Audio Preview Player */}
              {testAudioSrc && (
                <div className="p-3 bg-surface-2 border border-divider rounded flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-ink">Now Testing Audio:</span>
                  <audio ref={audioPreviewRef} controls src={testAudioSrc} className="h-8 flex-1" />
                </div>
              )}
            </form>
          </section>

          {/* Audio Tracks Table */}
          <section className="border border-divider bg-surface">
            <div className="border-b border-divider p-5 flex items-center justify-between">
              <div>
                <h3 className="font-plex text-sm font-semibold text-ink">Mapped Listening Exam Tracks</h3>
                <p className="mt-1 text-xs text-graphite-light">{audioTracks.length} audio tracks connected</p>
              </div>
              <div className="font-mono text-xs text-graphite-light">
                {audioTracks.filter(t => t.isCustom).length} Custom Admin Links
              </div>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-divider bg-surface-2">
                    {['TRACK KEY', 'CAMBRIDGE BOOK', 'TEST & PART', 'STATUS / SOURCE', 'ACTIONS'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-mono text-xs font-medium tracking-wider text-graphite-light">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider font-mono text-xs">
                  {audioTracks.map(track => (
                    <tr key={track.key} className="hover:bg-surface-2 transition-colors">
                      <td className="px-5 py-3 font-bold text-ink">{track.key}</td>
                      <td className="px-5 py-3 text-ink">Book {track.book}</td>
                      <td className="px-5 py-3 text-ink">Test {track.test} · Part {track.part}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          track.isCustom ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {track.isCustom ? 'ADMIN CUSTOM' : 'OFFICIAL SHAREPOINT'}
                        </span>
                      </td>
                      <td className="px-5 py-3 flex items-center gap-2">
                        <button
                          onClick={() => handleTestAudioPlayback(track.url)}
                          className="text-electric hover:underline text-[11px]"
                        >
                          ▶ Test Play
                        </button>
                        <a
                          href={track.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-graphite-mid hover:text-ink text-[11px] underline"
                        >
                          Open URL
                        </a>
                        {track.isCustom && (
                          <button
                            onClick={() => handleDeleteSharepointTrack(track.key)}
                            className="text-rose-600 hover:underline text-[11px] ml-2"
                          >
                            Reset
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

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
    </main>
  )
}
