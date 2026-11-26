-- =============================================================================
-- VISTORA IELTS PLATFORM: COMPLETE MASTER SUPABASE DATABASE SCHEMA
-- Paste this entire script into:
--   Supabase Dashboard -> SQL Editor -> New query -> Run (Ctrl+Enter)
-- Safe to run on a fresh database or re-run idempotently on an existing one.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE (User profiles, roles, study goals, institution, bio)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  target_band NUMERIC(2, 1) DEFAULT 7.5 CHECK (target_band >= 0 AND target_band <= 9.0),
  exam_module TEXT DEFAULT 'Academic',
  target_country TEXT DEFAULT 'United Kingdom',
  target_timeline TEXT DEFAULT '1–3 months',
  primary_focus TEXT DEFAULT 'Speaking',
  target_exam_date DATE,
  bio TEXT,
  institution TEXT DEFAULT 'East West University',
  country TEXT DEFAULT 'Bangladesh',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Ensure all columns exist if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_band NUMERIC(2, 1) DEFAULT 7.5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS exam_module TEXT DEFAULT 'Academic';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_country TEXT DEFAULT 'United Kingdom';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_timeline TEXT DEFAULT '1–3 months';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_focus TEXT DEFAULT 'Speaking';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_exam_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT DEFAULT 'East West University';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Bangladesh';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'instructor', 'admin'));

-- Trigger to auto-create profile on Supabase auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_band NUMERIC(2, 1);
BEGIN
  meta_band := CASE
    WHEN COALESCE(NEW.raw_user_meta_data->>'target_band', '') ~ '^[0-9]+(\.[0-9]+)?$'
      THEN LEAST(9.0, GREATEST(0.0, (NEW.raw_user_meta_data->>'target_band')::NUMERIC(2, 1)))
    ELSE 7.5
  END;

  INSERT INTO public.profiles (
    id, email, full_name, avatar_url, role, target_band, country
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NULLIF(LOWER(NEW.raw_user_meta_data->>'role'), ''), 'student'),
    LEAST(9.0, GREATEST(0.0, meta_band)),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'country', ''), 'Bangladesh')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    target_band = COALESCE(EXCLUDED.target_band, public.profiles.target_band);

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
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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

ALTER TABLE public.forum_threads ALTER COLUMN author_id DROP NOT NULL;
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS solved BOOLEAN DEFAULT FALSE;
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY['General']::TEXT[];

-- Reserve IDs 1..99 for initial seed threads so user-created threads never collide
SELECT setval(
  pg_get_serial_sequence('public.forum_threads', 'id'),
  GREATEST(COALESCE((SELECT MAX(id) FROM public.forum_threads), 100), 100)
);

