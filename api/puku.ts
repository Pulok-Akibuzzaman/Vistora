/**
 * Vercel Serverless Function: /api/puku
 * Securely proxies AI completion requests using server-side env vars so API keys
 * are never exposed in the client-side browser bundle.
 *
 * Provider chain:
 *   1. Puku AI (PUKU_API_KEY)
 *   2. Groq fallback (GROQ_API_KEY)
 *   3. OpenRouter fallback (OPENROUTER_API_KEY)
 */

const PUKU_API_KEY = process.env.PUKU_API_KEY || ''
const PUKU_BASE_URL = process.env.PUKU_BASE_URL || 'https://api-cli.puku.sh'
const PUKU_MODEL = process.env.PUKU_MODEL || ''

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'

type ChatMessage = { role: string; content: string }

interface ProviderAttemptResult {
  ok: boolean
  status: number
  payload?: any
  error?: string
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function callPuku(
  messages: ChatMessage[],
  systemPrompt: string,
  maxTokens: number,
  requestedModel: string
): Promise<ProviderAttemptResult> {
  if (!PUKU_API_KEY) {
    return { ok: false, status: 503, error: 'PUKU_API_KEY not configured' }
  }

  const payload: Record<string, any> = {
    model: PUKU_MODEL || requestedModel || 'puku-ai-2.8',
    max_tokens: maxTokens,
    messages,
  }
  if (systemPrompt) payload.system = systemPrompt

  try {
    const upstream = await fetchWithTimeout(
      `${PUKU_BASE_URL}/v1/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': PUKU_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(payload),
      },
      11000
    )

    const text = await upstream.text()
    let data: any = null
    try {
      data = JSON.parse(text)
    } catch {
      return { ok: false, status: upstream.status, error: text.slice(0, 180) }
    }

    const hasText =
      upstream.ok &&
      Array.isArray(data?.content) &&
      data.content.some((c: any) => c?.type === 'text' && typeof c.text === 'string' && c.text.trim())

    if (!hasText) {
      return {
        ok: false,
        status: upstream.status || 502,
        error: data?.error?.message || data?.error || `Puku HTTP ${upstream.status}`,
      }
    }

    return { ok: true, status: 200, payload: { ...data, provider: 'puku' } }
  } catch (err: any) {
    return {
      ok: false,
      status: err?.name === 'AbortError' ? 504 : 502,
      error: err?.message || 'Puku request failed',
    }
  }
}

async function callOpenAiCompatibleProvider(options: {
  provider: 'groq' | 'openrouter'
  endpoint: string
  apiKey: string
  model: string
  messages: ChatMessage[]
  systemPrompt: string
  maxTokens: number
  extraHeaders?: Record<string, string>
}): Promise<ProviderAttemptResult> {
  if (!options.apiKey) {
    return { ok: false, status: 503, error: `${options.provider} key not configured` }
  }

  const chatMessages: ChatMessage[] = []
  if (options.systemPrompt) {
    chatMessages.push({ role: 'system', content: options.systemPrompt })
  }
  for (const m of options.messages) {
    if (m && typeof m.content === 'string') {
      chatMessages.push({ role: m.role || 'user', content: m.content })
    }
  }

  try {
    const upstream = await fetchWithTimeout(
      options.endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${options.apiKey}`,
          ...(options.extraHeaders || {}),
        },
        body: JSON.stringify({
          model: options.model,
          max_tokens: options.maxTokens,
          messages: chatMessages,
        }),
      },
      10000
    )

    const text = await upstream.text()
    let data: any = null
    try {
      data = JSON.parse(text)
    } catch {
      return { ok: false, status: upstream.status, error: text.slice(0, 180) }
    }

    const contentText = data?.choices?.[0]?.message?.content
    if (!upstream.ok || typeof contentText !== 'string' || !contentText.trim()) {
      return {
        ok: false,
        status: upstream.status || 502,
        error: data?.error?.message || data?.error || `${options.provider} HTTP ${upstream.status}`,
      }
    }

    return {
      ok: true,
      status: 200,
      payload: {
        id: data?.id || `${options.provider}-fallback`,
        type: 'message',
        role: 'assistant',
        model: data?.model || options.model,
        provider: options.provider,
        content: [{ type: 'text', text: contentText }],
      },
    }
  } catch (err: any) {
    return {
      ok: false,
      status: err?.name === 'AbortError' ? 504 : 502,
      error: err?.message || `${options.provider} request failed`,
    }
  }
}

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

  if (!PUKU_API_KEY && !GROQ_API_KEY && !OPENROUTER_API_KEY) {
    return res.status(503).json({
      error: 'No AI provider API key is configured on the server.',
    })
  }

  let body: Record<string, any> = {}
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Invalid JSON request body' })
  }

  const messages: ChatMessage[] | null =
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

  const systemPrompt =
    typeof (body.system || body.systemPrompt) === 'string'
      ? String(body.system || body.systemPrompt).trim()
      : ''

  const requestedModel = typeof body.model === 'string' ? body.model.trim() : ''

  // 1. Primary: Puku AI
  let lastFailure: ProviderAttemptResult = await callPuku(
    messages,
    systemPrompt,
    maxTokens,
    requestedModel
  )
  if (lastFailure.ok) {
    return res.status(200).json(lastFailure.payload)
  }

  // 2. Fallback 1: Groq
  if (GROQ_API_KEY) {
    lastFailure = await callOpenAiCompatibleProvider({
      provider: 'groq',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: GROQ_API_KEY,
      model: GROQ_MODEL,
      messages,
      systemPrompt,
      maxTokens,
    })
    if (lastFailure.ok) {
      return res.status(200).json(lastFailure.payload)
    }
  }

  // 3. Fallback 2: OpenRouter
  if (OPENROUTER_API_KEY) {
    lastFailure = await callOpenAiCompatibleProvider({
      provider: 'openrouter',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: OPENROUTER_API_KEY,
      model: OPENROUTER_MODEL,
      messages,
      systemPrompt,
      maxTokens,
      extraHeaders: {
        'HTTP-Referer': 'https://vistora-delta.vercel.app',
        'X-Title': 'Vistora IELTS Platform',
      },
    })
    if (lastFailure.ok) {
      return res.status(200).json(lastFailure.payload)
    }
  }

  return res.status(lastFailure.status || 502).json({
    error: lastFailure.error || 'All configured AI providers failed',
  })
}
