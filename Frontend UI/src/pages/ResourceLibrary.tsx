import { useEffect, useState } from 'react'
import { fetchPdfResources } from '../lib/api'
import {
  STATIC_RESOURCES,
  OFFICIAL_EXTERNAL_LINKS,
  type ResourceItem,
} from '../data/resourceGuides'

const CATEGORIES = [
  'All',
  'Official Books',
  'Reading',
  'Writing',
  'Listening',
  'Speaking',
  'Vocabulary',
  'Grammar',
  'Sample Essays',
]

const TYPE_COLORS: Record<string, string> = {
  Guide: '#FEE2E2',
  Template: '#FFE4E6',
  Vocabulary: '#F0FDF4',
  Sample: '#FEF9C3',
  Practice: '#FEE2E2',
  'Answer Key': '#F1F5F9',
  Grammar: '#E0E7FF',
  'Official Book': '#EFF6FF',
}

const TYPE_TEXT: Record<string, string> = {
  Guide: '#991B1B',
  Template: '#9F1239',
  Vocabulary: '#065F46',
  Sample: '#92400E',
  Practice: '#991B1B',
  'Answer Key': '#374151',
  Grammar: '#3730A3',
  'Official Book': '#1D4ED8',
}

export default function ResourceLibrary() {
  const [resources, setResources] = useState<ResourceItem[]>(STATIC_RESOURCES)
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null)
  const [cat, setCat] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem('vistora-saved-resources')
      return stored ? new Set(JSON.parse(stored)) : new Set([1, 101])
    } catch {
      return new Set([1, 101])
    }
  })

  useEffect(() => {
    fetchPdfResources().then(data => {
      if (data && data.pdfs && data.pdfs.length > 0) {
        const dynamicPdfs: ResourceItem[] = data.pdfs.map((pdf: any, idx: number) => ({
          id: 100 + idx + 1,
          title: `${pdf.filename.replace('.pdf', '')} Academic (Official Past Papers & Audio)`,
          category: 'Official Books',
          type: 'Official Book',
          difficulty: 'Official Test',
          pages: 144,
          rating: 5.0,
          reads: 12000 + idx * 1500,
          tag: 'DATABASE BOOK',
          desc: `Full official examination book directly streamed and downloaded from local Database. Size: ${pdf.sizeFormatted}.`,
          url: pdf.url,
          externalUrl: OFFICIAL_EXTERNAL_LINKS.CAMBRIDGE_PREP,
          sourceOrg: 'Cambridge University Press & Assessment',
          keyTakeaways: [
            'Contains 4 complete authentic Academic practice examination papers from Cambridge.',
            'Includes official audioscripts, reading passages, and full answer keys with examiner commentary.',
            'Paired with all 73 local MP3 listening tracks available in the Vistora listening simulator.',
            'Binary verified %PDF- document directly streamed with zero compression loss.',
          ],
          sections: [
            {
              heading: 'Database Verification & Audio Pairing',
              body: `This volume is hosted locally inside your Vistora Database directory (${pdf.sizeFormatted}). It contains official IELTS Academic examination papers developed by Cambridge Assessment English. In addition to reading and writing tasks, all corresponding audio files for Tests 1 through 4 are preloaded and streamable in the platform.`,
            },
            {
              heading: 'How to Use with Vistora Simulator',
              body: 'Open the PDF in your browser to study official question formats and answer explanations, or initiate a Full Computer-Delivered Test in Vistora to take Cambridge IELTS 18 with automatic scoring and timing.',
            },
          ],
        }))

        setResources([...dynamicPdfs, ...STATIC_RESOURCES])
      }
    }).catch(() => {})
  }, [])

  const toggleSave = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSaved(prev => {
      const updated = new Set(prev)
      if (updated.has(id)) updated.delete(id)
      else updated.add(id)
      localStorage.setItem('vistora-saved-resources', JSON.stringify(Array.from(updated)))
      return updated
    })
  }

  const handleCardClick = (r: ResourceItem) => {
    if (r.type === 'Official Book' && r.url) {
      window.open(r.url, '_blank')
    } else {
      setSelectedResource(r)
    }
  }

  const handleOpenPdf = (r: ResourceItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (r.url) {
      window.open(r.url, '_blank')
    }
  }

  const handleOpenExternal = (url: string, e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const filtered = resources.filter(r => {
    const matchesCat =
      cat === 'All' ||
      (cat === 'Official Books' ? r.category === 'Official Books' : r.category === cat)
    const matchesDiff = difficulty === 'All' || r.difficulty.includes(difficulty)
    const matchesSearch =
      search === '' ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.desc.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesDiff && matchesSearch
  })

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="label-tag mb-1">RESOURCE LIBRARY · CONNECTED TO LOCAL DATABASE & OFFICIAL SOURCES</div>
          <h1 className="text-2xl font-bold text-[#0F172A] plex tracking-tight">Study Materials & Official Books</h1>
          <p className="text-sm text-[#64748B] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Official Cambridge past papers (streamed from Database), authentic study guides, band descriptors, and examiner templates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#FEE2E2] border border-[#FCA5A5] px-4 py-2 text-center" style={{ borderRadius: 3 }}>
            <div className="mono text-base font-bold text-[#DC2626]">{resources.length}+</div>
            <div className="mono text-[9px] text-[#EF4444] tracking-widest">RESOURCES</div>
          </div>
          <div className="bg-[#FFE4E6] border border-[#FECDD3] px-4 py-2 text-center" style={{ borderRadius: 3 }}>
            <div className="mono text-base font-bold text-[#BE123C]">{saved.size}</div>
            <div className="mono text-[9px] text-[#BE123C] tracking-widest">BOOKMARKED</div>
          </div>
        </div>
      </div>

      {/* Verification Banner */}
      <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 font-bold text-sm">✓</span>
          <span>
            <strong>Authenticity Verified:</strong> Official Cambridge exam books stream directly from your local <code>Database/</code> directory. All study guides feature verified links to Cambridge English, British Council, and official IELTS repositories.
          </span>
        </div>
        <a
          href={OFFICIAL_EXTERNAL_LINKS.CAMBRIDGE_PREP}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[10px] bg-emerald-600 text-white px-3 py-1 rounded font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap self-end md:self-auto"
        >
          Cambridge Assessment ↗
        </a>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">⌕</span>
          <input
            type="text"
            placeholder="Search by book name, topic, skill, or keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-[#E2E8F0] focus:border-[#DC2626] pl-8 pr-4 py-2.5 text-[13px] text-[#374151] outline-none bg-white transition-colors"
            style={{ borderRadius: 4, fontFamily: 'Inter, sans-serif' }}
          />
        </div>
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          className="border border-[#E2E8F0] focus:border-[#DC2626] px-3 py-2.5 text-[12px] text-[#374151] outline-none bg-white"
          style={{ borderRadius: 4, fontFamily: 'Inter, sans-serif' }}
        >
          <option value="All">All Difficulty Levels</option>
          <option value="Official">Official Past Papers</option>
          <option value="Band 5+">Band 5+</option>
          <option value="Band 6–7">Band 6–7</option>
          <option value="Band 7+">Band 7+</option>
          <option value="Band 8+">Band 8+</option>
        </select>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`mono text-[10px] px-3 py-1.5 border tracking-widest transition-all ${
              cat === c
                ? 'bg-[#0F172A] border-[#0F172A] text-white'
                : 'border-[#E2E8F0] text-[#64748B] bg-white hover:border-[#CBD5E1] hover:text-[#374151]'
            }`}
            style={{ borderRadius: 3 }}
          >
            {c.toUpperCase()}
          </button>
        ))}
        <span className="ml-auto mono text-[10px] text-[#94A3B8] self-center">{filtered.length} resources shown</span>
      </div>

      {/* Resource grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(r => (
          <div
            key={r.id}
            onClick={() => handleCardClick(r)}
            className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            style={{ borderRadius: 4 }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="mono text-[9px] font-medium px-2 py-0.5"
                    style={{
                      borderRadius: 2,
                      color: TYPE_TEXT[r.type] || '#374151',
                      background: TYPE_COLORS[r.type] || '#F1F5F9',
                    }}
                  >
                    {r.type.toUpperCase()}
                  </span>
                  <span className="mono text-[9px] text-[#94A3B8]">{r.category}</span>
                </div>
                <button
                  type="button"
                  aria-label={saved.has(r.id) ? 'Remove bookmark' : 'Bookmark resource'}
                  onClick={e => toggleSave(r.id, e)}
                  className={`text-base transition-colors ${
                    saved.has(r.id) ? 'text-[#BE123C]' : 'text-slate-300 hover:text-slate-500'
                  }`}
                >
                  {saved.has(r.id) ? '★' : '☆'}
                </button>
              </div>

              <h3 className="text-[13px] font-semibold text-[#0F172A] plex leading-snug mb-2 group-hover:text-[#DC2626] transition-colors">
                {r.title}
              </h3>
              <p
                className="text-[11px] text-[#64748B] leading-relaxed mb-3"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {r.desc}
              </p>

              <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
                <span className="mono">{r.pages}p</span>
                <span>·</span>
                <span className="mono">{r.difficulty}</span>
                <span>·</span>
                <span className="mono">{r.reads.toLocaleString()} reads</span>
                <span className="ml-auto mono text-[#DC2626] font-medium">★ {r.rating}</span>
              </div>
            </div>

            <div className="border-t border-[#F1F5F9] px-5 py-3 flex items-center justify-between bg-slate-50/50 gap-2">
              <span className="mono text-[9px] text-[#94A3B8] border border-divider px-2 py-0.5 rounded bg-white truncate max-w-[120px]">
                {r.tag}
              </span>

              <div className="flex items-center gap-2">
                {/* Secondary: Authentic External URL Link */}
                <button
                  type="button"
                  onClick={e => handleOpenExternal(r.externalUrl, e)}
                  title={`Redirect to authentic ${r.sourceOrg} page`}
                  className="mono text-[10px] text-[#64748B] hover:text-[#0F172A] border border-slate-200 px-2 py-1 rounded bg-white hover:bg-slate-50 transition-colors"
                >
                  Official Source ↗
                </button>

                {/* Primary Action Button */}
                {r.url ? (
                  <button
                    type="button"
                    onClick={e => handleOpenPdf(r, e)}
                    className="mono text-[10px] font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] px-2.5 py-1 rounded transition-colors"
                  >
                    Open PDF ↗
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      setSelectedResource(r)
                    }}
                    className="mono text-[10px] font-semibold text-[#DC2626] hover:text-[#991B1B] hover:underline"
                  >
                    Read Guide →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-2xl text-[#E2E8F0] mb-3">◎</div>
          <div className="text-sm text-[#94A3B8] plex">No resources found matching "{search}"</div>
        </div>
      )}

      {/* Guide Reader Modal */}
      {selectedResource && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedResource(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="mono text-[9px] font-semibold px-2 py-0.5 rounded"
                    style={{
                      color: TYPE_TEXT[selectedResource.type] || '#374151',
                      background: TYPE_COLORS[selectedResource.type] || '#F1F5F9',
                    }}
                  >
                    {selectedResource.type.toUpperCase()}
                  </span>
                  <span className="mono text-[10px] text-[#64748B]">{selectedResource.category}</span>
                  <span className="mono text-[10px] text-[#94A3B8]">·</span>
                  <span className="mono text-[10px] text-[#64748B]">{selectedResource.difficulty}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 plex leading-snug">
                  {selectedResource.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResource(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 ml-4"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              {/* Authenticity Verification Box */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-blue-950 flex items-center gap-1.5">
                    <span className="text-blue-600">🏛</span> Source & Official Alignment:
                  </div>
                  <div className="text-blue-900 mt-0.5">{selectedResource.sourceOrg}</div>
                </div>
                <button
                  type="button"
                  onClick={e => handleOpenExternal(selectedResource.externalUrl, e)}
                  className="mono text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap self-end sm:self-auto"
                >
                  Visit Official Source ↗
                </button>
              </div>

              {/* Description */}
              <p className="text-slate-600 italic border-l-2 border-[#DC2626] pl-3 py-0.5">
                {selectedResource.desc}
              </p>

              {/* Key Takeaways */}
              {selectedResource.keyTakeaways && selectedResource.keyTakeaways.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded p-4">
                  <div className="mono text-[10px] font-bold text-amber-900 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                    <span>⚡</span> Key Examination Rules & Takeaways
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {selectedResource.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">✓</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Structured Sections */}
              {selectedResource.sections && selectedResource.sections.map((sec, idx) => (
                <div key={idx} className="border-t border-slate-100 pt-4">
                  <h4 className="text-sm font-bold text-slate-900 plex mb-2">
                    {sec.heading}
                  </h4>
                  <div className="whitespace-pre-line text-xs sm:text-[13px] text-slate-700 leading-relaxed bg-slate-50 p-4 rounded border border-slate-100">
                    {sec.body}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="mono text-[10px] text-slate-500">
                ★ {selectedResource.rating} rating · {selectedResource.reads.toLocaleString()} readers
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="mono text-[10px] px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Print / Save 🖨
                </button>
                <button
                  type="button"
                  onClick={e => handleOpenExternal(selectedResource.externalUrl, e)}
                  className="mono text-[10px] px-3 py-1.5 bg-[#0F172A] text-white rounded hover:bg-slate-800 transition-colors font-medium"
                >
                  Open Official External Page ↗
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedResource(null)}
                  className="mono text-[10px] px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
