import { useState } from 'react'
import { generateDocumentApi } from '../lib/api'
import { useAuth } from '../lib/authContext'

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

export default function DocGenerator() {
  const { user } = useAuth()
  const [docType, setDocType] = useState<DocType>('sop')
  const [form, setForm] = useState<Record<string, string>>({})
  const [generated, setGenerated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState('')
  const [copied, setCopied] = useState(false)
  const [docSource, setDocSource] = useState('')
  const [error, setError] = useState('')

  const fields = FORM_FIELDS[docType]

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setGenerated(false)
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
      setGeneratedText(res.content)
      setDocSource(res.source || 'AI Engine')
      setGenerated(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to generate document.')
    } finally {
      setLoading(false)
    }
  }

  const copyDocument = async () => {
    await navigator.clipboard.writeText(generatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTxt = () => {
    const blob = new Blob([generatedText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${docType.toUpperCase()}_${form.name || user?.name || 'Document'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="label-tag mb-1">AI DOCUMENT GENERATOR · VISTORA</div>
      <h1 className="text-2xl font-bold text-[#0F172A] plex tracking-tight mb-1">Application Document Generator</h1>
      <p className="text-sm text-[#64748B] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
        Generate custom, professionally structured academic and career documents tailored to your profile.
      </p>

      {/* Doc type selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {DOC_TYPES.map(d => (
          <button
            key={d.id}
            onClick={() => {
              setDocType(d.id)
              setGenerated(false)
              setGeneratedText('')
              setError('')
            }}
            className={`text-left p-4 border-2 transition-all ${
              docType === d.id ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
            }`}
            style={{ borderRadius: 4 }}
          >
            <span className="text-lg mb-2 block" style={{ color: docType === d.id ? '#DC2626' : '#94A3B8' }}>
              {d.icon}
            </span>
            <div className="text-[13px] font-semibold text-[#0F172A] plex mb-0.5">{d.label}</div>
            <div className="text-[11px] text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {d.desc}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        {/* Form */}
        <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-[#DC2626]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-[#0F172A] plex">Input Your Details</span>
            </div>
            <span className="mono text-[9px] text-[#DC2626] bg-rose-50 px-2 py-0.5 rounded">DYNAMIC AI</span>
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
                    className="w-full border border-[#E2E8F0] focus:border-[#DC2626] px-3 py-2 text-[12px] text-[#374151] outline-none bg-[#FAFAF7] transition-colors"
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
                  Generating Custom Document...
                </span>
              ) : (
                `⚡ Generate ${DOC_TYPES.find(d => d.id === docType)?.label}`
              )}
            </button>
            <p className="text-[10px] leading-relaxed text-[#94A3B8]">
              Documents are generated dynamically from your personal parameters via our structured backend engine.
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white border border-[#E2E8F0] flex flex-col" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-[#0F172A] plex">Live Document Preview</span>
            </div>
            {generated && (
              <div className="flex items-center gap-2">
                <span className="mono text-[9px] px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  ⚡ {docSource || 'GENERATED'}
                </span>
                <button
                  onClick={copyDocument}
                  className="mono text-[10px] text-[#64748B] border border-[#E2E8F0] px-3 py-1.5 hover:border-[#CBD5E1] transition-colors rounded"
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
                  className="mono text-[10px] text-white bg-[#0F172A] px-3 py-1.5 hover:bg-[#1E293B] transition-colors rounded"
                >
                  Print / PDF
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
                Fill in your details on the left and click generate. Vistora will construct a tailored academic document ready for submission.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-8">
              {error && (
                <div className="mb-5 border-l-2 border-[#D97706] bg-[#FFFBEB] p-3 text-[11px] leading-relaxed text-[#92400E]">
                  {error}
                </div>
              )}
              <textarea
                value={generatedText}
                onChange={e => setGeneratedText(e.target.value)}
                className="w-full text-[12px] text-[#374151] leading-[1.8] font-mono outline-none border border-slate-100 p-4 rounded bg-slate-50/50 resize-y"
                style={{ fontFamily: 'IBM Plex Mono, monospace', minHeight: 480 }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
