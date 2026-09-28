import { NavLink } from 'react-router'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { CountUp, Reveal, cssVars, prefersReducedMotion, useInView } from '../components/Motion'

const FEATURES = [
  {
    icon: '✦',
    color: '#DC2626',
    bg: '#FEE2E2',
    title: 'AI Writing Evaluation',
    desc: 'Submit IELTS Task 1 & Task 2 essays and receive instant band score predictions, grammatical analysis, and vocabulary enhancement suggestions powered by advanced NLP.',
    tag: 'BAND PREDICTION',
  },
  {
    icon: '◈',
    color: '#BE123C',
    bg: '#FFE4E6',
    title: 'Full Mock Tests',
    desc: 'Authentic IELTS Academic and General Training simulations with timed sections, adaptive question difficulty, and post-test diagnostic reports.',
    tag: 'TIMED PRACTICE',
  },
  {
    icon: '⊞',
    color: '#DC2626',
    bg: '#FEE2E2',
    title: 'AI Document Generator',
    desc: 'Generate professional CVs, Statements of Purpose, Personal Statements, and Cover Letters tailored for university and visa applications.',
    tag: 'AI GENERATION',
  },
  {
    icon: '◎',
    color: '#BE123C',
    bg: '#FFE4E6',
    title: 'Progress Analytics',
    desc: 'Granular performance tracking across Reading, Listening, Writing, and Speaking. Identify weak areas with precision and monitor improvement over time.',
    tag: 'SKILL TRACKING',
  },
  {
    icon: '▣',
    color: '#DC2626',
    bg: '#FEE2E2',
    title: 'Resource Library',
    desc: 'Curated collection of band 8+ sample essays, vocabulary lists, grammar guides, and Cambridge IELTS practice materials updated regularly.',
    tag: '500+ RESOURCES',
  },
  {
    icon: '◇',
    color: '#BE123C',
    bg: '#FFE4E6',
    title: 'Community Forum',
    desc: 'Connect with 40,000+ IELTS candidates worldwide. Share strategies, get feedback on essays, and learn from top scorers in a structured academic community.',
    tag: 'PEER LEARNING',
  },
]

const STEPS = [
  { num: '01', title: 'Assess Your Baseline', desc: 'Take a diagnostic test to establish your current IELTS band score across all four skills.' },
  { num: '02', title: 'Follow Your AI Plan', desc: 'Vistora generates a personalized study schedule targeting your weakest areas first.' },
  { num: '03', title: 'Practice with Feedback', desc: 'Submit writing, attempt timed tests, and receive detailed AI-powered critiques instantly.' },
  { num: '04', title: 'Track & Improve', desc: 'Monitor your progress with precision analytics until you achieve your target band score.' },
]

const TESTIMONIALS = [
  {
    name: 'Ayaan Rahman',
    country: 'Bangladesh → Canada',
    score: 'Band 8.0',
    prev: '6.5',
    text: 'Vistora\'s AI Writing Evaluation pinpointed exactly where my Task 2 coherence was failing. After six weeks of targeted practice, I went from 6.0 in Writing to 7.5. The band prediction accuracy is remarkable.',
    avatar: 'AM',
    program: 'MSc Computer Science, University of Toronto',
  },
  {
    name: 'Fatima Al-Rashid',
    country: 'UAE → UK',
    score: 'Band 7.5',
    prev: '6.0',
    text: 'The Document Generator saved me hours. My SOP for Imperial College London was polished and structured. The IELTS mock tests are indistinguishable from the real exam — I felt completely prepared on test day.',
    avatar: 'FA',
    program: 'MBA, Imperial College Business School',
  },
  {
    name: 'Chen Wei',
    country: 'China → Australia',
    score: 'Band 8.5',
    prev: '7.0',
    text: 'I used Vistora for three months before my IELTS exam. The vocabulary resources and reading strategies were exceptional. The community forum helped me understand native speaker nuances that textbooks miss entirely.',
    avatar: 'CW',
    program: 'PhD Biomedical Engineering, University of Melbourne',
  },
]

const STATS = [
  { val: '40,000+', label: 'Active Learners' },
  { val: '94%', label: 'Achieve Target Band' },
  { val: '1.4M+', label: 'Essays Evaluated' },
  { val: '8.1', label: 'Avg. Final Band Score' },
]

