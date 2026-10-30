# Gemini Master Prompt: IELTS Computer-Delivered Preparation Platform (Vistora)

You are an expert full-stack web engineer and security architect. Your task is to build and maintain **Vistora**, a comprehensive, production-grade computer-delivered IELTS preparation platform.

---

## 🏗️ 1. Architecture Overview

The platform uses a decoupled static frontend with a managed BaaS backend and external institutional audio streaming:

```text
Vercel (Free Tier)
├── Static HTML5 Pages
├── Modern Vanilla CSS3 (Custom Design System)
├── Modular Vanilla JavaScript (ES Modules)
└── Supabase JavaScript Client (@supabase/supabase-js)

Supabase (Free Tier BaaS)
├── Authentication (Supabase Auth: Email/Password, Sessions)
├── PostgreSQL Relational Database
├── Row Level Security (RLS) Policies on All Tables
└── Optional Edge Functions / Vercel Serverless (For Privileged Operations Only)

SharePoint (Institutional Storage)
└── External IELTS Listening Audio Files Only (Direct HTTP/Range Streaming)
```

### Critical Backend Migration Rule
> **Do not convert the Express backend directly into a permanent server.** Migrate persistent backend functionality to Supabase and keep the Vercel deployment static and compatible with the free plan. Use Vercel serverless functions or Supabase Edge Functions only for operations that cannot safely run in the browser.

---

## ⚡ 2. Frontend Technology Stack & Strict Rules

The final frontend must use **ONLY**:
- **HTML5** (Semantic elements, accessible structures, unique descriptive IDs on interactive elements)
- **CSS3** (Modern responsive design system, CSS variables/tokens, custom typography, dark/light theme, micro-animations, glassmorphism)
- **Vanilla JavaScript (ES Modules)** (Native DOM manipulation, `fetch`, state management, modular architecture)
- **JSON** (Local IELTS test questions, reading passages, scoring keys, and UI configurations)
- **Supabase JavaScript Client** (CDN bundle or ES module import of `@supabase/supabase-js`)

### 🚫 STRICT PROHIBITIONS
- **DO NOT USE** React, Next.js, Vue, Angular, Svelte, or any other frontend framework.
- **DO NOT USE** TypeScript, JSX, or TSX in the final deployment.
- **DO NOT USE** Tailwind CSS, React Router, Bootstrap, or any heavy utility CSS framework.
- **DO NOT USE** a continuously running Node.js / Express.js server in production.
- **DO NOT REQUIRE** any paid hosting, paid database, or paid storage tier.

The application must be completely deployable as a static site on **Vercel's free subscription** using `vercel` CLI or Git repository integration without requiring a production build pipeline.

---

## 🗄️ 3. Supabase Integration & Security Architecture

Replace any local Express endpoints or JSON files (`results.json`, `users.json`, etc.) with Supabase wherever persistent backend functionality is required.

### What Supabase Manages:
1. **User Authentication**: Sign up, login, logout, password resets, session persistence, automatic token refreshes, and protected page routing. Use Supabase Auth directly—**do not create a custom password or JWT system**.
2. **User Profiles**: User metadata, avatar links, role flags (`student`, `admin`), target band scores, and study stats.
3. **Exam Results**: Detailed band scores (Overall, Listening, Reading, Writing, Speaking), correct answer counts, submitted answer sets (JSONB), and timestamps.
4. **Study Tasks / Study Planner**: Personalized checklist items, target dates, priorities, and completion status.
5. **Community Forum**: Discussion threads, categorization tags, nested/chronological replies, view counts, and upvotes.
6. **Forum Upvotes**: Per-user thread upvotes with unique constraints to strictly prevent duplicate voting.
7. **Admin User Management**: Admin-only operations protected by PostgreSQL Row Level Security (RLS) role verification.

---

## 🔒 4. Database Schema & RLS Security (`supabase/schema.sql`)

Provide a clean, production-ready SQL migration file located at `supabase/schema.sql`:

