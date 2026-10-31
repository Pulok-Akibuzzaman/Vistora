-- =============================================================================
-- VISTORA IELTS PLATFORM: COMPLETE MASTER SUPABASE DATABASE SCHEMA
-- Run this in your Supabase Dashboard -> SQL Editor -> New query -> Run
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE (User profiles, roles, target band, institution, bio)
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

-- Ensure all columns exist if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_band NUMERIC(2, 1) DEFAULT 7.5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_exam_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT DEFAULT 'East West University';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Bangladesh';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

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
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. EXAM RESULTS TABLE (Practice tests, diagnostic reports, band scores)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_title TEXT NOT NULL,
  test_type TEXT NOT NULL,
  overall_band NUMERIC(3, 1) NOT NULL,
  skill_bands JSONB DEFAULT '{}'::jsonb,
  correct_answers INT DEFAULT 0,
  total_questions INT DEFAULT 40,
  user_answers JSONB DEFAULT '{}'::jsonb,
  feedback TEXT,
  duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.exam_results ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE public.exam_results ADD COLUMN IF NOT EXISTS duration_seconds INT;
ALTER TABLE public.exam_results ADD COLUMN IF NOT EXISTS skill_bands JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.exam_results ADD COLUMN IF NOT EXISTS user_answers JSONB DEFAULT '{}'::jsonb;

-- -----------------------------------------------------------------------------
-- 3. STUDY TASKS TABLE (Dashboard study task tracker)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TEXT DEFAULT 'TODAY',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.study_tasks ADD COLUMN IF NOT EXISTS due_date TEXT DEFAULT 'TODAY';
ALTER TABLE public.study_tasks ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- -----------------------------------------------------------------------------
-- 4. FORUM THREADS TABLE (Community discussion board)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id BIGSERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'General Tips',
  title TEXT NOT NULL,
  preview TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY['General']::TEXT[],
  views INT NOT NULL DEFAULT 0,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  solved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS solved BOOLEAN DEFAULT FALSE;
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY['General']::TEXT[];

-- -----------------------------------------------------------------------------
-- 5. FORUM REPLIES TABLE (Discussion replies)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id BIGSERIAL PRIMARY KEY,
  thread_id BIGINT NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 6. FORUM UPVOTES TABLE (Prevent duplicate voting)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_upvotes (
  thread_id BIGINT NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (thread_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 7. RESOURCE BOOKMARKS TABLE (Saved study guides & Cambridge books)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resource_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT unique_user_resource_bookmark UNIQUE (user_id, resource_id)
);

-- -----------------------------------------------------------------------------
-- 8. APPLICATION DOCUMENTS TABLE (Saved CV, SOP, Personal Statement, Cover Letter)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('cv', 'sop', 'ps', 'cl')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  form_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 9. DELETED FORUM THREADS TABLE (Tombstones so deleted posts stay deleted globally)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deleted_forum_threads (
  thread_id TEXT PRIMARY KEY,
  deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 10. INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_exam_results_user ON public.exam_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_tasks_user ON public.study_tasks(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON public.forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_pinned ON public.forum_threads(pinned DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON public.forum_replies(thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_user ON public.resource_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_app_documents_user ON public.application_documents(user_id, updated_at DESC);

-- -----------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_forum_threads ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles Policies
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Exam Results Policies
DROP POLICY IF EXISTS "Users can manage own exam results" ON public.exam_results;
CREATE POLICY "Users can manage own exam results" ON public.exam_results FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Study Tasks Policies
DROP POLICY IF EXISTS "Users can manage own study tasks" ON public.study_tasks;
CREATE POLICY "Users can manage own study tasks" ON public.study_tasks FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Forum Threads Policies
DROP POLICY IF EXISTS "Anyone can read forum threads" ON public.forum_threads;
CREATE POLICY "Anyone can read forum threads" ON public.forum_threads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create threads" ON public.forum_threads;
CREATE POLICY "Authenticated users can create threads" ON public.forum_threads FOR INSERT WITH CHECK (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Authors or admin can update threads" ON public.forum_threads;
CREATE POLICY "Authors or admin can update threads" ON public.forum_threads FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Authors or admin can delete threads" ON public.forum_threads;
CREATE POLICY "Authors or admin can delete threads" ON public.forum_threads FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- Forum Replies Policies
DROP POLICY IF EXISTS "Anyone can read forum replies" ON public.forum_replies;
CREATE POLICY "Anyone can read forum replies" ON public.forum_replies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can post replies" ON public.forum_replies;
CREATE POLICY "Authenticated users can post replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Authors or admin can delete replies" ON public.forum_replies;
CREATE POLICY "Authors or admin can delete replies" ON public.forum_replies FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- Forum Upvotes Policies
DROP POLICY IF EXISTS "Anyone can view upvotes" ON public.forum_upvotes;
CREATE POLICY "Anyone can view upvotes" ON public.forum_upvotes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can upvote" ON public.forum_upvotes;
CREATE POLICY "Authenticated users can upvote" ON public.forum_upvotes FOR ALL USING (auth.uid() = user_id);

-- Resource Bookmarks Policies
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.resource_bookmarks;
CREATE POLICY "Users can manage own bookmarks" ON public.resource_bookmarks FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Application Documents Policies
DROP POLICY IF EXISTS "Users can manage own documents" ON public.application_documents;
CREATE POLICY "Users can manage own documents" ON public.application_documents FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Deleted Forum Threads Policies
DROP POLICY IF EXISTS "Anyone can view deleted thread records" ON public.deleted_forum_threads;
CREATE POLICY "Anyone can view deleted thread records" ON public.deleted_forum_threads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin or author can record deleted threads" ON public.deleted_forum_threads;
CREATE POLICY "Admin or author can record deleted threads" ON public.deleted_forum_threads FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated');
