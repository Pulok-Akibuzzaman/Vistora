export interface SopTemplateSection {
  step: string
  heading: string
  guidance: string
}

export interface SopTemplate {
  id: string
  title: string
  track: 'PhD Research' | 'Master’s Research' | 'Coursework MS' | 'Industry Pivot'
  subfield: string
  targetLength: string
  tag: string
  summary: string
  keyTips: string[]
  structure: SopTemplateSection[]
  prefill: {
    program: string
    university: string
    interests: string
    background: string
    why: string
    goals: string
  }
  templateText: string
}

export const CS_SOP_NOTION_URL =
  'https://cs-sop.notion.site/CS-PhD-Statements-of-Purpose-df39955313834889b7ac5411c37b958d'

export const CS_SOP_ARCHIVE_URL = 'https://cs-sop.org'

export const SOP_TEMPLATES: SopTemplate[] = [
  {
    id: 'cs-phd-ai-ml',
    title: 'CS PhD — AI, Machine Learning & Foundation Models',
    track: 'PhD Research',
    subfield: 'AI & Machine Learning',
    targetLength: '~900–1,050 words · 2 pages max',
    tag: 'CS-SOP CORE',
    summary:
      'Designed for competitive ML/AI PhD admissions. Emphasizes algorithmic insights, mathematical rigor, empirical ablations, and specific faculty alignment over generic tool lists.',
    keyTips: [
      'Avoid sounding like a library consumer ("I trained a model in PyTorch"); explain what limitation you diagnosed and what algorithmic idea solved it.',
      'Highlight concrete metrics, failure-mode analyses, or theoretical bounds from 1–2 deep research projects.',
      'Name 2–3 faculty members whose recent papers align with your open research questions.',
    ],
    structure: [
      {
        step: '01',
        heading: 'Research Thesis & Subfield Hook (~120 words)',
        guidance:
          'State your specific research direction (e.g., sample-efficient reasoning, trustworthy multimodal learning), your current affiliation, and the core open problem driving your PhD application.',
      },
      {
        step: '02',
        heading: 'Primary Research Deep-Dive (~300 words)',
        guidance:
          'Present your strongest project: Problem gap -> Your independent hypothesis/method -> Technical hurdle -> Measured improvement or publication/preprint outcome.',
      },
      {
        step: '03',
        heading: 'Secondary Research & Technical Breadth (~220 words)',
        guidance:
          'Connect a second project or research internship that proves complementary depth (e.g., theoretical analysis, systems scaling, or human-centered evaluation).',
      },
      {
        step: '04',
        heading: 'PhD Research Agenda & Faculty Fit (~240 words)',
        guidance:
          'Articulate 2 concrete questions you plan to investigate during your PhD and connect them directly to specific labs and professors at the target department.',
      },
    ],
    prefill: {
      program: 'Ph.D. in Computer Science (Machine Learning & Reasoning)',
      university: 'Target University',
      interests:
        'Sample-efficient reasoning, uncertainty calibration, and mechanistic interpretability in foundation models',
      background:
        'Undergraduate/Master’s research on representation learning, ablation studies on out-of-distribution generalization, and statistical learning theory',
      why:
        'Alignment with specific faculty labs working on trustworthy ML and scalable inference, along with collaborative interdisciplinary AI groups',
      goals:
        'Conduct foundational ML research in an academic or industrial research lab and mentor future researchers',
    },
    templateText: `STATEMENT OF PURPOSE

Applicant: [Your Full Name]
Target Program: Ph.D. in Computer Science
Institution: [Target University]

My research goal is to build [specific capability, e.g., reliable and sample-efficient reasoning systems] that remain robust under [specific challenge, e.g., distribution shift and limited supervision]. While current [field, e.g., foundation models] achieve strong benchmark performance, they frequently fail when [concrete limitation you observed in your research]. Through a Ph.D. in Computer Science at [Target University], I aim to develop principled algorithms that address this limitation from both theoretical and empirical perspectives.

During my [undergraduate / Master’s] studies at [Your Institution], I investigated [Problem 1] under the supervision of [Advisor Name]. Existing approaches typically assumed [limiting assumption], which caused [failure mode or bottleneck]. To address this, I independently designed and implemented [your core methodological contribution]. A key technical challenge was [specific challenge, e.g., gradient instability / noisy supervision / memory overhead], which I resolved by [your solution]. Across [benchmark/dataset], this approach improved [metric] by [X%] over [baseline], resulting in [paper / workshop submission / technical report / open-source release].

To broaden my perspective on [complementary angle], I subsequently worked on [Project 2] with [Collaborator/Lab]. Rather than treating [model/component] as a black box, I analyzed [theoretical property / failure case / scaling behavior] and formulated [method or experimental framework]. This experience taught me how to isolate confounding variables through controlled ablations and translate empirical observations into testable hypotheses.

Looking ahead, I am excited to investigate two interconnected questions during my doctoral studies: (1) [Open Research Question 1], and (2) [Open Research Question 2]. Answering these questions requires bridging [Methodology A] with [Methodology B], which makes [Target University] an ideal environment for my Ph.D.

In particular, I am eager to collaborate with Prof. [Professor A], whose recent work on [specific paper or topic] closely aligns with my interest in [shared topic], as well as Prof. [Professor B], whose research on [specific topic] complements my background in [your strength]. With my foundation in [core skills/research], I am prepared to contribute immediately to the [Lab/Group Name] community and pursue a career advancing [long-term academic or research lab goal].`,
  },
  {
    id: 'cs-phd-systems',
    title: 'CS PhD — Distributed Systems, Compilers & Security',
    track: 'PhD Research',
    subfield: 'Systems & Security',
    targetLength: '~900 words · 1.5–2 pages',
    tag: 'SYSTEMS TRACK',
    summary:
      'Tailored for Systems, Networking, Databases, OS, and Security applicants. Centers on architectural trade-offs, bottlenecks, latency/throughput measurements, and real artifacts.',
    keyTips: [
      'Quantify engineering and research outcomes: tail latency (p99), throughput, memory footprint, or verified vulnerability classes.',
      'Explain the design trade-offs you rejected—systems reviewers value why you chose Architecture X over Alternative Y.',
      'Mention open-source artifacts, kernel/compiler patches, or production-scale workloads you tested on.',
    ],
    structure: [
      {
        step: '01',
        heading: 'Systems Problem & Core Thesis (~120 words)',
        guidance:
          'Frame the systems bottleneck (e.g., tail-latency amplification, disaggregated memory scheduling, isolation overhead) and your motivation to study it at the PhD level.',
      },
      {
        step: '02',
        heading: 'Flagship System / Artifact Built (~320 words)',
        guidance:
          'Describe the system you architected, the bottleneck you profiled, the key design trade-off, and quantitative benchmark wins.',
      },
      {
        step: '03',
        heading: 'Second Research / Engineering Investigation (~220 words)',
        guidance:
          'Showcase depth across another systems layer (e.g., verification, compiler passes, hardware-software co-design, or threat modeling).',
      },
      {
        step: '04',
        heading: 'Target Systems Group & Faculty Alignment (~220 words)',
        guidance:
          'Connect your background to 2–3 systems/security faculty and describe what systems you want to build next.',
      },
    ],
    prefill: {
      program: 'Ph.D. in Computer Science (Systems & Networking)',
      university: 'Target University',
      interests:
        'Low-latency distributed storage, hardware-software co-design, and formal verification for fault-tolerant cloud systems',
      background:
        'Built and benchmarked concurrent runtime components in C++/Rust, profiled p99 tail latency bottlenecks, and authored systems evaluations',
      why:
        'Strong systems research culture, open-source artifact infrastructure, and faculty expertise in distributed consensus and OS design',
      goals:
        'Lead next-generation systems research in academia or core infrastructure labs',
    },
    templateText: `STATEMENT OF PURPOSE

Applicant: [Your Full Name]
Target Program: Ph.D. in Computer Science
Institution: [Target University]

Modern computing infrastructure increasingly relies on [target domain, e.g., distributed ML clusters / serverless runtimes / trusted execution environments], where performance and correctness depend on resolving subtle interactions across software and hardware layers. My research focuses on designing [core systems goal, e.g., predictable, fault-tolerant systems] that eliminate [specific bottleneck] without sacrificing [safety / programmability / isolation]. I am applying to the Computer Science Ph.D. program at [Target University] to build principled systems grounded in rigorous measurement and implementation.

My primary systems research began in [Lab / Course / Internship] with [Advisor/Mentor], where we examined [specific bottleneck, e.g., lock contention and p99 tail-latency spikes in distributed KV stores]. Profiling existing implementations revealed that [root cause diagnosed via tracing/profiling]. To overcome this, I architected [System Name] in [C++ / Rust / Go], introducing [key design mechanism] while avoiding the complexity of [alternative trade-off]. Evaluated across [cluster size / realistic workload], [System Name] reduced [latency/overhead metric] by [X%] and improved throughput by [Y×] compared to [baseline system].

In a complementary project on [Second Area, e.g., static analysis / eBPF tracing / secure enclaves], I investigated [problem statement]. Because [constraint, e.g., dynamic instrumentation introduced unacceptable overhead], I designed [lightweight mechanism or compiler pass] that preserved [invariant/property] across [test suite or real-world codebase]. Through debugging subtle concurrency races and building reproducible benchmarks, I learned how critical end-to-end measurement is to validating systems hypotheses.

At [Target University], I hope to explore [Future Research Direction 1, e.g., deterministic scheduling for heterogeneous accelerators] and [Future Research Direction 2]. I am particularly drawn to Prof. [Professor A]’s recent system [Project Name], which demonstrates [key insight], and Prof. [Professor B]’s work on [topic]. With my background in low-level implementation, performance profiling, and empirical systems evaluation, I look forward to building impactful open-source systems research in your department.`,
  },
  {
    id: 'cs-phd-theory',
    title: 'CS PhD — Theory of Computation & Algorithms',
    track: 'PhD Research',
    subfield: 'Theory & Algorithms',
    targetLength: '~800–950 words · 1.5–2 pages',
    tag: 'THEORY TRACK',
    summary:
      'Built for Theoretical Computer Science, Algorithms, Cryptography, and Formal Verification applicants. Highlights proof techniques, reductions, and mathematical maturity.',
    keyTips: [
      'Use crisp mathematical language: clearly distinguish upper bounds, hardness reductions, and open conjectures.',
      'Even unpublished manuscripts or reading-course proofs carry strong weight if you explain the core proof barrier you overcame.',
      'Avoid vague adjectives; state exact problem models (e.g., streaming, online with advice, sublinear-time, differential privacy).',
    ],
    structure: [
      {
        step: '01',
        heading: 'Theoretical Focus & Motivation (~110 words)',
        guidance:
          'Define the subarea (e.g., approximation algorithms, fine-grained complexity, cryptography) and why its mathematical structure fascinates you.',
      },
      {
        step: '02',
        heading: 'Main Theoretical Result & Proof Insight (~300 words)',
        guidance:
          'State the problem model, why standard techniques failed, and the key proof idea/reduction you developed.',
      },
      {
        step: '03',
        heading: 'Supporting Research / Advanced Coursework (~200 words)',
        guidance:
          'Describe a second theoretical project, REU, or graduate seminar reading work showing mathematical breadth.',
      },
      {
        step: '04',
        heading: 'Open Questions & Theory Group Fit (~200 words)',
        guidance:
          'Identify concrete open theoretical questions and match them to faculty in the target theory group.',
      },
    ],
    prefill: {
      program: 'Ph.D. in Computer Science (Theoretical Computer Science)',
      university: 'Target University',
      interests:
        'Approximation and online algorithms, sublinear-time property testing, and algorithmic game theory',
      background:
        'Undergraduate thesis proving improved competitive ratios / hardness reductions, graduate coursework in randomized algorithms and complexity theory',
      why:
        'Renowned theory faculty working on optimization, complexity barriers, and interactive seminars',
      goals:
        'Pursue an academic research career proving foundational algorithmic bounds and mentoring students',
    },
    templateText: `STATEMENT OF PURPOSE

Applicant: [Your Full Name]
Target Program: Ph.D. in Computer Science
Institution: [Target University]

What draws me to Theoretical Computer Science is the ability to formalize messy computational phenomena and establish sharp boundaries between what is efficiently solvable and what is inherently intractable. My research interests center on [specific theory subarea, e.g., approximation algorithms, fine-grained complexity, and learning-augmented online optimization]. I am applying to the Ph.D. program at [Target University] to investigate foundational questions in [subarea] and contribute rigorous algorithmic and complexity-theoretic tools.

My primary research experience began under Prof. [Advisor Name] at [Your Institution], where we studied [exact problem name and model]. Prior work had established [known upper/lower bound], leaving a gap of [specific gap]. Standard [technique, e.g., LP rounding / potential-function analysis] broke down because [structural obstacle]. By introducing [key mathematical insight, e.g., a randomized rounding coupling / dual-fitting charging scheme], I proved [main theorem: improved bound or reduction], narrowing the gap to [result]. Working through the proof refinements taught me how to isolate the true combinatorial bottleneck behind an algorithmic barrier.

In parallel, through [second project / REU / independent reading under Prof. Name], I explored [second theory topic, e.g., streaming lower bounds via communication complexity]. Investigating [specific conjecture or lemma] deepened my fluency with [probabilistic method / spectral graph theory / cryptographic reductions] and strengthened my ability to communicate formal arguments cleanly.

During my Ph.D., I am eager to examine [Open Problem 1] and explore connections between [Area A] and [Area B]. [Target University] stands out for its vibrant theory group: Prof. [Professor A]’s work on [specific paper/topic] directly relates to the structural barriers I encountered in my thesis, and Prof. [Professor B]’s research on [topic] offers an exciting complementary lens. I hope to contribute my mathematical preparation and persistence to advancing theoretical computer science in your group.`,
  },
  {
    id: 'cs-phd-hci',
    title: 'CS PhD — Human-Computer Interaction & Social Computing',
    track: 'PhD Research',
    subfield: 'HCI & Social Computing',
    targetLength: '~950 words · 2 pages',
    tag: 'HCI & DESIGN',
    summary:
      'Designed for HCI, CSCW, Accessibility, and Human-AI Interaction candidates. Balances technical prototyping with rigorous user-study methodology and empirical findings.',
    keyTips: [
      'Show the closed loop: Human need / qualitative insight -> System design -> Controlled evaluation / field deployment.',
      'Specify your methodological toolkit (mixed-methods studies, thematic coding, controlled A/B lab studies, accessibility audits).',
      'Highlight how human findings changed the technical architecture—not just UI polish.',
    ],
    structure: [
      {
        step: '01',
        heading: 'Human-Centered Computing Vision (~120 words)',
        guidance:
          'State the human-technology gap you care about (e.g., accessible learning tools, transparent human-AI collaboration) and why HCI research is the lens to solve it.',
      },
      {
        step: '02',
        heading: 'Formative Study + Interactive System (~320 words)',
        guidance:
          'Walk through one end-to-end HCI project: formative interviews/observations -> interactive prototype built -> empirical user evaluation results.',
      },
      {
        step: '03',
        heading: 'Second Study / Interdisciplinary Collaboration (~220 words)',
        guidance:
          'Demonstrate versatility across qualitative/quantitative methods or domain partnerships (education, healthcare, accessibility).',
      },
      {
        step: '04',
        heading: 'PhD Directions & Lab Fit (~220 words)',
        guidance:
          'Propose future socio-technical systems you want to study and name specific HCI faculty and labs.',
      },
    ],
    prefill: {
      program: 'Ph.D. in Computer Science (Human-Computer Interaction)',
      university: 'Target University',
      interests:
        'Human-AI co-creation, educational technology, and inclusive interfaces for non-native English learners',
      background:
        'Designed and built interactive web prototypes, conducted IRB-approved mixed-methods user studies with thematic coding and statistical evaluation',
      why:
        'Interdisciplinary HCI group combining interactive systems engineering with qualitative and quantitative user research',
      goals:
        'Design equitable, human-centered AI tools in academia or applied research labs',
    },
    templateText: `STATEMENT OF PURPOSE

Applicant: [Your Full Name]
Target Program: Ph.D. in Computer Science (HCI)
Institution: [Target University]

As AI-powered tools become embedded in [domain, e.g., education, creative work, or accessibility], technical capability alone rarely guarantees human utility. My research sits at the intersection of [Human-Computer Interaction and Interactive AI], focusing on how to design interfaces that preserve [user agency / transparency / accessibility] for [target community]. Through a Ph.D. at [Target University], I aim to build and empirically evaluate socio-technical systems that empower real users.

In my primary research project with [Advisor/Lab], I investigated [specific user challenge] experienced by [user population]. Rather than jumping directly to implementation, I first conducted [formative interviews / contextual inquiry with N participants], identifying [key behavioral insight]. Guided by these findings, I engineered [System Name] using [tech stack], introducing [novel interaction mechanism]. In a follow-up [within-subjects / field] study with [N] participants, [System Name] improved [task outcome / comprehension / confidence metric] (p < [value]) while revealing nuanced trade-offs around [qualitative finding].

To deepen my empirical toolkit, I also contributed to [Project 2] examining [topic, e.g., algorithmic transparency / collaborative workflows]. Using [mixed-methods analysis / thematic coding / log telemetry], I learned how subtle interface affordances shape user trust and over-reliance—insights that continue to guide how I scope research prototypes.

At [Target University], I want to investigate [Future HCI Research Question 1] and design adaptive interfaces for [Future Context 2]. I am particularly inspired by Prof. [Professor A]’s work on [paper/system] in the [Lab Name] and Prof. [Professor B]’s research on [topic]. My combined experience in full-stack prototyping and empirical user evaluation prepares me to contribute thoughtfully to your HCI community.`,
  },
  {
    id: 'cs-ms-research',
    title: 'MS in Computer Science — Research / Thesis & Industry Pivot',
    track: 'Master’s Research',
    subfield: 'MS / Coursework Track',
    targetLength: '~750–900 words · 1.5 pages',
    tag: 'MS ADMISSIONS',
    summary:
      'Ideal for Master’s applicants (and software engineers pivoting back into graduate school or PhD-prep). Connects technical rigor in engineering or coursework to focused graduate goals.',
    keyTips: [
      'Master’s admissions committees value clear specialization (1–2 tracks) over trying to mention every CS subfield.',
      'If coming from industry, frame production engineering challenges as research questions (scalability, reliability, model drift).',
      'Explain clearly why a Master’s degree—not self-study or another job—is essential for your next step.',
    ],
    structure: [
      {
        step: '01',
        heading: 'Career Trajectory & Specialization Focus (~110 words)',
        guidance:
          'Summarize your academic/professional foundation and the exact graduate specialization you are targeting.',
      },
      {
        step: '02',
        heading: 'Academic & Capstone Technical Depth (~260 words)',
        guidance:
          'Highlight your strongest undergraduate capstone, thesis, or coursework project with measurable engineering/research outcomes.',
      },
      {
        step: '03',
        heading: 'Applied Engineering / Internship Impact (~220 words)',
        guidance:
          'Translate industry or lab experience into problem-solving maturity and identify the theoretical/research gaps motivating your MS.',
      },
      {
        step: '04',
        heading: 'Why This MS Program & Post-MS Goals (~200 words)',
        guidance:
          'Name specific graduate courses, labs, or thesis tracks at the university and connect them to your career trajectory.',
      },
    ],
    prefill: {
      program: 'M.Sc. in Computer Science',
      university: 'Target University',
      interests:
        'Applied machine learning systems, scalable backend architecture, and data-intensive computing',
      background:
        'B.Sc. in Computer Science & Engineering with capstone implementation, internships, and production software delivery',
      why:
        'Rigorous graduate curriculum, thesis research options, and specialized labs matching my technical goals',
      goals:
        'Lead R&D engineering teams or transition into doctoral research in scalable AI systems',
    },
    templateText: `STATEMENT OF PURPOSE

Applicant: [Your Full Name]
Target Program: M.Sc. in Computer Science
Institution: [Target University]

Building [real-world system or capstone project] showed me that the hardest engineering challenges quickly turn into fundamental computer science questions. After completing my [Bachelor’s degree in CSE] at [Your Institution] and working on [key project/role], I am applying to the M.Sc. in Computer Science program at [Target University] to deepen my theoretical foundation and specialize in [Specialization, e.g., AI Systems and Distributed Computing].

During my undergraduate studies, my capstone project focused on [Project Title], where I designed [architecture / algorithm] to solve [problem]. Facing [technical constraint, e.g., high inference latency / noisy data], I evaluated [Approach A vs. Approach B], ultimately implementing [solution] and achieving [measurable metric]. Alongside coursework in [Algorithms, Operating Systems, Databases, Machine Learning], this project taught me how to reason rigorously from first principles before writing code.

Subsequently, as a [Software Engineering Intern / Research Assistant] at [Organization], I worked on [production system or research pipeline]. While optimizing [specific component], I encountered [open technical limitation, e.g., trade-offs between throughput and consistency / model drift under real-world traffic]. Solving these problems at scale convinced me that I need structured graduate-level training in [specific advanced topics] rather than ad-hoc tooling alone.

The M.Sc. program at [Target University] aligns closely with these goals. I am particularly excited to take graduate courses such as [Course 1] and [Course 2], and to explore [thesis / directed research] with faculty such as Prof. [Professor Name] in [Lab/Area]. Upon completing my Master’s degree, I plan to [target career outcome: architect high-reliability AI systems in industry R&D / pursue Ph.D. research].`,
  },
  {
    id: 'sop-industry-pivot',
    title: 'SOP — Non-Traditional / Industry-to-Research Transition',
    track: 'Industry Pivot',
    subfield: 'Industry-to-Grad Pivot',
    targetLength: '~850–950 words · 2 pages',
    tag: 'CAREER PIVOT',
    summary:
      'Modeled on successful CS-SOP profiles from applicants who transitioned from industry engineering or adjacent STEM majors into top CS graduate programs.',
    keyTips: [
      'Own your trajectory positively: explain what unique perspective your prior domain or engineering years bring to CS research.',
      'Provide concrete proof of CS readiness (open-source contributions, independent research papers, self-built systems, or bridge coursework).',
      'Connect past domain experience directly to a compelling future research niche.',
    ],
    structure: [
      {
        step: '01',
        heading: 'Origin Story & Pivot Thesis (~130 words)',
        guidance:
          'Briefly explain your original background and the decisive technical problem that pulled you toward Computer Science research.',
      },
      {
        step: '02',
        heading: 'Proof of CS & Research Readiness (~280 words)',
        guidance:
          'Highlight concrete technical/research work you initiated (independent projects, research collaborations, or quantitative modeling) to bridge into CS.',
      },
      {
        step: '03',
        heading: 'Transferable Strengths from Industry/Adjacent Field (~220 words)',
        guidance:
          'Show how domain expertise or production discipline makes you a sharper researcher than a typical applicant.',
      },
      {
        step: '04',
        heading: 'Program Fit & Long-Term Impact (~220 words)',
        guidance:
          'Connect your interdisciplinary edge to faculty labs at the target department.',
      },
    ],
    prefill: {
      program: 'M.Sc. / Ph.D. in Computer Science',
      university: 'Target University',
      interests:
        'Interdisciplinary computing, applied ML reliability, and domain-specific software systems',
      background:
        'Industry engineering / STEM analytical training paired with independent CS research projects and open-source technical contributions',
      why:
        'Collaborative cross-disciplinary labs welcoming applied engineering maturity alongside formal CS theory',
      goals:
        'Bridge rigorous computer science research with high-stakes real-world domain deployments',
    },
    templateText: `STATEMENT OF PURPOSE

Applicant: [Your Full Name]
Target Program: [M.Sc. / Ph.D.] in Computer Science
Institution: [Target University]

My path to Computer Science began in [Prior Discipline / Industry Role], where I repeatedly encountered [domain bottleneck] that existing off-the-shelf software could not solve. Rather than treating computing merely as an auxiliary tool, I found myself increasingly drawn to the underlying algorithmic and systems questions—motivating my transition into formal graduate research in [Target CS Subfield] at [Target University].

To build a rigorous computer science foundation, I proactively undertook [independent research with Prof. Name / advanced CS coursework in Algorithms, Systems, and ML / open-source systems development]. In [Flagship CS Project], I tackled [specific CS problem] by designing [method or architecture]. Overcoming [technical obstacle] taught me how to formulate formal abstractions, benchmark competing baselines, and validate claims rigorously—demonstrating my readiness for graduate-level CS work.

At the same time, my [X years in industry / background in prior field] gives me a distinct research perspective. Having seen how [models/systems] fail under real-world operational constraints such as [latency, data scarcity, user trust, or regulatory edge cases], I ask research questions grounded in tangible impact while appreciating the discipline of reproducible engineering.

At [Target University], I hope to combine this practical rigor with deep theoretical inquiry in [Target Research Area]. I am especially drawn to Prof. [Professor A]’s research on [topic] and the interdisciplinary work in [Lab Name]. Following graduate study, I aim to advance [long-term research or R&D vision] at the intersection of Computer Science and [domain/impact area].`,
  },
]