```sql
-- =============================================================================
-- VISTORA IELTS PLATFORM: COMPLETE SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  target_band NUMERIC(2, 1) DEFAULT 7.5 CHECK (target_band >= 0 AND target_band <= 9.0),
  target_exam_date DATE,
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. EXAM RESULTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE public.exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_title TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('Listening', 'Reading', 'Writing', 'Speaking', 'Full Mock')),
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
CREATE TABLE public.study_tasks (
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
CREATE TABLE public.forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY['General']::TEXT[],
  upvotes_count INT NOT NULL DEFAULT 0,
  replies_count INT NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 5. FORUM REPLIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE public.forum_replies (
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
CREATE TABLE public.forum_upvotes (
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

CREATE OR REPLACE TRIGGER on_forum_reply_changed
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

CREATE OR REPLACE TRIGGER on_forum_upvote_changed
  AFTER INSERT OR DELETE ON public.forum_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_upvote_count();

-- -----------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX idx_exam_results_user ON public.exam_results(user_id, completed_at DESC);
CREATE INDEX idx_study_tasks_user ON public.study_tasks(user_id, is_completed);
CREATE INDEX idx_forum_threads_created ON public.forum_threads(created_at DESC);
CREATE INDEX idx_forum_replies_thread ON public.forum_replies(thread_id, created_at ASC);
CREATE INDEX idx_forum_upvotes_thread_user ON public.forum_upvotes(thread_id, user_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================--------------------------------============

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
CREATE POLICY "Users can read own profile or admin can read all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    -- Prevent users from escalating their own role in the browser
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Exam Results Policies
CREATE POLICY "Users can read own exam results or admin can read all"
  ON public.exam_results FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own exam results"
  ON public.exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exam results or admin can delete all"
  ON public.exam_results FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Study Tasks Policies
CREATE POLICY "Users can manage own study tasks"
  ON public.study_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Forum Threads Policies
CREATE POLICY "Anyone authenticated can view forum threads"
  ON public.forum_threads FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create forum threads"
  ON public.forum_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forum threads or admin can moderate"
  ON public.forum_threads FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own forum threads or admin can delete"
  ON public.forum_threads FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Forum Replies Policies
CREATE POLICY "Anyone authenticated can view replies"
  ON public.forum_replies FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create replies"
  ON public.forum_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit own replies or admin can moderate"
  ON public.forum_replies FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own replies or admin can delete"
  ON public.forum_replies FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Forum Upvotes Policies
CREATE POLICY "Anyone authenticated can view upvotes"
  ON public.forum_upvotes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create own upvotes"
  ON public.forum_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own upvotes"
  ON public.forum_upvotes FOR DELETE
  USING (auth.uid() = user_id);
```

### Security Guardrails:
- **Never trust a role sent from the browser**: Role verification must happen in database RLS or backend functions via `auth.uid()`.
- **Never expose the Supabase service-role key** in frontend code, client scripts, or GitHub commits.
- **Use public Anon Key only**: The public Supabase URL and anon key are safe for browser code when paired with strict RLS.

---

## 🎧 5. Audio Dataset: SharePoint Links

Use these links for listening exam audio files only. **Preserve every URL exactly as provided. Do not download the audio files into the repository. Do not upload them to Supabase Storage.**

