import { useState } from 'react'

const SAMPLE_ESSAY = `Some people believe that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your own opinion.

Crime is a persistent challenge for societies worldwide, and the most effective strategies to address it remain widely debated. While some advocate for extended incarceration as the primary deterrent, others argue that rehabilitative and preventative approaches yield more sustainable outcomes. This essay will examine both perspectives before presenting a reasoned conclusion.

Proponents of longer prison sentences contend that harsher penalties deter potential offenders through the threat of severe consequences. From this perspective, the certainty of extended incarceration creates a cost-benefit calculus unfavorable to criminal behavior. Moreover, lengthy sentences incapacitate dangerous individuals, thereby protecting society during the confinement period. Countries such as the United States, which maintain comparatively long sentences for serious offences, point to periods of declining violent crime as evidence of this deterrent effect.

Nevertheless, the limitations of punitive approaches are well-documented. Research consistently demonstrates that the certainty of punishment, rather than its severity, more effectively reduces crime rates. Furthermore, lengthy incarceration can exacerbate criminality by exposing offenders to criminal networks, disrupting employment and family ties, and instilling identities centered on crime. Recidivism rates in jurisdictions with punitive sentencing regimes often remain disappointingly high.

Alternative strategies — including investment in education, mental health services, substance abuse treatment, and community programs — address the root causes of criminal behavior. Scandinavian countries, which prioritize rehabilitation over punishment, consistently demonstrate lower recidivism and incarceration rates than their more punitive counterparts.

In conclusion, while longer prison sentences offer some short-term protective benefits, the evidence suggests that multi-faceted approaches combining proportionate justice with robust rehabilitation and social investment represent the most effective long-term strategy for reducing crime.`

const FEEDBACK = {
  band: 7.5,
  ta: 8.0,
  cc: 7.5,
  lr: 7.5,
  gra: 7.0,
  summary: 'A well-structured and coherent essay that demonstrates a clear position throughout. The argument is logically developed with relevant examples and comparative evidence. Minor grammatical inconsistencies prevent a Band 8 award.',
  grammar: [
    { type: 'error', text: 'Countries such as the United States, which maintain comparatively long sentences for serious offences', issue: 'Subject-verb agreement: "Countries...maintain" is correct, but the relative clause creates ambiguity.', fix: 'Consider restructuring: "The United States, which maintains..." for clarity.' },
    { type: 'suggestion', text: 'the evidence suggests that multi-faceted approaches', issue: 'Slightly informal phrasing for academic writing.', fix: 'Consider: "empirical evidence indicates that multifaceted interventions..."' },
  ],
  vocab: [
    { word: 'challenge', level: 'C1', suggestion: 'predicament, impediment, societal concern', note: 'Your current choice is acceptable but replacing once would elevate lexical range.' },
    { word: 'showed', level: 'B2', suggestion: 'demonstrates, evidences, substantiates', note: 'This word appears twice. Vary with "illustrates" or "attests to" for lexical diversity.' },
  ],
  improvements: [
    'Introduce a more specific real-world example in Body Paragraph 1 (specific country + specific statistic)',
    'Strengthen the thesis statement to more explicitly forecast the essay\'s structure',
    'The conclusion could more directly address the "discuss both views" rubric instruction',
    'Increase hedging language in claims to reflect academic register: "may", "tend to", "suggests that"',
  ],
}

