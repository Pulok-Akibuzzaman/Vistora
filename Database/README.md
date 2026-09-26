# 📂 Database Directory — Audio Files & PDF Past Papers

For copyright compliance, official Cambridge IELTS audio recordings and examination PDFs are not included in public git commits.

## Expected Directory Structure:

Place your official audio files and PDFs here as follows:

```
Database/
├── IELTS 18.pdf
├── IELTS 19.pdf
├── IELTS 20.pdf
├── IELTS 21.pdf
├── IELTS 18 AUDIO/
│   ├── IELTS18_test1_audio1.mp3   (Part 1)
│   ├── IELTS18_test1_audio2.mp3   (Part 2)
│   ├── IELTS18_test1_audio3.mp3   (Part 3)
│   ├── IELTS18_test1_audio4.mp3   (Part 4)
│   └── ... (Tests 2, 3, 4)
├── IELTS 19 AUDIO/
│   └── Cambridge-IELTS-19-Academic-General-Listening-Audios[@ieltsxpresscom]/
│       ├── Cambridge-IELTS-19-Test-1-Part-1-ieltsxpress.mp3
│       └── ...
├── IELTS 20 AUDIO/
│   ├── T1S1.mp3 to T4S4.mp3
└── IELTS 21 AUDIO/
    ├── C21T1P1.1.mp3 ...
```

When you start the backend server (`npm run dev` or `node start-dev.js`), it will automatically scan this folder and index all audio tracks into the listening exam.
