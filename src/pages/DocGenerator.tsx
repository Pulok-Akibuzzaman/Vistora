import { useCallback, useEffect, useState } from 'react'
import Icon from '../components/Icon'
import {
  CS_SOP_ARCHIVE_URL,
  CS_SOP_NOTION_URL,
  SOP_TEMPLATES,
  type SopTemplate,
} from '../data/sopTemplates'
import {
  deleteApplicationDocumentApi,
  fetchUserApplicationDocumentsApi,
  generateDocumentApi,
  saveApplicationDocumentApi,
  type SavedApplicationDocument,
} from '../lib/api'
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
  const [activeTab, setActiveTab] = useState<'generator' | 'sop-templates' | 'saved'>('generator')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(SOP_TEMPLATES[0].id)
  const [subfieldFilter, setSubfieldFilter] = useState<string>('All')
  const [templateCopied, setTemplateCopied] = useState(false)
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
  const [docTitle, setDocTitle] = useState('')
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [savingDoc, setSavingDoc] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{
    type: 'cloud' | 'local' | 'error'
    message: string
  } | null>(null)
  const [savedDocs, setSavedDocs] = useState<SavedApplicationDocument[]>([])
  const [loadingSavedDocs, setLoadingSavedDocs] = useState(false)
  const [savedFilter, setSavedFilter] = useState<'all' | DocType>('all')
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
  const [syncingDocId, setSyncingDocId] = useState<string | null>(null)
  const [savedDocsError, setSavedDocsError] = useState('')

  const refreshSavedDocs = useCallback(async () => {
    setLoadingSavedDocs(true)
    try {
      const docs = await fetchUserApplicationDocumentsApi(user?.id)
      setSavedDocs(docs)
    } catch {
      setSavedDocs([])
    } finally {
      setLoadingSavedDocs(false)
    }
  }, [user?.id])

  useEffect(() => {
    refreshSavedDocs()
  }, [refreshSavedDocs])

  const subfields = ['All', ...Array.from(new Set(SOP_TEMPLATES.map(t => t.subfield)))]
  const filteredTemplates =
    subfieldFilter === 'All'
      ? SOP_TEMPLATES
      : SOP_TEMPLATES.filter(t => t.subfield === subfieldFilter)
  const selectedTemplate =
    filteredTemplates.find(t => t.id === selectedTemplateId) ||
    filteredTemplates[0] ||
    SOP_TEMPLATES[0]

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

  const buildDefaultDocTitle = (type: DocType, targetForm: Record<string, string>) => {
    const label = DOC_TYPES.find(d => d.id === type)?.label || type.toUpperCase()
    const applicant = (targetForm.name || user?.name || 'Application').trim()
    return `${label} - ${applicant}`
  }

  const upsertLocalSavedList = (saved: SavedApplicationDocument, previousId?: string | null) => {
    setSavedDocs(prev => {
      const filtered = prev.filter(
        item => item.id !== saved.id && (!previousId || item.id !== previousId)
      )
      return [saved, ...filtered]
    })
  }

  const persistDocument = async (params: {
    docType: DocType
    title: string
    content: string
    formData: Record<string, string>
    asNewCopy?: boolean
  }) => {
    const previousId = params.asNewCopy ? null : currentDocId
    const result = await saveApplicationDocumentApi(
      {
        id: previousId || undefined,
        docType: params.docType,
        title: params.title,
        content: params.content,
        formData: params.formData,
      },
      user?.id
    )

    setCurrentDocId(result.document.id)
    setDocTitle(result.document.title)
    upsertLocalSavedList(result.document, previousId)

    if (result.syncedToSupabase) {
      setSaveStatus({
        type: 'cloud',
        message: previousId
          ? 'Document updated in your Supabase database.'
          : 'Document saved to your Supabase database.',
      })
    } else {
      setSaveStatus({
        type: 'local',
        message:
          result.error ||
          'Saved locally in browser storage. Sign in to sync with Supabase.',
      })
    }

    return result
  }

  const handleSaveToDatabase = async (asNewCopy = false) => {
    const trimmedContent = generatedText.trim()
    if (!trimmedContent) {
      setError('Generate or enter document content before saving.')
      return
    }
    setSavingDoc(true)
    setError('')
    try {
      const titleToSave = docTitle.trim() || buildDefaultDocTitle(docType, form)
      await persistDocument({
        docType,
        title: titleToSave,
        content: generatedText,
        formData: form,
        asNewCopy,
      })
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err?.message || 'Failed to save document.',
      })
    } finally {
      setSavingDoc(false)
    }
  }

  const handleStartBlankDraft = () => {
    setIsGenerated(true)
    setAiExpanded(false)
    setGeneratedText('')
    setCurrentDocId(null)
    setDocTitle(buildDefaultDocTitle(docType, form))
    setDocSource('MANUAL DRAFT')
    setError('')
    setSaveStatus(null)
  }

  const handleGenerate = async () => {
    if (!isFormProperlyFilled) {
      setError('Please fill in all details on the left before generating.')
      return
    }
    setLoading(true)
    setError('')
    setCopied(false)
    setSaveStatus(null)
    try {
      const payloadDetails = {
        name: form.name,
        email: form.email,
        country: form.country,
        ielts: form.ielts,
        degree: form.degree || form.background,
        ...form,
      }
      const nextTitle = docTitle.trim() || buildDefaultDocTitle(docType, payloadDetails)

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
          await persistDocument({
            docType,
            title: nextTitle,
            content: cleanContent,
            formData: form,
            asNewCopy: true,
          })
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
      await persistDocument({
        docType,
        title: nextTitle,
        content: formatted,
        formData: form,
        asNewCopy: true,
      })
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
    const pageTitle = docTitle.trim() || `${docTypeName} - ${applicantName}`
    printFormattedDocument(generatedText, pageTitle, docType)
  }

  const cleanSymbolsNow = () => {
    if (generatedText) {
      setGeneratedText(prev => stripMarkdown(prev))
    }
  }

  const handleUseTemplateInForm = (tpl: SopTemplate) => {
    const candidateName = forms.sop.name?.trim() || user?.name || ''
    setForms(prev => ({
      ...prev,
      sop: {
        ...tpl.prefill,
        name: candidateName,
      },
    }))
    setDocType('sop')
    setIsGenerated(false)
    setGeneratedText('')
    setAiExpanded(false)
    setCurrentDocId(null)
    setDocTitle('')
    setSaveStatus(null)
    setDocSource('DOCUMENT PREVIEW')
    setError('')
    setActiveTab('generator')
  }

  const handleLoadTemplateDraft = (tpl: SopTemplate) => {
    const candidateName = forms.sop.name?.trim() || user?.name || ''
    const draft = candidateName
      ? tpl.templateText.replace(/\[Your Full Name\]/g, candidateName)
      : tpl.templateText
    setForms(prev => ({
      ...prev,
      sop: {
        ...tpl.prefill,
        name: candidateName,
      },
    }))
    setDocType('sop')
    setGeneratedText(draft)
    setCurrentDocId(null)
    setDocTitle(`${tpl.title} — SOP Draft`)
    setDocSource(`SOP TEMPLATE · ${tpl.subfield.toUpperCase()}`)
    setIsGenerated(true)
    setAiExpanded(false)
    setError('')
    setSaveStatus({
      type: 'local',
      message: 'Template draft loaded. Customize it and click "Save to Database" to save it to Supabase.',
    })
    setActiveTab('generator')
  }

  const handleOpenSavedDoc = (saved: SavedApplicationDocument) => {
    setDocType(saved.docType)
    if (saved.formData && Object.keys(saved.formData).length > 0) {
      setForms(prev => ({
        ...prev,
        [saved.docType]: {
          ...prev[saved.docType],
          ...saved.formData,
        },
      }))
    }
    setGeneratedText(saved.content)
    setCurrentDocId(saved.id)
    setDocTitle(saved.title)
    setDocSource(saved.syncedToSupabase ? 'SUPABASE SAVED' : 'LOCAL SAVED DRAFT')
    setIsGenerated(true)
    setAiExpanded(false)
    setError('')
    setSaveStatus({
      type: saved.syncedToSupabase ? 'cloud' : 'local',
      message: saved.syncedToSupabase
        ? 'Opened saved document from Supabase. Edit freely and click "Save to Database" to update it.'
        : 'Opened local browser draft. Click "Save to Database" to sync it to Supabase.',
    })
    setActiveTab('generator')
  }

  const handleDeleteSavedDoc = async (id: string) => {
    setDeletingDocId(id)
    setSavedDocsError('')
    try {
      const res = await deleteApplicationDocumentApi(id, user?.id)
      if (!res.deleted) {
        setSavedDocsError(res.error || 'Could not delete document.')
        return
      }
      setSavedDocs(prev => prev.filter(item => item.id !== id))
      if (currentDocId === id) {
        setCurrentDocId(null)
        setSaveStatus(null)
      }
    } finally {
      setDeletingDocId(null)
    }
  }

  const handleSyncSavedDoc = async (saved: SavedApplicationDocument) => {
    setSyncingDocId(saved.id)
    setSavedDocsError('')
    try {
      const res = await saveApplicationDocumentApi(
        {
          id: saved.id,
          docType: saved.docType,
          title: saved.title,
          content: saved.content,
          formData: saved.formData,
        },
        user?.id
      )
      upsertLocalSavedList(res.document, saved.id)
      if (!res.syncedToSupabase && res.error) {
        setSavedDocsError(res.error)
      }
    } finally {
      setSyncingDocId(null)
    }
  }

  const copyTemplateText = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setTemplateCopied(true)
    setTimeout(() => setTemplateCopied(false), 2000)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="label-tag mb-1 no-print">AI DOCUMENT GENERATOR · VISTORA</div>
      <h1 className="text-2xl font-bold text-ink plex tracking-tight mb-1 no-print">Application Document Generator</h1>
      <p className="text-sm text-muted mb-5 no-print">
        Generate custom, professionally structured academic and career documents tailored to your profile, or browse CS-SOP reference templates.
      </p>

      {/* Top Navigation Tabs */}
      <div
        className="mb-6 flex flex-wrap gap-2 border-b border-divider pb-3 no-print"
        role="tablist"
        aria-label="Document Generator sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'generator'}
          onClick={() => setActiveTab('generator')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'generator'
              ? 'bg-electric text-white font-bold'
              : 'bg-surface border border-divider text-graphite hover:text-ink'
            }`}
        >
          <Icon name="pen" /> Document Generator
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sop-templates'}
          onClick={() => setActiveTab('sop-templates')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'sop-templates'
              ? 'bg-electric text-white font-bold'
              : 'bg-surface border border-divider text-graphite hover:text-ink'
            }`}
        >
          <Icon name="books" /> Templates for SOPs ({SOP_TEMPLATES.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'saved'}
          onClick={() => {
            setActiveTab('saved')
            refreshSavedDocs()
          }}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'saved'
              ? 'bg-electric text-white font-bold'
              : 'bg-surface border border-divider text-graphite hover:text-ink'
            }`}
        >
          <Icon name="folder" /> Saved Documents ({savedDocs.length})
        </button>
      </div>

      {activeTab === 'sop-templates' ? (
        <div className="space-y-5 no-print">
          {/* Reference Archive Banner */}
          <section className="corner-mark border border-divider bg-surface p-5 sm:p-6" style={{ borderRadius: 4 }}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="label-tag mb-1.5">CS-SOP REFERENCE ARCHIVE · BLUEPRINTS &amp; REAL EXAMPLES</div>
                <h2 className="text-lg font-bold text-ink plex">
                  Computer Science &amp; Graduate Statement of Purpose Templates
                </h2>
                <p className="mt-1.5 text-xs leading-6 text-graphite-mid">
                  Structured around patterns from successful admitted CS PhD &amp; Master’s Statements of Purpose in the crowdsourced{' '}
                  <strong>CS-SOP Notion repository</strong>. Use these subfield blueprints to frame research hypotheses, concrete engineering or proof contributions, and specific faculty fit—then load any template straight into the generator.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <a
                  href={CS_SOP_NOTION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded bg-[#DC2626] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#B91C1C] transition-colors"
                >
                  Open CS-SOP Notion Archive <Icon name="external" />
                </a>
                <a
                  href={CS_SOP_ARCHIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded border border-divider bg-surface-2 px-4 py-2.5 text-xs font-semibold text-ink hover:border-line-strong transition-colors"
                >
                  cs-sop.org Directory <Icon name="external" />
                </a>
              </div>
            </div>
          </section>

          {/* Subfield Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {subfields.map(sf => (
              <button
                key={sf}
                type="button"
                onClick={() => setSubfieldFilter(sf)}
                className={`mono text-[11px] px-3 py-1.5 rounded border transition-colors cursor-pointer ${subfieldFilter === sf
                    ? 'border-line-ink bg-navy text-white font-bold'
                    : 'border-divider bg-surface text-graphite hover:border-line-strong'
                  }`}
              >
                {sf}
              </button>
            ))}
          </div>

          {/* 2-Column Template Browser & Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
            {/* Template List */}
            <div className="space-y-2.5">
              {filteredTemplates.map(tpl => {
                const isSelected = tpl.id === selectedTemplate.id
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(tpl.id)
                      setTemplateCopied(false)
                    }}
                    className={`w-full text-left p-4 border transition-all cursor-pointer ${isSelected
                        ? 'border-[#DC2626] bg-electric-soft shadow-sm'
                        : 'border-divider bg-surface hover:border-line-strong'
                      }`}
                    style={{ borderRadius: 4 }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="mono text-[9px] px-2 py-0.5 bg-surface-2 border border-divider text-accent font-bold rounded">
                        {tpl.tag}
                      </span>
                      <span className="mono text-[10px] text-subtle">{tpl.track}</span>
                    </div>
                    <div className="text-sm font-bold text-ink plex leading-snug">{tpl.title}</div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-muted line-clamp-2">{tpl.summary}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] mono text-subtle">
                      <span>{tpl.subfield}</span>
                      <span>{tpl.targetLength}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Selected Template Detail & Draft */}
            <div className="bg-surface border border-divider flex flex-col" style={{ borderRadius: 4 }}>
              <div className="px-5 py-4 border-b border-divider-soft flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="mono text-[9px] px-2 py-0.5 bg-electric-dim text-accent-strong font-bold rounded">
                      {selectedTemplate.track.toUpperCase()}
                    </span>
                    <span className="mono text-[10px] text-subtle">{selectedTemplate.targetLength}</span>
                  </div>
                  <h3 className="text-base font-bold text-ink plex">{selectedTemplate.title}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUseTemplateInForm(selectedTemplate)}
                    className="mono text-[10px] text-white bg-[#DC2626] px-3 py-1.5 hover:bg-[#B91C1C] transition-colors rounded cursor-pointer inline-flex items-center gap-1"
                  >
                    <Icon name="zap" /> Customize with AI Form
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadTemplateDraft(selectedTemplate)}
                    className="mono text-[10px] text-white bg-navy px-3 py-1.5 hover:bg-navy-mid transition-colors rounded cursor-pointer inline-flex items-center gap-1"
                  >
                    <Icon name="pen" /> Open Draft in Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => copyTemplateText(selectedTemplate.templateText)}
                    className="mono text-[10px] text-muted border border-divider px-3 py-1.5 hover:border-line-strong hover:text-ink transition-colors rounded cursor-pointer"
                  >
                    {templateCopied ? '✓ Copied!' : 'Copy Template'}
                  </button>
                  <button
                    type="button"
                    onClick={() => printFormattedDocument(selectedTemplate.templateText, selectedTemplate.title, 'sop')}
                    className="mono text-[10px] text-muted border border-divider px-3 py-1.5 hover:border-line-strong hover:text-ink transition-colors rounded cursor-pointer inline-flex items-center gap-1"
                  >
                    <Icon name="printer" /> Print / PDF
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-5 bg-paper flex-1">
                {/* Structural Blueprint */}
                <div>
                  <div className="label-tag mb-2.5">PARAGRAPH-BY-PARAGRAPH BLUEPRINT</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTemplate.structure.map(sec => (
                      <div key={sec.step} className="border border-divider bg-surface p-3.5 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="mono text-[10px] font-bold text-accent">{sec.step}</span>
                          <span className="text-xs font-bold text-ink plex">{sec.heading}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-graphite-mid">{sec.guidance}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subfield Tips */}
                <div className="border border-divider bg-surface p-4 rounded">
                  <div className="label-tag mb-2">
                    <Icon name="lightbulb" /> KEY TIPS FOR {selectedTemplate.subfield.toUpperCase()}
                  </div>
                  <ul className="space-y-1.5">
                    {selectedTemplate.keyTips.map(tip => (
                      <li key={tip} className="flex items-start gap-2 text-xs text-graphite leading-relaxed">
                        <span className="text-accent font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Full Template Text */}
                <div className="bg-surface border border-divider rounded p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-divider-soft pb-3 mb-4">
                    <span className="mono text-[10px] text-subtle tracking-widest">
                      FILLABLE SOP TEMPLATE (REPLACE [BRACKETED] SECTIONS)
                    </span>
                    <span className="mono text-[10px] text-accent">PLAIN-TEXT READY</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-[12.5px] leading-[1.85] text-graphite font-sans">
                    {selectedTemplate.templateText}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'saved' ? (
        <div className="space-y-5 no-print">
          <section className="corner-mark border border-divider bg-surface p-5 sm:p-6" style={{ borderRadius: 4 }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="label-tag mb-1">SUPABASE DOCUMENT LIBRARY · APPLICATION_DOCUMENTS</div>
                <h2 className="text-lg font-bold text-ink plex">Your Saved SOPs, CVs &amp; Application Drafts</h2>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Documents saved while signed in are stored securely in Vistora&apos;s Supabase database and stay available across sessions.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={refreshSavedDocs}
                  disabled={loadingSavedDocs}
                  className="mono text-[10px] border border-divider bg-surface-2 px-3 py-2 text-ink hover:border-line-strong rounded cursor-pointer disabled:opacity-50"
                >
                  {loadingSavedDocs ? 'Refreshing...' : '↻ Refresh List'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('generator')}
                  className="mono text-[10px] bg-electric text-white px-3 py-2 font-bold rounded hover:bg-[#B91C1C] cursor-pointer"
                >
                  + Create New Document
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-divider-soft pt-4">
              {(['all', 'sop', 'cv', 'ps', 'cl'] as const).map(filterKey => {
                const label =
                  filterKey === 'all'
                    ? `All (${savedDocs.length})`
                    : `${DOC_TYPES.find(d => d.id === filterKey)?.label || filterKey.toUpperCase()} (${savedDocs.filter(d => d.docType === filterKey).length})`
                return (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setSavedFilter(filterKey)}
                    className={`mono text-[10px] px-3 py-1.5 rounded border transition-colors cursor-pointer ${savedFilter === filterKey
                        ? 'bg-navy text-white border-navy font-bold'
                        : 'bg-paper text-graphite border-divider hover:border-line-strong'
                      }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </section>

          {savedDocsError && (
            <div className="border-l-2 border-[#DC2626] bg-electric-soft p-3 text-xs text-accent">
              {savedDocsError}
            </div>
          )}

          {loadingSavedDocs ? (
            <div className="bg-surface border border-divider rounded p-10 text-center text-xs text-muted">
              Loading your saved documents from Supabase...
            </div>
          ) : (() => {
            const visibleSaved =
              savedFilter === 'all'
                ? savedDocs
                : savedDocs.filter(doc => doc.docType === savedFilter)

            if (visibleSaved.length === 0) {
              return (
                <div className="bg-surface border border-divider rounded p-12 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-surface-2 border border-divider flex items-center justify-center text-xl text-subtle mb-3">
                    <Icon name="folder" />
                  </div>
                  <div className="text-sm font-semibold text-ink plex mb-1">No Saved Documents Yet</div>
                  <p className="text-xs text-muted max-w-md mx-auto mb-4">
                    Generate a document, load an SOP template, or write your own draft in the Document Generator and click &quot;Save to Database&quot; to store it here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('generator')}
                    className="mono text-[11px] bg-[#DC2626] text-white px-4 py-2 rounded font-semibold hover:bg-[#B91C1C] cursor-pointer"
                  >
                    Go to Document Generator
                  </button>
                </div>
              )
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleSaved.map(saved => {
                  const typeLabel = DOC_TYPES.find(d => d.id === saved.docType)?.label || saved.docType.toUpperCase()
                  const updatedLabel = new Date(saved.updatedAt).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const wordCount = saved.content.trim()
                    ? saved.content.trim().split(/\s+/).length
                    : 0

                  return (
                    <article
                      key={saved.id}
                      className="bg-surface border border-divider rounded p-5 flex flex-col justify-between gap-4 hover:border-line-strong transition-colors"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="mono text-[9px] px-2 py-0.5 rounded bg-surface-2 border border-divider text-ink font-bold uppercase">
                              {typeLabel}
                            </span>
                            {saved.syncedToSupabase ? (
                              <span className="mono text-[9px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold inline-flex items-center gap-1">
                                <Icon name="check-circle" /> SUPABASE SYNCED
                              </span>
                            ) : (
                              <span className="mono text-[9px] px-2 py-0.5 rounded bg-warning-soft border border-[#D97706] text-caution-strong font-bold">
                                LOCAL DRAFT
                              </span>
                            )}
                          </div>
                          <span className="mono text-[10px] text-subtle">{wordCount} words</span>
                        </div>

                        <h3 className="text-base font-bold text-ink plex leading-snug mb-1">
                          {saved.title}
                        </h3>
                        <div className="mono text-[10px] text-subtle mb-3">
                          Updated {updatedLabel}
                        </div>

                        <p className="text-xs leading-relaxed text-graphite bg-paper border border-divider-soft rounded p-3 line-clamp-4 whitespace-pre-wrap">
                          {saved.content}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-divider-soft pt-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenSavedDoc(saved)}
                            className="mono text-[10px] bg-navy text-white px-3 py-1.5 rounded hover:bg-navy-mid transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Icon name="pen" /> Open &amp; Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => printFormattedDocument(saved.content, saved.title, saved.docType)}
                            className="mono text-[10px] border border-divider text-muted px-2.5 py-1.5 rounded hover:border-line-strong hover:text-ink transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Icon name="printer" /> Print / PDF
                          </button>
                          {!saved.syncedToSupabase && (
                            <button
                              type="button"
                              onClick={() => handleSyncSavedDoc(saved)}
                              disabled={syncingDocId === saved.id}
                              className="mono text-[10px] bg-electric text-white px-2.5 py-1.5 rounded hover:bg-[#B91C1C] transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <Icon name="upload" /> {syncingDocId === saved.id ? 'Syncing...' : 'Sync to Supabase'}
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedDoc(saved.id)}
                          disabled={deletingDocId === saved.id}
                          className="mono text-[10px] text-accent border border-divider px-2.5 py-1.5 rounded hover:bg-electric-soft transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <Icon name="trash" /> {deletingDocId === saved.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )
          })()}
        </div>
      ) : (
        <>
          {/* Doc type selector */}
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2 no-print">
            <div>
              <div className="text-sm font-semibold text-ink plex">What would you like to create?</div>
              <div className="mt-1 text-xs text-muted">Choose a document type to start with the right structure and prompts.</div>
            </div>
            {docType === 'sop' && (
              <button
                type="button"
                onClick={() => setActiveTab('sop-templates')}
                className="mono text-[11px] text-accent hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <Icon name="books" /> Browse CS-SOP Templates →
              </button>
            )}
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
                  setCurrentDocId(null)
                  setDocTitle('')
                  setSaveStatus(null)
                  setDocSource('DOCUMENT PREVIEW')
                  setError('')
                }}
                className={`group flex min-h-[204px] flex-col text-left p-5 border transition-all ${docType === d.id
                    ? 'border-[#DC2626] bg-electric-soft shadow-sm'
                    : 'border-divider bg-surface hover:border-line-strong hover:shadow-sm'
                  }`}
                style={{ borderRadius: 4 }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${docType === d.id ? 'bg-[#DC2626] text-white' : 'bg-surface-2 text-subtle group-hover:bg-electric-soft group-hover:text-accent'
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
                <div className={`mt-auto pt-5 text-[11px] font-semibold transition-colors ${docType === d.id ? 'text-accent' : 'text-muted group-hover:text-accent'
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
                  className={`w-full py-3 text-sm font-semibold text-white transition-colors cursor-pointer ${loading || !isFormProperlyFilled ? 'bg-[#FCA5A5] cursor-not-allowed' : 'bg-[#DC2626] hover:bg-[#B91C1C]'
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

                <div className="flex flex-wrap items-center gap-2">
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
                    onClick={() => handleSaveToDatabase(false)}
                    disabled={!isGenerated || !generatedText.trim() || savingDoc}
                    title="Save or update this document in Supabase database"
                    className="mono text-[10px] text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1.5 font-semibold"
                  >
                    <Icon name="save" /> {savingDoc ? 'Saving...' : currentDocId ? 'Save Changes' : 'Save to Database'}
                  </button>
                  {isGenerated && currentDocId && (
                    <button
                      type="button"
                      onClick={() => handleSaveToDatabase(true)}
                      disabled={!generatedText.trim() || savingDoc}
                      title="Save as a separate copy in Supabase"
                      className="mono text-[10px] text-muted border border-divider px-2.5 py-1.5 hover:border-line-strong hover:text-ink transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Save Copy
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={copyDocument}
                    disabled={!isGenerated || !generatedText.trim()}
                    className="mono text-[10px] text-muted border border-divider px-3 py-1.5 hover:border-line-strong transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {copied ? '✓ Copied!' : 'Copy Text'}
                  </button>
                  <button
                    type="button"
                    onClick={downloadTxt}
                    disabled={!isGenerated || !generatedText.trim()}
                    className="mono text-[10px] text-white bg-[#DC2626] px-3 py-1.5 hover:bg-[#B91C1C] transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Download .txt
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintPdf}
                    disabled={!isGenerated || !generatedText.trim()}
                    title="Format and print or save document as PDF"
                    className="mono text-[10px] text-white bg-navy px-3 py-1.5 hover:bg-navy-mid transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Print / PDF
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-paper">
                {error && (
                  <div className="mb-4 border-l-2 border-[#D97706] bg-warning-soft p-3 text-[11px] leading-relaxed text-caution-strong no-print">
                    {error}
                  </div>
                )}
                {saveStatus && (
                  <div
                    className={`mb-4 border-l-2 p-3 text-[11px] leading-relaxed flex flex-wrap items-center justify-between gap-2 no-print ${saveStatus.type === 'cloud'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : saveStatus.type === 'error'
                          ? 'border-[#DC2626] bg-electric-soft text-accent'
                          : 'border-[#D97706] bg-warning-soft text-caution-strong'
                      }`}
                  >
                    <span>{saveStatus.message}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('saved')
                        refreshSavedDocs()
                      }}
                      className="mono text-[10px] underline font-semibold cursor-pointer"
                    >
                      View Saved ({savedDocs.length}) →
                    </button>
                  </div>
                )}
                <div className="bg-surface border border-divider-soft shadow-sm rounded-md p-6 sm:p-8 max-w-3xl mx-auto min-h-[520px] flex flex-col">
                  {!isGenerated ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4">
                      <div className="w-14 h-14 rounded-full bg-surface-2 border border-divider flex items-center justify-center text-2xl mb-3 text-subtle">
                        <Icon name="file" />
                      </div>
                      <div className="text-base font-semibold text-ink plex mb-1">
                        {isFormProperlyFilled ? 'Ready to Generate' : 'Input Details to Begin'}
                      </div>
                      <p className="text-xs text-subtle max-w-md leading-relaxed mb-4">
                        {isFormProperlyFilled
                          ? `Your details are ready. Click the "Generate Document" button on the left to generate your custom ${DOC_TYPES.find(d => d.id === docType)?.label}.`
                          : `Enter your details in the form on the left. The document will only be generated once you click the Generate button.`}
                      </p>
                      <button
                        type="button"
                        onClick={handleStartBlankDraft}
                        className="mono text-[10px] text-muted border border-divider px-3 py-1.5 rounded hover:border-line-strong hover:text-ink transition-colors cursor-pointer"
                      >
                        Or Write / Paste {DOC_TYPES.find(d => d.id === docType)?.label} Manually →
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 pb-3 border-b border-divider-soft flex flex-col sm:flex-row sm:items-center gap-2 no-print">
                        <label
                          htmlFor="doc-title-input"
                          className="mono text-[10px] text-subtle tracking-widest uppercase shrink-0"
                        >
                          Document Title
                        </label>
                        <input
                          id="doc-title-input"
                          type="text"
                          value={docTitle}
                          onChange={e => setDocTitle(e.target.value)}
                          placeholder={buildDefaultDocTitle(docType, form)}
                          className="flex-1 border border-divider focus:border-[#DC2626] px-3 py-1.5 text-xs text-ink bg-paper rounded outline-none"
                        />
                      </div>
                      <textarea
                        value={generatedText}
                        onChange={e => setGeneratedText(e.target.value)}
                        className="w-full text-[13px] text-graphite leading-[1.85] outline-none border-none resize-y bg-transparent flex-1 print:hidden"
                        style={{ fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: 520 }}
                        placeholder="Write or paste your SOP / document content here, then click Save to Database..."
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
        </>
      )}
    </div>
  )
}
