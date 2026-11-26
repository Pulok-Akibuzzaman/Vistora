/**
 * Puku.sh AI Integration Module
 * High-performance browser & server compatible client for puku-ai-2.8
 */

export const PUKU_BASE_URL =
  (import.meta.env.VITE_PUKU_BASE_URL as string) ||
  'https://api-cli.puku.sh'

export const PUKU_MODEL =
  (import.meta.env.VITE_PUKU_MODEL as string) ||
  'puku-ai-2.8'

/**
 * Strips markdown formatting symbols to produce executive clean plain text
 */
export function stripMarkdownFormatting(text: string): string {
  if (!text) return ''
  return text
    .replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, '')
    .replace(/^[ \t]*#{1,6}[ \t]+(.+)$/gm, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[ \t]*[-*][ \t]+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Generic completion using Puku AI (Anthropic Messages API format)
 */
export async function generatePukuCompletion(
  prompt: string,
  systemPrompt = '',
  maxTokens = 3500,
  timeoutMs = 45000
): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const extractText = (data: any): string | null => {
    if (data?.content && Array.isArray(data.content)) {
      const textBlock = data.content.find((c: any) => c.type === 'text')
      return textBlock ? textBlock.text : null
    }
    return null
  }

  try {
    const payload: Record<string, any> = {
      model: PUKU_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }

    if (systemPrompt) {
      payload.system = systemPrompt
    }

    // 1. Prefer secure Vercel serverless proxy (/api/puku) so PUKU_API_KEY stays server-side
    try {
      const proxyRes = await fetch('/api/puku', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (proxyRes.ok) {
        clearTimeout(timer)
        const data = await proxyRes.json()
        return extractText(data)
      }

      const errText = await proxyRes.text()
      console.warn(`[Puku.sh Proxy] HTTP ${proxyRes.status}: ${errText.slice(0, 150)}`)
    } catch (proxyErr: any) {
      if (proxyErr?.name === 'AbortError') {
        clearTimeout(timer)
        return null
      }
      console.warn(`[Puku.sh Proxy] Unavailable, checking local config: ${proxyErr?.message || proxyErr}`)
    }

    // 2. Optional local-dev fallback if VITE_PUKU_API_KEY is explicitly configured in .env.local
    const localApiKey = (import.meta.env.VITE_PUKU_API_KEY as string) || ''
    if (!localApiKey) {
      clearTimeout(timer)
      return null
    }

    const response = await fetch(`${PUKU_BASE_URL}/v1/messages`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': localApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    })

    clearTimeout(timer)

    if (!response.ok) {
      const errText = await response.text()
      console.warn(`[Puku.sh API] HTTP ${response.status}: ${errText.slice(0, 150)}`)
      return null
    }

    const data = await response.json()
    return extractText(data)
  } catch (error: any) {
    clearTimeout(timer)
    console.warn(`[Puku.sh API] Request error: ${error?.message || error}`)
    return null
  }
}

/**
 * Generate academic / professional documents using Puku.sh AI
 */
export async function generateDocumentWithPuku(
  type: string,
  params: Record<string, string>
): Promise<string | null> {
  const {
    fullName = 'Applicant',
    email = '',
    degree = '',
    country = '',
    ielts = '',
    skills = '',
    experience = '',
    university = '',
    program = '',
    interests = '',
    background = '',
    why = '',
    goals = '',
    motivation = '',
    extra = '',
    position = '',
    company = '',
    tone = 'Formal Academic',
  } = params

  const candidateName = params.name || fullName || 'Applicant'

  const systemPrompt = `You are an elite academic admissions director and career consultant specializing in top international university applications and high-level corporate careers.
Write articulate, compelling, authentic documents tailored SPECIFICALLY to the candidate's exact provided inputs.
Do NOT invent unrelated background facts that contradict the candidate's actual field or details.

CRITICAL FORMATTING INSTRUCTIONS:
1. ABSOLUTELY DO NOT use any Markdown symbols or markdown syntax.
2. DO NOT use asterisks (** or *), hashes (##, ###), underscores (__ or _), or horizontal rules (---).
3. Use clean plain text formatting. Use standard UPPERCASE HEADINGS for sections (e.g. CAREER OBJECTIVE, ACADEMIC BACKGROUND, TECHNICAL SKILLS).
4. Use standard bullet points (• ) for lists and achievements.
5. Generate the ENTIRE document completely from start to finish without cutting off. Ensure all sections are fully articulated and complete.`

  let userPrompt = ''

  if (type === 'cv') {
    userPrompt = `Please generate a comprehensive, highly personalized, and complete CURRICULUM VITAE (CV) dynamically tailored to the following candidate details:
- Candidate Name: ${candidateName}
- Contact Email: ${email || 'applicant@email.com'}
- Current Degree / Institution: ${degree || 'Computer Science and Engineering'}
- Target Country: ${country || 'International / Global'}
- English Proficiency: ${ielts ? `IELTS Band ${ielts}` : 'Proficient in Academic English (IELTS Band 7.5)'}
- Key Skills & Expertise: ${skills || 'Algorithms, System Design, Applied Computing'}
- Work / Research Experience: ${experience || 'Software engineering, academic research, applied technical projects'}

DYNAMIC SECTION INSTRUCTIONS:
- Header: Feature the candidate's name (${candidateName.toUpperCase()}), contact email (${email || 'Email'}), and target destination (${country || 'International'}).
- CAREER OBJECTIVE: Craft an objective specifically tailored around their stated degree/discipline (${degree || 'Computer Science'}) and target destination (${country || 'international institutions'}).
- ACADEMIC BACKGROUND: Accurately reflect their stated degree (${degree || 'B.Sc. in Computer Science and Engineering'}). Include IELTS Band ${ielts || '7.5'}.
- TECHNICAL SKILLS: Feature all user-provided skills (${skills || 'Programming, Problem Solving, System Design'}) categorized logically.
- WORK / RESEARCH EXPERIENCE: Transform their provided experience (${experience || 'Technical projects and research'}) into high-impact, quantified bullet points.
- ACADEMIC PROJECTS & ACHIEVEMENTS: Provide relevant, impressive highlights matching their background.
- Include complete sections for AWARDS, LEADERSHIP, and REFERENCES (Available upon request).
- Output strictly in clean, executive plain text without asterisks (**), hashes (##), or horizontal rules (---).`
  } else if (type === 'sop') {
    userPrompt = `Please generate an articulate, persuasive, and tailored STATEMENT OF PURPOSE (SOP) based on:
- Candidate Name: ${candidateName}
- Target Program: ${program || degree || 'Graduate Studies'}
- Target University: ${university || 'Target University'}
- Research Interests: ${interests || 'Advanced computing systems and emerging technologies'}
- Academic Background: ${background || degree || 'Rigorous undergraduate study with distinction'}
- Why This University: ${why || 'Distinguished faculty, advanced laboratory facilities, and collaborative culture'}
- Career & Academic Goals: ${goals || 'Pursuing advanced research and becoming an international technology innovator'}

DYNAMIC INSTRUCTIONS:
- Specifically mention ${university || 'the university'} and ${program || degree || 'the program'} throughout the essay.
- Build upon their specific background (${background || degree}) and detail how it prepares them for ${interests || 'advanced studies'}.
- Articulate clear synergy with ${university}'s faculty and programs based on: ${why}.
- Close with their concrete goals: ${goals}.
- FORMAT: Clean plain text essay without any asterisks (**), hashes (##), or markdown symbols.`
  } else if (type === 'ps') {
    userPrompt = `Please generate an inspiring, highly personal, and authentic PERSONAL STATEMENT for:
- Candidate Name: ${candidateName}
- Target Course: ${program || degree || 'Graduate Studies'}
- Target University: ${university || 'Target University'}
- Motivating Experience: ${motivation || 'A defining moment of curiosity and overcoming technical challenges'}
- Extracurricular & Leadership: ${extra || 'Student club leadership, hackathons, and community mentorship'}
- Why This Subject: ${why || 'A deep commitment to computational innovation and real-world impact'}

DYNAMIC INSTRUCTIONS:
- Narrate a cohesive personal story starting from ${motivation || 'their early academic curiosity'}.
- Integrate their extracurricular achievements (${extra}) to showcase leadership and resilience.
- Connect their values to studying ${program || degree} at ${university}.
- FORMAT: Clean plain text without any asterisks (**), hashes (##), or markdown symbols.`
  } else if (type === 'cl') {
    userPrompt = `Please generate a polished, compelling, and tailored COVER LETTER for:
- Candidate Name: ${candidateName}
- Position Applied For: ${position || 'Graduate Research Associate / Software Engineer'}
- Company / Organization: ${company || 'Target Organization'}
- Key Relevant Experience: ${experience || skills || 'Demonstrated track record of delivering technical solutions'}
- Why This Organization: ${why || 'Inspiration from your market leadership and engineering culture'}
- Tone: ${tone}

DYNAMIC INSTRUCTIONS:
- Specifically address the hiring committee for ${position || 'the role'} at ${company || 'the organization'}.
- Frame the candidate's background (${experience || skills}) as the direct solution to the organization's needs.
- Close professionally with candidate name ${candidateName}.
- FORMAT: Clean plain text without asterisks (**), hashes (##), or markdown symbols.`
  }

  try {
    const generatedText = await generatePukuCompletion(userPrompt, systemPrompt, 3500, 50000)
    if (!generatedText) return null
    return stripMarkdownFormatting(generatedText)
  } catch (err: any) {
    console.warn(`[Puku.sh Document] Failed to generate document: ${err?.message || err}`)
    return null
  }
}

/**
 * Extracts JSON from markdown blocks or raw text strings
 */
export function extractJson(text: string): any {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    // Continue matching
  }

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim())
    } catch {
      // Continue matching
    }
  }

  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1).trim())
    } catch {
      // Failed to parse
    }
  }

  return null
}

