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

CRITICAL IELTS TOPIC RELEVANCE RULE:
First evaluate whether the candidate's essay actually addresses the given TOPIC / PROMPT.
- If the submission is COMPLETELY OFF-TOPIC, unrelated to the prompt, writes about an entirely different subject (e.g. submitting a creative/fictional story about a village or clockmaker when asked about competition vs cooperation, or pasting an unrelated memorized essay):
  * You MUST assign 0.0 to overallBand, 0.0 to Task Achievement, 0.0 to Coherence, 0.0 to Lexical Resource, and 0.0 to Grammatical Accuracy.
  * Under official IELTS examination criteria, an essay that fails to address the prompt or is completely off-topic CANNOT receive band score numbers for grammar or vocabulary.
  * The summary MUST state: "OFF-TOPIC SUBMISSION (BAND 0.0): The essay is completely unrelated to the assigned question prompt..."
  * Do NOT award partial numbers (such as 1.0, 2.0, 3.0, 4.0) for an answer that is completely wrong or unrelated to the prompt!

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

    // Check if the evaluation indicates a completely off-topic response
    const combinedFeedback = `${parsed.summary || ''} ${ta.feedback || ''} ${cc.feedback || ''} ${parsed.general_comments || ''}`.toLowerCase();
    const offTopicMarkers = [
      'completely off-topic',
      'entirely off-topic',
      'completely off topic',
      'entirely off topic',
      'non-attempt',
      'completely failed to address the task',
      'completely failed to address the prompt',
      'completely unrelated',
      'entirely unrelated',
      'no relevance to the ielts',
      'no relevance to the prompt',
      'no relevance to the task',
      'fictional narrative about',
      'does not address the prompt in any way',
      'unrelated to the prompt',
      'unrelated to the task'
    ];

    const isOffTopicFromAi = offTopicMarkers.some(m => combinedFeedback.includes(m)) || taBand === 0;

    // Check keyword relevance between prompt and essay
    let isOffTopicFromKeywords = false;
    if (topic && topic.trim().length > 10 && essay && essay.trim().length > 20) {
      const stopWords = new Set([
        'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
        'be', 'because', 'been', 'before', 'being', 'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does',
        'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her',
        'here', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'me', 'more', 'most', 'my',
        'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'out', 'over', 'own',
        'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'then',
        'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
        'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'you', 'your',
        'discuss', 'views', 'view', 'opinion', 'give', 'reasons', 'examples', 'agree', 'disagree', 'extent',
        'think', 'believe', 'people', 'many', 'others', 'statement', 'question', 'task', 'essay', 'write'
      ]);
      const promptWords = topic.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      if (promptWords.length >= 2) {
        const essayLower = essay.toLowerCase();
        let matched = 0;
        promptWords.forEach(pw => {
          const stem = pw.slice(0, Math.min(5, pw.length));
          if (essayLower.includes(pw) || (stem.length >= 4 && essayLower.includes(stem))) {
            matched++;
          }
        });
        if (matched === 0) {
          isOffTopicFromKeywords = true;
        }
      }
    }

    if (isOffTopicFromAi || isOffTopicFromKeywords) {
      return {
        overallBand: 0.0,
        criteria: {
          taskAchievement: { band: 0.0, feedback: ta.feedback || 'The submission is completely off-topic and fails to address the question prompt. Under official IELTS examination criteria, an unrelated response receives no band credit.' },
          coherenceCohesion: { band: 0.0, feedback: 'Because the response fails to address the assigned question, coherence cannot be credited towards an IELTS band score.' },
          lexicalResource: { band: 0.0, feedback: 'Lexical resource cannot be awarded for vocabulary produced in an off-topic submission.' },
          grammaticalAccuracy: { band: 0.0, feedback: 'Grammar cannot receive IELTS band credit when the submission completely fails the task.' }
        },
        summary: `OFF-TOPIC SUBMISSION (BAND 0.0): The submitted response does not address the question prompt. Under official IELTS assessment criteria, an answer that is completely unrelated to the assigned topic receives an Overall Band Score of 0.0, as no credit can be awarded for off-topic content regardless of vocabulary or sentence structure. To receive a valid academic evaluation, your essay must directly analyze and discuss the specific prompt provided.`,
        strengths: [],
        improvements: [
          'Carefully read the question prompt and identify the core topic and required discussion points before writing.',
          'Ensure every paragraph directly addresses the central question instead of an unrelated topic or narrative.',
          'Follow formal IELTS essay structure: an introduction with a clear thesis, body paragraphs with topic sentences and evidence, and a conclusion.'
        ],
        source: 'Puku.sh (puku-ai-2.8 Examiner)'
      };
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
      source: 'Puku.sh (puku-ai-2.8 Examiner)'
    };
  } catch (err) {
    console.warn(`[Puku.sh Writing] Failed to parse AI evaluation response: ${err.message}`);
    return null;
  }
}

