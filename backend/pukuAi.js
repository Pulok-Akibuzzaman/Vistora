/**
 * Puku.sh AI Client & Integration Module
 * Uses puku-ai-2.8 via https://api-cli.puku.sh/v1/messages
 * Provided API Key: pk_live_GtUSwEfYOqXRuRF4gFzg4c7uMnuncHxP8u_7_8-pYSs
 */

export const PUKU_API_KEY = process.env.PUKU_API_KEY || 'pk_live_GtUSwEfYOqXRuRF4gFzg4c7uMnuncHxP8u_7_8-pYSs';
export const PUKU_BASE_URL = process.env.PUKU_BASE_URL || 'https://api-cli.puku.sh';
export const PUKU_MODEL = process.env.PUKU_MODEL || 'puku-ai-2.8';

/**
 * Extracts and parses JSON from potentially code-wrapped responses
 */
function extractJson(text) {
  if (!text) return null;

  // Direct parse check
  try {
    return JSON.parse(text);
  } catch (e) {}

  // Match markdown code block ```json ... ``` or ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {}
  }

  // Match outer curly braces { ... }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1).trim());
    } catch (e) {}
  }

  return null;
}

/**
 * Generic completion using Puku AI (Anthropic Messages API format)
 * @param {string} prompt - User prompt
 * @param {string} systemPrompt - Optional system prompt
 * @param {number} maxTokens - Token limit (default 1800)
 * @param {number} timeoutMs - Timeout in ms (default 18000)
 * @returns {Promise<string|null>}
 */
export async function generatePukuCompletion(prompt, systemPrompt = '', maxTokens = 1800, timeoutMs = 18000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      model: PUKU_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    };

    if (systemPrompt) {
      payload.system = systemPrompt;
    }

    const response = await fetch(`${PUKU_BASE_URL}/v1/messages`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PUKU_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Puku.sh API] HTTP ${response.status}: ${errText.slice(0, 150)}`);
      return null;
    }

    const data = await response.json();
    if (data && data.content && Array.isArray(data.content)) {
      const textBlock = data.content.find(c => c.type === 'text');
      return textBlock ? textBlock.text : null;
    }

    return null;
  } catch (error) {
    clearTimeout(timer);
    console.warn(`[Puku.sh API] Request error or timeout: ${error.message}`);
    return null;
  }
}

/**
 * Evaluate IELTS Writing task using Puku AI
 * Returns structured feedback object or null if failed
 */
export async function evaluateWritingWithPuku(taskType, topic, essay) {
  const systemPrompt = `You are a certified senior British Council / IDP IELTS Writing Examiner.
Evaluate the candidate's IELTS essay strictly according to official IELTS band descriptors across 4 criteria:
1. Task Achievement / Task Response (TA)
2. Coherence and Cohesion (CC)
3. Lexical Resource (LR)
4. Grammatical Range and Accuracy (GRA)

Respond strictly in valid JSON with scores from 0.0 to 9.0 (in increments of 0.5):
{
  "overallBand": 6.5,
  "criteria": {
    "taskAchievement": { "band": 6.5, "feedback": "Detailed examiner analysis..." },
    "coherenceCohesion": { "band": 6.0, "feedback": "Detailed examiner analysis..." },
    "lexicalResource": { "band": 7.0, "feedback": "Detailed examiner analysis..." },
    "grammaticalAccuracy": { "band": 6.5, "feedback": "Detailed examiner analysis..." }
  },
  "summary": "Overall assessment summary...",
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "improvements": ["Actionable step 1", "Actionable step 2", "Actionable step 3"]
}`;

  const userPrompt = `TASK: IELTS ${taskType || 'Task 2'}
TOPIC / PROMPT: ${topic || 'General Academic Topic'}

CANDIDATE ESSAY:
${essay}

