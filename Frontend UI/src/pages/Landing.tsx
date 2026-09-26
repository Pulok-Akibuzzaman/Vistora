import { NavLink } from 'react-router'

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

export default function Landing() {
  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="bg-navy-grid min-h-[92vh] flex flex-col items-center justify-center relative overflow-hidden px-6 py-24">
        {/* Decorative grid accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 border border-[#1E293B]" style={{ borderRadius: 3 }} />
          <div className="absolute top-28 left-28 w-64 h-64 border border-[#1E293B]" style={{ borderRadius: 3 }} />
          <div className="absolute bottom-24 right-16 w-48 h-48 border border-[#1E293B]" style={{ borderRadius: 3 }} />
          <div className="absolute bottom-32 right-24 w-48 h-48 border border-[#1E293B]" style={{ borderRadius: 3 }} />
          <div className="absolute top-1/2 left-8 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-[#1E293B] to-transparent" />
          <div className="absolute top-1/2 right-8 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-[#1E293B] to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-[#1E293B] border border-[#DC2626]/30 px-4 py-1.5 mb-8" style={{ borderRadius: 3 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] anim-pulse-dot" />
            <span className="mono text-[10px] text-[#F87171] tracking-widest">AI-POWERED IELTS PREPARATION PLATFORM</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Master IELTS with<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #F87171, #FB7185)' }}>
              AI-Powered Precision
            </span>
          </h1>

          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl mx-auto mb-10" style={{ fontFamily: 'Inter, sans-serif' }}>
            Vistora AI combines advanced language models with proven IELTS pedagogy to deliver personalized band score improvement — from diagnostic assessment to final exam readiness.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
            <NavLink to="/signup"
              className="flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-8 py-3.5 hover:bg-[#B91C1C] transition-colors"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}>
              Create Your Account
              <span className="text-[#FCA5A5]">→</span>
            </NavLink>
            <NavLink to="/practice"
              className="flex items-center gap-2 bg-transparent border border-[#334155] text-[#CBD5E1] text-sm font-medium px-8 py-3.5 hover:border-[#475569] hover:text-white transition-colors"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}>
              Take a Practice Test
            </NavLink>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(s => (
              <div key={s.val} className="text-center">
                <div className="mono text-2xl font-semibold text-white">{s.val}</div>
                <div className="text-[11px] text-[#64748B] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FAFAF7] to-transparent" />
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="text-center mb-14">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={f.title}
              className="bg-white border border-[#E2E8F0] p-6 corner-mark group hover:border-[#CBD5E1] transition-colors"
              style={{ borderRadius: 4 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 flex items-center justify-center text-lg border" style={{ background: f.bg, borderColor: f.bg, borderRadius: 4, color: f.color }}>
                  {f.icon}
                </div>
                <span className="mono text-[9px] tracking-widest" style={{ color: f.color }}>{f.tag}</span>
              </div>
              <h3 className="text-[15px] font-semibold text-[#0F172A] mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{f.title}</h3>
              <p className="text-[12px] text-[#64748B] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#F4F4F0] border-y border-[#E2E8F0] py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-14">
            <div className="label-tag justify-center mb-3">
              <span className="w-3 h-px bg-[#CBD5E1]" />
              Methodology
              <span className="w-3 h-px bg-[#CBD5E1]" />
            </div>
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              A Systematic Path to Your Target Band
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="absolute top-5 left-full w-full h-px bg-gradient-to-r from-[#E2E8F0] to-transparent z-0" />
                )}
                <div className="bg-white border border-[#E2E8F0] p-6 relative z-10" style={{ borderRadius: 4 }}>
                  <div className="mono text-3xl font-semibold text-[#E2E8F0] mb-3">{s.num}</div>
                  <h3 className="text-[14px] font-semibold text-[#0F172A] mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{s.title}</h3>
                  <p className="text-[12px] text-[#64748B] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────── */}
      <section id="testimonials" className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="text-center mb-14">
          <div className="label-tag justify-center mb-3">
            <span className="w-3 h-px bg-[#CBD5E1]" />
            Student Outcomes
            <span className="w-3 h-px bg-[#CBD5E1]" />
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Real Results from Real Learners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white border border-[#E2E8F0] p-6" style={{ borderRadius: 4 }}>
              {/* Score change */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F1F5F9]">
                <div className="w-10 h-10 bg-[#FFE4E6] flex items-center justify-center text-[#BE123C] text-xs font-bold" style={{ borderRadius: 4 }}>
                  {t.avatar}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#0F172A] plex">{t.name}</div>
                  <div className="text-[11px] text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>{t.country}</div>
                </div>
                <div className="text-right">
                  <div className="mono text-xs text-[#94A3B8] line-through">{t.prev}</div>
                  <div className="mono text-sm font-semibold text-[#DC2626]">{t.score}</div>
                </div>
              </div>
              <p className="text-[12px] text-[#374151] leading-relaxed mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>"{t.text}"</p>
              <div className="mono text-[10px] text-[#94A3B8] tracking-wide">{t.program}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────── */}
      <section className="bg-navy-grid border-t border-[#1E293B] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
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
          <div className="flex items-center justify-center gap-3">
            <NavLink to="/dashboard"
              className="bg-[#DC2626] text-white text-sm font-semibold px-8 py-3.5 hover:bg-[#B91C1C] transition-colors"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}>
              Start Free — No Credit Card
            </NavLink>
            <NavLink to="/resources"
              className="border border-[#334155] text-[#94A3B8] text-sm font-medium px-6 py-3.5 hover:border-[#475569] transition-colors"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 4 }}>
              Browse Resources
            </NavLink>
          </div>
        </div>
      </section>
    </div>
  )
}
