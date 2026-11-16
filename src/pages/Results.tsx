import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import { NavLink } from 'react-router'
import { fetchResults, deleteExamResultApi, type StoredExamResult } from '../lib/api'
import { useAuth } from '../lib/authContext'
import { listeningPairs, markAnswers, readingPairs } from '../lib/scoring'
import { READING_ANSWERS, READING_PASSAGES } from '../data/readingTest1'
import { READING_ANSWERS_2, READING_PASSAGES_2 } from '../data/readingTest2'
import { READING_ANSWERS_3, READING_PASSAGES_3 } from '../data/readingTest3'
import { READING_ANSWERS_4, READING_PASSAGES_4 } from '../data/readingTest4'
import { READING_ANSWERS_19, READING_PASSAGES_19 } from '../data/readingTest19'
import { READING_ANSWERS_192, READING_PASSAGES_192 } from '../data/readingTest19_2'
import { READING_ANSWERS_21, READING_PASSAGES_21 } from '../data/readingTest21'
import { READING_ANSWERS_21_T2, READING_PASSAGES_21_T2 } from '../data/readingTest21_2'
import { LISTENING_ANSWERS, LISTENING_PARTS_1 } from '../data/listeningTest1'
import { LISTENING_ANSWERS_2, LISTENING_PARTS_2 } from '../data/listeningTest2'

const FILTERS = ['All', 'Full Test', 'Reading', 'Listening', 'Writing', 'Speaking'] as const

const READING_TESTS: Record<number, { passages: typeof READING_PASSAGES; answers: Record<number, string[]> }> = {
  1: { passages: READING_PASSAGES, answers: READING_ANSWERS },
  2: { passages: READING_PASSAGES_2, answers: READING_ANSWERS_2 },
  3: { passages: READING_PASSAGES_3, answers: READING_ANSWERS_3 },
  4: { passages: READING_PASSAGES_4, answers: READING_ANSWERS_4 },
  19: { passages: READING_PASSAGES_19, answers: READING_ANSWERS_19 },
  192: { passages: READING_PASSAGES_192, answers: READING_ANSWERS_192 },
  21: { passages: READING_PASSAGES_21, answers: READING_ANSWERS_21 },
  22: { passages: READING_PASSAGES_21_T2, answers: READING_ANSWERS_21_T2 },
}

// Older results don't store testNumber/part, so fall back to the title, e.g. "IELTS 18 — Reading Test 3 · Part 1"
function getResultTest(result: StoredExamResult) {
  // Only Reading uses the internal book ids (19, 192, 21, 22); Listening keeps the plain test number
  const isReading = result.testType === 'Reading'
  const isBook19 = isReading && /IELTS\s*19/i.test(result.testTitle)
  const isBook21 = isReading && /IELTS\s*21/i.test(result.testTitle)
  const titleTest = result.testTitle.match(/Test (\d+)/)
  const titlePart = result.testTitle.match(/Part (\d+)/)
  let testNum = result.testNumber ?? (titleTest ? Number(titleTest[1]) : 1)
  if (isBook19 && (testNum === 2 || testNum === 192)) {
    testNum = 192
  } else if (isBook19 && (testNum === 1 || testNum === 19)) {
    testNum = 19
  } else if (isBook21 && (testNum === 2 || testNum === 22)) {
    testNum = 22
  } else if (isBook21 && (testNum === 1 || testNum === 21)) {
    testNum = 21
  }
  return {
    testNumber: testNum,
    part: result.part ?? (titlePart ? Number(titlePart[1]) : undefined),
  }
}