/**
 * Helper to safely extract band numbers across varying AI response schemas
 */
function extractBandNumber(obj) {
  if (typeof obj === 'number') return obj;
  if (typeof obj === 'string') {
    const num = parseFloat(obj);
    if (!isNaN(num)) return num;
  }
  if (!obj || typeof obj !== 'object') return null;
  const val = obj.band ?? obj.score_band ?? obj.score ?? obj.band_score ?? obj.rating ?? obj.value ?? obj.grade;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const num = parseFloat(val);
    if (!isNaN(num)) return num;
  }
  return null;
}

/**
 * Helper to safely extract feedback text across varying AI response schemas
 */
function extractFeedback(obj, defaultFeedback = '') {
  if (typeof obj === 'string') return obj;
  if (!obj || typeof obj !== 'object') return defaultFeedback;
  return obj.feedback || obj.rationale || obj.comment || obj.explanation || obj.assessment || obj.description || defaultFeedback;
}

/**
 * Helper to detect microphone test or non-answer responses
 */
function checkMicTestOrNonAnswer(transcript, count, durationSeconds) {
  const lower = (transcript || '').toLowerCase().trim();
  const micKeywords = [
    'mic test', 'testing 123', 'test 123', 'hello 123', '1 2 3', 'sound check',
    'audio check', 'testing mic', 'test test', 'check check', 'can you hear me',
    'hello hello', 'testing testing'
  ];
  const isMic = micKeywords.some(k => lower.includes(k)) && count < 35;
  const isExtremelyBrief = count < 15 || durationSeconds < 8;
  return { isMic, isExtremelyBrief };
}

/**
 * Local rule-based fallback evaluation for speaking
 */