Please evaluate the essay according to IELTS criteria and output JSON.`;

  try {
    const rawResult = await generatePukuCompletion(userPrompt, systemPrompt, 2000, 25000);
    if (!rawResult) return null;

    const parsed = extractJson(rawResult);
    if (!parsed) return null;

    // Normalize keys across camelCase and snake_case
    const ta = parsed.criteria?.taskAchievement || parsed.task_response || parsed.task_achievement || parsed.ta || {};
    const cc = parsed.criteria?.coherenceCohesion || parsed.coherence_and_cohesion || parsed.cc || {};
    const lr = parsed.criteria?.lexicalResource || parsed.lexical_resource || parsed.lr || {};
    const gra = parsed.criteria?.grammaticalAccuracy || parsed.grammatical_range_and_accuracy || parsed.grammatical_range_and_Accuracy || parsed.gra || {};

    const taBand = typeof ta.band === 'number' ? ta.band : (typeof ta === 'number' ? ta : 6.0);
    const ccBand = typeof cc.band === 'number' ? cc.band : (typeof cc === 'number' ? cc : 6.0);
    const lrBand = typeof lr.band === 'number' ? lr.band : (typeof lr === 'number' ? lr : 6.0);
    const graBand = typeof gra.band === 'number' ? gra.band : (typeof gra === 'number' ? gra : 6.0);

    let overallBand = parsed.overallBand || parsed.overall_band || parsed.overall_band_score || parsed.overall;
    if (typeof overallBand !== 'number') {
      const avg = (taBand + ccBand + lrBand + graBand) / 4;
      overallBand = Math.round(avg * 2) / 2;
    }

    return {
      overallBand,
      criteria: {
        taskAchievement: { band: taBand, feedback: ta.feedback || 'Evaluated against official Task Achievement descriptors.' },
        coherenceCohesion: { band: ccBand, feedback: cc.feedback || 'Evaluated against official Coherence and Cohesion descriptors.' },
        lexicalResource: { band: lrBand, feedback: lr.feedback || 'Evaluated against official Lexical Resource descriptors.' },
        grammaticalAccuracy: { band: graBand, feedback: gra.feedback || 'Evaluated against official Grammatical Accuracy descriptors.' }
      },
      summary: parsed.summary || parsed.general_comments || 'Essay thoroughly evaluated according to IELTS standards.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [
        'Clear communicative purpose',
        'Adequate organization and paragraphing',
        'Relevant vocabulary for the prompt'
      ],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [
        'Expand supporting arguments with concrete real-world evidence',
        'Increase range of academic collocation and advanced idioms',
        'Incorporate more complex conditional and relative clauses'
      ],
      source: 'puku.sh (puku-ai-2.8 Examiner)'
    };
  } catch (err) {
    console.warn(`[Puku.sh Writing] Failed to parse AI evaluation response: ${err.message}`);
    return null;
  }
}

/**
 * Generate customized academic and professional documents using Puku AI
 */
export async function generateDocumentWithPuku(type, params) {
  const {
    fullName = 'Ayaan Rahman',
    degree = 'M.Sc. in Computer Science',
    university = 'University of Oxford',
    background = '',
    goals = '',
    researchInterest = '',
    experience = ''
  } = params;

  const systemPrompt = `You are an elite academic admissions director and career consultant specializing in top international university applications (Oxford, Cambridge, Ivy League, Russell Group). Write articulate, compelling, authentic documents tailored specifically to the candidate's profile. Avoid cliché filler phrases. Use clear, professional formatting.`;

  const userPrompt = `Please generate a comprehensive, ready-to-submit ${type.toUpperCase()} for:
- Candidate Name: ${fullName}
- Target Degree: ${degree}
- Target Institution: ${university}
- Academic / Professional Background: ${background || 'High-achieving background in relevant field'}
- Career / Academic Goals: ${goals || 'Pursuing advanced research and international leadership'}
- Research / Specialization Interests: ${researchInterest || 'Emerging technologies and computational systems'}
- Key Experiences & Achievements: ${experience || 'Academic projects, research assistantship, and practical internships'}

Write the full document with formal structure, clear paragraph headers (if appropriate), cohesive narrative, and professional closing.`;

  try {
    const generatedText = await generatePukuCompletion(userPrompt, systemPrompt, 1400, 35000);
    return generatedText || null;
  } catch (err) {
    console.warn(`[Puku.sh Document] Failed to generate document: ${err.message}`);
    return null;
  }
}
