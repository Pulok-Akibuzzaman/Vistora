import { useEffect, useState } from 'react'
import {
  fetchForumThreads,
  createForumThreadApi,
  replyToForumThreadApi,
  voteForumThreadApi,
  type ForumThread,
} from '../lib/api'
import { useAuth } from '../lib/authContext'

const CATEGORIES_FORUM = [
  'All Topics',
  'Writing Help',
  'Reading Strategies',
  'Listening Tips',
  'Speaking Practice',
  'Score Reports',
  'Test Anxiety',
  'Study Plans',
]

export default function CommunityForum() {
  const { user } = useAuth()
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [activeCat, setActiveCat] = useState('All Topics')
  const [search, setSearch] = useState('')
  const [newPostOpen, setNewPostOpen] = useState(false)
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  // New thread form state
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Writing Help')
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')
  const [postingThread, setPostingThread] = useState(false)

  const userIdentifier = user?.email || user?.id || user?.name || 'candidate'

  const loadThreads = () => {
    fetchForumThreads(activeCat, search, userIdentifier)
      .then(setThreads)
      .catch(() => {})
  }

  useEffect(() => {
    loadThreads()
  }, [activeCat, search, userIdentifier])

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return
    setPostingThread(true)
    try {
      const tags = newTags.split(',').map(t => t.trim()).filter(Boolean)
      const authorName = user?.name || 'Student Candidate'
      const thread = await createForumThreadApi({
        title: newTitle,
        category: newCategory,
        content: newContent,
        tags: tags.length ? tags : [newCategory],
        author: authorName,
      })
      setThreads(prev => [thread, ...prev])
      setNewPostOpen(false)
      setNewTitle('')
      setNewContent('')
      setNewTags('')
      setActiveThreadId(thread.id)
    } finally {
      setPostingThread(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeThreadId || !replyText.trim()) return
    setSubmittingReply(true)
    try {
      const authorName = user?.name || 'Student Candidate'
      const { reply, thread } = await replyToForumThreadApi(
        activeThreadId,
        replyText,
        authorName
      )
      setThreads(prev =>
        prev.map(t =>
          t.id === activeThreadId
            ? {
                ...t,
                ...thread,
                replies: thread.replies,
                replyList: thread.replyList,
              }
            : t
        )
      )
      setReplyText('')
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleVote = async (threadId: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await voteForumThreadApi(threadId, direction, userIdentifier)
      setThreads(prev =>
        prev.map(t =>
          t.id === threadId
            ? {
                ...t,
                upvotes: res.upvotes,
                downvotes: res.downvotes,
                score: res.score,
                userVote: res.userVote,
              }
            : t
        )
      )
    } catch {}
  }

  const activeThread = threads.find(t => t.id === activeThreadId)

  if (activeThread) {
    const netScore = (activeThread.upvotes || 0) - (activeThread.downvotes || 0)
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => setActiveThreadId(null)}
          className="mono text-[11px] text-accent hover:underline mb-4 flex items-center gap-1 font-semibold cursor-pointer"
        >
          ← Back to Forum Discussions
        </button>

        <div className="bg-surface border border-divider p-6 mb-4 shadow-xs" style={{ borderRadius: 4 }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="mono text-[9px] px-2 py-0.5 bg-electric-dim text-accent-strong font-bold" style={{ borderRadius: 2 }}>
                {activeThread.category.toUpperCase()}
              </span>
              {activeThread.solved && (
                <span className="mono text-[9px] px-2 py-0.5 bg-success-soft text-positive-strong font-bold" style={{ borderRadius: 2 }}>
                  SOLVED ✓
                </span>
              )}
            </div>

            {/* Interactive Upvote & Downvote Controls */}
            <div className="flex items-center gap-1 rounded border border-divider bg-surface-2 p-1">
              <button
                type="button"
                onClick={e => handleVote(activeThread.id, 'up', e)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded transition-colors cursor-pointer ${
                  activeThread.userVote === 'up'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-graphite hover:bg-surface hover:text-emerald-600'
                }`}
                title="Upvote this discussion"
              >
                ▲ Upvote ({activeThread.upvotes || 0})
              </button>
              <span className="h-4 w-px bg-divider mx-1" />
              <span className={`font-mono text-xs font-extrabold px-1.5 ${netScore > 0 ? 'text-emerald-700' : netScore < 0 ? 'text-rose-600' : 'text-ink'}`}>
                {netScore > 0 ? `+${netScore}` : netScore}
              </span>
              <span className="h-4 w-px bg-divider mx-1" />
              <button
                type="button"
                onClick={e => handleVote(activeThread.id, 'down', e)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded transition-colors cursor-pointer ${
                  activeThread.userVote === 'down'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-graphite hover:bg-surface hover:text-rose-600'
                }`}
                title="Downvote this discussion"
              >
                ▼ Downvote ({activeThread.downvotes || 0})
              </button>
            </div>
          </div>

          <h1 className="text-xl font-bold text-ink plex mb-4">{activeThread.title}</h1>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-divider-soft">
            <div className="w-8 h-8 bg-electric-dim flex items-center justify-center text-accent text-xs font-bold" style={{ borderRadius: 3 }}>
              {activeThread.avatar}
            </div>
            <div>
              <span className="text-sm font-medium text-ink plex">{activeThread.author}</span>
              <span className="mono text-[10px] text-subtle ml-2">
                {activeThread.country} · {activeThread.time}
              </span>
            </div>
          </div>
          <p className="text-[13px] text-graphite leading-[1.8] whitespace-pre-line" style={{ fontFamily: 'Inter, sans-serif' }}>
            {activeThread.content || activeThread.preview}
          </p>
          <div className="flex items-center gap-2 mt-4">
            {activeThread.tags?.map(t => (
              <span key={t} className="mono text-[10px] text-muted border border-divider px-2 py-0.5" style={{ borderRadius: 2 }}>
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Replies Section */}
        <div className="bg-surface border border-divider" style={{ borderRadius: 4 }}>
          <div className="px-5 py-4 border-b border-divider-soft flex items-center justify-between">
            <span className="text-sm font-semibold text-ink plex">
              {activeThread.replyList?.length || activeThread.replies || 0} Discussion Replies
            </span>
            <span className="text-xs text-graphite-light font-mono">
              All community members can read and respond
            </span>
          </div>

          <div className="divide-y divide-divider-faint">
            {activeThread.replyList && activeThread.replyList.length > 0 ? (
              activeThread.replyList.map(rep => (
                <div key={rep.id} className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-violet-dim flex items-center justify-center text-accent-2 text-[9px] font-bold" style={{ borderRadius: 3 }}>
                      {rep.avatar}
                    </div>
                    <span className="text-xs font-medium text-ink plex">{rep.author}</span>
                    <span className="mono text-[10px] text-subtle">{rep.time}</span>
                  </div>
                  <p className="text-[12px] text-graphite leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {rep.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-subtle">
                No replies yet. Be the first to share your preparation thoughts!
              </div>
            )}
          </div>

          {/* Add Reply Form */}
          <form onSubmit={handleReply} className="p-5 border-t border-divider-soft bg-paper">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={`Write a helpful reply as ${user?.name || 'Student Candidate'}...`}
              className="w-full border border-divider focus:border-[#DC2626] px-4 py-3 text-[12px] outline-none resize-none bg-surface rounded"
              style={{ fontFamily: 'Inter, sans-serif', minHeight: 90 }}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-graphite-light font-mono">
                Replying publicly as <strong>{user?.name || 'Student Candidate'}</strong>
              </span>
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim()}
                className="bg-[#DC2626] text-white text-xs font-semibold px-5 py-2 hover:bg-[#B91C1C] transition-colors rounded disabled:opacity-50 cursor-pointer"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                {submittingReply ? 'Posting Reply...' : 'Post Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="label-tag mb-1">COMMUNITY FORUM · LIVE PEER LEARNING</div>
          <h1 className="text-2xl font-bold text-ink plex tracking-tight">IELTS Discussion Forum</h1>
          <p className="text-sm text-muted mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Open community discussions: ask questions, share preparation strategies, upvote or downvote helpful insights, and reply to fellow candidates.
          </p>
        </div>
        <button
          onClick={() => setNewPostOpen(true)}
          className="bg-[#DC2626] text-white text-xs font-semibold px-5 py-2.5 hover:bg-[#B91C1C] transition-colors rounded shadow-sm cursor-pointer"
          style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          + Create New Thread
        </button>
      </div>

      {/* New Thread Modal / Form */}
      {newPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-sm border border-divider bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h2 className="font-plex text-lg font-bold text-ink">Start a Community Discussion Thread</h2>
              <button onClick={() => setNewPostOpen(false)} className="text-graphite hover:text-ink text-sm font-mono cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateThread} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">Thread Title</label>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Tips for True/False/Not Given in Reading Passage 3"
                  className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase text-graphite-light">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric bg-surface"
                  >
                    {CATEGORIES_FORUM.slice(1).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase text-graphite-light">Tags (Comma-separated)</label>
                  <input
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    placeholder="e.g. Reading, TFNG, Band7"
                    className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-graphite-light">Post Content</label>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  rows={5}
                  placeholder="Write your question, strategy breakdown, or essay critique request for the community..."
                  className="mt-1 w-full rounded-sm border border-divider p-2.5 text-sm text-ink outline-none focus:border-electric resize-none"
                  required
                />
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-divider">
                <span className="text-[11px] text-graphite-light font-mono">
                  Posting as <strong>{user?.name || 'Student Candidate'}</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPostOpen(false)}
                    className="rounded-sm border border-divider px-4 py-2 text-xs font-semibold text-graphite hover:bg-surface-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={postingThread}
                    className="rounded-sm bg-electric px-5 py-2 text-xs font-semibold text-white hover:bg-electric-light disabled:opacity-50 cursor-pointer"
                  >
                    {postingThread ? 'Publishing...' : 'Publish Thread'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search discussions by keyword, topic, or tag..."
            className="w-full border border-divider bg-surface px-4 py-2.5 text-xs text-ink outline-none focus:border-electric rounded"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES_FORUM.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`mono text-[11px] px-3 py-1.5 rounded border transition-colors cursor-pointer ${
                activeCat === cat
                  ? 'border-line-ink bg-navy text-white font-bold'
                  : 'border-divider bg-surface text-graphite hover:border-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Threads list */}
      <div className="bg-surface border border-divider divide-y divide-divider-soft" style={{ borderRadius: 4 }}>
        {threads.length > 0 ? (
          threads.map(thread => {
            const netScore = (thread.upvotes || 0) - (thread.downvotes || 0)
            return (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className="p-5 hover:bg-surface-2 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="mono text-[9px] px-2 py-0.5 bg-electric-dim text-accent-strong font-bold rounded">
                      {thread.category}
                    </span>
                    {thread.pinned && (
                      <span className="mono text-[9px] px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                        PINNED 📌
                      </span>
                    )}
                    {thread.solved && (
                      <span className="mono text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded">
                        SOLVED ✓
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-ink plex mb-1 hover:text-rose-600 transition-colors">
                    {thread.title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {thread.preview || thread.content}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[11px] text-graphite font-medium">{thread.author}</span>
                    <span className="mono text-[10px] text-subtle">{thread.time}</span>
                    <div className="flex items-center gap-1 ml-auto sm:ml-0">
                      {thread.tags?.map(t => (
                        <span key={t} className="mono text-[9px] text-muted bg-surface-2 border border-divider px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:flex-col sm:items-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-divider-soft">
                  {/* Upvote & Downvote Widget */}
                  <div
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 rounded border border-divider bg-surface-2 p-1"
                  >
                    <button
                      type="button"
                      onClick={e => handleVote(thread.id, 'up', e)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded transition-colors cursor-pointer ${
                        thread.userVote === 'up'
                          ? 'bg-emerald-600 text-white'
                          : 'text-graphite hover:bg-surface hover:text-emerald-600'
                      }`}
                      title="Upvote"
                    >
                      ▲ {thread.upvotes || 0}
                    </button>
                    <span className={`font-mono text-xs font-extrabold px-1.5 ${netScore > 0 ? 'text-emerald-700' : netScore < 0 ? 'text-rose-600' : 'text-ink'}`}>
                      {netScore > 0 ? `+${netScore}` : netScore}
                    </span>
                    <button
                      type="button"
                      onClick={e => handleVote(thread.id, 'down', e)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded transition-colors cursor-pointer ${
                        thread.userVote === 'down'
                          ? 'bg-rose-600 text-white'
                          : 'text-graphite hover:bg-surface hover:text-rose-600'
                      }`}
                      title="Downvote"
                    >
                      ▼ {thread.downvotes || 0}
                    </button>
                  </div>

                  <div className="mono text-xs text-muted flex items-center gap-1">
                    💬 {thread.replies || thread.replyList?.length || 0} replies
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center text-sm text-subtle">
            No discussion threads found matching your filter. Click <strong>+ Create New Thread</strong> to start one!
          </div>
        )}
      </div>
    </div>
  )
}