export function evaluateSpeakingLocally({ part = 1, transcript = '', durationSeconds = 60, wordCount = 0 }) {
  const words = transcript.trim() ? transcript.trim().split(/\s+/).filter(Boolean) : [];
  const count = wordCount || words.length;
  const wpm = durationSeconds > 0 ? Math.round((count / durationSeconds) * 60) : 0;
  const { isMic, isExtremelyBrief } = checkMicTestOrNonAnswer(transcript, count, durationSeconds);

  if (isMic || count < 8) {
    return {
      overallBand: 1.0,
      wpm,
      criteria: {
        fluencyCoherence: { band: 1.0, feedback: 'Microphone test or non-response detected. No meaningful or extended speech produced.' },
        lexicalResource: { band: 1.0, feedback: 'No vocabulary related to the exam topic was used. Only test phrases detected.' },
        grammaticalAccuracy: { band: 1.0, feedback: 'No assessable grammatical structures or sentences were produced.' },
        pronunciation: { band: 1.0, feedback: 'Speech sample is too brief or repetitive for phonological evaluation.' }
      },
      summary: 'The candidate produced a microphone check rather than answering the IELTS prompt questions. Under official IELTS criteria, a response with no attempt to address the prompt receives Band 1.0.',
      strengths: ['Audio recording was successfully captured'],
      improvements: [
        'Address the prompt questions directly using full sentences',
        'Speak for the full allotted time (1 to 2 minutes)',
        'Provide reasons, examples, and personal details'
      ],
      sampleUpgrades: [],
      source: 'Vistora Speaking NLP Engine (Rule-based)'
    };
  }

  if (isExtremelyBrief) {
    return {
      overallBand: 2.0,
      wpm,
      criteria: {
        fluencyCoherence: { band: 2.0, feedback: 'Extremely brief response (under 15 words). Speech cannot be sustained.' },
        lexicalResource: { band: 2.0, feedback: 'Very limited vocabulary; insufficient language to assess range.' },
        grammaticalAccuracy: { band: 2.0, feedback: 'Minimal grammatical structures produced.' },
        pronunciation: { band: 2.5, feedback: 'Limited sample to evaluate rhythm and sentence stress.' }
      },
      summary: 'The spoken response was under 15 words. IELTS examiners require sustained speech across 1 to 2 minutes to award passing bands.',
      strengths: ['Attempted to speak on topic'],
      improvements: [
        'Expand answers with concrete personal anecdotes and reasons',
        'Aim to speak for at least 45 to 90 seconds per part',
        'Answer each bullet point from the prompt'
      ],
      sampleUpgrades: [],
      source: 'Vistora Speaking NLP Engine (Rule-based)'
    };
  }

  // Linguistic features
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const lexicalDensity = count > 0 ? (uniqueWords / count) : 0;
  
  // Discourse markers check
  const connectors = ['because', 'however', 'furthermore', 'for example', 'for instance', 'in addition', 'on the other hand', 'moreover', 'although', 'actually', 'personally', 'in my opinion', 'to be honest', 'as a result'];
  const lowerTranscript = transcript.toLowerCase();
  const connectorHits = connectors.filter(c => lowerTranscript.includes(c)).length;

  let band = 5.0;
  if (count < 25) band = 3.5;
  else if (count < 60) band = 4.5;
  else if (count < 120) band = 5.5;
  else if (count < 180) band = 6.5;
  else band = 7.0;

  if (connectorHits >= 3 && lexicalDensity > 0.6 && band < 8.0) band += 0.5;

  const fcBand = Math.min(9.0, Math.max(2.0, (wpm >= 100 && wpm <= 160) ? band + 0.5 : band));
  const lrBand = Math.min(9.0, Math.max(2.0, lexicalDensity > 0.65 ? band + 0.5 : band));
  const graBand = Math.min(9.0, Math.max(2.0, band));
  const prBand = Math.min(9.0, Math.max(2.0, band));
  const overallBand = Math.round(((fcBand + lrBand + graBand + prBand) / 4) * 2) / 2;

  return {
    overallBand,
    wpm,
    criteria: {
      fluencyCoherence: {
        band: fcBand,
        feedback: `Pacing estimated at ${wpm} WPM. Found ${connectorHits} cohesive linking expressions in discourse.`
      },
      lexicalResource: {
        band: lrBand,
        feedback: `Vocabulary diversity of ${Math.round(lexicalDensity * 100)}% unique words across ${count} total words.`
      },
      grammaticalAccuracy: {
        band: graBand,
        feedback: 'Demonstrated coherent sentence formation and generally clear clause combinations.'
      },
      pronunciation: {
        band: prBand,
        feedback: 'Natural flow estimated from speech pacing and transcription phonological continuity.'
      }
    },
    summary: `Part ${part} spoken response successfully evaluated. Spoke ${count} words at an estimated rate of ${wpm} words per minute.`,
    strengths: [
      `Maintained speech flow across ${durationSeconds} seconds`,
      `Engaged directly with the prompt questions`,
      'Demonstrated communicative intent with recognizable vocabulary'
    ],
    improvements: [
      'Expand answers with concrete personal anecdotes and reasons',
      'Incorporate idiomatic language and topic-specific vocabulary collocations',
      'Vary sentence structures using subordinate conditional and relative clauses'
    ],
    sampleUpgrades: [
      {
        original: 'I like it because it is good',
        improved: 'I find it exceptionally rewarding due to the positive impact it has',
        reason: 'Elevates basic adjectives to academic evaluative vocabulary'
      }
    ],
    source: 'Vistora Speaking NLP Engine (Rule-based)'
  };
}

/**
 * Evaluate IELTS Speaking performance using Puku AI
 * @param {object} params - { part, title, questions, transcript, durationSeconds, wordCount }
 * @returns {Promise<object|null>}
 */
