/**
 * Dynamic IELTS Writing Evaluation Engine
 * Performs rule-based and linguistic NLP scoring on Task 1 and Task 2 essays.
 */

const ACADEMIC_WORDS = new Set([
  'accommodate', 'acquire', 'adapt', 'adequate', 'adjacent', 'advocate', 'aggregate', 'allocate',
  'alter', 'ambiguous', 'analogy', 'analyze', 'anticipate', 'apparent', 'append', 'appreciate',
  'approach', 'appropriate', 'approximate', 'arbitrary', 'aspect', 'assemble', 'assess', 'assign',
  'assume', 'assure', 'attain', 'attribute', 'author', 'authority', 'automate', 'available',
  'aware', 'behalf', 'benefit', 'bias', 'bond', 'brief', 'bulk', 'capable', 'capacity', 'category',
  'cease', 'challenge', 'channel', 'chapter', 'chart', 'chemical', 'circumstance', 'cite', 'civil',
  'clarify', 'classic', 'clause', 'coherent', 'coincide', 'collapse', 'colleague', 'commence',
  'comment', 'commission', 'commit', 'commodity', 'communicate', 'community', 'compatible',
  'compensate', 'compile', 'complement', 'complex', 'component', 'compound', 'comprehensive',
  'comprise', 'compute', 'conceive', 'concentrate', 'concept', 'conclude', 'concurrent', 'conduct',
  'confer', 'confine', 'confirm', 'conflict', 'conform', 'consent', 'consequent', 'considerable',
  'consist', 'constant', 'constitute', 'constrain', 'construct', 'consult', 'consume', 'contact',
  'contemporary', 'context', 'contract', 'contradict', 'contrary', 'contrast', 'contribute',
  'controversy', 'convene', 'converse', 'convert', 'convince', 'cooperate', 'coordinate', 'core',
  'corporate', 'correspond', 'couple', 'create', 'credit', 'criteria', 'crucial', 'culture',
  'currency', 'cycle', 'data', 'debate', 'decade', 'decline', 'deduce', 'define', 'definite',
  'demonstrate', 'denote', 'deny', 'depress', 'derive', 'design', 'despite', 'detect', 'deviate',
  'device', 'devote', 'differentiate', 'dimension', 'diminish', 'discrete', 'discriminate',
  'displace', 'display', 'dispose', 'distinct', 'distort', 'distribute', 'diverse', 'document',
  'domain', 'domestic', 'dominate', 'draft', 'drama', 'duration', 'dynamic', 'economy', 'edit',
  'element', 'eliminate', 'emerge', 'emphasis', 'empirical', 'enable', 'encounter', 'energy',
  'enforce', 'enhance', 'enormous', 'ensure', 'entity', 'environment', 'equate', 'equip',
  'equivalent', 'erode', 'error', 'establish', 'estate', 'estimate', 'ethic', 'ethnic', 'evaluate',
  'eventual', 'evident', 'evolve', 'exceed', 'exclude', 'exhibit', 'expand', 'expert', 'explicit',
  'exploit', 'export', 'expose', 'external', 'extract', 'facilitate', 'factor', 'feature',
  'federal', 'fee', 'file', 'final', 'finance', 'finite', 'flexible', 'fluctuate', 'focus',
  'format', 'formula', 'forthcoming', 'foundation', 'framework', 'function', 'fund', 'fundamental',
  'furthermore', 'generate', 'generation', 'globe', 'goal', 'grade', 'grant', 'guarantee',
  'guideline', 'hence', 'hierarchy', 'highlight', 'hypothesis', 'identical', 'identify', 'ideology',
  'ignorance', 'illustrate', 'image', 'immigrate', 'impact', 'implement', 'implicate', 'implicit',
  'imply', 'impose', 'incentive', 'incidence', 'incline', 'income', 'incorporate', 'index',
  'indicate', 'individual', 'induce', 'inevitable', 'infer', 'infrastructure', 'inherent',
  'inhibit', 'initial', 'initiate', 'injure', 'innovate', 'input', 'insert', 'insight', 'inspect',
  'instance', 'institute', 'instruct', 'integral', 'integrate', 'integrity', 'intelligence',
  'intense', 'interact', 'intermediate', 'internal', 'interpret', 'interval', 'intervene',
  'intrinsic', 'invest', 'investigate', 'invoke', 'involve', 'isolate', 'issue', 'item', 'job',
  'journal', 'justify', 'label', 'labor', 'layer', 'lecture', 'legal', 'legislate', 'levy',
  'liberal', 'license', 'likewise', 'link', 'locate', 'logic', 'maintain', 'major', 'manipulate',
  'manual', 'margin', 'mature', 'maximize', 'mechanism', 'media', 'mediate', 'medical', 'medium',
  'mental', 'method', 'migrate', 'military', 'minimal', 'minimize', 'minimum', 'ministry', 'minor',
  'mode', 'modify', 'monitor', 'motive', 'mutual', 'negate', 'network', 'neutral', 'nevertheless',
  'nonetheless', 'norm', 'normal', 'notion', 'nuclear', 'objective', 'obtain', 'obvious',
  'occupy', 'occur', 'offset', 'ongoing', 'option', 'orient', 'outcome', 'output', 'overall',
  'overlap', 'overseas', 'panel', 'paradigm', 'paragraph', 'parallel', 'parameter', 'participate',
  'partner', 'passive', 'perceive', 'percent', 'period', 'persist', 'perspective', 'phase',
  'phenomenon', 'philosophy', 'physical', 'plus', 'policy', 'portion', 'pose', 'positive',
  'potential', 'practitioner', 'precede', 'precise', 'predict', 'predominant', 'preliminary',
  'presume', 'previous', 'primary', 'prime', 'principal', 'principle', 'prior', 'priority',
  'proceed', 'process', 'professional', 'prohibit', 'project', 'promote', 'proportion', 'prospect',
  'protocol', 'psychology', 'publication', 'publish', 'purchase', 'pursue', 'qualitative', 'quote',
  'radical', 'random', 'range', 'ratio', 'rational', 'react', 'recover', 'refine', 'regime',
  'region', 'register', 'regulate', 'reinforce', 'reject', 'relax', 'release', 'relevant',
  'reluctance', 'rely', 'remove', 'require', 'research', 'reside', 'resolve', 'resource',
  'respond', 'restore', 'restrain', 'restrict', 'retain', 'reveal', 'revenue', 'reverse', 'revise',
  'revolution', 'rigid', 'role', 'route', 'scenario', 'schedule', 'scheme', 'scope', 'section',
  'sector', 'secure', 'seek', 'select', 'sequence', 'series', 'shift', 'significant', 'similar',
  'simulate', 'site', 'so-called', 'sole', 'somewhat', 'source', 'specific', 'specify', 'sphere',
  'stable', 'statistic', 'status', 'straightforward', 'strategy', 'stress', 'structure', 'style',
  'submit', 'subordinate', 'subsequent', 'subsidy', 'substitute', 'successor', 'sufficient',
  'sum', 'summary', 'supplement', 'survey', 'survive', 'suspend', 'sustain', 'symbol', 'tape',
  'target', 'task', 'team', 'technical', 'technique', 'technology', 'temporary', 'tense',
  'terminate', 'text', 'theme', 'theory', 'thereby', 'thesis', 'topic', 'trace', 'tradition',
  'transfer', 'transform', 'transit', 'transmit', 'transport', 'trend', 'trigger', 'ultimate',
  'undergo', 'underlie', 'undertake', 'uniform', 'unify', 'unique', 'utilize', 'valid', 'vary',
  'vehicle', 'version', 'via', 'violate', 'virtual', 'visible', 'vision', 'visual', 'volume',
  'voluntary', 'welfare', 'whereas', 'whereby', 'widespread'
])

const TRANSITIONS = [
  'furthermore', 'moreover', 'in addition', 'on the other hand', 'however', 'nevertheless',
  'nonetheless', 'consequently', 'therefore', 'in contrast', 'conversely', 'as a result',
  'firstly', 'secondly', 'finally', 'in conclusion', 'to summarize', 'for instance', 'for example'
]

const INFORMAL_PATTERNS = [
  { regex: /\b(don't|doesn't|didn't|won't|can't|couldn't|shouldn't|wouldn't|isn't|aren't|wasn't|weren't)\b/gi, fix: 'Avoid contractions in formal IELTS essays. Use full forms (do not, cannot, etc.).' },
  { regex: /\b(a lot of|lots of)\b/gi, fix: 'Replace informal "a lot of" with academic quantifiers such as "a substantial amount of", "numerous", or "considerable".' },
  { regex: /\b(gonna|wanna|kinda|sorta)\b/gi, fix: 'Colloquial slang is strictly penalized. Use formal standard English.' },
  { regex: /\b(kids|guys)\b/gi, fix: 'Use "children", "youth", or "individuals" instead of informal terms.' }
]

const WORD_ENHANCEMENTS = {
  'good': ['beneficial', 'advantageous', 'favourable', 'constructive'],
  'bad': ['detrimental', 'adverse', 'deleterious', 'unfavourable'],
  'big': ['substantial', 'considerable', 'prominent', 'monumental'],
  'small': ['marginal', 'negligible', 'minute', 'modest'],
  'make': ['fabricate', 'constitute', 'establish', 'generate'],
  'show': ['demonstrate', 'illustrate', 'substantiate', 'exemplify'],
  'problem': ['impediment', 'predicament', 'dilemma', 'complication'],
  'important': ['paramount', 'crucial', 'imperative', 'indispensable'],
  'think': ['posit', 'contend', 'deliberate', 'maintain'],
  'change': ['transition', 'fluctuate', 'metamorphose', 'shift']
}

export function evaluateEssay(taskType, prompt, essayText) {
  const cleanText = (essayText || '').trim()
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : []
  const wordCount = words.length
  const minWords = taskType === '1' ? 150 : 250

  const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const paragraphCount = paragraphs.length

  const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5)
  const sentenceCount = Math.max(1, sentences.length)
  const avgSentenceLength = wordCount / sentenceCount

  // 1. Task Achievement / Task Response (TA)
  let taScore = 7.0
  if (wordCount < 30) {
    taScore = Math.max(1.0, Number(((wordCount / minWords) * 4.0).toFixed(1)))
  } else if (wordCount < minWords) {
    const penalty = ((minWords - wordCount) / minWords) * 4.0
    taScore = Math.max(2.0, 7.0 - penalty)
  } else if (wordCount >= minWords + 30 && paragraphCount >= (taskType === '1' ? 3 : 4)) {
    taScore = Math.min(8.5, 7.0 + 0.5 * Math.min(2, Math.floor((wordCount - minWords) / 50)))
  }

  // 2. Coherence and Cohesion (CC)
  let transitionHits = 0
  TRANSITIONS.forEach(t => {
    const regex = new RegExp(`\\b${t}\\b`, 'gi')
    const matches = cleanText.match(regex)
    if (matches) transitionHits += matches.length
  })

  let ccScore = 6.5
  if (wordCount < 30) {
    ccScore = Math.max(1.0, paragraphCount * 1.5)
  } else if (paragraphCount < (taskType === '1' ? 2 : 3)) {
    ccScore = Math.min(ccScore, 5.0)
  } else if (paragraphCount >= 4 && transitionHits >= 4) {
    ccScore = Math.min(8.5, 7.0 + (transitionHits >= 7 ? 1.0 : 0.5))
  } else if (transitionHits >= 2) {
    ccScore = 6.5
  }

  // 3. Lexical Resource (LR)
  const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean)
  const uniqueWords = new Set(lowerWords)
  const lexicalDiversity = uniqueWords.size / Math.max(1, lowerWords.length)

  let academicHits = 0
  const detectedAcademicWords = []
  uniqueWords.forEach(word => {
    if (ACADEMIC_WORDS.has(word)) {
      academicHits++
      if (detectedAcademicWords.length < 8) detectedAcademicWords.push(word)
    }
  })

  let lrScore = 6.5
  if (wordCount < 30) {
    lrScore = Math.max(1.0, academicHits * 1.5 + 2.0)
  } else if (academicHits >= 14 && lexicalDiversity > 0.45) {
    lrScore = 8.0
  } else if (academicHits >= 8 && lexicalDiversity > 0.40) {
    lrScore = 7.5
  } else if (academicHits >= 4) {
    lrScore = 7.0
  } else {
    lrScore = 6.0
  }

  // 4. Grammatical Range and Accuracy (GRA)
  const grammarIssues = []
  INFORMAL_PATTERNS.forEach(item => {
    const match = cleanText.match(item.regex)
    if (match) {
      match.slice(0, 2).forEach(m => {
        grammarIssues.push({
          type: 'error',
          text: m,
          issue: item.fix,
          fix: 'Adjust to formal academic phrasing.'
        })
      })
    }
  })

  // Complexity check
  const complexMarkers = (cleanText.match(/\b(which|that|although|despite|whereas|while|because|since|if|unless)\b/gi) || []).length
  let graScore = 6.5
  if (grammarIssues.length === 0 && complexMarkers >= 6 && avgSentenceLength >= 14 && avgSentenceLength <= 26) {
    graScore = 8.0
  } else if (grammarIssues.length <= 1 && complexMarkers >= 3) {
    graScore = 7.5
  } else if (grammarIssues.length > 3) {
    graScore = 5.5
  } else {
    graScore = 6.5
  }

  // Word enhancement suggestions based on user text
  const vocabSuggestions = []
  Object.keys(WORD_ENHANCEMENTS).forEach(basicWord => {
    if (lowerWords.includes(basicWord) && vocabSuggestions.length < 4) {
      vocabSuggestions.push({
        word: basicWord,
        level: 'C1/C2',
        suggestion: WORD_ENHANCEMENTS[basicWord].join(', '),
        note: `Found "${basicWord}" in your text. Elevate lexical score by varying with academic synonyms.`
      })
    }
  })

  // If no common basic words found, add general high-impact upgrades
  if (vocabSuggestions.length === 0) {
    vocabSuggestions.push(
      { word: 'important', level: 'C1', suggestion: 'imperative, crucial, paramount', note: 'Use precise academic qualifiers.' },
      { word: 'problem', level: 'C1', suggestion: 'predicament, societal dilemma, impediment', note: 'Enhances lexical precision in problem analysis.' }
    )
  }

  // Overall Band Score calculation (average rounded to nearest 0.5)
  const rawAverage = (taScore + ccScore + lrScore + graScore) / 4
  const overallBand = Math.round(rawAverage * 2) / 2

  // Summary generation
  let summary = ''
  if (wordCount < minWords) {
    summary = `Your response contains ${wordCount} words, which is below the minimum required length of ${minWords} words for Task ${taskType}. This directly constrains your Task Achievement band to ${taScore.toFixed(1)}. Expanding your arguments with supporting examples will quickly boost your score.`
  } else if (overallBand >= 7.5) {
    summary = `An articulate, well-structured essay demonstrating high lexical sophistication (${academicHits} Academic Word List terms) and effective cohesive ties. Paragraph development is logical and clear.`
  } else if (overallBand >= 6.5) {
    summary = `A solid competent essay with clear organization (${paragraphCount} paragraphs). To push into Band 7.5+, incorporate wider grammatical subordination, eliminate informal phrasing, and increase academic vocabulary variety.`
  } else {
    summary = `The essay communicates a basic viewpoint but lacks sustained analytical development. Focus on clear topic sentences for each paragraph and use formal discourse connectors.`
  }

  const improvements = []
  if (wordCount < minWords) {
    improvements.push(`Reach at least ${minWords} words (currently ${wordCount}) to avoid automatic length penalties.`)
  }
  if (paragraphCount < (taskType === '1' ? 3 : 4)) {
    improvements.push(`Structure your essay into clearly separated paragraphs: Introduction, 2 Body paragraphs, and a Conclusion.`)
  }
  if (transitionHits < 4) {
    improvements.push(`Incorporate more transitional linkers (e.g. "Consequently", "On the other hand", "Furthermore") between main ideas.`)
  }
  if (academicHits < 8) {
    improvements.push(`Increase your use of Academic Word List vocabulary to demonstrate C1-level lexical range.`)
  }
  improvements.push(`Ensure every claim in body paragraphs is substantiated by a specific real-world example or logical rationale.`)

  return {
    band: overallBand,
    ta: Math.round(taScore * 2) / 2,
    cc: Math.round(ccScore * 2) / 2,
    lr: Math.round(lrScore * 2) / 2,
    gra: Math.round(graScore * 2) / 2,
    wordCount,
    minWords,
    paragraphCount,
    academicWordCount: academicHits,
    detectedAcademicWords,
    summary,
    grammar: grammarIssues.length > 0 ? grammarIssues : [
      { type: 'suggestion', text: 'Sentence variety check', issue: `Average sentence length is ${avgSentenceLength.toFixed(1)} words. Good balance of compound and complex structures.`, fix: 'Maintain this flow.' }
    ],
    vocab: vocabSuggestions,
    improvements
  }
}
