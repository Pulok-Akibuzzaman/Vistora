# 🎓 Vistora — Computer-Delivered IELTS Preparation Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-Pulok--Akibuzzaman%2FVistora-181717?style=flat&logo=github)](https://github.com/Pulok-Akibuzzaman/Vistora)
[![Course](https://img.shields.io/badge/Course-CSE412-dc2626)](https://github.com/Pulok-Akibuzzaman/Vistora)
[![Hosting](https://img.shields.io/badge/Hosting-Vercel%20Static%20Free-black)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-Supabase%20BaaS-3ecf8e)](https://supabase.com)
[![Audio](https://img.shields.io/badge/Audio-Institutional%20SharePoint-0078d4)](https://github.com/Pulok-Akibuzzaman/Vistora)

> **Official Repository:** [https://github.com/Pulok-Akibuzzaman/Vistora](https://github.com/Pulok-Akibuzzaman/Vistora)  
> **Academic Institution:** East West University (EWU) — Department of Computer Science & Engineering  
> **Course:** CSE412 — Software Engineering / Systems Project  

---

## 📖 Project Overview

**Vistora** is a production-grade, computer-delivered IELTS preparation platform built for **CSE412**. It is architected as a lightweight, zero-build static web application hosted on **Vercel's free subscription**, backed by a cloud-native **Supabase** backend (Authentication, PostgreSQL Database, and Row Level Security), and streaming official Cambridge IELTS listening audio directly from institutional SharePoint storage with an offline local MP3 upload fallback.

### 🌟 Key Features
- **Authentic Computer-Delivered IELTS Interface**: Exact layout, color scheme, split-pane passages, and 40-question navigation grids matching official British Council & IDP computer-delivered tests.
- **Direct Cambridge Audio Streaming**: Instant playback of Cambridge IELTS Books 18, 19, and 20 listening tests with 1.0x/1.25x/1.5x speed control, timeline scrubbing, and robust fallback handling.
- **Client-Side Deterministic Band 9.0 Scoring**: Bundled answer keys and scoring algorithms compute Listening and Reading band scores in-browser with zero backend lag.
- **Supabase Cloud BaaS**: Secure user authentication, exam attempt persistence, study task checklists, and community forum discussions with Row Level Security (RLS) enforcement.
- **Academic Writing Evaluator**: Live word counter, paragraph structure analysis, and Band 9.0 criterion estimation across TR, CC, LR, and GRA.
- **Live Official Test Schedules**: Searchable and filterable British Council Bangladesh examination schedules across Dhaka, Chattogram, and Sylhet.

---

## 🏗️ System Architecture

The platform follows a modern, decoupled architecture requiring no continuously running server:

```text
Vercel (Free Tier Static Hosting)
├── Static HTML5 Pages (index.html + pages/*.html)
├── Modern Vanilla CSS3 (Custom Design System with Glassmorphism)
├── Modular Vanilla JavaScript (Native ES Modules)
└── Supabase JavaScript Client (@supabase/supabase-js)

Supabase (Free Tier BaaS Backend)
├── Authentication (Supabase Auth: Sign up, Sign in, Session Persistence)
├── PostgreSQL Relational Database (UUIDs, Foreign Keys, Indexes, Triggers)
├── Row Level Security (RLS) on all 6 tables
└── Optional Edge Functions (For privileged/administrative tasks)

SharePoint (Institutional Storage)
└── Cambridge IELTS 18, 19, 20 Listening Audio Files Only (Direct Range Streaming)
```

---

## 💻 Tech Stack & Strict Constraints

| Layer | Technology | Role in Vistora |
| :--- | :--- | :--- |
| **Structure** | **HTML5** | Semantic, accessible test layouts and unique element IDs |
| **Styling** | **Vanilla CSS3** | Custom design system (`css/main.css`, `css/test-player.css`), glassmorphism, responsive navigation |
| **Logic** | **Vanilla JavaScript (ES Modules)** | DOM manipulation, state management, audio controller, local scoring engine |
| **Backend / DB** | **Supabase** | Cloud PostgreSQL database, user profiles, exam records, forum threads, study tasks |
| **Authentication** | **Supabase Auth** | Email/password sign-up, session restoration across refreshes, protected route guards |
| **Security** | **PostgreSQL RLS** | Server-enforced Row Level Security policies protecting user isolation |
| **Media** | **Institutional SharePoint** | HTTP streaming of official Cambridge audio tracks with local MP3 fallback |
| **Hosting** | **Vercel** | Zero-build static deployment on Vercel's free plan with clean URL rewrites |

> [!NOTE]
> **Zero Frontend Framework Overhead**: The application deliberately avoids React, TypeScript, Tailwind, Next.js, or complex bundlers in production, ensuring instant page loads, zero build steps, and full compliance with Vercel's static free tier.

---

## 📂 Project Directory Structure

```text
Vistora/
├── index.html                   # 🏠 Main site entry point & landing page
├── pages/                       # 📄 Dedicated application pages
│   ├── practice-test.html       # IELTS test simulator (Listening & Reading)
│   ├── dashboard.html           # Student overview & study tasks planner
│   ├── results.html             # Past exam scores & question review
│   ├── profile.html             # Student profile & target band score
│   ├── forum.html               # Community discussions & upvote feed
│   ├── writing-eval.html        # Academic Writing evaluator
│   ├── exam-dates.html          # British Council exam schedules
│   ├── resources.html           # Cambridge prep guides & AWL links
│   ├── login.html               # Supabase sign in & registration portal
│   └── admin.html               # System administration & stats
├── css/                         # 🎨 Vanilla CSS design system
│   ├── main.css                 # Core tokens, glassmorphism, responsive nav
│   └── test-player.css          # Exam room split-view & audio controls
├── js/                          # ⚡ Modular Vanilla JavaScript
│   ├── lib/                     # Core libraries
│   │   ├── supabaseClient.js    # Centralized Supabase client module
│   │   ├── auth.js              # Session & profile management
│   │   ├── scoring.js           # Local bundled IELTS scoring engine
│   │   └── audioCatalog.js      # SharePoint audio links & duplicate URL flags
│   ├── data/                    # Static test data
│   │   ├── listeningData.js     # Listening tests 1 & 2 questions and keys
│   │   ├── readingData.js       # Reading passages 1 to 4 and keys
│   │   ├── examDatesData.js     # British Council Bangladesh exam dates
│   │   └── resourcesData.js     # Cambridge prep guides
│   └── pages/                   # Page-specific controllers
│       └── practiceTest.js      # Exam room logic, timer, answer saving
├── supabase/                    # 🔒 Database & RLS Migration
│   └── schema.sql               # PostgreSQL tables, triggers & security policies
├── archive/                     # 📦 Archived legacy code (Express & React)
│   ├── backend/
│   ├── Frontend UI/
│   └── start-dev.js
├── vercel.json                  # Clean URL rewrites (/dashboard, /practice-test, etc.)
├── .vercelignore                # Excludes archive/ & Database/ from Vercel builds
├── GEMINI_MASTER_PROMPT.md      # Comprehensive AI master prompt specification
├── package.json                 # Dev static server scripts
└── README.md                    # Complete project documentation
```

---

## 🔒 Supabase Setup & Database Migration

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, choose a project name (e.g. `vistora-ielts`), and set a secure database password.
3. Select a region close to your target users (e.g., `Singapore` or `Frankfurt`).

### Step 2: Apply the SQL Schema & RLS Policies
1. In your Supabase Dashboard, open the **SQL Editor** from the left sidebar.
2. Open [`supabase/schema.sql`](supabase/schema.sql) from this repository.
3. Paste the entire content into the SQL Editor and click **Run**.
4. This automatically creates:
   - `public.profiles` table with automatic user creation trigger on `auth.users`
   - `public.exam_results` table for Band scores, raw scores, and user answers
   - `public.study_tasks` table for personalized study checklists
   - `public.forum_threads`, `public.forum_replies`, and `public.forum_upvotes` tables
   - `public.is_admin()` helper function for role checks
   - **Row Level Security (RLS)** policies on all tables ensuring students can only read/edit their own data and preventing duplicate forum upvotes.

### Step 3: Configure Supabase Auth Redirect URLs
1. Navigate to **Authentication > URL Configuration**.
2. Set **Site URL** to:
   ```text
   https://<your-project>.vercel.app
   ```
3. In **Redirect URLs**, add:
   ```text
   http://localhost:3000/**
   https://<your-project>.vercel.app/**
   ```

### Step 4: Retrieve Project API Credentials
In **Project Settings > API**, copy:
- **Project URL** (`https://<project-ref>.supabase.co`)
- **Project API Anon Key** (`eyJhbGci...`)

---

## 🚀 Running the Project Locally

No build step or Node.js compilation is required. You can serve the static site using any local HTTP server:

### Method 1: Using npm (Recommended)
```bash
# Clone the repository
git clone https://github.com/Pulok-Akibuzzaman/Vistora.git
cd Vistora

# Start local static server
npm run dev
```
Open your browser and navigate to:
```text
http://localhost:3000
```

### Method 2: Using Python or VS Code Live Server
```bash
# Python 3
python -m http.server 3000
```
Or open the project folder in VS Code and click **Go Live** with the Live Server extension.

---

## 🌐 Deploying to Vercel (Free Plan)

The repository is configured for immediate, zero-build deployment on Vercel's free subscription.

### Option A: Connecting GitHub Repository (Recommended)
1. Push your repository to GitHub.
2. Go to [https://vercel.com](https://vercel.com) and click **Add New > Project**.
3. Import your **Vistora** repository.
4. In the configuration screen:
   - **Root Directory:** `./`
   - **Framework Preset:** `Other` (or static)
   - **Build Command:** Leave empty / default
   - **Output Directory:** Leave empty / default
5. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://<your-project-id>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
6. Click **Deploy**.

### Option B: Using the Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy directly from the project root
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Deploy to production
vercel --prod
```

---

## 🎧 Audio Dataset & SharePoint Streaming

Audio recordings for Cambridge IELTS Books 18, 19, and 20 are streamed directly via HTTP range requests from supplied institutional SharePoint links.

### Audio Catalog Mapping (`js/lib/audioCatalog.js`)
- **Cambridge 18**: Tests 1–4, Parts 1–4 mapped to official MP3 streams.
- **Cambridge 19**: Tests 1–4, Parts 1–4 mapped to official MP3 streams.
- **Cambridge 20**: Tests 1–4, Parts 1–4 mapped to official MP3 streams.

### Flagged Duplicate URLs:
In the official dataset, the following audio tracks intentionally share identical URLs:
- `19 T1 A2` and `19 T1 A3`
- `19 T2 A2` and `19 T2 A3`

### Audio Resilience & Offline Fallback:
1. When a test part is selected, the HTML5 audio element attempts direct playback from SharePoint.
2. If SharePoint restricts playback due to CORS, authentication expiry, range-request limits, or network firewalls:
   - The audio player displays an error notice:  
     *"Unable to stream audio directly from institutional SharePoint (CORS/Range restriction). Please use the local MP3 fallback or verify access."*
   - The **"📁 Select Local MP3"** override button allows the test taker to select any local MP3 file on their computer to proceed with the exam seamlessly.

---

## 📊 Client Data-Storage vs. Supabase Rules

| Data Category | Storage Location | Rationale |
| :--- | :--- | :--- |
| **User Accounts & Profiles** | **Supabase Auth & `profiles`** | Secure authentication and multi-user isolation |
| **Completed Exam Results** | **Supabase `exam_results`** | Persistent historical progress tracking across devices |
| **Study Tasks** | **Supabase `study_tasks`** | Cloud-synced personalized preparation checklist |
| **Forum Threads & Replies** | **Supabase `forum_threads`** | Real-time peer discussions |
| **Forum Upvotes** | **Supabase `forum_upvotes`** | Database-enforced duplicate vote prevention (`UNIQUE(thread_id, user_id)`) |
| **In-Progress Answers** | **Browser `localStorage`** | Auto-saved per keystroke to prevent data loss on accidental reload |
| **Live Exam Timer** | **Browser `localStorage`** | Preserves countdown state across tab refreshes |
| **Scoring Keys & Logic** | **Bundled in `js/lib/scoring.js`** | Instant in-browser scoring with zero backend latency |

---

## 🛡️ Security & Free-Plan Considerations

1. **Service-Role Key Protection**: The Supabase service-role key is never included in client JavaScript or committed to GitHub.
2. **Row Level Security (RLS)**: Enforced on all Supabase tables so students cannot inspect or modify other users' exam results or study tasks.
3. **Admin Verification**: Privileged administrative actions verify `public.is_admin()` directly on the database level rather than trusting client-sent roles.
4. **Free Tier Compatibility**:
   - Zero continuously running backend server (saves 100% of compute costs).
   - Static hosting on Vercel's free plan.
   - Database and authentication run within Supabase's generous free tier limits.

---

## 👨‍💻 Course Information & Authors

- **Course:** CSE412 — Software Engineering / Systems Project
- **Institution:** East West University (EWU), Dhaka, Bangladesh
- **Team Lead / Maintainer:** Pulok Akibuzzaman ([@Pulok-Akibuzzaman](https://github.com/Pulok-Akibuzzaman))
- **Official Repository:** [https://github.com/Pulok-Akibuzzaman/Vistora](https://github.com/Pulok-Akibuzzaman/Vistora)
