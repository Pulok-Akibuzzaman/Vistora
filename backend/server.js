import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'

const app = express()
const PORT = process.env.PORT || 5001
const DATABASE_DIR = path.resolve(import.meta.dirname, '../Database')

// Enable CORS for all frontend origins (Vite default 8443, 5173, 3000, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Range', 'Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type'],
}))

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    // Log audio streams and api calls
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
    // Range format: "bytes=start-end"
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
    // Entire file
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

// --------------------------------------------------------------------------
// API Routes
// --------------------------------------------------------------------------

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

/**
 * Stream audio by Book, Test, and Part
 * Example: GET /api/audio/stream/18/1/1 -> streams IELTS 18 Test 1 Audio 1
 */
app.get('/api/audio/stream/:book/:test/:part', (req, res) => {
  const { book, test, part } = req.params
  const catalog = scanAudioCatalog()

  const bookNum = String(book).replace(/[^0-9]/g, '')
  const testNum = parseInt(test, 10)
  const partNum = parseInt(part, 10)

  // Find matching audio
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

/**
 * Stream audio by direct relative path from Database folder
 * Example: GET /api/audio/file?path=IELTS 18 AUDIO/IELTS18_test1_audio1.mp3
 */
app.get('/api/audio/file', (req, res) => {
  const relPath = req.query.path
  if (!relPath) {
    return res.status(400).json({ error: 'Missing path query parameter' })
  }

  // Prevent path traversal attacks
  const safePath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, '')
  const fullPath = path.join(DATABASE_DIR, safePath)

  if (!fullPath.startsWith(DATABASE_DIR)) {
    return res.status(403).json({ error: 'Forbidden path traversal' })
  }

  streamAudioFile(fullPath, req, res)
})

/**
 * List available resources (PDF books)
 */
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

/**
 * Stream or download PDF book
 */
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`)
  console.log(` 🎧 CSE412 IELTS Listening Audio Server running`)
  console.log(` 🌐 Local URL:  http://localhost:${PORT}`)
  console.log(` 📂 Database:   ${DATABASE_DIR}`)
  console.log(` 📡 Health API: http://localhost:${PORT}/api/health`)
  console.log(` 🎵 Catalog:    http://localhost:${PORT}/api/audio/catalog`)
  console.log(`=======================================================`)
})
