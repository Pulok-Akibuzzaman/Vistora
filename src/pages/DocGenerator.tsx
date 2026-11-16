import { useState } from 'react'
import Icon from '../components/Icon'
import { generateDocumentApi, saveApplicationDocumentApi } from '../lib/api'
import { useAuth } from '../lib/authContext'
import { themeText } from '../lib/theme'

type DocType = 'cv' | 'sop' | 'ps' | 'cl'
type DocumentIconType = 'cv' | 'sop' | 'ps' | 'cl'

const DOC_TYPES: { id: DocType; label: string; desc: string; icon: DocumentIconType }[] = [
  { id: 'cv', label: 'Curriculum Vitae', desc: 'Showcase your education, skills, and experience for applications.', icon: 'cv' },
  { id: 'sop', label: 'Statement of Purpose', desc: 'Explain your academic goals and why a program is right for you.', icon: 'sop' },
  { id: 'ps', label: 'Personal Statement', desc: 'Share your story and motivation for a course or scholarship.', icon: 'ps' },
  { id: 'cl', label: 'Cover Letter', desc: 'Introduce yourself and connect your experience to a role.', icon: 'cl' },
]

function DocumentIcon({ type, active }: { type: DocumentIconType; active: boolean }) {
  const stroke = active ? '#FFFFFF' : '#DC2626'
  return (
    <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {type === 'cv' && (
        <>
          <path d="M6 3.75h8l4 4V20.25H6z" />
          <path d="M14 3.75v4h4M9 12h6M9 15h6M9 18h3" />
        </>
      )}
      {type === 'sop' && (
        <>
          <path d="m3.5 9 8.5-4 8.5 4-8.5 4z" />
          <path d="M6.5 11.2v4.1c2.8 2 8.2 2 11 0v-4.1M20.5 9v5" />
        </>
      )}
      {type === 'ps' && (
        <>
          <circle cx="12" cy="8" r="3" />
          <path d="M5.5 20c.7-3.1 3-5 6.5-5s5.8 1.9 6.5 5M18.5 4.5l1 1M20 3l1 1" />
        </>
      )}
      {type === 'cl' && (
        <>
          <rect x="4" y="6" width="16" height="13" rx="1.5" />
          <path d="m4.5 8 7.5 5 7.5-5M8 3.5h8" />
        </>
      )}
    </svg>
  )
}

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


