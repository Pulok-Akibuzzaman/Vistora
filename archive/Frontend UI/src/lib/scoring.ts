// "Choose TWO letters" questions: both answers in a pair may be given in either order,
// but each correct letter only counts once.
const LISTENING_PAIRS: Record<number, [number, number][]> = {
  1: [[21, 22], [23, 24]],
  2: [[11, 12], [13, 14], [25, 26]],
}

const READING_PAIRS: Record<number, [number, number][]> = {
  4: [[10, 11], [12, 13]],
}

export const listeningPairs = (testNumber?: number) => LISTENING_PAIRS[testNumber === 2 ? 2 : 1]
export const readingPairs = (testNumber?: number) => READING_PAIRS[testNumber ?? 1] || []

export const normalizeAnswer = (value?: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase().replace(/\s+/g, ' ') : ''

/** Marks each question in the answer key as correct or not. */
export function markAnswers(
  answerKey: Record<number, string[]>,
  responses: Record<number | string, unknown>,
  pairs: [number, number][] = [],
): Record<number, boolean> {
  const marks: Record<number, boolean> = {}
  for (const [key, accepted] of Object.entries(answerKey)) {
    const response = normalizeAnswer(responses[key])
    marks[Number(key)] = !!response && accepted.some(value => normalizeAnswer(value) === response)
  }
  for (const [first, second] of pairs) {
    const expected = new Set((answerKey[first] || []).map(value => normalizeAnswer(value)))
    const firstResponse = normalizeAnswer(responses[first])
    const secondResponse = normalizeAnswer(responses[second])
    marks[first] = !!firstResponse && expected.has(firstResponse)
    marks[second] = !!secondResponse && expected.has(secondResponse) && secondResponse !== firstResponse
  }
  return marks
}

export const countCorrect = (marks: Record<number, boolean>) => Object.values(marks).filter(Boolean).length
