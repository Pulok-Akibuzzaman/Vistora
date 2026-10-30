// js/data/resourcesData.js

export const OFFICIAL_LINKS = {
  CAMBRIDGE_PREP: 'https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/',
  BRITISH_COUNCIL_PRACTICE: 'https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests',
  IDP_PREPARATION: 'https://ielts.idp.com/prepare',
  IELTS_SCORING: 'https://ielts.org/for-organisations/ielts-scoring-in-detail',
  ACADEMIC_WORD_LIST: 'https://www.wgtn.ac.nz/lals/resources/academicwordlist'
};

export const STUDY_RESOURCES = [
  {
    id: 1,
    title: 'IELTS Academic Reading Strategies: Skimming, Scanning & Time Tactics',
    category: 'Reading',
    tag: 'ESSENTIAL',
    rating: 4.9,
    reads: 8420,
    desc: 'The three essential reading techniques used by Band 8+ scorers to finish all 40 questions within 60 minutes.',
    externalUrl: OFFICIAL_LINKS.BRITISH_COUNCIL_PRACTICE,
    tips: [
      'Spend at most 2.5 minutes skimming an entire 900-word passage before answering questions.',
      'Underline concrete anchors (dates, names, capitalised terms) for instant scanning.',
      'Use the 17m - 20m - 23m progressive time allocation across Passages 1, 2, and 3.'
    ]
  },
  {
    id: 2,
    title: 'IELTS Listening: Eliminating Distractor Traps in Sections 3 & 4',
    category: 'Listening',
    tag: 'BAND 8+',
    rating: 4.8,
    reads: 6150,
    desc: 'How test writers place subtle corrections and contradictory statements in complex academic conversations.',
    externalUrl: OFFICIAL_LINKS.CAMBRIDGE_PREP,
    tips: [
      'Watch for pivot words like "However", "Mind you", "Actually", and "On second thought".',
      'Pre-read upcoming prompts during the 30-second silent intervals.',
      'Practise at 1.25x speed so the official examination pace feels relaxed.'
    ]
  },
  {
    id: 3,
    title: 'Academic Writing Task 2: Coherence & Lexical Referencing',
    category: 'Writing',
    tag: 'GUIDE',
    rating: 4.9,
    reads: 9200,
    desc: 'Move from Band 6.0 to 7.5+ in Coherence & Cohesion by mastering anaphoric referencing and cohesive substitutions.',
    externalUrl: OFFICIAL_LINKS.IELTS_SCORING,
    tips: [
      'Use demonstrative pronouns (this, these, such patterns) instead of repeating identical subject nouns.',
      'Organise essays into a crisp 4-paragraph structure (Intro, 2 Body Paragraphs, Conclusion).',
      'Ensure every body paragraph starts with a clear, single-point topic sentence.'
    ]
  },
  {
    id: 4,
    title: 'Speaking Part 2 & 3: Idiomatic Phrasing and Fluency Maintenance',
    category: 'Speaking',
    tag: 'FLUENCY',
    rating: 4.7,
    reads: 5310,
    desc: 'How to structure your 2-minute long turn using the Past-Present-Future framework without stuttering.',
    externalUrl: OFFICIAL_LINKS.IDP_PREPARATION,
    tips: [
      'Use the 1-minute prep time to jot down 4 keywords covering who, when, what happened, and why it mattered.',
      'In Part 3, answer the direct question, give an illustrative real-world example, and consider counterarguments.'
    ]
  }
];
