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

function compileLiveDraft(docType: DocType, form: Record<string, string>): string {
  const name = form.name?.trim() || ''
  const email = form.email?.trim() || ''
  const country = form.country?.trim() || ''
  const ielts = form.ielts?.trim() || ''
  const degree = form.degree?.trim() || ''
  const skills = form.skills?.trim() || ''
  const experience = form.experience?.trim() || ''
  const university = form.university?.trim() || ''
  const program = form.program?.trim() || form.course?.trim() || ''
  const interests = form.interests?.trim() || ''
  const background = form.background?.trim() || ''
  const why = form.why?.trim() || ''
  const goals = form.goals?.trim() || ''
  const motivation = form.motivation?.trim() || ''
  const extra = form.extra?.trim() || ''
  const position = form.position?.trim() || ''
  const company = form.company?.trim() || ''
  const tone = form.tone?.trim() || 'Professional'

  switch (docType) {
    case 'cv':
      return `CURRICULUM VITAE

${name.toUpperCase()}
Email: ${email} | Location: ${country} | English Proficiency: IELTS Band ${ielts}
Professional Profile: linkedin.com/in/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}

CAREER OBJECTIVE
A research-driven, results-oriented candidate with a strong academic foundation in ${degree}. Seeking challenging graduate study or professional opportunities in ${country} to contribute to innovative projects and bridge fundamental theory with high-impact implementation.

ACADEMIC BACKGROUND
${degree}
• English Language Competency: IELTS Overall Band ${ielts} (Academic Module)
• Status: High academic standing with rigorous domain coursework

TECHNICAL SKILLS & EXPERTISE
• Core Competencies: ${skills}
• Methodologies: Agile development, systematic problem solving, and modular design

WORK & RESEARCH EXPERIENCE
${experience}
• Designed, evaluated, and deployed reliable modules with measurable improvements.
• Conducted technical syntheses, authored documentation, and participated in peer reviews.
• Collaborated in team-based environments to solve complex domain problems under deadline constraints.

ACADEMIC PROJECTS
• Applied Systems Implementation: Built projects demonstrating algorithmic optimization and clean architecture.
• Assistive / Applied Solutions: Designed practical prototypes tailored to solve concrete user needs.

AWARDS & HONORS
• Academic Merit Recognition: Commended for departmental excellence and sustained academic distinction.

LEADERSHIP & EXTRACURRICULAR
• Active contributor to peer workshops, student communities, and collaborative projects.
• Destination Preference: ${country}

REFERENCES
Available upon request from academic faculty and professional supervisors.`

    case 'sop':
      return `STATEMENT OF PURPOSE

Applicant: ${name}
Target Program: ${program}
Institution: ${university}

Dear Members of the Admissions Committee,

I am writing to express my strong enthusiasm for admission to the ${program} at ${university}. Having built a robust academic foundation in ${background}, I am eager to contribute to your scholarly community and pursue advanced work in this field.

My academic trajectory has been shaped by an insatiable curiosity regarding ${interests}. Throughout my coursework and practical initiatives, I cultivated a disciplined methodology for problem formulation and empirical verification.

What particularly distinguishes ${university} is ${why}. Having followed the faculty's contributions and research breakthroughs, I am confident that joining your department will provide the ideal environment and mentorship to expand my research paradigms.

Following completion of my studies at ${university}, my objective is ${goals}. I am confident that the rigorous training and collaborative ethos of your institution will empower me to make meaningful contributions to the field.

Thank you for your time and consideration of my application.

Sincerely,

${name}`

    case 'ps':
      return `PERSONAL STATEMENT

Applicant: ${name}
Target Course: ${program}
Institution: ${university}

The defining catalyst for my academic trajectory was ${motivation}. From an early stage, I became fascinated by how systematic inquiry and structured thinking can uncover solutions to multi-layered real-world challenges. This curiosity propelled my dedicated performance throughout my academic journey, where I learned that genuine growth requires resilience, critical questioning, and continuous reflection.

Beyond academic milestones, my personal development has been enriched by diverse activities: ${extra}. These experiences taught me effective teamwork, cross-cultural empathy, and the ability to maintain composure under demanding deadlines.

Studying ${program} at ${university} represents the vital next step in my aspiration to ${why}. I am eager to bring my dedication, unique perspective, and proactive energy to your vibrant community.

Sincerely,

${name}`

    case 'cl':
      return `COVER LETTER

${name}

Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Hiring Committee
${company}

RE: Application for ${position} (${tone})

Dear Hiring Team,

I am writing to express my strong interest in the ${position} position at ${company}. With a solid background and proven hands-on capability in ${experience}, I am eager to contribute to your team's initiatives and support your ongoing innovation.

Throughout my professional endeavors, I have cultivated specialized expertise that directly aligns with your requirements. My practical background has enabled me to approach complex problems methodically, optimize performance bottlenecks, and deliver maintainable, high-impact solutions.

I am particularly drawn to ${company} because ${why}. Your organization's vision aligns directly with my professional values, and I am excited by the opportunity to apply my skills to high-impact challenges.

Thank you for considering my application. I welcome the opportunity to discuss how my qualifications match your team's objectives.

Sincerely,

${name}`
  }
}