```javascript
export const audioCatalog = {
  "18": {
    "1": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQBv4a8twI6ZQLolwjxkN-7MASimYUsDU31TgXkZG9mXYZk?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQCbL_fftHuJSKq31i6znV0vAVxjS5jbTBb-6Hf40V-Hiu0?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQB74jD5Za3RR4kn_Na0IhfZARX7Msfm4dop2PJ7QiodC1o?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQBgEvfdh6wzQoYrgngcZDO9ATyTga285kJXlj60U5hN7wg?download=1"
    },
    "2": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQA9aWMGHz_RQLqlLKPsAZoFATq9XEs0e3nqwURcHeFUmmY?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQCMtawHfxNXTKgLIl8IQdVJAeFTE2c4izh8wifrIKlJsYY?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQDIicUzqlnMQ7Fl0j_xcn-pAT-V2aNtqhwndhZs4Q0UtP8?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQCJcsHrkWrYS7j_pXZFyuKMAfilr7nxY92u3EoUUKb54Bc?download=1"
    },
    "3": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQAaKNayr6NYSrJ4VgNCWwyRAatY9ZyFKb4lTccXP9cW_wM?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQBGqsajt2A_TZiGXjFFHtt5Ad1AK4vSp8ymKGnSI2HkOlM?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQARWhH3Fx_ORITAi7dP2pkRAfzw3LzTPRps5dzbxXgEt3w?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQAWNmCp0hHQR7UjsW7y2Pp9AW3p1kkXxno6SPfqhV-Atj8?download=1"
    },
    "4": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQB2USvnYkKvSpSF6jjkMGmYAYHzZBogWm6sz3gQoOEwpKQ?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQCSAnYEGoUFTJEXPy4mgzAMARSgJgd-FAlbRRxC6v5dh_k?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQBGepYgS8PeSqSpW_TvsJX9ARERmj-ecp_tGeWq8qusN5U?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQDfcyp9U0J_SbITiCgMdc2bAd920qbU7fG73QnLZPdM2Ds?download=1"
    }
  },
  "19": {
    "1": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQDqEYnseN4qQa8Azp9UR9tkAYfOSakgl7fojSmp6HYKHgc?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQBXjS8Ivl3XTKNKztJp_x0yAbl4OPaHT6Ts3TiFS2IVKdc?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQBXjS8Ivl3XTKNKztJp_x0yAbl4OPaHT6Ts3TiFS2IVKdc?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQDKTPbXvHCrQqGWA159TmnFAfrfy9mqp_Yjq-I2Q2her3Y?download=1"
    },
    "2": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQCdOM5zCm48Qrm_sAkVbx92AabNMcZPu1iFRueplRMi2Ew?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQB4yPWFC1b8RrtKWy9QE9IYAVxQbZtMGskI5Nf-dssVOXI?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQB4yPWFC1b8RrtKWy9QE9IYAVxQbZtMGskI5Nf-dssVOXI?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQDPpA9hco-7QpDeflrx_n1BAc_o8fWLtkvCLhkHoNwCsjc?download=1"
    },
    "3": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQA_VuVnMv5fQ5Mzs1umQq6jAQqk18sAWlmQNoxnfQLjUkA?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQBr35blMFToSL4w902-vMjWAUEFDJwG9VG7Ob2ftpv78gw?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQB97K6MiULFSKO_Q_8eSXKgAaFqKrBoY_djBVZSyZ2xMo4?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQDrZJOJIknUSaGO6_kMkb_FAXL6XJne1f1nsALXVkrQrOk?download=1"
    },
    "4": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQCqg5pxvP-ERI8hhvjeP-iWAalwlOO3lRg9X7dpE_kafaA?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQCGXQHY4HDWRqZZr5pfP2BDAWxnXDEwHwZprGrKOHWP5h8?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQAHcRS11Y8xSbp_v8pFsuw2AS_AaL4Ks7RCrYmcfzruWw4?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQC6z5nQa5RtQIYVOkHWplB-AS12Z9rGz3trNNmc_WC7Hn8?download=1"
    }
  },
  "20": {
    "1": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQB16i0BWcdaTbLw-aCYKC0IAc8q-nZLPCcT0ZhdAnzhpgc?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQBsLPet7JYhQbAkFUclBG9-AQqngqZJGbd5ItzD8gLJ-0M?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQCH9c1uEOt8RKqPnTO1F7caASuAmuMYIqcN2KIt8h7v1OY?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQDHlSRV6jA2R69p5E6EzIRqATKvuWbRN4L7IpCHOrtfGhM?download=1"
    },
    "2": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQBxDPdy1Bq0R4tsAZaCIqoSAQgmVPysVFXZE5p3ssHvDCk?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQAR5BbWJJRTQ5TXjV2SxOUDAYyGVG9GXMSurtp3n5GfWzk?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQAXZgxTQAXvSI6KD-dOUuk_AReaUSS-Z1FOJ2VNc6rUcgE?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQDlEYuI9A6gT6XS-VX-JCRzASfTGJ9OaiBISThuKnPGxEI?download=1"
    },
    "3": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQDacWNwwcVKQp46_HaHprPaAWv8V_o-MU1liJGofpIHosI?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQDnoNeJem7hRoT59D5ACb4AAXUKAWImT2sInY5XRwe6qtg?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQATPi2ym0S9RaPZFEchKh1TActZ5p_TItqYJ9k3am9jVWo?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQBFS79AZiQPSrOQV2WuAAfvAWerfVBCvSLJjflRZtLW6I4?download=1"
    },
    "4": {
      "1": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQABEOeihXGoQbigfOH2okv-AQGz9Mzn0cSk3szpdB28Ics?download=1",
      "2": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQCO_nqrNn_lTKwW2WRk7urnAXoQQZYX_6XLHbt-Uw2uMCo?download=1",
      "3": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQD_SnIGUgwcQ4WIIdWLw4RAAWKNjpECkCYflZ2PtooeOXQ?download=1",
      "4": "https://ewubd-my.sharepoint.com/:u:/g/personal/2023-3-60-051_std_ewubd_edu/IQDFvSWXP7xOR6O6LlwaHiDnAZsSotOO-cwfe3ex2326IHg?download=1"
    }
  }
};
```

### Specific Duplicate Flags:
Ensure the application notes and handles these intentional duplicate links:
- **`IELTS 19 Test 1 Part 2`** and **`IELTS 19 Test 1 Part 3`** share the exact same URL: `.../IQBXjS8Ivl3XTKNKztJp_x0yAbl4OPaHT6Ts3TiFS2IVKdc?download=1`
- **`IELTS 19 Test 2 Part 2`** and **`IELTS 19 Test 2 Part 3`** share the exact same URL: `.../IQB4yPWFC1b8RrtKWy9QE9IYAVxQbZtMGskI5Nf-dssVOXI?download=1`