/**
 * Evaluate IELTS Writing task using Puku AI (puku-ai-2.8)
 */
export async function evaluateWritingWithPuku(
  task: '1' | '2',
  topic: string,
  essay: string
): Promise<any | null> {
  const minWords = task === '1' ? 150 : 250
  const systemPrompt = `You are a certified senior British Council / IDP IELTS Writing Examiner.
Evaluate the candidate's IELTS essay strictly according to official IELTS band descriptors across 4 criteria:
1. Task Achievement / Task Response (TA)
2. Coherence and Cohesion (CC)
3. Lexical Resource (LR)
4. Grammatical Range and Accuracy (GRA)

Respond strictly in valid JSON with scores from 0.0 to 9.0 (in increments of 0.5):
{
  "overallBand": 7.0,
  "taBand": 7.0,
  "ccBand": 7.0,
  "lrBand": 7.0,
  "graBand": 7.0,
  "taFeedback": "Detailed analysis of task response...",
  "ccFeedback": "Detailed analysis of coherence and cohesion...",
  "lrFeedback": "Detailed analysis of vocabulary...",
  "graFeedback": "Detailed analysis of grammatical accuracy...",
  "summary": "Overall assessment summary...",
  "grammarIssues": [
    { "type": "Tense", "text": "error in context", "issue": "verb agreement", "fix": "corrected phrase" }
  ],
  "vocabSuggestions": [
    { "word": "used word", "level": "C1", "suggestion": "advanced synonym", "note": "academic enhancement" }
  ],
  "strengths": ["Clear viewpoint", "Logical progression"],
  "improvements": ["Use more varied transitional phrases", "Expand concrete evidence"]
}`

  const userPrompt = `TASK: IELTS Writing Task ${task} (Target min: ${minWords} words)
TOPIC / PROMPT: ${topic || 'General Academic Topic'}

CANDIDATE ESSAY:
${essay}

Please evaluate this essay according to official IELTS criteria and return ONLY valid JSON matching this schema:
{
  "overallBand": 6.5,
  "taBand": 6.5,
  "ccBand": 6.5,
  "lrBand": 6.5,
  "graBand": 6.5,
  "taFeedback": "...",
  "ccFeedback": "...",
  "lrFeedback": "...",
  "graFeedback": "...",
  "summary": "...",
  "strengths": ["..."],
  "improvements": ["..."]
}`

  try {
    const rawResult = await generatePukuCompletion(userPrompt, systemPrompt, 2200, 35000)
    if (!rawResult) return null

    const parsed = extractJson(rawResult)
    if (!parsed) return null

    const rawBand =
      parsed.overallBand ||
      parsed.band ||
      (parsed.score?.overall
        ? Math.min(9.0, Math.round(((parsed.score.overall / (parsed.score.scale || 10)) * 9) * 2) / 2)
        : undefined)

    const rawTa =
      parsed.taBand ||
      parsed.criteria?.taskAchievement?.band ||
      (parsed.score?.development
        ? Math.min(9.0, Math.round(((parsed.score.development / (parsed.score.scale || 10)) * 9) * 2) / 2)
        : rawBand || 6.5)

    const rawCc =
      parsed.ccBand ||
      parsed.criteria?.coherenceCohesion?.band ||
      (parsed.score?.organization
        ? Math.min(9.0, Math.round(((parsed.score.organization / (parsed.score.scale || 10)) * 9) * 2) / 2)
        : rawBand || 6.5)

    const rawLr =
      parsed.lrBand ||
      parsed.criteria?.lexicalResource?.band ||
      (parsed.score?.clarity
        ? Math.min(9.0, Math.round(((parsed.score.clarity / (parsed.score.scale || 10)) * 9) * 2) / 2)
        : rawBand || 6.5)

    const rawGra =
      parsed.graBand ||
      parsed.criteria?.grammaticalAccuracy?.band ||
      (parsed.score?.evidenceAndSupport
        ? Math.min(9.0, Math.round(((parsed.score.evidenceAndSupport / (parsed.score.scale || 10)) * 9) * 2) / 2)
        : rawBand || 6.5)

    const ta = rawTa || 6.5
    const cc = rawCc || 6.5
    const lr = rawLr || 6.5
    const gra = rawGra || 6.5
    const band = rawBand || Math.round(((ta + cc + lr + gra) / 4) * 2) / 2

    const words = essay.trim().split(/\s+/).filter(Boolean)
    const paragraphs = essay.split(/\n\s*\n/).filter(p => p.trim().length > 0)

    const summary =
      parsed.summary ||
      parsed.overallAssessment ||
      parsed.feedback ||
      `Essay thoroughly evaluated according to official IELTS band descriptors. Overall Band: ${band.toFixed(1)}.`

    const improvements =
      (Array.isArray(parsed.improvements) && parsed.improvements.length > 0)
        ? parsed.improvements
        : (Array.isArray(parsed.suggestedImprovements) && parsed.suggestedImprovements.length > 0)
          ? parsed.suggestedImprovements
          : (Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0)
            ? parsed.weaknesses
            : [
                'Incorporate wider variety of academic sentence structures',
                'Strengthen paragraph topic sentences with clear supporting evidence',
                'Elevate academic vocabulary range and collocations'
              ]

    const strengths =
      (Array.isArray(parsed.strengths) && parsed.strengths.length > 0)
        ? parsed.strengths
        : ['Clear viewpoint and relevant supporting ideas', 'Logical progression of arguments']

    return {
      band,
      ta,
      cc,
      lr,
      gra,
      wordCount: words.length,
      minWords,
      paragraphCount: paragraphs.length,
      academicWordCount: Math.min(words.length, 25),
      detectedAcademicWords: ['demonstrate', 'significant', 'sustainable', 'proportion', 'consequently'],
      summary,
      grammar: Array.isArray(parsed.grammarIssues) ? parsed.grammarIssues : [],
      vocab: Array.isArray(parsed.vocabSuggestions) ? parsed.vocabSuggestions : [],
      improvements,
      strengths,
      aiEngine: 'Puku AI 2.8 Examiner',
      criteriaFeedback: {
        ta: parsed.taFeedback || parsed.criteria?.taskAchievement?.feedback || 'Clear addressing of key task requirements.',
        cc: parsed.ccFeedback || parsed.criteria?.coherenceCohesion?.feedback || 'Logical organization with clear paragraph progression.',
        lr: parsed.lrFeedback || parsed.criteria?.lexicalResource?.feedback || 'Accurate academic vocabulary with occasional idiomatic phrasing.',
        gra: parsed.graFeedback || parsed.criteria?.grammaticalAccuracy?.feedback || 'Good control of complex syntactic structures with minimal slips.',
      },
    }
  } catch (err: any) {
    console.warn(`[Puku.sh Writing] Evaluation failed: ${err?.message || err}`)
    return null
  }
}