function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDocumentToHtml(rawContent: string, docTitle: string, docType: DocType): string {
  const lines = rawContent.split(/\r?\n/)
  const bodyHtml: string[] = []
  let inList = false

  const closeListIfOpen = () => {
    if (inList) {
      bodyHtml.push('</ul>')
      inList = false
    }
  }

  const isHeading = (line: string): boolean => {
    const trimmed = line.trim()
    if (!trimmed) return false
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) return true
    if (trimmed.length > 55) return false
    const lettersOnly = trimmed.replace(/[^A-Za-z]/g, '')
    if (lettersOnly.length >= 3 && trimmed === trimmed.toUpperCase()) return true
    return false
  }

  const isMetaLine = (line: string): boolean => {
    return (
      line.startsWith('Email:') ||
      line.startsWith('Applicant:') ||
      line.startsWith('Target Program:') ||
      line.startsWith('Target Course:') ||
      line.startsWith('Institution:') ||
      line.startsWith('Position Applied:') ||
      line.startsWith('Company:') ||
      line.startsWith('Date:') ||
      line.startsWith('RE:') ||
      line.startsWith('Professional Profile:') ||
      line.startsWith('Location:') ||
      line.startsWith('English Proficiency:')
    )
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      closeListIfOpen()
      continue
    }

    if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        bodyHtml.push('<ul class="doc-list">')
        inList = true
      }
      const itemText = line.replace(/^[•\-\*]\s*/, '')
      bodyHtml.push('  <li>' + escapeHtml(itemText) + '</li>')
      continue
    }

    closeListIfOpen()

    // First heading is main document title
    if (i === 0 || (bodyHtml.length === 0 && isHeading(line))) {
      const cleanTitle = line.replace(/^#+\s*/, '')
      bodyHtml.push('<div class="doc-main-header"><h1 class="doc-main-title">' + escapeHtml(cleanTitle) + '</h1></div>')
      continue
    }

    // Candidate name (e.g. line right after title in CV or Cover letter)
    if (bodyHtml.length === 1 && lines[i - 1]?.trim() === '' && isHeading(line)) {
      bodyHtml.push('<div class="doc-candidate-name">' + escapeHtml(line) + '</div>')
      continue
    }

    if (isHeading(line)) {
      const cleanHeading = line.replace(/^#+\s*/, '')
      bodyHtml.push('<h2 class="doc-section-heading">' + escapeHtml(cleanHeading) + '</h2>')
      continue
    }

    if (isMetaLine(line)) {
      const isCentered = docType === 'cv' || line.includes('Email:') || line.includes('Professional Profile:')
      bodyHtml.push('<div class="' + (isCentered ? 'doc-meta-line' : 'doc-meta-line-left') + '">' + escapeHtml(line) + '</div>')
      continue
    }

    if (line.startsWith('Dear ') || line.startsWith('Sincerely,') || line.startsWith('Regards,') || line.startsWith('Hiring Committee')) {
      bodyHtml.push('<p class="doc-salutation">' + escapeHtml(line) + '</p>')
      continue
    }

    bodyHtml.push('<p class="doc-paragraph">' + escapeHtml(line) + '</p>')
  }

  closeListIfOpen()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(docTitle)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm 18mm 20mm 18mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.55;
    }
    .print-sheet {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }
    .doc-main-header {
      text-align: center;
      margin-bottom: 12pt;
      padding-bottom: 6pt;
      border-bottom: 2px solid #0f172a;
    }
    .doc-main-title {
      font-size: 17pt;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #0f172a;
      margin: 0;
    }
    .doc-candidate-name {
      font-size: 13pt;
      font-weight: 700;
      letter-spacing: 0.03em;
      color: #0f172a;
      margin: 6pt 0 4pt 0;
      text-align: center;
    }
    .doc-meta-line {
      font-size: 9.5pt;
      color: #334155;
      margin: 2pt 0;
      line-height: 1.4;
      text-align: center;
    }
    .doc-meta-line-left {
      font-size: 9.5pt;
      color: #334155;
      margin: 2pt 0;
      line-height: 1.4;
      text-align: left;
    }
    .doc-section-heading {
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #0f172a;
      margin-top: 14pt;
      margin-bottom: 4pt;
      padding-bottom: 2pt;
      border-bottom: 1.5px solid #cbd5e1;
      page-break-after: avoid;
      break-after: avoid;
    }
    .doc-salutation {
      margin: 10pt 0 4pt 0;
      font-weight: 600;
      font-size: 10.5pt;
      color: #0f172a;
    }
    .doc-paragraph {
      margin: 6pt 0;
      font-size: 10.5pt;
      line-height: 1.6;
      color: #1e293b;
      text-align: justify;
      text-justify: inter-word;
    }
    .doc-list {
      margin: 3pt 0 6pt 0;
      padding-left: 16pt;
      list-style-type: disc;
    }
    .doc-list li {
      margin-bottom: 3pt;
      font-size: 10pt;
      line-height: 1.5;
      color: #1e293b;
    }
  </style>
</head>
<body>
  <div class="print-sheet">
    ${bodyHtml.join('\n    ')}
  </div>
