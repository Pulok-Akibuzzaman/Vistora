import { useState } from 'react'

const CATEGORIES_FORUM = ['All Topics', 'Writing Help', 'Reading Strategies', 'Listening Tips', 'Speaking Practice', 'Score Reports', 'Test Anxiety', 'Study Plans']

const THREADS = [
  {
    id: 1, category: 'Writing Help', title: 'How to avoid repetition in Task 2 — strategies that helped me go from 6.0 to 7.5',
    author: 'Priya Krishnamurthy', avatar: 'PK', country: 'India', time: '2h ago',
    replies: 34, views: 1240, upvotes: 89, pinned: true, solved: true,
    preview: 'After three attempts at Writing, I finally cracked the coherence issue. The key for me was learning to use referencing (this, these, such) instead of repeating the same nouns...',
    tags: ['Task 2', 'Band 7+', 'Coherence'],
  },
  {
    id: 2, category: 'Score Reports',
    title: 'Band 8.0 achieved — full breakdown of my 6-month preparation strategy',
    author: 'Mohammed Al-Qasim', avatar: 'MQ', country: 'Bahrain', time: '5h ago',
    replies: 67, views: 4800, upvotes: 203, pinned: true, solved: false,
    preview: 'R: 8.5, L: 8.5, W: 7.5, S: 7.5. Overall 8.0. I want to share everything that worked and what I would do differently...',
    tags: ['Band 8', 'Strategy', 'Motivation'],
  },
  {
    id: 3, category: 'Reading Strategies',
    title: 'True/False/Not Given — I finally understand the difference (with examples)',
    author: 'Yuki Tanaka', avatar: 'YT', country: 'Japan', time: '8h ago',
    replies: 28, views: 2100, upvotes: 112, pinned: false, solved: true,
    preview: 'The distinction between False and Not Given tripped me up for months. Here is the mental model that finally clicked for me...',
    tags: ['Reading', 'TFNG', 'Technique'],
  },
  {
    id: 4, category: 'Speaking Practice',
    title: 'Part 2 monologue fluency — anyone up for daily speaking exchange?',
    author: 'Amara Okonkwo', avatar: 'AO', country: 'Nigeria', time: '1d ago',
    replies: 45, views: 980, upvotes: 67, pinned: false, solved: false,
    preview: 'Looking for a speaking partner for daily 30-minute Zoom sessions. I\'m preparing for Academic IELTS, targeting Band 7 in Speaking...',
    tags: ['Speaking', 'Partner', 'Practice'],
  },
  {
    id: 5, category: 'Study Plans',
    title: 'Realistic 8-week study plan for Band 7+ — free template included',
    author: 'Elena Sokolova', avatar: 'ES', country: 'Ukraine', time: '2d ago',
    replies: 93, views: 7600, upvotes: 341, pinned: false, solved: false,
    preview: 'I created a day-by-day study plan for my 8-week IELTS preparation that ended in a Band 7.5. Sharing the complete Google Sheets template...',
    tags: ['Study Plan', '8 Weeks', 'Free Resource'],
  },
  {
    id: 6, category: 'Writing Help',
    title: 'Task 1 — bar chart description vocabulary: what examiners want vs. what students write',
    author: 'Wei Zhang', avatar: 'WZ', country: 'China', time: '3d ago',
    replies: 22, views: 1870, upvotes: 78, pinned: false, solved: false,
    preview: 'I analyzed 50 sample Task 1 responses and noticed a pattern in the vocabulary that separates Band 6 from Band 7+ descriptions...',
    tags: ['Task 1', 'Vocabulary', 'Bar Chart'],
  },
]

const RECENT_QA = [
  { q: 'Is it better to use "however" or "nevertheless" in academic writing?', a: 'Both are appropriate for formal academic writing. "Nevertheless" is slightly more emphatic and less common — using it sparingly can signal lexical range to the examiner.', author: 'Ayaan R.' },
  { q: 'How many complex sentences should a Task 2 essay have?', a: 'No fixed number, but aim for 60-70% complex/compound-complex sentences. Too many can hurt readability — examiners score range AND accuracy equally.', author: 'Dr. Sarah K.' },
  { q: 'Can I use contractions in IELTS Writing Task 1?', a: 'No. IELTS Writing requires formal register. Contractions (don\'t, it\'s, won\'t) are inappropriate in both Task 1 and Task 2. Always use full forms.', author: 'Vistora AI' },
]