export async function evaluateSpeakingWithPuku({ part = 1, title = '', questions = [], transcript = '', durationSeconds = 0, wordCount = 0 }) {
  const words = (transcript || '').trim().split(/\s+/).filter(Boolean);
  const count = wordCount || words.length;
  const wpm = durationSeconds > 0 ? Math.round((count / durationSeconds) * 60) : 0;
  const { isMic, isExtremelyBrief } = checkMicTestOrNonAnswer(transcript, count, durationSeconds);

  // Immediate deterministic grading for mic testing and empty/sub-10 char transcripts
  if (!transcript || transcript.trim().length < 8 || isMic) {
    return {
      overallBand: 1.0,
      wpm,
      criteria: {
        fluencyCoherence: { band: 1.0, feedback: 'Candidate performed a microphone check or produced no extended speech on the topic.' },
        lexicalResource: { band: 1.0, feedback: 'No vocabulary related to the exam questions was produced.' },
        grammaticalAccuracy: { band: 1.0, feedback: 'No grammatical sentences or structures present to assess.' },
        pronunciation: { band: 1.0, feedback: 'Sample is too brief or repetitive for phonological evaluation.' }
      },
      summary: 'The candidate produced a microphone check rather than answering the IELTS questions. Under official IELTS criteria, no assessable language was provided, resulting in Band 1.0.',
      strengths: ['Microphone audio was recorded successfully'],
      improvements: [
        'Answer the actual prompt questions directly rather than performing a mic test',
        'Aim to speak for 1 to 2 minutes to provide adequate language for scoring',
        'Prepare key vocabulary related to the topic before beginning'
      ],
      sampleUpgrades: [],
      source: 'puku.sh (puku-ai-2.8 Speaking Examiner)'
    };
  }

  const systemPrompt = `You are a certified senior IELTS Speaking Examiner (British Council / IDP).
Evaluate the candidate's spoken response transcript strictly according to the official IELTS 9-band Speaking descriptors across the 4 core criteria:
1. Fluency and Coherence (FC) - consider speech rate (~110-150 WPM is typical for band 7+), speech continuity, hesitation, self-correction, and use of discourse markers.
2. Lexical Resource (LR) - consider vocabulary variety, natural collocations, idiomatic expressions, and precision.
3. Grammatical Range and Accuracy (GRA) - consider mix of simple and complex sentence structures, tense consistency, and grammatical accuracy.
4. Pronunciation & Intonation (PR) - evaluate phonological rhythm, sentence stress cues, and clarity evident from the transcript syntax and phrasing.

CRITICAL SCORING RULES:
- If the candidate's answer is extremely short (< 25 words) or off-topic, award Band 1.0 to 3.0. Do NOT award high scores for minimal answers.
- Band 0: Unassessable / mic test / no speech.
- Band 1: Non-user (isolated words only).
- Band 2: Intermittent user (barely any English).
- Band 3: Extremely limited.
- Band 4: Limited user (frequent hesitation, basic words).
- Band 5: Modest user (can maintain flow on familiar topics).
- Band 6: Competent user (generally effective, occasional lapses).
- Band 7: Good user (fluent, varied vocabulary, complex structures).
- Band 8: Very good user (fully fluent, precise idiom).
- Band 9: Expert user.

Respond strictly in valid JSON with scores from 0.0 to 9.0 (in increments of 0.5):
{
  "overallBand": 6.5,
  "criteria": {
    "fluencyCoherence": { "band": 6.5, "feedback": "Detailed examiner feedback..." },
    "lexicalResource": { "band": 6.5, "feedback": "Detailed examiner feedback..." },
    "grammaticalAccuracy": { "band": 6.0, "feedback": "Detailed examiner feedback..." },
    "pronunciation": { "band": 6.5, "feedback": "Detailed examiner feedback..." }
  },
  "summary": "Overall assessment of candidate...",
  "strengths": ["Specific strength 1"],
  "improvements": ["Specific actionable recommendation 1"],
  "sampleUpgrades": []
}`;

  const questionsText = Array.isArray(questions)
    ? questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : (questions || 'Standard Speaking Prompts');

  const userPrompt = `IELTS SPEAKING PART: Part ${part}
TOPIC / PROMPT: ${title || 'Speaking Topic'}
QUESTIONS / CUE CARD:
${questionsText}

CANDIDATE SPEECH METRICS:
- Duration: ${durationSeconds} seconds
- Word Count: ${count} words
- Estimated Speech Rate: ${wpm} words per minute

CANDIDATE SPOKEN TRANSCRIPT:
"${transcript}"

Evaluate this spoken response rigorously according to IELTS band descriptors. If the candidate barely spoke or gave an irrelevant test phrase, score it accurately at Band 1.0-2.0. Output only valid JSON.`;

  try {
    const rawResult = await generatePukuCompletion(userPrompt, systemPrompt, 2000, 28000);
    if (!rawResult) return null;

    const parsed = extractJson(rawResult);
    if (!parsed) return null;

    // Handle any schema variant from Puku AI (camelCase, snake_case, top-level, or nested)
    const fc = parsed.criteria?.fluencyCoherence
      || parsed.criteria?.fluency_and_coherence
      || parsed.fluency_and_coherence
      || parsed.fluencyCoherence
      || parsed.fc
      || {};
    const lr = parsed.criteria?.lexicalResource
      || parsed.criteria?.lexical_resource
      || parsed.lexical_resource
      || parsed.lexicalResource
      || parsed.lr
      || {};
    const gra = parsed.criteria?.grammaticalAccuracy
      || parsed.criteria?.grammatical_range_and_accuracy
      || parsed.grammatical_range_and_accuracy
      || parsed.grammaticalAccuracy
      || parsed.gra
      || {};
    const pr = parsed.criteria?.pronunciation
      || parsed.criteria?.pronunciation_intonation
      || parsed.pronunciation
      || parsed.pronunciation_intonation
      || parsed.pr
      || {};

    const defaultCriteriaBand = isExtremelyBrief ? 2.0 : 5.0;
    let fcBand = extractBandNumber(fc) ?? defaultCriteriaBand;
    let lrBand = extractBandNumber(lr) ?? defaultCriteriaBand;
    let graBand = extractBandNumber(gra) ?? defaultCriteriaBand;
    let prBand = extractBandNumber(pr) ?? defaultCriteriaBand;

    let overallBand = extractBandNumber(parsed.overallBand)
      ?? extractBandNumber(parsed.overall_band)
      ?? extractBandNumber(parsed.overall_score)
      ?? extractBandNumber(parsed.overall)
      ?? extractBandNumber(parsed.band);

    if (typeof overallBand !== 'number') {
      const avg = (fcBand + lrBand + graBand + prBand) / 4;
      overallBand = Math.round(avg * 2) / 2;
    }

    // Sanity checks against inflated scores for extremely low-effort responses
    if (count < 12 || durationSeconds < 8) {
      overallBand = Math.min(overallBand, 1.5);
      fcBand = Math.min(fcBand, 1.5);
      lrBand = Math.min(lrBand, 1.5);
      graBand = Math.min(graBand, 1.5);
      prBand = Math.min(prBand, 1.5);
    } else if (count < 25) {
      overallBand = Math.min(overallBand, 3.5);
      fcBand = Math.min(fcBand, 3.5);
      lrBand = Math.min(lrBand, 3.5);
      graBand = Math.min(graBand, 3.5);
      prBand = Math.min(prBand, 3.5);
    } else if (count < 45) {
      overallBand = Math.min(overallBand, 5.0);
    }

    const candidateStrengths = (Array.isArray(parsed.strengths) && parsed.strengths.length ? parsed.strengths : null)
      || (overallBand <= 2.0
          ? ['Microphone recording was completed']
          : [
              'Maintains communicative flow across the response',
              'Directly addresses key aspects of the prompt questions',
              'Demonstrates accessible conversational vocabulary'
            ]);

    const candidateImprovements = (Array.isArray(parsed.improvements) && parsed.improvements.length ? parsed.improvements : null)
      || (Array.isArray(parsed.recommendations) && parsed.recommendations.length ? parsed.recommendations : null)
      || (overallBand <= 2.0
          ? [
              'Answer the prompt questions directly using full sentences',
              'Speak for at least 1 to 2 minutes to provide adequate language for evaluation',
              'Prepare vocabulary related to the topic before beginning'
            ]
          : [
              'Expand answers with concrete examples and nuanced reasoning',
              'Enhance range of academic and idiomatic collocation',
              'Utilize a greater variety of complex grammatical clauses'
            ]);

    return {
      overallBand,
      wpm,
      criteria: {
        fluencyCoherence: {
          band: fcBand,
          feedback: extractFeedback(fc, 'Evaluated against official Fluency & Coherence descriptors.')
        },
        lexicalResource: {
          band: lrBand,
          feedback: extractFeedback(lr, 'Evaluated against official Lexical Resource descriptors.')
        },
        grammaticalAccuracy: {
          band: graBand,
          feedback: extractFeedback(gra, 'Evaluated against official Grammatical Range & Accuracy descriptors.')
        },
        pronunciation: {
          band: prBand,
          feedback: extractFeedback(pr, 'Evaluated against official Pronunciation & Intonation descriptors.')
        }
      },
      summary: parsed.summary || 'Spoken response assessed by Puku AI Speaking Examiner.',
      strengths: candidateStrengths,
      improvements: candidateImprovements,
      sampleUpgrades: Array.isArray(parsed.sampleUpgrades) ? parsed.sampleUpgrades : [],
      source: 'puku.sh (puku-ai-2.8 Speaking Examiner)'
    };
  } catch (err) {
    console.warn(`[Puku.sh Speaking] Evaluation error: ${err.message}`);
    return null;
  }
}