export default function WritingEval() {
  const [task, setTask] = useState<'1' | '2'>('2')
  const [essay, setEssay] = useState(SAMPLE_ESSAY)
  const [evaluated, setEvaluated] = useState(false)
  const [loading, setLoading] = useState(false)
  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length

  const handleEvaluate = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setEvaluated(true) }, 2000)
  }

  const BandPill = ({ label, score }: { label: string; score: number }) => (
    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-center" style={{ borderRadius: 3 }}>
      <div className="mono text-[9px] text-[#94A3B8] tracking-widest mb-1">{label}</div>
      <div className={`mono text-xl font-bold ${score >= 7.5 ? 'text-[#059669]' : score >= 6.5 ? 'text-[#DC2626]' : 'text-[#D97706]'}`}>{score.toFixed(1)}</div>
    </div>
  )

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="label-tag mb-1">AI WRITING EVALUATION · IELTS ACADEMIC</div>
      <h1 className="text-2xl font-bold text-[#0F172A] plex tracking-tight mb-1">Essay Evaluation</h1>
      <p className="text-sm text-[#64748B] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
        Submit your IELTS essay for AI-powered band score prediction and detailed linguistic feedback.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        {/* Left: submission */}
        <div className="space-y-4">
          {/* Task selector */}
          <div className="bg-white border border-[#E2E8F0] p-4" style={{ borderRadius: 4 }}>
            <div className="label-tag mb-3">TASK TYPE</div>
            <div className="flex gap-2">
              {(['1', '2'] as const).map(t => (
                <button key={t} onClick={() => setTask(t)}
                  className={`flex-1 py-2.5 text-xs font-semibold border-2 transition-all ${task === t ? 'bg-[#0F172A] border-[#0F172A] text-white' : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'}`}
                  style={{ borderRadius: 3, fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Task {t} — {t === '1' ? 'Data Description / Letter' : 'Discursive Essay'}
                </button>
              ))}
            </div>
          </div>

          {/* Essay prompt */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4" style={{ borderRadius: 4 }}>
            <div className="label-tag mb-2">QUESTION PROMPT</div>
            <p className="text-[12px] text-[#374151] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              {task === '2'
                ? 'Some people believe that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your own opinion.'
                : 'The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.'}
            </p>
          </div>

          {/* Textarea */}
          <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9]">
              <div className="label-tag">YOUR ESSAY</div>
              <div className="flex items-center gap-3">
                <span className={`mono text-[11px] font-medium ${wordCount < 250 ? 'text-danger' : wordCount > 400 ? 'text-warning' : 'text-success'}`}>
                  {wordCount} words
                </span>
                <span className="mono text-[10px] text-[#94A3B8]">Min: 250</span>
              </div>
            </div>
            <textarea
              value={essay}
              onChange={e => setEssay(e.target.value)}
              className="w-full p-4 text-[13px] text-[#374151] leading-[1.8] outline-none resize-none bg-transparent"
              style={{ fontFamily: 'Inter, sans-serif', minHeight: 420 }}
              placeholder="Paste or type your IELTS essay here..."
            />
          </div>

          <button onClick={handleEvaluate} disabled={loading || wordCount < 50}
            className={`w-full py-3.5 text-sm font-semibold text-white transition-colors relative overflow-hidden ${
              loading ? 'bg-[#FCA5A5] cursor-wait' : 'bg-[#DC2626] hover:bg-[#B91C1C]'
            }`}
            style={{ borderRadius: 4, fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full anim-spin" />
                Analysing Essay with AI...
              </span>
            ) : 'Evaluate Essay →'}
          </button>
        </div>

        {/* Right: feedback */}
        {!evaluated ? (
          <div className="bg-white border border-[#E2E8F0] p-8 flex flex-col items-center justify-center text-center" style={{ borderRadius: 4 }}>
            <div className="w-14 h-14 bg-[#FEE2E2] flex items-center justify-center mb-4" style={{ borderRadius: 4 }}>
              <span className="text-[#DC2626] text-2xl">✦</span>
            </div>
            <div className="text-sm font-semibold text-[#0F172A] plex mb-2">AI Evaluation Ready</div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Submit your essay to receive instant band score prediction across all four IELTS Writing criteria, plus grammar and vocabulary feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Band score */}
            <div className="bg-white border border-[#E2E8F0] p-5 corner-mark" style={{ borderRadius: 4 }}>
              <div className="label-tag mb-3">ESTIMATED BAND SCORE</div>
              <div className="flex items-center justify-between mb-4">
                <div className="mono text-5xl font-bold text-[#DC2626]">{FEEDBACK.band}</div>
                <div className="text-right">
                  <div className="text-xs text-[#94A3B8] plex">Score Range</div>
                  <div className="mono text-sm text-[#374151] font-semibold">7.0 – 8.0</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <BandPill label="TASK ACHIEVEMENT" score={FEEDBACK.ta} />
                <BandPill label="COHERENCE & COHESION" score={FEEDBACK.cc} />
                <BandPill label="LEXICAL RESOURCE" score={FEEDBACK.lr} />
                <BandPill label="GRAMMATICAL RANGE" score={FEEDBACK.gra} />
              </div>
              <p className="text-[11px] text-[#374151] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{FEEDBACK.summary}</p>
            </div>

            {/* Grammar */}
            <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
              <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center gap-2">
                <span className="w-1 h-4 bg-danger" style={{ borderRadius: 1 }} />
                <span className="text-xs font-semibold text-[#0F172A] plex">Grammar & Syntax</span>
              </div>
              <div className="divide-y divide-[#F8FAFC]">
                {FEEDBACK.grammar.map((g, i) => (
                  <div key={i} className="p-4">
                    <div className={`mono text-[9px] px-1.5 py-0.5 inline-block mb-2`}
                      style={{ borderRadius: 2, color: g.type === 'error' ? '#DC2626' : '#D97706', background: g.type === 'error' ? '#FEF2F2' : '#FFFBEB' }}>
                      {g.type.toUpperCase()}
                    </div>
                    <p className="text-[11px] text-[#374151] italic mb-1 border-l-2 border-[#E2E8F0] pl-2" style={{ fontFamily: 'Inter, sans-serif' }}>"{g.text}"</p>
                    <p className="text-[11px] text-[#64748B] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{g.issue}</p>
                    <p className="text-[11px] text-[#DC2626]" style={{ fontFamily: 'Inter, sans-serif' }}>→ {g.fix}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vocabulary */}
            <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
              <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center gap-2">
                <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
                <span className="text-xs font-semibold text-[#0F172A] plex">Vocabulary Suggestions</span>
              </div>
              {FEEDBACK.vocab.map((v, i) => (
                <div key={i} className="p-4 border-b border-[#F8FAFC] last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="mono text-xs text-[#374151] font-semibold">"{v.word}"</span>
                    <span className="mono text-[9px] text-[#BE123C] bg-[#FFE4E6] px-1 py-0.5" style={{ borderRadius: 2 }}>{v.level}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{v.note}</p>
                  <p className="text-[11px] text-[#DC2626]" style={{ fontFamily: 'Inter, sans-serif' }}>Alternatives: {v.suggestion}</p>
                </div>
              ))}
            </div>

            {/* Improvements */}
            <div className="bg-white border border-[#E2E8F0] p-4" style={{ borderRadius: 4 }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-[#DC2626]" style={{ borderRadius: 1 }} />
                <span className="text-xs font-semibold text-[#0F172A] plex">Improvement Suggestions</span>
              </div>
              <ol className="space-y-2">
                {FEEDBACK.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mono text-[10px] text-[#CBD5E1] mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[11px] text-[#374151] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{imp}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
