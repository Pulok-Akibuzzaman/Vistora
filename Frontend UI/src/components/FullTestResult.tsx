import { useEffect, useMemo, useRef, useState } from 'react'
import { READING_ANSWERS } from '../data/readingTest1'
import { LISTENING_ANSWERS } from '../data/listeningTest1'
import { saveExamResult } from '../lib/results'
import { saveExamResultApi } from '../lib/api'
import { useAuth } from '../lib/authContext'

type SkillFeedback = {
  band: number
  summary: string
  strengths: string[]
  improvements: string[]
}

type AIReport = {
  overallBand: number
  descriptor: string
  overallComment: string
  listening: SkillFeedback
  reading: SkillFeedback
  writing: SkillFeedback & {
    criteria: Record<string, number>
    taskComments: string[]
  }
  speaking: SkillFeedback & {
    criteria: Record<string, number>
    comments: string[]
  }
  studyPlan: string[]
}

type FullTestResultProps = {
  listeningAnswers: Record<number, string>
  readingAnswers: Record<number, string>
  writingAnswers: Record<number, string>
  speakingRecordings: Record<number, Blob>
  onExit: () => void
  onRetake: () => void
}

const normalize = (value?: string) => value?.trim().toLowerCase().replace(/\s+/g, ' ') || ''

function bandFromListening(raw: number) {
  if (raw >= 39) return 9.0
  if (raw >= 37) return 8.5
  if (raw >= 35) return 8.0
  if (raw >= 32) return 7.5
  if (raw >= 30) return 7.0
  if (raw >= 26) return 6.5
  if (raw >= 23) return 6.0
  if (raw >= 18) return 5.5
  if (raw >= 16) return 5.0
  if (raw >= 13) return 4.5
  if (raw >= 10) return 4.0
  if (raw >= 8) return 3.5
  if (raw >= 6) return 3.0
  if (raw >= 4) return 2.5
  if (raw >= 3) return 2.0
  if (raw >= 2) return 1.5
  if (raw >= 1) return 1.0
  return 0.0
}

function bandFromReading(raw: number) {
  if (raw >= 39) return 9.0
  if (raw >= 37) return 8.5
  if (raw >= 35) return 8.0
  if (raw >= 33) return 7.5
  if (raw >= 30) return 7.0
  if (raw >= 27) return 6.5
  if (raw >= 23) return 6.0
  if (raw >= 19) return 5.5
  if (raw >= 15) return 5.0
  if (raw >= 13) return 4.5
  if (raw >= 10) return 4.0
  if (raw >= 8) return 3.5
  if (raw >= 6) return 3.0
  if (raw >= 4) return 2.5
  if (raw >= 3) return 2.0
  if (raw >= 2) return 1.5
  if (raw >= 1) return 1.0
  return 0.0
}

function roundOverall(value: number) {
  return Math.round(value * 2) / 2
}

function descriptorForBand(band: number) {
  if (band >= 8.5) return 'Expert User'
  if (band >= 7.5) return 'Very Good User'
  if (band >= 6.5) return 'Good User'
  if (band >= 5.5) return 'Competent User'
  if (band >= 4.5) return 'Modest User'
  if (band >= 3.5) return 'Limited User'
  if (band >= 2.5) return 'Extremely Limited User'
  if (band >= 1.0) return 'Intermittent User'
  return 'Did not attempt / Non User'
}

export default function FullTestResult({ listeningAnswers, readingAnswers, writingAnswers, speakingRecordings, onExit, onRetake }: FullTestResultProps) {
  const { user } = useAuth()
  const [report, setReport] = useState<AIReport | null>(null)
  const [analysisState, setAnalysisState] = useState<'analysing' | 'complete' | 'fallback'>('analysing')
  const [reviewSkill, setReviewSkill] = useState<'Listening' | 'Reading'>('Listening')
  const [mistakesOnly, setMistakesOnly] = useState(true)
  const resultSaved = useRef(false)

  const listeningReview = useMemo(() => Object.entries(LISTENING_ANSWERS).map(([key, accepted]) => {
    const id = Number(key)
    const response = listeningAnswers[id] || ''
    const correct = accepted.some(answer => normalize(answer) === normalize(response))
    return { id, response, accepted, correct }
  }), [listeningAnswers])

  const readingReview = useMemo(() => Object.entries(READING_ANSWERS).map(([key, accepted]) => {
    const id = Number(key)
    const response = readingAnswers[id] || ''
    const correct = accepted.some(answer => normalize(answer) === normalize(response))
    return { id, response, accepted, correct }
  }), [readingAnswers])

  const listeningRaw = listeningReview.filter(item => item.correct).length
  const readingRaw = readingReview.filter(item => item.correct).length
  const listeningBand = bandFromListening(listeningRaw)
  const readingBand = bandFromReading(readingRaw)

  useEffect(() => {
    let cancelled = false
    const endpoint = import.meta.env.VITE_EVALUATION_API_URL as string | undefined
    const task1Words = writingAnswers[1]?.trim().split(/\s+/).filter(Boolean).length || 0
    const task2Words = writingAnswers[2]?.trim().split(/\s+/).filter(Boolean).length || 0

    const fallbackWritingBand = task1Words >= 150 && task2Words >= 250 ? 6.5 : task1Words || task2Words ? 5.5 : 4
    const fallbackSpeakingBand = Object.keys(speakingRecordings).length >= 3 ? 6.5 : Object.keys(speakingRecordings).length ? 5.5 : 4
    const fallbackOverall = roundOverall((listeningBand + readingBand + fallbackWritingBand + fallbackSpeakingBand) / 4)

    const fallbackReport: AIReport = {
      overallBand: fallbackOverall,
      descriptor: descriptorForBand(fallbackOverall),
      overallComment: `Your strongest objective score is ${listeningBand >= readingBand ? 'Listening' : 'Reading'}. Focused review of incorrect objective answers and regular production practice will produce the fastest improvement.`,
      listening: {
        band: listeningBand,
        summary: `You answered ${listeningRaw} of 40 questions correctly. The answer review below identifies every missed or unanswered item.`,
        strengths: listeningRaw >= 30 ? ['Strong understanding of main ideas and detailed information', 'Good control across different listening sections'] : ['You identified some key details accurately'],
        improvements: ['Review distractors before changing an answer', 'Practise predicting answer types before the recording begins'],
      },
      reading: {
        band: readingBand,
        summary: `You answered ${readingRaw} of 40 questions correctly. Review the relevant passage evidence for each missed item.`,
        strengths: readingRaw >= 30 ? ['Effective scanning for factual information', 'Good understanding of writer claims'] : ['You located some explicit information successfully'],
        improvements: ['Separate FALSE or NO from NOT GIVEN more carefully', 'Set a strict twenty-minute limit for each passage'],
      },
      writing: {
        band: fallbackWritingBand,
        summary: 'A provisional score was generated from completion data. Connect the secure Gemini endpoint for criterion-level language analysis.',
        strengths: task1Words >= 150 && task2Words >= 250 ? ['Both tasks reached the required word count'] : ['A response was submitted'],
        improvements: ['State a clear overview in Task 1', 'Develop each Task 2 main idea with a specific explanation and example'],
        criteria: { 'Task Achievement': fallbackWritingBand, 'Coherence & Cohesion': fallbackWritingBand, 'Lexical Resource': fallbackWritingBand, 'Grammar': fallbackWritingBand },
        taskComments: [`Task 1: ${task1Words} words`, `Task 2: ${task2Words} words`],
      },
      speaking: {
        band: fallbackSpeakingBand,
        summary: 'A provisional score was generated from recording completion. Connect Gemini audio evaluation for transcript and pronunciation feedback.',
        strengths: Object.keys(speakingRecordings).length >= 3 ? ['Responses were recorded for all three speaking parts'] : ['At least one spoken response was recorded'],
        improvements: ['Extend answers with reasons and examples', 'Reduce hesitation by grouping ideas before speaking'],
        criteria: { 'Fluency & Coherence': fallbackSpeakingBand, 'Lexical Resource': fallbackSpeakingBand, 'Grammar': fallbackSpeakingBand, 'Pronunciation': fallbackSpeakingBand },
        comments: ['Practise maintaining a natural pace', 'Use a wider range of linking phrases without overusing memorised expressions'],
      },
      studyPlan: ['Review every incorrect Reading and Listening answer', 'Complete one timed Task 2 essay', 'Record a two-minute Part 2 response', 'Retake weak sections after targeted review'],
    }

    if (!endpoint) {
      setReport(fallbackReport)
      setAnalysisState('fallback')
      return
    }

    const evaluate = async () => {
      try {
        const payload = {
          test: 'IELTS 21 Academic Test 1',
          listening: { answers: listeningAnswers, rawScore: listeningRaw, band: listeningBand },
          reading: { answers: readingAnswers, rawScore: readingRaw, band: readingBand },
          writing: writingAnswers,
        }
        const body = new FormData()
        body.append('attempt', JSON.stringify(payload))
        Object.entries(speakingRecordings).forEach(([part, blob]) => body.append(`speakingPart${part}`, blob, `speaking-part-${part}.webm`))
        const response = await fetch(endpoint, { method: 'POST', body })
        if (!response.ok) throw new Error(`Evaluation failed with ${response.status}`)
        const data = await response.json() as AIReport
        if (!cancelled) {
          setReport(data)
          setAnalysisState('complete')
        }
      } catch {
        if (!cancelled) {
          setReport(fallbackReport)
          setAnalysisState('fallback')
        }
      }
    }
    evaluate()
    return () => { cancelled = true }
  }, [listeningAnswers, listeningBand, listeningRaw, readingAnswers, readingBand, readingRaw, speakingRecordings, writingAnswers])

  useEffect(() => {
    if (!report || analysisState === 'analysing' || resultSaved.current) return
    resultSaved.current = true
    const resultObj = {
      id: `full-${Date.now()}`,
      userId: user?.id || 'USR-1048',
      userName: user?.name || 'Ayaan Rahman',
      testTitle: 'IELTS 21 — Complete Academic Test 1',
      testType: 'Full Test' as const,
      completedAt: new Date().toISOString(),
      overallBand: report.overallBand,
      skillBands: {
        Listening: report.listening.band,
        Reading: report.reading.band,
        Writing: report.writing.band,
        Speaking: report.speaking.band,
      },
      comment: report.overallComment,
      source: (analysisState === 'complete' ? 'AI' : 'Automatic') as any,
    }
    saveExamResult(resultObj)
    saveExamResultApi(resultObj).catch(() => {})
  }, [analysisState, report, user])

  if (!report || analysisState === 'analysing') {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 py-12">
        <section className="w-full border border-divider bg-white p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-electric-dim border-t-electric" />
          <h1 className="mt-6 font-plex text-xl font-bold text-navy">Generating your AI result</h1>
          <p className="mt-2 text-sm text-graphite-mid">Scoring objective answers and analysing Writing and Speaking performance.</p>
        </section>
      </main>
    )
  }

  const review = reviewSkill === 'Listening' ? listeningReview : readingReview
  const visibleReview = mistakesOnly ? review.filter(item => !item.correct) : review
  const skillCards = [
    ['Listening', report.listening],
    ['Reading', report.reading],
    ['Writing', report.writing],
    ['Speaking', report.speaking],
  ] as const

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="corner-mark border border-divider bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="label-tag">IELTS 21 · Academic Test 1 · AI Practice Report</div>
            <h1 className="mt-3 font-plex text-3xl font-bold text-navy">Ayaan Rahman</h1>
            <div className="mt-2 font-mono text-xs text-graphite-light">BRITISH COUNCIL DHAKA · PRACTICE ATTEMPT · {new Date().toLocaleDateString()}</div>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-violet-dim font-mono text-3xl font-bold text-violet">{report.overallBand.toFixed(1)}</div>
            <div><div className="font-mono text-xs uppercase tracking-wider text-graphite-light">Overall band</div><div className="mt-1 font-plex text-lg font-semibold text-navy">{report.descriptor}</div></div>
          </div>
        </div>
        <div className="mt-7 border-l-2 border-violet bg-violet-dim p-5 text-sm leading-6 text-navy">{report.overallComment}</div>
        {analysisState === 'fallback' && <div className="mt-3 font-mono text-xs text-warning">LOCAL PREVIEW · CONNECT VITE_EVALUATION_API_URL FOR GEMINI ANALYSIS</div>}
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {skillCards.map(([name, feedback]) => (
          <div key={name} className="border border-divider bg-white p-5">
            <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">{name}</div>
            <div className="mt-2 font-mono text-3xl font-bold text-electric">{feedback.band.toFixed(1)}</div>
            <div className="mt-3 h-1 bg-divider"><div className="h-full bg-electric" style={{ width: `${(feedback.band / 9) * 100}%` }} /></div>
          </div>
        ))}
      </section>

      <section className="mt-4 border border-divider bg-white">
        <div className="border-b border-divider px-6 py-5"><h2 className="font-plex text-lg font-bold text-navy">Your scores explained</h2></div>
        <div className="divide-y divide-divider">
          {skillCards.map(([name, feedback]) => (
            <article key={name} className="p-6">
              <div className="flex items-center justify-between"><h3 className="font-plex text-base font-semibold text-navy">{name}</h3><span className="font-mono text-lg font-bold text-violet">{feedback.band.toFixed(1)}</span></div>
              <p className="mt-3 text-sm leading-6 text-graphite">{feedback.summary}</p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div><div className="font-mono text-xs uppercase tracking-wider text-success">What went well</div><ul className="mt-2 space-y-2">{feedback.strengths.map(item => <li key={item} className="text-sm leading-5 text-graphite">— {item}</li>)}</ul></div>
                <div><div className="font-mono text-xs uppercase tracking-wider text-warning">How to improve</div><ul className="mt-2 space-y-2">{feedback.improvements.map(item => <li key={item} className="text-sm leading-5 text-graphite">— {item}</li>)}</ul></div>
              </div>
              {'criteria' in feedback && (
                <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {Object.entries(feedback.criteria).map(([criterion, value]) => (
                    <div key={criterion} className="border border-divider bg-slate-50 p-3">
                      <div className="font-mono text-xs uppercase leading-4 text-graphite-light">{criterion}</div>
                      <div className="mt-1 font-mono text-lg font-bold text-violet">{value.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              )}
              {'taskComments' in feedback && (
                <div className="mt-5 border-l-2 border-electric pl-4">
                  {feedback.taskComments.map(comment => <p key={comment} className="mb-2 text-sm leading-5 text-graphite last:mb-0">{comment}</p>)}
                </div>
              )}
              {'comments' in feedback && (
                <div className="mt-5 border-l-2 border-violet pl-4">
                  {feedback.comments.map(comment => <p key={comment} className="mb-2 text-sm leading-5 text-graphite last:mb-0">{comment}</p>)}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-4 border border-divider bg-white">
        <div className="flex flex-col gap-4 border-b border-divider px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-plex text-lg font-bold text-navy">Answer review</h2><p className="mt-1 text-xs text-graphite-light">Compare every response with the stored answer key.</p></div>
          <div className="flex gap-2">
            {(['Listening', 'Reading'] as const).map(skill => <button key={skill} onClick={() => setReviewSkill(skill)} className={`rounded-sm border px-3 py-2 font-mono text-xs ${reviewSkill === skill ? 'border-navy bg-navy text-white' : 'border-divider text-graphite'}`}>{skill}</button>)}
            <button onClick={() => setMistakesOnly(value => !value)} className={`rounded-sm border px-3 py-2 font-mono text-xs ${mistakesOnly ? 'border-violet bg-violet-dim text-violet' : 'border-divider text-graphite'}`}>{mistakesOnly ? 'Mistakes only' : 'All answers'}</button>
          </div>
        </div>
        <div className="divide-y divide-divider">
          {visibleReview.length ? visibleReview.map(item => (
            <div key={item.id} className="grid gap-3 px-6 py-4 sm:grid-cols-[70px_1fr_1fr_auto] sm:items-center">
              <div className="font-mono text-xs font-semibold text-navy">Q{item.id}</div>
              <div><div className="font-mono text-xs uppercase text-graphite-light">Your answer</div><div className={`mt-1 text-sm ${item.correct ? 'text-success' : 'text-danger'}`}>{item.response || 'Unanswered'}</div></div>
              <div><div className="font-mono text-xs uppercase text-graphite-light">Correct answer</div><div className="mt-1 text-sm font-semibold text-navy">{item.accepted.join(' / ')}</div></div>
              <span className={`rounded-sm px-2 py-1 font-mono text-xs ${item.correct ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'}`}>{item.correct ? 'Correct' : 'Review'}</span>
            </div>
          )) : <div className="p-8 text-center text-sm text-success">No mistakes in this section.</div>}
        </div>
      </section>

      <section className="mt-4 border border-divider bg-navy p-6 text-white">
        <div className="font-mono text-xs uppercase tracking-widest text-electric-light">Personalised next steps</div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {report.studyPlan.map((item, index) => <div key={item} className="flex gap-3 border border-navy-light p-4"><span className="font-mono text-xs text-electric-light">0{index + 1}</span><span className="text-sm leading-5 text-slate-50">{item}</span></div>)}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={onExit} className="rounded-card bg-electric px-6 py-3 font-plex text-sm font-semibold text-white">Return to test centre</button>
        <button onClick={onRetake} className="rounded-card border border-divider bg-white px-6 py-3 font-plex text-sm font-semibold text-navy">Retake full test</button>
        <button onClick={() => window.print()} className="rounded-card border border-divider bg-white px-6 py-3 font-plex text-sm font-semibold text-navy">Print or save PDF</button>
      </div>
    </main>
  )
}