/**
 * Cleanly strips raw Markdown symbols (asterisks, hashes, horizontal rules)
 * to output professional, executive-grade plain text documents.
 */
export function stripMarkdownFormatting(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Remove horizontal rules like ---, ***, ___
    .replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, '')
    // Convert markdown headers (# Title, ## Subtitle) to plain text
    .replace(/^[ \t]*#{1,6}[ \t]+(.+)$/gm, '$1')
    // Remove bold and italics: **bold**, *italic*, __bold__, _italic_
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove inline code ticks: `code`
    .replace(/`([^`]+)`/g, '$1')
    // Convert markdown bullet points to clean bullet points
    .replace(/^[ \t]*[-*][ \t]+/gm, '• ')
    // Normalize consecutive blank lines to at most two
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generate customized academic and professional documents using Puku AI
 */
export async function generateDocumentWithPuku(type, params) {
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
    tone = 'Formal Academic'
  } = params;

  const systemPrompt = `You are an elite academic admissions director and career consultant specializing in top international university applications and high-level corporate careers.
Write articulate, compelling, authentic documents tailored SPECIFICALLY to the candidate's exact provided inputs.
Do NOT invent unrelated background facts that contradict the candidate's actual field or details.

CRITICAL FORMATTING INSTRUCTIONS:
1. ABSOLUTELY DO NOT use any Markdown symbols or markdown syntax.
2. DO NOT use asterisks (** or *), hashes (##, ###), underscores (__ or _), or horizontal rules (---).
3. Use clean plain text formatting. Use standard UPPERCASE HEADINGS for sections (e.g. CAREER OBJECTIVE, ACADEMIC BACKGROUND, TECHNICAL SKILLS).
4. Use standard bullet points (• ) for lists and achievements.
5. Generate the ENTIRE document completely from start to finish without cutting off. Ensure all sections are fully articulated and complete.`;

  let userPrompt = '';

  if (type === 'cv') {
    userPrompt = `Please generate a comprehensive, highly personalized, and complete CURRICULUM VITAE (CV) dynamically tailored to the following candidate details:
- Candidate Name: ${fullName}
- Contact Email: ${email || '[Enter Email Address]'}
- Current Degree / Institution: ${degree || 'Computer Science and Engineering'}
- Target Country: ${country || 'International / Global'}
- English Proficiency: ${ielts ? `IELTS Band ${ielts}` : 'Proficient in Academic English'}
- Key Skills & Expertise: ${skills || 'Algorithms, System Design, Full-Stack Engineering, Applied Computing'}
- Work / Research Experience: ${experience || 'Software engineering, academic research, applied technical projects'}

DYNAMIC SECTION INSTRUCTIONS:
- Header: Feature the candidate's name (${fullName.toUpperCase()}), contact email (${email || 'Email'}), and location (${country ? `Targeting: ${country}` : 'Dhaka, Bangladesh'}).
- CAREER OBJECTIVE: Craft an objective specifically tailored around their stated degree/discipline (${degree || 'Computer Science'}) and their target destination (${country || 'international institutions'}).
- ACADEMIC BACKGROUND: Accurately reflect their stated degree and institution (${degree || 'B.Sc. in Computer Science and Engineering'}). Include coursework relevant to their discipline. Include IELTS Band ${ielts || '7.5'}.
- TECHNICAL SKILLS: Feature all user-provided skills (${skills || 'Programming, Problem Solving, System Design'}) categorized logically (Languages, Frameworks, Tools, Databases).
- WORK / RESEARCH EXPERIENCE: Transform their provided experience (${experience || 'Software development and research'}) into high-impact, quantified bullet points.
- ACADEMIC PROJECTS: Provide 3-4 impressive, relevant projects matching their stated skills (${skills || 'Computing'}).
- Include complete sections for AWARDS AND HONORS, PUBLICATIONS / PRESENTATIONS, and REFERENCES.
- FORMAT: Output strictly in clean, executive plain text without asterisks (**), hashes (##), or horizontal rules (---).`;
  } else if (type === 'sop') {
    userPrompt = `Please generate an articulate, persuasive, and tailored STATEMENT OF PURPOSE (SOP) based on:
- Candidate Name: ${fullName}
- Target Program: ${program || degree || 'Graduate Program'}
- Target University: ${university || 'Target University'}
- Research Interests: ${interests || 'Advanced computing systems and emerging technologies'}
- Academic Background: ${background || degree || 'Rigorous undergraduate study with distinction'}
- Why This University: ${why || 'Distinguished faculty, advanced laboratory facilities, and collaborative culture'}
- Career & Academic Goals: ${goals || 'Pursuing doctoral research and becoming an international technology innovator'}

DYNAMIC INSTRUCTIONS:
- Specifically mention ${university || 'the university'} and ${program || degree || 'the program'} throughout the essay.
- Build upon their specific background (${background || degree}) and detail how it prepares them for ${interests || 'advanced studies'}.
- Articulate clear synergy with ${university}'s faculty and programs based on: ${why}.
- Close with their concrete goals: ${goals}.
- FORMAT: Clean plain text essay without any asterisks (**), hashes (##), or markdown symbols.`;
  } else if (type === 'ps') {
    userPrompt = `Please generate an inspiring, highly personal, and authentic PERSONAL STATEMENT for:
- Candidate Name: ${fullName}
- Target Course: ${program || degree || 'Graduate Studies'}
- Target University: ${university || 'Target University'}
- Motivating Experience: ${motivation || 'A defining moment of curiosity and overcoming technical challenges'}
- Extracurricular & Leadership: ${extra || 'Student club leadership, hackathons, and community mentorship'}
- Why This Subject: ${why || 'A deep commitment to computational innovation and real-world impact'}

DYNAMIC INSTRUCTIONS:
- Narrate a cohesive personal story starting from ${motivation || 'their early academic curiosity'}.
- Integrate their extracurricular achievements (${extra}) to showcase leadership and resilience.
- Connect their values to studying ${program || degree} at ${university}.
- FORMAT: Clean plain text without any asterisks (**), hashes (##), or markdown symbols.`;
  } else if (type === 'cl') {
    userPrompt = `Please generate a polished, compelling, and tailored COVER LETTER for:
- Candidate Name: ${fullName}
- Position Applied For: ${position || 'Software Engineer / Research Associate'}
- Company / Organization: ${company || 'Target Organization'}
- Key Relevant Experience: ${experience || skills || 'Demonstrated track record of delivering technical solutions'}
- Why This Organization: ${why || 'Inspiration from your market leadership and engineering culture'}
- Tone: ${tone}

DYNAMIC INSTRUCTIONS:
- Specifically address the hiring committee for ${position || 'the role'} at ${company || 'the organization'}.
- Frame the candidate's background (${experience || skills}) as the direct solution to the organization's needs.
- Close professionally with candidate name ${fullName}.
- FORMAT: Clean plain text without asterisks (**), hashes (##), or markdown symbols.`;
  }

  try {
    const generatedText = await generatePukuCompletion(userPrompt, systemPrompt, 3500, 60000);
    if (!generatedText) return null;
    return stripMarkdownFormatting(generatedText);
  } catch (err) {
    console.warn(`[Puku.sh Document] Failed to generate document: ${err.message}`);
    return null;
  }
}

