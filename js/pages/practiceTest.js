// js/pages/practiceTest.js
import { getAudioStreamUrl, isDuplicateTrack } from '../lib/audioCatalog.js';
import { LISTENING_TEST_1_PARTS, LISTENING_ANSWERS_TEST_1, LISTENING_ANSWERS_TEST_2 } from '../data/listeningData.js';
import { READING_TEST_1_PASSAGES, READING_ANSWERS_TEST_1 } from '../data/readingData.js';
import { markAnswers, countCorrect, calculateBandScore, listeningPairs, readingPairs } from '../lib/scoring.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { getCurrentUser } from '../lib/auth.js';

// State
let currentTestId = 'l1';
let currentMode = 'listening'; // 'listening' | 'reading'
let currentBook = '18';
let currentTestNum = 1;
let currentPart = 1;
let userAnswers = {};
let timerSeconds = 2400; // 40 mins
let timerInterval = null;

// Initialize Test
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const testParam = params.get('test') || (params.get('mode') === 'reading' ? 'r1' : 'l1');
  
  if (testParam.startsWith('r')) {
    currentMode = 'reading';
    currentTestId = testParam;
    currentTestNum = parseInt(testParam.replace(/\D/g, ''), 10) || 1;
    timerSeconds = 3600; // 60 mins
  } else {
    currentMode = 'listening';
    currentTestId = testParam;
    currentTestNum = parseInt(testParam.replace(/\D/g, ''), 10) || 1;
    timerSeconds = 2400; // 40 mins
  }

  // Restore saved answers from localStorage
  const savedDraft = localStorage.getItem(`vistora_draft_${currentTestId}`);
  if (savedDraft) {
    try {
      userAnswers = JSON.parse(savedDraft);
    } catch {}
  }

  // Set up header & layout
  document.getElementById('current-test-title').innerText = currentMode === 'listening'
    ? `IELTS ${currentBook} — Academic Listening Test ${currentTestNum}`
    : `IELTS ${currentBook} — Academic Reading Test ${currentTestNum}`;

  document.getElementById('current-test-meta').innerText = currentMode === 'listening'
    ? '40 Questions · 4 Parts · Official Audio Stream'
    : '40 Questions · 3 Passages · 60 Minutes';

  // Toggle audio player visibility
  document.getElementById('audio-player-container').style.display = currentMode === 'listening' ? 'flex' : 'none';

  // Render Navigator Buttons
  renderNavGrid();

  // Load Part
  loadPart(1);

  // Initialize Timer
  startTimer();

  // Attach Audio Error Listeners
  const audioEl = document.getElementById('exam-native-audio');
  if (audioEl) {
    audioEl.addEventListener('error', handleAudioPlaybackError);
  }
});

/**
 * Load specific part (1-4 for listening, 1-3 for reading)
 */
function loadPart(partNum) {
  currentPart = partNum;

  // Update tabs
  const tabs = document.querySelectorAll('#part-nav-tabs button');
  tabs.forEach((tab, idx) => {
    tab.classList.toggle('active', idx + 1 === partNum);
  });

  if (currentMode === 'listening') {
    loadListeningPart(partNum);
  } else {
    loadReadingPart(partNum);
  }

  updateAnsweredCounter();
  updateNavGridStates();
}
window.switchPart = loadPart;

/**
 * Load Listening Part Content and Audio Track
 */
