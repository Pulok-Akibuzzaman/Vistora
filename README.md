# 🎓 Vistora — Computer-Delivered IELTS Preparation & AI Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-Pulok--Akibuzzaman%2FVistora-181717?style=flat&logo=github)](https://github.com/Pulok-Akibuzzaman/Vistora)
[![Course](https://img.shields.io/badge/Course-CSE412-dc2626)](https://github.com/Pulok-Akibuzzaman/Vistora)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61dafb?logo=react)](https://react.dev)
[![Build Tool](https://img.shields.io/badge/Bundler-Vite%208-646cff?logo=vite)](https://vitejs.dev)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Puku.sh%20(puku--ai--2.8)-e11d48)](https://puku.sh)
[![Backend](https://img.shields.io/badge/Backend-Supabase%20BaaS-3ecf8e?logo=supabase)](https://supabase.com)
[![Hosting](https://img.shields.io/badge/Hosting-Vercel%20Edge-black?logo=vercel)](https://vercel.com)

> **Official Repository:** [https://github.com/Pulok-Akibuzzaman/Vistora](https://github.com/Pulok-Akibuzzaman/Vistora)  
> **Academic Institution:** East West University (EWU) — Department of Computer Science & Engineering  
> **Course:** CSE412 — Software Engineering / Systems Project  

---

## 📖 Project Overview

**Vistora** is a state-of-the-art, computer-delivered IELTS preparation and academic application platform. Built with **React 19**, **TypeScript**, and **Vite**, Vistora delivers an authentic exam-room experience matching official British Council and IDP computer-delivered IELTS tests.

The platform integrates **Puku.sh AI (`puku-ai-2.8`)** for real-time document generation (CV, Statement of Purpose, Personal Statement, Cover Letter) and IELTS Writing essay evaluation, backed by **Supabase** for cloud authentication, user profiles, and test attempt history, and deployed seamlessly on **Vercel**.

---

## 🌟 Key Features

### 1. 🎧 Authentic Computer-Delivered Test Simulator
- **Official Exam Blueprint**: Exact split-pane layout with independent scrolling, Cambridge IELTS typography, and 40-question navigation palette.
- **Cambridge IELTS Datasets**:
  - **Cambridge IELTS 21 Test 1**: Complete authentic reading passages (*The Davies Sisters*, *Why we need silence*, *The World of Sugar*) with 40 questions and verified answer keys.
  - **Cambridge IELTS Books 18, 19, and 20**: Listening tests with direct SharePoint audio streaming, playback speed controls (1.0x, 1.25x, 1.5x), timeline scrubbing, and local MP3 fallback.
- **Client-Side Deterministic Scoring**: Instant, zero-latency Band 9.0 calculation and diagnostic review with cited evidence.

### 2. 📄 Puku.sh AI Document Generator (`/documents`, `/doc-generator`)
- **Multi-Document Suite**: Tailored academic and career documents:
  - **Curriculum Vitae (CV)**: Formatted for international university admissions and scholarship committees.
  - **Statement of Purpose (SOP)**: Customized to target institution, program, research interests, and career goals.
  - **Personal Statement (PS)**: Narrative-driven essay highlighting motivating experiences and extracurriculars.
  - **Cover Letter (CL)**: Professional tone adapted for internships, graduate positions, or research roles.
- **Live Dynamic Sync**: Real-time draft preview as candidate enters details.
- **Puku AI Polish**: Powered by `puku-ai-2.8` via direct endpoint `https://api-cli.puku.sh/v1/messages`.
- **Clean Export**: One-click symbol cleaning (removes markdown hashes/asterisks), `.txt` download, and Print/PDF generation.

### 3. ✍️ Puku.sh AI Writing Evaluation (`/writing`)
- **Task 1 & Task 2 Support**: Evaluates essays against official IELTS band descriptors:
  - Task Achievement / Task Response (TA)
  - Coherence and Cohesion (CC)
  - Lexical Resource (LR)
  - Grammatical Range and Accuracy (GRA)
- **Instant Band Score**: Detailed criterion-by-criterion breakdown, vocabulary enhancements, and actionable suggestions.

### 4. 📊 Student Dashboard & Analytics (`/dashboard`)
- Overall Band Score radial visualization and skill-by-skill progress tracking.
- Synced Study Task Tracker with live database synchronization.
- Quick action launchers for Practice Tests, AI Writing Evaluation, and AI Document Generator.

### 5. 🌐 Community Forum & Resource Library (`/community`, `/resources`)
- Peer-to-peer discussion threads, category filters, and upvoting system.
- Curated academic vocabulary lists, grammar guides, and official Cambridge prep links.

### 6. 📅 Official Exam Dates (`/exam-dates`)
- Searchable British Council Bangladesh official test schedules across Dhaka, Chattogram, and Sylhet.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Cloud (Production)                │
│                                                                 │
│  React 19 SPA (Vite) ───► Client Router (Clean SPA Rewrites)    │
│  ├── Dynamic UI Components & Exact IELTS Test Dimensions        │
│  ├── Local Deterministic Scoring Engine (Zero Backend Lag)     │
│  └── Real-Time Form State & LocalStorage Persistence            │
└──────────────┬───────────────────────────────┬──────────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────────┐
│      Puku.sh AI Engine       │ │         Supabase BaaS          │
│   (https://api-cli.puku.sh)  │ │  (Cloud PostgreSQL Database)   │
│                              │ │                                │
│ ├── Model: puku-ai-2.8       │ │ ├── Authentication (Auth)      │
│ ├── Direct Client-Side CORS  │ │ ├── Row Level Security (RLS)   │
│ ├── SOP / CV / PS Generation │ │ ├── User Profiles & Roles      │
│ └── IELTS Essay Examiner     │ │ └── Exam Attempt History       │
└──────────────────────────────┘ └────────────────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** | Modern functional components, hooks, and Concurrent Mode |
| **Language** | **TypeScript** | Strict type safety across datasets, scoring models, and APIs |
| **Bundler & Dev Server** | **Vite 8** | Sub-second HMR and optimized production bundling into `dist/` |
| **Styling** | **Vanilla CSS + Tokens** | Custom academic blueprint theme, dark/light mode, responsive layouts |
| **AI Integration** | **Puku.sh AI (`puku-ai-2.8`)** | Anthropic Messages API format with direct client-side CORS |
| **Database & Auth** | **Supabase** | Cloud PostgreSQL, Row Level Security, email/password authentication |
| **Audio Streaming** | **Institutional SharePoint** | HTTP range requests for Cambridge IELTS audio tracks with local fallback |
| **Hosting** | **Vercel** | Automated Git deployments with single-page application routing |

---

## 💡 Why These Languages? (In Simple Words)

If anyone asks why we chose the specific programming languages and tools for Vistora, here is the simple explanation:

- **TypeScript (`.ts`, `.tsx`)**:
  - *Why we use it:* TypeScript is like JavaScript with a built-in safety net. In an IELTS exam simulator, there are hundreds of question numbers, user answers, scoring band formulas, and test settings. TypeScript checks our code while we write it and catches typos, misspelled names, or missing fields *before* the student ever encounters a bug on screen.

- **React (`.tsx`)**:
  - *Why we use it:* React lets us build the website out of reusable Lego-like pieces called "components" (for example: the audio timer, the split-screen reading passage, the 40-question button palette, and the AI document editor). When a student clicks an answer or types an essay, React updates just that specific part of the screen instantly without having to refresh or reload the whole page.

- **HTML5 (`index.html`)**:
  - *Why we use it:* HTML is the skeleton and foundation of the website. It provides the initial document shell that the web browser loads, sets the page title, configures the favicon logo, and defines where our React app mounts.

- **CSS3 & Tailwind CSS (`index.css`)**:
  - *Why we use it:* CSS is the styling that gives Vistora its authentic British Council & IDP exam-room look. It controls colors (like the red accent bars and dark/light mode), typography, buttons, and makes sure the split-screen layout adapts smoothly on laptops, tablets, and mobile devices.

- **SQL (`supabase/schema.sql`)**:
  - *Why we use it:* SQL is the universal language for databases. We use SQL to tell Supabase how to create secure tables for student accounts, exam band scores, study checklists, and community discussions. It also sets up Row Level Security (RLS) rules so students can only see their own private test scores.

- **JSON (`package.json`, `vercel.json`)**:
  - *Why we use it:* JSON is a clean, simple text format for storing settings and data. It lists what packages our project needs, tells Vercel how to build the site, and structures the AI requests sent to Puku.sh.

---

## 📂 Project Directory Structure

```text
Vistora/
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── Layout.tsx            # Global header, responsive nav, & footer
│   │   ├── RequireAuth.tsx       # Protected route authentication guard
│   │   ├── Motion.tsx            # Smooth animations & transitions
│   │   └── FullTestResult.tsx    # Comprehensive exam score summary
│   ├── data/                     # Exam datasets & answer keys
│   │   ├── readingTest21.ts      # Cambridge 21 Test 1 (Passages 1-3 & 40 Qs)
│   │   ├── readingPassages18.ts  # Cambridge 18 Reading datasets
│   │   └── examDatesData.ts      # British Council official dates
│   ├── lib/                      # Core platform modules
│   │   ├── pukuAi.ts             # Puku.sh AI client (puku-ai-2.8 & key integration)
│   │   ├── api.ts                # Client API layer with AI & academic fallbacks
│   │   ├── authContext.tsx       # Global user session & Supabase state
│   │   ├── supabaseClient.ts     # Supabase client initialization
│   │   └── theme.tsx             # Light / Dark theme controller
│   ├── pages/                    # Application page views
│   │   ├── Landing.tsx           # Interactive marketing & features showcase
│   │   ├── Dashboard.tsx         # Student progress & study task planner
│   │   ├── PracticeTest.tsx      # Computer-delivered exam room simulator
│   │   ├── DocGenerator.tsx      # Puku AI Document Generator (CV, SOP, PS, CL)
│   │   ├── WritingEval.tsx       # Puku AI IELTS Essay Evaluator
│   │   ├── Results.tsx           # Historical exam attempt analytics
│   │   ├── ExamDates.tsx         # British Council test schedule finder
│   │   ├── ResourceLibrary.tsx   # Cambridge preparation guides & materials
│   │   ├── CommunityForum.tsx    # Peer discussion forum & upvoting
│   │   ├── UserProfile.tsx       # Student profile & target band score
│   │   ├── AdminDashboard.tsx    # Administrative platform controls
│   │   └── Auth.tsx              # Login & registration forms
│   ├── App.tsx                   # Root application entry
│   ├── main.tsx                  # React DOM mount
│   └── routes.ts                 # Central router with comprehensive aliases
├── supabase/
│   └── schema.sql                # PostgreSQL database schema & RLS policies
├── vercel.json                   # Vite build commands & clean SPA rewrites
├── vite.config.ts                # Vite build configuration
├── package.json                  # Dependencies & npm scripts
└── README.md                     # Project documentation
```

---

## 🔑 Environment Configuration

Create a `.env.local` file in the project root (ignored by Git):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_here

# Puku.sh AI Configuration
VITE_PUKU_API_KEY=pk_live_your_puku_key_here
VITE_PUKU_BASE_URL=https://api-cli.puku.sh
VITE_PUKU_MODEL=puku-ai-2.8
```

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Installation & Launch
```bash
# 1. Clone the repository
git clone https://github.com/Pulok-Akibuzzaman/Vistora.git
cd Vistora

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at `http://localhost:3000` (or `http://localhost:5173`).

### Building for Production
```bash
npm run build
```
The compiled, minified bundle will be output to the `dist/` directory.

---

## 🌐 Deploying to Vercel

1. Push your repository to **GitHub**.
2. In [Vercel Dashboard](https://vercel.com), select **Add New > Project** and import **Pulok-Akibuzzaman/Vistora**.
3. Vercel automatically detects the Vite framework settings from `vercel.json`:
   - **Framework:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PUKU_API_KEY`
5. Click **Deploy**.

---

## 👨‍💻 Course Information & Authors

- **Course:** CSE412 — Software Engineering / Systems Project
- **Institution:** East West University (EWU), Dhaka, Bangladesh
- **Team Lead / Maintainer:** Pulok Akibuzzaman ([@Pulok-Akibuzzaman](https://github.com/Pulok-Akibuzzaman))
- **Official Repository:** [https://github.com/Pulok-Akibuzzaman/Vistora](https://github.com/Pulok-Akibuzzaman/Vistora)
