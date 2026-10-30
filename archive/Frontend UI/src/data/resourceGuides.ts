export interface ResourceItem {
  id: number
  title: string
  category: string
  type: string
  difficulty: string
  pages: number
  rating: number
  reads: number
  tag: string
  desc: string
  url?: string
  externalUrl: string
  sourceOrg: string
  sections?: { heading: string; body: string }[]
  keyTakeaways?: string[]
}

export const OFFICIAL_EXTERNAL_LINKS = {
  CAMBRIDGE_PREP: 'https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/',
  CAMBRIDGE_HOME: 'https://www.cambridgeenglish.org/exams-and-tests/ielts/',
  IELTS_OFFICIAL_PREP: 'https://ielts.org/take-a-test/preparation-resources',
  IELTS_SCORING_DESCRIPTORS: 'https://ielts.org/for-organisations/ielts-scoring-in-detail',
  BRITISH_COUNCIL_PRACTICE: 'https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests',
  IDP_PREPARATION: 'https://ielts.idp.com/prepare',
  VICTORIA_AWL: 'https://www.wgtn.ac.nz/lals/resources/academicwordlist',
}

export const STATIC_RESOURCES: ResourceItem[] = [
  {
    id: 1,
    title: 'IELTS Academic Reading Strategies: Skimming, Scanning & Detailed Reading',
    category: 'Reading',
    type: 'Guide',
    difficulty: 'All Levels',
    pages: 24,
    rating: 4.9,
    reads: 8420,
    tag: 'ESSENTIAL',
    desc: 'A comprehensive breakdown of the three core reading strategies used by Band 8+ candidates to complete all 40 questions within 60 minutes.',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.BRITISH_COUNCIL_PRACTICE,
    sourceOrg: 'British Council Take IELTS Preparation',
    keyTakeaways: [
      'Spend no more than 2.5 minutes skimming an entire 900-word passage before touching questions.',
      'Underline concrete anchors (dates, names, capitalised nouns, statistical units) for instant scanning.',
      'Detailed reading is only applied to the 2–3 sentences surrounding a verified locator keyword.',
      'Adopt the 17m - 20m - 23m progressive time allocation across Passages 1, 2, and 3.'
    ],
    sections: [
      {
        heading: 'Phase 1: Systematic Skimming (Reading for Global Structure)',
        body: 'Skimming is rapid surveying designed to build a mental map of paragraph hierarchy. Read the headline, introductory paragraph in full, and then solely the first sentence (topic sentence) and concluding clause of each intervening body paragraph. Do not pause over unfamiliar specialist vocabulary; register only what each paragraph sets out to argue.'
      },
      {
        heading: 'Phase 2: Target Scanning (Keyword Locators)',
        body: 'Scanning is non-linear visual targeting. When encountering question stems, categorize keywords into Unchangeable Anchors (dates like 1908, proper names like Gwendoline Davies, scientific taxonomies) and Changeable Concept Keywords (verbs and descriptive adjectives that test writers will paraphrase). Sweep your gaze diagonally across lines until the anchor is sighted.'
      },
      {
        heading: 'Phase 3: Intensive Reading (Unravelling Question Traps)',
        body: 'Once the keyword zone is locked, transition to micro-level intensive reading. Pay strict attention to qualifiers (e.g. rarely, predominantly, unequivocally), negative polarity items, and causal connectors. For True/False/Not Given questions, verify that the author makes the precise assertion rather than merely touching upon the topic.'
      }
    ]
  },
  {
    id: 2,
    title: 'Task 2 Essay Templates: 8 Rhetorical Structures for Discursive Writing',
    category: 'Writing',
    type: 'Template',
    difficulty: 'Band 6–8',
    pages: 18,
    rating: 4.8,
    reads: 12300,
    tag: 'POPULAR',
    desc: 'Proven essay frameworks for Opinion, Discussion, Problem-Solution, and Two-Part question types aligned with official IELTS Band Descriptors.',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.IELTS_SCORING_DESCRIPTORS,
    sourceOrg: 'IELTS.org Official Scoring Criteria',
    keyTakeaways: [
      'Write a 4-paragraph structure: Introduction (paraphrase + thesis), Body 1, Body 2, Conclusion.',
      'Every body paragraph must have: Topic Sentence → Explanation → Concrete Evidence / Example → Concluding Implication.',
      'Avoid overused transitions like "Moreover" or "In a nutshell"; use contextual cohesive devices.',
      'Always state a clear position in the introduction and sustain it through to the conclusion.'
    ],
    sections: [
      {
        heading: 'Format 1: Discuss Both Views and Give Opinion',
        body: 'Paragraph 1: Paraphrase the debate + "While proponents of [View A] argue that [premise], I align with the view that [View B] offers greater long-term sustainability."\nParagraph 2: Explore View A objectively using modal hedges ("It is often posited that..."). Provide a real-world example.\nParagraph 3: Articulate View B with affirmative analytical reasoning ("Conversely, compelling evidence suggests..."). Explain why this view outweighs View A.\nParagraph 4: Conclusion synthesizing both facets and reiterating your definitive stance.'
      },
      {
        heading: 'Format 2: Cause and Solution Architecture',
        body: 'Paragraph 1: Background context + "This essay will elucidate the primary drivers behind this trend, notably [Cause 1] and [Cause 2], before proposing viable interventions such as [Solution 1]."\nParagraph 2: Root causes analyzed in depth with systemic factors.\nParagraph 3: Practical, multi-tiered governmental and individual remediation policies.\nParagraph 4: Summary emphasizing urgent implementation.'
      }
    ]
  },
  {
    id: 3,
    title: 'Academic Word List Sub-lists 1–4 with Collocations',
    category: 'Vocabulary',
    type: 'Vocabulary',
    difficulty: 'Band 5+',
    pages: 42,
    rating: 4.7,
    reads: 9870,
    tag: 'FOUNDATIONAL',
    desc: '500 high-frequency academic words curated from Averil Coxhead’s research, complete with academic collocations and Band 9 exam sentences.',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.VICTORIA_AWL,
    sourceOrg: 'Victoria University of Wellington — Official AWL',
    keyTakeaways: [
      'Focus on lexical collocations rather than isolated words (e.g., "empirical evidence", not just "evidence").',
      'Master nominal forms: transform verbs into abstract nouns to increase formal academic density.',
      'AWL Sub-lists 1 and 2 account for approximately 10% of all tokens in IELTS Academic Reading tests.',
      'Deploy flexible synonyms: "substantiate", "exacerbate", "mitigate", "predominantly".'
    ],
    sections: [
      {
        heading: 'Sub-List 1 Highlights & Academic Collocations',
        body: '• Approach: holistic approach, novel approach, systematic methodology.\n• Benefit: yield tangible benefits, mutually beneficial arrangement.\n• Data: empirical data, corroborate with statistical data, qualitative analysis.\n• Factor: decisive factor, compounding socio-economic factors.\n• Policy: enact regulatory policies, stringent government oversight.\n• Significant: statistically significant variation, profound developmental impact.'
      },
      {
        heading: 'Band 9 Model Sentences for Writing Task 2',
        body: '1. "Failure to implement stringent regulatory frameworks will invariably exacerbate existing economic disparities."\n2. "Empirical research conducted across Scandinavian municipalities substantiates the hypothesis that reduced workweeks enhance worker productivity."\n3. "The transition toward renewable energy infrastructures necessitates substantial initial capital investment, yet yields enduring environmental dividends."'
      }
    ]
  },
  {
    id: 4,
    title: 'Listening Section 4 Mastery: Lecture-Based Question Types',
    category: 'Listening',
    type: 'Guide',
    difficulty: 'Band 7+',
    pages: 16,
    rating: 4.6,
    reads: 5640,
    tag: 'ADVANCED',
    desc: 'Strategies for navigating uninterrupted academic monologues, identifying audio signposting cues, and avoiding common spelling traps.',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.BRITISH_COUNCIL_PRACTICE,
    sourceOrg: 'British Council Take IELTS Preparation',
    keyTakeaways: [
      'Section 4 has NO mid-section pause; spend all preparation time predicting word forms for questions 31–40.',
      'Listen for discourse markers indicating contrast ("However, an unexpected finding was...").',
      'Pay obsessive attention to singular vs. plural endings (omitting an "s" invalidates the mark).',
      'Transcribe numbers and metric units exactly as instructed in the word count limitation.'
    ],
    sections: [
      {
        heading: 'Signposting Language Guide',
        body: 'Academic lecturers signal transitions with specific linguistic cues:\n• Definition: "What we mean by this term is...", "In technical terms..."\n• Contrast & Revision: "Earlier hypotheses held that X, but recent excavations revealed Y..."\n• Highlight & Emphasis: "The crucial aspect to recognise is...", "It is especially noteworthy that..."\n• Conclusion: "To draw these threads together...", "Ultimately, the research indicates..."'
      }
    ]
  },
  {
    id: 5,
    title: 'Band 8.5 Sample Essay: Technology & Employment (Task 2)',
    category: 'Sample Essays',
    type: 'Sample',
    difficulty: 'Band 8+',
    pages: 3,
    rating: 5.0,
    reads: 18200,
    tag: 'BAND 8.5',
    desc: 'Annotated band 8.5 essay addressing automation and labor markets with line-by-line examiner commentary across all four assessment criteria.',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.IELTS_OFFICIAL_PREP,
    sourceOrg: 'IELTS Official Candidate Preparation',
    keyTakeaways: [
      'Examiners reward nuanced arguments over simplistic polar extremes.',
      'Paragraphs feature seamless internal cohesion using pronouns, synonyms, and thematic flow.',
      'Zero grammatical errors in basic clauses; complex structures are deployed naturally.',
      'Word count reached: 342 words (optimally between 280 and 350).'
    ],
    sections: [
      {
        heading: 'Prompt & Full Model Essay',
        body: 'PROMPT: Some people believe that automation and artificial intelligence will eliminate traditional jobs, leading to mass unemployment, while others argue that innovation will generate unprecedented professional opportunities. Discuss both views and give your opinion.\n\nESSAY:\nThe rapid acceleration of automation and artificial intelligence has sparked intense debate regarding the future of the global workforce. While skeptics contend that mechanisation will displace millions of traditional workers and induce severe economic instability, I maintain that technological transitions historically generate more specialized vocations than they eradicate, provided proactive educational reforms are enacted.\n\nAdmittedly, the apprehension surrounding job displacement is not without foundation. Automation systems and machine learning algorithms are increasingly capable of executing repetitive manual tasks and rudimentary analytical calculations with greater efficiency and fewer errors than human laborers. In sectors such as manufacturing, logistics, and customer service, the adoption of robotic process automation has already curtailed entry-level employment. For individuals lacking access to retraining programs, this displacement can lead to prolonged financial hardship and widen the socioeconomic divide between skilled and unskilled workers.\n\nNevertheless, historical precedent demonstrates that industrial revolutions invariably foster novel employment ecosystems. The obsolescence of obsolete trades is routinely counterbalanced by burgeoning demand in software development, data governance, green engineering, and creative industries. Furthermore, automating routine cognitive burdens liberates human professionals to focus on high-order problem solving, empathetic care, and strategic design—domains inherently resistant to algorithmic replication. Thus, rather than terminating employment, technology transforms its fundamental character.\n\nIn conclusion, while the transitional phase poses legitimate challenges for manual workers, innovation does not signify the end of employment. Through targeted vocational reskilling and continuous institutional education, societies can successfully navigate this paradigm shift and cultivate a more resilient, technologically proficient labor force.'
      },
      {
        heading: 'Examiner Commentary & Assessment Criteria',
        body: '• Task Achievement (Band 9.0): Both viewpoints are exhaustively explored with clear, balanced arguments. The candidate’s stance is explicit from introduction to conclusion.\n• Coherence & Cohesion (Band 8.5): Logical sequencing with sophisticated referential chains ("this displacement", "such adaptations").\n• Lexical Resource (Band 8.5): High natural precision: "burgeoning demand", "algorithmic replication", "socioeconomic divide".\n• Grammatical Range (Band 8.5): Varied structures including conditional clauses, participial modifiers, and passive transforms.'
      }
    ]
  },
  {
    id: 6,
    title: 'Speaking Part 2 Cue Card Responses — 40 Topics',
    category: 'Speaking',
    type: 'Practice',
    difficulty: 'Band 6–7',
    pages: 56,
    rating: 4.5,
    reads: 6100,
    tag: 'PRACTICE',
    desc: '40 complete 2-minute monologue transcripts covering frequent Part 2 prompts, utilizing the PPF (Past, Present, Future) storytelling method.',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.BRITISH_COUNCIL_PRACTICE,
    sourceOrg: 'British Council Take IELTS Preparation',
    keyTakeaways: [
      'Use the 1-minute note preparation to write keywords, not full sentences.',
      'Organize using the PPF framework: Describe background origins (Past) → Current significance (Present) → Future aspirations (Future).',
      'Keep speaking until the examiner stops you at the 2-minute mark.',
      'Maintain natural intonation and cadence rather than rushing through memorized bullet points.'
    ],
    sections: [
      {
        heading: 'Sample Cue Card: An Environmental Initiative in Your Community',
        body: 'CUE CARD PROMPT: Describe an environmental project or initiative in your community that you found memorable.\nYou should say:\n- What the initiative was\n- When and where it occurred\n- What actions were taken\n- And explain why you consider it effective.\n\nMODEL RESPONSE OUTLINE:\n"I would like to talk about a community-led urban reforestation campaign that took place in my municipality approximately two years ago. Historically, our neighborhood lacked sufficient canopy cover, which contributed to an intense urban heat island effect during the summer months. In response, a coalition of local residents and municipal planners launched the \'Green Corridors\' initiative..."'
      }
    ]
  },
  {
    id: 7,
    title: 'Complex Grammar for IELTS Band 7+: Conditionals, Modals & Passives',
    category: 'Grammar',
    type: 'Guide',
    difficulty: 'Band 7+',
    pages: 28,
    rating: 4.8,
    reads: 7340,
    tag: 'GRAMMAR',
    desc: 'In-depth guide to inverted conditionals, impersonal passives, nominalisation, and cleft sentences expected in high-band academic writing.',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.CAMBRIDGE_PREP,
    sourceOrg: 'Cambridge Assessment English Official Preparation',
    keyTakeaways: [
      'Examiners look for a mix of simple, compound, and complex structures, executed with consistent accuracy.',
      'Use impersonal passives to preserve objective academic tone in essays.',
      'Inverted conditionals demonstrate high-level syntactic control without sounding forced.',
      'Avoid comma splices and run-on sentences in multi-clause sentences.'
    ],
    sections: [
      {
        heading: 'Formula 1: Inverted Conditionals (Replacing "If")',
        body: '• Standard: "If governments had intervened sooner, the crisis would have been mitigated."\n• Inverted Band 8+: "Had governments intervened sooner, the crisis would have been mitigated."\n• Present Conditional: "Were state authorities to subsidise electric vehicles, adoption rates would surge exponentially."'
      },
      {
        heading: 'Formula 2: Impersonal Academic Passive',
        body: '• Active (informal): "People widely believe that tourism damages historic heritage."\n• Academic Impersonal: "It is widely contended that unregulated tourism exerts detrimental pressure on fragile heritage ecosystems."'
      }
    ]
  },
  {
    id: 8,
    title: 'Cambridge IELTS 18 — Reading Passage 2 Answer Key with Explanations',
    category: 'Reading',
    type: 'Answer Key',
    difficulty: 'Band 7+',
    pages: 8,
    rating: 4.9,
    reads: 11600,
    tag: 'OFFICIAL',
    desc: 'Detailed answer justifications and locator citations for Cambridge IELTS 18 Academic Test 1 Passage 2: "Why we need silence".',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.CAMBRIDGE_HOME,
    sourceOrg: 'Cambridge University Press & Assessment',
    keyTakeaways: [
      'Locate verbatim text evidence before committing to any True/False or matching option.',
      'Distinguish between factual claims and attributed opinions in academic journals.',
      'Cambridge distractors often repeat exact words from the text in incorrect contexts.',
      'Summary completion answers must strictly obey the word count limit.'
    ],
    sections: [
      {
        heading: 'Passage 2 Breakdown: Questions 14–26 Justifications',
        body: '• Question 14 (Matching Information - Paragraph C): The text specifies physiological reactions to noise pollution, matching the description of neurological stimuli.\n• Question 18 (Summary Completion - "breath"): Located in Paragraph D, line 4: "...noticing the rhythm of their breath during silence sessions."\n• Question 19 (Summary Completion - "questionnaire"): Located in Paragraph E, line 12: "...subjects completed a comprehensive psychological questionnaire."'
      }
    ]
  },
  {
    id: 9,
    title: 'Coherence & Cohesion: Discourse Markers for Band 7+ Writing',
    category: 'Writing',
    type: 'Guide',
    difficulty: 'Band 6–7',
    pages: 14,
    rating: 4.7,
    reads: 8900,
    tag: 'WRITING',
    desc: 'A classified repository of 120+ discourse markers, paragraph transition strategies, and lexical cohesive chains to avoid mechanical linking.',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.IELTS_SCORING_DESCRIPTORS,
    sourceOrg: 'IELTS.org Official Scoring Criteria',
    keyTakeaways: [
      'Do not begin every sentence with a mechanical transition word like "Moreover" or "In addition".',
      'Use thematic referencing: connect the start of a sentence with the concept introduced at the end of the previous one.',
      'Deploy diverse concessions: "notwithstanding this limitation", "albeit at considerable expense".',
      'Coherence is achieved through clear paragraph progression, not simply punctuation markers.'
    ],
    sections: [
      {
        heading: 'Categorized High-Band Linking Phrases',
        body: '• Concession: "Notwithstanding these apparent drawbacks...", "Albeit challenging to implement..."\n• Contrast: "Conversely...", "In stark juxtaposition to...", "Whereas developed economies..."\n• Exemplification: "A case in point is...", "This principle is substantiated by..."\n• Result / Causality: "Consequently...", "This chain of causality underscores..."'
      }
    ]
  },
  {
    id: 10,
    title: 'IELTS Environmental Science Vocabulary — 200 Specialist Terms',
    category: 'Vocabulary',
    type: 'Vocabulary',
    difficulty: 'Band 6+',
    pages: 22,
    rating: 4.6,
    reads: 4200,
    tag: 'TOPIC',
    desc: 'Domain-specific vocabulary for recurring environmental topics: climate mitigation, renewable transitions, biodiversity loss, and urban ecology.',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.IDP_PREPARATION,
    sourceOrg: 'IDP IELTS Australia Official Guide',
    keyTakeaways: [
      'Group vocabulary by thematic clusters for better associative retention.',
      'Learn precise verbs: "curtail emissions", "deplete resources", "sequester carbon".',
      'Demonstrate ecological literacy: "biodiversity corridors", "closed-loop recycling", "anthropogenic disruption".',
      'Use in both Academic Reading comprehension and Writing Task 2 essays.'
    ],
    sections: [
      {
        heading: 'Thematic Core Clusters',
        body: '1. Climate & Atmosphere: Anthropogenic greenhouse gas emissions, carbon sequestration, radiative forcing, feedback loops.\n2. Ecosystems & Ecology: Habitat fragmentation, trophic cascades, apex predators, ecological carrying capacity.\n3. Sustainability & Energy: Decarbonisation, photovoltaic infrastructure, grid-scale battery storage, life-cycle analysis.'
      }
    ]
  },
  {
    id: 11,
    title: 'Band 7.5 Sample Essay: Globalisation & Cultural Identity (Task 2)',
    category: 'Sample Essays',
    type: 'Sample',
    difficulty: 'Band 7–8',
    pages: 3,
    rating: 4.8,
    reads: 14100,
    tag: 'BAND 7.5',
    desc: 'Annotated essay examining cultural homogenization versus intercultural appreciation, featuring detailed examiner analysis and enhancement points.',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.IELTS_OFFICIAL_PREP,
    sourceOrg: 'IELTS Official Candidate Preparation',
    keyTakeaways: [
      'Band 7.5 essays show strong coherence with occasional minor lexical or stylistic repetitions.',
      'The argument balances cultural preservation with cosmopolitan exchange.',
      'Clear paragraph boundaries with distinct sub-arguments.',
      'Learn what small adjustments elevate a 7.5 essay to a Band 8.5+.'
    ],
    sections: [
      {
        heading: 'Essay Summary & Analysis',
        body: 'Prompt: Some argue that globalisation destroys cultural uniqueness, while others believe it encourages understanding between nations. Discuss both views.\nThe essay demonstrates solid development of both viewpoints, highlighting how mass media and transnational retail homogenize urban landscapes, while simultaneously creating unprecedented platforms for indigenous arts and international cultural festivals.'
      }
    ]
  },
  {
    id: 12,
    title: 'Paraphrasing Techniques: 6 Strategies for Academic Reading',
    category: 'Reading',
    type: 'Guide',
    difficulty: 'Band 6+',
    pages: 10,
    rating: 4.5,
    reads: 5800,
    tag: 'TECHNIQUE',
    desc: 'Master the 6 linguistic mechanisms used by Cambridge exam writers to paraphrase questions and hide answers in academic reading passages.',
    externalUrl: OFFICIAL_EXTERNAL_LINKS.BRITISH_COUNCIL_PRACTICE,
    sourceOrg: 'British Council Take IELTS Preparation',
    keyTakeaways: [
      'IELTS Reading is fundamentally a vocabulary and paraphrase recognition exam.',
      'Look for grammatical voice changes: active sentences in questions often become passive in the passage.',
      'Master nominalization: adjectives and verbs transformed into abstract nouns.',
      'Antonyms with negative particles frequently mirror affirmative questions.'
    ],
    sections: [
      {
        heading: 'The 6 Paraphrasing Mechanisms',
        body: '1. True Synonymy: "commence" ↔ "embark upon", "hazardous" ↔ "perilous".\n2. Nominalisation: "The population expanded rapidly" ↔ "The rapid expansion of the populace".\n3. Active / Passive Shift: "Scientists isolated the enzyme" ↔ "The enzyme was successfully isolated".\n4. Antonym Negation: "It was affordable" ↔ "It was by no means prohibitively priced".\n5. Syntactic Clause Reordering: Cause-and-effect clauses inverted with conjunctions.\n6. Class to Instance: General category ("livestock") replaced by specific member ("dairy cattle").'
      }
    ]
  }
]
