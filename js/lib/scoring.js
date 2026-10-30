// js/lib/scoring.js
/**
 * Local Bundled IELTS Scoring Engine
 * Evaluates listening and reading tests purely in-browser with zero backend requirement.
 */

const LISTENING_PAIRS = {
  1: [[21, 22], [23, 24]],
  2: [[11, 12], [13, 14], [25, 26]],
};

const READING_PAIRS = {
  4: [[10, 11], [12, 13]],
};

export const listeningPairs = (testNumber = 1) => LISTENING_PAIRS[testNumber === 2 ? 2 : 1] || [];
export const readingPairs = (testNumber = 1) => READING_PAIRS[testNumber] || [];

export function normalizeAnswer(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Marks each question in the test against the answer key.
 * Handles "Choose TWO letters" pairs so each correct letter only counts once.
 */
export function markAnswers(answerKey, responses, pairs = []) {
  const marks = {};

  // Standard grading
  for (const [key, accepted] of Object.entries(answerKey)) {
    const qNum = Number(key);
    const userResp = normalizeAnswer(responses[key] || responses[qNum]);
    const acceptedNormalized = Array.isArray(accepted) 
      ? accepted.map(a => normalizeAnswer(a))
      : [normalizeAnswer(accepted)];

    marks[qNum] = Boolean(userResp && acceptedNormalized.some(acc => acc === userResp));
  }

  // Handle paired multi-select questions
  for (const [first, second] of pairs) {
    const acceptedList = (answerKey[first] || []).map(val => normalizeAnswer(val));
    const expected = new Set(acceptedList);

    const firstResponse = normalizeAnswer(responses[first]);
    const secondResponse = normalizeAnswer(responses[second]);

    marks[first] = Boolean(firstResponse && expected.has(firstResponse));
    marks[second] = Boolean(
      secondResponse && 
      expected.has(secondResponse) && 
      secondResponse !== firstResponse
    );
  }

  return marks;
}

export function countCorrect(marks) {
  return Object.values(marks).filter(Boolean).length;
}

/**
 * Converts raw correct answers (out of 40) to standard IELTS 9-band scale
 */
export function calculateBandScore(rawScore, testType = 'Listening') {
  const score = Math.max(0, Math.min(40, Number(rawScore) || 0));

  if (testType === 'Listening') {
    if (score >= 39) return 9.0;
    if (score >= 37) return 8.5;
    if (score >= 35) return 8.0;
    if (score >= 32) return 7.5;
    if (score >= 30) return 7.0;
    if (score >= 26) return 6.5;
    if (score >= 23) return 6.0;
    if (score >= 18) return 5.5;
    if (score >= 16) return 5.0;
    if (score >= 13) return 4.5;
    if (score >= 10) return 4.0;
    if (score >= 7) return 3.5;
    if (score >= 5) return 3.0;
    if (score >= 3) return 2.5;
    return score > 0 ? 2.0 : 0.0;
  }

  // Academic Reading
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 7) return 3.5;
  if (score >= 5) return 3.0;
  if (score >= 3) return 2.5;
  return score > 0 ? 2.0 : 0.0;
}
