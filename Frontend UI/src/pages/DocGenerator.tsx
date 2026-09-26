import { useState } from 'react'
import { generateDocument } from '../lib/documentGenerator'

type DocType = 'cv' | 'sop' | 'ps' | 'cl'

const DOC_TYPES: { id: DocType; label: string; desc: string; icon: string }[] = [
  { id: 'cv', label: 'Curriculum Vitae', desc: 'Academic / professional CV for university or visa applications', icon: '◈' },
  { id: 'sop', label: 'Statement of Purpose', desc: 'Graduate school SOP tailored to your target program', icon: '✦' },
  { id: 'ps', label: 'Personal Statement', desc: 'Undergraduate or scholarship personal statement', icon: '◎' },
  { id: 'cl', label: 'Cover Letter', desc: 'Professional cover letter for job or internship applications', icon: '▣' },
]

const PREVIEW: Record<DocType, string> = {
  cv: `AYAAN RAHMAN
ayaan.rahman@email.com · +880-1712-345678 · LinkedIn: /in/ayaanrahman · Dhaka, Bangladesh

─────────────────────────────────────────────────────

EDUCATION

Bachelor of Technology — Computer Science & Engineering
Bangladesh University of Engineering and Technology, Dhaka             2019 – 2023
CGPA: 9.1/10 · Dean's Merit List (2021, 2022, 2023)

─────────────────────────────────────────────────────

RESEARCH EXPERIENCE

Research Intern — Natural Language Processing Lab
BUET, Dept. of Computer Science                                          May 2022 – Jul 2022
• Developed a transformer-based model for cross-lingual text summarisation achieving 94.3% ROUGE-L score
• Published findings at ACL Student Research Workshop 2022
• Supervised by Prof. Sunita Sarawagi

─────────────────────────────────────────────────────

TECHNICAL SKILLS

Programming:    Python, C++, Java, R, SQL
ML/AI Frameworks: PyTorch, TensorFlow, HuggingFace Transformers, scikit-learn
Tools:          Git, Docker, LaTeX, MATLAB
Databases:      PostgreSQL, MongoDB, Redis

─────────────────────────────────────────────────────

PUBLICATIONS

Rahman, A., Islam, T., & Ahmed, S. (2022). Cross-Lingual Abstractive Summarisation
Using Multilingual Pre-trained Models. ACL Student Research Workshop, Dublin.

─────────────────────────────────────────────────────

LANGUAGES

English (IELTS 8.0 · C1) · Bangla (Native)`,

  sop: `STATEMENT OF PURPOSE

Master of Science in Computer Science — Specialisation: Machine Learning
University of Toronto · Department of Computer Science

─────────────────────────────────────────────────────

I. MOTIVATION AND RESEARCH INTEREST

The challenge of enabling machines to understand and generate language that captures human nuance has driven my academic trajectory since my second year at BUET. My interest crystallised during a seminar on transformer architectures, where I first encountered the elegant simplicity of the attention mechanism — a mathematical framework that has since reshaped the landscape of artificial intelligence.

My undergraduate research at the NLP Lab under Prof. Sunita Sarawagi introduced me to the complexities of cross-lingual transfer learning. Developing a multilingual abstractive summarisation system that outperformed existing SOTA models on the XL-Sum benchmark was intellectually exhilarating, but it also revealed fundamental limitations in how current models handle low-resource languages — a gap I am motivated to address in doctoral research.

II. WHY UNIVERSITY OF TORONTO

The Vector Institute's concentration at UToronto represents the most compelling environment for the research questions I wish to pursue. Professor Geoffrey Hinton's foundational contributions to deep learning, combined with active research groups in probabilistic inference and natural language generation led by Professors Roger Grosse and Frank Rudzicz, align precisely with my proposed investigation into uncertainty quantification in large language models.

III. RESEARCH PROPOSAL

I propose to investigate Bayesian approaches to uncertainty estimation in transformer-based language models, with specific application to low-resource NLP tasks. Current deterministic approaches provide no reliable mechanism for models to express epistemic uncertainty, leading to overconfident predictions in domains with limited training data...`,

  ps: `PERSONAL STATEMENT

Undergraduate Admission — Computer Science
University of Edinburgh · School of Informatics

─────────────────────────────────────────────────────

At the age of thirteen, I wrote my first algorithm — a rudimentary sorting program in Python that arranged my family's book collection by genre and publication year. The books remained unread on their shelves for weeks while I iterated on the code, optimising for edge cases and expanding the categorisation logic. My mother eventually moved the books back to their original, intuitive arrangement. I kept the code.

That early experience encapsulates my relationship with computer science: it is not merely a technical discipline but a lens through which I examine and attempt to systematise the world's complexity. Throughout my secondary education in Dhaka, I pursued this interest through both formal study and independent projects, developing a range of applications from a school event management system to a machine learning model that predicted monsoon rainfall patterns in Bangladesh using historical meteorological data.

My most formative academic experience was leading my school's team at the International Olympiad in Informatics (IOI) regional qualifier, where our collaborative problem-solving under competitive time pressure taught me that the most elegant solutions emerge from disciplined thinking rather than rapid trial and error. This principle has guided my academic approach ever since.

I am drawn to Edinburgh's School of Informatics specifically for its interdisciplinary integration of computer science with cognitive science and mathematics...`,

  cl: `Ayaan Rahman
ayaan.rahman@email.com · +880-1712-345678
Dhaka, Bangladesh · 23 September 2026

─────────────────────────────────────────────────────

Hiring Manager
DeepMind — Research Engineering Team
London, United Kingdom

─────────────────────────────────────────────────────

Dear Hiring Manager,

I am writing to apply for the Research Engineer — Natural Language Processing position at DeepMind, as advertised on your careers portal. With a first-class degree in Computer Science from BUET, published research in cross-lingual NLP, and a year of industry experience at an AI startup, I am confident that my technical background and research orientation align with DeepMind's mission to solve intelligence.

During my undergraduate research internship at BUET's NLP Laboratory, I developed and optimised a multilingual transformer model for abstractive text summarisation across 45 languages. This project — published at ACL 2022 — required me to navigate the entire research pipeline: from literature review and experimental design through implementation, ablation studies, and academic writing. The experience gave me a rigorous foundation in both the theoretical underpinnings of modern NLP architectures and the practical challenges of scaling experimental code to production-grade systems.

In my subsequent role at a Dhaka-based AI company, I contributed to the development of a real-time speech recognition system for Bangla, collaborating closely with research scientists to translate model improvements into latency-optimised inference pipelines. This cross-functional experience — bridging fundamental research and engineering constraints — is the kind of challenge I seek to deepen at DeepMind.

I am particularly drawn to your Gemini team's work on multi-step reasoning and factual grounding, areas where I believe my background in uncertainty quantification and cross-lingual transfer learning would contribute meaningfully.

I would welcome the opportunity to discuss my candidacy further.

Sincerely,
Ayaan Rahman`,
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

export default function DocGenerator() {
  const [docType, setDocType] = useState<DocType>('sop')
  const [form, setForm] = useState<Record<string, string>>({})
  const [generated, setGenerated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState('')
  const [generationSource, setGenerationSource] = useState<'Gemini' | 'Preview' | null>(null)
  const [error, setError] = useState('')

  const fields = FORM_FIELDS[docType]

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setGenerated(false)
    try {
      const content = await generateDocument({
        documentType: docType,
        details: form,
        candidate: {
          name: form.name || 'Ayaan Rahman',
          country: 'Bangladesh',
        },
      })
      setGeneratedText(content)
      setGenerationSource('Gemini')
      setGenerated(true)
    } catch (generationError) {
      setGeneratedText(PREVIEW[docType])
      setGenerationSource('Preview')
      setGenerated(true)
      setError(generationError instanceof Error && generationError.message !== 'DOCUMENT_API_NOT_CONFIGURED'
        ? 'The AI service could not be reached. A local preview is shown instead.'
        : 'Secure Gemini document generation is not connected yet. A local preview is shown instead.')
    } finally {
      setLoading(false)
    }
  }

  const copyDocument = async () => {
    await navigator.clipboard.writeText(generatedText)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="label-tag mb-1">AI DOCUMENT GENERATOR · VISTORA</div>
      <h1 className="text-2xl font-bold text-[#0F172A] plex tracking-tight mb-1">Application Document Generator</h1>
      <p className="text-sm text-[#64748B] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
        Generate professional application documents for university admissions, visas, and career opportunities.
      </p>

      {/* Doc type selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {DOC_TYPES.map(d => (
          <button key={d.id} onClick={() => { setDocType(d.id); setGenerated(false); setGeneratedText(''); setError(''); setGenerationSource(null) }}
            className={`text-left p-4 border-2 transition-all ${docType === d.id ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'}`}
            style={{ borderRadius: 4 }}>
            <span className="text-lg mb-2 block" style={{ color: docType === d.id ? '#DC2626' : '#94A3B8' }}>{d.icon}</span>
            <div className="text-[13px] font-semibold text-[#0F172A] plex mb-0.5">{d.label}</div>
            <div className="text-[11px] text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>{d.desc}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        {/* Form */}
        <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center gap-2">
            <span className="w-1 h-4 bg-[#DC2626]" style={{ borderRadius: 1 }} />
            <span className="text-sm font-semibold text-[#0F172A] plex">Input Details</span>
          </div>
          <div className="p-5 space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="mono text-[10px] text-[#94A3B8] tracking-widest block mb-1.5">{f.label.toUpperCase()}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={`Enter your ${f.label.toLowerCase()}...`}
                    className="w-full border border-[#E2E8F0] focus:border-[#DC2626] px-3 py-2 text-[12px] text-[#374151] outline-none resize-none transition-colors bg-[#FAFAF7]"
                    style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif', minHeight: 72 }}
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-[#E2E8F0] focus:border-[#DC2626] px-3 py-2 text-[12px] text-[#374151] outline-none bg-[#FAFAF7]"
                    style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif' }}>
                    <option value="">Select...</option>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                    className="w-full border border-[#E2E8F0] focus:border-[#DC2626] px-3 py-2 text-[12px] text-[#374151] outline-none bg-[#FAFAF7] transition-colors"
                    style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif' }}
                  />
                )}
              </div>
            ))}

            <button onClick={handleGenerate} disabled={loading}
              className={`w-full py-3 text-sm font-semibold text-white transition-colors ${loading ? 'bg-[#FCA5A5]' : 'bg-[#DC2626] hover:bg-[#B91C1C]'}`}
              style={{ borderRadius: 4, fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full anim-spin" />
                  Generating with AI...
                </span>
              ) : `Generate ${DOC_TYPES.find(d => d.id === docType)?.label} →`}
            </button>
            <p className="text-[10px] leading-relaxed text-[#94A3B8]">Generation requests are sent through a secure server endpoint. Your Gemini API key is never exposed in the browser.</p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white border border-[#E2E8F0] flex flex-col" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-[#0F172A] plex">Document Preview</span>
            </div>
            {generated && (
              <div className="flex items-center gap-2">
                <span className={`hidden sm:inline mono text-[9px] px-2 py-1 ${generationSource === 'Gemini' ? 'bg-[#FFE4E6] text-[#BE123C]' : 'bg-[#FFFBEB] text-[#D97706]'}`} style={{ borderRadius: 2 }}>{generationSource === 'Gemini' ? 'GEMINI GENERATED' : 'LOCAL PREVIEW'}</span>
                <button onClick={copyDocument} className="mono text-[10px] text-[#64748B] border border-[#E2E8F0] px-3 py-1.5 hover:border-[#CBD5E1] transition-colors" style={{ borderRadius: 3 }}>
                  Copy Text
                </button>
                <button onClick={() => window.print()} className="mono text-[10px] text-white bg-[#0F172A] px-3 py-1.5 hover:bg-[#1E293B] transition-colors" style={{ borderRadius: 3 }}>
                  Export PDF
                </button>
              </div>
            )}
          </div>

          {!generated ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-14 h-14 bg-[#FFE4E6] flex items-center justify-center mb-4" style={{ borderRadius: 4 }}>
                <span className="text-[#BE123C] text-2xl">▣</span>
              </div>
              <div className="text-sm font-semibold text-[#0F172A] plex mb-2">Your Document Will Appear Here</div>
              <p className="text-[11px] text-[#94A3B8] max-w-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                Fill in your details and click generate. Vistora's AI will produce a professionally structured document tailored to your profile.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-8">
              {error && <div className="mb-5 border-l-2 border-[#D97706] bg-[#FFFBEB] p-3 text-[11px] leading-relaxed text-[#92400E]">{error}</div>}
              <pre className="text-[12px] text-[#374151] leading-[1.8] whitespace-pre-wrap font-mono" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                {generatedText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
