/**
 * Dynamic Academic and Career Document Generator
 * Compiles personalized CVs, SOPs, Personal Statements, and Cover Letters
 */

export function generateDocumentContent(type, details, candidate) {
  const name = details.name || candidate?.name || 'Applicant'
  const email = details.email || 'applicant@email.com'
  const country = details.country || candidate?.country || 'Bangladesh'
  const ielts = details.ielts || '7.5'
  const degree = details.degree || 'Bachelor of Science'
  const university = details.university || 'Target University'
  const program = details.program || details.course || 'Graduate Studies'
  const skills = details.skills || 'Research methodology, critical analysis, project management, technical writing'
  const experience = details.experience || 'Undergraduate academic projects, departmental research, and internships'
  const interests = details.interests || 'Advanced topics in computing, data-driven systems, and emerging technologies'
  const why = details.why || 'The world-class faculty, collaborative research culture, and cutting-edge laboratory infrastructure'
  const goals = details.goals || 'To conduct pioneering research, contribute to international journals, and assume leading industry roles'
  const motivation = details.motivation || 'A long-standing passion for intellectual inquiry and solving practical human challenges'
  const extra = details.extra || 'Active participation in student associations, competitive hackathons, and community mentorship'
  const position = details.position || 'Graduate Research Associate'
  const company = details.company || 'Leading Research Organization'
  const tone = details.tone || 'Formal Academic'

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  switch (type) {
    case 'cv':
      return `CURRICULUM VITAE

${name.toUpperCase()}
Email: ${email} | Location: ${country} | English Proficiency: IELTS Band ${ielts}
Professional Profile: linkedin.com/in/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}

CAREER OBJECTIVE
A focused professional in ${degree}, dedicated to advancing technical excellence, computational research, and innovative problem-solving. Targeting academic and professional opportunities in ${country || 'international environments'} to contribute measurably to high-impact projects.

ACADEMIC BACKGROUND
${degree}
• Status: Academic distinction and rigorous coursework completion
• English Language Competency: IELTS Overall Band ${ielts} (Academic Module)
• Core Focus: Problem solving, analytical rigor, and specialized practical implementation

CORE COMPETENCIES & TECHNICAL SKILLS
• ${skills}

WORK & RESEARCH EXPERIENCE
${experience}
• Spearheaded practical investigations and end-to-end development initiatives.
• Formulated data-driven frameworks, analyzed operational outcomes, and authored technical documentation.
• Collaborated in cross-functional teams to design, test, and deploy resilient solutions.

ACADEMIC PROJECTS & LEADERSHIP
• Led technical deliverables and algorithmic implementations matching core domain requirements.
• Recipient of academic merit awards and competitive project recognition.
• Active contributor to peer workshops, hackathons, and institutional seminars.
• Target Destination: ${details.country || 'International Study & Industry'}

REFERENCES
Available upon request from academic faculty and research supervisors.`

    case 'sop':
      return `STATEMENT OF PURPOSE

Applicant: ${name}
Target Program: ${program}
Institution: ${university}
Date: ${dateStr}

Dear Members of the Admissions Committee,

I am writing to express my earnest enthusiasm for admission to the ${program} at ${university}. Having built a solid intellectual foundation through my ${degree}, I am eager to contribute to your academic community and pursue advanced study that bridges rigorous theory with impactful practical applications.

My academic journey has been defined by an insatiable curiosity regarding ${interests}. Throughout my previous coursework and hands-on endeavors (${experience}), I cultivated a disciplined methodology for problem formulation and empirical verification. Achieving an overall Band ${ielts} in the IELTS exam affirmed my ability to communicate complex concepts fluidly in international academic discourse.

What particularly distinguishes ${university} is ${why}. I have closely examined your department's pioneering initiatives and faculty contributions, which align directly with my aspirations. Working within such a dynamic academic ecosystem will provide the ideal mentorship to expand my research paradigms.

Following the completion of my studies at ${university}, my career objective is ${goals}. I am confident that the rigorous training and collaborative ethos of your institution will empower me to make meaningful contributions to the discipline.

Thank you for your time and consideration of my application. I eagerly look forward to the privilege of studying at ${university}.

Sincerely,

${name}
${email}`

    case 'ps':
      return `PERSONAL STATEMENT

Applicant: ${name}
Target Course: ${program}
Institution: ${university}

The defining catalyst for my academic trajectory was ${motivation}. From an early stage, I became fascinated by how systematic inquiry can uncover solutions to multi-layered problems. This curiosity propelled my dedicated performance during my ${degree}, where I learned that genuine learning requires resilience, critical questioning, and continuous reflection.

Beyond academic milestones, my personal growth has been enriched by diverse activities: ${extra}. These experiences taught me effective teamwork, cross-cultural empathy, and the ability to maintain composure under demanding deadlines. My IELTS score of Band ${ielts} represents not merely language proficiency, but my enthusiasm for engaging with global peers and diverse perspectives.

My determination to study at ${university} stems from ${why}. I am drawn to an environment that challenges conventional thinking and fosters independent intellectual initiative. I am eager to bring my unique background from ${country}, my work ethic, and my dedication to your vibrant student body.

Thank you for considering my personal statement.

${name}`

    case 'cl':
      return `${name}
${email} · ${country}
${dateStr}

Hiring Committee / Admissions Team
${company}

RE: Application for ${position} (${tone} Register)

Dear Hiring Committee,

I am writing to formally submit my candidacy for the position of ${position} at ${company}. Having followed your organization's recent advancements with great admiration, I am eager to bring my background in ${degree} and proven capabilities in ${skills} to your team.

In my recent engagements, ${experience}, I consistently demonstrated an ability to analyze complex challenges, coordinate with stakeholders, and deliver measurable results. Furthermore, my strong communication abilities—evidenced by an IELTS Band ${ielts}—enable me to collaborate effortlessly across multi-disciplinary, international teams.

I am particularly inspired by ${company} because ${why}. I am committed to dedicating my energy and technical acumen to advance your strategic objectives.

Thank you for your time and consideration. I welcome the opportunity to discuss how my qualifications align with your organizational goals in an interview.

Respectfully submitted,

${name}`

    default:
      return `Document generated for ${name} (${type.toUpperCase()}).`
  }
}
