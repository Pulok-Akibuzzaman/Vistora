/**
 * Vercel Serverless Function: /api/puku
 * Securely proxies AI completion requests to Puku.sh using server-side env vars
 * so PUKU_API_KEY is never exposed in the client-side browser bundle.
 */

const PUKU_API_KEY = process.env.PUKU_API_KEY || ''
const PUKU_BASE_URL = process.env.PUKU_BASE_URL || 'https://api-cli.puku.sh'
const PUKU_MODEL = process.env.PUKU_MODEL || ''

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!PUKU_API_KEY) {
    return res.status(503).json({
      error: 'PUKU_API_KEY is not configured on the server.',
    })
  }

  let body: Record<string, any> = {}
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Invalid JSON request body' })
  }

  const messages =
    Array.isArray(body.messages) && body.messages.length > 0
      ? body.messages
      : typeof body.prompt === 'string' && body.prompt.trim()
        ? [{ role: 'user', content: body.prompt }]
        : null

  if (!messages) {
    return res.status(400).json({ error: 'messages or prompt is required' })
  }

  const maxTokens =
    typeof body.max_tokens === 'number'
      ? Math.min(Math.max(body.max_tokens, 1), 8192)
      : typeof body.maxTokens === 'number'
        ? Math.min(Math.max(body.maxTokens, 1), 8192)
        : 3500

  const payload: Record<string, any> = {
    model: PUKU_MODEL || (typeof body.model === 'string' && body.model.trim() ? body.model : 'puku-ai-2.8'),
    max_tokens: maxTokens,
    messages,
  }

  const systemPrompt = body.system || body.systemPrompt
  if (typeof systemPrompt === 'string' && systemPrompt.trim()) {
    payload.system = systemPrompt
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 55000)

  try {
    const upstream = await fetch(`${PUKU_BASE_URL}/v1/messages`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PUKU_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    })

    clearTimeout(timer)

    const text = await upstream.text()
    try {
      const json = JSON.parse(text)
      return res.status(upstream.status).json(json)
    } catch {
      return res.status(upstream.status).send(text)
    }
  } catch (err: any) {
    clearTimeout(timer)
    const isAbort = err?.name === 'AbortError'
    return res.status(isAbort ? 504 : 502).json({
      error: isAbort ? 'AI request timed out' : err?.message || 'Failed to reach Puku AI upstream',
    })
  }
}
