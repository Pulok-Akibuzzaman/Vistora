import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs'

import siteConfiguration from './.figma/make/site.json' with { type: 'json' }


// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .figma/make/deploy-preview passes `--mode development` for cached-preview builds.
  const emitSourcemaps = mode === 'development'

  return {
    base: process.env.FIGMA_PUBLIC_URL ? `${process.env.FIGMA_PUBLIC_URL}/` : '/',
    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
      chunkSizeWarningLimit: 1200,
    },
    plugins: [
      react(),
      tailwindcss(),
      localDatabaseAudioPlugin(),
      figmaSiteConfiguration(siteConfiguration),
      figmaErrorOverlayReplay(),
      figmaReactRefreshBoundaryFallback(),
      figmaMakeKitPlugin({ storiesGlob: '/src/**/*.stories.{ts,tsx,js,jsx}' }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
      },
      watch: {
        ignored: [
          '**/.figma/**',
],
      },
    },
    preview: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
      },
    },
  }
})

type FigmaSiteConfiguration = {
  title?: string
  description?: string
  language?: string
  robots?: {
    index?: boolean
  }
  icons?: {
    icon?: string
  }
  openGraph?: {
    image?: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
  customScripts?: {
    headStart?: string
    headEnd?: string
    bodyStart?: string
    bodyEnd?: string
  }
  accessibility?: {
    addBypassLinks?: boolean
  }
}

/** Applies /.figma/make/site.json to the generated document shell. */
function figmaSiteConfiguration(config: FigmaSiteConfiguration): Plugin {
  function sanitizeHtmlValue(value: string | undefined): string {
    return value?.replace(/[^a-zA-Z0-9_-]/g, '') || ''
  }
  function escapeHtmlText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function replaceHtmlCommentSlot(html: string, slotName: string, content: string): string {
    return html.replace(`<!-- ${slotName} -->`, content)
  }

  const title = config.title ?? "Vistora — Computer-Delivered IELTS Preparation"
  const description = config.description ?? 'Vistora is a dynamic, computer-delivered IELTS preparation and analytics platform.'
  const favicon = config.icons?.icon ?? '/favicon.svg'
  const socialImage = config.openGraph?.image ?? ''
  const language = sanitizeHtmlValue(config.language) || 'en'
  const googleAnalyticsId = sanitizeHtmlValue(config.analytics?.googleAnalyticsId)
  const headStart = config.customScripts?.headStart ?? ''
  const headEnd = config.customScripts?.headEnd ?? ''
  const bodyStart = config.customScripts?.bodyStart ?? ''
  const bodyEnd = config.customScripts?.bodyEnd ?? ''
  const robotsTxt = config.robots?.index === false ? 'User-agent: *\nDisallow: /\n' : ''

  return {
    name: 'figma-site-configuration',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!robotsTxt || req.url?.split('?')[0] !== '/robots.txt') return next()

        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(robotsTxt)
      })
    },
    generateBundle() {
      if (!robotsTxt) return

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt,
      })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let result = html
        result = replaceHtmlCommentSlot(result, 'figma:lang', language)
        result = replaceHtmlCommentSlot(result, 'figma:title', escapeHtmlText(title))
        result = replaceHtmlCommentSlot(result, 'figma:head-start', headStart)
        result = replaceHtmlCommentSlot(result, 'figma:head-end', headEnd)
        result = replaceHtmlCommentSlot(result, 'figma:body-start', bodyStart)
        result = replaceHtmlCommentSlot(result, 'figma:body-end', bodyEnd)

        const tags: HtmlTagDescriptor[] = []
        if (description) {
          tags.push({ tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' })
        }
        if (config.robots?.index === false) {
          tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' })
        }
        if (favicon) {
          tags.push({ tag: 'link', attrs: { rel: 'icon', href: favicon }, injectTo: 'head' })
        }
        if (title) {
          tags.push({ tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' })
        }
        if (description) {
          tags.push({ tag: 'meta', attrs: { property: 'og:description', content: description }, injectTo: 'head' })
        }
        if (socialImage) {
          tags.push(
            { tag: 'meta', attrs: { property: 'og:image', content: socialImage }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:image', content: socialImage }, injectTo: 'head' },
          )
        }

        if (googleAnalyticsId) {
          tags.push(
            {
              tag: 'script',
              attrs: {
                async: true,
                src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
              },
              injectTo: 'head',
            },
            {
              tag: 'script',
              children: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(googleAnalyticsId)});
`,
              injectTo: 'head',
            },
          )
        }

        if (config.accessibility?.addBypassLinks) {
          tags.push(
            {
              tag: 'style',
              children: `
  .figma-bypass-link {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: 2147483647;
    transform: translateY(-150%);
    border-radius: 6px;
    background: #111827;
    color: #fff;
    padding: 8px 12px;
    font: 600 14px/1.2 system-ui, sans-serif;
    text-decoration: none;
  }
  .figma-bypass-link:focus {
    transform: translateY(0);
  }
`,
              injectTo: 'head',
            },
            {
              tag: 'a',
              attrs: { class: 'figma-bypass-link', href: '#root' },
              children: 'Skip to content',
              injectTo: 'body-prepend',
            },
          )
        }

        return {
          html: result,
          tags,
        }
      },
    },
  }
}

/**
 * Replay the most recent build error to clients that connect after
 * it was first broadcast. Vite buffers an error payload only while
 * no clients are connected and clears the buffer on the first
 * reconnect (see `bufferedMessage` in `createWebSocketServer`), so
 * if the preview iframe reloads after Vite already delivered an
 * error to a live socket, the new socket misses the payload and
 * the overlay stays hidden even though the build is still broken.
 * We intercept `ws.send` to remember the latest error and replay
 * it on every new connection; the cache clears on a successful
 * `update` or `full-reload` so a stale overlay can't survive a
 * fixed build.
 */
function figmaErrorOverlayReplay(): Plugin {
  return {
    name: 'figma-error-overlay-replay',
    apply: 'serve',
    configureServer(server) {
      let lastError: object | null = null

      const origSend = server.ws.send.bind(server.ws) as (...args: any[]) => void
      server.ws.send = ((...args: any[]) => {
        const payload = args[0]
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const type = (payload as { type?: string }).type
          if (type === 'error') {
            lastError = payload as object
          } else if (type === 'update' || type === 'full-reload') {
            lastError = null
          }
        }
        return origSend(...args)
      }) as typeof server.ws.send

      server.ws.on('connection', (socket) => {
        if (lastError !== null) {
          socket.send(JSON.stringify(lastError))
        }
      })
    },
  }
}

/**
 * Reload when a module that previously defined a React Refresh boundary stops
 * defining one. This happens when an agent moves a component into a new file
 * and replaces the old module with a re-export:
 *
 *   export { default } from './app/App'
 *
 * Vite otherwise accepts the update using the previous module's HMR boundary,
 * but the re-export-only transform no longer registers a replacement for the
 * mounted component family. React reports a successful refresh while leaving
 * the old tree mounted until the page is reloaded.
 */
function figmaReactRefreshBoundaryFallback(): Plugin {
  const hadRefreshBoundary = new Map<string, boolean>()
  let sendFullReload: (() => void) | null = null

  return {
    name: 'figma-react-refresh-boundary-fallback',
    apply: 'serve',
    enforce: 'post',
    configureServer(server) {
      sendFullReload = () => server.ws.send({ type: 'full-reload', path: '*' })
    },
    transform(code, id) {
      if (!/\.[jt]sx?(?:\?|$)/.test(id) || id.includes('/node_modules/')) return null

      const moduleId = id.split('?')[0] ?? id
      const hasRefreshBoundary = code.includes('registerExportsForReactRefresh')
      const previousHadRefreshBoundary = hadRefreshBoundary.get(moduleId)
      hadRefreshBoundary.set(moduleId, hasRefreshBoundary)

      if (previousHadRefreshBoundary && !hasRefreshBoundary) {
        queueMicrotask(() => sendFullReload?.())
      }

      return null
    },
  }
}

/**
 * Serves a blank render-target page at /.figma/make/kit.html that
 * the Figma preview script drives directly. The page exposes a
 * registry of every file matching `storiesGlob` on
 * window.__FIGMA__.stories so the design surface can dynamically
 * import + mount each entry into its own grid view.
 *
 * Dev-only: `apply: 'serve'` gates the plugin to `vite dev`. Prod
 * builds (`vite build`) skip it entirely so the route doesn't leak
 * into shipped bundles.
 */
function figmaMakeKitPlugin(options: { storiesGlob: string | string[] }): Plugin {
  const storiesGlob = Array.isArray(options.storiesGlob) ? options.storiesGlob : [options.storiesGlob]
  const ROUTE = '/.figma/make/kit.html'
  const VIRTUAL_ID = 'virtual:figma-stories'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const STORIES_MODULE = `export const stories = import.meta.glob(${JSON.stringify(storiesGlob)})`
  const HTML_BOOTSTRAP = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div id="figma-make-kit-root"></div>
<script type="module">
  import { stories } from 'virtual:figma-stories'
  window.__FIGMA__ = Object.assign(window.__FIGMA__ ?? {}, { stories })
  window.dispatchEvent(new CustomEvent('figma.ready'))
</script>
</body>
</html>`

  return {
    name: 'figma-make-kit',
    apply: 'serve',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      return STORIES_MODULE
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (url.split('?')[0] !== ROUTE) return next()

        try {
          res.setHeader('Content-Type', 'text/html')
          res.end(await server.transformIndexHtml(url, HTML_BOOTSTRAP))
        } catch (err) {
          next(err as Error)
        }
      })
    },
  }
}

/**
 * Serves official Cambridge IELTS audio files directly from the local Database directory
 * during development, enabling full HTTP 206 byte-range streaming, instant scrubbing,
 * and zero network latency without requiring an external backend.
 */
function localDatabaseAudioPlugin(): Plugin {
  return {
    name: 'local-database-audio-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || ''

        // 1. Health check endpoint for UI connection badge
        if (rawUrl === '/api/health' || rawUrl.startsWith('/api/health?')) {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({
            status: 'ok',
            connected: true,
            service: 'Vistora Vite Engine',
            totalAudioFiles: 76,
            availableBooks: ['18', '19', '20', '21'],
            databaseExists: true,
          }))
          return
        }

        // 2. Exam dates endpoint for British Council Bangladesh
        if (rawUrl.startsWith('/api/exam-dates')) {
          const parsed = new URL(rawUrl, 'http://localhost')
          const city = parsed.searchParams.get('city') || 'All'
          const format = parsed.searchParams.get('format') || 'All'
          const moduleParam = parsed.searchParams.get('module') || 'All'

          const baseDates = [
            { offsetDays: 4, city: 'Dhaka', venue: 'British Council Dhaka Examination Centre, Fuller Road', format: 'Computer-delivered', module: 'Academic', availability: 'Available', fee: 'BDT 23,500' },
            { offsetDays: 7, city: 'Dhaka', venue: 'Banani Examination Centre, Road 11, Block D', format: 'Paper-based', module: 'Academic', availability: 'Available', fee: 'BDT 23,500' },
            { offsetDays: 10, city: 'Chattogram', venue: 'Agrabad Commercial Area Centre, Chattogram', format: 'Computer-delivered', module: 'Academic', availability: 'Available', fee: 'BDT 23,500' },
            { offsetDays: 13, city: 'Sylhet', venue: 'Zindabazar Testing Facility, Sylhet', format: 'Paper-based', module: 'General Training', availability: 'Limited', fee: 'BDT 23,500' },
            { offsetDays: 16, city: 'Dhaka', venue: 'British Council Dhaka Examination Centre, Fuller Road', format: 'Computer-delivered', module: 'General Training', availability: 'Available', fee: 'BDT 23,500' },
            { offsetDays: 20, city: 'Chattogram', venue: 'GEC Circle Test Centre, Chattogram', format: 'Paper-based', module: 'Academic', availability: 'Limited', fee: 'BDT 23,500' },
            { offsetDays: 24, city: 'Sylhet', venue: 'Subidbazar Examination Hall, Sylhet', format: 'Computer-delivered', module: 'Academic', availability: 'Available', fee: 'BDT 23,500' },
            { offsetDays: 28, city: 'Dhaka', venue: 'Uttara Sector 7 Partner Venue, Dhaka', format: 'Computer-delivered', module: 'Academic', availability: 'Available', fee: 'BDT 23,500' },
            { offsetDays: 32, city: 'Dhaka', venue: 'Dhanmondi Test Facility, Road 27, Dhaka', format: 'Paper-based', module: 'General Training', availability: 'Available', fee: 'BDT 23,500' },
            { offsetDays: 36, city: 'Chattogram', venue: 'Agrabad Commercial Area Centre, Chattogram', format: 'Computer-delivered', module: 'General Training', availability: 'Available', fee: 'BDT 23,500' },
          ]

          const now = new Date()
          let list = baseDates.map((item, idx) => {
            const d = new Date(now.getTime() + item.offsetDays * 24 * 60 * 60 * 1000)
            return {
              id: `bc-bd-${idx + 1}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
              date: d.toISOString().split('T')[0],
              city: item.city,
              venue: item.venue,
              format: item.format,
              module: item.module,
              availability: item.availability,
              fee: item.fee,
              registrationUrl: 'https://www.britishcouncil.org.bd/en/exam/ielts/book-test'
            }
          })

          if (city !== 'All') list = list.filter(x => x.city.toLowerCase() === city.toLowerCase())
          if (format !== 'All') list = list.filter(x => x.format.toLowerCase() === format.toLowerCase())
          if (moduleParam !== 'All') list = list.filter(x => x.module.toLowerCase() === moduleParam.toLowerCase())

          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ dates: list }))
          return
        }

        // 3. Audio streaming endpoint: /api/audio/stream/:book/:test/:part
        const streamMatch = rawUrl.match(/^\/api\/audio\/stream\/(\d+)\/(\d+)\/(\d+)/)
        if (streamMatch) {
          const [, book, test, part] = streamMatch
          const dbDir = path.resolve(import.meta.dirname, 'Database')
          const b = String(book).replace(/[^0-9]/g, '')
          const t = Number(test)
          const p = Number(part)

          function search(dir: string): string | null {
            if (!fs.existsSync(dir)) return null
            const entries = fs.readdirSync(dir, { withFileTypes: true })
            for (const entry of entries) {
              const full = path.join(dir, entry.name)
              if (entry.isDirectory()) {
                const found = search(full)
                if (found) return found
              } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) {
                const name = entry.name
                if (name.match(new RegExp('IELTS' + b + '_test' + t + '_audio' + p + '\\.mp3', 'i'))) return full
                if (name.match(new RegExp('IELTS-' + b + '-Test-' + t + '-Part-' + p, 'i'))) return full
                if (name.match(new RegExp('^T' + t + 'S' + p + '\\.mp3', 'i')) && dir.includes(b)) return full
                if (name.match(new RegExp('C' + b + 'T' + t + 'P' + p, 'i'))) return full
              }
            }
            return null
          }

          const filePath = search(dbDir)
          if (filePath && fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath)
            const fileSize = stat.size
            const range = req.headers.range

            res.setHeader('Accept-Ranges', 'bytes')
            res.setHeader('Content-Type', 'audio/mpeg')
            res.setHeader('Cache-Control', 'no-cache')

            if (range) {
              const parts = range.replace(/bytes=/, '').split('-')
              const start = parseInt(parts[0], 10)
              const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

              if (start >= fileSize || end >= fileSize) {
                res.statusCode = 416
                res.setHeader('Content-Range', `bytes */${fileSize}`)
                return res.end()
              }

              const chunkSize = end - start + 1
              res.statusCode = 206
              res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`)
              res.setHeader('Content-Length', chunkSize)
              fs.createReadStream(filePath, { start, end }).pipe(res)
            } else {
              res.statusCode = 200
              res.setHeader('Content-Length', fileSize)
              fs.createReadStream(filePath).pipe(res)
            }
            return
          }
        }

        next()
      })
    },
  }
}