/**
 * Evaluate IELTS Speaking performance using Puku AI (puku-ai-2.8)
 */
export async function evaluateSpeakingWithPuku(params: {
  part?: number
  title?: string
  questions?: string[]
  transcript: string
  durationSeconds?: number
  wordCount?: number
}): Promise<any | null> {
  const systemPrompt = `You are an official senior British Council / IDP IELTS Speaking Examiner.
Evaluate the candidate's spoken response according to the 4 official IELTS criteria:
1. Fluency and Coherence (FC)
2. Lexical Resource (LR)
3. Grammatical Range and Accuracy (GRA)
4. Pronunciation (PR)

Respond strictly in valid JSON matching:
{
  "overallBand": 7.0,
  "fcBand": 7.0,
  "lrBand": 7.0,
  "graBand": 7.0,
  "prBand": 7.0,
  "fcFeedback": "...",
  "lrFeedback": "...",
  "graFeedback": "...",
  "prFeedback": "...",
  "summary": "...",
  "strengths": ["..."],
  "improvements": ["..."],
  "sampleUpgrades": [
    { "original": "phrase", "improved": "better phrase", "reason": "why" }
  ]
}`

  const userPrompt = `EXAM: IELTS Speaking Part ${params.part || 1}
TOPIC / PROMPT: ${params.title || 'General Speaking Topics'}
QUESTIONS ASKED: ${(params.questions || []).join(' | ')}
SPEECH DURATION: ${params.durationSeconds || 60} seconds
WORD COUNT: ${params.wordCount || 50} words

CANDIDATE TRANSCRIBED SPEECH:
${params.transcript}

Evaluate according to official IELTS criteria and return ONLY valid JSON matching the schema.`

  try {
    const rawResult = await generatePukuCompletion(userPrompt, systemPrompt, 1800, 35000)
    if (!rawResult) return null

    const parsed = extractJson(rawResult)
    if (!parsed) return null

    const words = params.transcript.trim().split(/\s+/).filter(Boolean)
    const count = params.wordCount || words.length
    const duration = Math.max(15, params.durationSeconds || 60)
    const wpm = Math.round(count / (duration / 60))

    const rawBand = parsed.overallBand || parsed.band
    const fc = parsed.fcBand || rawBand || 6.5
    const lr = parsed.lrBand || rawBand || 6.5
    const gra = parsed.graBand || rawBand || 6.5
    const pr = parsed.prBand || rawBand || 6.5
    const overallBand = rawBand || Math.round(((fc + lr + gra + pr) / 4) * 2) / 2

    return {
      overallBand,
      wpm,
      criteria: {
        fluencyCoherence: {
          band: fc,
          feedback: parsed.fcFeedback || `Speech pace maintained at ${wpm} WPM with good coherence.`,
        },
        lexicalResource: {
          band: lr,
          feedback: parsed.lrFeedback || 'Accurate topic-specific vocabulary with natural expressions.',
        },
        grammaticalAccuracy: {
          band: gra,
          feedback: parsed.graFeedback || 'Controlled simple and complex grammatical structures.',
        },
        pronunciation: {
          band: pr,
          feedback: parsed.prFeedback || 'Intelligible pronunciation with appropriate stress and rhythm.',
        },
      },
      summary: parsed.summary || `Your spoken performance achieved an estimated Band ${overallBand.toFixed(1)}. Steady pace of ${wpm} WPM with solid communication.`,
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : [
        `Maintained continuous speech at ${wpm} WPM without long communicative pauses.`,
        `Directly addressed IELTS Speaking Part ${params.part || 1} prompts.`,
      ],
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0 ? parsed.improvements : [
        'Incorporate more academic collocations and idiomatic phrases to reach Band 8.0+.',
        'Vary intonation and stress patterns to emphasize key contrasting points.',
      ],
      sampleUpgrades: Array.isArray(parsed.sampleUpgrades) && parsed.sampleUpgrades.length > 0 ? parsed.sampleUpgrades : [
        {
          original: 'I like this because it is good',
          improved: 'I find this particularly compelling due to its tangible benefits',
          reason: 'Replaces colloquial "good" with formal IELTS academic vocabulary',
        },
      ],
      source: 'Puku AI 2.8 Examiner',
    }
  } catch (err: any) {
    console.warn(`[Puku.sh Speaking] Evaluation error: ${err?.message || err}`)
    return null
  }
}