function loadListeningPart(partNum) {
  const audioEl = document.getElementById('exam-native-audio');
  const alertEl = document.getElementById('audio-error-alert');
  const duplicateBadge = document.getElementById('audio-duplicate-indicator');
  const trackLabel = document.getElementById('audio-track-label');

  alertEl.style.display = 'none';
  trackLabel.innerText = `Cambridge ${currentBook} · Test ${currentTestNum} · Part ${partNum}`;

  // Check duplicate flag
  const isDupe = isDuplicateTrack(currentBook, currentTestNum, partNum);
  duplicateBadge.style.display = isDupe ? 'inline' : 'none';

  // Fetch SharePoint URL
  const streamUrl = getAudioStreamUrl(currentBook, currentTestNum, partNum);
  if (streamUrl && audioEl) {
    audioEl.src = streamUrl;
    audioEl.load();
  }

  // Render questions
  const contextPane = document.getElementById('context-content');
  const questionsPane = document.getElementById('questions-content');

  const partData = LISTENING_TEST_1_PARTS[partNum - 1];
  if (!partData) {
    questionsPane.innerHTML = `<p style="color: var(--text-muted);">Section under construction.</p>`;
    return;
  }

  contextPane.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <span class="badge badge-primary">Part ${partNum}</span>
      <h2 style="margin-top: 0.5rem;">${partData.title}</h2>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 0.4rem;">${partData.instruction}</p>
    </div>
    <div class="alert alert-info">
      💡 <strong>Exam Tip:</strong> Listen carefully as the audio plays once only. Write notes directly in the fields as you listen.
    </div>
  `;

  let qHtml = '';

  if (partData.prompts) {
    partData.prompts.forEach(p => {
      const val = userAnswers[p.id] || '';
      qHtml += `
        <div class="question-item" id="q-block-${p.id}">
          <div class="question-qnum">Question ${p.id}</div>
          <div class="question-prompt">
            ${p.prefix} 
            <input type="text" 
                   class="form-control" 
                   style="display: inline-block; width: 180px; padding: 0.35rem 0.6rem; margin: 0 0.3rem;"
                   placeholder="Your answer..."
                   value="${val}" 
                   oninput="recordAnswer(${p.id}, this.value)"> 
            ${p.suffix}
          </div>
        </div>
      `;
    });
  }

  if (partData.questions) {
    partData.questions.forEach(q => {
      const selected = userAnswers[q.id] || '';
      qHtml += `
        <div class="question-item" id="q-block-${q.id}">
          <div class="question-qnum">Question ${q.id}</div>
          <div class="question-prompt">${q.text}</div>
          <div class="question-options">
            ${(q.options || []).map(opt => {
              const letter = opt.charAt(0);
              const isChecked = selected.toUpperCase() === letter ? 'checked' : '';
              return `
                <label class="option-label ${isChecked ? 'selected' : ''}">
                  <input type="radio" 
                         name="q_${q.id}" 
                         value="${letter}" 
                         ${isChecked}
                         onchange="recordAnswer(${q.id}, '${letter}')">
                  <span>${opt}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });
  }

  questionsPane.innerHTML = qHtml;
}

/**
 * Load Reading Part Passages & Questions
 */
function loadReadingPart(partNum) {
  const contextPane = document.getElementById('context-content');
  const questionsPane = document.getElementById('questions-content');

  const passage = READING_TEST_1_PASSAGES[partNum - 1];
  if (!passage) {
    questionsPane.innerHTML = `<p style="color: var(--text-muted);">Passage not found.</p>`;
    return;
  }

  contextPane.innerHTML = `
    <span class="badge badge-indigo">Reading Passage ${partNum}</span>
    <h2 style="margin: 0.5rem 0 0.25rem;">${passage.title}</h2>
    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">${passage.subtitle || ''}</p>
    <div class="passage-text">
      ${passage.paragraphs.map(p => `<p>${p}</p>`).join('')}
    </div>
  `;

  let qHtml = '';
  passage.questions.forEach(q => {
    const val = userAnswers[q.id] || '';
    if (q.type === 'choice') {
      qHtml += `
        <div class="question-item" id="q-block-${q.id}">
          <div class="question-qnum">Question ${q.id}</div>
          <div class="question-prompt">${q.prompt}</div>
          <div class="question-options">
            ${(q.options || []).map(opt => {
              const isChecked = val === opt ? 'checked' : '';
              return `
                <label class="option-label ${isChecked ? 'selected' : ''}">
                  <input type="radio" 
                         name="q_${q.id}" 
                         value="${opt}" 
                         ${isChecked}
                         onchange="recordAnswer(${q.id}, '${opt}')">
                  <span>${opt}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else {
      qHtml += `
        <div class="question-item" id="q-block-${q.id}">
          <div class="question-qnum">Question ${q.id}</div>
          <div class="question-prompt">${q.prompt}</div>
          ${q.instruction ? `<p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.4rem;">${q.instruction}</p>` : ''}
          <input type="text" 
                 class="form-control" 
                 placeholder="Type answer..." 
                 value="${val}"
                 oninput="recordAnswer(${q.id}, this.value)">
        </div>
      `;
    }
  });

  questionsPane.innerHTML = qHtml;
}

/**
 * Handle answers input and auto-saving
 */
window.recordAnswer = function(qId, val) {
  userAnswers[qId] = val.trim();
  localStorage.setItem(`vistora_draft_${currentTestId}`, JSON.stringify(userAnswers));
  updateAnsweredCounter();
  updateNavGridStates();
};

/**
 * Audio Speed controller
 */
window.setPlaybackSpeed = function(speed) {
  const audio = document.getElementById('exam-native-audio');
  if (audio) {
    audio.playbackRate = speed;
  }
};

/**
 * SharePoint Streaming Failure Handler
 */
function handleAudioPlaybackError(e) {
  console.warn('[Vistora Audio] SharePoint streaming restricted or failed:', e);
  const alertEl = document.getElementById('audio-error-alert');
  const badge = document.getElementById('audio-source-badge');
  if (alertEl) alertEl.style.display = 'flex';
  if (badge) {
    badge.innerText = 'Institutional Restricted (Local Ready)';
    badge.style.background = 'rgba(239, 68, 68, 0.2)';
    badge.style.color = '#f87171';
  }
}

/**
 * Local MP3 Fallback file upload
 */
window.handleLocalAudioFile = function(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const audio = document.getElementById('exam-native-audio');
  const url = URL.createObjectURL(file);
  audio.src = url;
  audio.play();

  const alertEl = document.getElementById('audio-error-alert');
  const badge = document.getElementById('audio-source-badge');
  if (alertEl) alertEl.style.display = 'none';
  if (badge) {
    badge.innerText = 'Local MP3 Loaded';
    badge.style.background = 'rgba(16, 185, 129, 0.2)';
    badge.style.color = '#34d399';
  }
};

/**
 * Question Grid Navigator
 */
function renderNavGrid() {
  const grid = document.getElementById('q-nav-grid');
  let html = '';
  for (let i = 1; i <= 40; i++) {
    html += `<button type="button" class="q-nav-btn" id="q-nav-${i}" onclick="jumpToQuestion(${i})">${i}</button>`;
  }
  grid.innerHTML = html;
}

function updateNavGridStates() {
  for (let i = 1; i <= 40; i++) {
    const btn = document.getElementById(`q-nav-${i}`);
    if (btn) {
      btn.classList.toggle('answered', Boolean(userAnswers[i]));
    }
  }
}

function updateAnsweredCounter() {
  const answeredCount = Object.keys(userAnswers).filter(k => Boolean(userAnswers[k])).length;
  const counter = document.getElementById('answered-counter');
  if (counter) counter.innerText = `${answeredCount} / 40`;
}

window.jumpToQuestion = function(qId) {
  // Determine part for question
  let targetPart = 1;
  if (currentMode === 'listening') {
    if (qId >= 31) targetPart = 4;
    else if (qId >= 21) targetPart = 3;
    else if (qId >= 11) targetPart = 2;
  } else {
    if (qId >= 27) targetPart = 3;
    else if (qId >= 14) targetPart = 2;
  }

  if (targetPart !== currentPart) {
    loadPart(targetPart);
  }

  setTimeout(() => {
    const el = document.getElementById(`q-block-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.borderColor = 'var(--accent)';
      setTimeout(() => el.style.borderColor = '', 1500);
    }
  }, 100);
};

/**
 * Countdown Timer
 */
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerSeconds--;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      alert('Time is up! Submitting your test automatically.');
      submitExamAttempt();
      return;
    }

    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    const text = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const el = document.getElementById('timer-text');
    if (el) el.innerText = text;

    if (timerSeconds < 300) {
      document.getElementById('exam-timer-display')?.classList.add('warning');
    }
  }, 1000);
}

