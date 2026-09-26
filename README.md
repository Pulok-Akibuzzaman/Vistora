# 🎓 CSE412 Project — IELTS Listening & Preparation Platform (Vistora)

[![GitHub Repository](https://img.shields.io/badge/GitHub-Pulok--Akibuzzaman%2FVistora-181717?style=flat&logo=github)](https://github.com/Pulok-Akibuzzaman/Vistora)
[![Project](https://img.shields.io/badge/Project-Vistora-dc2626)](https://github.com/Pulok-Akibuzzaman/Vistora)

> **Official Repository:** [https://github.com/Pulok-Akibuzzaman/Vistora](https://github.com/Pulok-Akibuzzaman/Vistora)

A full-stack computer-delivered IELTS preparation system built for **CSE412**. It connects a modern React/Vite front-end with an Express.js backend that directly indexes and streams listening test audio files from the local `Database/` repository using high-performance **HTTP 206 Partial Content Range streaming**, and features dynamic NLP & Puku AI writing evaluation, official test booking feeds, and academic document generation.

---

## 💻 Languages & Tech Stack Used

This project is built with the following core programming languages, frameworks, and tools:

### Primary Languages
- **TypeScript (`.ts`, `.tsx`)**: Primary language for the entire frontend application, providing compile-time type safety, structured models for IELTS questions, answer validation, and audio streaming state.
- **JavaScript (ESM / Node.js)**: Powers the backend audio streaming server (`server.js`), API endpoints, and the multi-process local orchestrator (`start-dev.js`).
- **HTML5**: Semantic markup structuring the test taker interface, audio controllers, form fields, and native media playback.
- **CSS3 / Tailwind CSS (v4)**: Modern responsive design system, custom typography (IBM Plex Sans, Outfit, Inter), dark theme accents, and micro-animations.
- **JSON**: Configuration schemas (`tsconfig.json`, `package.json`), mock test answer keys, and REST API data interchange format.
- **PowerShell / Windows Batch Scripting**: Automation scripts (`start-local.bat`, `start-local.ps1`) for launching frontend and backend concurrently with a single command.

### Detailed Technology Matrix

| Layer | Language / Technology | Version | Purpose in this Project |
| :--- | :--- | :--- | :--- |
| **Frontend** | **TypeScript** | `^5.7.0` | Type-safe UI components, interfaces, test attempt state management |
| **UI Library** | **React** (TSX) | `^19.0.0` | Reactive views, audio state hooks (`useRef`, `useState`, `useEffect`) |
| **Routing** | **React Router** | `^8.4.0` | Client-side routing, protected routes (`RequireAuth`), navigation |
| **Styling** | **Tailwind CSS v4** | `^4.0.0` | Responsive layouts, exam room color tokens, player styling |
| **Bundler & Dev Server**| **Vite** | `^8.3.1` | Ultra-fast HMR dev server and built-in `/api` proxy to backend |
| **Backend Runtime** | **Node.js** | `v18+` (tested on `v22`) | Server runtime, native `node:fs` read streams, `node:child_process` |
| **Backend Framework** | **Express.js** | `^4.21.2` | REST API routes, auto-discovery of Database files, HTTP 206 streaming |
| **CORS Middleware** | **cors** | `^2.8.5` | Cross-Origin resource sharing headers for web clients |
| **Media / Storage** | **Native File System** | Local `Database/` | High-performance chunked range streaming of 73 MP3 audio files |

---

## 📋 System Requirements & Prerequisites

Before setting up and running the project, make sure your machine meets the following requirements:

| Component | Minimum Version | Recommended Version | Verification Command |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v18.0.0+` | `v20.x` or `v22.x` | `node -v` |
| **npm** | `v9.0.0+` | `v10.x+` | `npm -v` |
| **Git** | `v2.x+` | Latest | `git --version` |
| **Operating System** | Windows 10/11, macOS, or Linux | Windows 10/11 | — |
| **Web Browser** | Any modern browser | Google Chrome, Edge, Brave, Firefox | — |
| **Audio Hardware** | Headphones / Speakers | Working audio output device | — |

> [!NOTE]
> No external database installation (e.g. MySQL or MongoDB) is needed. Audio files and Cambridge PDF test books are stored and indexed directly from the local `Database/` directory.

---

## ⚙️ Step-by-Step Installation & Setup

Follow these steps when cloning the project from GitHub for the first time:

### Step 1: Clone the Repository
Open your terminal (PowerShell, Command Prompt, or Bash) and clone the repository:
```bash
git clone https://github.com/Pulok-Akibuzzaman/Vistora.git
cd Vistora
```

### Step 2: Install Dependencies
The project consists of two packages: the **Backend server** and the **Frontend UI**. You can install dependencies for both at once:

#### Option A: One-Command Setup (Recommended)
From the project root directory, run:
```bash
npm run setup
```
*(This automatically runs `npm install` inside both `backend/` and `Frontend UI/`)*

#### Option B: Manual Installation (Folder by Folder)
Alternatively, install dependencies inside each folder manually:
```bash
# 1. Install backend dependencies (express, cors)
cd backend
npm install
cd ..

# 2. Install frontend dependencies (react, vite, tailwindcss, react-router)
cd "Frontend UI"
npm install
cd ..
```

### Step 3: Audio Files & Database Setup (For New Clones)
To prevent copyright violations and keep this public repository fully compliant with GitHub terms:
- All large Cambridge IELTS examination PDFs and MP3 audio packs are excluded from Git via `.gitignore`.
- If you are running this locally on your own machine, ensure your audio tracks are placed inside `Database/` (see [`Database/README.md`](Database/README.md) for expected directory structure).
- If evaluating without Cambridge audio files, you can still test the exam interface using the **"📁 Override File"** button in the exam player or instructions screen to select any local MP3 file on your computer.

---

## 🚀 Running the Project Locally

You can launch both the **Backend Server** (Port `5001`) and the **Frontend Web App** (Port `8443` or `5173`) simultaneously using any of the following methods:

### Method 1: Double-Click Launcher (Windows)
Double-click the **`start-local.bat`** file in the project root directory. A command window will open and launch both servers with synchronized output logs.

### Method 2: PowerShell Script
Run the PowerShell script from the project root:
```powershell
./start-local.ps1
```

### Method 3: Standard npm Command (Cross-Platform)
Run:
```bash
npm run dev
```
or
```bash
npm start
```

### Method 4: Running Frontend and Backend in Separate Terminals
If you prefer managing processes in separate terminal windows:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd "Frontend UI"
npm run dev
```

---

## 🌐 Accessing the Application

Once launched:
1. Open your web browser and navigate to:
   ```
   http://localhost:8443
   ```
   *(If port `8443` is occupied, Vite will automatically select the next available port, e.g. `http://localhost:5173`)*
2. Sign in using any test credentials (mock authentication enabled):
   - **Email:** `student@ewu.edu` (or any valid email format)
   - **Password:** `password123` (minimum 6 characters)
3. Navigate to **Practice Tests** from the top navigation bar.
4. Click **Take test** on **IELTS 18 — Listening Test 1 (Full 4 Parts)**.

---

## 🎧 How the Listening Exam Works

1. **Pre-Test Device Check**:
   - On the Instructions screen, the system confirms `Local Backend Audio Connected` with live track count.
   - Click **`▶ Play 5s Sound Check`** to test your headphones/speakers before entering timed exam conditions.
2. **Automatic Audio Streaming**:
   - Clicking **Start timed test** begins the 40-minute countdown.
   - The audio player connects to the backend and automatically streams the matching **Cambridge IELTS 18 Test 1** audio.
3. **Part-by-Part Audio Switching**:
   - **Part 1 (Q1–10):** Streams `IELTS18_test1_audio1.mp3` (Oyster Bay Sailing Club Courses)
   - **Part 2 (Q11–20):** Streams `IELTS18_test1_audio2.mp3` (Working as a Makeup Trainee)
   - **Part 3 (Q21–30):** Streams `IELTS18_test1_audio3.mp3` (Ocean Biodiversity & Research)
   - **Part 4 (Q31–40):** Streams `IELTS18_test1_audio4.mp3` (Sources of Rubber)
   - Use the **`[ Part 1 ]`**, **`[ Part 2 ]`**, **`[ Part 3 ]`**, **`[ Part 4 ]`** buttons to jump directly to questions and audio for any part.
4. **Interactive Controls**:
   - `Play / Pause` toggle with real-time animated wave indicator
   - `⏪ 5s` and `5s ⏩` buttons for quick scrub/review
   - Full timeline scrubber with current time and duration
   - Volume slider with mute button
   - Playback speed switcher (`0.75x`, `1.0x`, `1.25x`, `1.5x`)
   - `📁 Override File`: Optional button to upload a custom MP3 file if needed

---

## 🏗️ Architecture & Connection Flow

```
+-------------------------------------------------------------------------+
|                              FRONTEND (React 19 + Vite)                |
|  - PracticeTest.tsx: Auto-detects local backend on port 5001 / proxy   |
|  - ListeningExam: Part 1–4 tabs, Play/Pause, 5s seek, speed & scrubber |
|  - Pre-Test Screen: Device sound check (5s preview), Edition switcher  |
|  - Resource Library: Official PDF Past Papers & Audio packs viewer     |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTP Requests (proxied via Vite `/api`)
                                     v
+-------------------------------------------------------------------------+
|                              BACKEND (Node.js + Express)                |
|  - server.js: HTTP 206 Range-Request streaming for smooth seeking      |
|  - Auto-Discovery: Scans `Database/` folder on startup                  |
|  - Dynamic Catalog: Indexes IELTS 18, 19, 20, 21 books and test parts   |
+------------------------------------+------------------------------------+
                                     |
                                     | File System Streaming (fs.createReadStream)
                                     v
+-------------------------------------------------------------------------+
|                              DATABASE (Local Audio & Books)            |
|  - IELTS 18 AUDIO: Tests 1–4 (Audios 1–4 each, Oyster Bay, etc.)        |
|  - IELTS 19 AUDIO: Tests 1–4 (Cambridge parts 1–4)                      |
|  - IELTS 20 AUDIO: Tests 1–4 (T1S1 to T4S4)                             |
|  - IELTS 21 AUDIO: Tests 1–4 (C21 subpart audios)                       |
|  - PDF Past Papers: IELTS 18.pdf, 19.pdf, 20.pdf, 21.pdf                |
+-------------------------------------------------------------------------+
```

---

## 📂 Project Directory Structure

```
f:\EWU\CSE412\Project\
├── backend/                  # Node.js + Express Audio Server
│   ├── package.json          # Express, CORS dependencies
│   └── server.js             # HTTP 206 Range streaming & catalog API
├── Database/                 # Audio files repository & Cambridge PDFs
│   ├── IELTS 18 AUDIO/       # Tests 1-4 audio files (MP3)
│   ├── IELTS 18.pdf          # Official Cambridge IELTS 18 Book
│   ├── IELTS 19 AUDIO/       # Tests 1-4 audio files (MP3)
│   ├── IELTS 19.pdf          # Official Cambridge IELTS 19 Book
│   ├── IELTS 20 AUDIO/       # Tests 1-4 audio files (MP3)
│   ├── IELTS 20.pdf          # Official Cambridge IELTS 20 Book
│   ├── IELTS 21 AUDIO/       # Tests 1-4 audio files (MP3)
│   └── IELTS 21.pdf          # Official Cambridge IELTS 21 Book
├── Frontend UI/              # React 19 + TypeScript + Vite Application
│   ├── src/
│   │   ├── components/       # Layout, RequireAuth, FullTestResult
│   │   ├── data/             # IELTS listening & reading mock answer keys
│   │   ├── lib/              # api.ts (backend client), results.ts
│   │   └── pages/            # PracticeTest.tsx, ResourceLibrary.tsx, etc.
│   ├── package.json          # Frontend dependencies & Vite scripts
│   └── vite.config.ts        # Vite config with /api proxy to port 5001
├── .gitignore                # Git ignore rules (node_modules, builds, logs)
├── package.json              # Root orchestrator package.json
├── README.md                 # Complete project documentation
├── start-dev.js              # Multi-process local orchestrator
├── start-local.bat           # Windows double-click launcher
└── start-local.ps1           # PowerShell launcher
```

---

## 📡 Backend API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/health` | `GET` | Health status, uptime, and database file count |
| `GET /api/audio/catalog` | `GET` | Complete JSON catalog of all 73 indexed audio tracks |
| `GET /api/audio/stream/:book/:test/:part` | `GET` | Streams specific test audio with **HTTP 206 Range** support |
| `GET /api/audio/file?path=...` | `GET` | Streams any audio file by relative path from `Database/` |
| `GET /api/resources` | `GET` | Lists available Cambridge IELTS PDF books |
| `GET /api/resources/pdf/:filename` | `GET` | Streams / downloads official PDF book |

---

## ❓ Troubleshooting & FAQs

### 1. Port 5001 or 8443 is already in use
- **Backend Port:** You can change the backend port by setting the `PORT` environment variable before running:
  ```bash
  PORT=5002 node server.js
  ```
- **Frontend Port:** Vite automatically falls back to port `5173` or `3000` if `8443` is taken.

### 2. Audio does not play automatically
- Modern browsers (Chrome, Edge, Safari) restrict media from autoplaying with sound until the user interacts with the page.
- Simply click anywhere on the page or press the **Play (▶)** button on the audio bar to begin playback.

### 3. "Audio not connected" warning on instructions page
- Verify that the backend server is running on `http://localhost:5001`. You can test this in your browser by opening `http://localhost:5001/api/health`.
- If the backend is running, the green indicator `Local Backend Audio Connected` will appear automatically.

### 4. Git Large Files Warning
- The `Database/` folder contains ~500 MB of audio files and PDFs. If uploading to GitHub with file size limits:
  - Keep audio files intact, or use **Git LFS** (`git lfs install` followed by `git lfs track "*.pdf" "*.mp3"`) if individual files exceed 100 MB.
  - All single MP3 tracks in this project are between 3 MB and 13 MB, well within GitHub's 100 MB per-file limit.

---

## 👨‍💻 Course Information & Project Repository
- **Official Repository:** [https://github.com/Pulok-Akibuzzaman/Vistora](https://github.com/Pulok-Akibuzzaman/Vistora)
- **Course:** CSE412 — Software Engineering / Systems Project
- **Institution:** East West University (EWU)