### Audio Player & Resilience Rules:
1. Load audio files using standard HTML5 `<audio>` element with `controls`, `preload="auto"`, and custom UI scrubbers.
2. If SharePoint playback fails due to CORS, authentication expiry, range-request blocks, or network issues:
   - Catch the error via the audio element's `onerror` listener.
   - Display a prominent, friendly UI alert: *"Unable to stream audio directly from institutional SharePoint (CORS/Range restriction). Please use the local MP3 fallback or verify access."*
   - Keep the **"📁 Select Local Audio File"** file-picker button visible and functional at all times so users can load any local MP3 instantly.
   - Do not leak private tokens or institutional credentials.
   - Use only the provided audio files; **do not bundle PDFs in audio requests**.

---

## 💾 6. Client Data-Storage vs. Supabase Rules

- **Use Supabase for**:
  - Authenticated user accounts and profiles.
  - Final submitted exam attempts and historical band scores.
  - Study planner tasks.
  - Community discussions, replies, and upvote tracking.
- **Use Browser `localStorage` ONLY for**:
  - In-progress exam answers (auto-saved per keystroke to prevent data loss).
  - Countdown timer state.
  - Unsaved forum post drafts.
  - Audio player volume and playback-speed preferences.
  - Temporary offline fallback queue.
- **Scoring Logic**:
  - Keep bundled IELTS answer keys and grading algorithms locally inside client-side JavaScript.
  - Compute listening and reading band scores immediately in the browser without requiring a backend roundtrip.
  - Only write the final calculated score and answers to Supabase.
  - Do not store IELTS answer keys in Supabase unless an administrative test-builder explicitly requires it.

---

## 🛠️ 7. Supabase Client Configuration (`js/lib/supabaseClient.js`)

Create a centralized Supabase configuration module supporting both environment variables and fallback runtime configs:

```javascript
// js/lib/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Retrieve credentials from window config (injected or static) or import.meta.env
const SUPABASE_URL = 
  (typeof window !== 'undefined' && window.__ENV__?.VITE_SUPABASE_URL) ||
  import.meta.env?.VITE_SUPABASE_URL ||
  '';

const SUPABASE_ANON_KEY = 
  (typeof window !== 'undefined' && window.__ENV__?.VITE_SUPABASE_ANON_KEY) ||
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Vistora] Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

---

## ⚠️ 8. Failure Handling & UI State Requirements

Never show a fake success state when a Supabase or network operation fails. Provide clear visual cues for:
1. **Supabase Unavailable**: Banner warning that offline mode is active and results will sync locally until connectivity is restored.
2. **Unauthenticated User**: Modal/Banner redirecting to `/login.html` with return path query param.
3. **Session Expired**: Gentle prompt to re-login without wiping in-progress exam answers from `localStorage`.
4. **Row Level Security Violation**: Meaningful notification that the requested operation was rejected by security policies.
5. **Empty States**: Friendly empty-state illustrations for *"No exam results yet"*, *"No active tasks"*, and *"Be the first to start a discussion"*.
6. **Audio Failure**: Explicit error banner alongside the active local MP3 override button.

---

## 🚀 9. Vercel Free-Tier Deployment Guide

### Deployment Configuration (`vercel.json`):
```json
{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/exam/(.*)", "destination": "/practice-test.html" }
  ]
}
```

### Deployment Commands:
```bash
# 1. Login to Vercel
vercel login

# 2. Deploy directly from repository root (Zero-build static site)
vercel

# 3. Set Production Environment Variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# 4. Deploy to production
vercel --prod
```

### Supabase Auth URL Configuration:
In the **Supabase Dashboard > Authentication > URL Configuration**:
- **Site URL**: `https://<your-project>.vercel.app`
- **Redirect URLs**:
  - `http://localhost:3000/**`
  - `http://localhost:5173/**`
  - `https://<your-project>.vercel.app/**`

---

## 🧪 10. Required Validation Checklist

Before finalizing, verify each of the following:
- [ ] User signup creates both an `auth.users` entry and a matching row in `public.profiles`.
- [ ] Login and session persistence work seamlessly across page reloads.
- [ ] Protected pages redirect unauthorized visitors to the login screen.
- [ ] Listening audio player successfully maps Books 18, 19, 20 to SharePoint URLs.
- [ ] Duplicate SharePoint URLs for `19 T1 A2/A3` and `19 T2 A2/A3` play reliably.
- [ ] Offline/CORS fallback file-picker allows loading local MP3s on failure.
- [ ] Exam answers auto-save to `localStorage` during tests.
- [ ] Exam submission calculates band scores locally and stores the completed result in `public.exam_results`.
- [ ] Users can delete their own results, but cannot delete another user's results (enforced by RLS).
- [ ] Study tasks support full CRUD with user isolation.
- [ ] Forum threads, replies, and upvotes function in real time with duplicate vote prevention.
- [ ] Admin panel operations verify `public.is_admin()` and reject unauthorized browser calls.
