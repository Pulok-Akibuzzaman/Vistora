import { useEffect, useMemo, useRef, useState } from 'react'
import { READING_ANSWERS, READING_PASSAGES } from '../data/readingTest1'
import { LISTENING_ANSWERS } from '../data/listeningTest1'
import FullTestResult from '../components/FullTestResult'
import { saveExamResult } from '../lib/results'
import { checkBackendHealth, getStreamUrl, saveExamResultApi, type BackendHealth } from '../lib/api'
import { useAuth } from '../lib/authContext'
import { themeText } from '../lib/theme'
import { NavLink } from 'react-router'

type TestType = 'Reading' | 'Listening' | 'Writing' | 'Speaking' | 'Full Test'

type Test = {
  id: string
  type: TestType
  module: 'Academic' | 'General Training'
  title: string
  questions: number
  duration: number
  difficulty: string
  status: 'New' | 'In progress'
  part?: number
  book?: string
  testNumber?: number
}

const TESTS: Test[] = [
  { id: 'f1', type: 'Full Test', module: 'Academic', title: 'IELTS 18 — Complete Academic Test 1', questions: 85, duration: 174, difficulty: 'Full simulation', status: 'New', book: '18', testNumber: 1 },
  { id: 'r1', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Academic Reading Test 1', questions: 40, duration: 60, difficulty: 'Official format', status: 'New', book: '18', testNumber: 1 },
  { id: 'r1-p1', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 1 · Part 1', questions: 13, duration: 20, difficulty: 'Passage practice', status: 'New', part: 1, book: '18', testNumber: 1 },
  { id: 'r1-p2', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 1 · Part 2', questions: 13, duration: 20, difficulty: 'Passage practice', status: 'New', part: 2, book: '18', testNumber: 1 },
  { id: 'r1-p3', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 1 · Part 3', questions: 14, duration: 20, difficulty: 'Passage practice', status: 'New', part: 3, book: '18', testNumber: 1 },
  { id: 'l1', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 1 (Full 4 Parts)', questions: 40, duration: 40, difficulty: 'Official format', status: 'In progress', book: '18', testNumber: 1 },
  { id: 'l1-p1', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 1 · Part 1', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 1, book: '18', testNumber: 1 },
  { id: 'l1-p2', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 1 · Part 2', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 2, book: '18', testNumber: 1 },
  { id: 'l1-p3', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 1 · Part 3', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 3, book: '18', testNumber: 1 },
  { id: 'l1-p4', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 1 · Part 4', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 4, book: '18', testNumber: 1 },
  { id: 'l19', type: 'Listening', module: 'Academic', title: 'IELTS 19 — Listening Test 1 (Audio Stream)', questions: 40, duration: 40, difficulty: 'Official audio', status: 'New', book: '19', testNumber: 1 },
  { id: 'l20', type: 'Listening', module: 'Academic', title: 'IELTS 20 — Listening Test 1 (Audio Stream)', questions: 40, duration: 40, difficulty: 'Official audio', status: 'New', book: '20', testNumber: 1 },
  { id: 'l21', type: 'Listening', module: 'Academic', title: 'IELTS 21 — Listening Test 1 (Audio Stream)', questions: 40, duration: 40, difficulty: 'Official audio', status: 'New', book: '21', testNumber: 1 },
  { id: 'w1', type: 'Writing', module: 'Academic', title: 'IELTS 18 — Academic Writing Test 1', questions: 2, duration: 60, difficulty: 'Official format', status: 'New' },
  { id: 'w1-p1', type: 'Writing', module: 'Academic', title: 'IELTS 18 — Writing Test 1 · Task 1', questions: 1, duration: 20, difficulty: '150+ words', status: 'New', part: 1 },
  { id: 'w1-p2', type: 'Writing', module: 'Academic', title: 'IELTS 18 — Writing Test 1 · Task 2', questions: 1, duration: 40, difficulty: '250+ words', status: 'New', part: 2 },
  { id: 's1', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 1', questions: 3, duration: 14, difficulty: 'Official format', status: 'New' },
  { id: 's1-p1', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 1 · Part 1', questions: 1, duration: 5, difficulty: 'Interview', status: 'New', part: 1 },
  { id: 's1-p2', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 1 · Part 2', questions: 1, duration: 4, difficulty: 'Long turn', status: 'New', part: 2 },
  { id: 's1-p3', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 1 · Part 3', questions: 1, duration: 5, difficulty: 'Discussion', status: 'New', part: 3 },
]

const FILTERS = ['All', 'Full Test', 'Reading', 'Listening', 'Writing', 'Speaking'] as const
type FullTestModule = 'Listening' | 'Reading' | 'Writing' | 'Speaking'
const FULL_TEST_ORDER: FullTestModule[] = ['Listening', 'Reading', 'Writing', 'Speaking']
const FULL_TEST_DURATIONS: Record<FullTestModule, number> = { Listening: 40, Reading: 60, Writing: 60, Speaking: 14 }
type FullTestAttempt = {
  listening: Record<number, string>
  reading: Record<number, string>
  writing: Record<number, string>
  speaking: Record<number, Blob>
}

const emptyFullAttempt = (): FullTestAttempt => ({ listening: {}, reading: {}, writing: {}, speaking: {} })

const PART_1_PROMPTS = [
  { id: 1, prefix: 'Taster day: small groups (maximum', suffix: 'people)' },
  { id: 2, prefix: 'Level 1 theory: understanding the', suffix: 'and tides' },
  { id: 3, prefix: 'Basic sailing skills including', suffix: 'information' },
  { id: 4, prefix: '', suffix: 'available for club members' },
  { id: 5, prefix: 'All inclusive, plus a useful', suffix: '' },
  { id: 6, prefix: 'A', suffix: 'at the end of the course' },
  { id: 7, prefix: 'Bring suitable clothing, a', suffix: 'and toiletries' },
  { id: 8, prefix: 'There is a', suffix: 'at the club' },
  { id: 9, prefix: 'Online training', suffix: 'are recommended' },
  { id: 10, prefix: '', suffix: 'are available for course participants' },
]

const PART_2_MULTIPLE_CHOICE = [
  { id: 11, text: 'What should trainees always expect to get when working on low budget short films?', options: ['travel expenses', 'a minimum wage', 'meals'] },
  { id: 12, text: 'On big budget films, trainees may get experience of:', options: ['makeup for special effects', 'working with different ethnicities', 'creating a variety of hair styles'] },
  { id: 13, text: 'The speaker says a problem for makeup artists is:', options: ['dealing with difficult directors', 'being shouted at by their supervisor', 'waiting around for hours doing nothing'] },
  { id: 14, text: 'How did the speaker feel when she met famous actors for the first time?', options: ['very shy', 'very proud', 'very disappointed'] },
  { id: 15, text: 'What advice does the speaker give about makeup kits?', options: ['Always carry a basic kit', 'Only buy the best products', 'Ask other artists to check your kit'] },
  { id: 16, text: 'What advice does the speaker give about creating a portfolio?', options: ['Keep print and digital photos', 'Include only a small selection', 'Get permission to use photos'] },
]

const PART_2_MATCHING = [
  { id: 17, text: 'Prepping an actor' },
  { id: 18, text: 'Continuity' },
  { id: 19, text: 'General' },
  { id: 20, text: 'Applying makeup' },
]

const PART_3_GROUPS = [
  {
    ids: [21, 22],
    text: 'Which TWO features of the lecture on ocean biodiversity had the greatest impact on the students?',
    options: ['the references to local problems', 'the broad focus of the examples', 'the practical suggestions for solutions', 'the type of issues discussed', 'the implications for government policy'],
  },
  {
    ids: [23, 24],
    text: 'Which TWO details about the research project particularly impressed the students?',
    options: ["the team's previous successes", 'its wide geographical scale', 'the use of new technology', 'the extensive statistical evidence', 'the large range of specialists involved'],
  },
]

const PART_3_MATCHING = [
  { id: 25, text: 'Article on invasive lionfish' },
  { id: 26, text: 'Documentary on microplastics' },
  { id: 27, text: 'Podcast on ocean pollution' },
  { id: 28, text: 'Book on coastal ecosystems' },
  { id: 29, text: 'Article on metal toxicity' },
  { id: 30, text: 'Podcast on floating marine cities' },
]

const PART_3_OPINIONS = [
  'This is aimed at a very specialist audience.',
  'This is now rather outdated.',
  'This was an effective description of a new danger.',
  'This suggests possible ways to improve the situation.',
  'This does not give a balanced account.',
  'This is too predictable to be useful.',
  'This gives insufficient evidence for its claims.',
  'This gives a clear explanation of the problems.',
]

const PART_4_PROMPTS = [
  { id: 31, prefix: 'Three essential resources: ', suffix: ', fossil fuels and rubber' },
  { id: 32, prefix: 'The growth of the rubber tree is', suffix: '' },
  { id: 33, prefix: 'Production cannot easily be adjusted to changing', suffix: '' },
  { id: 34, prefix: 'The tree only grows near the', suffix: '' },
  { id: 35, prefix: 'It is very difficult to', suffix: 'rubber after production' },
  { id: 36, prefix: 'Disease may be caused by a', suffix: '' },
  { id: 37, prefix: 'Another threat is extreme', suffix: 'events' },
  { id: 38, prefix: 'Synthetic rubber is less', suffix: 'than natural rubber' },
  { id: 39, prefix: 'A type of dandelion has rubber in its', suffix: '' },
  { id: 40, prefix: 'It can grow without good', suffix: '' },
]

type ListeningExamProps = {
  answers: Record<number, string>
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>
  currentQ: number
  setCurrentQ: React.Dispatch<React.SetStateAction<number>>
  timeLeft: number
  audioUrl?: string
  audioName?: string
  part?: number
  selectedBook?: string
  selectedTestNumber?: number
  backendConnected?: boolean
  onAudioFile: (file?: File) => void
  onFinish: () => void
}

function ListeningExam({
  answers,
  setAnswers,
  currentQ,
  setCurrentQ,
  timeLeft,
  audioUrl,
  audioName,
  part,
  selectedBook = '18',
  selectedTestNumber = 1,
  backendConnected = true,
  onAudioFile,
  onFinish,
}: ListeningExamProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [reviewFlags, setReviewFlags] = useState<number[]>([])

  const answered = Object.keys(answers).filter(key => {
    const num = Number(key)
    if (part !== undefined) {
      return num >= ((part - 1) * 10 + 1) && num <= (part * 10) && !!answers[num]?.trim()
    }
    return num <= 40 && !!answers[num]?.trim()
  }).length
  const totalQuestions = part !== undefined ? 10 : 40
  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

  const currentPart = part ?? (currentQ <= 10 ? 1 : currentQ <= 20 ? 2 : currentQ <= 30 ? 3 : 4)
  const partStart = (currentPart - 1) * 10 + 1
  const partEnd = currentPart * 10

  const isCustomUpload = !!(audioUrl && audioUrl.startsWith('blob:'))
  const effectiveAudioUrl = isCustomUpload ? audioUrl : getStreamUrl(selectedBook, selectedTestNumber, currentPart)
  const effectiveAudioTitle = isCustomUpload ? (audioName || 'Custom Upload') : `IELTS ${selectedBook} · Test ${selectedTestNumber} · Part ${currentPart}`

  const setAnswer = (id: number, value: string) => {
    setAnswers(values => ({ ...values, [id]: value }))
    setCurrentQ(id)
  }

  const completionRow = ({ id, prefix, suffix }: { id: number; prefix: string; suffix: string }) => (
    <li
      key={id}
      className="listening-answer-row font-plex text-sm leading-6 text-slate-200"
      data-active={currentQ === id}
      data-answered={!!answers[id]?.trim()}
      id={`listening-question-${id}`}
    >
      <span className="listening-answer-number font-mono text-xs font-bold" data-active={currentQ === id} data-answered={!!answers[id]?.trim()}>{id}</span>
      <span>{prefix}</span>
      <input
        aria-label={`Answer ${id}`}
        value={answers[id] || ''}
        onFocus={() => setCurrentQ(id)}
        onChange={event => setAnswer(id, event.target.value)}
        className="listening-answer-input h-8 w-40 rounded-lg px-3 py-1 text-sm"
      />
      <span>{suffix}</span>
    </li>
  )

  // Switch audio track when effectiveAudioUrl changes
  useEffect(() => {
    if (!audioRef.current) return
    setAudioError(false)
    audioRef.current.src = effectiveAudioUrl
    audioRef.current.load()
    audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => setAudioPlaying(false))
  }, [effectiveAudioUrl])

  const togglePlayPause = () => {
    if (!audioRef.current) return
    if (audioPlaying) {
      audioRef.current.pause()
      setAudioPlaying(false)
    } else {
      audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => setAudioPlaying(false))
    }
  }

  const seekBy = (seconds: number) => {
    if (!audioRef.current) return
    const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds))
    audioRef.current.currentTime = target
    setCurrentTime(target)
  }

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(event.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = target
      setCurrentTime(target)
    }
  }

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5]
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length
    const next = speeds[nextIdx]
    setPlaybackSpeed(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    const next = !isMuted
    setIsMuted(next)
    audioRef.current.muted = next
  }

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(event.target.value)
    setVolume(val)
    if (audioRef.current) {
      audioRef.current.volume = val
      audioRef.current.muted = val === 0
      setIsMuted(val === 0)
    }
  }

  const jumpToPart = (targetPart: number) => {
    const q = (targetPart - 1) * 10 + 1
    setCurrentQ(q)
  }

  const jumpToQuestion = (id: number) => {
    setCurrentQ(id)
    window.setTimeout(() => {
      document.querySelector<HTMLElement>(`[aria-label="Answer ${id}"]`)?.focus()
      document.getElementById(`listening-question-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, 0)
  }

  const partTitle = ['Oyster Bay Sailing Club Courses', 'Working as a makeup trainee', 'Ocean biodiversity research', 'Sources of rubber'][currentPart - 1]
  const partInstruction = currentPart === 1
    ? 'Write ONE WORD AND/OR A NUMBER for each answer.'
    : currentPart === 2
      ? 'Choose the correct letter, A, B or C, then complete the matching questions.'
      : currentPart === 3
        ? 'Choose TWO letters for each paired question, then match each resource.'
        : 'Write ONE WORD ONLY for each answer.'
  const partAnswered = Array.from({ length: 10 }, (_, index) => answers[partStart + index]?.trim()).filter(Boolean).length

  return (
    <div className="listening-exam fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#080E1A] font-sans text-slate-100">
      <audio
        ref={audioRef}
        src={effectiveAudioUrl}
        onPlay={() => setAudioPlaying(true)}
        onPause={() => setAudioPlaying(false)}
        onEnded={() => setAudioPlaying(false)}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onError={() => setAudioError(true)}
        className="hidden"
      />

      <header className="z-10 flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-800 bg-[#0B1320]/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className="text-xl font-black tracking-tight text-[#FF334B] sm:text-2xl">IELTS</span>
          <span className="hidden rounded border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300 sm:inline-flex">ACADEMIC</span>
          <div className="hidden h-4 w-px bg-slate-800 sm:block" />
          <div className="min-w-0 text-[11px] text-slate-400 sm:text-xs">
            <div className="truncate text-slate-300">IELTS {selectedBook} · Test {selectedTestNumber}</div>
            <div className="font-semibold text-rose-400">Listening Module</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-[#0F172A] px-3 py-1.5 shadow-[0_0_15px_rgba(245,158,11,0.12)] sm:px-4">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            <span className="hidden text-[10px] font-semibold uppercase text-slate-400 sm:inline">Remaining</span>
            <span className="font-mono text-sm font-bold tabular-nums text-amber-300">{formatTime(timeLeft)}</span>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-400 md:flex">
            {answered} answered
          </span>
          <button onClick={onFinish} className="flex items-center gap-1.5 rounded-lg border border-rose-500/60 px-3 py-2 text-[11px] font-bold text-rose-300 transition hover:bg-rose-600 hover:text-white sm:px-3.5">
            <span className="hidden sm:inline">End Test</span><span className="sm:hidden">End</span>
          </button>
        </div>
      </header>

      <div className="listening-exam-workspace flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <aside className="flex max-h-[42vh] w-full shrink-0 flex-col gap-3 overflow-y-auto border-b border-slate-800 bg-[#0B1220] p-3 md:max-h-none md:w-72 md:border-b-0 md:border-r md:p-4 xl:w-80">
          <div className="rounded-xl border border-slate-800 bg-[#111A2E] p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Current Section</span>
              <span className="rounded border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-rose-300">Part {currentPart}</span>
            </div>
            <h2 className="text-sm font-bold text-white">Questions {partStart}–{partEnd}</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{partTitle}</p>
          </div>

          <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-amber-400">
              <span aria-hidden="true">!</span><span>Instructions</span>
            </div>
            <p className="text-xs font-medium leading-relaxed text-slate-200">{partInstruction}</p>
            <p className="rounded border border-amber-500/20 bg-amber-500/5 px-2 py-1.5 text-[10px] leading-relaxed text-amber-300/90">Listen carefully and review your answers before ending the test.</p>
          </div>

          <section className="space-y-3 rounded-xl border border-slate-800 bg-[#111A2E] p-3.5" aria-label="Question matrix">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Question Matrix</h3>
              <span className="font-mono text-[10px] font-semibold text-emerald-400">{partAnswered} of 10 done</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, index) => partStart + index).map(id => {
                const isAnswered = !!answers[id]?.trim()
                const isActive = currentQ === id
                const isFlagged = reviewFlags.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => jumpToQuestion(id)}
                    aria-label={`Go to question ${id}${isAnswered ? ', answered' : ''}${isFlagged ? ', flagged for review' : ''}`}
                    aria-current={isActive ? 'step' : undefined}
                    className={`relative flex h-9 flex-col items-center justify-center rounded-lg border font-mono text-xs transition ${isActive ? 'border-rose-400 bg-rose-500 font-bold text-white shadow-md shadow-rose-900/40 ring-2 ring-rose-400/50' : isAnswered ? 'border-emerald-500/40 bg-emerald-500/15 font-bold text-emerald-300 hover:bg-emerald-500/25' : 'border-slate-800 bg-[#0A101C] text-slate-400 hover:border-slate-600 hover:text-white'}`}
                  >
                    <span>{id}</span>
                    {isAnswered && !isActive && <span className="-mt-1 text-[8px] text-emerald-400">✓</span>}
                    {isFlagged && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#111A2E] bg-amber-400" title="Flagged for review" />}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[9px] text-slate-400">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" />Answered</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-500" />Current</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-400" />Flagged</span>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800/80 bg-[#111A2E]/70 p-3" aria-label="Part navigation">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Listening Parts</h3>
            <div className="grid grid-cols-4 gap-1.5 md:grid-cols-2 xl:grid-cols-4">
              {(part ? [part] : [1, 2, 3, 4]).map(partNumber => {
                const start = (partNumber - 1) * 10 + 1
                const count = Array.from({ length: 10 }, (_, index) => answers[start + index]?.trim()).filter(Boolean).length
                return (
                  <button key={partNumber} type="button" onClick={() => jumpToPart(partNumber)} className={`rounded-md border px-2 py-2 text-left transition ${currentPart === partNumber ? 'border-rose-500/40 bg-rose-500/10 text-rose-300' : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}>
                    <span className="block text-[10px] font-semibold">Part {partNumber}</span>
                    <span className="mt-0.5 block font-mono text-[9px]">{count}/10</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="mt-auto space-y-3 rounded-xl border border-slate-800 bg-[#111A2E] p-3.5" aria-label="Audio playback">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className={`h-2 w-2 rounded-full ${audioPlaying ? 'animate-pulse bg-rose-400' : 'bg-slate-500'}`} />Audio Playback
              </span>
              <button type="button" onClick={cycleSpeed} className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 hover:text-white" title="Playback speed">{playbackSpeed}x</button>
            </div>
            <div className="truncate text-[10px] text-slate-400" title={effectiveAudioTitle}>{effectiveAudioTitle}</div>
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-rose-400">{formatTime(currentTime)}</span><span className="text-slate-500">{formatTime(duration)}</span>
            </div>
            <input type="range" min={0} max={duration || 100} step={0.5} value={currentTime} onChange={handleSliderChange} aria-label="Audio timeline" className="listening-audio-range w-full" />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => seekBy(-5)} aria-label="Rewind 5 seconds" title="Rewind 5 seconds" className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 hover:text-white">−5</button>
                <button type="button" onClick={togglePlayPause} aria-label={audioPlaying ? 'Pause audio' : 'Play audio'} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF334B] text-sm text-white shadow-md shadow-rose-900/50 transition hover:scale-105 hover:bg-rose-600">
                  {audioPlaying ? 'Ⅱ' : '▶'}
                </button>
                <button type="button" onClick={() => seekBy(5)} aria-label="Forward 5 seconds" title="Forward 5 seconds" className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 hover:text-white">+5</button>
              </div>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'} className="text-xs text-slate-400 hover:text-white">{isMuted || volume === 0 ? 'Muted' : 'Vol'}</button>
                <input type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume} onChange={handleVolumeChange} aria-label="Volume slider" className="listening-audio-range w-12" />
              </div>
            </div>
            <label className="block cursor-pointer rounded-md border border-slate-700 bg-slate-800/70 px-2.5 py-1.5 text-center text-[10px] text-slate-300 transition hover:border-slate-600 hover:text-white">
              {isCustomUpload ? 'Replace audio file' : 'Use a different audio file'}
              <input className="sr-only" type="file" accept="audio/*" onChange={event => onAudioFile(event.target.files?.[0])} />
            </label>
            {audioError && (
              <div role="alert" className="flex items-center justify-between gap-2 rounded border border-rose-800 bg-rose-950/60 px-2.5 py-1.5 text-[10px] text-rose-300">
                <span>Could not load audio for Part {currentPart}.</span>
                <button type="button" onClick={() => { if (audioRef.current) { audioRef.current.src = effectiveAudioUrl; audioRef.current.load() } }} className="underline">Retry</button>
              </div>
            )}
          </section>

          <button type="button" onClick={() => setReviewFlags(flags => flags.includes(currentQ) ? flags.filter(id => id !== currentQ) : [...flags, currentQ])} aria-pressed={reviewFlags.includes(currentQ)} className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${reviewFlags.includes(currentQ) ? 'border-amber-400/60 bg-amber-500/20 text-amber-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'}`}>
            <span aria-hidden="true">⚑</span>{reviewFlags.includes(currentQ) ? `Remove review flag from Q${currentQ}` : `Flag Q${currentQ} for review`}
          </button>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-10 lg:pt-7" data-purpose="interactive-form">
          <div className="mx-auto max-w-4xl space-y-5">
            <div className="border-b border-slate-800 pb-5">
              <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-slate-300">Official Listening Test</span>
                <span className="text-[11px] text-slate-500">Test {selectedTestNumber} · Part {currentPart}</span>
                <span className="ml-auto font-mono text-[10px] text-slate-500">Questions {partStart}–{partEnd}</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">{partTitle}</h1>
              <p className="mt-1 text-xs text-slate-400">Listen to the recording and complete each response in this section.</p>
            </div>

            {currentPart === 1 && (
              <>
                <section className="space-y-4 rounded-2xl border border-slate-800/90 bg-[#0F172A] p-4 shadow-xl sm:p-6">
                  <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /><h2 className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400">Beginner Programs &amp; Scheduling</h2></div>
                  <ul className="space-y-3">{PART_1_PROMPTS.slice(0, 3).map(completionRow)}</ul>
                </section>
                <section className="space-y-4 rounded-2xl border border-slate-800/90 bg-[#0F172A] p-4 shadow-xl sm:p-6">
                  <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /><h2 className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">Level 1 Certificate Course Details</h2></div>
                  <ul className="space-y-3">{PART_1_PROMPTS.slice(3, 7).map(completionRow)}</ul>
                </section>
                <section className="space-y-4 rounded-2xl border border-slate-800/90 bg-[#0F172A] p-4 shadow-xl sm:p-6">
                  <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><h2 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">Booking &amp; Administration Requirements</h2></div>
                  <ul className="space-y-3">{PART_1_PROMPTS.slice(7).map(completionRow)}</ul>
                </section>
              </>
            )}

            {currentPart === 2 && (
              <>
                <section className="space-y-4 rounded-2xl border border-slate-800/90 bg-[#0F172A] p-4 shadow-xl sm:p-6">
                  <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /><h2 className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400">Working as a Makeup Trainee</h2></div>
                  <div className="space-y-4">
                    {PART_2_MULTIPLE_CHOICE.map(question => (
                      <fieldset key={question.id} id={`listening-question-${question.id}`} className={`rounded-xl border p-3 transition ${currentQ === question.id ? 'border-rose-500/80 bg-[#111C30] shadow-[0_0_15px_rgba(225,29,72,0.12)]' : 'border-slate-800/70 bg-[#090E17]/80'}`}>
                        <legend className="px-1 text-sm font-semibold text-slate-100">{question.id}. {question.text}</legend>
                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                          {question.options.map((option, index) => {
                            const letter = String.fromCharCode(65 + index)
                            return <button key={option} type="button" onClick={() => setAnswer(question.id, letter)} className={`rounded-lg border px-3 py-2 text-left text-xs transition ${answers[question.id] === letter ? 'border-rose-500/70 bg-rose-500/15 text-rose-200' : 'border-slate-800 bg-[#111A2E] text-slate-300 hover:border-slate-600'}`}><span className="mr-2 font-mono font-bold text-rose-400">{letter}</span>{option}</button>
                          })}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </section>
                <section className="space-y-4 rounded-2xl border border-slate-800/90 bg-[#0F172A] p-4 shadow-xl sm:p-6">
                  <div className="border-b border-slate-800/80 pb-3"><h2 className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">Questions 17–20 · Matching</h2><p className="mt-1 text-xs text-slate-400">Match each duty to the ability required.</p></div>
                  <div className="rounded-lg border border-slate-800 bg-[#090E17]/80 p-3 text-xs leading-6 text-slate-300"><div><strong className="text-white">A</strong> — being well-organised</div><div><strong className="text-white">B</strong> — being flexible</div><div><strong className="text-white">C</strong> — working quickly</div></div>
                  <div className="space-y-3">
                    {PART_2_MATCHING.map(question => (
                      <div key={question.id} id={`listening-question-${question.id}`} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 transition ${currentQ === question.id ? 'border-rose-500/80 bg-[#111C30]' : 'border-slate-800/70 bg-[#090E17]/80'}`}>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-md border font-mono text-xs font-bold ${answers[question.id] ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300' : 'border-slate-700 bg-[#162238] text-slate-400'}`}>{question.id}</span><span className="min-w-40 flex-1 text-sm text-slate-200">{question.text}</span>
                        <select aria-label={`Answer ${question.id}`} value={answers[question.id] || ''} onFocus={() => setCurrentQ(question.id)} onChange={event => setAnswer(question.id, event.target.value)} className="min-w-24 rounded-lg border border-slate-700 bg-[#152033] px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"><option value="">Select</option>{['A', 'B', 'C'].map(letter => <option key={letter}>{letter}</option>)}</select>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {currentPart === 3 && (
              <>
                {PART_3_GROUPS.map(group => (
                  <section key={group.ids[0]} className="space-y-4 rounded-2xl border border-slate-800/90 bg-[#0F172A] p-4 shadow-xl sm:p-6">
                    <div className="border-b border-slate-800/80 pb-3"><h2 className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400">Questions {group.ids[0]} and {group.ids[1]}</h2><p className="mt-1 text-xs text-slate-400">Choose TWO letters, A–E. Answers may be in either order.</p><h3 className="mt-3 text-sm font-semibold text-slate-100">{group.text}</h3></div>
                    <div className="grid gap-2">
                      {group.options.map((option, index) => {
                        const letter = String.fromCharCode(65 + index)
                        const selectedId = group.ids.find(id => answers[id] === letter)
                        return <button key={option} type="button" onClick={() => {
                          if (selectedId) setAnswer(selectedId, '')
                          else {
                            const target = group.ids.find(id => !answers[id]) ?? group.ids[1]
                            setAnswer(target, letter)
                          }
                        }} className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${selectedId ? 'border-rose-500/70 bg-rose-500/15 text-rose-100' : 'border-slate-800 bg-[#090E17]/80 text-slate-300 hover:border-slate-600'}`}><span className="mr-3 font-mono font-bold text-rose-400">{letter}</span>{option}</button>
                      })}
                    </div>
                  </section>
                ))}
                <section className="space-y-4 rounded-2xl border border-slate-800/90 bg-[#0F172A] p-4 shadow-xl sm:p-6">
                  <div className="border-b border-slate-800/80 pb-3"><h2 className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">Questions 25–30 · Resource Matching</h2><p className="mt-1 text-xs text-slate-400">Choose the correct opinion, A–H, for each resource.</p></div>
                  <div className="grid gap-1 rounded-lg border border-slate-800 bg-[#090E17]/80 p-3 text-xs leading-5 text-slate-300 sm:grid-cols-2">{PART_3_OPINIONS.map((opinion, index) => <div key={opinion}><strong className="text-white">{String.fromCharCode(65 + index)}</strong> — {opinion}</div>)}</div>
                  <div className="space-y-3">
                    {PART_3_MATCHING.map(question => (
                      <div key={question.id} id={`listening-question-${question.id}`} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 transition ${currentQ === question.id ? 'border-rose-500/80 bg-[#111C30]' : 'border-slate-800/70 bg-[#090E17]/80'}`}>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-md border font-mono text-xs font-bold ${answers[question.id] ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300' : 'border-slate-700 bg-[#162238] text-slate-400'}`}>{question.id}</span><span className="min-w-40 flex-1 text-sm text-slate-200">{question.text}</span>
                        <select aria-label={`Answer ${question.id}`} value={answers[question.id] || ''} onFocus={() => setCurrentQ(question.id)} onChange={event => setAnswer(question.id, event.target.value)} className="min-w-24 rounded-lg border border-slate-700 bg-[#152033] px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"><option value="">Select</option>{PART_3_OPINIONS.map((_, index) => <option key={index}>{String.fromCharCode(65 + index)}</option>)}</select>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {currentPart === 4 && (
              <section className="space-y-4 rounded-2xl border border-slate-800/90 bg-[#0F172A] p-4 shadow-xl sm:p-6">
                <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><h2 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">Sources of Rubber</h2></div>
                <p className="text-xs text-slate-400">Complete the notes. Write ONE WORD ONLY for each answer.</p>
                <ul className="space-y-3">{PART_4_PROMPTS.map(completionRow)}</ul>
              </section>
            )}

            <div className="flex items-center justify-between border-t border-slate-800 py-4 text-xs text-slate-500">
              <span>{partAnswered} of 10 questions answered in this section</span>
              <div className="flex gap-2">
                <button type="button" aria-label="Previous part" disabled={currentPart === 1 || part !== undefined} onClick={() => setCurrentQ((currentPart - 2) * 10 + 1)} className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                <button type="button" aria-label="Next part" disabled={currentPart === 4 || part !== undefined} onClick={() => setCurrentQ(currentPart * 10 + 1)} className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

type ReadingExamProps = {
  answers: Record<number, string>
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>
  currentQ: number
  setCurrentQ: React.Dispatch<React.SetStateAction<number>>
  timeLeft: number
  part?: number
  onFinish: () => void
}

function ReadingExam({ answers, setAnswers, currentQ, setCurrentQ, timeLeft, part, onFinish }: ReadingExamProps) {
  const passageIndex = currentQ <= 13 ? 0 : currentQ <= 26 ? 1 : 2
  const passage = READING_PASSAGES[passageIndex]
  const answered = Object.keys(answers).filter(key => {
    const num = Number(key)
    if (part !== undefined) {
      return num >= passage.range[0] && num <= passage.range[1] && !!answers[num]?.trim()
    }
    return !!answers[num]?.trim()
  }).length
  const totalQuestions = part !== undefined ? (passage.range[1] - passage.range[0] + 1) : 40
  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const setAnswer = (id: number, value: string) => {
    setAnswers(values => ({ ...values, [id]: value }))
    setCurrentQ(id)
  }
  const optionValue = (option: string) => /^[A-I] ·/.test(option) ? option.charAt(0) : option

  return (
    <main className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col bg-surface">
      <header className="flex min-h-14 items-center justify-between border-b border-divider bg-surface px-4">
        <div className="flex items-center gap-5">
          <div className="border-r border-divider pr-5 font-plex text-2xl font-bold tracking-tight text-accent">IELTS</div>
          <div>
            <div className="font-plex text-xs font-semibold text-ink">Test taker ID</div>
            <div className="font-plex text-xs text-graphite-mid">Academic Reading · Test 1{part ? ` · Passage ${part}` : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className={`font-mono text-sm font-semibold ${timeLeft < 300 ? 'text-accent' : 'text-ink'}`}>{formatTime(timeLeft)}</div>
            <div className="font-mono text-xs uppercase text-graphite-light">Time left</div>
          </div>
          <button onClick={onFinish} className="rounded-sm bg-navy px-4 py-2 font-plex text-xs font-semibold text-white">Finish</button>
        </div>
      </header>

      <div className="border-b border-divider bg-paper-dark px-4 py-3">
        <h1 className="font-plex text-sm font-bold text-ink">Part {passage.part}</h1>
        <p className="mt-1 font-plex text-sm text-ink">Read the text and answer questions {passage.range[0]}–{passage.range[1]}.</p>
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-2">
        <article className="overflow-y-auto border-b border-divider p-5 md:border-b-0 md:border-r md:p-7">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-plex text-xl font-bold text-ink">{passage.title}</h2>
            {passage.subtitle && <p className="mt-2 font-plex text-sm font-semibold italic leading-6 text-graphite">{passage.subtitle}</p>}
            <div className="mt-5 space-y-5 font-plex text-sm leading-7 text-ink">
              {passage.paragraphs.map((paragraph, index) => {
                const match = paragraph.match(/^([A-Z]\.?)\s+([\s\S]*)$/)
                if (match) {
                  const label = match[1].endsWith('.') ? match[1] : `${match[1]}.`
                  return (
                    <p key={index} className="whitespace-pre-line">
                      <strong className="mr-2 inline-block font-bold text-ink">{label}</strong>
                      {match[2]}
                    </p>
                  )
                }
                return <p key={index} className="whitespace-pre-line">{paragraph}</p>
              })}
            </div>
          </div>
        </article>

        <section className="overflow-y-auto p-5 md:p-7">
          <div className="mx-auto max-w-3xl space-y-7">
            {passage.questions.map((question, index) => {
              const previous = passage.questions[index - 1]
              const showHeading = index === 0 || previous.kind !== question.kind || previous.instruction !== question.instruction
              return (
                <div key={question.id} id={`reading-question-${question.id}`} className={`scroll-mt-4 ${currentQ === question.id ? 'border-l-2 border-electric pl-4' : ''}`}>
                  {showHeading && (
                    <div className="mb-4">
                      <h3 className="font-plex text-sm font-bold text-ink">Questions {question.id}–{question.kind === 'text' ? passage.questions.filter(item => item.kind === question.kind && item.instruction === question.instruction).at(-1)?.id : passage.range[1]}</h3>
                      <p className="mt-1 font-plex text-xs leading-5 text-graphite-mid">
                        {question.kind === 'text' ? `Complete each answer. Write ${question.instruction}.` : question.options?.includes('TRUE') ? 'Choose TRUE, FALSE or NOT GIVEN.' : question.options?.includes('YES') ? 'Choose YES, NO or NOT GIVEN.' : 'Choose the correct option.'}
                      </p>
                    </div>
                  )}
                  <div className="font-plex text-sm font-semibold leading-6 text-ink"><span className="mr-2 font-mono">{question.id}</span>{question.prompt}</div>
                  {question.kind === 'text' ? (
                    <input aria-label={`Reading answer ${question.id}`} value={answers[question.id] || ''} onFocus={() => setCurrentQ(question.id)} onChange={event => setAnswer(question.id, event.target.value)} className="mt-3 w-full max-w-sm rounded-sm border border-graphite-light bg-surface px-3 py-2 font-plex text-sm outline-none focus:border-electric focus:ring-1 focus:ring-electric" placeholder="Type your answer" />
                  ) : question.options && question.options.length > 7 ? (
                    <select aria-label={`Reading answer ${question.id}`} value={answers[question.id] || ''} onChange={event => setAnswer(question.id, event.target.value)} className="mt-3 w-full rounded-sm border border-graphite-light bg-surface px-3 py-2 font-plex text-sm">
                      <option value="">Select an answer</option>
                      {question.options.map(option => <option key={option} value={optionValue(option)}>{option}</option>)}
                    </select>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {question.options?.map(option => {
                        const value = optionValue(option)
                        return (
                          <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-sm border px-3 py-2 font-plex text-sm ${answers[question.id] === value ? 'border-electric bg-electric-dim' : 'border-transparent hover:bg-surface-2'}`}>
                            <input type="radio" name={`reading-${question.id}`} checked={answers[question.id] === value} onChange={() => setAnswer(question.id, value)} className="mt-1 accent-electric" />
                            <span>{option}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <footer className="border-t border-divider bg-paper-dark px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4 overflow-x-auto">
            <span className="whitespace-nowrap font-plex text-sm font-bold text-ink">Part {passage.part}</span>
            <div className="flex gap-1">
              {Array.from({ length: passage.range[1] - passage.range[0] + 1 }, (_, index) => passage.range[0] + index).map(id => (
                <button key={id} onClick={() => {
                  setCurrentQ(id)
                  window.setTimeout(() => document.getElementById(`reading-question-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
                }} className={`h-7 w-7 rounded-sm border font-mono text-xs ${currentQ === id ? 'border-electric bg-surface text-accent' : answers[id] ? 'border-success bg-success-soft text-positive' : 'border-transparent text-ink'}`}>{id}</button>
              ))}
            </div>
            <span className="hidden whitespace-nowrap font-mono text-xs text-graphite-mid lg:inline">{answered}/{totalQuestions} answered</span>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Previous reading passage" disabled={passage.part === 1 || part !== undefined} onClick={() => setCurrentQ(READING_PASSAGES[passageIndex - 1].range[0])} className="h-11 w-11 rounded-sm bg-divider font-plex text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">←</button>
            <button aria-label="Next reading passage" disabled={passage.part === 3 || part !== undefined} onClick={() => setCurrentQ(READING_PASSAGES[passageIndex + 1].range[0])} className="h-11 w-11 rounded-sm bg-navy font-plex text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">→</button>
          </div>
        </div>
        <div className="mt-2 flex gap-4 border-t border-divider pt-2">
          {READING_PASSAGES.filter(item => part === undefined || item.part === part).map(item => (
            <button key={item.part} onClick={() => setCurrentQ(item.range[0])} className={`font-mono text-xs ${item.part === passage.part ? 'font-semibold text-accent' : 'text-graphite-mid hover:text-ink'}`}>Part {item.part} · {Object.keys(answers).filter(key => Number(key) >= item.range[0] && Number(key) <= item.range[1] && answers[Number(key)]).length}/{item.range[1] - item.range[0] + 1}</button>
          ))}
        </div>
      </footer>
    </main>
  )
}

type WritingExamProps = {
  answers: Record<number, string>
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>
  currentTask: number
  setCurrentTask: React.Dispatch<React.SetStateAction<number>>
  timeLeft: number
  part?: number
  onFinish: () => void
}

function WritingChart() {
  const series = [
    { name: 'Manufacturing', values: [15, 17, 15, 13], dash: '', marker: 'circle' },
    { name: 'Retail', values: [5, 8, 13, 17], dash: '', marker: 'square' },
    { name: 'Agriculture', values: [5, 4, 3, 2], dash: '7 5', marker: 'circle' },
    { name: 'Healthcare', values: [2.5, 5, 10, 17], dash: '2 5', marker: 'square' },
  ]
  const x = (index: number) => 76 + index * 100
  const y = (value: number) => 232 - value * 9

  return (
    <svg viewBox="0 0 520 300" role="img" aria-label="Line graph showing the number of jobs in four US economic sectors from 1960 to 2020" className="mx-auto mt-6 w-full max-w-2xl bg-surface">
      <text x="260" y="22" textAnchor="middle" className="fill-ink font-plex text-sm font-semibold">Number of jobs in four sectors of the US economy, 1960–2020</text>
      {[0, 5, 10, 15, 20, 25].map(value => (
        <g key={value}>
          <line x1="60" x2="390" y1={y(value)} y2={y(value)} className="stroke-divider" />
          <text x="50" y={y(value) + 4} textAnchor="end" className="fill-graphite-mid font-mono text-xs">{value}</text>
        </g>
      ))}
      <line x1="60" x2="60" y1="7" y2="232" className="stroke-ink" />
      <line x1="60" x2="390" y1="232" y2="232" className="stroke-ink" />
      {[1960, 1980, 2000, 2020].map((year, index) => <text key={year} x={x(index)} y="252" textAnchor="middle" className="fill-ink font-mono text-xs">{year}</text>)}
      <text x="225" y="280" textAnchor="middle" className="fill-graphite font-plex text-xs">Year</text>
      <text x="16" y="125" textAnchor="middle" transform="rotate(-90 16 125)" className="fill-graphite font-plex text-xs">Number of jobs (millions)</text>
      {series.map((item, seriesIndex) => {
        const points = item.values.map((value, index) => `${x(index)},${y(value)}`).join(' ')
        return (
          <g key={item.name}>
            <polyline points={points} fill="none" style={{ stroke: themeText(seriesIndex < 2 ? '#0F172A' : '#64748B') }} strokeWidth="2" strokeDasharray={item.dash} />
            {item.values.map((value, index) => item.marker === 'circle'
              ? <circle key={index} cx={x(index)} cy={y(value)} r="3" className="fill-white stroke-ink" />
              : <rect key={index} x={x(index) - 3} y={y(value) - 3} width="6" height="6" className={seriesIndex === 1 ? 'fill-ink' : 'fill-white stroke-graphite-mid'} />)}
            <line x1="410" x2="438" y1={78 + seriesIndex * 28} y2={78 + seriesIndex * 28} style={{ stroke: themeText(seriesIndex < 2 ? '#0F172A' : '#64748B') }} strokeWidth="2" strokeDasharray={item.dash} />
            <text x="446" y={82 + seriesIndex * 28} className="fill-ink font-plex text-xs">{item.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

function WritingExam({ answers, setAnswers, currentTask, setCurrentTask, timeLeft, part, onFinish }: WritingExamProps) {
  const task = part ?? currentTask
  const response = answers[task] || ''
  const wordCount = response.trim() ? response.trim().split(/\s+/).length : 0
  const minimumWords = task === 1 ? 150 : 250
  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  return (
    <main className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col bg-surface">
      <header className="flex min-h-14 items-center justify-between border-b border-divider bg-surface px-4">
        <div className="flex items-center gap-5">
          <div className="border-r border-divider pr-5 font-plex text-2xl font-bold tracking-tight text-accent">IELTS</div>
          <div><div className="font-plex text-xs font-semibold text-ink">Test taker ID</div><div className="font-plex text-xs text-graphite-mid">Academic Writing · Test 1{part ? ` · Task ${part}` : ''}</div></div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right"><div className={`font-mono text-sm font-semibold ${timeLeft < 300 ? 'text-accent' : 'text-ink'}`}>{formatTime(timeLeft)}</div><div className="font-mono text-xs uppercase text-graphite-light">Time left</div></div>
          <button onClick={onFinish} className="rounded-sm bg-navy px-4 py-2 font-plex text-xs font-semibold text-white">Finish</button>
        </div>
      </header>

      <div className="border-b border-divider bg-paper-dark px-4 py-3">
        <h1 className="font-plex text-sm font-bold text-ink">Task {task}</h1>
        <p className="mt-1 font-plex text-sm text-ink">You should spend about {task === 1 ? '20' : '40'} minutes on this task. Write at least {minimumWords} words.</p>
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-2">
        <article className="overflow-y-auto border-b border-divider p-5 md:border-b-0 md:border-r md:p-7">
          <div className="mx-auto max-w-3xl font-plex text-sm leading-7 text-ink">
            {task === 1 ? (
              <>
                <p className="font-semibold">The graph below gives information about the number of jobs in four sectors of the economy in the US between 1960 and 2020.</p>
                <p className="mt-4 font-semibold">Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
                <WritingChart />
              </>
            ) : (
              <>
                <p>You should write about the following topic:</p>
                <div className="mt-5 border-y border-divider bg-surface-2 p-6">
                  <p className="font-plex text-lg font-semibold leading-8 text-ink">The best way to provide enough homes in large cities is to build tall apartment blocks.</p>
                  <p className="mt-4 font-plex text-base font-semibold text-ink">To what extent do you agree or disagree with this statement?</p>
                </div>
                <p className="mt-5">Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
              </>
            )}
          </div>
        </article>

        <section className="min-h-0 overflow-y-auto bg-surface p-4 md:p-6">
          <label htmlFor={`writing-response-${task}`} className="font-mono text-xs uppercase tracking-wider text-graphite-mid">Your answer</label>
          <textarea
            id={`writing-response-${task}`}
            value={response}
            onChange={event => setAnswers(values => ({ ...values, [task]: event.target.value }))}
            spellCheck
            autoFocus
            className="mt-3 h-80 w-full resize-y rounded-sm border border-graphite-light bg-surface p-4 font-plex text-sm leading-7 text-ink outline-none transition-colors focus:border-electric focus:ring-1 focus:ring-electric"
            placeholder={`Write your Task ${task} response here...`}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-xs text-graphite-light">Saved automatically</span>
            <span className={`font-plex text-sm ${wordCount >= minimumWords ? 'font-semibold text-positive' : 'text-ink'}`}>Words: {wordCount}</span>
          </div>
          <div className="mt-4 border-t border-divider pt-4 font-plex text-xs text-graphite-mid">Minimum required: {minimumWords} words</div>
        </section>
      </div>

      <footer className="flex items-center justify-between border-t border-divider bg-paper-dark px-4 py-3">
        <div className="flex gap-4">
          {(part ? [part] : [1, 2]).map(taskNumber => (
            <button key={taskNumber} onClick={() => setCurrentTask(taskNumber)} className={`font-mono text-xs ${task === taskNumber ? 'font-semibold text-accent' : 'text-graphite-mid'}`}>Task {taskNumber} · {answers[taskNumber]?.trim() ? `${answers[taskNumber].trim().split(/\s+/).length} words` : 'not started'}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button aria-label="Previous writing task" disabled={task === 1 || part !== undefined} onClick={() => setCurrentTask(1)} className="h-11 w-11 rounded-sm bg-divider font-plex text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">←</button>
          <button aria-label="Next writing task" disabled={task === 2 || part !== undefined} onClick={() => setCurrentTask(2)} className="h-11 w-11 rounded-sm bg-navy font-plex text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">→</button>
        </div>
      </footer>
    </main>
  )
}

type SpeakingExamProps = {
  currentPart: number
  setCurrentPart: React.Dispatch<React.SetStateAction<number>>
  timeLeft: number
  part?: number
  onRecording?: (part: number, recording: Blob) => void
  onFinish: () => void
}

const SPEAKING_CONTENT = {
  1: {
    label: 'Introduction and interview',
    title: 'Hairstyles',
    intro: 'The examiner asks you about yourself, your home, work or studies, and other familiar topics.',
    questions: [
      'Where do you go to get a haircut?',
      'Have you changed your hairstyle recently?',
      'Would you ever change the colour of your hair?',
      'Do you enjoy going to the hairdresser or barber?',
    ],
  },
  2: {
    label: 'Individual long turn',
    title: 'Describe a time when you used information for tourists, for example from a guidebook or online.',
    intro: 'You have one minute to prepare. Then speak for one to two minutes.',
    questions: [
      'where you got this information',
      'what place this information was about',
      'what information you got',
      'and explain whether this information was very helpful for you',
    ],
  },
  3: {
    label: 'Two-way discussion',
    title: 'Different types of holidays and tourist attractions',
    intro: 'Discuss the following questions in greater depth, giving reasons and examples.',
    questions: [
      'What are the most popular kinds of holidays for people from your country?',
      'Do most people prefer a holiday abroad rather than in their own country?',
      'Why do some people want to do absolutely nothing when they go away on holiday?',
      'What kinds of tourist attractions do visitors to your country like to see?',
      'Should museums and similar attractions be free for local people?',
      'What can make a tourist attraction disappointing for visitors?',
    ],
  },
} as const

function SpeakingExam({ currentPart, setCurrentPart, timeLeft, part, onRecording, onFinish }: SpeakingExamProps) {
  const activePart = part ?? currentPart
  const content = SPEAKING_CONTENT[activePart as keyof typeof SPEAKING_CONTENT]
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordings, setRecordings] = useState<Record<number, string>>({})
  const [microphoneError, setMicrophoneError] = useState('')
  const [prepLeft, setPrepLeft] = useState(0)
  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  useEffect(() => {
    if (!recording) return
    const timer = window.setInterval(() => setRecordingSeconds(value => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [recording])

  useEffect(() => {
    if (prepLeft <= 0) return
    const timer = window.setInterval(() => setPrepLeft(value => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [prepLeft])

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    Object.values(recordings).forEach(url => URL.revokeObjectURL(url))
  }, [])

  const startRecording = async () => {
    try {
      setMicrophoneError('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      streamRef.current = stream
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = event => {
        if (event.data.size) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecordings(values => {
          if (values[activePart]) URL.revokeObjectURL(values[activePart])
          return { ...values, [activePart]: url }
        })
        onRecording?.(activePart, blob)
        stream.getTracks().forEach(track => track.stop())
      }
      setRecordingSeconds(0)
      recorder.start()
      setRecording(true)
    } catch {
      setMicrophoneError('Microphone access was blocked. Allow microphone access in your browser and try again.')
    }
  }

  const stopRecording = () => {
    recorderRef.current?.stop()
    setRecording(false)
  }

  const changePart = (nextPart: number) => {
    if (recording) stopRecording()
    setPrepLeft(0)
    setCurrentPart(nextPart)
  }

  return (
    <main className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col bg-paper">
      <header className="flex min-h-14 items-center justify-between border-b border-divider bg-surface px-4">
        <div className="flex items-center gap-5">
          <div className="border-r border-divider pr-5 font-plex text-2xl font-bold tracking-tight text-accent">IELTS</div>
          <div><div className="font-plex text-xs font-semibold text-ink">Test taker ID</div><div className="font-plex text-xs text-graphite-mid">Speaking · Test 1{part ? ` · Part ${part}` : ''}</div></div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right"><div className={`font-mono text-sm font-semibold ${timeLeft < 60 ? 'text-accent' : 'text-ink'}`}>{formatTime(timeLeft)}</div><div className="font-mono text-xs uppercase text-graphite-light">Time left</div></div>
          <button disabled={recording} onClick={onFinish} className="rounded-sm bg-navy px-4 py-2 font-plex text-xs font-semibold text-white disabled:opacity-40">Finish</button>
        </div>
      </header>

      <div className="border-b border-divider bg-paper-dark px-4 py-3">
        <h1 className="font-plex text-sm font-bold text-ink">Part {activePart}</h1>
        <p className="mt-1 font-plex text-sm text-ink">{content.label}</p>
      </div>

      <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-3 lg:p-8">
        <section className="border border-divider bg-surface p-6 lg:col-span-2">
          <div className="font-mono text-xs uppercase tracking-widest text-accent">Speaking prompt</div>
          <h2 className="mt-3 font-plex text-xl font-bold leading-8 text-ink">{content.title}</h2>
          <p className="mt-3 border-l-2 border-electric-dim pl-4 font-plex text-sm leading-6 text-graphite-mid">{content.intro}</p>
          <ul className="mt-6 space-y-3">
            {content.questions.map((question, index) => (
              <li key={question} className="flex gap-3 font-plex text-sm leading-6 text-ink">
                <span className="font-mono text-xs font-semibold text-accent">{String(index + 1).padStart(2, '0')}</span>
                <span>{activePart === 2 ? question : question}</span>
              </li>
            ))}
          </ul>
          {activePart === 2 && (
            <div className="mt-7 border-t border-divider pt-5">
              <button disabled={prepLeft > 0 || recording} onClick={() => setPrepLeft(60)} className="rounded-sm border border-divider bg-surface px-4 py-2 font-plex text-sm font-semibold text-ink disabled:opacity-50">{prepLeft > 0 ? `Preparation: ${prepLeft}s` : 'Start 1-minute preparation'}</button>
              <p className="mt-2 font-plex text-xs text-graphite-mid">You may make notes on paper during preparation.</p>
            </div>
          )}
        </section>

        <aside className="theme-fixed border border-divider bg-navy p-6 text-white">
          <div className="font-mono text-xs uppercase tracking-widest text-electric-light">Voice recorder</div>
          <div className="mt-6 flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${recording ? 'animate-pulse bg-danger' : 'bg-navy-light'}`} />
            <span className="font-plex text-sm font-semibold">{recording ? 'Recording in progress' : recordings[activePart] ? 'Response recorded' : 'Ready to record'}</span>
          </div>
          <div className="mt-3 font-mono text-3xl font-bold">{formatTime(recordingSeconds)}</div>
          {recording ? (
            <button onClick={stopRecording} className="mt-6 w-full rounded-sm bg-danger px-5 py-3 font-plex text-sm font-semibold text-white">Stop recording</button>
          ) : (
            <button onClick={startRecording} className="mt-6 w-full rounded-sm bg-electric px-5 py-3 font-plex text-sm font-semibold text-white">Start recording</button>
          )}
          {microphoneError && <p className="mt-4 border border-danger bg-danger/10 p-3 font-plex text-xs leading-5 text-white">{microphoneError}</p>}
          {recordings[activePart] && !recording && (
            <div className="mt-5 border-t border-navy-light pt-5">
              <div className="mb-2 font-mono text-xs uppercase text-graphite-light">Playback</div>
              <audio controls src={recordings[activePart]} className="w-full" />
              <button onClick={startRecording} className="mt-3 font-plex text-xs text-electric-light hover:text-white">Record this part again</button>
            </div>
          )}
          <p className="mt-5 font-plex text-xs leading-5 text-graphite-light">Record in a quiet room and speak naturally. Your recording remains in this browser session.</p>
        </aside>
      </div>

      <footer className="flex items-center justify-between border-t border-divider bg-surface px-4 py-3">
        <div className="flex gap-4">
          {(part ? [part] : [1, 2, 3]).map(partNumber => (
            <button key={partNumber} onClick={() => changePart(partNumber)} className={`font-mono text-xs ${activePart === partNumber ? 'font-semibold text-accent' : 'text-graphite-mid'}`}>Part {partNumber} · {recordings[partNumber] ? 'recorded' : 'not started'}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button aria-label="Previous speaking part" disabled={activePart === 1 || part !== undefined} onClick={() => changePart(activePart - 1)} className="h-11 w-11 rounded-sm bg-divider font-plex text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">←</button>
          <button aria-label="Next speaking part" disabled={activePart === 3 || part !== undefined} onClick={() => changePart(activePart + 1)} className="h-11 w-11 rounded-sm bg-navy font-plex text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">→</button>
        </div>
      </footer>
    </main>
  )
}

export default function PracticeTest() {
  const { user } = useAuth()
  const [stage, setStage] = useState<'select' | 'instructions' | 'test' | 'result'>('select')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [selectedTest, setSelectedTest] = useState(TESTS[0])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [currentQ, setCurrentQ] = useState(1)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioName, setAudioName] = useState('')
  const [selectedBook, setSelectedBook] = useState(selectedTest.book || '18')
  const [selectedTestNum, setSelectedTestNum] = useState(selectedTest.testNumber || 1)
  const [backendHealth, setBackendHealth] = useState<BackendHealth>({ connected: false })
  const [soundTestPlaying, setSoundTestPlaying] = useState(false)
  const soundTestAudioRef = useRef<HTMLAudioElement | null>(null)
  const [fullModule, setFullModule] = useState<FullTestModule>('Listening')
  const [fullCompleted, setFullCompleted] = useState<FullTestModule[]>([])
  const [fullAttempt, setFullAttempt] = useState<FullTestAttempt>(emptyFullAttempt)
  const savedResultKey = useRef('')
  const [resultFilter, setResultFilter] = useState<'all' | 'incorrect' | 'correct'>('all')

  useEffect(() => {
    checkBackendHealth().then(status => {
      setBackendHealth(status)
      if (status.connected && !audioUrl) {
        setAudioUrl(getStreamUrl(selectedBook, selectedTestNum, 1))
        setAudioName(`IELTS ${selectedBook} · Test ${selectedTestNum} · Part 1 (Local Backend)`)
      }
    })
  }, [])

  // Sync book/test when test selection changes
  useEffect(() => {
    if (selectedTest.book) setSelectedBook(selectedTest.book)
    if (selectedTest.testNumber) setSelectedTestNum(selectedTest.testNumber)
  }, [selectedTest])

  const visibleTests = filter === 'All' ? TESTS : TESTS.filter(test => test.type === filter)
  const answered = Object.keys(answers).filter(key => answers[Number(key)]?.trim()).length
  const listeningScore = useMemo(() => {
    const regularScore = Object.entries(LISTENING_ANSWERS).reduce((total, [key, accepted]) => {
      const id = Number(key)
      if ([21, 22, 23, 24].includes(id)) return total
      const response = answers[id]?.trim().toLowerCase()
      return total + (accepted.some(value => value.toLowerCase() === response) ? 1 : 0)
    }, 0)
    const pairScore = ([first, second]: number[], expected: string[]) => {
      const responses = new Set([answers[first]?.toUpperCase(), answers[second]?.toUpperCase()].filter(Boolean))
      return expected.filter(value => responses.has(value)).length
    }
    return regularScore + pairScore([21, 22], ['B', 'D']) + pairScore([23, 24], ['C', 'E'])
  }, [answers])
  const readingScore = useMemo(() => Object.entries(READING_ANSWERS).reduce((total, [key, accepted]) => {
    const response = answers[Number(key)]?.trim().toLowerCase().replace(/\s+/g, ' ')
    return total + (accepted.some(value => value.toLowerCase() === response) ? 1 : 0)
  }, 0), [answers])

  const listeningBand = (raw: number) => {
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

  const readingBand = (raw: number) => {
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

  useEffect(() => {
    if (stage !== 'result' || selectedTest.type === 'Full Test') return
    const resultKey = `${selectedTest.id}-${timeLeft}`
    if (savedResultKey.current === resultKey) return
    savedResultKey.current = resultKey

    const isObjective = selectedTest.type === 'Listening' || selectedTest.type === 'Reading'
    const correctAnswers = selectedTest.type === 'Listening' ? listeningScore : selectedTest.type === 'Reading' ? readingScore : undefined
    const projectedRaw = correctAnswers === undefined ? 0 : Math.round((correctAnswers / selectedTest.questions) * 40)
    const overallBand = selectedTest.type === 'Listening'
      ? listeningBand(projectedRaw)
      : selectedTest.type === 'Reading'
        ? readingBand(projectedRaw)
        : null
    const comment = selectedTest.type === 'Listening'
      ? 'Review incorrect answers by section and practise predicting the required answer type before listening.'
      : selectedTest.type === 'Reading'
        ? 'Review passage evidence for missed questions and track which question types cause the most difficulty.'
        : selectedTest.type === 'Writing'
          ? 'Writing response submitted. Connect the Gemini evaluation endpoint for criterion-level comments and a band estimate.'
          : 'Speaking practice submitted. Connect Gemini audio evaluation for transcript, pronunciation, and fluency comments.'

    const resultRecord = {
      id: `${selectedTest.id}-${Date.now()}`,
      userId: user?.id || 'USR-1048',
      userName: user?.name || 'Ayaan Rahman',
      testTitle: selectedTest.title,
      testType: selectedTest.type,
      completedAt: new Date().toISOString(),
      overallBand,
      skillBands: overallBand ? { [selectedTest.type]: overallBand } : {},
      correctAnswers,
      totalQuestions: isObjective ? selectedTest.questions : undefined,
      userAnswers: answers,
      comment,
      source: (isObjective ? 'Automatic' : 'Pending AI') as any,
    }

    saveExamResult(resultRecord as any)
    saveExamResultApi(resultRecord as any).catch(() => {})
  }, [listeningScore, readingScore, selectedTest, stage, timeLeft, user, answers])

  const advanceFullTest = () => {
    const currentIndex = FULL_TEST_ORDER.indexOf(fullModule)
    if (fullModule === 'Listening') setFullAttempt(current => ({ ...current, listening: { ...answers } }))
    if (fullModule === 'Reading') setFullAttempt(current => ({ ...current, reading: { ...answers } }))
    if (fullModule === 'Writing') setFullAttempt(current => ({ ...current, writing: { ...answers } }))
    setFullCompleted(current => current.includes(fullModule) ? current : [...current, fullModule])
    if (currentIndex === FULL_TEST_ORDER.length - 1) {
      setStage('result')
      return
    }
    const nextModule = FULL_TEST_ORDER[currentIndex + 1]
    setFullModule(nextModule)
    setAnswers({})
    setCurrentQ(1)
    setTimeLeft(FULL_TEST_DURATIONS[nextModule] * 60)
  }

  useEffect(() => {
    if (stage !== 'test') return
    if (timeLeft <= 0) {
      if (selectedTest.type === 'Full Test') advanceFullTest()
      else setStage('result')
      return
    }
    const timer = window.setInterval(() => setTimeLeft(value => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [stage, timeLeft])

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  const beginTest = () => {
    if (soundTestAudioRef.current) {
      soundTestAudioRef.current.pause()
      setSoundTestPlaying(false)
    }
    savedResultKey.current = ''
    setAnswers({})
    const partStart = selectedTest.part
      ? selectedTest.type === 'Reading'
        ? READING_PASSAGES[selectedTest.part - 1].range[0]
        : selectedTest.type === 'Writing' || selectedTest.type === 'Speaking'
          ? selectedTest.part
        : (selectedTest.part - 1) * 10 + 1
      : 1
    setCurrentQ(partStart)
    if (selectedTest.type === 'Full Test') {
      setFullModule('Listening')
      setFullCompleted([])
      setFullAttempt(emptyFullAttempt())
      setTimeLeft(FULL_TEST_DURATIONS.Listening * 60)
    } else {
      setTimeLeft(selectedTest.duration * 60)
    }
    setStage('test')
  }

  const connectAudio = (file?: File) => {
    if (!file) return
    if (audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl)
    setAudioUrl(URL.createObjectURL(file))
    setAudioName(file.name)
  }

  const resetTest = () => {
    setStage('select')
    setAnswers({})
    setCurrentQ(1)
    setResultFilter('all')
  }

  if (stage === 'result') {
    if (selectedTest.type === 'Full Test') {
      return (
        <FullTestResult
          listeningAnswers={fullAttempt.listening}
          readingAnswers={fullAttempt.reading}
          writingAnswers={fullAttempt.writing}
          speakingRecordings={fullAttempt.speaking}
          onExit={resetTest}
          onRetake={() => setStage('instructions')}
        />
      )
    }
    if (selectedTest.type === 'Speaking') {
      return (
        <main className="mx-auto max-w-4xl px-6 py-12">
          <section className="corner-mark border border-divider bg-surface p-8">
            <div className="label-tag mb-3">{selectedTest.title}</div>
            <h1 className="font-plex text-3xl font-bold text-ink">Speaking practice complete</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-mid">Speaking recordings are kept only for playback during the active browser session. A band score requires evaluation of fluency and coherence, lexical resource, grammatical range and accuracy, and pronunciation.</p>
            <div className="mt-8 flex gap-3">
              <button onClick={resetTest} className="rounded-card bg-electric px-6 py-3 font-plex text-sm font-semibold text-white">Return to test centre</button>
              <button onClick={() => setStage('instructions')} className="rounded-card border border-divider px-6 py-3 font-plex text-sm font-semibold text-ink">Practice again</button>
            </div>
          </section>
        </main>
      )
    }
    if (selectedTest.type === 'Writing') {
      const taskNumbers = selectedTest.part ? [selectedTest.part] : [1, 2]
      return (
        <main className="mx-auto max-w-4xl px-6 py-12">
          <section className="corner-mark border border-divider bg-surface p-8">
            <div className="label-tag mb-3">{selectedTest.title}</div>
            <h1 className="font-plex text-3xl font-bold text-ink">Writing test submitted</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-mid">Your responses have been saved. Writing requires assessment against Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {taskNumbers.map(taskNumber => {
                const words = answers[taskNumber]?.trim() ? answers[taskNumber].trim().split(/\s+/).length : 0
                const target = taskNumber === 1 ? 150 : 250
                return (
                  <div key={taskNumber} className="border border-divider bg-surface-2 p-4">
                    <div className="font-mono text-xs uppercase tracking-wide text-graphite-light">Task {taskNumber}</div>
                    <div className={`mt-1 font-mono text-xl font-semibold ${words >= target ? 'text-positive' : 'text-caution'}`}>{words} words</div>
                    <div className="mt-1 text-xs text-graphite-mid">Minimum: {target} words</div>
                  </div>
                )
              })}
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={resetTest} className="rounded-card bg-electric px-6 py-3 font-plex text-sm font-semibold text-white">Return to test centre</button>
              <button onClick={() => setStage('instructions')} className="rounded-card border border-divider px-6 py-3 font-plex text-sm font-semibold text-ink">Retake test</button>
            </div>
          </section>
        </main>
      )
    }
    const isListening = selectedTest.type === 'Listening'
    const projectedListeningScore = Math.round((listeningScore / selectedTest.questions) * 40)
    const projectedReadingScore = Math.round((readingScore / selectedTest.questions) * 40)
    const displayedBand = isListening ? listeningBand(projectedListeningScore) : readingBand(projectedReadingScore)
    const correctAnswers = isListening ? listeningScore : readingScore

    const readingQuestions = selectedTest.type === 'Reading'
      ? selectedTest.part !== undefined
        ? READING_PASSAGES[selectedTest.part - 1]?.questions || []
        : READING_PASSAGES.flatMap(p => p.questions)
      : []

    const isAnswerCorrect = (userAns: string | undefined, accepted: string[]) => {
      if (!userAns || !userAns.trim()) return false
      const norm = userAns.trim().toLowerCase().replace(/\s+/g, ' ')
      return accepted.some(v => v.trim().toLowerCase().replace(/\s+/g, ' ') === norm)
    }

    const questionReviewItems = readingQuestions.map(q => {
      const userAns = answers[q.id]?.trim() || ''
      const accepted = READING_ANSWERS[q.id] || []
      const correct = isAnswerCorrect(userAns, accepted)
      const unanswered = !userAns
      return {
        id: q.id,
        prompt: q.prompt,
        userAns,
        accepted,
        correct,
        unanswered,
        explanation: q.explanation,
        passageReference: q.passageReference,
      }
    })

    const filteredReviewItems = questionReviewItems.filter(item => {
      if (resultFilter === 'incorrect') return !item.correct
      if (resultFilter === 'correct') return item.correct
      return true
    })

    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <section className="corner-mark border border-divider bg-surface p-8">
          <div className="label-tag mb-3">{selectedTest.title}</div>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-plex text-3xl font-bold text-ink">Test complete</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-graphite-mid">This is a practice estimate, not an official IELTS result. Review each response before beginning your next attempt.</p>
            </div>
            <div className="border-l-4 border-electric pl-5">
              <div className="font-mono text-xs uppercase tracking-widest text-graphite-light">Estimated band</div>
              <div className="font-mono text-5xl font-bold text-accent">{displayedBand.toFixed(1)}</div>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ['Correct answers', `${correctAnswers} / ${selectedTest.questions}`],
              ['Questions answered', `${answered} / ${selectedTest.questions}`],
              ['Time used', formatTime(selectedTest.duration * 60 - timeLeft)],
            ].map(([label, value]) => (
              <div key={label} className="border border-divider bg-surface-2 p-4">
                <div className="font-mono text-xs uppercase tracking-wide text-graphite-light">{label}</div>
                <div className="mt-1 font-mono text-xl font-semibold text-ink">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <NavLink to="/results" className="rounded-card bg-electric px-6 py-3 font-plex text-sm font-semibold text-white transition-colors hover:bg-electric-light">
              View Detailed Diagnostic Report →
            </NavLink>
            <button onClick={resetTest} className="rounded-card border border-divider bg-surface px-6 py-3 font-plex text-sm font-semibold text-ink transition-colors hover:border-graphite-light">
              Return to test centre
            </button>
            <button onClick={() => setStage('instructions')} className="rounded-card border border-divider bg-surface px-6 py-3 font-plex text-sm font-semibold text-ink transition-colors hover:border-graphite-light">
              Retake test
            </button>
          </div>
        </section>

        {/* Detailed Question Review & Diagnostics */}
        {selectedTest.type === 'Reading' && questionReviewItems.length > 0 && (
          <section className="mt-8 border border-divider bg-surface p-6 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-divider pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="label-tag">DIAGNOSTIC REVIEW</div>
                <h2 className="mt-2 font-plex text-2xl font-bold text-ink">Answer Review & Passage Evidence</h2>
                <p className="mt-1 text-sm text-graphite-mid">
                  Review which answers were correct, why incorrect responses were wrong, and the exact passage excerpts used as evidence.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setResultFilter('all')}
                  className={`rounded-sm border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                    resultFilter === 'all'
                      ? 'border-navy bg-navy text-white'
                      : 'border-divider bg-surface text-graphite hover:border-graphite-light'
                  }`}
                >
                  All Questions ({questionReviewItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setResultFilter('incorrect')}
                  className={`rounded-sm border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                    resultFilter === 'incorrect'
                      ? 'border-rose-600 bg-rose-600 text-white'
                      : 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300'
                  }`}
                >
                  Mistakes ({questionReviewItems.filter(item => !item.correct).length})
                </button>
                <button
                  type="button"
                  onClick={() => setResultFilter('correct')}
                  className={`rounded-sm border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                    resultFilter === 'correct'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
                  }`}
                >
                  Correct ({questionReviewItems.filter(item => item.correct).length})
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {filteredReviewItems.length === 0 ? (
                <div className="py-12 text-center text-sm text-graphite-mid">
                  {resultFilter === 'incorrect' ? '🎉 Great job! You have no incorrect answers.' : 'No questions match this filter.'}
                </div>
              ) : (
                filteredReviewItems.map(item => (
                  <article
                    key={item.id}
                    className={`rounded-sm border p-5 sm:p-6 transition-all ${
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
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                            : item.unanswered
                              ? 'border border-amber-200 bg-amber-50 text-amber-700'
                              : 'border border-rose-200 bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.correct ? '✓ Correct' : item.unanswered ? '○ Unanswered' : '✕ Incorrect'}
                      </span>
                    </div>

                    <div className="mt-3 font-plex text-sm font-semibold leading-6 text-ink">
                      {item.prompt}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div
                        className={`rounded-sm border p-3 ${
                          item.correct ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'
                        }`}
                      >
                        <div className="font-mono text-[11px] uppercase tracking-wider text-graphite-light">Your Response</div>
                        <div
                          className={`mt-1 font-mono text-sm font-bold ${
                            item.correct ? 'text-emerald-700' : 'text-rose-600'
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
                          <span>💡 Why wrong / right</span>
                        </div>
                        <p className="mt-1.5 font-plex text-sm leading-6 text-graphite">
                          {item.explanation}
                        </p>
                      </div>
                    )}

                    {item.passageReference && (
                      <div className="mt-3 rounded-sm border border-sky-100 bg-sky-50/40 p-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-sky-800">
                          <span>📖 Part of the passage taken from</span>
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
      </main>
    )
  }

  if (stage === 'test') {
    if (selectedTest.type === 'Full Test') {
      if (fullModule === 'Listening') {
        return (
          <ListeningExam
            answers={answers}
            setAnswers={setAnswers}
            currentQ={currentQ}
            setCurrentQ={setCurrentQ}
            timeLeft={timeLeft}
            audioUrl={audioUrl}
            audioName={audioName}
            selectedBook={selectedBook}
            selectedTestNumber={selectedTestNum}
            backendConnected={backendHealth.connected}
            onAudioFile={connectAudio}
            onFinish={advanceFullTest}
          />
        )
      }
      if (fullModule === 'Reading') {
        return <ReadingExam answers={answers} setAnswers={setAnswers} currentQ={currentQ} setCurrentQ={setCurrentQ} timeLeft={timeLeft} onFinish={advanceFullTest} />
      }
      if (fullModule === 'Writing') {
        return <WritingExam answers={answers} setAnswers={setAnswers} currentTask={currentQ} setCurrentTask={setCurrentQ} timeLeft={timeLeft} onFinish={advanceFullTest} />
      }
      return <SpeakingExam currentPart={currentQ} setCurrentPart={setCurrentQ} timeLeft={timeLeft} onRecording={(part, recording) => setFullAttempt(current => ({ ...current, speaking: { ...current.speaking, [part]: recording } }))} onFinish={advanceFullTest} />
    }
    if (selectedTest.type === 'Speaking') {
      return (
        <SpeakingExam
          currentPart={currentQ}
          setCurrentPart={setCurrentQ}
          timeLeft={timeLeft}
          part={selectedTest.part}
          onFinish={() => setStage('result')}
        />
      )
    }
    if (selectedTest.type === 'Writing') {
      return (
        <WritingExam
          answers={answers}
          setAnswers={setAnswers}
          currentTask={currentQ}
          setCurrentTask={setCurrentQ}
          timeLeft={timeLeft}
          part={selectedTest.part}
          onFinish={() => setStage('result')}
        />
      )
    }
    if (selectedTest.type === 'Listening') {
      return (
        <ListeningExam
          answers={answers}
          setAnswers={setAnswers}
          currentQ={currentQ}
          setCurrentQ={setCurrentQ}
          timeLeft={timeLeft}
          audioUrl={audioUrl}
          audioName={audioName}
          part={selectedTest.part}
          selectedBook={selectedBook}
          selectedTestNumber={selectedTestNum}
          backendConnected={backendHealth.connected}
          onAudioFile={connectAudio}
          onFinish={() => setStage('result')}
        />
      )
    }
    if (selectedTest.type === 'Reading') {
      return (
        <ReadingExam
          answers={answers}
          setAnswers={setAnswers}
          currentQ={currentQ}
          setCurrentQ={setCurrentQ}
          timeLeft={timeLeft}
          part={selectedTest.part}
          onFinish={() => setStage('result')}
        />
      )
    }
  }

  if (stage === 'instructions') {
    const isListening = selectedTest.type === 'Listening'
    const isWriting = selectedTest.type === 'Writing'
    const isSpeaking = selectedTest.type === 'Speaking'
    const isFullTest = selectedTest.type === 'Full Test'
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <button onClick={() => setStage('select')} className="mb-6 font-mono text-xs uppercase tracking-wide text-graphite-mid hover:text-accent">← Back to test centre</button>
        <div className="grid gap-6 md:grid-cols-3">
          <section className="border border-divider bg-surface p-6 md:col-span-2">
            <div className="label-tag">Before you begin</div>
            <h1 className="mt-2 font-plex text-2xl font-bold text-ink">{selectedTest.title}</h1>
            <p className="mt-3 text-sm leading-6 text-graphite-mid">This mock follows the timing and question structure of the computer-delivered IELTS {isFullTest ? 'Academic' : selectedTest.type} test{selectedTest.part ? ` (Part ${selectedTest.part})` : ''}.</p>
            <div className="my-6 h-px bg-divider" />
            <h2 className="font-plex text-base font-semibold text-ink">Test instructions</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-graphite">
              <li className="flex gap-3">
                <span className="font-mono text-accent">01</span>
                <span>
                  {isFullTest
                    ? 'You will complete Listening, Reading, Writing, and Speaking in sequence (total 85 questions, 174 minutes).'
                    : isListening
                    ? (selectedTest.part
                        ? `You have ${selectedTest.duration} minutes to answer ${selectedTest.questions} questions for Listening Part ${selectedTest.part}. The recording plays once only.`
                        : `You have ${selectedTest.duration} minutes to answer ${selectedTest.questions} questions across four parts. The recording plays once only.`)
                    : isWriting
                    ? (selectedTest.part
                        ? `You have ${selectedTest.duration} minutes for Writing Task ${selectedTest.part}. Target: at least ${selectedTest.part === 1 ? '150' : '250'} words.`
                        : `You have ${selectedTest.duration} minutes to complete both writing tasks (Task 1: 150+ words, Task 2: 250+ words).`)
                    : isSpeaking
                    ? (selectedTest.part
                        ? `This section lasts approximately ${selectedTest.duration} minutes for Speaking Part ${selectedTest.part}.`
                        : `This interview simulation lasts approximately ${selectedTest.duration} minutes across Parts 1, 2, and 3.`)
                    : (selectedTest.part
                        ? `You have ${selectedTest.duration} minutes to answer ${selectedTest.questions} questions for Reading Passage ${selectedTest.part}.`
                        : `You have ${selectedTest.duration} minutes to answer ${selectedTest.questions} questions across three passages.`)}
                </span>
              </li>
              <li className="flex gap-3"><span className="font-mono text-accent">02</span><span>Answers are saved automatically as you move through the test.</span></li>
              <li className="flex gap-3">
                <span className="font-mono text-accent">03</span>
                <span>
                  {isWriting
                    ? (selectedTest.part === 1
                        ? 'Task 1 requires at least 150 words (worth 1/3 of the writing score).'
                        : selectedTest.part === 2
                        ? 'Task 2 requires at least 250 words (worth 2/3 of the writing score).'
                        : 'Task 1 requires at least 150 words and Task 2 requires at least 250 words.')
                    : isSpeaking
                    ? 'Allow microphone access, record in a quiet room, and answer naturally in full sentences.'
                    : 'Spelling matters. Follow word-limit instructions exactly for completion questions.'}
                </span>
              </li>
              <li className="flex gap-3"><span className="font-mono text-accent">04</span><span>The test submits automatically when the timer reaches zero.</span></li>
            </ul>
            {isFullTest && (
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {FULL_TEST_ORDER.map((module, index) => <div key={module} className="border border-divider bg-surface-2 p-3"><div className="font-mono text-xs text-accent">0{index + 1}</div><div className="mt-1 font-plex text-xs font-semibold text-ink">{module}</div><div className="mt-1 font-mono text-xs text-graphite-light">{FULL_TEST_DURATIONS[module]} min</div></div>)}
              </div>
            )}
            {(isListening || isFullTest) && (
              <div className="mt-7 rounded-sm border border-divider bg-surface-2 p-5">
                <div className="flex items-center justify-between pb-3 border-b border-divider">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${backendHealth.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span className="font-plex text-sm font-bold text-ink">
                      {backendHealth.connected ? 'Local Backend Audio Connected' : 'Local Backend Offline'}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-graphite-mid">
                    {backendHealth.connected ? `${backendHealth.totalAudioFiles} Tracks in Database` : 'Port 5001'}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-plex text-xs font-semibold text-graphite-mid mb-1">
                      Audio Source / Edition
                    </label>
                    <select
                      value={`${selectedBook}-${selectedTestNum}`}
                      onChange={e => {
                        const [b, t] = e.target.value.split('-')
                        setSelectedBook(b)
                        setSelectedTestNum(Number(t))
                        if (!audioUrl.startsWith('blob:')) {
                          setAudioUrl(getStreamUrl(b, Number(t), 1))
                          setAudioName(`IELTS ${b} · Test ${t} · Part 1`)
                        }
                      }}
                      className="w-full rounded border border-graphite-light/40 bg-surface px-3 py-2 font-plex text-xs text-ink focus:outline-none focus:ring-1 focus:ring-electric"
                    >
                      <option value="18-1">IELTS 18 · Test 1 (Matches Questions)</option>
                      <option value="18-2">IELTS 18 · Test 2</option>
                      <option value="18-3">IELTS 18 · Test 3</option>
                      <option value="18-4">IELTS 18 · Test 4</option>
                      <option value="19-1">IELTS 19 · Test 1</option>
                      <option value="20-1">IELTS 20 · Test 1</option>
                      <option value="21-1">IELTS 21 · Test 1</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-plex text-xs font-semibold text-graphite-mid mb-1">
                      Audio Device Check (Sound Preview)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!soundTestAudioRef.current) {
                          const a = new Audio(getStreamUrl(selectedBook, selectedTestNum, 1))
                          soundTestAudioRef.current = a
                          a.onended = () => setSoundTestPlaying(false)
                        }
                        if (soundTestPlaying) {
                          soundTestAudioRef.current.pause()
                          setSoundTestPlaying(false)
                        } else {
                          soundTestAudioRef.current.src = getStreamUrl(selectedBook, selectedTestNum, 1)
                          soundTestAudioRef.current.currentTime = 0
                          soundTestAudioRef.current.play().then(() => {
                            setSoundTestPlaying(true)
                            window.setTimeout(() => {
                              if (soundTestAudioRef.current && !soundTestAudioRef.current.paused) {
                                soundTestAudioRef.current.pause()
                                setSoundTestPlaying(false)
                              }
                            }, 5000)
                          }).catch(() => setSoundTestPlaying(false))
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 rounded px-4 py-2 font-plex text-xs font-semibold text-white transition-all ${
                        soundTestPlaying ? 'bg-danger' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {soundTestPlaying ? (
                        <><span>■ Stop Preview</span> <span className="animate-pulse">🔊 Playing sound check...</span></>
                      ) : (
                        <><span>▶ Play 5s Sound Check</span></>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-divider/60">
                  <div className="font-mono text-xs text-graphite-mid truncate">
                    Streaming: <strong className="text-ink">{audioUrl.startsWith('blob:') ? (audioName || 'Custom File') : `IELTS ${selectedBook} · Test ${selectedTestNum} (Parts 1–4)`}</strong>
                  </div>
                  <label className="cursor-pointer text-xs font-plex font-semibold text-accent hover:underline">
                    <span>{audioUrl.startsWith('blob:') ? 'Replace custom file' : 'Or upload custom MP3'}</span>
                    <input className="sr-only" type="file" accept="audio/*" onChange={event => connectAudio(event.target.files?.[0])} />
                  </label>
                </div>
              </div>
            )}
            <label className="mt-7 flex items-start gap-3 border border-divider bg-surface-2 p-4 text-sm text-graphite">
              <input type="checkbox" defaultChecked className="mt-1 accent-electric" />
              <span>I understand the instructions and am ready to begin under timed conditions.</span>
            </label>
          </section>
          <aside className="theme-fixed border border-divider bg-navy p-6 text-white">
            <div className="font-mono text-xs uppercase tracking-widest text-electric-light">Test summary</div>
            <dl className="mt-6 space-y-5">
              {[['Module', selectedTest.module], ['Questions', String(selectedTest.questions)], ['Time limit', `${selectedTest.duration} minutes`], ['Format', 'Computer-delivered']].map(([term, detail]) => (
                <div key={term} className="border-b border-navy-light pb-4">
                  <dt className="font-mono text-xs uppercase tracking-wide text-graphite-light">{term}</dt>
                  <dd className="mt-1 font-plex text-sm font-semibold">{detail}</dd>
                </div>
              ))}
            </dl>
            <button onClick={beginTest} className="mt-6 w-full rounded-card bg-electric px-5 py-3 font-plex text-sm font-semibold text-white hover:bg-electric-light">Start timed test</button>
            <p className="mt-3 text-center font-mono text-xs text-graphite-light">Timer starts immediately</p>
          </aside>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col justify-between gap-5 border-b border-divider pb-7 md:flex-row md:items-end">
        <div>
          <div className="label-tag mb-2">IELTS simulation centre</div>
          <h1 className="font-plex text-3xl font-bold tracking-tight text-ink">Practice under real exam conditions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-mid">Full-length computer-delivered mocks with authentic timing, navigation and question formats.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="border-l-2 border-electric pl-3"><div className="font-mono text-lg font-bold text-ink">14</div><div className="font-mono text-xs uppercase text-graphite-light">Tests completed</div></div>
          <div className="border-l-2 border-violet pl-3"><div className="font-mono text-lg font-bold text-ink">7.0</div><div className="font-mono text-xs uppercase text-graphite-light">Best overall</div></div>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {FILTERS.map(item => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${filter === item ? 'border-line-ink bg-navy text-white' : 'border-divider bg-surface text-graphite-mid hover:border-graphite-light'}`}>{item}</button>
        ))}
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleTests.map(test => (
          <button key={test.id} onClick={() => setSelectedTest(test)} className={`group rounded-card border-2 bg-surface p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${selectedTest.id === test.id ? 'border-electric' : 'border-divider'}`}>
            <div className="flex items-start justify-between gap-4">
              <span className={`rounded-sm px-2 py-1 font-mono text-xs uppercase tracking-wide ${test.type === 'Writing' ? 'bg-violet-dim text-accent-2' : test.type === 'Full Test' ? 'bg-navy text-white' : 'bg-electric-dim text-accent'}`}>{test.type}</span>
              <span className="font-mono text-xs text-graphite-light">{test.status}</span>
            </div>
            <h2 className="mt-5 font-plex text-base font-semibold text-ink">{test.title}</h2>
            <div className="mt-5 grid grid-cols-3 border-t border-divider pt-4">
              <div><div className="font-mono text-sm font-semibold text-ink">{test.questions}</div><div className="font-mono text-xs uppercase text-graphite-light">Questions</div></div>
              <div><div className="font-mono text-sm font-semibold text-ink">{test.duration}</div><div className="font-mono text-xs uppercase text-graphite-light">Minutes</div></div>
              <div><div className="font-mono text-sm font-semibold text-ink">{test.difficulty}</div><div className="font-mono text-xs uppercase text-graphite-light">Level</div></div>
            </div>
          </button>
        ))}
      </section>

      <section className="sticky bottom-4 mt-7 flex flex-col justify-between gap-4 rounded-card border border-divider bg-surface/95 p-5 shadow-xl backdrop-blur md:flex-row md:items-center">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-accent">Selected test</div>
          <div className="mt-1 font-plex text-sm font-semibold text-ink">{selectedTest.title}</div>
          <div className="mt-1 font-mono text-xs text-graphite-light">{selectedTest.module} · {selectedTest.questions} questions · {selectedTest.duration} minutes</div>
        </div>
        <button onClick={() => setStage('instructions')} className="rounded-card bg-electric px-7 py-3 font-plex text-sm font-semibold text-white transition-colors hover:bg-electric-light">View instructions and begin →</button>
      </section>
    </main>
  )
}