// Floating preview cards around the hero headline (wide screens only)
const HERO_CHIPS = [
  { icon: '✦', label: 'Task 2 essay evaluated', value: 'Band 7.5', pos: 'left-[4%] top-[22%]', depth: 36, bobOffset: '0s', delay: 900 },
  { icon: '◈', label: 'Listening · Test 3', value: '38 / 40', pos: 'right-[4%] top-[30%]', depth: -28, bobOffset: '-2s', delay: 1050 },
  { icon: '◎', label: 'Target band reached', value: '8.0 ✓', pos: 'left-[5%] bottom-[22%]', depth: 22, bobOffset: '-4s', delay: 1200 },
]

const STEP_INTERVAL = 3000

export default function Landing() {
  const heroRef = useRef<HTMLElement>(null)
  const frame = useRef(0)
  const [activeStep, setActiveStep] = useState(0)
  const [stepsPaused, setStepsPaused] = useState(false)
  const [stepsRef, stepsInView] = useInView<HTMLDivElement>(0.3)
  const autoAdvance = stepsInView && !stepsPaused && !prefersReducedMotion()

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // Walk through the methodology steps on a timer until the visitor takes over
  useEffect(() => {
    if (!autoAdvance) return
    const id = window.setInterval(() => setActiveStep(step => (step + 1) % STEPS.length), STEP_INTERVAL)
    return () => window.clearInterval(id)
  }, [autoAdvance])

  // Feed pointer position to the hero spotlight and parallax layers without re-rendering
  const onHeroMove = (event: MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const el = heroRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      el.style.setProperty('--sx', `${x}px`)
      el.style.setProperty('--sy', `${y}px`)
      el.style.setProperty('--mx', (x / rect.width - 0.5).toFixed(3))
      el.style.setProperty('--my', (y / rect.height - 0.5).toFixed(3))
    })
  }

  const onHeroLeave = () => {
    cancelAnimationFrame(frame.current)
    heroRef.current?.style.setProperty('--mx', '0')
    heroRef.current?.style.setProperty('--my', '0')
  }

  // Card spotlight follows the pointer inside each feature card
  const onCardMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--y', `${event.clientY - rect.top}px`)
  }

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        ref={heroRef}
        onMouseMove={onHeroMove}
        onMouseLeave={onHeroLeave}
        className="group/hero bg-navy-grid min-h-[92vh] flex flex-col items-center justify-center relative overflow-hidden px-6 pt-24 pb-36"
      >
        {/* Pointer spotlight */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-700 group-hover/hero:opacity-100"
          style={{ background: 'radial-gradient(560px circle at var(--sx, 50%) var(--sy, 40%), rgba(220,38,38,0.13), transparent 60%)' }}
        />

        {/* Scanning line sweeping down the blueprint grid */}
        <div className="scanline absolute inset-0 pointer-events-none">
          <div className="absolute bottom-full inset-x-0 h-24 bg-gradient-to-b from-transparent to-[#DC2626]/[0.05]" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#DC2626]/50 to-transparent" />
        </div>

        {/* Decorative grid accent, drifting and reacting to the pointer */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="parallax absolute top-20 left-20" style={cssVars({ '--depth': 24 })}>
            <div className="float-a relative w-64 h-64">
              <div className="absolute inset-0 border border-[#1E293B]" style={{ borderRadius: 3 }} />
              <div className="absolute inset-0 translate-x-8 translate-y-8 border border-[#1E293B]" style={{ borderRadius: 3 }} />
            </div>
          </div>
          <div className="parallax absolute bottom-32 right-24" style={cssVars({ '--depth': -32 })}>
            <div className="float-b relative w-48 h-48">
              <div className="absolute inset-0 border border-[#1E293B]" style={{ borderRadius: 3 }} />
              <div className="absolute inset-0 translate-x-8 translate-y-8 border border-[#DC2626]/20" style={{ borderRadius: 3 }} />
            </div>
          </div>
          <div className="absolute top-1/2 left-8 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-[#1E293B] to-transparent" />
          <div className="absolute top-1/2 right-8 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-[#1E293B] to-transparent" />
        </div>

        {/* Floating preview cards */}
        {HERO_CHIPS.map(chip => (
          <div key={chip.label} className={`hidden xl:block absolute z-10 pointer-events-none ${chip.pos}`}>
            <div className="parallax" style={cssVars({ '--depth': chip.depth })}>
              <div className="hero-in" style={cssVars({ '--delay': `${chip.delay}ms` })}>
                <div className="float-c flex items-center gap-3 bg-[#1E293B]/80 backdrop-blur border border-[#334155] px-4 py-3 shadow-2xl shadow-black/30" style={{ borderRadius: 4, animationDelay: chip.bobOffset }}>
                  <span className="w-8 h-8 flex items-center justify-center bg-[#DC2626]/15 text-[#F87171] text-sm" style={{ borderRadius: 3 }}>{chip.icon}</span>
                  <div>
                    <div className="text-[10px] text-[#94A3B8]">{chip.label}</div>
                    <div className="mono text-sm font-semibold text-white">{chip.value}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Tag */}
          <div className="hero-in" style={cssVars({ '--delay': '0ms' })}>
            <div className="inline-flex items-center gap-2 bg-[#1E293B] border border-[#DC2626]/30 px-4 py-1.5 mb-8" style={{ borderRadius: 3 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] anim-pulse-dot" />
              <span className="mono text-[10px] text-[#F87171] tracking-widest">AI-POWERED IELTS PREPARATION PLATFORM</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            <span className="block hero-in" style={cssVars({ '--delay': '120ms' })}>Master IELTS with</span>
            <span className="block hero-in" style={cssVars({ '--delay': '260ms' })}>
              <span className="text-shimmer text-transparent bg-clip-text">AI-Powered Precision</span>
            </span>
          </h1>

          <p className="hero-in text-[#94A3B8] text-lg leading-relaxed max-w-2xl mx-auto mb-10" style={cssVars({ '--delay': '400ms', fontFamily: 'Inter, sans-serif' })}>
            Vistora AI combines advanced language models with proven IELTS pedagogy to deliver personalized band score improvement — from diagnostic assessment to final exam readiness.
          </p>

          {/* CTAs */}
          <div className="hero-in flex items-center justify-center gap-3 flex-wrap mb-12" style={cssVars({ '--delay': '540ms' })}>
            <NavLink to="/signup"
              className="group btn-sheen flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-8 py-3.5 hover:bg-[#B91C1C] hover:shadow-lg hover:shadow-[#DC2626]/30 active:scale-[0.97] transition"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}>
              Create Your Account
              <span className="text-[#FCA5A5] transition-transform group-hover:translate-x-1">→</span>
            </NavLink>
            <NavLink to="/practice"
              className="flex items-center gap-2 bg-transparent border border-[#334155] text-[#CBD5E1] text-sm font-medium px-8 py-3.5 hover:border-[#DC2626]/60 hover:text-white hover:bg-[#1E293B]/60 active:scale-[0.97] transition"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}>
              Take a Practice Test
            </NavLink>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map((s, i) => (
              <div key={s.val} className="hero-in text-center" style={cssVars({ '--delay': `${680 + i * 90}ms` })}>
                <div className="mono text-2xl font-semibold text-white tabular-nums"><CountUp value={s.val} delay={700 + i * 90} /></div>
                <div className="text-[11px] text-[#64748B] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-24 inset-x-0 z-10 flex justify-center">
          <a href="#features" className="hero-in group flex flex-col items-center gap-2" style={cssVars({ '--delay': '1400ms' })} aria-label="Scroll to features">
            <span className="mono text-[9px] tracking-[0.3em] text-[#64748B] group-hover:text-[#F87171] transition-colors">SCROLL</span>
            <span className="relative block w-px h-8 overflow-hidden bg-[#334155]">
              <span className="scroll-cue-dot absolute inset-x-0 top-0 h-1/3 bg-[#DC2626]" />
            </span>
          </a>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FAFAF7] to-transparent" />
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <Reveal className="text-center mb-14">
          <div className="label-tag justify-center mb-3">
            <span className="w-3 h-px bg-[#CBD5E1]" />
            Platform Capabilities
            <span className="w-3 h-px bg-[#CBD5E1]" />
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Everything You Need to Achieve Band 8+
          </h2>
          <p className="text-[#64748B] mt-3 max-w-xl mx-auto text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            A complete IELTS preparation ecosystem, from first diagnostic to day-of exam confidence.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 110} className="h-full">
              <div
                onMouseMove={onCardMove}
                className="h-full bg-white border border-[#E2E8F0] p-6 corner-mark group hover:border-[#CBD5E1] hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5 transition duration-300"
                style={{ borderRadius: 4 }}>
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ borderRadius: 4, background: `radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), ${f.bg}, transparent 70%)` }}
                />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 flex items-center justify-center text-lg border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ background: f.bg, borderColor: f.bg, borderRadius: 4, color: f.color }}>
                      {f.icon}
                    </div>
                    <span className="mono text-[9px] tracking-widest" style={{ color: f.color }}>{f.tag}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#0F172A] mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{f.title}</h3>
                  <p className="text-[12px] text-[#64748B] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{f.desc}</p>
                </div>
                <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ background: f.color }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#F4F4F0] border-y border-[#E2E8F0] py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <Reveal className="text-center mb-14">
            <div className="label-tag justify-center mb-3">
              <span className="w-3 h-px bg-[#CBD5E1]" />
              Methodology
              <span className="w-3 h-px bg-[#CBD5E1]" />
            </div>
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              A Systematic Path to Your Target Band
            </h2>
          </Reveal>

          <div ref={stepsRef} onMouseLeave={() => setStepsPaused(false)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => {
              const active = i === activeStep
              const passed = i < activeStep
              return (
                <Reveal key={s.num} delay={i * 130} className="relative h-full">
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-6 h-px bg-[#E2E8F0] z-0">
                      <div className={`h-full bg-[#DC2626] origin-left transition-transform duration-700 ${passed ? 'scale-x-100' : 'scale-x-0'}`} />
                    </div>
                  )}
                  <button
                    type="button"
                    onMouseEnter={() => { setActiveStep(i); setStepsPaused(true) }}
                    onFocus={() => { setActiveStep(i); setStepsPaused(true) }}
                    onBlur={() => setStepsPaused(false)}
                    onClick={() => setActiveStep(i)}
                    aria-pressed={active}
                    className={`relative z-10 block w-full h-full text-left bg-white border p-6 overflow-hidden transition duration-300 ${active ? 'border-[#DC2626]/40 -translate-y-1 shadow-xl shadow-[#DC2626]/10' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'}`}
                    style={{ borderRadius: 4 }}
                  >
                    <div className={`mono text-3xl font-semibold mb-3 transition-colors duration-300 ${active ? 'text-[#DC2626]' : passed ? 'text-[#FCA5A5]' : 'text-[#E2E8F0]'}`}>{s.num}</div>
                    <h3 className="text-[14px] font-semibold text-[#0F172A] mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{s.title}</h3>
                    <p className="text-[12px] text-[#64748B] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{s.desc}</p>
                    {active && autoAdvance && (
                      <span key={activeStep} className="step-timer absolute bottom-0 left-0 h-[2px] w-full bg-[#DC2626]" style={cssVars({ '--duration': `${STEP_INTERVAL}ms` })} />
                    )}
                  </button>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────── */}
      <section id="testimonials" className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <Reveal className="text-center mb-14">
          <div className="label-tag justify-center mb-3">
            <span className="w-3 h-px bg-[#CBD5E1]" />
            Student Outcomes
            <span className="w-3 h-px bg-[#CBD5E1]" />
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Real Results from Real Learners
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 130} className="h-full">
              <div className="group h-full bg-white border border-[#E2E8F0] p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5 hover:border-[#CBD5E1] transition duration-300" style={{ borderRadius: 4 }}>
                {/* Score change */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F1F5F9]">
                  <div className="w-10 h-10 bg-[#FFE4E6] flex items-center justify-center text-[#BE123C] text-xs font-bold transition-colors group-hover:bg-[#BE123C] group-hover:text-white" style={{ borderRadius: 4 }}>
                    {t.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#0F172A] plex">{t.name}</div>
                    <div className="text-[11px] text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>{t.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="mono text-xs text-[#94A3B8] line-through">{t.prev}</div>
                    <div className="mono text-sm font-semibold text-[#DC2626] tabular-nums">
                      <CountUp value={t.score} from={Number(t.prev)} delay={300 + i * 130} duration={1400} />
                    </div>
                  </div>
                </div>
                <p className="text-[12px] text-[#374151] leading-relaxed mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>"{t.text}"</p>
                <div className="mono text-[10px] text-[#94A3B8] tracking-wide">{t.program}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────── */}
      <section className="bg-navy-grid border-t border-[#1E293B] py-20 px-6">
        <Reveal className="max-w-2xl mx-auto text-center">
          <div className="label-tag justify-center mb-4 text-[#475569]">
            <span className="w-3 h-px bg-[#334155]" />
            Begin Your Journey
            <span className="w-3 h-px bg-[#334155]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Your Target Band Score Is Within Reach
          </h2>
          <p className="text-[#64748B] text-sm mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Join 40,000+ students who have achieved their IELTS goals with Vistora AI.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <NavLink to="/dashboard"
              className="btn-glow bg-[#DC2626] text-white text-sm font-semibold px-8 py-3.5 hover:bg-[#B91C1C] active:scale-[0.97] transition"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}>
              Start Free — No Credit Card
            </NavLink>
            <NavLink to="/resources"
              className="border border-[#334155] text-[#94A3B8] text-sm font-medium px-6 py-3.5 hover:border-[#475569] hover:text-white active:scale-[0.97] transition"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}>
              Browse Resources
            </NavLink>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
