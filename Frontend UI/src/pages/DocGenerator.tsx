import { useState } from 'react'
import { generateDocumentApi } from '../lib/api'
import { useAuth } from '../lib/authContext'
import { themeText } from '../lib/theme'

type DocType = 'cv' | 'sop' | 'ps' | 'cl'

const DOC_TYPES: { id: DocType; label: string; desc: string; icon: string }[] = [
  { id: 'cv', label: 'Curriculum Vitae', desc: 'Academic / professional CV for university or visa applications', icon: '◈' },
  { id: 'sop', label: 'Statement of Purpose', desc: 'Graduate school SOP tailored to your target program', icon: '✦' },
  { id: 'ps', label: 'Personal Statement', desc: 'Undergraduate or scholarship personal statement', icon: '◎' },
  { id: 'cl', label: 'Cover Letter', desc: 'Professional cover letter for job or internship applications', icon: '▣' },
]

const FORM_FIELDS: Record<DocType, { label: string; key: string; type: 'text' | 'textarea' | 'select'; options?: string[] }[]> = {
  cv: [
    { label: 'Full Name', key: 'name', type: 'text' },
    { label: 'Email Address', key: 'email', type: 'text' },
    { label: 'Current Degree / Institution', key: 'degree', type: 'text' },
    { label: 'Target Country', key: 'country', type: 'select', options: ['Canada', 'United Kingdom', 'Australia', 'Germany', 'USA', 'Netherlands'] },
    { label: 'IELTS Band Score', key: 'ielts', type: 'text' },
    { label: 'Key Skills & Expertise', key: 'skills', type: 'textarea' },
    { label: 'Work / Research Experience', key: 'experience', type: 'textarea' },
  ],
  sop: [
    { label: 'Full Name', key: 'name', type: 'text' },
    { label: 'Target Program', key: 'program', type: 'text' },
    { label: 'Target University', key: 'university', type: 'text' },
    { label: 'Research Interests', key: 'interests', type: 'textarea' },
    { label: 'Academic Background', key: 'background', type: 'textarea' },
    { label: 'Why This University?', key: 'why', type: 'textarea' },
    { label: 'Career Goals', key: 'goals', type: 'textarea' },
  ],
  ps: [
    { label: 'Full Name', key: 'name', type: 'text' },
    { label: 'Target Course', key: 'course', type: 'text' },
    { label: 'Target University', key: 'university', type: 'text' },
    { label: 'Motivating Experience', key: 'motivation', type: 'textarea' },
    { label: 'Extracurricular Activities', key: 'extra', type: 'textarea' },
    { label: 'Why This Subject?', key: 'why', type: 'textarea' },
  ],
  cl: [
    { label: 'Full Name', key: 'name', type: 'text' },
    { label: 'Position Applied For', key: 'position', type: 'text' },
    { label: 'Company / Organisation', key: 'company', type: 'text' },
    { label: 'Key Relevant Experience', key: 'experience', type: 'textarea' },
    { label: 'Why This Organisation?', key: 'why', type: 'textarea' },
    { label: 'Tone', key: 'tone', type: 'select', options: ['Formal Academic', 'Professional Corporate', 'Startup / Informal', 'Research-Oriented'] },
  ],
}

function stripMarkdown(text: string): string {
  if (!text) return ''
  return text
    // Remove horizontal rules like ---, ***, ___
    .replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, '')
    // Convert markdown headers (# Title, ## Subtitle) to clean uppercase text
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
    .trim()
}