-- -----------------------------------------------------------------------------
-- 5. FORUM REPLIES TABLE (Discussion replies)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id BIGSERIAL PRIMARY KEY,
  thread_id BIGINT NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.forum_replies ALTER COLUMN author_id DROP NOT NULL;

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
-- 9. DELETED FORUM THREADS TABLE (Tombstones so deleted posts stay deleted)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deleted_forum_threads (
  thread_id TEXT PRIMARY KEY,
  deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 10. CUSTOM TESTS TABLE (Admin-published IELTS exams from PDF Scanner)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_tests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  book TEXT NOT NULL,
  test_number INT NOT NULL DEFAULT 1,
  part INT,
  test_type TEXT NOT NULL DEFAULT 'Reading',
  module TEXT NOT NULL DEFAULT 'Academic',
  duration INT NOT NULL DEFAULT 60,
  difficulty TEXT DEFAULT 'Official Cambridge format',
  status TEXT DEFAULT 'New',
  passages JSONB NOT NULL DEFAULT '[]'::jsonb,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'Administrator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 11. AUDIO TRACKS TABLE (Admin SharePoint / OneDrive listening audio URLs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audio_tracks (
  track_key TEXT PRIMARY KEY,
  book TEXT NOT NULL,
  test_number INT NOT NULL,
  part INT NOT NULL,
  url TEXT NOT NULL,
  is_custom BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 12. INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_exam_results_user ON public.exam_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_tasks_user ON public.study_tasks(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON public.forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_pinned ON public.forum_threads(pinned DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON public.forum_replies(thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_user ON public.resource_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_app_documents_user ON public.application_documents(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_tests_created ON public.custom_tests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_tracks_book ON public.audio_tracks(book, test_number, part);

-- -----------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL POLICIES
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
ALTER TABLE public.custom_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_tracks ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "Public can view profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Exam Results Policies
DROP POLICY IF EXISTS "Users can manage own exam results" ON public.exam_results;
CREATE POLICY "Users can manage own exam results" ON public.exam_results
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Study Tasks Policies
DROP POLICY IF EXISTS "Users can manage own study tasks" ON public.study_tasks;
CREATE POLICY "Users can manage own study tasks" ON public.study_tasks
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Forum Threads Policies
DROP POLICY IF EXISTS "Anyone can read forum threads" ON public.forum_threads;
CREATE POLICY "Anyone can read forum threads" ON public.forum_threads
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create threads" ON public.forum_threads;
CREATE POLICY "Authenticated users can create threads" ON public.forum_threads
  FOR INSERT WITH CHECK (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Authors or admin can update threads" ON public.forum_threads;
CREATE POLICY "Authors or admin can update threads" ON public.forum_threads
  FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Authors or admin can delete threads" ON public.forum_threads;
CREATE POLICY "Authors or admin can delete threads" ON public.forum_threads
  FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- Forum Replies Policies
DROP POLICY IF EXISTS "Anyone can read forum replies" ON public.forum_replies;
CREATE POLICY "Anyone can read forum replies" ON public.forum_replies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can post replies" ON public.forum_replies;
CREATE POLICY "Authenticated users can post replies" ON public.forum_replies
  FOR INSERT WITH CHECK (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Authors or admin can delete replies" ON public.forum_replies;
CREATE POLICY "Authors or admin can delete replies" ON public.forum_replies
  FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- Forum Upvotes Policies
DROP POLICY IF EXISTS "Anyone can view upvotes" ON public.forum_upvotes;
CREATE POLICY "Anyone can view upvotes" ON public.forum_upvotes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can upvote" ON public.forum_upvotes;
CREATE POLICY "Authenticated users can upvote" ON public.forum_upvotes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Resource Bookmarks Policies
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.resource_bookmarks;
CREATE POLICY "Users can manage own bookmarks" ON public.resource_bookmarks
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Application Documents Policies
DROP POLICY IF EXISTS "Users can manage own documents" ON public.application_documents;
CREATE POLICY "Users can manage own documents" ON public.application_documents
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Deleted Forum Threads Policies
DROP POLICY IF EXISTS "Anyone can view deleted thread records" ON public.deleted_forum_threads;
CREATE POLICY "Anyone can view deleted thread records" ON public.deleted_forum_threads
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin or author can record deleted threads" ON public.deleted_forum_threads;
CREATE POLICY "Admin or author can record deleted threads" ON public.deleted_forum_threads
  FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated')
  WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

-- Custom Tests Policies
DROP POLICY IF EXISTS "Anyone can read custom tests" ON public.custom_tests;
CREATE POLICY "Anyone can read custom tests" ON public.custom_tests
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage custom tests" ON public.custom_tests;
CREATE POLICY "Admins can manage custom tests" ON public.custom_tests
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Audio Tracks Policies
DROP POLICY IF EXISTS "Anyone can read audio tracks" ON public.audio_tracks;
CREATE POLICY "Anyone can read audio tracks" ON public.audio_tracks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage audio tracks" ON public.audio_tracks;
CREATE POLICY "Admins can manage audio tracks" ON public.audio_tracks
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 14. STORAGE BUCKET POLICIES (Avatars bucket for user profile pictures)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public avatars access" ON storage.objects;
CREATE POLICY "Public avatars access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );
