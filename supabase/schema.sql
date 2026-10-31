-- =============================================================================
-- VISTORA IELTS PLATFORM: COMPLETE SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  target_band NUMERIC(2, 1) DEFAULT 7.5 CHECK (target_band >= 0 AND target_band <= 9.0),
  target_exam_date DATE,
  bio TEXT,
  institution TEXT DEFAULT 'East West University',
  country TEXT DEFAULT 'Bangladesh',
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Trigger to auto-create profile on Supabase auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. EXAM RESULTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_title TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('Listening', 'Reading', 'Writing', 'Speaking', 'Full Test')),
  overall_band NUMERIC(2, 1) NOT NULL CHECK (overall_band >= 0 AND overall_band <= 9.0),
  skill_bands JSONB DEFAULT '{}'::jsonb,
  correct_answers INT DEFAULT 0,
  total_questions INT DEFAULT 40,
  user_answers JSONB DEFAULT '{}'::jsonb,
  comment TEXT,
  source TEXT DEFAULT 'Automatic',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 3. STUDY TASKS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General' CHECK (category IN ('Listening', 'Reading', 'Writing', 'Speaking', 'Vocabulary', 'General')),
  due_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 4. FORUM THREADS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General Tips',
  tags TEXT[] DEFAULT ARRAY['General']::TEXT[],
  upvotes_count INT NOT NULL DEFAULT 0,
  replies_count INT NOT NULL DEFAULT 0,
  views_count INT NOT NULL DEFAULT 1,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_solved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 5. FORUM REPLIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 6. FORUM UPVOTES TABLE (Strict duplicate vote prevention)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT unique_thread_user_upvote UNIQUE (thread_id, user_id)
);

-- Triggers to maintain reply and upvote counts automatically
CREATE OR REPLACE FUNCTION public.update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_threads SET replies_count = replies_count + 1 WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_threads SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_forum_reply_changed ON public.forum_replies;
CREATE TRIGGER on_forum_reply_changed
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_reply_count();

CREATE OR REPLACE FUNCTION public.update_thread_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_threads SET upvotes_count = upvotes_count + 1 WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_threads SET upvotes_count = GREATEST(upvotes_count - 1, 0) WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_forum_upvote_changed ON public.forum_upvotes;
CREATE TRIGGER on_forum_upvote_changed
  AFTER INSERT OR DELETE ON public.forum_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_upvote_count();

-- -----------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_exam_results_user ON public.exam_results(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_tasks_user ON public.study_tasks(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON public.forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON public.forum_replies(thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_forum_upvotes_thread_user ON public.forum_upvotes(thread_id, user_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_upvotes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile or admin can read all" ON public.profiles;
CREATE POLICY "Users can read own profile or admin can read all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Exam Results Policies
DROP POLICY IF EXISTS "Users can read own exam results or admin can read all" ON public.exam_results;
CREATE POLICY "Users can read own exam results or admin can read all"
  ON public.exam_results FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own exam results" ON public.exam_results;
CREATE POLICY "Users can insert own exam results"
  ON public.exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own exam results or admin can delete all" ON public.exam_results;
CREATE POLICY "Users can delete own exam results or admin can delete all"
  ON public.exam_results FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Study Tasks Policies
DROP POLICY IF EXISTS "Users can manage own study tasks" ON public.study_tasks;
CREATE POLICY "Users can manage own study tasks"
  ON public.study_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Forum Threads Policies
DROP POLICY IF EXISTS "Anyone authenticated can view forum threads" ON public.forum_threads;
CREATE POLICY "Anyone authenticated can view forum threads"
  ON public.forum_threads FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create forum threads" ON public.forum_threads;
CREATE POLICY "Authenticated users can create forum threads"
  ON public.forum_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own forum threads or admin can moderate" ON public.forum_threads;
CREATE POLICY "Users can update own forum threads or admin can moderate"
  ON public.forum_threads FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own forum threads or admin can delete" ON public.forum_threads;
CREATE POLICY "Users can delete own forum threads or admin can delete"
  ON public.forum_threads FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Forum Replies Policies
DROP POLICY IF EXISTS "Anyone authenticated can view replies" ON public.forum_replies;
CREATE POLICY "Anyone authenticated can view replies"
  ON public.forum_replies FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create replies" ON public.forum_replies;
CREATE POLICY "Authenticated users can create replies"
  ON public.forum_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can edit own replies or admin can moderate" ON public.forum_replies;
CREATE POLICY "Users can edit own replies or admin can moderate"
  ON public.forum_replies FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own replies or admin can delete" ON public.forum_replies;
CREATE POLICY "Users can delete own replies or admin can delete"
  ON public.forum_replies FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Forum Upvotes Policies
DROP POLICY IF EXISTS "Anyone authenticated can view upvotes" ON public.forum_upvotes;
CREATE POLICY "Anyone authenticated can view upvotes"
  ON public.forum_upvotes FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create own upvotes" ON public.forum_upvotes;
CREATE POLICY "Users can create own upvotes"
  ON public.forum_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own upvotes" ON public.forum_upvotes;
CREATE POLICY "Users can delete own upvotes"
  ON public.forum_upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 8. RESOURCE BOOKMARKS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resource_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT unique_user_resource_bookmark UNIQUE (user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_user ON public.resource_bookmarks(user_id);

ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own resource bookmarks" ON public.resource_bookmarks;
CREATE POLICY "Users can manage own resource bookmarks"
  ON public.resource_bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