</body>
</html>`
}

function printFormattedDocument(rawContent: string, docTitle: string, docType: DocType): void {
  const formattedHtml = formatDocumentToHtml(rawContent, docTitle, docType)

  // Use an isolated hidden iframe so printing excludes all website layout, navbar, and footer
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.top = '-10000px'
  iframe.style.left = '-10000px'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    const win = window.open('', '_blank')
    if (win) {
      win.document.open()
      win.document.write(formattedHtml)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 350)
    }
    return
  }

  doc.open()
  doc.write(formattedHtml)
  doc.close()

  const cleanup = () => {
    setTimeout(() => {
      try {
        if (iframe.parentNode) {
          document.body.removeChild(iframe)
        }
      } catch {
        // ignore cleanup error
      }
    }, 2500)
  }

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } catch (err) {
      console.warn('Iframe print failed, opening popup window:', err)
      const win = window.open('', '_blank')
      if (win) {
        win.document.open()
        win.document.write(formattedHtml)
        win.document.close()
        win.focus()
        setTimeout(() => win.print(), 350)
      }
    } finally {
      cleanup()
    }
  }, 250)
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
          saveApplicationDocumentApi({
            docType,
            title: `${DOC_TYPES.find(d => d.id === docType)?.label} - ${payloadDetails.name || 'Application'}`,
            content: cleanContent,
            formData: form,
          }, user?.id).catch(() => {})
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
      saveApplicationDocumentApi({
        docType,
        title: `${DOC_TYPES.find(d => d.id === docType)?.label} - ${payloadDetails.name || 'Application'}`,
        content: formatted,
        formData: form,
      }, user?.id).catch(() => {})
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

  
  const handlePrintPdf = () => {
    if (!generatedText) return
    const docTypeName = DOC_TYPES.find(d => d.id === docType)?.label || 'Application Document'
    const applicantName = (form.name || user?.name || 'Applicant').trim()
    const pageTitle = `${docTypeName} - ${applicantName}`
    printFormattedDocument(generatedText, pageTitle, docType)
  }

  const cleanSymbolsNow = () => {
    if (generatedText) {
      setGeneratedText(prev => stripMarkdown(prev))
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="label-tag mb-1 no-print">AI DOCUMENT GENERATOR · VISTORA</div>
      <h1 className="text-2xl font-bold text-ink plex tracking-tight mb-1 no-print">Application Document Generator</h1>
      <p className="text-sm text-muted mb-6 no-print">
        Generate custom, professionally structured academic and career documents tailored to your profile.
      </p>

      {/* Doc type selector */}
      <div className="mb-3 no-print">
        <div className="text-sm font-semibold text-ink plex">What would you like to create?</div>
        <div className="mt-1 text-xs text-muted">Choose a document type to start with the right structure and prompts.</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 no-print">
        {DOC_TYPES.map(d => (
          <button
            key={d.id}
            type="button"
            aria-pressed={docType === d.id}
            onClick={() => {
              setDocType(d.id)
              setIsGenerated(false)
              setGeneratedText('')
              setAiExpanded(false)
              setDocSource('DOCUMENT PREVIEW')
              setError('')
            }}
            className={`group flex min-h-[204px] flex-col text-left p-5 border transition-all ${
              docType === d.id
                ? 'border-[#DC2626] bg-electric-soft shadow-sm'
                : 'border-divider bg-surface hover:border-line-strong hover:shadow-sm'
            }`}
            style={{ borderRadius: 4 }}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${
                docType === d.id ? 'bg-[#DC2626] text-white' : 'bg-surface-2 text-subtle group-hover:bg-electric-soft group-hover:text-accent'
                }`}
                style={{ color: docType === d.id ? undefined : themeText('#64748B') }}
              >
                <DocumentIcon type={d.icon} active={docType === d.id} />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-base font-bold leading-5 text-ink plex">{d.label}</div>
                  {docType === d.id && <span className="shrink-0 text-sm font-bold leading-5 text-accent" aria-hidden="true">✓</span>}
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs leading-5 text-subtle">
              {d.desc}
            </div>
            <div className={`mt-auto pt-5 text-[11px] font-semibold transition-colors ${
              docType === d.id ? 'text-accent' : 'text-muted group-hover:text-accent'
            }`}>
              {docType === d.id ? 'Selected' : 'Use this template'} <span aria-hidden="true">→</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        {/* Form */}
        <div className="bg-surface border border-divider no-print" style={{ borderRadius: 4 }}>
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
                    style={{ borderRadius: 3, minHeight: 72 }}
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={form[f.key] || ''}
                    onChange={e => handleFieldChange(f.key, e.target.value)}
                    className="w-full border border-divider focus:border-[#DC2626] px-3 py-2 text-[12px] text-graphite outline-none bg-paper"
                    style={{ borderRadius: 3 }}
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
                    style={{ borderRadius: 3 }}
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
                <><Icon name="zap" /> Generate Document</>
              )}
            </button>
            <p className="text-[10px] leading-relaxed text-subtle">
              Complete your details above, then click Generate to create your customized {DOC_TYPES.find(d => d.id === docType)?.label}.
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-surface border border-divider flex flex-col" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-divider-soft flex flex-wrap items-center justify-between gap-2 flex-shrink-0 no-print">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-ink plex">Document Preview</span>
              {isGenerated ? (
                <span className="mono text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold">
                  ● GENERATED
                </span>
              ) : isFormProperlyFilled ? (
                <span className="mono text-[9px] px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded font-semibold">
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
                <Icon name="zap" /> {isGenerated ? docSource : 'AWAITING GENERATION'}
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
                onClick={handlePrintPdf}
                disabled={!isGenerated || !generatedText}
                title="Format and print or save document as PDF"
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
                    <Icon name="file" />
                  </div>
                  <div className="text-base font-semibold text-ink plex mb-1">
                    {isFormProperlyFilled ? 'Ready to Generate' : 'Input Details to Begin'}
                  </div>
                  <p className="text-xs text-subtle max-w-md leading-relaxed">
                    {isFormProperlyFilled
                      ? `Your details are ready. Click the "Generate Document" button on the left to generate your custom ${DOC_TYPES.find(d => d.id === docType)?.label}.`
                      : `Enter your details in the form on the left. The document will only be generated once you click the Generate button.`}
                  </p>
                </div>
              ) : (
                <>
                  <textarea
                    value={generatedText}
                    onChange={e => setGeneratedText(e.target.value)}
                    className="w-full text-[13px] text-graphite leading-[1.85] outline-none border-none resize-y bg-transparent flex-1 print:hidden"
                    style={{ fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: 520 }}
                    placeholder="Your generated document will appear here..."
                  />
                  <div className="hidden print:block text-ink whitespace-pre-wrap font-serif text-[11pt] leading-[1.6]">
                    {generatedText}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