export default function DocGenerator() {
  const { user } = useAuth()
  const [docType, setDocType] = useState<DocType>('cv')
  const [forms, setForms] = useState<Record<DocType, Record<string, string>>>({
    cv: {},
    sop: {},
    ps: {},
    cl: {},
  })
  const [isGenerated, setIsGenerated] = useState(false)
  const [aiExpanded, setAiExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState('')
  const [copied, setCopied] = useState(false)
  const [docSource, setDocSource] = useState('DOCUMENT PREVIEW')
  const [error, setError] = useState('')

  const form = forms[docType] || {}
  const fields = FORM_FIELDS[docType]

  // A form is properly filled only when all required fields have non-empty values
  const isFormProperlyFilled = fields.every(f => Boolean((form[f.key] || '').trim()))

  // Document only displays once the user explicitly clicks the Generate button
  const displayedDocument = isGenerated ? generatedText : ''

  const handleFieldChange = (key: string, value: string) => {
    setForms(prev => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        [key]: value,
      },
    }))
  }

  const handleGenerate = async () => {
    if (!isFormProperlyFilled) {
      setError('Please fill in all details on the left before generating.')
      return
    }
    setLoading(true)
    setError('')
    setCopied(false)
    try {
      const payloadDetails = {
        name: form.name,
        email: form.email,
        country: form.country,
        ielts: form.ielts,
        degree: form.degree || form.background,
        ...form,
      }

      // Try AI engine first
      try {
        const res = await generateDocumentApi(docType, payloadDetails, {
          name: payloadDetails.name,
          country: payloadDetails.country,
        })
        const cleanContent = stripMarkdown(res.content || '')
        if (cleanContent && cleanContent.length > 50) {
          setGeneratedText(cleanContent)
          setDocSource(res.source || 'AI Engine (puku-ai-2.8)')
          setIsGenerated(true)
          setAiExpanded(true)
          return
        }
      } catch (aiErr) {
        console.warn('AI expansion unavailable, compiling formatted template:', aiErr)
      }

      // Compile formatted document
      const formatted = compileLiveDraft(docType, form)
      setGeneratedText(formatted)
      setDocSource('FORMATTED DRAFT')
      setIsGenerated(true)
      setAiExpanded(false)
    } catch (err: any) {
      setError(err?.message || 'Failed to generate document.')
    } finally {
      setLoading(false)
    }
  }

  const copyDocument = async () => {
    if (!displayedDocument) return
    await navigator.clipboard.writeText(displayedDocument)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTxt = () => {
    if (!displayedDocument) return
    const blob = new Blob([displayedDocument], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${docType.toUpperCase()}_${form.name || 'Document'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cleanSymbolsNow = () => {
    if (generatedText) {
      setGeneratedText(prev => stripMarkdown(prev))
    }
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
              setIsGenerated(false)
              setGeneratedText('')
              setAiExpanded(false)
              setDocSource('DOCUMENT PREVIEW')
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
            <span className="mono text-[9px] text-muted border border-divider px-2 py-0.5 rounded">CUSTOMIZE</span>
          </div>
          <div className="p-5 space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="mono text-[10px] text-subtle tracking-widest block mb-1.5">{f.label.toUpperCase()}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={form[f.key] || ''}
                    onChange={e => handleFieldChange(f.key, e.target.value)}
                    placeholder={`Enter your ${f.label.toLowerCase()}...`}
                    className="w-full border border-divider focus:border-[#DC2626] px-3 py-2 text-[12px] text-graphite outline-none resize-none transition-colors bg-paper"
                    style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif', minHeight: 72 }}
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={form[f.key] || ''}
                    onChange={e => handleFieldChange(f.key, e.target.value)}
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
                    onChange={e => handleFieldChange(f.key, e.target.value)}
                    placeholder={f.key === 'name' ? (user?.name ? `e.g. ${user.name}` : 'Enter your full name...') : `Enter ${f.label.toLowerCase()}...`}
                    className="w-full border border-divider focus:border-[#DC2626] px-3 py-2 text-[12px] text-graphite outline-none bg-paper transition-colors"
                    style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif' }}
                  />
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !isFormProperlyFilled}
              className={`w-full py-3 text-sm font-semibold text-white transition-colors cursor-pointer ${
                loading || !isFormProperlyFilled ? 'bg-[#FCA5A5] cursor-not-allowed' : 'bg-[#DC2626] hover:bg-[#B91C1C]'
              }`}
              style={{ borderRadius: 4, fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating Document...
                </span>
              ) : (
                `⚡ Generate Document`
              )}
            </button>
            <p className="text-[10px] leading-relaxed text-subtle">
              Complete your details above, then click Generate to create your customized {DOC_TYPES.find(d => d.id === docType)?.label}.
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-surface border border-divider flex flex-col" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-divider-soft flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-ink plex">Document Preview</span>
              {isGenerated ? (
                <span className="mono text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold">
                  ● GENERATED
                </span>
              ) : isFormProperlyFilled ? (
                <span className="mono text-[9px] px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold">
                  READY TO GENERATE
                </span>
              ) : (
                <span className="mono text-[9px] px-2 py-0.5 bg-surface-2 text-muted border border-divider rounded">
                  AWAITING INPUT
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="mono text-[9px] px-2 py-1 bg-surface-2 text-ink border border-divider rounded">
                ⚡ {isGenerated ? docSource : 'AWAITING GENERATION'}
              </span>
              {isGenerated && (
                <button
                  type="button"
                  onClick={cleanSymbolsNow}
                  title="Strip asterisks, hashes, and markdown artifacts"
                  className="mono text-[10px] text-muted border border-divider px-2.5 py-1.5 hover:border-line-strong hover:text-ink transition-colors rounded cursor-pointer"
                >
                  Clean Symbols
                </button>
              )}
              <button
                type="button"
                onClick={copyDocument}
                disabled={!isGenerated || !generatedText}
                className="mono text-[10px] text-muted border border-divider px-3 py-1.5 hover:border-line-strong transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {copied ? '✓ Copied!' : 'Copy Text'}
              </button>
              <button
                type="button"
                onClick={downloadTxt}
                disabled={!isGenerated || !generatedText}
                className="mono text-[10px] text-white bg-[#DC2626] px-3 py-1.5 hover:bg-[#B91C1C] transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Download .txt
              </button>
              <button
                type="button"
                onClick={() => generatedText && window.print()}
                disabled={!isGenerated || !generatedText}
                className="mono text-[10px] text-white bg-navy px-3 py-1.5 hover:bg-navy-mid transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            <div className="bg-surface border border-divider-soft shadow-sm rounded-md p-6 sm:p-8 max-w-3xl mx-auto min-h-[520px] flex flex-col">
              {!isGenerated || !generatedText ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4">
                  <div className="w-14 h-14 rounded-full bg-surface-2 border border-divider flex items-center justify-center text-2xl mb-3 text-subtle">
                    📄
                  </div>
                  <div className="text-base font-semibold text-ink plex mb-1">
                    {isFormProperlyFilled ? 'Ready to Generate' : 'Input Details to Begin'}
                  </div>
                  <p className="text-xs text-subtle max-w-md leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {isFormProperlyFilled
                      ? `Your details are ready. Click the "⚡ Generate Document" button on the left to generate your custom ${DOC_TYPES.find(d => d.id === docType)?.label}.`
                      : `Enter your details in the form on the left. The document will only be generated once you click the Generate button.`}
                  </p>
                </div>
              ) : (
                <textarea
                  value={generatedText}
                  onChange={e => setGeneratedText(e.target.value)}
                  className="w-full text-[13px] text-graphite leading-[1.85] outline-none border-none resize-y bg-transparent flex-1"
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: 520 }}
                  placeholder="Your generated document will appear here..."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
