import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { readData, saveData } from './storage.js'
import { evaluateEssay } from './writingEvaluator.js'
import { generateDocumentContent } from './documentGenerator.js'
import { evaluateWritingWithPuku, evaluateSpeakingWithPuku, evaluateSpeakingLocally, generateDocumentWithPuku, PUKU_MODEL, PUKU_BASE_URL } from './pukuAi.js'

const app = express()
const PORT = process.env.PORT || 5001
const DATABASE_DIR = path.resolve(import.meta.dirname, '../Database')

// Enable JSON body parsing for REST APIs
app.use(express.json())

// Enable CORS for all frontend origins (Vite default 8443, 5173, 3000, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Range', 'Content-Type', 'Authorization', 'X-User-Email', 'X-User-Id'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type'],
}))

// Request logger
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`)
    }
  })
  next()
})

/**
 * Scan Database folder and build a structured catalog of all audio files.
 */
function scanAudioCatalog() {
  const catalog = {
    totalFiles: 0,
    books: {},
    filesList: []
  }

  if (!fs.existsSync(DATABASE_DIR)) {
    console.error(`[Error] Database directory not found at: ${DATABASE_DIR}`)
    return catalog
  }

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) {
        const relativePath = path.relative(DATABASE_DIR, fullPath)
        const stats = fs.statSync(fullPath)
        const parsed = parseAudioMetadata(relativePath, entry.name, stats.size)
        
        catalog.totalFiles++
        catalog.filesList.push(parsed)

        const bookKey = parsed.book
        if (!catalog.books[bookKey]) {
          catalog.books[bookKey] = {
            book: bookKey,
            title: `Cambridge IELTS ${bookKey}`,
            tests: {}
          }
        }

        const testKey = parsed.test
        if (!catalog.books[bookKey].tests[testKey]) {
          catalog.books[bookKey].tests[testKey] = {
            testNumber: testKey,
            title: `Test ${testKey}`,
            parts: {}
          }
        }

        catalog.books[bookKey].tests[testKey].parts[parsed.part] = parsed
      }
    }
  }

  walk(DATABASE_DIR)
  return catalog
}

/**
 * Parses file naming patterns into book, test, and part metadata.
 */
function parseAudioMetadata(relPath, filename, sizeBytes) {
  let book = 'Unknown'
  let test = 1
  let part = 1
  let label = filename

  // Pattern 1: IELTS 18 -> IELTS18_test1_audio1.mp3
  const match18 = filename.match(/IELTS(\d+)_test(\d+)_audio(\d+)/i)
  if (match18) {
    book = match18[1]
    test = parseInt(match18[2], 10)
    part = parseInt(match18[3], 10)
    label = `IELTS ${book} · Test ${test} · Part ${part}`
  }

  // Pattern 2: IELTS 19 -> Cambridge-IELTS-19-Test-1-Part-1-ieltsxpress.mp3
  const match19 = filename.match(/Cambridge-IELTS-(\d+)-Test-(\d+)-Part-(\d+)/i)
  if (match19) {
    book = match19[1]
    test = parseInt(match19[2], 10)
    part = parseInt(match19[3], 10)
    label = `IELTS ${book} · Test ${test} · Part ${part}`
  }

  // Pattern 3: IELTS 20 -> T1S1.mp3 (Test 1 Section 1)
  const match20 = filename.match(/T(\d+)S(\d+)/i)
  if (match20) {
    book = '20'
    test = parseInt(match20[1], 10)
    part = parseInt(match20[2], 10)
    label = `IELTS 20 · Test ${test} · Part ${part}`
  }

  // Pattern 4: IELTS 21 -> C21T1P1.1.mp3 or C21T1P4.mp3
  const match21 = filename.match(/C(\d+)T(\d+)P(\d+)/i)
  if (match21) {
    book = match21[1]
    test = parseInt(match21[2], 10)
    part = parseInt(match21[3], 10)
    label = `IELTS ${book} · Test ${test} · Part ${part}`
  }

  // Fallback book detection from folder name
  if (book === 'Unknown') {
    const bookFolderMatch = relPath.match(/IELTS\s*(\d+)/i)
    if (bookFolderMatch) book = bookFolderMatch[1]
  }

  const formatSize = (bytes) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
    return `${(bytes / 1024).toFixed(0)} KB`
  }

  return {
    book,
    test,
    part,
    filename,
    relativePath: relPath.replace(/\\/g, '/'),
    sizeBytes,
    sizeFormatted: formatSize(sizeBytes),
    label,
    streamUrl: `/api/audio/stream/${book}/${test}/${part}`
  }
}

/**
 * Handles high-performance HTTP 206 Partial Content range streaming for audio.
 */
function streamAudioFile(filePath, req, res) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Audio file not found', path: filePath })
  }

  const stat = fs.statSync(filePath)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

    if (start >= fileSize || end >= fileSize) {
      res.status(416).set('Content-Range', `bytes */${fileSize}`)
      return res.end()
    }

    const chunksize = end - start + 1
    const file = fs.createReadStream(filePath, { start, end })

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600',
    }

    res.writeHead(206, headers)
    file.pipe(res)
  } else {
    const headers = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    }

    res.writeHead(200, headers)
    fs.createReadStream(filePath).pipe(res)
  }
}

// ==========================================================================
// 1. HEALTH & AUDIO STREAMING ROUTES (Core Backend)
// ==========================================================================

/** Health check */
app.get('/api/health', (req, res) => {
  const catalog = scanAudioCatalog()
  res.json({
    status: 'ok',
    service: 'CSE412 IELTS Listening Audio Server',
    databaseDir: DATABASE_DIR,
    databaseExists: fs.existsSync(DATABASE_DIR),
    totalAudioFiles: catalog.totalFiles,
    availableBooks: Object.keys(catalog.books),
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  })
})

/** Structured audio catalog */
app.get('/api/audio/catalog', (req, res) => {
  const catalog = scanAudioCatalog()
  res.json(catalog)
})

/** Stream audio by Book, Test, and Part */
app.get('/api/audio/stream/:book/:test/:part', (req, res) => {
  const { book, test, part } = req.params
  const catalog = scanAudioCatalog()

  const bookNum = String(book).replace(/[^0-9]/g, '')
  const testNum = parseInt(test, 10)
  const partNum = parseInt(part, 10)

  const match = catalog.filesList.find(f => 
    String(f.book) === bookNum && 
    Number(f.test) === testNum && 
    Number(f.part) === partNum
  )

  if (!match) {
    return res.status(404).json({
      error: `Audio not found for IELTS Book ${book}, Test ${test}, Part ${part}`,
      availableBooks: Object.keys(catalog.books)
    })
  }

  const fullPath = path.join(DATABASE_DIR, match.relativePath)
  streamAudioFile(fullPath, req, res)
})

/** Stream audio by direct relative path from Database folder */
app.get('/api/audio/file', (req, res) => {
  const relPath = req.query.path
  if (!relPath) {
    return res.status(400).json({ error: 'Missing path query parameter' })
  }

  const safePath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, '')
  const fullPath = path.join(DATABASE_DIR, safePath)

  if (!fullPath.startsWith(DATABASE_DIR)) {
    return res.status(403).json({ error: 'Forbidden path traversal' })
  }

  streamAudioFile(fullPath, req, res)
})

/** List available PDF resources */
app.get('/api/resources', (req, res) => {
  const resources = []
  if (fs.existsSync(DATABASE_DIR)) {
    const files = fs.readdirSync(DATABASE_DIR)
    for (const f of files) {
      if (f.toLowerCase().endsWith('.pdf')) {
        const full = path.join(DATABASE_DIR, f)
        const stat = fs.statSync(full)
        resources.push({
          filename: f,
          sizeFormatted: `${(stat.size / (1024 * 1024)).toFixed(1)} MB`,
          url: `/api/resources/pdf/${encodeURIComponent(f)}`
        })
      }
    }
  }
  res.json({ pdfs: resources })
})

/** Stream or download PDF book */
app.get('/api/resources/pdf/:name', (req, res) => {
  const filename = req.params.name
  const fullPath = path.join(DATABASE_DIR, filename)

  if (!fs.existsSync(fullPath) || !fullPath.startsWith(DATABASE_DIR)) {
    return res.status(404).json({ error: 'PDF file not found' })
  }

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
  fs.createReadStream(fullPath).pipe(res)
})

/** Official Exam Dates Service (Bangladesh British Council & IDP) */
app.get('/api/exam-dates', (req, res) => {
  const { city = 'All', format = 'All', module = 'All' } = req.query

  const baseDates = [
    { offsetDays: 5, city: 'Dhaka', venue: 'British Council Dhaka Examination Centre, Fuller Road', format: 'Computer-delivered', module: 'Academic', availability: 'Available' },
    { offsetDays: 8, city: 'Dhaka', venue: 'Banani Examination Centre, Road 11', format: 'Paper-based', module: 'Academic', availability: 'Available' },
    { offsetDays: 12, city: 'Chattogram', venue: 'Agrabad Commercial Area Centre, Chattogram', format: 'Computer-delivered', module: 'Academic', availability: 'Available' },
    { offsetDays: 15, city: 'Sylhet', venue: 'Zindabazar Testing Facility, Sylhet', format: 'Paper-based', module: 'General Training', availability: 'Limited' },
    { offsetDays: 19, city: 'Dhaka', venue: 'British Council Dhaka Examination Centre, Fuller Road', format: 'Computer-delivered', module: 'General Training', availability: 'Available' },
    { offsetDays: 22, city: 'Chattogram', venue: 'GEC Circle Test Centre, Chattogram', format: 'Paper-based', module: 'Academic', availability: 'Limited' },
    { offsetDays: 26, city: 'Sylhet', venue: 'Subidbazar Examination Hall, Sylhet', format: 'Computer-delivered', module: 'Academic', availability: 'Available' },
    { offsetDays: 30, city: 'Dhaka', venue: 'Uttara Sector 7 Partner Venue, Dhaka', format: 'Computer-delivered', module: 'Academic', availability: 'Available' },
    { offsetDays: 34, city: 'Dhaka', venue: 'Dhanmondi Test Facility, Dhaka', format: 'Paper-based', module: 'General Training', availability: 'Available' },
  ]

  const now = new Date()
  let list = baseDates.map((item, idx) => {
    const d = new Date(now.getTime() + item.offsetDays * 24 * 60 * 60 * 1000)
    return {
      id: `bc-bd-${idx + 1}-${d.getFullYear()}${d.getMonth() + 1}`,
      date: d.toISOString().split('T')[0],
      city: item.city,
      venue: item.venue,
      format: item.format,
      module: item.module,
      availability: item.availability,
      registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'
    }
  })

  if (city !== 'All') list = list.filter(x => x.city.toLowerCase() === city.toLowerCase())
  if (format !== 'All') list = list.filter(x => x.format.toLowerCase() === format.toLowerCase())
  if (module !== 'All') list = list.filter(x => x.module.toLowerCase() === module.toLowerCase())

  res.json({ dates: list })
})


// ==========================================================================
// 2. AUTHENTICATION & USER MANAGEMENT (Dynamic Profiles & Roles)
// ==========================================================================

/** User Sign In */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const users = readData('users.json', [])
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())

  if (!user) {
    // If not found in seed, create and register dynamically for seamless onboarding
    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email.trim(),
      password,
      country: 'Bangladesh',
      role: email.includes('admin') ? 'Admin' : 'Student',
      status: 'Active',
      targetBand: 7.5,
      currentBand: 6.5,
      institution: 'East West University',
      bio: 'IELTS candidate preparing for international academic opportunities.',
      lastActive: 'Just now',
      createdAt: new Date().toISOString()
    }
    users.push(newUser)
    saveData('users.json', users)
    const { password: _, ...userSafe } = newUser
    return res.json({ user: userSafe, token: `tok_${newUser.id}` })
  }

  user.lastActive = 'Just now'
  saveData('users.json', users)
  const { password: _, ...userSafe } = user
  res.json({ user: userSafe, token: `tok_${user.id}` })
})

/** User Registration */
app.post('/api/auth/register', (req, res) => {
  const {
    name,
    email,
    password,
    role = 'Student',
    country = 'Bangladesh',
    targetBand = 7.5,
    examModule = 'Academic',
    targetTimeline = '1–3 months',
    targetCountry = 'United Kingdom',
    primaryFocus = 'Speaking'
  } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const users = readData('users.json', [])
  const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' })
  }

  const newUser = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    name: (name || email.split('@')[0]).trim(),
    email: email.trim(),
    password,
    country,
    role: role || 'Student',
    status: 'Active',
    targetBand: Number(targetBand) || 7.5,
    currentBand: 6.0,
    examModule,
    targetTimeline,
    targetCountry,
    primaryFocus,
    institution: 'East West University',
    bio: `Dedicated learner preparing for IELTS ${examModule} targeting Band ${targetBand} for ${targetCountry}.`,
    lastActive: 'Just now',
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  saveData('users.json', users)
  const { password: _, ...userSafe } = newUser
  res.status(201).json({ user: userSafe, token: `tok_${newUser.id}` })
})

/** Get current user profile */
app.get('/api/auth/me', (req, res) => {
  const emailHeader = req.headers['x-user-email']
  const users = readData('users.json', [])
  const user = emailHeader ? users.find(u => u.email.toLowerCase() === String(emailHeader).toLowerCase()) : users[0]
  if (!user) return res.status(404).json({ error: 'User not found' })
  const { password: _, ...userSafe } = user
  res.json({ user: userSafe })
})

/** Update user profile */
app.put('/api/users/profile', (req, res) => {
  const { email, name, country, targetBand, institution, bio, phone } = req.body
  if (!email) return res.status(400).json({ error: 'User email is required' })

  const users = readData('users.json', [])
  const index = users.findIndex(u => u.email.toLowerCase() === email.trim().toLowerCase())
  if (index === -1) return res.status(404).json({ error: 'User not found' })

  if (name !== undefined) users[index].name = name.trim()
  if (country !== undefined) users[index].country = country.trim()
  if (targetBand !== undefined) users[index].targetBand = Number(targetBand)
  if (institution !== undefined) users[index].institution = institution.trim()
  if (bio !== undefined) users[index].bio = bio.trim()
  if (phone !== undefined) users[index].phone = phone.trim()
  users[index].lastActive = 'Just now'

  saveData('users.json', users)
  const { password: _, ...userSafe } = users[index]
  res.json({ user: userSafe })
})

/** Get all users (Admin view) */
app.get('/api/users', (req, res) => {
  const users = readData('users.json', [])
  const safeUsers = users.map(({ password, ...u }) => u)
  res.json({ users: safeUsers, total: safeUsers.length })
})

/** Invite / Create new user (Admin console) */
app.post('/api/users', (req, res) => {
  const { name, email, country = 'Bangladesh', role = 'Student', status = 'Active' } = req.body
  if (!email || !name) return res.status(400).json({ error: 'Name and email are required' })

  const users = readData('users.json', [])
  if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(400).json({ error: 'User with this email already exists' })
  }

  const newUser = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    name: name.trim(),
    email: email.trim(),
    password: 'password123',
    country,
    role,
    status,
    targetBand: 7.5,
    currentBand: 6.5,
    institution: 'East West University',
    bio: 'Learner profile created via Administrator Console.',
    lastActive: status === 'Active' ? 'Just now' : 'Not joined',
    createdAt: new Date().toISOString()
  }

  users.unshift(newUser)
  saveData('users.json', users)
  const { password: _, ...userSafe } = newUser
  res.status(201).json({ user: userSafe })
})

/** Toggle user status (Active / Suspended) */
app.patch('/api/users/:id/status', (req, res) => {
  const { id } = req.params
  const users = readData('users.json', [])
  const user = users.find(u => u.id === id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (user.role === 'Admin') {
    return res.status(403).json({ error: 'Cannot suspend an Administrator account' })
  }

  user.status = user.status === 'Active' ? 'Suspended' : 'Active'
  saveData('users.json', users)
  const { password: _, ...userSafe } = user
  res.json({ user: userSafe })
})

// ==========================================================================
// 3. EXAM RESULTS & DASHBOARD ANALYTICS (Dynamic Scoring & Real Tracking)
// ==========================================================================

/** Get exam results */
app.get('/api/results', (req, res) => {
  const { email, userId } = req.query
  const results = readData('results.json', [])
  if (email || userId) {
    const filtered = results.filter(r => {
      const matchEmail = email && r.userEmail && r.userEmail.toLowerCase() === email.toLowerCase()
      const matchId = userId && r.userId && r.userId === userId
      return matchEmail || matchId
    })
    return res.json({ results: filtered })
  }
  res.json({ results })
})

/** Save new exam result or writing evaluation */
app.post('/api/results', (req, res) => {
  const newResult = {
    id: req.body.id || `res-${Date.now()}`,
    userId: req.body.userId || '',
    userName: req.body.userName || 'Student',
    userEmail: req.body.userEmail || '',
    testTitle: req.body.testTitle || 'IELTS Practice Session',
    testType: req.body.testType || 'Listening',
    completedAt: req.body.completedAt || new Date().toISOString(),
    overallBand: req.body.overallBand !== undefined ? req.body.overallBand : null,
    skillBands: req.body.skillBands || {},
    correctAnswers: req.body.correctAnswers,
    totalQuestions: req.body.totalQuestions,
    userAnswers: req.body.userAnswers || {},
    comment: req.body.comment || 'Performance recorded and analyzed by the evaluation engine.',
    source: req.body.source || 'Automatic'
  }

  const results = readData('results.json', [])
  // Prevent duplicates by ID
  const filtered = results.filter(r => r.id !== newResult.id)
  filtered.unshift(newResult)
  saveData('results.json', filtered)

  // Update user's currentBand if overallBand is available
  if (typeof newResult.overallBand === 'number') {
    const users = readData('users.json', [])
    const user = users.find(u => 
      (newResult.userEmail && u.email && u.email.toLowerCase() === newResult.userEmail.toLowerCase()) ||
      (newResult.userId && u.id === newResult.userId) ||
      (newResult.userName && u.name === newResult.userName)
    )
    if (user) {
      // Recalculate average band across all completed tests for this user
      const userTests = filtered.filter(r => 
        ((r.userEmail && user.email && r.userEmail.toLowerCase() === user.email.toLowerCase()) ||
         (r.userId && user.id && r.userId === user.id)) && 
        typeof r.overallBand === 'number'
      )
      if (userTests.length > 0) {
        const sum = userTests.reduce((acc, t) => acc + t.overallBand, 0)
        user.currentBand = Number((sum / userTests.length).toFixed(2))
        saveData('users.json', users)
      }
    }
  }

  res.status(201).json({ result: newResult, totalResults: filtered.length })
})

/** Delete an exam result */
app.delete('/api/results/:id', (req, res) => {
  const { id } = req.params
  const results = readData('results.json', [])
  const filtered = results.filter(r => r.id !== id)
  saveData('results.json', filtered)
  res.json({ success: true, remaining: filtered.length })
})

/** Dynamic Dashboard Statistics (Computed from real user attempts) */
app.get('/api/dashboard/stats', (req, res) => {
  const { email } = req.query
  const results = readData('results.json', [])
  const users = readData('users.json', [])
  const user = email ? users.find(u => u.email.toLowerCase() === email.toLowerCase()) : null
  const userTarget = user && typeof user.targetBand === 'number' ? user.targetBand : 8.0

  // Filter results strictly for this specific user if logged in
  const userResults = (email && user)
    ? results.filter(r => (r.userEmail && r.userEmail.toLowerCase() === email.toLowerCase()) || (r.userId && r.userId === user.id))
    : (email ? [] : results)

  // Calculate dynamic skill scores strictly from real records
  const skillScores = {
    Reading: { total: 0, count: 0, target: userTarget },
    Listening: { total: 0, count: 0, target: userTarget },
    Writing: { total: 0, count: 0, target: userTarget },
    Speaking: { total: 0, count: 0, target: userTarget }
  }

  userResults.forEach(r => {
    const band = typeof r.overallBand === 'number' ? r.overallBand : (typeof r.bandScore === 'number' ? r.bandScore : null)
    if (r.testType === 'Reading' && band !== null) {
      skillScores.Reading.total += band
      skillScores.Reading.count++
    } else if (r.testType === 'Listening' && band !== null) {
      skillScores.Listening.total += band
      skillScores.Listening.count++
    } else if (r.testType === 'Writing' && band !== null) {
      skillScores.Writing.total += band
      skillScores.Writing.count++
    } else if (r.testType === 'Speaking' && band !== null) {
      skillScores.Speaking.total += band
      skillScores.Speaking.count++
    } else if (r.skillBands) {
      if (typeof r.skillBands.Reading === 'number') { skillScores.Reading.total += r.skillBands.Reading; skillScores.Reading.count++ }
      if (typeof r.skillBands.Listening === 'number') { skillScores.Listening.total += r.skillBands.Listening; skillScores.Listening.count++ }
      if (typeof r.skillBands.Writing === 'number') { skillScores.Writing.total += r.skillBands.Writing; skillScores.Writing.count++ }
      if (typeof r.skillBands.Speaking === 'number') { skillScores.Speaking.total += r.skillBands.Speaking; skillScores.Speaking.count++ }
    }
  })

  const computedSkills = Object.keys(skillScores).map(skill => {
    const s = skillScores[skill]
    const hasAttempts = s.count > 0
    const avg = hasAttempts ? Number((s.total / s.count).toFixed(1)) : null
    return {
      skill,
      score: avg,
      hasAttempts,
      attemptsCount: s.count,
      target: s.target,
      color: avg !== null ? (avg >= 7.5 ? '#059669' : avg >= 6.5 ? '#DC2626' : '#D97706') : '#94A3B8',
      bg: avg !== null ? (avg >= 7.5 ? '#D1FAE5' : avg >= 6.5 ? '#FEE2E2' : '#FEF3C7') : '#F1F5F9'
    }
  })

  const skillsWithAttempts = computedSkills.filter(s => s.hasAttempts)
  const overallScore = skillsWithAttempts.length > 0
    ? Number((skillsWithAttempts.reduce((a, s) => a + (s.score || 0), 0) / skillsWithAttempts.length).toFixed(1))
    : 0

  // Recent activity formatted dynamically
  const activities = userResults.slice(0, 5).map(r => {
    const timeAgo = formatTimeAgo(new Date(r.completedAt))
    let displayScore = '—'
    if (r.overallBand !== null) displayScore = `${r.overallBand}`
    else if (r.correctAnswers !== undefined) displayScore = `${r.correctAnswers}/${r.totalQuestions}`
    
    return {
      id: r.id,
      type: r.testType,
      title: r.testTitle,
      score: displayScore,
      time: timeAgo,
      status: r.source === 'AI' ? 'evaluated' : 'complete'
    }
  })

  // Dynamic recommendations based on weakest or unassessed skill
  const weakest = [...computedSkills].sort((a, b) => {
    if (a.score === null && b.score !== null) return -1
    if (a.score !== null && b.score === null) return 1
    return (a.score || 0) - (b.score || 0)
  })[0]

  const weakestScoreText = typeof weakest?.score === 'number' ? `Band ${weakest.score.toFixed(1)}` : 'Unassessed'
  const weakestTarget = typeof weakest?.target === 'number' ? weakest.target.toFixed(1) : '8.0'

  const recommendations = [
    {
      title: weakest?.score !== null
        ? `Focus on ${weakest.skill} (Current: ${weakestScoreText})`
        : `Start Your ${weakest.skill} Diagnostic Practice`,
      desc: weakest?.score !== null
        ? `Your ${weakest.skill} band is currently below your target of ${weakestTarget}. Dedicated practice sessions will yield the fastest overall band improvement.`
        : `Complete a ${weakest.skill} test to establish your baseline and measure progress toward your Band ${weakestTarget} target.`,
      priority: 'HIGH',
      link: weakest?.skill === 'Writing' ? '/writing' : '/practice'
    },
    {
      title: 'Expand Academic Vocabulary (AWL 1–4)',
      desc: 'Increase your Academic Word List coverage to ensure high lexical resource scores across Writing and Speaking.',
      priority: 'MEDIUM',
      link: '/resources'
    },
    {
      title: 'Listening Speed Drills (1.25x)',
      desc: 'Practice Cambridge audio tracks with the built-in 1.25x speed multiplier to build rapid listening reflexes.',
      priority: 'MEDIUM',
      link: '/practice'
    }
  ]

  res.json({
    skillScores: computedSkills,
    overallBand: overallScore,
    targetBand: userTarget,
    totalTestsCompleted: results.length,
    recentActivities: activities,
    recommendations,
    weeklyProgress: [
      { day: 'Mon', mins: 65 }, { day: 'Tue', mins: 90 }, { day: 'Wed', mins: 45 },
      { day: 'Thu', mins: 120 }, { day: 'Fri', mins: 80 }, { day: 'Sat', mins: 30 }, { day: 'Sun', mins: 15 }
    ]
  })
})

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ==========================================================================
// 4. STUDY TASKS API (Dynamic Task Management)
// ==========================================================================

app.get('/api/tasks', (req, res) => {
  const tasks = readData('tasks.json', [])
  res.json({ tasks })
})

app.post('/api/tasks', (req, res) => {
  const { title, due = 'This week' } = req.body
  if (!title) return res.status(400).json({ error: 'Task title is required' })

  const tasks = readData('tasks.json', [])
  const newTask = {
    id: Date.now(),
    userId: 'USR-1048',
    title: title.trim(),
    due,
    complete: false
  }

  tasks.unshift(newTask)
  saveData('tasks.json', tasks)
  res.status(201).json({ task: newTask })
})

app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id)
  const tasks = readData('tasks.json', [])
  const task = tasks.find(t => t.id === id)
  if (!task) return res.status(404).json({ error: 'Task not found' })

  if (req.body.complete !== undefined) task.complete = Boolean(req.body.complete)
  if (req.body.title) task.title = req.body.title.trim()
  if (req.body.due) task.due = req.body.due

  saveData('tasks.json', tasks)
  res.json({ task })
})

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id)
  const tasks = readData('tasks.json', [])
  const filtered = tasks.filter(t => t.id !== id)
  saveData('tasks.json', filtered)
  res.json({ success: true })
})

// ==========================================================================
// 5. AI WRITING EVALUATION & DOCUMENT GENERATION
// ==========================================================================

/** AI Engine Status Endpoint */
app.get('/api/ai/status', (req, res) => {
  res.json({
    provider: 'puku.sh',
    model: PUKU_MODEL,
    baseUrl: PUKU_BASE_URL,
    configured: true,
    keyPrefix: 'pk_live_GtUSwEf...',
    fallbackEngine: 'Vistora Academic Rule-based NLP Engine'
  })
})

/** Dynamic Essay Evaluation with Puku.sh AI + Local Fallback */
app.post('/api/writing/evaluate', async (req, res) => {
  const { task = '2', prompt = '', essay = '' } = req.body
  if (!essay.trim()) {
    return res.status(400).json({ error: 'Essay content cannot be empty' })
  }

  // 1. Calculate local fast linguistic and lexical metrics
  const localEval = evaluateEssay(task, prompt, essay)

  // 2. Query Puku.sh AI (puku-ai-2.8) for deep qualitative examiner feedback
  try {
    const pukuEval = await evaluateWritingWithPuku(task === '1' ? 'Task 1' : 'Task 2', prompt, essay)
    if (pukuEval && typeof pukuEval.overallBand === 'number' && pukuEval.criteria) {
      return res.json({
        ...localEval,
        band: pukuEval.overallBand,
        ta: pukuEval.criteria.taskAchievement?.band ?? localEval.ta,
        cc: pukuEval.criteria.coherenceCohesion?.band ?? localEval.cc,
        lr: pukuEval.criteria.lexicalResource?.band ?? localEval.lr,
        gra: pukuEval.criteria.grammaticalAccuracy?.band ?? localEval.gra,
        summary: pukuEval.summary || localEval.summary,
        improvements: pukuEval.improvements && pukuEval.improvements.length ? pukuEval.improvements : localEval.improvements,
        strengths: pukuEval.strengths,
        criteriaFeedback: {
          ta: pukuEval.criteria.taskAchievement?.feedback,
          cc: pukuEval.criteria.coherenceCohesion?.feedback,
          lr: pukuEval.criteria.lexicalResource?.feedback,
          gra: pukuEval.criteria.grammaticalAccuracy?.feedback
        },
        aiEngine: 'Puku.sh (puku-ai-2.8 Examiner)'
      })
    }
  } catch (err) {
    console.warn('[Puku AI Evaluation] Fallback to local rule engine:', err.message)
  }

  // Graceful fallback to local rule-based evaluation
  res.json({
    ...localEval,
    aiEngine: 'Vistora Local NLP Engine (Rule-based)'
  })
})

/** Dynamic Speaking Evaluation with Puku.sh AI + Local Fallback */
app.post('/api/speaking/evaluate', async (req, res) => {
  const {
    part = 1,
    title = '',
    questions = [],
    transcript = '',
    durationSeconds = 60,
    wordCount = 0,
    userId,
    userName,
    testTitle
  } = req.body

  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ error: 'Spoken transcript cannot be empty' })
  }

  let evalResult = null

  // 1. Try Puku AI
  try {
    evalResult = await evaluateSpeakingWithPuku({
      part,
      title,
      questions,
      transcript,
      durationSeconds,
      wordCount
    })
  } catch (err) {
    console.warn('[Puku AI Speaking Evaluation] Fallback to local rule engine:', err.message)
  }

  // 2. Fallback to local rule engine if AI is unavailable or failed
  if (!evalResult) {
    evalResult = evaluateSpeakingLocally({
      part,
      transcript,
      durationSeconds,
      wordCount
    })
  }

  // 3. Auto-save result if testTitle provided
  if (testTitle && evalResult.overallBand) {
    try {
      const results = readData('results.json')
      const newResult = {
        id: `s-${Date.now()}`,
        userId: userId || 'USR-1048',
        userName: userName || 'Candidate',
        testTitle,
        testType: 'Speaking',
        completedAt: new Date().toISOString(),
        overallBand: evalResult.overallBand,
        skillBands: { Speaking: evalResult.overallBand },
        userAnswers: { transcript, durationSeconds, wordCount },
        comment: evalResult.summary || 'Speaking practice evaluated by AI.',
        source: evalResult.source?.includes('puku') ? 'AI' : 'Automatic'
      }
      results.unshift(newResult)
      saveData('results.json', results.slice(0, 100))
    } catch (saveErr) {
      console.warn('[Speaking Result Save Error]:', saveErr.message)
    }
  }

  res.json(evalResult)
})

/** Dynamic Document Generation with Puku.sh AI + Local Fallback */
app.post('/api/documents/generate', async (req, res) => {
  const { documentType = 'sop', details = {}, candidate = {} } = req.body

  // Try generating with Puku.sh AI
  try {
    const aiGenerated = await generateDocumentWithPuku(documentType, {
      ...details,
      fullName: details.name || candidate.name || details.fullName || 'Applicant',
      name: details.name || candidate.name || details.fullName || 'Applicant',
      email: details.email || candidate.email || '',
      country: details.country || candidate.country || '',
      ielts: details.ielts || candidate.targetBand || '',
      degree: details.degree || details.targetDegree || details.program || details.background || '',
      university: details.university || details.targetUniversity || details.institution || '',
      skills: details.skills || '',
      experience: details.experience || details.workExperience || details.keyAchievements || '',
      background: details.background || details.academicBackground || '',
      interests: details.interests || details.researchInterests || details.researchInterest || '',
      goals: details.goals || details.careerGoals || '',
      why: details.why || '',
      motivation: details.motivation || '',
      extra: details.extra || '',
      position: details.position || '',
      company: details.company || '',
      tone: details.tone || 'Formal Academic'
    })

    if (aiGenerated && aiGenerated.trim().length > 100) {
      return res.json({
        content: aiGenerated.trim(),
        documentType,
        source: 'Puku.sh (puku-ai-2.8)'
      })
    }
  } catch (err) {
    console.warn('[Puku AI Document] Fallback to local compiler:', err.message)
  }

  // Graceful fallback to local compiler
  const content = generateDocumentContent(documentType, details, candidate)
  res.json({
    content,
    documentType,
    source: 'Vistora Document Compiler (Local Fallback)'
  })
})

// ==========================================================================
// 6. COMMUNITY FORUM API (Real Threads, Replies, Upvotes)
// ==========================================================================

app.get('/api/forum/threads', (req, res) => {
  const { category, query } = req.query
  let threads = readData('forum.json', [])

  if (category && category !== 'All Topics') {
    threads = threads.filter(t => t.category.toLowerCase() === category.toLowerCase())
  }

  if (query) {
    const q = query.toLowerCase()
    threads = threads.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.preview.toLowerCase().includes(q) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
    )
  }

  res.json({ threads, total: threads.length })
})

app.post('/api/forum/threads', (req, res) => {
  const { title, category = 'Writing Help', content, tags = [], author = 'Ayaan Rahman' } = req.body
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' })
  }

  const threads = readData('forum.json', [])
  const newThread = {
    id: Date.now(),
    category,
    title: title.trim(),
    author,
    avatar: author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'US',
    country: 'Bangladesh',
    time: 'Just now',
    replies: 0,
    views: 1,
    upvotes: 1,
    pinned: false,
    solved: false,
    preview: content.slice(0, 140) + '...',
    content: content.trim(),
    tags: Array.isArray(tags) && tags.length > 0 ? tags : ['General', category],
    replyList: []
  }

  threads.unshift(newThread)
  saveData('forum.json', threads)
  res.status(201).json({ thread: newThread })
})

app.post('/api/forum/threads/:id/replies', (req, res) => {
  const threadId = Number(req.params.id)
  const { content, author = 'Ayaan Rahman' } = req.body
  if (!content) return res.status(400).json({ error: 'Reply content cannot be empty' })

  const threads = readData('forum.json', [])
  const thread = threads.find(t => t.id === threadId)
  if (!thread) return res.status(404).json({ error: 'Thread not found' })

  const newReply = {
    id: `rep-${Date.now()}`,
    author,
    avatar: author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'US',
    time: 'Just now',
    content: content.trim()
  }

  if (!thread.replyList) thread.replyList = []
  thread.replyList.push(newReply)
  thread.replies = thread.replyList.length
  saveData('forum.json', threads)

  res.status(201).json({ reply: newReply, thread })
})

app.post('/api/forum/threads/:id/upvote', (req, res) => {
  const threadId = Number(req.params.id)
  const threads = readData('forum.json', [])
  const thread = threads.find(t => t.id === threadId)
  if (!thread) return res.status(404).json({ error: 'Thread not found' })

  thread.upvotes = (thread.upvotes || 0) + 1
  saveData('forum.json', threads)
  res.json({ upvotes: thread.upvotes })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`)
  console.log(` 🎧 CSE412 IELTS Listening & Full-Stack Server running`)
  console.log(` 🌐 Local URL:  http://localhost:${PORT}`)
  console.log(` 📂 Database:   ${DATABASE_DIR}`)
  console.log(` 📡 Health API: http://localhost:${PORT}/api/health`)
  console.log(` 🎵 Catalog:    http://localhost:${PORT}/api/audio/catalog`)
  console.log(` 📊 Analytics:  http://localhost:${PORT}/api/dashboard/stats`)
  console.log(`=======================================================`)
})