export default function CommunityForum() {
  const [activeCat, setActiveCat] = useState('All Topics')
  const [newPost, setNewPost] = useState(false)
  const [activeThread, setActiveThread] = useState<number | null>(null)

  const filtered = THREADS.filter(t => activeCat === 'All Topics' || t.category === activeCat)

  if (activeThread !== null) {
    const thread = THREADS.find(t => t.id === activeThread)!
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => setActiveThread(null)} className="mono text-[11px] text-[#DC2626] hover:underline mb-4 block">← Back to Forum</button>
        <div className="bg-white border border-[#E2E8F0] p-6 mb-4" style={{ borderRadius: 4 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="mono text-[9px] px-2 py-0.5 bg-[#FEE2E2] text-[#991B1B]" style={{ borderRadius: 2 }}>{thread.category.toUpperCase()}</span>
            {thread.solved && <span className="mono text-[9px] px-2 py-0.5 bg-[#F0FDF4] text-[#065F46]" style={{ borderRadius: 2 }}>SOLVED ✓</span>}
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] plex mb-4">{thread.title}</h2>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F1F5F9]">
            <div className="w-8 h-8 bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] text-xs font-bold" style={{ borderRadius: 3 }}>{thread.avatar}</div>
            <div>
              <span className="text-sm font-medium text-[#0F172A] plex">{thread.author}</span>
              <span className="mono text-[10px] text-[#94A3B8] ml-2">{thread.country} · {thread.time}</span>
            </div>
          </div>
          <p className="text-[13px] text-[#374151] leading-[1.8]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {thread.preview} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. This is an expanded version of the forum post with complete content. The strategies mentioned above have been validated by multiple test-takers who achieved their target band scores using similar methods.
          </p>
          <div className="flex items-center gap-3 mt-4">
            {thread.tags.map(t => <span key={t} className="mono text-[10px] text-[#64748B] border border-[#E2E8F0] px-2 py-0.5" style={{ borderRadius: 2 }}>#{t}</span>)}
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-[#F1F5F9]">
            <span className="text-sm font-semibold text-[#0F172A] plex">{thread.replies} Replies</span>
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="p-5 border-b border-[#F8FAFC]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#FFE4E6] flex items-center justify-center text-[#BE123C] text-[9px] font-bold" style={{ borderRadius: 3 }}>U{i}</div>
                <span className="text-xs font-medium text-[#0F172A] plex">User_{i}234</span>
                <span className="mono text-[10px] text-[#94A3B8]">{i}d ago</span>
              </div>
              <p className="text-[12px] text-[#374151] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Thank you for sharing this! This is exactly what I needed to understand. I had the same issue with my writing — following these techniques helped me improve my coherence score significantly.
              </p>
            </div>
          ))}
          <div className="p-5">
            <textarea placeholder="Write a reply..." className="w-full border border-[#E2E8F0] focus:border-[#DC2626] px-4 py-3 text-[12px] outline-none resize-none bg-[#FAFAF7]" style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif', minHeight: 80 }} />
            <button className="mt-2 bg-[#DC2626] text-white text-xs font-semibold px-5 py-2 hover:bg-[#B91C1C] transition-colors" style={{ borderRadius: 3, fontFamily: 'IBM Plex Sans, sans-serif' }}>Post Reply</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="label-tag mb-1">COMMUNITY FORUM · 40,000+ MEMBERS</div>
          <h1 className="text-2xl font-bold text-[#0F172A] plex tracking-tight">Discussion Forum</h1>
          <p className="text-sm text-[#64748B] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Ask questions, share strategies, and learn from IELTS candidates worldwide.</p>
        </div>
        <button onClick={() => setNewPost(true)}
          className="bg-[#DC2626] text-white text-xs font-semibold px-5 py-2.5 hover:bg-[#B91C1C] transition-colors" style={{ borderRadius: 4, fontFamily: 'IBM Plex Sans, sans-serif' }}>
          + New Thread
        </button>
      </div>

      {newPost && (
        <div className="bg-white border-2 border-[#DC2626] p-5 mb-5" style={{ borderRadius: 4 }}>
          <div className="label-tag mb-3">NEW THREAD</div>
          <input placeholder="Thread title..." className="w-full border border-[#E2E8F0] focus:border-[#DC2626] px-4 py-2.5 text-sm text-[#374151] outline-none mb-3 bg-[#FAFAF7]" style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif' }} />
          <div className="flex gap-3 mb-3">
            <select className="border border-[#E2E8F0] focus:border-[#DC2626] px-3 py-2 text-[12px] text-[#374151] outline-none bg-[#FAFAF7]" style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif' }}>
              {CATEGORIES_FORUM.slice(1).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <textarea placeholder="Describe your question or topic in detail..." className="w-full border border-[#E2E8F0] focus:border-[#DC2626] px-4 py-3 text-[12px] text-[#374151] outline-none resize-none bg-[#FAFAF7] mb-3" style={{ borderRadius: 3, fontFamily: 'Inter, sans-serif', minHeight: 100 }} />
          <div className="flex gap-2">
            <button className="bg-[#DC2626] text-white text-xs font-semibold px-5 py-2 hover:bg-[#B91C1C] transition-colors" style={{ borderRadius: 3, fontFamily: 'IBM Plex Sans, sans-serif' }}>Post Thread</button>
            <button onClick={() => setNewPost(false)} className="border border-[#E2E8F0] text-[#64748B] text-xs px-5 py-2 hover:border-[#CBD5E1]" style={{ borderRadius: 3, fontFamily: 'IBM Plex Sans, sans-serif' }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div>
          {/* Category tabs */}
          <div className="flex gap-1.5 flex-wrap mb-4">
            {CATEGORIES_FORUM.map(c => (
              <button key={c} onClick={() => setActiveCat(c)}
                className={`mono text-[10px] px-3 py-1.5 border tracking-widest transition-all ${activeCat === c ? 'bg-[#0F172A] border-[#0F172A] text-white' : 'border-[#E2E8F0] text-[#64748B] bg-white hover:border-[#CBD5E1]'}`}
                style={{ borderRadius: 3 }}>
                {c.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Thread list */}
          <div className="space-y-3">
            {filtered.map(t => (
              <div key={t.id} className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] cursor-pointer transition-colors" style={{ borderRadius: 4 }} onClick={() => setActiveThread(t.id)}>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-[#FEE2E2] text-[#DC2626]" style={{ borderRadius: 4 }}>{t.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="mono text-[9px] px-1.5 py-0.5 bg-[#FEE2E2] text-[#991B1B]" style={{ borderRadius: 2 }}>{t.category.toUpperCase()}</span>
                        {t.pinned && <span className="mono text-[9px] px-1.5 py-0.5 bg-[#FEF9C3] text-[#92400E]" style={{ borderRadius: 2 }}>PINNED</span>}
                        {t.solved && <span className="mono text-[9px] px-1.5 py-0.5 bg-[#F0FDF4] text-[#065F46]" style={{ borderRadius: 2 }}>SOLVED ✓</span>}
                      </div>
                      <h3 className="text-[14px] font-semibold text-[#0F172A] plex leading-snug mb-1 group-hover:text-[#DC2626]">{t.title}</h3>
                      <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{t.preview}</p>
                      <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
                        <span className="plex font-medium text-[#64748B]">{t.author}</span>
                        <span className="mono">{t.country}</span>
                        <span>·</span>
                        <span className="mono">{t.time}</span>
                        <div className="flex items-center gap-3 ml-auto">
                          <span className="mono">↑ {t.upvotes}</span>
                          <span className="mono">💬 {t.replies}</span>
                          <span className="mono">👁 {t.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {t.tags.length > 0 && (
                  <div className="border-t border-[#F8FAFC] px-5 py-2.5 flex items-center gap-2">
                    {t.tags.map(tag => <span key={tag} className="mono text-[9px] text-[#94A3B8] border border-[#F1F5F9] px-2 py-0.5" style={{ borderRadius: 2 }}>#{tag}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Q&A */}
          <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
            <div className="px-4 py-4 border-b border-[#F1F5F9] flex items-center gap-2">
              <span className="w-1 h-4 bg-[#BE123C]" style={{ borderRadius: 1 }} />
              <span className="text-sm font-semibold text-[#0F172A] plex">Quick Q&A</span>
            </div>
            <div className="divide-y divide-[#F8FAFC]">
              {RECENT_QA.map((qa, i) => (
                <div key={i} className="p-4">
                  <p className="text-[11px] font-medium text-[#1E293B] mb-2 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>Q: {qa.q}</p>
                  <p className="text-[11px] text-[#64748B] leading-relaxed mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>A: {qa.a}</p>
                  <span className="mono text-[10px] text-[#94A3B8]">— {qa.author}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Community stats */}
          <div className="bg-[#0F172A] p-4 bg-navy-grid" style={{ borderRadius: 4 }}>
            <div className="label-tag text-[#475569] mb-3">COMMUNITY STATS</div>
            {[['Members', '40,284'], ['Posts Today', '847'], ['Active Now', '312'], ['Questions Solved', '96%']].map(([l, v]) => (
              <div key={l} className="flex items-center justify-between py-2 border-b border-[#1E293B] last:border-0">
                <span className="text-[11px] text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</span>
                <span className="mono text-[11px] font-semibold text-white">{v}</span>
              </div>
            ))}
          </div>

          {/* Top contributors */}
          <div className="bg-white border border-[#E2E8F0]" style={{ borderRadius: 4 }}>
            <div className="px-4 py-3 border-b border-[#F1F5F9]">
              <span className="text-xs font-semibold text-[#0F172A] plex">Top Contributors</span>
            </div>
            {[['Mohammed A.', 'BH', 341, '#FEE2E2', '#DC2626'], ['Elena S.', 'UA', 289, '#FFE4E6', '#BE123C'], ['Wei Z.', 'CN', 214, '#F0FDF4', '#059669']].map(([name, c, pts, bg, col]) => (
              <div key={name as string} className="flex items-center gap-3 px-4 py-3 border-b border-[#F8FAFC] last:border-0">
                <div className="w-7 h-7 flex items-center justify-center text-[10px] font-bold" style={{ background: bg as string, color: col as string, borderRadius: 3 }}>
                  {(name as string).split('.')[0].split(' ').map(p => p[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-medium text-[#0F172A] plex">{name as string}</div>
                  <div className="mono text-[10px] text-[#94A3B8]">{c as string}</div>
                </div>
                <div className="mono text-[11px] font-semibold text-[#64748B]">{pts as number} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
