# 🎓 Vistora — Computer-Delivered IELTS Preparation & AI Platform

[![Live Platform](https://img.shields.io/badge/Live%20Demo-vistora--delta.vercel.app-2563eb?style=flat&logo=vercel)](https://vistora-delta.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Pulok--Akibuzzaman%2FVistora-181717?style=flat&logo=github)](https://github.com/Pulok-Akibuzzaman/Vistora)
[![Course](https://img.shields.io/badge/Course-CSE412-dc2626)](https://github.com/Pulok-Akibuzzaman/Vistora)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61dafb?logo=react)](https://react.dev)
[![Bundler](https://img.shields.io/badge/Bundler-Vite%208-646cff?logo=vite)](https://vitejs.dev)
[![Backend](https://img.shields.io/badge/Backend-Supabase%20Cloud-3ecf8e?logo=supabase)](https://supabase.com)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

> **Live Platform:** [https://vistora-delta.vercel.app](https://vistora-delta.vercel.app)  
> **Official Repository:** [https://github.com/Pulok-Akibuzzaman/Vistora](https://github.com/Pulok-Akibuzzaman/Vistora)  
> **Academic Institution:** East West University (EWU), Dhaka, Bangladesh  
> **Department:** Department of Computer Science & Engineering (CSE)  
> **Course:** CSE412 — Software Engineering / Systems Project  

---

## 📖 Project Overview

Preparing for the official computer-delivered IELTS exam can be stressful and expensive. Many test centers charge high fees for a single mock test, while conventional paper-based preparation fails to prepare candidates for the actual computer-delivered interface.

**Vistora** is a comprehensive, web-based preparation platform designed to reproduce the authentic look, feel, and functionality of the official British Council and IDP computer-delivered IELTS exam environment.

### Core Capabilities:
1. **Full-Length Exam Simulation**: Authentic test room covering **Reading, Listening, Writing, and Speaking** with split-screen views, synchronized timers, and 40-question navigation palettes.
2. **Deterministic Auto-Grading**: Instant Band 0–9.0 computation with passage citations and question-by-question diagnostic review.
3. **AI Writing & Speaking Evaluation**: Immediate rubric-aligned assessment across Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.
4. **Admissions Document Generator**: Automated drafting of tailored CVs, Statements of Purpose (SOP), Personal Statements, and Cover Letters with a print-ready PDF engine.
5. **Community Knowledge Base**: Real-time peer discussion forum with upvoting, automated thread pinning, and administrative moderation.
6. **Student Progress Analytics**: Visual band score trajectories, daily study streaks, and scheduled milestones synced across devices.
7. **Exam Schedule Tracking**: Searchable and filterable official British Council test dates across Dhaka, Chattogram, and Sylhet.

---

## 🌟 Key Feature Modules

### 🎧 1. Authentic Computer-Delivered Test Simulator
- **Dual-Panel Responsive Interface**: Passage/audio player on the left panel; interactive questions on the right with independent scrolling.
- **40-Question Palette**: Jump directly to any question, toggle yellow review flags, and view real-time answered/unanswered badges.
- **Multi-Skill Coverage**: Supports complete Reading, Listening, Academic Writing (Task 1 & Task 2), and Speaking interview modules.
- **Cambridge IELTS Integration**: Authentic practice datasets from **Cambridge IELTS 18–21** with audio speed controls (1.0x, 1.25x, 1.5x).
- **Instant Diagnostic Scoring**: Automatic evaluation matching official IELTS conversion tables with cited answer justifications.

### ✍️ 2. AI Writing & Speaking Assessment
- **Writing Assessment**: Evaluates Academic Task 1 (graphs/charts/diagrams) and Task 2 (discursive essays) against all 4 IELTS band descriptors.
- **Speaking Interview Simulator**: Structured practice for Part 1 (Introduction), Part 2 (Long Turn Cue Card), and Part 3 (Two-Way Discussion) with prep and speaking countdowns.
- **Actionable Feedback**: Pinpoints grammar errors, highlights cohesive weaknesses, and suggests advanced lexical substitutions.

### 📄 3. Academic Document Generator
- Generates professional admissions documents (CV, SOP, Personal Statement, Cover Letter) tailored to university and visa requirements.
- **Isolated Print/PDF Engine**: Generates clean, border-to-border printable outputs with zero application UI chrome.
- **On-Demand Generation**: Full candidate control over input parameters, preview rendering, and cloud drafting.

### 📊 4. Student Analytics & Dashboard
- **Score Trajectory Visualizer**: Tracks historical mock attempts and identifies weak skill areas over time.
- **Daily Study Streak & Task Planner**: Cloud-synced goal manager to track preparation milestones.

### 💬 5. Real-Time Community Forum
- Interactive discussion boards for exam tips, university admissions queries, and score reviews.
- **Automated Quality Pinning**: Posts meeting community upvote thresholds are automatically pinned for top visibility.
- **Role-Based Moderation**: Admin announcements, moderation controls, and author deletion rights.

### 📚 6. Resource Library & Exam Calendar
- Direct access to verified IELTS study materials, vocabulary guides, and Cambridge archives.
- Filterable British Council test schedules by city, exam type (Computer vs Paper), and registration deadlines.

---

## 🛠️ Technology Stack

| Layer | Technology | Engineering Role |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 | Component-driven architecture enabling reactive split-screen test navigation and instant DOM updates without full-page reloads. |
| **Language** | TypeScript 5.7 | Static typing and compile-time verification across test schemas, conversion matrices, and data models. |
| **Build & Tooling** | Vite 8 | Fast Hot Module Replacement (HMR) and optimized ES-module bundling for rapid load times. |
| **Database & Auth** | Supabase (PostgreSQL) | Managed cloud database with Row-Level Security (RLS), real-time synchronization, and persistent authentication. |
| **Styling & UI** | Tailwind CSS v4 | Utility-first design tokens recreating the authentic British Council dark and light exam room palettes. |
| **AI Assessment** | Puku.sh AI Engine | Evaluates essays and interview responses against official IELTS assessment criteria. |
| **Deployment** | Vercel Edge Network | Global edge network with automated CI/CD deployment from the main repository branch. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pulok-Akibuzzaman/Vistora.git
   cd Vistora
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000` (or the port indicated in your terminal).

### Production Build
To generate an optimized production bundle:
```bash
npm run build
npm run preview
```

---

## 🏗️ Architecture & Directory Overview

```text
Vistora/
├── api/                          # Serverless cloud edge endpoints (exam schedules, forum sync)
├── public/                       # Static public assets and application icons
├── src/
│   ├── components/               # Modular UI components (Layout, Auth Guard, Diagnostic Modal)
│   ├── data/                     # Authentic Cambridge test datasets, passages, and answer keys
│   ├── lib/                      # Core logic (Scoring engine, Supabase client, AI integration, Auth)
│   ├── pages/                    # Platform views (Practice Test, Forum, Dashboard, Doc Generator, etc.)
│   ├── App.tsx                   # Root React router and global application state
│   ├── index.css                 # Global theme variables, typography, and print rules
│   └── main.tsx                  # Application bootstrap entry point
├── supabase/                     # PostgreSQL database schema, triggers, and RLS policies
├── package.json                  # Project dependencies and operational scripts
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite build and development configuration
```

---

## 👥 Course Information & Team Members

This project was developed for **CSE412 (Software Engineering / Systems Project)** at **East West University (EWU)**, Dhaka, Bangladesh.

### Team Members
- **[Afra Sultana](https://github.com/afrasultana-12)**
- **[Ahmed Mannan](https://github.com/ahmed-mannan)**
- **[Nusrat Rahman Aurna](https://github.com/Nusrat60-057)**
- **[Pulok Akibuzzaman](https://github.com/Pulok-Akibuzzaman)**
- **[Ibna Jiam](https://github.com/roxZach)**

---

<p align="center">
  <b>Vistora</b> · Built for ambitious IELTS candidates worldwide.
</p>
