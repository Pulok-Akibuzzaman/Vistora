import { useEffect, useMemo, useRef, useState } from 'react'
import { READING_ANSWERS, READING_PASSAGES } from '../data/readingTest1'
import { READING_ANSWERS_2, READING_PASSAGES_2 } from '../data/readingTest2'
import { READING_ANSWERS_3, READING_PASSAGES_3 } from '../data/readingTest3'
import { READING_ANSWERS_4, READING_PASSAGES_4 } from '../data/readingTest4'
import { READING_ANSWERS_21, READING_PASSAGES_21 } from '../data/readingTest21'
import { LISTENING_ANSWERS, LISTENING_PARTS_1 } from '../data/listeningTest1'
import { LISTENING_ANSWERS_2, LISTENING_PARTS_2 } from '../data/listeningTest2'
import FullTestResult from '../components/FullTestResult'
import { saveExamResult } from '../lib/results'
import { checkBackendHealth, getStreamUrl, getSharepointAudioUrl, saveExamResultApi, fetchResults, evaluateSpeakingApi, type BackendHealth, type SpeakingEvaluationResult } from '../lib/api'
import { useAuth } from '../lib/authContext'
import { countCorrect, listeningPairs, markAnswers, readingPairs } from '../lib/scoring'
import { themeText, ThemeToggle } from '../lib/theme'
import { NavLink } from 'react-router'
import { getCustomTests, type CustomTest } from '../lib/customTests'
import type { ReadingPassage } from '../data/readingTest21'

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
  { id: 'r2', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Academic Reading Test 2', questions: 40, duration: 60, difficulty: 'Official format', status: 'New', book: '18', testNumber: 2 },
  { id: 'r2-p1', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 2 · Part 1', questions: 13, duration: 20, difficulty: 'Passage practice', status: 'New', part: 1, book: '18', testNumber: 2 },
  { id: 'r2-p2', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 2 · Part 2', questions: 13, duration: 20, difficulty: 'Passage practice', status: 'New', part: 2, book: '18', testNumber: 2 },
  { id: 'r2-p3', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 2 · Part 3', questions: 14, duration: 20, difficulty: 'Passage practice', status: 'New', part: 3, book: '18', testNumber: 2 },
  { id: 'r21', type: 'Reading', module: 'Academic', title: 'IELTS 21 — Academic Reading Test 1 (From Cambridge PDF)', questions: 40, duration: 60, difficulty: 'Official format', status: 'New', book: '21', testNumber: 21 },
  { id: 'r21-p1', type: 'Reading', module: 'Academic', title: 'IELTS 21 — Reading Test 1 · Part 1 (The Davies Sisters)', questions: 13, duration: 20, difficulty: 'Passage practice', status: 'New', part: 1, book: '21', testNumber: 21 },
  { id: 'r21-p2', type: 'Reading', module: 'Academic', title: 'IELTS 21 — Reading Test 1 · Part 2 (Why We Need Silence)', questions: 13, duration: 20, difficulty: 'Passage practice', status: 'New', part: 2, book: '21', testNumber: 21 },
  { id: 'r21-p3', type: 'Reading', module: 'Academic', title: 'IELTS 21 — Reading Test 1 · Part 3 (The World of Sugar)', questions: 14, duration: 20, difficulty: 'Passage practice', status: 'New', part: 3, book: '21', testNumber: 21 },
  { id: 'r3', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Academic Reading Test 3', questions: 40, duration: 60, difficulty: 'Official format', status: 'New', book: '18', testNumber: 3 },
  { id: 'r3-p1', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 3 · Part 1', questions: 13, duration: 20, difficulty: 'Passage practice', status: 'New', part: 1, book: '18', testNumber: 3 },
  { id: 'r3-p2', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 3 · Part 2', questions: 13, duration: 20, difficulty: 'Passage practice', status: 'New', part: 2, book: '18', testNumber: 3 },
  { id: 'r3-p3', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 3 · Part 3', questions: 14, duration: 20, difficulty: 'Passage practice', status: 'New', part: 3, book: '18', testNumber: 3 },
  { id: 'r4', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Academic Reading Test 4', questions: 40, duration: 60, difficulty: 'Official format', status: 'New', book: '18', testNumber: 4 },
  { id: 'r4-p1', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 4 · Part 1', questions: 13, duration: 20, difficulty: 'Passage practice', status: 'New', part: 1, book: '18', testNumber: 4 },
  { id: 'r4-p2', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 4 · Part 2', questions: 13, duration: 20, difficulty: 'Passage practice', status: 'New', part: 2, book: '18', testNumber: 4 },
  { id: 'r4-p3', type: 'Reading', module: 'Academic', title: 'IELTS 18 — Reading Test 4 · Part 3', questions: 14, duration: 20, difficulty: 'Passage practice', status: 'New', part: 3, book: '18', testNumber: 4 },
  { id: 'l1', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 1 (Full 4 Parts)', questions: 40, duration: 40, difficulty: 'Official format', status: 'In progress', book: '18', testNumber: 1 },
  { id: 'l1-p1', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 1 · Part 1', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 1, book: '18', testNumber: 1 },
  { id: 'l1-p2', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 1 · Part 2', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 2, book: '18', testNumber: 1 },
  { id: 'l1-p3', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 1 · Part 3', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 3, book: '18', testNumber: 1 },
  { id: 'l1-p4', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 1 · Part 4', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 4, book: '18', testNumber: 1 },
  { id: 'l2', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 2', questions: 40, duration: 40, difficulty: 'Official format', status: 'New', book: '18', testNumber: 2 },
  { id: 'l2-p1', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 2 · Part 1', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 1, book: '18', testNumber: 2 },
  { id: 'l2-p2', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 2 · Part 2', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 2, book: '18', testNumber: 2 },
  { id: 'l2-p3', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 2 · Part 3', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 3, book: '18', testNumber: 2 },
  { id: 'l2-p4', type: 'Listening', module: 'Academic', title: 'IELTS 18 — Listening Test 2 · Part 4', questions: 10, duration: 10, difficulty: 'Section practice', status: 'New', part: 4, book: '18', testNumber: 2 },
  { id: 'l19', type: 'Listening', module: 'Academic', title: 'IELTS 19 — Listening Test 1 (Audio Stream)', questions: 40, duration: 40, difficulty: 'Official audio', status: 'New', book: '19', testNumber: 1 },
  { id: 'l20', type: 'Listening', module: 'Academic', title: 'IELTS 20 — Listening Test 1 (Audio Stream)', questions: 40, duration: 40, difficulty: 'Official audio', status: 'New', book: '20', testNumber: 1 },
  { id: 'l21', type: 'Listening', module: 'Academic', title: 'IELTS 21 — Listening Test 1 (Audio Stream)', questions: 40, duration: 40, difficulty: 'Official audio', status: 'New', book: '21', testNumber: 1 },
  { id: 'w1', type: 'Writing', module: 'Academic', title: 'IELTS 18 — Academic Writing Test 1', questions: 2, duration: 60, difficulty: 'Official format', status: 'New', book: '18', testNumber: 1 },
  { id: 'w1-p1', type: 'Writing', module: 'Academic', title: 'IELTS 18 — Writing Test 1 · Task 1', questions: 1, duration: 20, difficulty: '150+ words', status: 'New', part: 1, book: '18', testNumber: 1 },
  { id: 'w1-p2', type: 'Writing', module: 'Academic', title: 'IELTS 18 — Writing Test 1 · Task 2', questions: 1, duration: 40, difficulty: '250+ words', status: 'New', part: 2, book: '18', testNumber: 1 },
  { id: 'w2', type: 'Writing', module: 'Academic', title: 'IELTS 18 — Academic Writing Test 2', questions: 2, duration: 60, difficulty: 'Official format', status: 'New', book: '18', testNumber: 2 },
  { id: 'w2-p1', type: 'Writing', module: 'Academic', title: 'IELTS 18 — Writing Test 2 · Task 1', questions: 1, duration: 20, difficulty: '150+ words', status: 'New', part: 1, book: '18', testNumber: 2 },
  { id: 'w2-p2', type: 'Writing', module: 'Academic', title: 'IELTS 18 — Writing Test 2 · Task 2', questions: 1, duration: 40, difficulty: '250+ words', status: 'New', part: 2, book: '18', testNumber: 2 },
  { id: 's1', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 1', questions: 3, duration: 14, difficulty: 'Official format', status: 'New', book: '18', testNumber: 1 },
  { id: 's1-p1', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 1 · Part 1', questions: 1, duration: 5, difficulty: 'Interview', status: 'New', part: 1, book: '18', testNumber: 1 },
  { id: 's1-p2', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 1 · Part 2', questions: 1, duration: 4, difficulty: 'Long turn', status: 'New', part: 2, book: '18', testNumber: 1 },
  { id: 's1-p3', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 1 · Part 3', questions: 1, duration: 5, difficulty: 'Discussion', status: 'New', part: 3, book: '18', testNumber: 1 },
  { id: 's2', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 2', questions: 3, duration: 14, difficulty: 'Official format', status: 'New', book: '18', testNumber: 2 },
  { id: 's2-p1', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 2 · Part 1', questions: 1, duration: 5, difficulty: 'Interview', status: 'New', part: 1, book: '18', testNumber: 2 },
  { id: 's2-p2', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 2 · Part 2', questions: 1, duration: 4, difficulty: 'Long turn', status: 'New', part: 2, book: '18', testNumber: 2 },
  { id: 's2-p3', type: 'Speaking', module: 'Academic', title: 'IELTS 18 — Speaking Test 2 · Part 3', questions: 1, duration: 5, difficulty: 'Discussion', status: 'New', part: 3, book: '18', testNumber: 2 },
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
    setAudioPlaying(false)
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

  const partTitle = selectedTestNumber === 2 
    ? LISTENING_PARTS_2[currentPart - 1]?.title || `Part ${currentPart}`
    : ['Oyster Bay Sailing Club Courses', 'Working as a makeup trainee', 'Ocean biodiversity research', 'Sources of rubber'][currentPart - 1]
  const partInstruction = selectedTestNumber === 2
    ? 'Follow the specific instructions for each question below.'
    : currentPart === 1
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
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 md:flex">
            <span className="font-mono text-[11px] font-medium text-emerald-400">{answered}/{totalQuestions} answered</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 transition-all duration-300 rounded-full" style={{ width: `${Math.min(100, (answered / (totalQuestions || 1)) * 100)}%` }} />
            </div>
          </div>
          <ThemeToggle className="h-9 w-9 rounded-lg border-slate-700 bg-slate-800/80 text-slate-200 hover:text-white hover:border-slate-500" />
          <button onClick={onFinish} className="flex items-center gap-1.5 rounded-lg border border-rose-500/60 px-3 py-2 text-[11px] font-bold text-rose-300 transition hover:bg-rose-600 hover:text-white sm:px-3.5">
            <span className="hidden sm:inline">End Test</span><span className="sm:hidden">End</span>
          </button>
        </div>
      </header>

      <div className="listening-exam-workspace flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <aside className="flex max-h-[42vh] w-full shrink-0 flex-col gap-3 overflow-y-auto border-b border-slate-800 bg-[#0B1220] p-3 md:max-h-none md:w-72 md:border-b-0 md:border-r md:p-4 xl:w-80">
          <section className="space-y-3 rounded-xl border border-slate-800 bg-[#111A2E] p-3.5" aria-label="Audio playback">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className={`h-2 w-2 rounded-full ${audioPlaying ? 'animate-pulse bg-rose-400' : 'bg-slate-500'}`} />Audio Playback
              </span>
              <button type="button" onClick={cycleSpeed} className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 hover:text-white" title="Playback speed">{playbackSpeed}x</button>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
              <span className="truncate" title={effectiveAudioTitle}>{effectiveAudioTitle}</span>
              {getSharepointAudioUrl(selectedBook, selectedTestNumber, currentPart) && (
                <a
                  href={getSharepointAudioUrl(selectedBook, selectedTestNumber, currentPart)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-rose-400 hover:text-rose-300 underline"
                  title="Open direct file in SharePoint"
                >
                  SharePoint ↗
                </a>
              )}
            </div>
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
              <div role="alert" className="space-y-2 rounded-lg border border-rose-800/80 bg-rose-950/70 p-2.5 text-[11px] text-rose-200">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-rose-300">⚠️ Could not stream Part {currentPart} online</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.src = effectiveAudioUrl
                        audioRef.current.load()
                      }
                    }}
                    className="shrink-0 rounded border border-rose-700 bg-rose-900/60 px-2 py-0.5 text-[10px] text-rose-200 hover:bg-rose-800"
                  >
                    Retry
                  </button>
                </div>
                <p className="text-[10px] leading-relaxed text-rose-300/80">
                  SharePoint streams from institutional accounts require university sign-in or restrict cross-origin playback in external web apps.
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {getSharepointAudioUrl(selectedBook, selectedTestNumber, currentPart) && (
                    <a
                      href={getSharepointAudioUrl(selectedBook, selectedTestNumber, currentPart)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-rose-600 px-2 py-1 text-[10px] font-bold text-white transition hover:bg-rose-500"
                    >
                      <span>↗ Open in SharePoint / Download</span>
                    </a>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-200 transition hover:border-slate-400 hover:text-white">
                    <span>📁 Select Local MP3 from Database</span>
                    <input
                      className="sr-only"
                      type="file"
                      accept="audio/*"
                      onChange={event => {
                        const file = event.target.files?.[0]
                        if (file) {
                          onAudioFile(file)
                          setAudioError(false)
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </section>
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

            {selectedTestNumber === 2 ? (
              <section className="space-y-4 rounded-2xl border border-slate-800/90 bg-[#0F172A] p-4 shadow-xl sm:p-6">
                <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
                  <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400">
                    {LISTENING_PARTS_2[currentPart - 1]?.title}
                  </h2>
                </div>
                <div className="space-y-4">
                  {LISTENING_PARTS_2[currentPart - 1]?.questions.map(q => {
                    const pair = listeningPairs(selectedTestNumber).find(([a, b]) => a === q.id || b === q.id)
                    const pairAnswers = pair
                      ? [answers[pair[0]]?.toUpperCase(), answers[pair[1]]?.toUpperCase()].filter(Boolean)
                      : []
                    return (
                      <div key={q.id} id={`listening-question-${q.id}`} className={`rounded-xl border p-4 transition ${currentQ === q.id ? 'border-rose-500/80 bg-[#111C30] shadow-[0_0_15px_rgba(225,29,72,0.12)]' : 'border-slate-800/70 bg-[#090E17]/80'}`}>
                        <div className="mb-2 text-sm font-semibold text-slate-100">{q.id}. {q.prompt}</div>
                        {q.instruction && <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-amber-400/80">{q.instruction}</div>}
                        {pair && (
                          <div className="mb-3 flex items-center gap-2 text-xs text-rose-300">
                            <span className="font-mono text-[10px] uppercase tracking-wider bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 rounded">
                              Connected Questions {pair[0]} & {pair[1]}
                            </span>
                            <span>Selected: {pairAnswers.join(', ') || '(Choose TWO)'}</span>
                          </div>
                        )}
                        {q.options && (
                          <div className="mb-4 grid gap-2 sm:grid-cols-1">
                            {q.options.map(opt => {
                              const letterMatch = opt.match(/^([A-Z])\b/)
                              const optLetter = letterMatch ? letterMatch[1] : ''
                              const isSelected = pair
                                ? pairAnswers.includes(optLetter)
                                : !!optLetter && answers[q.id]?.toUpperCase() === optLetter
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    if (!optLetter) return
                                    if (pair) {
                                      const [firstId, secondId] = pair
                                      const isCurrentlyFirst = answers[firstId]?.toUpperCase() === optLetter
                                      const isCurrentlySecond = answers[secondId]?.toUpperCase() === optLetter
                                      if (isCurrentlyFirst) {
                                        setAnswer(firstId, '')
                                      } else if (isCurrentlySecond) {
                                        setAnswer(secondId, '')
                                      } else if (!answers[firstId]) {
                                        setAnswer(firstId, optLetter)
                                        setCurrentQ(firstId)
                                      } else if (!answers[secondId]) {
                                        setAnswer(secondId, optLetter)
                                        setCurrentQ(secondId)
                                      } else {
                                        const targetId = q.id === firstId ? firstId : secondId
                                        setAnswer(targetId, optLetter)
                                        setCurrentQ(targetId)
                                      }
                                    } else {
                                      const currentVal = answers[q.id]?.toUpperCase()
                                      setAnswer(q.id, currentVal === optLetter ? '' : optLetter)
                                      setCurrentQ(q.id)
                                    }
                                  }}
                                  className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                                    isSelected
                                      ? 'border-rose-500/80 bg-rose-500/20 text-rose-200 shadow-sm font-semibold'
                                      : 'border-slate-700 bg-[#111A2E] text-slate-300 hover:border-slate-500 hover:bg-[#16233d]'
                                  }`}
                                >
                                  {opt}
                                </button>
                              )
                            })}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs text-slate-400">Your Answer:</span>
                          <input aria-label={`Answer ${q.id}`} type="text" value={answers[q.id] || ''} onFocus={() => setCurrentQ(q.id)} onChange={event => setAnswer(q.id, event.target.value)} className="w-full max-w-[200px] border-b border-dashed border-slate-600 bg-[#0A101C] px-2 py-1.5 font-mono text-sm font-bold text-rose-300 placeholder-slate-600 focus:border-rose-400 focus:outline-none" placeholder="..." />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ) : (
              <>
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
            </>
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
  selectedTestNumber?: number
  customPassages?: ReadingPassage[]
  onFinish: () => void
}

function ReadingExam({ answers, setAnswers, currentQ, setCurrentQ, timeLeft, part, selectedTestNumber = 1, customPassages, onFinish }: ReadingExamProps) {
  const [mobileView, setMobileView] = useState<'passage' | 'questions'>('passage')
  const activePassages = customPassages && customPassages.length > 0 ? customPassages : selectedTestNumber === 21 ? READING_PASSAGES_21 : selectedTestNumber === 4 ? READING_PASSAGES_4 : selectedTestNumber === 3 ? READING_PASSAGES_3 : selectedTestNumber === 2 ? READING_PASSAGES_2 : READING_PASSAGES
  const passageIndex = part !== undefined ? part - 1 : currentQ <= 13 ? 0 : currentQ <= 26 ? 1 : 2
  const passage = activePassages[passageIndex] || activePassages[0]
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
  const optionValue = (option: string) => {
    const match = option.match(/^([A-I]|(?:i|ii|iii|iv|v|vi|vii|viii|ix|x))\s*·/)
    return match ? match[1] : option
  }
  const rPairs = readingPairs(selectedTestNumber)

  // Dynamically detect if current question references a specific paragraph
  const currentQuestionObj = passage.questions.find(q => q.id === currentQ)
  const activeParagraphLetter = useMemo(() => {
    if (!currentQuestionObj) return null
    const promptMatch = currentQuestionObj.prompt.match(/(?:paragraph|section)\s+([A-G])\b/i)
    if (promptMatch) return promptMatch[1].toUpperCase()
    const refMatch = currentQuestionObj.passageReference?.match(/(?:paragraph|section)\s+([A-G])\b/i)
    if (refMatch) return refMatch[1].toUpperCase()
    return null
  }, [currentQuestionObj])

  return (
    <main className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col bg-surface">
      <header className="flex min-h-14 items-center justify-between border-b border-divider bg-surface px-4">
        <div className="flex items-center gap-5">
          <div className="border-r border-divider pr-5 font-plex text-2xl font-bold tracking-tight text-accent">IELTS</div>
          <div>
            <div className="font-plex text-xs font-semibold text-ink">Test taker ID</div>
            <div className="font-plex text-xs text-graphite-mid">Academic Reading · Test {selectedTestNumber}{part ? ` · Passage ${part}` : ''}</div>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-center gap-1 min-w-[200px]">
          <div className="flex justify-between w-full font-mono text-[11px] text-graphite-mid">
            <span>Answered: <strong className="text-ink">{answered}/{totalQuestions}</strong></span>
            <span>{Math.round((answered / (totalQuestions || 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-divider/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (answered / (totalQuestions || 1)) * 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="text-right">
            <div className={`font-mono text-sm font-semibold ${timeLeft < 300 ? 'text-accent' : 'text-ink'}`}>{formatTime(timeLeft)}</div>
            <div className="font-mono text-xs uppercase text-graphite-light">Time left</div>
          </div>
          <ThemeToggle className="h-9 w-9 rounded-sm border-divider bg-surface text-ink hover:border-line-strong" />
          <button onClick={onFinish} className="rounded-sm bg-navy px-4 py-2 font-plex text-xs font-semibold text-white">Finish</button>
        </div>
      </header>

      <div className="border-b border-divider bg-paper-dark px-4 py-3">
        <h1 className="font-plex text-sm font-bold text-ink">Part {passage.part}</h1>
        <p className="mt-1 font-plex text-sm text-ink">Read the text and answer questions {passage.range[0]}–{passage.range[1]}.</p>
      </div>

      {/* Mobile / Phone Viewport Switcher */}
      <div className="flex md:hidden border-b border-divider bg-surface px-4 py-2 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setMobileView('passage')}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-mono font-semibold transition-colors ${
            mobileView === 'passage' ? 'bg-electric text-white' : 'bg-surface-2 text-graphite hover:text-ink'
          }`}
        >
          📖 Reading Passage
        </button>
        <button
          type="button"
          onClick={() => setMobileView('questions')}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-mono font-semibold transition-colors ${
            mobileView === 'questions' ? 'bg-electric text-white' : 'bg-surface-2 text-graphite hover:text-ink'
          }`}
        >
          ✍️ Questions ({answered}/{totalQuestions})
        </button>
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-2 overflow-hidden">
        <article className={`overflow-y-auto border-b border-divider p-4 sm:p-5 md:border-b-0 md:border-r md:p-7 ${mobileView === 'questions' ? 'hidden md:block' : 'block'}`}>
          <div className="mx-auto max-w-3xl">
            <h2 className="font-plex text-xl font-bold text-ink">{passage.title}</h2>
            {passage.subtitle && <p className="mt-2 font-plex text-sm font-semibold italic leading-6 text-graphite">{passage.subtitle}</p>}
            <div className="mt-5 space-y-5 font-plex text-sm leading-7 text-ink">
              {passage.paragraphs.map((paragraph, index) => {
                const match = paragraph.match(/^([A-Z]\.)\s+([\s\S]*)$/)
                const isParagraphActive = match && activeParagraphLetter === match[1][0].toUpperCase()
                if (match) {
                  const label = match[1]
                  return (
                    <p
                      key={index}
                      id={`reading-paragraph-${match[1][0]}`}
                      className={`whitespace-pre-line transition-all duration-300 ${
                        isParagraphActive
                          ? 'border-l-4 border-electric pl-3 bg-electric/5 rounded-r py-1 ring-1 ring-electric/20'
                          : ''
                      }`}
                    >
                      <strong className={`mr-2 inline-block font-bold ${isParagraphActive ? 'text-accent' : 'text-ink'}`}>
                        {label}
                      </strong>
                      {match[2]}
                    </p>
                  )
                }
                return <p key={index} className="whitespace-pre-line">{paragraph}</p>
              })}
            </div>
          </div>
        </article>

        <section className={`overflow-y-auto p-4 sm:p-5 md:p-7 ${mobileView === 'passage' ? 'hidden md:block' : 'block'}`}>
          <div className="mx-auto max-w-3xl space-y-7">
            {passage.questions.map((question, index) => {
              const previous = passage.questions[index - 1]
              const showHeading = index === 0 || previous.kind !== question.kind || previous.instruction !== question.instruction
              let groupEndId = question.id
              if (showHeading) {
                let i = index
                while (
                  i + 1 < passage.questions.length &&
                  passage.questions[i + 1].kind === question.kind &&
                  passage.questions[i + 1].instruction === question.instruction
                ) {
                  i++
                }
                groupEndId = passage.questions[i].id
              }
              const pair = rPairs.find(([a, b]) => a === question.id || b === question.id)
              const pairSelectedValues = pair
                ? [answers[pair[0]]?.toUpperCase(), answers[pair[1]]?.toUpperCase()].filter(Boolean)
                : []

              return (
                <div
                  key={question.id}
                  id={`reading-question-${question.id}`}
                  onClick={() => setCurrentQ(question.id)}
                  className={`scroll-mt-4 rounded-sm p-3 transition-all ${
                    currentQ === question.id
                      ? 'border-l-4 border-electric bg-surface-2/60 shadow-sm'
                      : 'border-l-4 border-transparent hover:bg-surface-2/30'
                  }`}
                >
                  {showHeading && (
                    <div className="mb-4">
                      <h3 className="font-plex text-sm font-bold text-ink">Questions {question.id}{groupEndId > question.id ? `–${groupEndId}` : ''}</h3>
                      <p className="mt-1 font-plex text-xs leading-5 text-graphite-mid">
                        {question.kind === 'text' ? `Complete each answer. Write ${question.instruction}.` : question.options?.includes('TRUE') ? 'Choose TRUE, FALSE or NOT GIVEN.' : question.options?.includes('YES') ? 'Choose YES, NO or NOT GIVEN.' : 'Choose the correct option.'}
                      </p>
                    </div>
                  )}
                  <div className="font-plex text-sm font-semibold leading-6 text-ink"><span className="mr-2 font-mono">{question.id}</span>{question.prompt}</div>
                  {pair && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-graphite-mid">
                      <span className="font-mono text-[10px] uppercase tracking-wider bg-electric/10 text-accent border border-electric/30 px-2 py-0.5 rounded">
                        Connected Questions {pair[0]} & {pair[1]}
                      </span>
                      <span>Selected: {pairSelectedValues.join(', ') || '(Choose TWO)'}</span>
                    </div>
                  )}
                  {question.kind === 'text' ? (
                    <input aria-label={`Reading answer ${question.id}`} value={answers[question.id] || ''} onFocus={() => setCurrentQ(question.id)} onChange={event => setAnswer(question.id, event.target.value)} className="mt-3 w-full max-w-sm rounded-sm border border-graphite-light bg-surface px-3 py-2 font-plex text-sm outline-none focus:border-electric focus:ring-1 focus:ring-electric" placeholder="Type your answer" />
                  ) : pair ? (
                    <div className="mt-3 space-y-2">
                      {question.options?.map(option => {
                        const val = optionValue(option).toUpperCase()
                        const isChecked = pairSelectedValues.includes(val)
                        const togglePair = () => {
                          const [firstId, secondId] = pair
                          const isFirst = answers[firstId]?.toUpperCase() === val
                          const isSecond = answers[secondId]?.toUpperCase() === val
                          if (isFirst) {
                            setAnswer(firstId, '')
                          } else if (isSecond) {
                            setAnswer(secondId, '')
                          } else if (!answers[firstId]) {
                            setAnswer(firstId, val)
                            setCurrentQ(firstId)
                          } else if (!answers[secondId]) {
                            setAnswer(secondId, val)
                            setCurrentQ(secondId)
                          } else {
                            const targetId = question.id === firstId ? firstId : secondId
                            setAnswer(targetId, val)
                            setCurrentQ(targetId)
                          }
                        }
                        return (
                          <div
                            key={option}
                            onClick={togglePair}
                            className={`flex cursor-pointer items-start gap-3 rounded-sm border px-3 py-2 font-plex text-sm transition ${
                              isChecked ? 'border-electric bg-electric-dim' : 'border-transparent hover:bg-surface-2'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="mt-1 accent-electric pointer-events-none"
                            />
                            <span>{option}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : question.options && question.options.length > 7 ? (
                    <select aria-label={`Reading answer ${question.id}`} value={answers[question.id] || ''} onFocus={() => setCurrentQ(question.id)} onChange={event => setAnswer(question.id, event.target.value)} className="mt-3 w-full rounded-sm border border-graphite-light bg-surface px-3 py-2 font-plex text-sm">
                      <option value="">Select an answer</option>
                      {question.options.map(option => <option key={option} value={optionValue(option)}>{option}</option>)}
                    </select>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {question.options?.map(option => {
                        const value = optionValue(option)
                        return (
                          <label key={option} onClick={() => setCurrentQ(question.id)} className={`flex cursor-pointer items-start gap-3 rounded-sm border px-3 py-2 font-plex text-sm transition ${answers[question.id] === value ? 'border-electric bg-electric-dim' : 'border-transparent hover:bg-surface-2'}`}>
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
                  setMobileView('questions')
                  window.setTimeout(() => document.getElementById(`reading-question-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
                }} className={`h-7 w-7 rounded-sm border font-mono text-xs ${currentQ === id ? 'border-electric bg-surface text-accent' : answers[id] ? 'border-success bg-success-soft text-positive' : 'border-transparent text-ink'}`}>{id}</button>
              ))}
            </div>
            <span className="hidden whitespace-nowrap font-mono text-xs text-graphite-mid lg:inline">{answered}/{totalQuestions} answered</span>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Previous reading passage" disabled={passage.part === 1 || part !== undefined || !activePassages[passageIndex - 1]} onClick={() => setCurrentQ(activePassages[passageIndex - 1].range[0])} className="h-11 w-11 rounded-sm bg-divider font-plex text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">←</button>
            <button aria-label="Next reading passage" disabled={passage.part === activePassages.length || part !== undefined || !activePassages[passageIndex + 1]} onClick={() => setCurrentQ(activePassages[passageIndex + 1].range[0])} className="h-11 w-11 rounded-sm bg-navy font-plex text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">→</button>
          </div>
        </div>
        <div className="mt-2 flex gap-4 border-t border-divider pt-2">
          {activePassages.filter(item => part === undefined || item.part === part).map(item => (
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
  selectedTestNumber?: number
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

function WritingChart2() {
  const series = [
    { name: 'Less than $25,000', values: [25, 29, 28], color: '#334155' },
    { name: '$25,000–$49,999', values: [27, 30, 29], color: '#f8fafc' },
    { name: '$50,000–$74,999', values: [21, 21, 21], color: '#cbd5e1' },
    { name: '$75,000–$99,999', values: [14, 14, 15], color: '#94a3b8' },
    { name: '$100,000 or more', values: [29, 28, 33], color: '#475569' },
  ]
  const years = ['2007', '2011', '2015']
  const y = (val: number) => 240 - (val / 35) * 200

  return (
    <svg viewBox="0 0 600 320" role="img" aria-label="Bar chart showing the number of US households by annual income" className="mx-auto mt-6 w-full max-w-2xl bg-surface">
      <text x="300" y="24" textAnchor="middle" className="fill-ink font-plex text-sm font-semibold">Number of US households (in millions), by annual income</text>
      {[0, 5, 10, 15, 20, 25, 30, 35].map(value => (
        <g key={value}>
          <line x1="50" x2="580" y1={y(value)} y2={y(value)} className="stroke-divider" />
          <text x="40" y={y(value) + 4} textAnchor="end" className="fill-graphite-mid font-mono text-xs">{value}</text>
        </g>
      ))}
      <line x1="50" x2="50" y1="40" y2="240" className="stroke-ink" />
      <text x="20" y="140" transform="rotate(-90, 20, 140)" textAnchor="middle" className="fill-ink font-plex text-sm font-semibold">Number of households (millions)</text>
      
      {years.map((year, i) => {
        const xOffset = 90 + i * 160
        return (
          <g key={year}>
            <text x={xOffset + 60} y="260" textAnchor="middle" className="fill-graphite-mid font-mono text-sm">{year}</text>
            {series.map((s, j) => {
              const val = s.values[i]
              const barHeight = (val / 35) * 200
              return (
                <rect key={j} x={xOffset + j * 24} y={y(val)} width="20" height={barHeight} fill={s.color} stroke="#1e293b" />
              )
            })}
          </g>
        )
      })}
      
      <g transform="translate(50, 290)">
        {series.map((s, i) => (
          <g key={i} transform={`translate(${i * 105}, 0)`}>
            <rect x="0" y="-8" width="12" height="12" fill={s.color} stroke="#1e293b" />
            <text x="16" y="2" className="fill-graphite-mid font-mono text-[9px]">{s.name}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

function WritingExam({ answers, setAnswers, currentTask, setCurrentTask, timeLeft, part, selectedTestNumber = 1, onFinish }: WritingExamProps) {
  const [mobileWritingView, setMobileWritingView] = useState<'prompt' | 'editor'>('editor')
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
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="text-right"><div className={`font-mono text-sm font-semibold ${timeLeft < 300 ? 'text-accent' : 'text-ink'}`}>{formatTime(timeLeft)}</div><div className="font-mono text-xs uppercase text-graphite-light">Time left</div></div>
          <ThemeToggle className="h-9 w-9 rounded-sm border-divider bg-surface text-ink hover:border-line-strong" />
          <button onClick={onFinish} className="rounded-sm bg-navy px-4 py-2 font-plex text-xs font-semibold text-white">Finish</button>
        </div>
      </header>

      <div className="border-b border-divider bg-paper-dark px-4 py-3">
        <h1 className="font-plex text-sm font-bold text-ink">Task {task}</h1>
        <p className="mt-1 font-plex text-sm text-ink">You should spend about {task === 1 ? '20' : '40'} minutes on this task. Write at least {minimumWords} words.</p>
      </div>

      {/* Mobile Viewport Switcher */}
      <div className="flex md:hidden border-b border-divider bg-surface px-4 py-2 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setMobileWritingView('prompt')}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-mono font-semibold transition-colors ${
            mobileWritingView === 'prompt' ? 'bg-electric text-white' : 'bg-surface-2 text-graphite hover:text-ink'
          }`}
        >
          📋 Task Instructions
        </button>
        <button
          type="button"
          onClick={() => setMobileWritingView('editor')}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-mono font-semibold transition-colors ${
            mobileWritingView === 'editor' ? 'bg-electric text-white' : 'bg-surface-2 text-graphite hover:text-ink'
          }`}
        >
          ✍️ Your Essay ({wordCount} words)
        </button>
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-2 overflow-hidden">
        <article className={`overflow-y-auto border-b border-divider p-4 sm:p-5 md:border-b-0 md:border-r md:p-7 ${mobileWritingView === 'editor' ? 'hidden md:block' : 'block'}`}>
          <div className="mx-auto max-w-3xl font-plex text-sm leading-7 text-ink">
            {task === 1 ? (
              selectedTestNumber === 2 ? (
                <>
                  <p className="font-semibold">The chart below shows the number of households in the US by their annual income in 2007, 2011 and 2015.</p>
                  <p className="mt-4 font-semibold">Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
                  <WritingChart2 />
                </>
              ) : (
                <>
                  <p className="font-semibold">The graph below gives information about the number of jobs in four sectors of the economy in the US between 1960 and 2020.</p>
                  <p className="mt-4 font-semibold">Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
                  <WritingChart />
                </>
              )
            ) : (
              selectedTestNumber === 2 ? (
                <>
                  <p>You should write about the following topic:</p>
                  <div className="mt-5 border-y border-divider bg-surface-2 p-6">
                    <p className="font-plex text-lg font-semibold leading-8 text-ink">Some university students want to learn about other subjects in addition to their main subjects. Others believe it is more important to give all their time and attention to studying for a qualification.</p>
                    <p className="mt-4 font-plex text-base font-semibold text-ink">Discuss both these views and give your own opinion.</p>
                  </div>
                  <p className="mt-5">Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
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
              )
            )}
          </div>
        </article>

        <section className={`min-h-0 overflow-y-auto bg-surface p-4 md:p-6 ${mobileWritingView === 'prompt' ? 'hidden md:block' : 'block'}`}>
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
  selectedTestNumber?: number
  onRecording?: (part: number, recording: Blob) => void
  onFinishSpeaking?: (data: {
    recordings: Record<number, string>
    transcripts: Record<number, string>
    durations: Record<number, number>
    blobs: Record<number, Blob>
  }) => void
  onFinish: () => void
}

const SPEAKING_CONTENT_2: Record<number, SpeakingContentItem> = {
  1: {
    label: 'Introduction and interview',
    title: 'Science',
    intro: 'The examiner asks you about yourself, your home, work or studies and other familiar topics.',
    questions: [
      'Did you like studying science when you were at school? [Why/Why not?]',
      'What do you remember about your science teachers at school?',
      'How interested are you in science now? [Why/Why not?]',
      'What do you think has been an important recent scientific development? [Why?]',
    ],
  },
  2: {
    label: 'Individual long turn',
    title: 'Describe a tourist attraction in your country that you would recommend.',
    intro: 'You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.',
    subheading: 'You should say:',
    questions: [
      'what the tourist attraction is',
      'where in your country this tourist attraction is',
      'what visitors can see and do at this tourist attraction',
      'and explain why you would recommend this tourist attraction.',
    ],
  },
  3: {
    label: 'Two-way discussion',
    title: 'Museums & Holidays',
    intro: 'Discussion topics:',
    questions: [],
    topics: [
      {
        title: 'Museums and art galleries',
        questions: [
          'What are the most popular museums and art galleries in ... / where you live?',
          'Do you believe that all museums and art galleries should be free?',
          'What kinds of things make a museum or art gallery an interesting place to visit?',
        ]
      },
      {
        title: 'The holiday industry',
        questions: [
          'Why, do you think, do some people book package holidays rather than travelling independently?',
          'Would you say that large numbers of tourists cause problems for local people?',
          'What sort of impact can large holiday resorts have on the environment?',
        ]
      }
    ]
  },
}

type SpeakingTopic = {
  title: string
  questions: string[]
}

type SpeakingContentItem = {
  label: string
  title: string
  intro: string
  subheading?: string
  topics?: SpeakingTopic[]
  questions: string[]
}

const SPEAKING_CONTENT: Record<number, SpeakingContentItem> = {
  1: {
    label: 'Introduction and interview',
    title: 'Paying bills',
    intro: 'The examiner asks you about yourself, your home, work or studies and other familiar topics.',
    questions: [
      'What kinds of bills do you have to pay?',
      'How do you usually pay your bills – in cash or by another method? [Why?]',
      'Have you ever forgotten to pay a bill? [Why/Why not?]',
      'Is there anything you could do to make your bills cheaper? [Why/Why not?]',
    ],
  },
  2: {
    label: 'Individual long turn',
    title: 'Describe some food or drink that you learned to prepare.',
    intro: 'You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.',
    subheading: 'You should say:',
    questions: [
      'what food or drink you learned to prepare',
      'when and where you learned to prepare this',
      'how you learned to prepare this',
      'and explain how you felt about learning to prepare this food or drink.',
    ],
  },
  3: {
    label: 'Two-way discussion',
    title: 'Discussion topics: Food and cooking',
    intro: 'Discuss the following questions in greater depth, giving reasons and examples.',
    topics: [
      {
        title: 'Young people and cooking',
        questions: [
          'What kinds of things can children learn to cook?',
          'Do you think it is important for children to learn to cook?',
          'Do you think young people should learn to cook at home or at school?',
        ],
      },
      {
        title: 'Working as a chef',
        questions: [
          'How enjoyable do you think it would be to work as a professional chef?',
          'What skills does a person need to be a great chef?',
          'How much influence do celebrity/TV chefs have on what ordinary people cook?',
        ],
      },
    ],
    questions: [
      'What kinds of things can children learn to cook?',
      'Do you think it is important for children to learn to cook?',
      'Do you think young people should learn to cook at home or at school?',
      'How enjoyable do you think it would be to work as a professional chef?',
      'What skills does a person need to be a great chef?',
      'How much influence do celebrity/TV chefs have on what ordinary people cook?',
    ],
  },
}

function SpeakingExam({ currentPart, setCurrentPart, timeLeft, part, onRecording, onFinishSpeaking, onFinish, selectedTestNumber = 1 }: SpeakingExamProps) {
  const activePart = part ?? currentPart
  const activeContent = selectedTestNumber === 2 ? SPEAKING_CONTENT_2 : SPEAKING_CONTENT
  const content = activeContent[activePart] ?? activeContent[1]
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const blobsRef = useRef<Record<number, Blob>>({})
  // Refs mirror the latest recording data so finishing (including on timeout) never reads stale state
  const recordingsRef = useRef<Record<number, string>>({})
  const transcriptsRef = useRef<Record<number, string>>({})
  const durationsRef = useRef<Record<number, number>>({})
  const recordingRef = useRef(false)
  const recordingPartRef = useRef(1)
  const startedAtRef = useRef(0)
  const recorderStoppedRef = useRef<Promise<void> | null>(null)
  const recognitionEndedRef = useRef<Promise<void> | null>(null)
  const finishedRef = useRef(false)

  const [recording, setRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordings, setRecordings] = useState<Record<number, string>>({})
  const [transcripts, setTranscripts] = useState<Record<number, string>>({})
  const [durations, setDurations] = useState<Record<number, number>>({})
  const [interimText, setInterimText] = useState('')
  const [speechSupported, setSpeechSupported] = useState(true)
  const [microphoneError, setMicrophoneError] = useState('')
  const [prepLeft, setPrepLeft] = useState(0)

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      setSpeechSupported(false)
    }
  }, [])

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
    recordingRef.current = false
    const rec = recognitionRef.current
    recognitionRef.current = null
    streamRef.current?.getTracks().forEach(track => track.stop())
    if (rec) {
      try { rec.stop() } catch {}
    }
  }, [])

  const setTranscript = (partNumber: number, text: string) => {
    transcriptsRef.current = { ...transcriptsRef.current, [partNumber]: text }
    setTranscripts(transcriptsRef.current)
  }

  const setDuration = (partNumber: number, seconds: number) => {
    durationsRef.current = { ...durationsRef.current, [partNumber]: seconds }
    setDurations(durationsRef.current)
  }

  const setRecordingUrl = (partNumber: number, url: string) => {
    if (recordingsRef.current[partNumber]) URL.revokeObjectURL(recordingsRef.current[partNumber])
    recordingsRef.current = { ...recordingsRef.current, [partNumber]: url }
    setRecordings(recordingsRef.current)
  }

  const startRecording = async () => {
    const recordingPart = activePart
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

      recorderStoppedRef.current = new Promise(resolve => {
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
          blobsRef.current[recordingPart] = blob
          setRecordingUrl(recordingPart, URL.createObjectURL(blob))
          onRecording?.(recordingPart, blob)
          stream.getTracks().forEach(track => track.stop())
          resolve()
        }
      })

      // A new take replaces the previous transcript for this part
      setTranscript(recordingPart, '')
      setRecordingSeconds(0)
      recordingPartRef.current = recordingPart
      startedAtRef.current = Date.now()
      recordingRef.current = true
      recorder.start()
      setRecording(true)

      // Start Web Speech Recognition
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRec) {
        try {
          const rec = new SpeechRec()
          rec.continuous = true
          rec.interimResults = true
          rec.lang = 'en-US'

          rec.onresult = (e: any) => {
            let finalChunk = ''
            let interimChunk = ''
            for (let i = e.resultIndex; i < e.results.length; i++) {
              const res = e.results[i]
              if (res.isFinal) {
                finalChunk += res[0].transcript + ' '
              } else {
                interimChunk += res[0].transcript
              }
            }
            if (finalChunk) {
              const previous = (transcriptsRef.current[recordingPart] || '').trim()
              setTranscript(recordingPart, (previous ? previous + ' ' : '') + finalChunk.trim())
            }
            setInterimText(interimChunk)
          }

          rec.onerror = (e: any) => {
            console.warn('[SpeechRecognition]:', e.error)
            // Don't keep restarting when the browser refuses or can't reach the speech service
            if (['not-allowed', 'service-not-allowed', 'audio-capture', 'network'].includes(e.error) && recognitionRef.current === rec) {
              recognitionRef.current = null
            }
          }

          recognitionEndedRef.current = new Promise(resolve => {
            rec.onend = () => {
              // Chrome ends recognition after a pause, so keep listening while the recording continues
              if (recordingRef.current && recognitionRef.current === rec) {
                try {
                  rec.start()
                  return
                } catch {}
              }
              resolve()
            }
          })

          rec.start()
          recognitionRef.current = rec
        } catch (recErr) {
          console.warn('[SpeechRec init failed]:', recErr)
        }
      }
    } catch {
      setMicrophoneError('Microphone access was blocked. Allow microphone access in your browser and try again.')
    }
  }

  const stopRecording = async () => {
    if (!recordingRef.current) return
    recordingRef.current = false
    setDuration(recordingPartRef.current, Math.round((Date.now() - startedAtRef.current) / 1000))
    const rec = recognitionRef.current
    recognitionRef.current = null
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    if (rec) {
      try { rec.stop() } catch {}
    }
    setInterimText('')
    setRecording(false)
    // Wait for the last audio chunk and final speech results, without hanging if the browser never reports them
    await Promise.race([
      Promise.all([recorderStoppedRef.current, rec ? recognitionEndedRef.current : null]),
      new Promise(resolve => window.setTimeout(resolve, 2500)),
    ])
  }

  const handleUploadAudio = (file?: File) => {
    if (!file) return
    blobsRef.current[activePart] = file
    setRecordingUrl(activePart, URL.createObjectURL(file))
    onRecording?.(activePart, file)
    setDuration(activePart, 60)
  }

  const changePart = (nextPart: number) => {
    void stopRecording()
    setPrepLeft(0)
    setCurrentPart(nextPart)
  }

  const handleFinishExam = async () => {
    if (finishedRef.current) return
    finishedRef.current = true
    await stopRecording()
    onFinishSpeaking?.({
      recordings: recordingsRef.current,
      transcripts: transcriptsRef.current,
      durations: durationsRef.current,
      blobs: blobsRef.current
    })
    onFinish()
  }

  // Submit automatically when time runs out, keeping any recording in progress
  useEffect(() => {
    if (timeLeft <= 0) void handleFinishExam()
  }, [timeLeft])

  const currentWords = (transcripts[activePart] || '').trim().split(/\s+/).filter(Boolean).length
  const currentDuration = durations[activePart] || (recording ? recordingSeconds : 0)
  const currentWpm = currentDuration > 0 ? Math.round((currentWords / currentDuration) * 60) : 0

  return (
    <main className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col bg-paper">
      <header className="flex min-h-14 items-center justify-between border-b border-divider bg-surface px-4">
        <div className="flex items-center gap-5">
          <div className="border-r border-divider pr-5 font-plex text-2xl font-bold tracking-tight text-accent">IELTS</div>
          <div><div className="font-plex text-xs font-semibold text-ink">Test taker ID</div><div className="font-plex text-xs text-graphite-mid">Speaking · Test 1{part ? ` · Part ${part}` : ''}</div></div>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="text-right"><div className={`font-mono text-sm font-semibold ${timeLeft < 60 ? 'text-accent' : 'text-ink'}`}>{formatTime(timeLeft)}</div><div className="font-mono text-xs uppercase text-graphite-light">Time left</div></div>
          <ThemeToggle className="h-9 w-9 rounded-sm border-divider bg-surface text-ink hover:border-line-strong" />
          <button disabled={recording} onClick={handleFinishExam} className="rounded-sm bg-navy px-4 py-2 font-plex text-xs font-semibold text-white disabled:opacity-40">Finish</button>
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

          {content.topics ? (
            <div className="mt-6 space-y-6">
              {content.topics.map((topicGroup, topicIdx) => (
                <div key={topicGroup.title} className="rounded-sm border border-divider bg-paper-light/60 p-4">
                  <h3 className="font-plex text-sm font-bold text-ink">{topicGroup.title}</h3>
                  <div className="mt-1 font-plex text-xs italic text-graphite-mid">Example questions:</div>
                  <ul className="mt-3 space-y-2.5">
                    {topicGroup.questions.map((question, qIdx) => {
                      const overallNum = topicIdx === 0 ? qIdx + 1 : qIdx + 1 + (content.topics?.[0]?.questions.length ?? 0)
                      return (
                        <li key={question} className="flex gap-3 font-plex text-sm leading-6 text-ink">
                          <span className="font-mono text-xs font-semibold text-accent">{String(overallNum).padStart(2, '0')}</span>
                          <span>{question}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <>
              {content.subheading && (
                <p className="mt-6 font-plex text-sm font-semibold text-ink">{content.subheading}</p>
              )}
              <ul className={`${content.subheading ? 'mt-3' : 'mt-6'} space-y-3`}>
                {content.questions.map((question, index) => (
                  <li key={question} className="flex gap-3 font-plex text-sm leading-6 text-ink">
                    <span className="font-mono text-xs font-semibold text-accent">{String(index + 1).padStart(2, '0')}</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {activePart === 2 && (
            <div className="mt-7 border-t border-divider pt-5">
              <button disabled={prepLeft > 0 || recording} onClick={() => setPrepLeft(60)} className="rounded-sm border border-divider bg-surface px-4 py-2 font-plex text-sm font-semibold text-ink disabled:opacity-50">{prepLeft > 0 ? `Preparation: ${prepLeft}s` : 'Start 1-minute preparation'}</button>
              <p className="mt-2 font-plex text-xs text-graphite-mid">You may make notes on paper during preparation.</p>
            </div>
          )}
        </section>

        <aside className="theme-fixed flex flex-col gap-4 border border-divider bg-navy p-6 text-white">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-electric-light">Voice recorder · Part {activePart}</div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`h-3 w-3 rounded-full ${recording ? 'animate-pulse bg-danger' : recordings[activePart] ? 'bg-positive' : 'bg-navy-light'}`} />
                <span className="font-plex text-xs font-semibold">{recording ? 'Recording audio...' : recordings[activePart] ? 'Response recorded' : 'Ready to record'}</span>
              </div>
              <div className="font-mono text-xs text-graphite-light">
                {currentDuration > 0 ? `${currentDuration}s` : '0s'}
              </div>
            </div>
            <div className="mt-2 font-mono text-3xl font-bold">{formatTime(recording ? recordingSeconds : (durations[activePart] || 0))}</div>

            {recording ? (
              <button onClick={stopRecording} className="mt-4 w-full rounded-sm bg-danger px-4 py-2.5 font-plex text-xs font-bold uppercase tracking-wider text-white hover:bg-danger/90">■ Stop recording</button>
            ) : (
              <button onClick={startRecording} className="mt-4 w-full rounded-sm bg-electric px-4 py-2.5 font-plex text-xs font-bold uppercase tracking-wider text-white hover:bg-electric/90">● Start recording</button>
            )}

            {microphoneError && <p className="mt-3 border border-danger/40 bg-danger/20 p-2.5 font-plex text-xs leading-5 text-white">{microphoneError}</p>}

            {recordings[activePart] && !recording && (
              <div className="mt-4 border-t border-navy-light pt-3">
                <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] uppercase text-graphite-light">
                  <span>Audio Playback</span>
                  <span className="text-positive">✓ Captured</span>
                </div>
                <audio controls src={recordings[activePart]} className="w-full h-8" />
                <button onClick={startRecording} className="mt-2 font-plex text-xs text-electric-light hover:text-white">Record this part again</button>
              </div>
            )}
          </div>

          {/* AI Voice Transcript & Speech-To-Text */}
          <div className="mt-2 border-t border-navy-light pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-electric-light">
                <span>AI Live Transcript</span>
                {recording && (
                  <span className="flex items-center gap-1 rounded-full bg-danger/20 px-2 py-0.5 text-[10px] text-danger animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-danger"></span>
                    Transcribing
                  </span>
                )}
              </div>
              <div className="font-mono text-[11px] text-graphite-light">
                {currentWords} words {currentWpm > 0 ? `· ${currentWpm} WPM` : ''}
              </div>
            </div>

            <p className="mt-1 text-[11px] text-graphite-light font-plex">
              {speechSupported
                ? 'Your voice is transcribed automatically into text for Puku AI evaluation.'
                : 'Microphone speech recognition is not supported in this browser. You can type or review your answer below:'}
            </p>

            <textarea
              value={transcripts[activePart] || ''}
              onChange={e => setTranscript(activePart, e.target.value)}
              placeholder={recording ? 'Listening... Speak into your microphone...' : 'Candidate speech transcript will appear here. You can also edit or paste words if needed.'}
              rows={4}
              className="mt-2 w-full rounded border border-navy-light bg-surface px-3 py-2 font-plex text-xs text-ink placeholder:text-graphite-light focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric"
            />

            {interimText && (
              <div className="mt-1.5 truncate font-plex text-xs italic text-electric-light animate-pulse">
                Hearing: &ldquo;{interimText}&rdquo;
              </div>
            )}

            <div className="mt-3 flex items-center justify-between text-[11px] text-graphite-light font-plex">
              <span className="text-graphite-mid">Part {activePart} of 3</span>
              <label className="cursor-pointer text-electric-light hover:text-white hover:underline">
                <span>Upload audio file</span>
                <input type="file" accept="audio/*" className="sr-only" onChange={e => handleUploadAudio(e.target.files?.[0])} />
              </label>
            </div>
          </div>
        </aside>
      </div>

      <footer className="flex items-center justify-between border-t border-divider bg-surface px-4 py-3">
        <div className="flex gap-4">
          {(part ? [part] : [1, 2, 3]).map(partNumber => (
            <button
              key={partNumber}
              onClick={() => changePart(partNumber)}
              className={`font-mono text-xs ${activePart === partNumber ? 'font-semibold text-accent' : 'text-graphite-mid'}`}
            >
              Part {partNumber} · {recordings[partNumber] ? 'recorded' : (transcripts[partNumber]?.trim() ? 'transcribed' : 'not started')}
            </button>
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
  const [soundTestError, setSoundTestError] = useState(false)
  const soundTestAudioRef = useRef<HTMLAudioElement | null>(null)
  const [fullModule, setFullModule] = useState<FullTestModule>('Listening')
  const [fullCompleted, setFullCompleted] = useState<FullTestModule[]>([])
  const [fullAttempt, setFullAttempt] = useState<FullTestAttempt>(emptyFullAttempt)
  const savedResultKey = useRef('')
  const [resultFilter, setResultFilter] = useState<'all' | 'incorrect' | 'correct'>('all')
  const [speakingData, setSpeakingData] = useState<{
    recordings: Record<number, string>
    transcripts: Record<number, string>
    durations: Record<number, number>
  } | null>(null)
  const [speakingEval, setSpeakingEval] = useState<SpeakingEvaluationResult | null>(null)
  const [speakingLoading, setSpeakingLoading] = useState(false)
  const [speakingError, setSpeakingError] = useState('')

  useEffect(() => {
    checkBackendHealth().then(status => {
      setBackendHealth(status)
      if (status.connected && !audioUrl) {
        setAudioUrl(getStreamUrl(selectedBook, selectedTestNum, 1))
        setAudioName(`IELTS ${selectedBook} · Test ${selectedTestNum} · Part 1 (Local Backend)`)
      }
    })
  }, [])

  const [completedCount, setCompletedCount] = useState<number>(0)
  const [bestOverall, setBestOverall] = useState<string>('—')

  useEffect(() => {
    fetchResults(user?.email, user?.id).then(results => {
      setCompletedCount(results.length)
      if (results.length > 0) {
        const scores = results.map(r => r.overallBand).filter((b): b is number => typeof b === 'number' && b > 0)
        if (scores.length > 0) {
          setBestOverall(Math.max(...scores).toFixed(1))
        }
      }
    }).catch(() => {})
  }, [user?.email, user?.id])

  // Synchronize stages with browser history so clicking browser back navigates between stages
  useEffect(() => {
    // Ensure initial entry has stage state
    if (!window.history.state || window.history.state.vistoraStage === undefined) {
      window.history.replaceState({ ...(window.history.state || {}), vistoraStage: stage }, '')
    }

    const handlePopState = (event: PopStateEvent) => {
      const targetStage = event.state?.vistoraStage
      if (targetStage) {
        setStage(targetStage)
        if (targetStage === 'select') {
          if (soundTestAudioRef.current) {
            soundTestAudioRef.current.pause()
            setSoundTestPlaying(false)
          }
        }
      } else if (stage !== 'select') {
        // Fallback: if browser popped to a history entry without stage state, return to select rather than leaving
        setStage('select')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [stage])

  const goToStage = (nextStage: 'select' | 'instructions' | 'test' | 'result') => {
    if (nextStage !== stage) {
      window.history.pushState({ ...(window.history.state || {}), vistoraStage: nextStage }, '')
      setStage(nextStage)
    }
  }

  // Sync book/test when test selection changes
  useEffect(() => {
    const book = selectedTest.book || '18'
    const testNum = selectedTest.testNumber || 1
    setSelectedBook(book)
    setSelectedTestNum(testNum)
    if (!audioUrl || !audioUrl.startsWith('blob:')) {
      setAudioUrl(getStreamUrl(book, testNum, 1))
      setAudioName(`IELTS ${book} · Test ${testNum} · Part 1`)
    }
  }, [selectedTest])

  const [customTests, setCustomTests] = useState<CustomTest[]>(() => getCustomTests())

  useEffect(() => {
    const handler = () => {
      setCustomTests(getCustomTests())
    }
    window.addEventListener('vistora:custom-tests-updated', handler)
    return () => window.removeEventListener('vistora:custom-tests-updated', handler)
  }, [])

  const allTests = useMemo(() => {
    const mappedCustom: Test[] = customTests.map(ct => ({
      id: ct.id,
      type: ct.type,
      module: ct.module,
      title: ct.title,
      questions: ct.passages.flatMap(p => p.questions).length || 40,
      duration: ct.duration || 60,
      difficulty: ct.difficulty || 'Custom Official Format',
      status: ct.status,
      part: ct.part,
      book: ct.book,
      testNumber: ct.testNumber,
    }))
    return [...mappedCustom, ...TESTS]
  }, [customTests])

  const activeCustomTest = useMemo(() => {
    return customTests.find(ct => ct.id === selectedTest.id) || null
  }, [customTests, selectedTest.id])

  const visibleTests = filter === 'All' ? allTests : allTests.filter(test => test.type === filter)
  const answered = Object.keys(answers).filter(key => answers[Number(key)]?.trim()).length
  const listeningScore = useMemo(() => {
    // Score against the test whose questions were shown, which follows the audio source selection
    const activeAnswers = selectedTestNum === 2 ? LISTENING_ANSWERS_2 : LISTENING_ANSWERS
    return countCorrect(markAnswers(activeAnswers, answers, listeningPairs(selectedTestNum)))
  }, [answers, selectedTestNum])

  const readingMarks = useMemo(() => {
    const activeAnswers = activeCustomTest ? activeCustomTest.answers : selectedTest.testNumber === 21 ? READING_ANSWERS_21 : selectedTest.testNumber === 4 ? READING_ANSWERS_4 : selectedTest.testNumber === 3 ? READING_ANSWERS_3 : selectedTest.testNumber === 2 ? READING_ANSWERS_2 : READING_ANSWERS
    return markAnswers(activeAnswers, answers, readingPairs(selectedTest.testNumber))
  }, [answers, selectedTest.testNumber, activeCustomTest])
  const readingScore = countCorrect(readingMarks)

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
    if (stage !== 'result' || selectedTest.type === 'Full Test' || selectedTest.type === 'Speaking') return
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
        : 'Writing response submitted. Connect the Gemini evaluation endpoint for criterion-level comments and a band estimate.'

    // The listening audio source can switch the test, so record the one that was actually taken
    const takenTestNumber = selectedTest.type === 'Listening' ? selectedTestNum : selectedTest.testNumber
    const listeningSwitched = selectedTest.type === 'Listening' && selectedTestNum !== selectedTest.testNumber
    const resultRecord = {
      id: `${selectedTest.id}-${Date.now()}`,
      userId: user?.id || '',
      userName: user?.name || 'Student',
      userEmail: user?.email || '',
      testTitle: listeningSwitched
        ? `IELTS ${selectedBook} — Listening Test ${selectedTestNum}${selectedTest.part ? ` · Part ${selectedTest.part}` : ''}`
        : selectedTest.title,
      testType: selectedTest.type,
      testNumber: takenTestNumber,
      part: selectedTest.part,
      completedAt: new Date().toISOString(),
      overallBand,
      skillBands: overallBand ? { [selectedTest.type]: overallBand } : {},
      correctAnswers,
      totalQuestions: isObjective ? selectedTest.questions : undefined,
      userAnswers: answers,
      comment,
      source: (isObjective ? 'Automatic' : 'Pending AI') as any,
    }

    saveExamResult(resultRecord as any, user?.email)
    saveExamResultApi(resultRecord as any).catch(() => {})
  }, [listeningScore, readingScore, selectedTest, selectedTestNum, selectedBook, stage, timeLeft, user, answers])

  const handleFinishSpeaking = async (data: {
    recordings: Record<number, string>
    transcripts: Record<number, string>
    durations: Record<number, number>
    blobs?: Record<number, Blob>
  }) => {
    setSpeakingData(data)
    setSpeakingEval(null)
    setSpeakingError('')

    const activePart = selectedTest.part
    const partsToInclude = activePart ? [activePart] : [1, 2, 3]

    const transcriptSegments = partsToInclude
      .filter(p => data.transcripts[p]?.trim())
      .map(p => `[Part ${p}]: ${data.transcripts[p].trim()}`)

    if (transcriptSegments.length === 0) {
      setSpeakingError('No speech was transcribed, so there is nothing to evaluate. Live transcription works in Chrome and Edge. In other browsers, or for uploaded audio, type what you said into the transcript box before finishing.')
      return
    }

    const combinedTranscript = transcriptSegments.join('\n\n')
    const totalDuration = partsToInclude.reduce((sum, p) => sum + (data.durations[p] || 0), 0) || 60

    const speakingContent = selectedTest.testNumber === 2 ? SPEAKING_CONTENT_2 : SPEAKING_CONTENT
    const allQuestions = partsToInclude.flatMap(p => {
      const item = speakingContent[p]
      return item?.topics ? item.topics.flatMap(topic => topic.questions) : item?.questions || []
    })

    setSpeakingLoading(true)

    try {
      const evalRes = await evaluateSpeakingApi({
        part: activePart || 1,
        title: selectedTest.title,
        questions: allQuestions,
        transcript: combinedTranscript,
        durationSeconds: Math.max(15, totalDuration),
        wordCount: combinedTranscript.split(/\s+/).filter(Boolean).length,
      })
      setSpeakingEval(evalRes)

      // Save to local results cache
      const record = {
        id: `${selectedTest.id}-${Date.now()}`,
        userId: user?.id || '',
        userName: user?.name || 'Student',
        userEmail: user?.email || '',
        testTitle: selectedTest.title,
        testType: 'Speaking',
        completedAt: new Date().toISOString(),
        overallBand: evalRes.overallBand,
        skillBands: { Speaking: evalRes.overallBand },
        userAnswers: { transcript: combinedTranscript, durationSeconds: totalDuration, wordCount: combinedTranscript.split(/\s+/).filter(Boolean).length },
        comment: evalRes.summary || 'Speaking practice evaluated by Puku AI.',
        source: (evalRes.source?.toLowerCase().includes('puku') ? 'AI' : 'Automatic') as any,
      }
      saveExamResult(record as any, user?.email)
      saveExamResultApi(record as any).catch(() => {})
    } catch (err: any) {
      setSpeakingError(err?.message || 'Failed to complete Speaking evaluation.')
    } finally {
      setSpeakingLoading(false)
    }
  }

  const advanceFullTest = () => {
    const currentIndex = FULL_TEST_ORDER.indexOf(fullModule)
    if (fullModule === 'Listening') setFullAttempt(current => ({ ...current, listening: { ...answers } }))
    if (fullModule === 'Reading') setFullAttempt(current => ({ ...current, reading: { ...answers } }))
    if (fullModule === 'Writing') setFullAttempt(current => ({ ...current, writing: { ...answers } }))
    setFullCompleted(current => current.includes(fullModule) ? current : [...current, fullModule])
    if (currentIndex === FULL_TEST_ORDER.length - 1) {
      goToStage('result')
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
      // The speaking exam submits itself on timeout so recordings and transcripts aren't lost
      if (selectedTest.type === 'Speaking' || (selectedTest.type === 'Full Test' && fullModule === 'Speaking')) return
      if (selectedTest.type === 'Full Test') advanceFullTest()
      else goToStage('result')
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
    const activeReadingPassages = selectedTest.testNumber === 4 ? READING_PASSAGES_4 : selectedTest.testNumber === 3 ? READING_PASSAGES_3 : selectedTest.testNumber === 2 ? READING_PASSAGES_2 : READING_PASSAGES
    const partStart = selectedTest.part
      ? selectedTest.type === 'Reading'
        ? (activeReadingPassages[selectedTest.part - 1]?.range[0] || 1)
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
    goToStage('test')
  }

  const connectAudio = (file?: File) => {
    if (!file) return
    if (audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl)
    setAudioUrl(URL.createObjectURL(file))
    setAudioName(file.name)
  }

  const resetTest = () => {
    goToStage('select')
    setAnswers({})
    setCurrentQ(1)
    setResultFilter('all')
    setSpeakingData(null)
    setSpeakingEval(null)
    setSpeakingLoading(false)
    setSpeakingError('')
  }

  const descriptorForSpeakingBand = (band: number) => {
    if (band >= 8.5) return 'Expert User'
    if (band >= 7.5) return 'Very Good User'
    if (band >= 6.5) return 'Good User'
    if (band >= 5.5) return 'Competent User'
    if (band >= 4.5) return 'Modest User'
    if (band >= 3.5) return 'Limited User'
    if (band >= 2.5) return 'Extremely Limited User'
    if (band >= 1.5) return 'Intermittent User'
    if (band >= 0.5) return 'Non-User'
    return 'Did Not Attempt / Off-Topic'
  }

  if (stage === 'result') {
    if (selectedTest.type === 'Full Test') {
      return (
        <FullTestResult
          listeningAnswers={fullAttempt.listening}
          listeningTestNumber={selectedTestNum}
          readingAnswers={fullAttempt.reading}
          writingAnswers={fullAttempt.writing}
          speakingRecordings={fullAttempt.speaking}
          onExit={resetTest}
          onRetake={() => goToStage('instructions')}
        />
      )
    }
    if (selectedTest.type === 'Speaking') {
      return (
        <main className="mx-auto max-w-5xl px-6 py-12">
          {speakingLoading && (
            <div className="corner-mark border border-divider bg-surface p-12 text-center shadow-lg">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-electric/10 text-electric mb-6 animate-pulse">
                <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              </div>
              <div className="label-tag mb-2">PUKU AI 2.8 EXAMINER</div>
              <h1 className="font-plex text-2xl font-bold text-ink">Evaluating Your Speaking Performance...</h1>
              <p className="mt-3 text-sm text-graphite-mid max-w-lg mx-auto leading-relaxed">
                Your spoken responses and audio transcripts are being analyzed across Fluency &amp; Coherence, Lexical Resource, Grammatical Range &amp; Accuracy, and Pronunciation against official IELTS standards.
              </p>
              <div className="mt-8 max-w-md mx-auto space-y-3 text-left">
                <div className="flex items-center gap-3 text-xs font-plex text-graphite bg-surface-2 p-3 rounded border border-divider">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Audio recordings &amp; transcribed responses verified</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-plex text-graphite bg-surface-2 p-3 rounded border border-divider">
                  <span className="h-2.5 w-2.5 rounded-full bg-electric animate-pulse"></span>
                  <span>Measuring speech pace (Words Per Minute) &amp; coherence</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-plex text-graphite bg-surface-2 p-3 rounded border border-divider">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse"></span>
                  <span>Calculating official IELTS 9-band criteria breakdown</span>
                </div>
              </div>
            </div>
          )}

          {!speakingLoading && speakingError && (
            <div className="corner-mark border border-danger/40 bg-surface p-8 text-center shadow">
              <div className="label-tag text-danger mb-2">EVALUATION NOTICE</div>
              <h2 className="font-plex text-2xl font-bold text-ink">Evaluation Could Not Complete</h2>
              <p className="mt-2 text-sm text-danger max-w-lg mx-auto">{speakingError}</p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => speakingData && handleFinishSpeaking(speakingData)}
                  className="rounded-card bg-electric px-6 py-2.5 font-plex text-xs font-bold uppercase text-white hover:bg-electric/90"
                >
                  Retry Evaluation
                </button>
                <button
                  onClick={resetTest}
                  className="rounded-card border border-divider px-6 py-2.5 font-plex text-xs font-semibold text-ink hover:bg-surface-2"
                >
                  Back to Test Centre
                </button>
              </div>
            </div>
          )}

          {!speakingLoading && speakingEval && (
            <div className="space-y-8">
              {/* Header Card */}
              <section className="corner-mark border border-divider bg-surface p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-divider pb-6">
                  <div>
                    <div className="label-tag mb-1.5">{selectedTest.title}</div>
                    <h1 className="font-plex text-3xl font-bold text-ink">Speaking Exam Result</h1>
                    <p className="mt-1 font-plex text-xs text-graphite-mid">
                      Assessed according to official British Council / IDP IELTS band descriptors
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-xs uppercase tracking-wider text-graphite-light">Official Band</div>
                      <div className="font-mono text-xs font-semibold text-accent">{descriptorForSpeakingBand(speakingEval.overallBand)}</div>
                    </div>
                    <div className={`flex h-20 w-24 flex-col items-center justify-center rounded border border-divider bg-surface-2 shadow-inner font-mono text-4xl font-extrabold ${
                      speakingEval.overallBand >= 7.5 ? 'text-positive' : speakingEval.overallBand >= 6.0 ? 'text-accent' : speakingEval.overallBand >= 4.0 ? 'text-caution' : 'text-danger'
                    }`}>
                      {speakingEval.overallBand.toFixed(1)}
                      <span className="font-mono text-[10px] uppercase font-normal text-graphite-mid">Overall Band</span>
                    </div>
                  </div>
                </div>

                {/* Metrics bar */}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="border border-divider bg-surface-2 p-3.5 rounded">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-graphite-light">Evaluation Engine</div>
                    <div className="mt-1 font-plex text-xs font-bold text-ink truncate">{speakingEval.source}</div>
                  </div>
                  <div className="border border-divider bg-surface-2 p-3.5 rounded">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-graphite-light">Speech Pace</div>
                    <div className="mt-1 font-mono text-base font-bold text-ink">{speakingEval.wpm} <span className="text-xs font-normal text-graphite-mid">WPM</span></div>
                  </div>
                  <div className="border border-divider bg-surface-2 p-3.5 rounded">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-graphite-light">Assessment Date</div>
                    <div className="mt-1 font-plex text-xs font-bold text-ink">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <div className="border border-divider bg-surface-2 p-3.5 rounded">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-graphite-light">Status</div>
                    <div className="mt-1 font-plex text-xs font-bold text-positive flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-positive"></span>
                      Verified &amp; Saved
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-6 rounded border border-divider bg-paper-light/50 p-4">
                  <div className="font-mono text-xs uppercase tracking-wider text-accent mb-1">Examiner Assessment Summary</div>
                  <p className="font-plex text-sm leading-6 text-graphite">{speakingEval.summary}</p>
                </div>
              </section>

              {/* 4 IELTS Criteria Grid */}
              <section className="grid gap-6 md:grid-cols-2">
                {[
                  {
                    title: 'Fluency & Coherence',
                    acronym: 'FC',
                    crit: speakingEval.criteria.fluencyCoherence,
                    desc: 'Speech rate, hesitation, continuity, and linking discourse markers'
                  },
                  {
                    title: 'Lexical Resource',
                    acronym: 'LR',
                    crit: speakingEval.criteria.lexicalResource,
                    desc: 'Range of vocabulary, precision, collocations, and idiomatic speech'
                  },
                  {
                    title: 'Grammatical Range & Accuracy',
                    acronym: 'GRA',
                    crit: speakingEval.criteria.grammaticalAccuracy,
                    desc: 'Complex sentences, grammatical variety, and error frequency'
                  },
                  {
                    title: 'Pronunciation & Intonation',
                    acronym: 'PR',
                    crit: speakingEval.criteria.pronunciation,
                    desc: 'Rhythm, natural sentence stress, clarity, and phonetic flow'
                  }
                ].map(item => (
                  <div key={item.title} className="corner-mark border border-divider bg-surface p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-divider pb-3">
                        <div>
                          <span className="font-mono text-xs text-accent font-semibold mr-2">{item.acronym}</span>
                          <span className="font-plex text-sm font-bold text-ink">{item.title}</span>
                          <div className="font-plex text-[11px] text-graphite-mid">{item.desc}</div>
                        </div>
                        <div className={`font-mono text-2xl font-bold px-3 py-1 rounded bg-surface-2 border border-divider ${
                          item.crit.band >= 7.5 ? 'text-positive' : item.crit.band >= 6.0 ? 'text-accent' : item.crit.band >= 4.0 ? 'text-caution' : 'text-danger'
                        }`}>
                          {item.crit.band.toFixed(1)}
                        </div>
                      </div>
                      <p className="mt-3.5 font-plex text-xs leading-5 text-graphite">{item.crit.feedback}</p>
                    </div>
                  </div>
                ))}
              </section>

              {/* Strengths & Improvements */}
              <section className="grid gap-6 md:grid-cols-2">
                <div className="border border-divider bg-surface p-6 rounded shadow-sm">
                  <div className="font-mono text-xs uppercase tracking-wider text-positive mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-positive"></span>
                    Candidate Key Strengths
                  </div>
                  <ul className="space-y-2.5">
                    {speakingEval.strengths.map((str, idx) => (
                      <li key={idx} className="flex gap-2.5 text-xs font-plex leading-5 text-graphite">
                        <span className="text-positive font-bold">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-divider bg-surface p-6 rounded shadow-sm">
                  <div className="font-mono text-xs uppercase tracking-wider text-caution mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-caution"></span>
                    Recommendations to Reach Next Band
                  </div>
                  <ul className="space-y-2.5">
                    {speakingEval.improvements.map((imp, idx) => (
                      <li key={idx} className="flex gap-2.5 text-xs font-plex leading-5 text-graphite">
                        <span className="text-caution font-bold">→</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Sample Upgrades if provided */}
              {speakingEval.sampleUpgrades && speakingEval.sampleUpgrades.length > 0 && (
                <section className="border border-divider bg-surface p-6 rounded shadow-sm">
                  <div className="font-mono text-xs uppercase tracking-wider text-accent mb-4">
                    Sample Band 8+ Vocabulary &amp; Phrasing Upgrades
                  </div>
                  <div className="space-y-3">
                    {speakingEval.sampleUpgrades.map((item, idx) => (
                      <div key={idx} className="border border-divider bg-surface-2 p-3.5 rounded text-xs font-plex">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] uppercase text-graphite-mid">Original:</span>
                          <span className="italic text-ink line-through opacity-80">&ldquo;{item.original}&rdquo;</span>
                          <span className="font-mono text-[10px] uppercase text-positive font-bold ml-2">Band 8+ Alternative:</span>
                          <span className="font-semibold text-positive">&ldquo;{item.improved}&rdquo;</span>
                        </div>
                        <div className="mt-1.5 text-graphite-mid text-[11px]">
                          <strong>Why:</strong> {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recorded Audio Playback & Transcripts per Part */}
              {speakingData && (
                <section className="border border-divider bg-surface p-6 rounded shadow-sm">
                  <div className="font-mono text-xs uppercase tracking-wider text-accent mb-4">
                    Recorded Audio &amp; Candidate Transcripts
                  </div>
                  <div className="space-y-4">
                    {(selectedTest.part ? [selectedTest.part] : [1, 2, 3]).map(p => (
                      <div key={p} className="border border-divider bg-paper-light/50 p-4 rounded">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                          <span className="font-plex text-xs font-bold text-ink">Speaking Part {p}</span>
                          {speakingData.recordings[p] && (
                            <audio controls src={speakingData.recordings[p]} className="h-8 max-w-xs" />
                          )}
                        </div>
                        <div className="mt-2 font-plex text-xs leading-relaxed text-graphite bg-surface p-3 rounded border border-divider">
                          {speakingData.transcripts[p]?.trim() || (
                            <span className="italic text-graphite-mid">No transcript recorded for this part.</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Actions Footer */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-divider">
                <button
                  onClick={resetTest}
                  className="rounded-card bg-electric px-6 py-3 font-plex text-sm font-semibold text-white hover:bg-electric/90"
                >
                  Return to Test Centre
                </button>
                <button
                  onClick={() => goToStage('instructions')}
                  className="rounded-card border border-divider px-6 py-3 font-plex text-sm font-semibold text-ink hover:bg-surface-2"
                >
                  Practice Speaking Again
                </button>
              </div>
            </div>
          )}

          {!speakingLoading && !speakingEval && !speakingError && (
            <section className="corner-mark border border-divider bg-surface p-8">
              <div className="label-tag mb-3">{selectedTest.title}</div>
              <h1 className="font-plex text-3xl font-bold text-ink">Speaking practice complete</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-mid">Speaking response captured. Ready for evaluation.</p>
              <div className="mt-8 flex gap-3">
                <button onClick={resetTest} className="rounded-card bg-electric px-6 py-3 font-plex text-sm font-semibold text-white">Return to test centre</button>
                <button onClick={() => goToStage('instructions')} className="rounded-card border border-divider px-6 py-3 font-plex text-sm font-semibold text-ink">Practice again</button>
              </div>
            </section>
          )}
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
              <button onClick={() => goToStage('instructions')} className="rounded-card border border-divider px-6 py-3 font-plex text-sm font-semibold text-ink">Retake test</button>
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

    const activePassages = activeCustomTest ? activeCustomTest.passages : selectedTest.testNumber === 21 ? READING_PASSAGES_21 : selectedTest.testNumber === 4 ? READING_PASSAGES_4 : selectedTest.testNumber === 3 ? READING_PASSAGES_3 : selectedTest.testNumber === 2 ? READING_PASSAGES_2 : READING_PASSAGES
    const activeAnswers = activeCustomTest ? activeCustomTest.answers : selectedTest.testNumber === 21 ? READING_ANSWERS_21 : selectedTest.testNumber === 4 ? READING_ANSWERS_4 : selectedTest.testNumber === 3 ? READING_ANSWERS_3 : selectedTest.testNumber === 2 ? READING_ANSWERS_2 : READING_ANSWERS

    const readingQuestions = selectedTest.type === 'Reading'
      ? selectedTest.part !== undefined
        ? activePassages[selectedTest.part - 1]?.questions || []
        : activePassages.flatMap(p => p.questions)
      : []

    const questionReviewItems = readingQuestions.map(q => {
      const userAns = answers[q.id]?.trim() || ''
      const accepted = activeAnswers[q.id] || []
      const correct = !!readingMarks[q.id]
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

    const listeningAnswerKey = selectedTestNum === 2 ? LISTENING_ANSWERS_2 : LISTENING_ANSWERS
    const listeningMarks = markAnswers(listeningAnswerKey, answers, listeningPairs(selectedTestNum))
    const activeListeningParts = selectedTestNum === 2 ? LISTENING_PARTS_2 : LISTENING_PARTS_1
    const listeningQuestionsMap = new Map(activeListeningParts.flatMap(p => p.questions).map(q => [q.id, q]))
    const listeningReviewItems = isListening
      ? Object.entries(listeningAnswerKey)
          .filter(([key]) => {
            const id = Number(key)
            return selectedTest.part === undefined || (id >= (selectedTest.part - 1) * 10 + 1 && id <= selectedTest.part * 10)
          })
          .map(([key, accepted]) => {
            const id = Number(key)
            const q = listeningQuestionsMap.get(id)
            const userAns = answers[id]?.trim() || ''
            const correct = !!listeningMarks[id]
            const unanswered = !userAns
            return {
              id,
              prompt: q?.prompt || `Question ${id}`,
              userAns,
              accepted,
              correct,
              unanswered,
              explanation: q?.explanation,
              passageReference: undefined,
            }
          })
      : []

    const reviewItems = isListening ? listeningReviewItems : questionReviewItems
    const filteredReviewItems = reviewItems.filter(item => {
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
            <button onClick={() => goToStage('instructions')} className="rounded-card border border-divider bg-surface px-6 py-3 font-plex text-sm font-semibold text-ink transition-colors hover:border-graphite-light">
              Retake test
            </button>
          </div>
        </section>

        {/* Detailed Question Review & Diagnostics */}
        {(selectedTest.type === 'Reading' || selectedTest.type === 'Listening') && reviewItems.length > 0 && (
          <section className="mt-8 border border-divider bg-surface p-6 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-divider pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="label-tag">DIAGNOSTIC REVIEW</div>
                <h2 className="mt-2 font-plex text-2xl font-bold text-ink">
                  {isListening ? 'Listening Answer Check' : 'Answer Review & Passage Evidence'}
                </h2>
                <p className="mt-1 text-sm text-graphite-mid">
                  {isListening
                    ? 'Compare each of your recorded answers against the official Cambridge IELTS listening answer key.'
                    : 'Review which answers were correct, why incorrect responses were wrong, and the exact passage excerpts used as evidence.'}
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
                  All Questions ({reviewItems.length})
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
                  Mistakes ({reviewItems.filter(item => !item.correct).length})
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
                  Correct ({reviewItems.filter(item => item.correct).length})
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
        return <ReadingExam answers={answers} setAnswers={setAnswers} currentQ={currentQ} setCurrentQ={setCurrentQ} timeLeft={timeLeft} selectedTestNumber={selectedTest.testNumber || 1} customPassages={activeCustomTest?.passages} onFinish={advanceFullTest} />
      }
      if (fullModule === 'Writing') {
        return <WritingExam answers={answers} setAnswers={setAnswers} currentTask={currentQ} setCurrentTask={setCurrentQ} timeLeft={timeLeft} selectedTestNumber={selectedTest.testNumber || 1} onFinish={advanceFullTest} />
      }
      return (
        <SpeakingExam
          currentPart={currentQ}
          setCurrentPart={setCurrentQ}
          timeLeft={timeLeft}
          selectedTestNumber={selectedTest.testNumber || 1}
          onRecording={(part, recording) => setFullAttempt(current => ({ ...current, speaking: { ...current.speaking, [part]: recording } }))}
          onFinishSpeaking={data => {
            setFullAttempt(current => ({
              ...current,
              speaking: data.blobs,
              speakingTranscripts: data.transcripts,
            }))
          }}
          onFinish={advanceFullTest}
        />
      )
    }
    if (selectedTest.type === 'Speaking') {
      return (
        <SpeakingExam
          currentPart={currentQ}
          setCurrentPart={setCurrentQ}
          timeLeft={timeLeft}
          part={selectedTest.part}
          selectedTestNumber={selectedTest.testNumber || 1}
          onFinishSpeaking={handleFinishSpeaking}
          onFinish={() => goToStage('result')}
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
          selectedTestNumber={selectedTest.testNumber || 1}
          onFinish={() => goToStage('result')}
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
          onFinish={() => goToStage('result')}
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
          selectedTestNumber={selectedTest.testNumber || 1}
          customPassages={activeCustomTest?.passages}
          onFinish={() => goToStage('result')}
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
        <button onClick={() => goToStage('select')} className="mb-6 font-mono text-xs uppercase tracking-wide text-graphite-mid hover:text-accent">← Back to test centre</button>
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
                        const num = Number(t)
                        setSelectedBook(b)
                        setSelectedTestNum(num)
                        if (!audioUrl.startsWith('blob:')) {
                          setAudioUrl(getStreamUrl(b, num, 1))
                          setAudioName(`IELTS ${b} · Test ${num} · Part 1`)
                        }
                        const matched = TESTS.find(test => test.type === selectedTest.type && test.book === b && test.testNumber === num)
                        if (matched) setSelectedTest(matched)
                      }}
                      className="w-full rounded border border-graphite-light/40 bg-surface px-3 py-2 font-plex text-xs text-ink focus:outline-none focus:ring-1 focus:ring-electric"
                    >
                      <option value="18-1">IELTS 18 · Test 1 (Matches Questions)</option>
                      <option value="18-2">IELTS 18 · Test 2</option>
                      <option value="18-3">IELTS 18 · Test 3</option>
                      <option value="18-4">IELTS 18 · Test 4</option>
                      <option value="19-1">IELTS 19 · Test 1</option>
                      <option value="19-2">IELTS 19 · Test 2</option>
                      <option value="19-3">IELTS 19 · Test 3</option>
                      <option value="19-4">IELTS 19 · Test 4</option>
                      <option value="20-1">IELTS 20 · Test 1</option>
                      <option value="20-2">IELTS 20 · Test 2</option>
                      <option value="20-3">IELTS 20 · Test 3</option>
                      <option value="20-4">IELTS 20 · Test 4</option>
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
                        setSoundTestError(false)
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
                            setSoundTestError(false)
                            window.setTimeout(() => {
                              if (soundTestAudioRef.current && !soundTestAudioRef.current.paused) {
                                soundTestAudioRef.current.pause()
                                setSoundTestPlaying(false)
                              }
                            }, 5000)
                          }).catch(() => {
                            setSoundTestPlaying(false)
                            setSoundTestError(true)
                          })
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
                    {soundTestError && (
                      <p className="mt-1.5 text-[11px] leading-tight text-danger font-plex">
                        ⚠️ Audio stream could not play. If testing SharePoint on Vercel, Microsoft 365 sign-in or a local MP3 is needed.
                      </p>
                    )}
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
          <div className="border-l-2 border-electric pl-3"><div className="font-mono text-lg font-bold text-ink">{completedCount}</div><div className="font-mono text-xs uppercase text-graphite-light">Tests completed</div></div>
          <div className="border-l-2 border-violet pl-3"><div className="font-mono text-lg font-bold text-ink">{bestOverall}</div><div className="font-mono text-xs uppercase text-graphite-light">Best overall</div></div>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {FILTERS.map(item => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${filter === item ? 'border-line-ink bg-navy text-white' : 'border-divider bg-surface text-graphite-mid hover:border-graphite-light'}`}>{item}</button>
        ))}
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleTests.map(test => {
          const isSelected = selectedTest.id === test.id
          return (
            <div
              key={test.id}
              onClick={() => setSelectedTest(test)}
              className={`group flex flex-col justify-between rounded-card border-2 bg-surface p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${isSelected ? 'border-electric' : 'border-divider'}`}
            >
              <div>
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
              </div>
              {isSelected && (
                <div className="mt-5 border-t border-divider pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      goToStage('instructions')
                    }}
                    className="w-full rounded-card bg-electric px-5 py-2.5 text-center font-plex text-sm font-semibold text-white transition-colors hover:bg-electric-light"
                  >
                    View instructions and begin →
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </section>
    </main>
  )
}