function compileLiveDraft(docType: DocType, form: Record<string, string>, user: any): string {
  const name = form.name || user?.name || 'Applicant'
  const email = form.email || user?.email || 'applicant@email.com'
  const country = form.country || user?.country || user?.targetCountry || 'Bangladesh'
  const ielts = form.ielts || (user?.targetBand ? `${user.targetBand}` : '7.5')
  const degree = form.degree || (user?.institution ? `Graduate of ${user.institution}` : 'Computer Science and Engineering')
  const skills = form.skills || 'Algorithms, System Design, Full-Stack Development, Applied Computing'
  const experience = form.experience || 'Undergraduate academic projects, departmental research, and software internships'
  const university = form.university || 'Target University'
  const program = form.program || form.course || 'Graduate Studies'
  const interests = form.interests || 'Advanced computational systems, artificial intelligence, and scalable architectures'
  const why = form.why || 'The world-class faculty, collaborative research culture, and cutting-edge laboratory infrastructure'
  const goals = form.goals || 'To conduct pioneering research, contribute to international publications, and assume leading industry roles'
  const motivation = form.motivation || 'A long-standing fascination with algorithmic problem solving and building resilient human-centered systems'
  const extra = form.extra || 'Active participation in student developer clubs, competitive hackathons, and community mentorship'
  const position = form.position || 'Software Engineer / Graduate Researcher'
  const company = form.company || 'Leading Technology Organization'

  switch (docType) {
    case 'cv':
      return `CURRICULUM VITAE

${name.toUpperCase()}
Email: ${email} | Location: ${country} | English Proficiency: IELTS Band ${ielts}
Professional Profile: linkedin.com/in/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}

CAREER OBJECTIVE
A research-driven, results-oriented computer scientist and engineer with a strong academic foundation in ${degree}. Seeking challenging graduate study or technical opportunities in ${country} to contribute to innovative computational systems and bridge fundamental theory with high-impact implementation.

ACADEMIC BACKGROUND
${degree}
• Academic Track: Comprehensive focus on computational theory, applied systems, and software engineering
• English Language Competency: IELTS Overall Band ${ielts} (Academic Module)
• Status: High academic standing with rigorous coursework in algorithms, operating systems, and database architecture

TECHNICAL SKILLS & EXPERTISE
• Core Competencies: ${skills}
• Methodologies: Agile development, test-driven engineering, modular software design

WORK & RESEARCH EXPERIENCE
${experience}
• Designed, evaluated, and deployed reliable computational modules with measurable performance improvements.
• Conducted comprehensive technical syntheses, authored documentation, and participated in peer code reviews.
• Collaborated in team-based environments to solve complex domain problems under deadline constraints.

ACADEMIC PROJECTS
• Scalable Systems Implementation: Built end-to-end applications demonstrating algorithmic optimization and clean architecture.
• Assistive / Applied Computing: Designed practical prototypes tailored to solve concrete user needs with data-driven workflows.

AWARDS & HONORS
• Academic Merit Recognition: Commended for departmental excellence and sustained academic distinction.
• Competitive Engineering / Hackathon Honors: Recognized in technical competitions for algorithmic problem-solving.

LEADERSHIP & EXTRACURRICULAR
• Active contributor to peer technical workshops, student developer communities, and collaborative projects.
• Destination Preference: ${country}

REFERENCES
Available upon request from academic faculty and professional supervisors.`

    case 'sop':
      return `STATEMENT OF PURPOSE

Applicant: ${name}
Target Program: ${program}
Institution: ${university}

Dear Members of the Admissions Committee,

I am writing to express my strong enthusiasm for admission to the ${program} at ${university}. Having built a robust academic and practical foundation in ${degree}, I am eager to contribute to your scholarly community and pursue advanced work bridging fundamental computational theory with real-world technological innovation.

My academic trajectory has been shaped by an insatiable curiosity regarding ${interests}. Throughout my coursework and hands-on initiatives (${experience}), I cultivated a disciplined methodology for problem formulation and empirical verification. Achieving an overall IELTS score of Band ${ielts} affirmed my ability to articulate complex concepts fluidly in international academic discourse.

What particularly distinguishes ${university} is ${why}. Having followed the faculty's contributions and research breakthroughs, I am confident that joining your department will provide the ideal environment and mentorship to expand my research paradigms.

Following completion of my studies at ${university}, my objective is ${goals}. I am confident that the rigorous training and collaborative ethos of your institution will empower me to make meaningful contributions to the field.

Thank you for your time and consideration of my application.

Sincerely,

${name}
${email}`

    case 'ps':
      return `PERSONAL STATEMENT

Applicant: ${name}
Target Course: ${program}
Institution: ${university}

The defining catalyst for my academic trajectory was ${motivation}. From an early stage, I became fascinated by how systematic inquiry and structured thinking can uncover solutions to multi-layered real-world challenges. This curiosity propelled my dedicated performance throughout my academic journey, where I learned that genuine growth requires resilience, critical questioning, and continuous reflection.

Beyond academic milestones, my personal development has been enriched by diverse activities: ${extra}. These experiences taught me effective teamwork, cross-cultural empathy, and the ability to maintain composure under demanding deadlines. My IELTS score of Band ${ielts} represents not merely language proficiency, but my enthusiasm for engaging with global peers and diverse perspectives.

Studying ${program} at ${university} represents the vital next step in my aspiration to ${why}. I am eager to bring my dedication, unique perspective, and proactive energy to your vibrant community.

Sincerely,

${name}
${email}`

    case 'cl':
      return `COVER LETTER

${name}
Email: ${email}
Target Location: ${country}

Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Hiring Committee
${company}

RE: Application for ${position}

Dear Hiring Team,

I am writing to express my strong interest in the ${position} position at ${company}. With a solid background in ${degree} and proven hands-on capability in ${experience}, I am eager to contribute to your engineering initiatives and support your ongoing innovation.

Throughout my technical endeavors, I have cultivated specialized expertise in ${skills}. My practical background has enabled me to approach complex problems methodically, optimize performance bottlenecks, and deliver maintainable, user-focused solutions.

I am particularly drawn to ${company} because ${why}. Your organization's vision aligns directly with my professional values, and I am excited by the opportunity to apply my skills to high-impact challenges.

Thank you for considering my application. I welcome the opportunity to discuss how my qualifications match your team's objectives.

Sincerely,

${name}
${email}`
  }
}