/**
 * Submit Exam Attempt & Evaluate Band Score
 */
window.submitExamAttempt = async function() {
  if (!confirm('Are you sure you want to finish and submit this exam attempt?')) {
    return;
  }

  clearInterval(timerInterval);

  // Score answers locally
  const answerKey = currentMode === 'listening' ? LISTENING_ANSWERS_TEST_1 : READING_ANSWERS_TEST_1;
  const pairs = currentMode === 'listening' ? listeningPairs(currentTestNum) : readingPairs(currentTestNum);

  const marks = markAnswers(answerKey, userAnswers, pairs);
  const rawScore = countCorrect(marks);
  const band = calculateBandScore(rawScore, currentMode === 'listening' ? 'Listening' : 'Reading');

  // Build Result Object
  const user = await getCurrentUser();
  const testTitle = currentMode === 'listening' 
    ? `IELTS ${currentBook} — Listening Test ${currentTestNum}` 
    : `IELTS ${currentBook} — Academic Reading Test ${currentTestNum}`;

  const resultRecord = {
    id: 'res-' + Date.now(),
    user_id: user?.id || null,
    test_title: testTitle,
    test_type: currentMode === 'listening' ? 'Listening' : 'Reading',
    overall_band: band,
    skill_bands: { [currentMode === 'listening' ? 'Listening' : 'Reading']: band },
    correct_answers: rawScore,
    total_questions: 40,
    user_answers: userAnswers,
    completed_at: new Date().toISOString()
  };

  // 1. Save to Supabase (if configured and authenticated)
  if (isSupabaseConfigured() && supabase && user?.id) {
    try {
      const { error } = await supabase.from('exam_results').insert([
        {
          user_id: user.id,
          test_title: testTitle,
          test_type: resultRecord.test_type,
          overall_band: band,
          skill_bands: resultRecord.skill_bands,
          correct_answers: rawScore,
          total_questions: 40,
          user_answers: userAnswers
        }
      ]);
      if (error) console.warn('[Supabase Exam Save Error]:', error);
    } catch (err) {
      console.warn('[Supabase Connection Error]:', err);
    }
  }

  // 2. Save locally for instant offline review
  try {
    const existing = JSON.parse(localStorage.getItem('vistora_exam_results') || '[]');
    localStorage.setItem('vistora_exam_results', JSON.stringify([resultRecord, ...existing]));
    localStorage.removeItem(`vistora_draft_${currentTestId}`);
  } catch {}

  // 3. Show scorecard modal
  document.getElementById('modal-band-score').innerText = band.toFixed(1);
  document.getElementById('modal-raw-score').innerText = `${rawScore} / 40`;
  const modal = document.getElementById('result-modal');
  if (modal) modal.style.display = 'flex';
};
