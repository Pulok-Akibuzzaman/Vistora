import { useEffect, useState } from 'react'
import { fetchPdfResources } from '../lib/api'

const CATEGORIES = ['All', 'Official Books', 'Reading', 'Writing', 'Listening', 'Speaking', 'Vocabulary', 'Grammar', 'Sample Essays']

interface ResourceItem {
  id: number
  title: string
  category: string
  type: string
  difficulty: string
  pages: number
  rating: number
  reads: number
  tag: string
  desc: string
  url?: string
}

const STATIC_RESOURCES: ResourceItem[] = [
  { id: 1, title: 'IELTS Academic Reading Strategies: Skimming, Scanning & Detailed Reading', category: 'Reading', type: 'Guide', difficulty: 'All Levels', pages: 24, rating: 4.9, reads: 8420, tag: 'ESSENTIAL', desc: 'A comprehensive breakdown of the three core reading strategies used by Band 8+ candidates.' },
  { id: 2, title: 'Task 2 Essay Templates: 8 Rhetorical Structures for Discursive Writing', category: 'Writing', type: 'Template', difficulty: 'Band 6–8', pages: 18, rating: 4.8, reads: 12300, tag: 'POPULAR', desc: 'Proven essay frameworks for Opinion, Discussion, Problem-Solution, and Two-Part question types.' },
  { id: 3, title: 'Academic Word List Sub-lists 1–4 with Collocations', category: 'Vocabulary', type: 'Vocabulary', difficulty: 'Band 5+', pages: 42, rating: 4.7, reads: 9870, tag: 'FOUNDATIONAL', desc: '500 high-frequency academic words with example sentences, collocations, and IELTS context examples.' },
  { id: 4, title: 'Listening Section 4 Mastery: Lecture-Based Question Types', category: 'Listening', type: 'Guide', difficulty: 'Band 7+', pages: 16, rating: 4.6, reads: 5640, tag: 'ADVANCED', desc: 'Strategies for the most challenging listening section, including note completion and multiple choice.' },
  { id: 5, title: 'Band 8.5 Sample Essay: Technology & Employment (Task 2)', category: 'Sample Essays', type: 'Sample', difficulty: 'Band 8+', pages: 3, rating: 5.0, reads: 18200, tag: 'BAND 8.5', desc: 'Annotated band 8.5 essay with examiner commentary on each paragraph.' },
  { id: 6, title: 'Speaking Part 2 Cue Card Responses — 40 Topics', category: 'Speaking', type: 'Practice', difficulty: 'Band 6–7', pages: 56, rating: 4.5, reads: 6100, tag: 'PRACTICE', desc: '40 complete 2-minute monologue scripts across the most common Part 2 topics.' },
  { id: 7, title: 'Complex Grammar for IELTS Band 7+: Conditionals, Modals & Passives', category: 'Grammar', type: 'Guide', difficulty: 'Band 7+', pages: 28, rating: 4.8, reads: 7340, tag: 'GRAMMAR', desc: 'In-depth guide to the grammatical structures most valued by IELTS examiners.' },
  { id: 8, title: 'Cambridge IELTS 18 — Reading Passage 2 Answer Key with Explanations', category: 'Reading', type: 'Answer Key', difficulty: 'Band 7+', pages: 8, rating: 4.9, reads: 11600, tag: 'OFFICIAL', desc: 'Detailed answer justifications for every question type in Cambridge IELTS 18.' },
  { id: 9, title: 'Coherence & Cohesion: Discourse Markers for Band 7+ Writing', category: 'Writing', type: 'Guide', difficulty: 'Band 6–7', pages: 14, rating: 4.7, reads: 8900, tag: 'WRITING', desc: 'A classified list of 120+ discourse markers with contexts and common errors to avoid.' },
  { id: 10, title: 'IELTS Environmental Science Vocabulary — 200 Specialist Terms', category: 'Vocabulary', type: 'Vocabulary', difficulty: 'Band 6+', pages: 22, rating: 4.6, reads: 4200, tag: 'TOPIC', desc: 'Domain-specific vocabulary for the frequently tested environmental and scientific topics.' },
  { id: 11, title: 'Band 7.5 Sample Essay: Globalisation & Cultural Identity (Task 2)', category: 'Sample Essays', type: 'Sample', difficulty: 'Band 7–8', pages: 3, rating: 4.8, reads: 14100, tag: 'BAND 7.5', desc: 'Annotated essay with examiner notes on task achievement and lexical resource.' },
  { id: 12, title: 'Paraphrasing Techniques: 6 Strategies for Academic Reading', category: 'Reading', type: 'Guide', difficulty: 'Band 6+', pages: 10, rating: 4.5, reads: 5800, tag: 'TECHNIQUE', desc: 'How to identify paraphrased questions and locate matching answers in long passages.' },
]

const TYPE_COLORS: Record<string, string> = {
  Guide: '#FEE2E2', Template: '#FFE4E6', Vocabulary: '#F0FDF4', Sample: '#FEF9C3',
  Practice: '#FEE2E2', 'Answer Key': '#F1F5F9', Grammar: '#E0E7FF', 'Official Book': '#EFF6FF',
}
const TYPE_TEXT: Record<string, string> = {
  Guide: '#991B1B', Template: '#9F1239', Vocabulary: '#065F46', Sample: '#92400E',
  Practice: '#991B1B', 'Answer Key': '#374151', Grammar: '#3730A3', 'Official Book': '#1D4ED8',
}

export default function ResourceLibrary() {
  const [resources, setResources] = useState<ResourceItem[]>(STATIC_RESOURCES)
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

  const filtered = resources.filter(r => {
    const matchesCat = cat === 'All' || (cat === 'Official Books' ? r.category === 'Official Books' : r.category === cat)
    const matchesDiff = difficulty === 'All' || r.difficulty.includes(difficulty)
    const matchesSearch = search === '' ||
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
          <div className="label-tag mb-1">RESOURCE LIBRARY · CONNECTED TO LOCAL DATABASE</div>
          <h1 className="text-2xl font-bold text-[#0F172A] plex tracking-tight">Study Materials & Official Books</h1>
          <p className="text-sm text-[#64748B] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Official Cambridge past papers, high-scoring essay samples, vocabulary lists, and grammar guides.
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
            onClick={() => r.url && window.open(r.url, '_blank')}
            className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors cursor-pointer group flex flex-col justify-between"
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
                  className={`text-base transition-colors ${saved.has(r.id) ? 'text-[#BE123C]' : 'text-slate-300 hover:text-slate-500'}`}
                >
                  {saved.has(r.id) ? '★' : '☆'}
                </button>
              </div>

              <h3 className="text-[13px] font-semibold text-[#0F172A] plex leading-snug mb-2 group-hover:text-[#DC2626] transition-colors">
                {r.title}
              </h3>
              <p className="text-[11px] text-[#64748B] leading-relaxed mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
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

            <div className="border-t border-[#F1F5F9] px-5 py-3 flex items-center justify-between bg-slate-50/50">
              <span className="mono text-[9px] text-[#94A3B8] border border-divider px-2 py-0.5 rounded bg-white">
                {r.tag}
              </span>
              <button
                type="button"
                onClick={e => {
                  if (r.url) {
                    e.stopPropagation()
                    window.open(r.url, '_blank')
                  }
                }}
                className="mono text-[10px] font-semibold text-[#DC2626] hover:underline"
              >
                {r.url ? 'Open / Download PDF ↗' : 'Read Article →'}
              </button>
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
    </div>
  )
}