export default function DocGenerator() {
  const { user } = useAuth()
  const [docType, setDocType] = useState<DocType>('cv')
  const [form, setForm] = useState<Record<string, string>>({})
  const [aiExpanded, setAiExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState('')
  const [copied, setCopied] = useState(false)
  const [docSource, setDocSource] = useState('LIVE DRAFT')
  const [error, setError] = useState('')

  const fields = FORM_FIELDS[docType]

  // Live dynamic draft that updates instantly as the user types
  const liveDraft = compileLiveDraft(docType, form, user)
  const displayedDocument = aiExpanded ? (generatedText || liveDraft) : liveDraft

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setCopied(false)
    try {
      const payloadDetails = {
        name: form.name || user?.name || 'Applicant',
        email: form.email || user?.email || 'applicant@email.com',
        country: form.country || user?.country || 'Bangladesh',
        ielts: form.ielts || `${user?.targetBand || 7.5}`,
        degree: form.degree || form.background || `${user?.institution || 'East West University'} Graduate`,
        ...form,
      }

      const res = await generateDocumentApi(docType, payloadDetails, {
        name: payloadDetails.name,
        country: payloadDetails.country,
      })
      const cleanContent = stripMarkdown(res.content || '')
      setGeneratedText(cleanContent)
      setDocSource(res.source || 'AI Engine (puku-ai-2.8)')
      setAiExpanded(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to generate document.')
    } finally {
      setLoading(false)
    }
  }

  const copyDocument = async () => {
    await navigator.clipboard.writeText(displayedDocument)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTxt = () => {
    const blob = new Blob([displayedDocument], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${docType.toUpperCase()}_${form.name || user?.name || 'Document'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cleanSymbolsNow = () => {
    if (aiExpanded) {
      setGeneratedText(prev => stripMarkdown(prev))
    }
  }

  const switchToLiveDraft = () => {
    setAiExpanded(false)
    setDocSource('LIVE DRAFT')
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="label-tag mb-1">AI DOCUMENT GENERATOR · VISTORA</div>
      <h1 className="text-2xl font-bold text-ink plex tracking-tight mb-1">Application Document Generator</h1>
      <p className="text-sm text-muted mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
        Generate custom, professionally structured academic and career documents tailored to your profile.
      </p>

      {/* Doc type selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {DOC_TYPES.map(d => (
          <button
            key={d.id}
            onClick={() => {
              setDocType(d.id)
              setAiExpanded(false)
              setDocSource('LIVE DRAFT')
              setError('')
            }}
            className={`text-left p-4 border-2 transition-all ${
              docType === d.id ? 'border-[#DC2626] bg-electric-soft' : 'border-divider bg-surface hover:border-line-strong'
            }`}
            style={{ borderRadius: 4 }}
          >
            <span className="text-lg mb-2 block" style={{ color: themeText(docType === d.id ? '#DC2626' : '#94A3B8') }}>
              {d.icon}
            </span>
            <div className="text-[13px] font-semibold text-ink plex mb-0.5">{d.label}</div>
            <div className="text-[11px] text-subtle" style={{ fontFamily: 'Inter, sans-serif' }}>
              {d.desc}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        {/* Form */}
        <div className="bg-surface border border-divider" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-divider-soft flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-[#DC2626]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-ink plex">Input Your Details</span>
            </div>
            <span className="mono text-[9px] text-accent bg-rose-50 px-2 py-0.5 rounded">REAL-TIME SYNC</span>
          </div>
          <div className="p-5 space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="mono text-[10px] text-subtle tracking-widest block mb-1.5">{f.label.toUpperCase()}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={`Enter your ${f.label.toLowerCase()}...`}
                    className="w-full border border-divider focus:border-[#DC2626] px-3 py-2 text-[12px] text-graphite outline-none resize-none transition-colors bg-paper"
                    style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif', minHeight: 72 }}
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-divider focus:border-[#DC2626] px-3 py-2 text-[12px] text-graphite outline-none bg-paper"
                    style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="">Select...</option>
                    {f.options?.map(o => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.key === 'name' ? (user?.name || 'Your Name') : `Enter ${f.label.toLowerCase()}...`}
                    className="w-full border border-divider focus:border-[#DC2626] px-3 py-2 text-[12px] text-graphite outline-none bg-paper transition-colors"
                    style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif' }}
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-3 text-sm font-semibold text-white transition-colors ${
                loading ? 'bg-[#FCA5A5]' : 'bg-[#DC2626] hover:bg-[#B91C1C]'
              }`}
              style={{ borderRadius: 4, fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Expanding with AI (puku-ai-2.8)...
                </span>
              ) : (
                `⚡ Generate AI Polish & Expansion`
              )}
            </button>
            <p className="text-[10px] leading-relaxed text-subtle">
              Your preview updates dynamically in real-time as you type. Click above for full AI expansion & multi-page polish.
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-surface border border-divider flex flex-col" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-divider-soft flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-ink plex">Live Document Preview</span>
              {aiExpanded ? (
                <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded border border-divider-soft text-[10px]">
                  <button
                    onClick={switchToLiveDraft}
                    className="px-2 py-0.5 rounded text-muted hover:text-ink transition-colors"
                  >
                    Live Draft
                  </button>
                  <button
                    className="px-2 py-0.5 rounded bg-white shadow-xs font-semibold text-[#DC2626]"
                  >
                    AI Polish
                  </button>
                </div>
              ) : (
                <span className="mono text-[9px] px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                  ● REAL-TIME SYNC
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="mono text-[9px] px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                ⚡ {docSource}
              </span>
              {aiExpanded && (
                <button
                  onClick={cleanSymbolsNow}
                  title="Strip asterisks, hashes, and markdown artifacts"
                  className="mono text-[10px] text-muted border border-divider px-2.5 py-1.5 hover:border-line-strong hover:text-ink transition-colors rounded"
                >
                  Clean Symbols
                </button>
              )}
              <button
                onClick={copyDocument}
                className="mono text-[10px] text-muted border border-divider px-3 py-1.5 hover:border-line-strong transition-colors rounded"
              >
                {copied ? '✓ Copied!' : 'Copy Text'}
              </button>
              <button
                onClick={downloadTxt}
                className="mono text-[10px] text-white bg-[#DC2626] px-3 py-1.5 hover:bg-[#B91C1C] transition-colors rounded"
              >
                Download .txt
              </button>
              <button
                onClick={() => window.print()}
                className="mono text-[10px] text-white bg-navy px-3 py-1.5 hover:bg-navy-mid transition-colors rounded"
              >
                Print / PDF
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-paper">
            {error && (
              <div className="mb-5 border-l-2 border-[#D97706] bg-warning-soft p-3 text-[11px] leading-relaxed text-caution-strong">
                {error}
              </div>
            )}
            <div className="bg-surface border border-divider-soft shadow-sm rounded-md p-6 sm:p-8 max-w-3xl mx-auto">
              <textarea
                value={displayedDocument}
                onChange={e => {
                  if (aiExpanded) {
                    setGeneratedText(e.target.value)
                  }
                }}
                className="w-full text-[13px] text-graphite leading-[1.85] outline-none border-none resize-y bg-transparent"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: 520 }}
                placeholder="Your document updates dynamically here..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