function getTestTypeBadge(testType: string) {
  switch (testType) {
    case 'Speaking':
      return { label: 'Speaking', bg: 'bg-purple-50 text-purple-800 border-purple-200' }
    case 'Reading':
      return { label: 'Reading', bg: 'bg-sky-50 text-sky-800 border-sky-200' }
    case 'Listening':
      return { label: 'Listening', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
    case 'Writing':
      return { label: 'Writing', bg: 'bg-amber-50 text-amber-800 border-amber-200' }
    default:
      return { label: 'Full Test', bg: 'bg-slate-100 text-slate-700 border-slate-300' }
  }
}

function ResultDetail({ result, userName }: { result: StoredExamResult; userName: string }) {
  const [filterType, setFilterType] = useState<'all' | 'incorrect' | 'correct'>('all')
  const [copiedTranscript, setCopiedTranscript] = useState(false)

  // --------------------------------------------------------------------------
  // Speaking Details
  // --------------------------------------------------------------------------
  const isSpeaking = result.testType === 'Speaking'
  const speakingTranscript: string =
    typeof result.userAnswers?.transcript === 'string'
      ? result.userAnswers.transcript
      : typeof result.userAnswers?.text === 'string'
        ? result.userAnswers.text
        : ''
  const speakingDuration = result.userAnswers?.durationSeconds || 0
  const speakingWords =
    result.userAnswers?.wordCount ||
    (speakingTranscript ? speakingTranscript.split(/\s+/).filter(Boolean).length : 0)
  const speakingWpm =
    speakingDuration > 0 ? Math.round(speakingWords / (speakingDuration / 60)) : 0

  const handleCopyTranscript = () => {
    if (!speakingTranscript) return
    navigator.clipboard?.writeText(speakingTranscript)
    setCopiedTranscript(true)
    setTimeout(() => setCopiedTranscript(false), 2000)
  }

  // --------------------------------------------------------------------------
  // Writing Details
  // --------------------------------------------------------------------------
  const isWriting = result.testType === 'Writing'
  // Practice Writing tests store their responses by task number ({ 1: '...', 2: '...' })
  const practiceTasks = [1, 2]
    .map(taskNumber => ({ taskNumber, text: result.userAnswers?.[taskNumber] }))
    .filter((task): task is { taskNumber: number; text: string } => typeof task.text === 'string' && task.text.trim() !== '')
  const writingEssay: string =
    typeof result.userAnswers?.essay === 'string'
      ? result.userAnswers.essay
      : typeof result.userAnswers?.task2 === 'string'
        ? result.userAnswers.task2
        : typeof result.userAnswers?.task1 === 'string'
          ? result.userAnswers.task1
          : practiceTasks
              .map(task => (practiceTasks.length > 1 ? `Task ${task.taskNumber}\n${task.text.trim()}` : task.text.trim()))
              .join('\n\n')
  const writingWords =
    result.userAnswers?.wordCount ||
    (writingEssay ? writingEssay.split(/\s+/).filter(Boolean).length : 0)

  // --------------------------------------------------------------------------
  // Reading Questions & Diagnostics
  // --------------------------------------------------------------------------
  const isReading = result.testType === 'Reading'
  const { testNumber, part } = getResultTest(result)
  const readingTest = READING_TESTS[testNumber]
  const readingQuestions = useMemo(() => {
    if (!isReading || !result.userAnswers || !readingTest) return []
    if (part !== undefined) return readingTest.passages[part - 1]?.questions || []
    return readingTest.passages.flatMap(p => p.questions)
  }, [isReading, readingTest, part, result.userAnswers])

  const readingReviewItems = useMemo(() => {
    if (!isReading || !result.userAnswers || !readingTest || readingQuestions.length === 0) return []
    const marks = markAnswers(readingTest.answers, result.userAnswers, readingPairs(testNumber))
    return readingQuestions.map(q => {
      const userAns = result.userAnswers ? (result.userAnswers[q.id] || result.userAnswers[String(q.id)] || '') : ''
      const accepted = readingTest.answers[q.id] || []
      const correct = !!marks[q.id]
      return {
        id: q.id,
        prompt: q.prompt,
        userAns: userAns.trim(),
        accepted,
        correct,
        unanswered: !userAns.trim(),
        explanation: q.explanation,
        passageReference: q.passageReference,
      }
    })
  }, [isReading, readingQuestions, readingTest, testNumber, result.userAnswers])

  // --------------------------------------------------------------------------
  // Listening Questions & Diagnostics
  // --------------------------------------------------------------------------
  const isListening = result.testType === 'Listening'
  const listeningReviewItems = useMemo(() => {
    if (!isListening || !result.userAnswers) return []
    // Listening tests other than Test 2 show Test 1's questions in the practice centre
    const listeningAnswers = testNumber === 2 ? LISTENING_ANSWERS_2 : LISTENING_ANSWERS
    const activeParts = testNumber === 2 ? LISTENING_PARTS_2 : LISTENING_PARTS_1
    const questionsMap = new Map(activeParts.flatMap(p => p.questions).map(q => [q.id, q]))
    const marks = markAnswers(listeningAnswers, result.userAnswers, listeningPairs(testNumber))
    return Object.entries(listeningAnswers).filter(([key]) => {
      const id = Number(key)
      return part === undefined || (id >= (part - 1) * 10 + 1 && id <= part * 10)
    }).map(([key, accepted]) => {
      const id = Number(key)
      const q = questionsMap.get(id)
      const userAns = result.userAnswers ? (result.userAnswers[id] || result.userAnswers[key] || '') : ''
      const correct = !!marks[id]
      return {
        id,
        prompt: q?.prompt || `Question ${id}`,
        userAns: userAns.trim(),
        accepted,
        correct,
        unanswered: !userAns.trim(),
        explanation: q?.explanation,
      }
    })
  }, [isListening, testNumber, part, result.userAnswers])

  const activeReviewItems = isReading ? readingReviewItems : isListening ? listeningReviewItems : []

  const filteredItems = useMemo(() => {
    if (filterType === 'incorrect') return activeReviewItems.filter(item => !item.correct)
    if (filterType === 'correct') return activeReviewItems.filter(item => item.correct)
    return activeReviewItems
  }, [filterType, activeReviewItems])

  const descriptor =
    result.overallBand === null
      ? 'Awaiting AI evaluation'
      : result.overallBand >= 8
        ? 'Very Good User'
        : result.overallBand >= 7
          ? 'Good User'
          : result.overallBand >= 6
            ? 'Competent User'
            : result.overallBand >= 5
              ? 'Modest User'
              : 'Developing User'

  const badgeInfo = getTestTypeBadge(result.testType)

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <section className="corner-mark border border-divider bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-block border px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">
                {result.source.toUpperCase()} EVALUATION
              </span>
            </div>
            <h1 className="mt-3 font-plex text-2xl font-bold text-ink sm:text-3xl">{result.testTitle}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-graphite-light">
              <span className="font-bold text-ink">{userName}</span>
              <span>·</span>
              <span>IELTS PREPARATION</span>
              <span>·</span>
              <span>{new Date(result.completedAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-8 border-rose-100 font-mono text-2xl font-bold text-rose-600 shadow-sm">
              {result.overallBand === null ? '—' : result.overallBand.toFixed(1)}
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">Overall Band</div>
              <div className="mt-1 font-plex text-base font-semibold text-ink">{descriptor}</div>
              <div className="font-mono text-[11px] text-graphite-light">IELTS 9-Band Scale</div>
            </div>
          </div>
        </div>

        {/* Examiner Commentary */}
        {result.comment && (
          <div className="mt-6 rounded-sm border-l-4 border-rose-500 bg-rose-50/50 p-5 text-sm leading-relaxed text-ink">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-rose-800">
              <span><Icon name="mic" /> Examiner Assessment & Commentary</span>
            </div>
            <p className="mt-2 font-plex text-sm text-graphite">{result.comment}</p>
          </div>
        )}
      </section>

      {/* Skill Bands Breakdown (if applicable) */}
      {result.skillBands && Object.keys(result.skillBands).length > 0 && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(result.skillBands).map(([skill, band]) => (
            <div key={skill} className="border border-divider bg-surface p-5">
              <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">{skill}</div>
              <div className="mt-2 font-mono text-3xl font-bold text-accent">{band?.toFixed(1) || '—'}</div>
              <div className="mt-3 h-1 bg-divider">
                <div className="h-full bg-electric" style={{ width: `${((band || 0) / 9) * 100}%` }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* =================================================================== */}
      {/* SPEAKING MODULE VIEW                                               */}
      {/* =================================================================== */}
      {isSpeaking && (
        <>
          {/* Speaking Metrics Bar */}
          <section className="border border-divider bg-surface p-5">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-graphite-light">
              Speech Performance Analytics
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="border-l-2 border-purple-500 pl-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-graphite-light">Duration</div>
                <div className="mt-1 font-mono text-xl font-bold text-ink">
                  {speakingDuration > 0 ? `${Math.floor(speakingDuration / 60)}m ${speakingDuration % 60}s` : 'Recorded'}
                </div>
              </div>
              <div className="border-l-2 border-indigo-500 pl-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-graphite-light">Words Spoken</div>
                <div className="mt-1 font-mono text-xl font-bold text-ink">{speakingWords} words</div>
              </div>
              <div className="border-l-2 border-emerald-500 pl-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-graphite-light">Speech Pace</div>
                <div className="mt-1 font-mono text-xl font-bold text-ink">
                  {speakingWpm > 0 ? `${speakingWpm} WPM` : '—'}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-graphite-light">
                  {speakingWpm < 70 ? 'Low pace / hesitation' : speakingWpm < 120 ? 'Controlled pace' : 'Natural flow'}
                </div>
              </div>
              <div className="border-l-2 border-rose-500 pl-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-graphite-light">AI Evaluator</div>
                <div className="mt-1 font-mono text-xl font-bold text-rose-600">Puku AI</div>
                <div className="mt-0.5 font-mono text-[10px] text-graphite-light">Official IELTS Rubric</div>
              </div>
            </div>
          </section>

          {/* Candidate Spoken Transcript */}
          <section className="border border-divider bg-surface p-6">
            <div className="flex flex-col gap-3 border-b border-divider pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="label-tag">CANDIDATE AUDIO TRANSCRIPT</div>
                <h2 className="mt-1 font-plex text-xl font-bold text-ink">Verbatim Speech Recognition</h2>
                <p className="mt-1 text-sm text-graphite-mid">
                  Speech-to-text recorded during your Speaking test session.
                </p>
              </div>
              {speakingTranscript && (
                <button
                  type="button"
                  onClick={handleCopyTranscript}
                  className="inline-flex items-center gap-2 self-start rounded-sm border border-divider bg-surface-2 px-3 py-1.5 font-mono text-xs font-semibold text-ink transition-colors hover:border-graphite"
                >
                  <Icon name={copiedTranscript ? 'check-circle' : 'clipboard'} /> {copiedTranscript ? 'Copied!' : 'Copy Transcript'}
                </button>
              )}
            </div>

            <div className="mt-5">
              {speakingTranscript ? (
                <div className="rounded-sm border border-divider bg-surface-2 p-5 font-plex text-base leading-relaxed text-ink shadow-inner whitespace-pre-line">
                  {speakingTranscript}
                </div>
              ) : (
                <div className="rounded-sm border border-dashed border-divider p-8 text-center text-sm text-graphite-light">
                  No speech transcript recorded for this session.
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* =================================================================== */}
      {/* WRITING MODULE VIEW                                                */}
      {/* =================================================================== */}
      {isWriting && (
        <section className="border border-divider bg-surface p-6">
          <div className="flex flex-col gap-3 border-b border-divider pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="label-tag">CANDIDATE ESSAY SUBMISSION</div>
              <h2 className="mt-1 font-plex text-xl font-bold text-ink">Written Response</h2>
            </div>
            <div className="font-mono text-xs text-graphite-light">
              <span className="font-bold text-ink">{writingWords}</span> words submitted
            </div>
          </div>
          <div className="mt-5">
            {writingEssay ? (
              <div className="rounded-sm border border-divider bg-surface-2 p-5 font-plex text-sm leading-relaxed text-ink whitespace-pre-line">
                {writingEssay}
              </div>
            ) : (
              <div className="rounded-sm border border-dashed border-divider p-8 text-center text-sm text-graphite-light">
                No essay content recorded for this attempt.
              </div>
            )}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* OBJECTIVE SCORE BAR (READING & LISTENING)                           */}
      {/* =================================================================== */}
      {(isReading || isListening) && result.correctAnswers !== undefined && (
        <section className="border border-divider bg-surface p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">Objective Score</div>
              <div className="mt-1">
                <span className="font-mono text-3xl font-bold text-ink">{result.correctAnswers}</span>
                <span className="font-mono text-sm text-graphite-light"> / {result.totalQuestions}</span>
              </div>
            </div>
            <div className="w-full sm:max-w-md">
              <div className="h-2 bg-divider">
                <div
                  className="h-full bg-electric"
                  style={{ width: `${(result.correctAnswers / (result.totalQuestions || 1)) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-right font-mono text-xs text-graphite-light">
                {Math.round((result.correctAnswers / (result.totalQuestions || 1)) * 100)}% accuracy
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* DIAGNOSTIC ANSWER REVIEW (READING)                                  */}
      {/* =================================================================== */}
      {isReading && readingReviewItems.length > 0 && (
        <section className="border border-divider bg-surface p-6">
          <div className="flex flex-col gap-4 border-b border-divider pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="label-tag">DIAGNOSTIC REVIEW</div>
              <h2 className="mt-2 font-plex text-xl font-bold text-ink">Answer Review & Passage Evidence</h2>
              <p className="mt-1 text-sm text-graphite-mid">
                Compare your responses against correct answers, with explanations and exact passage excerpts.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`rounded-sm border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                  filterType === 'all'
                    ? 'border-navy bg-navy text-white'
                    : 'border-divider bg-surface text-graphite hover:border-graphite-light'
                }`}
              >
                All ({readingReviewItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('incorrect')}
                className={`rounded-sm border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                  filterType === 'incorrect'
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300'
                }`}
              >
                Mistakes ({readingReviewItems.filter(item => !item.correct).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('correct')}
                className={`rounded-sm border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                  filterType === 'correct'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300'
                }`}
              >
                Correct ({readingReviewItems.filter(item => item.correct).length})
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-sm text-graphite-mid">
                {filterType === 'incorrect' ? 'Great job! You have no incorrect answers.' : 'No questions match this filter.'}
              </div>
            ) : (
              (filteredItems as typeof readingReviewItems).map(item => (
                <article
                  key={item.id}
                  className={`rounded-sm border p-5 transition-all ${
                    item.correct
                      ? 'border-emerald-200 bg-surface border-l-4 border-l-emerald-600'
                      : item.unanswered
                        ? 'border-amber-200 bg-surface border-l-4 border-l-amber-500'
                        : 'border-rose-200 bg-surface border-l-4 border-l-rose-600'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-surface-2 font-mono text-xs font-bold text-ink">
                        {item.id}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">
                        Question {item.id}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold ${
                        item.correct
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                          : item.unanswered
                            ? 'border border-amber-200 bg-amber-50 text-amber-800'
                            : 'border border-rose-200 bg-rose-50 text-rose-800'
                      }`}
                    >
                      {item.correct ? '✓ Correct' : item.unanswered ? '○ Unanswered' : '✕ Incorrect'}
                    </span>
                  </div>

                  {item.prompt && (
                    <div className="mt-3 font-plex text-sm font-semibold leading-6 text-ink">
                      {item.prompt}
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div
                      className={`rounded-sm border p-3 ${
                        item.correct ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'
                      }`}
                    >
                      <div className="font-mono text-[11px] uppercase tracking-wider text-graphite-light">Your Response</div>
                      <div
                        className={`mt-1 font-mono text-sm font-bold ${
                          item.correct ? 'text-emerald-800' : 'text-rose-600'
                        }`}
                      >
                        {item.userAns || <span className="font-normal italic text-graphite-light">(No answer given)</span>}
                      </div>
                    </div>

                    <div className="rounded-sm border border-emerald-300 bg-emerald-50/50 p-3">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-emerald-800">Correct Answer</div>
                      <div className="mt-1 font-mono text-sm font-bold text-emerald-800">
                        {item.accepted.join(' / ')}
                      </div>
                    </div>
                  </div>

                  {item.explanation && (
                    <div className="mt-4 rounded-sm border border-divider bg-surface-2 p-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
                        <span><Icon name="lightbulb" /> Explanation</span>
                      </div>
                      <p className="mt-1.5 font-plex text-sm leading-6 text-graphite">
                        {item.explanation}
                      </p>
                    </div>
                  )}

                  {item.passageReference && (
                    <div className="mt-3 rounded-sm border border-sky-100 bg-sky-50/40 p-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-sky-800">
                        <span><Icon name="book-open" /> Passage Evidence Excerpt</span>
                      </div>
                      <blockquote className="mt-1.5 border-l-2 border-sky-400 pl-3 font-plex text-sm italic leading-6 text-sky-950">
                        {item.passageReference}
                      </blockquote>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* DIAGNOSTIC ANSWER REVIEW (LISTENING)                                */}
      {/* =================================================================== */}
      {isListening && listeningReviewItems.length > 0 && (
        <section className="border border-divider bg-surface p-6">
          <div className="flex flex-col gap-4 border-b border-divider pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="label-tag">DIAGNOSTIC REVIEW</div>
              <h2 className="mt-2 font-plex text-xl font-bold text-ink">Listening Answers Check</h2>
              <p className="mt-1 text-sm text-graphite-mid">
                Compare your recorded answers against the official Cambridge IELTS listening key.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`rounded-sm border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                  filterType === 'all'
                    ? 'border-navy bg-navy text-white'
                    : 'border-divider bg-surface text-graphite hover:border-graphite-light'
                }`}
              >
                All ({listeningReviewItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('incorrect')}
                className={`rounded-sm border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                  filterType === 'incorrect'
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300'
                }`}
              >
                Mistakes ({listeningReviewItems.filter(item => !item.correct).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('correct')}
                className={`rounded-sm border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                  filterType === 'correct'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300'
                }`}
              >
                Correct ({listeningReviewItems.filter(item => item.correct).length})
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {(filteredItems as typeof listeningReviewItems).map(item => (
              <article
                key={item.id}
                className={`rounded-sm border p-4 ${
                  item.correct
                    ? 'border-emerald-200 bg-surface border-l-4 border-l-emerald-600'
                    : item.unanswered
                      ? 'border-amber-200 bg-surface border-l-4 border-l-amber-500'
                      : 'border-rose-200 bg-surface border-l-4 border-l-rose-600'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-surface-2 font-mono text-xs font-bold text-ink">
                      {item.id}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wider text-graphite-light">
                      Question {item.id}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
                      item.correct
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                        : item.unanswered
                          ? 'border border-amber-200 bg-amber-50 text-amber-800'
                          : 'border border-rose-200 bg-rose-50 text-rose-800'
                    }`}
                  >
                    {item.correct ? '✓ Correct' : item.unanswered ? '○ Unanswered' : '✕ Incorrect'}
                  </span>
                </div>

                {item.prompt && (
                  <div className="mt-3 font-plex text-sm font-semibold leading-6 text-ink">
                    {item.prompt}
                  </div>
                )}

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-sm border border-divider p-2.5">
                    <div className="font-mono text-[10px] uppercase text-graphite-light">Your Response</div>
                    <div className={`mt-0.5 font-mono text-sm font-bold ${item.correct ? 'text-emerald-800' : 'text-rose-600'}`}>
                      {item.userAns || <span className="font-normal italic text-graphite-light">(No answer)</span>}
                    </div>
                  </div>
                  <div className="rounded-sm border border-emerald-300 bg-emerald-50/40 p-2.5">
                    <div className="font-mono text-[10px] uppercase text-emerald-800">Accepted Answer</div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-emerald-800">
                      {item.accepted.join(' / ')}
                    </div>
                  </div>
                </div>

                {item.explanation && (
                  <div className="mt-4 rounded-sm border border-divider bg-surface-2 p-4">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
                      <span><Icon name="lightbulb" /> Why wrong / right & Audio Context</span>
                    </div>
                    <p className="mt-1.5 font-plex text-sm leading-6 text-graphite">
                      {item.explanation}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Score Explanation & Next Steps */}
      <section className="border border-divider bg-surface">
        <div className="border-b border-divider px-6 py-5">
          <h2 className="font-plex text-lg font-bold text-ink">Score analysis & improvement path</h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b border-divider p-6 md:border-b-0 md:border-r">
            <div className="font-mono text-xs uppercase tracking-wider text-positive">Strengths identified</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-graphite">
              <li>— Test completed under official timed preparation conditions.</li>
              {isSpeaking && (
                <>
                  <li>— Voice capture and speech recognition processed without audio corruption.</li>
                  {speakingWords >= 20 && <li>— Maintained speech production throughout the prompt window.</li>}
                </>
              )}
              {isReading && <li>— Demonstrated ability to scan academic texts for key concepts.</li>}
              {result.overallBand !== null && result.overallBand >= 6.5 && (
                <li>— Performance demonstrates command of communicative academic English.</li>
              )}
            </ul>
          </div>
          <div className="p-6">
            <div className="font-mono text-xs uppercase tracking-wider text-caution">Recommendations for growth</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-graphite">
              {isSpeaking ? (
                <>
                  <li>— Practice answering prompts with concrete examples to avoid hesitant pauses.</li>
                  <li>— Ensure answers directly address the examiner prompt rather than mic testing.</li>
                  <li>— Expand vocabulary by linking thoughts with varied discourse markers.</li>
                </>
              ) : isWriting ? (
                <>
                  <li>— Meet the required word thresholds (Task 1: 150+ words; Task 2: 250+ words).</li>
                  <li>— Structure essays into distinct Introduction, Body 1, Body 2, and Conclusion.</li>
                </>
              ) : (
                <>
                  <li>— Thoroughly review every incorrect question and trace back to the passage evidence.</li>
                  <li>— Practice targeted sections under 15-minute strict countdown blocks.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <NavLink to="/practice" className="rounded-card bg-electric px-6 py-3 font-plex text-sm font-semibold text-white shadow-sm transition hover:bg-navy">
          Take another test
        </NavLink>
        <button
          onClick={() => window.print()}
          className="rounded-card border border-divider bg-surface px-6 py-3 font-plex text-sm font-semibold text-ink transition hover:bg-surface-2"
        >
          Print or save PDF
        </button>
      </div>
    </div>
  )
}

export default function Results() {
  const { user } = useAuth()
  const [results, setResults] = useState<StoredExamResult[]>([])
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [selectedId, setSelectedId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadResults = () => {
      fetchResults(user?.email, user?.id)
        .then(data => {
          setResults(data)
          if (data.length > 0) {
            setSelectedId(prev => (prev && data.some(d => d.id === prev) ? prev : data[0].id))
          } else {
            setSelectedId('')
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    }

    setIsLoading(true)
    loadResults()

    window.addEventListener('vistora:result-saved', loadResults)
    window.addEventListener('storage', loadResults)
    return () => {
      window.removeEventListener('vistora:result-saved', loadResults)
      window.removeEventListener('storage', loadResults)
    }
  }, [user?.email, user?.id])

  // Filter items dynamically based on module
  const filteredResults = useMemo(() => {
    if (filter === 'All') return results
    return results.filter(result => result.testType === filter)
  }, [filter, results])

  // Select item dynamically within the current filter
  const selectedResult = useMemo(() => {
    if (filteredResults.length === 0) return null
    return filteredResults.find(result => result.id === selectedId) || filteredResults[0]
  }, [filteredResults, selectedId])

  // Automatically synchronize selectedId whenever filter changes
  const handleFilterClick = (item: (typeof FILTERS)[number]) => {
    setFilter(item)
    const matches = item === 'All' ? results : results.filter(r => r.testType === item)
    if (matches.length > 0) {
      setSelectedId(matches[0].id)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Optimistically remove from state immediately
    setResults(prev => {
      const remaining = prev.filter(r => r.id !== id)
      if (selectedId === id) {
        const remainingInFilter = filter === 'All' ? remaining : remaining.filter(r => r.testType === filter)
        setSelectedId(remainingInFilter[0]?.id || '')
      }
      return remaining
    })

    // Persist deletion to localStorage and backend API
    await deleteExamResultApi(id, user?.email)
  }

  const currentUserName = user?.name || 'Student'

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="border-b border-divider pb-6">
        <div className="label-tag">RESULTS CENTRE · {currentUserName.toUpperCase()}</div>
        <h1 className="mt-2 font-plex text-3xl font-bold tracking-tight text-ink">Exam results and feedback</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-mid">
          Review full-test and individual-skill results, AI speech evaluations, examiner commentary, and diagnostic reviews.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map(item => {
            const count = item === 'All' ? results.length : results.filter(r => r.testType === item).length
            return (
              <button
                key={item}
                onClick={() => handleFilterClick(item)}
                className={`rounded-sm border px-3.5 py-2 font-mono text-xs uppercase tracking-wide transition-all ${
                  filter === item
                    ? 'border-line-ink bg-navy text-white shadow-sm'
                    : 'border-divider bg-surface text-graphite-mid hover:border-slate-400'
                }`}
              >
                {item} <span className="opacity-70">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="h-fit border border-divider bg-surface">
          <div className="flex items-center justify-between border-b border-divider px-5 py-4">
            <div>
              <div className="font-plex text-sm font-semibold text-ink">Saved attempts</div>
              <div className="mt-1 font-mono text-xs text-graphite-light">
                {filteredResults.length} {filter === 'All' ? 'total' : filter} {filteredResults.length === 1 ? 'record' : 'records'}
              </div>
            </div>
            <NavLink to="/practice" className="font-mono text-xs font-semibold text-accent hover:underline">
              + New Test
            </NavLink>
          </div>

          <div className="divide-y divide-divider max-h-[750px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center font-mono text-xs text-graphite-light">Loading results...</div>
            ) : filteredResults.length > 0 ? (
              filteredResults.map(result => {
                const badge = getTestTypeBadge(result.testType)
                const isSelected = selectedResult?.id === result.id

                return (
                  <div
                    key={result.id}
                    onClick={() => setSelectedId(result.id)}
                    className={`group flex w-full cursor-pointer items-start justify-between gap-3 border-l-4 p-4 text-left transition-colors ${
                      isSelected
                        ? 'border-l-rose-600 bg-rose-50/50 shadow-sm'
                        : 'border-l-transparent hover:bg-surface-2'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="block truncate font-plex text-xs font-semibold leading-5 text-ink">
                          {result.testTitle}
                        </span>
                        <span className="flex-shrink-0 font-mono text-sm font-bold text-rose-600">
                          {result.overallBand === null ? '—' : result.overallBand.toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
                        <span className={`inline-block rounded-xs border px-1.5 py-0.5 ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-graphite-light">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      title="Delete test attempt"
                      onClick={e => handleDelete(result.id, e)}
                      className="rounded p-1 text-xs text-graphite-light hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-sm text-graphite-light">
                <p>No results found for <span className="font-semibold text-ink">{filter}</span>.</p>
                <NavLink to="/practice" className="mt-3 inline-block font-mono text-xs text-accent hover:underline">
                  Take an IELTS {filter === 'All' ? '' : filter} test →
                </NavLink>
              </div>
            )}
          </div>
        </aside>

        <div>
          {selectedResult ? (
            <ResultDetail result={selectedResult} userName={currentUserName} />
          ) : (
            <section className="border border-divider bg-surface p-12 text-center">
              <h2 className="font-plex text-lg font-semibold text-ink">No result selected</h2>
              <p className="mt-2 text-sm text-graphite-mid">
                Select an attempt from the list or take a practice test to record diagnostic feedback.
              </p>
              <NavLink to="/practice" className="mt-5 inline-block rounded-card bg-electric px-6 py-2.5 font-plex text-sm font-semibold text-white">
                Start Practice Test
              </NavLink>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
