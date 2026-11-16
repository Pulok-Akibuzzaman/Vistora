/**
 * Vercel Serverless Function: /api/forum
 * Provides centralized, live Supabase-backed persistence for the IELTS Discussion Forum.
 * Supports:
 * - GET: Fetch live threads, replies, and persistent deleted IDs
 * - POST: Create thread, add reply, vote, toggle pin
 * - DELETE: Delete thread or reply with persistent tombstone tracking
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rhxyoroqqpapzufekidn.supabase.co'
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'sb_secret_yMYd5uNVyF6aok7yorDhkg_blKjikGd'

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const INITIAL_SEED_THREADS = [
  {
    id: 1,
    category: 'Reading Strategies',
    title: 'How to reliably distinguish FALSE vs NOT GIVEN in Cambridge 18 Reading',
    preview:
      'If the passage directly contradicts the statement, it is FALSE. If the author never took a stance or information is absent, it is NOT GIVEN...',
    content:
      'A foolproof method for TFNG questions:\n1. Underline keywords in the statement.\n2. Locate the corresponding evidence in the passage.\n3. Verify truth value: FALSE means factual contradiction. NOT GIVEN means the text does not supply enough information to decide.\n\nPractice with Cambridge 18 Test 1 Passage 1 on urban agriculture!',
    tags: ['Reading', 'TFNG', 'Cambridge18'],
    pinned: false,
    solved: true,
  },
  {
    id: 2,
    category: 'Writing Help',
    title: 'Band 8 Academic Writing Task 2: 4-Paragraph Blueprint',
    preview:
      'Introduction (paraphrase + thesis) -> Body 1 (first argument + example) -> Body 2 (counter/second argument) -> Conclusion.',
    content:
      'Avoid over-complicating Task 2 essays. A clean four-paragraph structure with strong cohesion markers and academic collocations consistently scores Band 8+.\n\nParagraph 1: Background paraphrase + clear thesis statement\nParagraph 2: Main argument with concrete illustration\nParagraph 3: Counter-perspective or secondary argument with rebuttal\nParagraph 4: Concise conclusion reiterating your stance without new claims',
    tags: ['Writing', 'Task2', 'Band8'],
    pinned: false,
    solved: false,
  },
  {
    id: 3,
    category: 'Speaking Practice',
    title: 'Overcoming pauses in Speaking Part 2 Cue Cards',
    preview:
      'Use the 1-minute prep time to draw a 4-quadrant mindmap: Who, When, What happened, Why memorable...',
    content:
      'Never write full sentences during the 1-minute preparation. Write 2 keywords per cue question. Practice speaking with the Puku AI examiner to measure your words per minute and filler frequency.\n\nKeep speaking naturally until the examiner signals you to stop. Reaching 1:45 to 2:00 minutes is crucial for Fluency and Coherence.',
    tags: ['Speaking', 'Part2', 'Fluency'],
    pinned: false,
    solved: true,
  },
  {
    id: 4,
    category: 'Listening Tips',
    title: 'Avoiding distractors in Cambridge Listening Section 4 lectures',
    preview:
      'Speakers often say a number or date and then immediately self-correct: "We started in 1994... sorry, 1996".',
    content:
      'In Section 4, the lecturer speaks continuously without a mid-section pause. Always read ahead during the 30-second break before Section 4 starts! Pay close attention to transition words like "however", "in contrast", and speaker self-corrections.',
    tags: ['Listening', 'Section4', 'Distractors'],
    pinned: false,
    solved: false,
  },
  {
    id: 5,
    category: 'Test Anxiety',
    title: 'Computer-delivered IELTS exam day checklist (Dhaka British Council)',
    preview:
      'Everything you need to know about the Fuller Road centre: lockers, passport checks, headphones, and screen ergonomics...',
    content:
      'Took the computer-delivered test at Fuller Road last Tuesday. The equipment is modern and noise-cancelling headphones are provided. Remember to arrive 45 minutes before test time with your original passport (photocopies or NID are NOT accepted).',
    tags: ['BritishCouncil', 'Dhaka', 'FullerRoad', 'ComputerDelivered'],
    pinned: false,
    solved: true,
  },
]

async function getAdminUserId(): Promise<string> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
  if (data && data[0]?.id) return data[0].id

  const { data: anyUser } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .limit(1)
  return anyUser && anyUser[0]?.id ? anyUser[0].id : 'ea7f0a40-6f53-4f38-a9fc-fc6c5964de5f'
}

async function getDeletedIds(): Promise<string[]> {
  try {
    const { data } = await supabaseAdmin.from('deleted_forum_threads').select('thread_id')
    if (data && data.length > 0) {
      return data.map((d: any) => String(d.thread_id))
    }
  } catch {}

  try {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('bio')
      .eq('role', 'admin')
      .limit(1)
    if (data && data[0]?.bio && data[0].bio.includes('VISTORA_DELETED_THREADS:')) {
      const json = data[0].bio.split('VISTORA_DELETED_THREADS:')[1]?.trim()
      return JSON.parse(json)
    }
  } catch {}
  return []
}

async function saveDeletedId(id: string | number): Promise<void> {
  const idStr = String(id)
  try {
    await supabaseAdmin
      .from('deleted_forum_threads')
      .insert({ thread_id: idStr })
  } catch {}

  try {
    const existing = await getDeletedIds()
    if (!existing.includes(idStr)) {
      existing.push(idStr)
    }
    const { data: admin } = await supabaseAdmin
      .from('profiles')
      .select('id, bio')
      .eq('role', 'admin')
      .limit(1)
    if (admin && admin[0]) {
      const currentBio = admin[0].bio || 'Platform Administrator & Lead Developer'
      const baseBio = currentBio.split('VISTORA_DELETED_THREADS:')[0]?.trim() || 'Platform Administrator & Lead Developer'
      const newBio = `${baseBio}\n\nVISTORA_DELETED_THREADS:${JSON.stringify(existing)}`
      await supabaseAdmin.from('profiles').update({ bio: newBio }).eq('id', admin[0].id)
    }
  } catch (err) {
    console.warn('Failed to persist deleted ID tombstone:', err)
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const method = req.method
  const action = req.query.action || (req.body && req.body.action)

  // ---------------------------------------------------------------------------
  // 1. GET: Fetch all active forum threads and deleted IDs
  // ---------------------------------------------------------------------------
  if (method === 'GET') {
    try {
      const deletedIds = await getDeletedIds()
      const deletedSet = new Set(deletedIds.map(String))

      let { data: threads, error: threadErr } = await supabaseAdmin
        .from('forum_threads')
        .select(
          '*, author:profiles!forum_threads_author_id_fkey(id, full_name, email, avatar_url, country)'
        )
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (threadErr) {
        console.warn('Supabase thread fetch error:', threadErr)
      }

      // If Supabase table is empty, seed initial community threads once
      if (!threads || threads.length === 0) {
        const adminId = await getAdminUserId()
        for (const item of INITIAL_SEED_THREADS) {
          if (!deletedSet.has(String(item.id))) {
            await supabaseAdmin.from('forum_threads').insert({
              id: item.id,
              author_id: adminId,
              category: item.category,
              title: item.title,
              preview: item.preview,
              content: item.content,
              tags: item.tags,
              pinned: item.pinned,
              solved: item.solved,
            })
          }
        }

        const refetch = await supabaseAdmin
          .from('forum_threads')
          .select(
            '*, author:profiles!forum_threads_author_id_fkey(id, full_name, email, avatar_url, country)'
          )
          .order('pinned', { ascending: false })
          .order('created_at', { ascending: false })

        threads = refetch.data || []
      }

      // Fetch replies
      const { data: replies } = await supabaseAdmin
        .from('forum_replies')
        .select(
          '*, author:profiles!forum_replies_author_id_fkey(id, full_name, email, avatar_url)'
        )
        .order('created_at', { ascending: true })

      // Fetch upvotes
      const { data: upvotes } = await supabaseAdmin
        .from('forum_upvotes')
        .select('thread_id, user_id')

      const upvotesByThread: Record<number, number> = {}
      if (upvotes) {
        for (const uv of upvotes) {
          upvotesByThread[uv.thread_id] = (upvotesByThread[uv.thread_id] || 0) + 1
        }
      }

      const repliesByThread: Record<number, any[]> = {}
      if (replies) {
        for (const r of replies) {
          if (!repliesByThread[r.thread_id]) repliesByThread[r.thread_id] = []
          const a = r.author || {}
          repliesByThread[r.thread_id].push({
            id: String(r.id),
            author: a.full_name || 'Community Member',
            authorId: a.id,
            authorEmail: a.email,
            avatar:
              a.avatar_url ||
              (a.full_name
                ? a.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                : 'CM'),
            time: new Date(r.created_at).toLocaleDateString(),
            content: r.content,
          })
        }
      }

      // Format threads
      const formattedThreads = (threads || [])
        .filter((t: any) => !deletedSet.has(String(t.id)))
        .map((t: any) => {
          const a = t.author || {}
          const threadReplies = repliesByThread[t.id] || []
          const upCount = upvotesByThread[t.id] || 0

          return {
            id: t.id,
            category: t.category,
            title: t.title,
            author: a.full_name || 'Community Member',
            authorId: a.id || t.author_id,
            authorEmail: a.email || '',
            avatar:
              a.avatar_url ||
              (a.full_name
                ? a.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                : 'CM'),
            country: a.country || 'Bangladesh',
            time: new Date(t.created_at).toLocaleDateString(),
            preview: t.preview || t.content?.slice(0, 140),
            content: t.content,
            replies: threadReplies.length,
            upvotes: upCount,
            downvotes: 0,
            score: upCount,
            tags: t.tags || [],
            solved: Boolean(t.solved),
            pinned: Boolean(t.pinned),
            replyList: threadReplies,
          }
        })

      return res.status(200).json({
        success: true,
        threads: formattedThreads,
        deletedIds,
      })
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message })
    }
  }

  // ---------------------------------------------------------------------------
  // 2. DELETE: Delete thread or reply
  // ---------------------------------------------------------------------------
  if (method === 'DELETE') {
    const threadId = req.query.id || (req.body && req.body.id)
    const replyId = req.query.replyId || (req.body && req.body.replyId)

    if (replyId) {
      await supabaseAdmin.from('forum_replies').delete().eq('id', replyId)
      return res.status(200).json({ success: true, deletedReplyId: replyId })
    }

    if (!threadId) {
      return res.status(400).json({ success: false, error: 'threadId is required' })
    }

    // 1. Delete from Supabase
    await supabaseAdmin.from('forum_replies').delete().eq('thread_id', threadId)
    await supabaseAdmin.from('forum_upvotes').delete().eq('thread_id', threadId)
    await supabaseAdmin.from('forum_threads').delete().eq('id', threadId)

    // 2. Record tombstone so seed threads or cached items never re-appear
    await saveDeletedId(threadId)

    return res.status(200).json({ success: true, deletedId: threadId })
  }

  // ---------------------------------------------------------------------------
  // 3. POST: Create thread, add reply, vote, toggle pin
  // ---------------------------------------------------------------------------
  if (method === 'POST') {
    const body = req.body || {}

    // 3a. Toggle Pin
    if (action === 'pin' || body.pinned !== undefined) {
      const threadId = body.id || req.query.id
      const isPinned = Boolean(body.pinned)
      await supabaseAdmin
        .from('forum_threads')
        .update({ pinned: isPinned })
        .eq('id', threadId)
      return res.status(200).json({ success: true, threadId, pinned: isPinned })
    }

    // 3b. Add Reply
    if (action === 'reply') {
      const { threadId, content, authorId } = body
      const effectiveAuthorId = authorId || (await getAdminUserId())

      const { data: reply, error } = await supabaseAdmin
        .from('forum_replies')
        .insert({
          thread_id: threadId,
          author_id: effectiveAuthorId,
          content: content.trim(),
        })
        .select(
          '*, author:profiles!forum_replies_author_id_fkey(id, full_name, email, avatar_url)'
        )
        .single()

      if (error) {
        return res.status(400).json({ success: false, error: error.message })
      }

      const a = reply.author || {}
      return res.status(200).json({
        success: true,
        reply: {
          id: String(reply.id),
          author: a.full_name || 'Community Member',
          authorId: a.id,
          authorEmail: a.email,
          avatar:
            a.avatar_url ||
            (a.full_name
              ? a.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'CM'),
          time: 'Just now',
          content: reply.content,
        },
      })
    }

    // 3c. Vote
    if (action === 'vote') {
      const { threadId, userId, direction } = body
      if (direction === 'up' && userId) {
        await supabaseAdmin
          .from('forum_upvotes')
          .insert({ thread_id: threadId, user_id: userId })
      } else if (userId) {
        await supabaseAdmin
          .from('forum_upvotes')
          .delete()
          .eq('thread_id', threadId)
          .eq('user_id', userId)
      }
      return res.status(200).json({ success: true })
    }

    // 3d. Create New Thread
    const { title, category, content, tags, authorId } = body
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' })
    }

    let effectiveAuthorId = authorId
    if (!effectiveAuthorId) {
      effectiveAuthorId = await getAdminUserId()
    }

    const preview = content.slice(0, 140)
    const { data: newRow, error: insertErr } = await supabaseAdmin
      .from('forum_threads')
      .insert({
        author_id: effectiveAuthorId,
        category: category || 'General Tips',
        title: title.trim(),
        preview,
        content: content.trim(),
        tags: Array.isArray(tags) ? tags : [category || 'General'],
        pinned: false,
        solved: false,
      })
      .select(
        '*, author:profiles!forum_threads_author_id_fkey(id, full_name, email, avatar_url, country)'
      )
      .single()

    if (insertErr) {
      return res.status(400).json({ success: false, error: insertErr.message })
    }

    // The response reports one upvote from the author, so record it or it is gone on the next fetch
    if (authorId) {
      await supabaseAdmin
        .from('forum_upvotes')
        .insert({ thread_id: newRow.id, user_id: authorId })
    }

    const a = newRow.author || {}
    const formatted = {
      id: newRow.id,
      category: newRow.category,
      title: newRow.title,
      author: a.full_name || 'Candidate',
      authorId: a.id || newRow.author_id,
      authorEmail: a.email || '',
      avatar:
        a.avatar_url ||
        (a.full_name
          ? a.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          : 'CA'),
      country: a.country || 'Bangladesh',
      time: 'Just now',
      preview: newRow.preview,
      content: newRow.content,
      replies: 0,
      upvotes: 1,
      downvotes: 0,
      score: 1,
      tags: newRow.tags || [],
      solved: false,
      pinned: false,
      replyList: [],
      userVote: 'up',
    }

    return res.status(200).json({ success: true, thread: formatted })
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}

