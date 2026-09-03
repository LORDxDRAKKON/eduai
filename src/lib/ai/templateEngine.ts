/**
 * Rule-based educational content engine.
 * Generates structured content from predefined templates — no external AI provider.
 */

// ─── Types ────────────────────────────────────────────────────────────────

export interface LessonOutput {
  title: string;
  content: string;
}

export interface FlashcardOutput {
  front: string;
  back: string;
  example: string;
}

export interface ChallengeOutput {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface CodeReviewOutput {
  review: string;
}

export interface ContentOutput {
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
  questions?: {
    id: string;
    number: number;
    question: string;
    type: 'mcq' | 'short' | 'long';
    options?: string[];
    answer: string;
    hint: string;
  }[];
  scenes?: {
    id: string;
    title: string;
    description: string;
    narration: string;
    imagePrompt: string;
  }[];
}

// ─── Knowledge Base ───────────────────────────────────────────────────────

const SUBJECT_CONCEPTS: Record<string, Record<string, string[]>> = {
  Mathematics: {
    default: ['Number Systems', 'Algebra', 'Geometry', 'Statistics', 'Probability', 'Trigonometry', 'Calculus'],
    concepts: [
      'A variable is a symbol that represents an unknown value.',
      'An equation states that two expressions are equal.',
      'A function maps each input to exactly one output.',
      'The slope of a line measures its steepness.',
      'Area measures the space inside a 2D shape.',
      'Volume measures the space inside a 3D object.',
    ],
  },
  Science: {
    default: ['Physics', 'Chemistry', 'Biology', 'Earth Science', 'Environmental Science'],
    concepts: [
      'Matter is anything that has mass and takes up space.',
      'Energy cannot be created or destroyed, only transformed.',
      'Cells are the basic unit of life.',
      'Forces cause objects to accelerate.',
      'Atoms are the building blocks of matter.',
    ],
  },
  Physics: {
    default: ['Motion', 'Forces', 'Energy', 'Waves', 'Electricity', 'Magnetism', 'Optics'],
    concepts: [
      'Newton\'s First Law: An object remains at rest or in uniform motion unless acted upon by a net force.',
      'Newton\'s Second Law: F = ma (Force equals mass times acceleration).',
      'Newton\'s Third Law: For every action there is an equal and opposite reaction.',
      'Kinetic energy = ½mv²; Potential energy = mgh.',
      'Waves transfer energy without transferring matter.',
    ],
  },
  Chemistry: {
    default: ['Atomic Structure', 'Periodic Table', 'Chemical Bonds', 'Reactions', 'Acids & Bases', 'Organic Chemistry'],
    concepts: [
      'Atoms consist of protons, neutrons, and electrons.',
      'Elements are pure substances made of one type of atom.',
      'Compounds are formed when two or more elements chemically combine.',
      'A chemical reaction involves breaking and forming chemical bonds.',
      'Acids have pH < 7; bases have pH > 7; neutral is pH 7.',
    ],
  },
  Biology: {
    default: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Body', 'Plants'],
    concepts: [
      'DNA carries genetic information in all living organisms.',
      'Photosynthesis converts light energy into chemical energy.',
      'Respiration releases energy from glucose.',
      'Natural selection drives evolution.',
      'Ecosystems consist of living organisms and their environment.',
    ],
  },
  English: {
    default: ['Grammar', 'Literature', 'Writing', 'Reading Comprehension', 'Vocabulary', 'Poetry'],
    concepts: [
      'A noun names a person, place, thing, or idea.',
      'A verb expresses action or state of being.',
      'An adjective modifies a noun.',
      'A simile compares using "like" or "as".',
      'A metaphor makes a direct comparison without "like" or "as".',
    ],
  },
  History: {
    default: ['Ancient Civilizations', 'Medieval Period', 'Modern History', 'World Wars', 'Independence Movements'],
    concepts: [
      'Primary sources are original documents from the time period being studied.',
      'Secondary sources interpret or analyze primary sources.',
      'Cause and effect relationships drive historical events.',
      'Historical context helps us understand why events occurred.',
    ],
  },
  Geography: {
    default: ['Physical Geography', 'Human Geography', 'Climate', 'Maps', 'Natural Resources', 'Population'],
    concepts: [
      'Latitude measures distance north or south of the equator.',
      'Longitude measures distance east or west of the prime meridian.',
      'Climate is the long-term weather pattern of a region.',
      'Natural resources are materials found in nature that humans use.',
    ],
  },
  default: {
    default: ['Introduction', 'Core Concepts', 'Applications', 'Practice'],
    concepts: [
      'Learning involves understanding new concepts and connecting them to prior knowledge.',
      'Practice and repetition strengthen memory and skill.',
      'Critical thinking helps evaluate information and solve problems.',
    ],
  },
};

function getSubjectData(subject: string) {
  return SUBJECT_CONCEPTS[subject] || SUBJECT_CONCEPTS['default'];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function gradeLevel(grade: string): 'primary' | 'middle' | 'secondary' | 'senior' {
  const num = parseInt(grade.replace(/\D/g, ''), 10);
  if (num <= 5) return 'primary';
  if (num <= 8) return 'middle';
  if (num <= 10) return 'secondary';
  return 'senior';
}

// ─── Lesson Generator ─────────────────────────────────────────────────────

export function generateLesson(
  grade: string,
  subject: string,
  topic: string,
  type: string,
  language: string
): string {
  const level = gradeLevel(grade);
  const subjectData = getSubjectData(subject);
  const concepts = subjectData.concepts || SUBJECT_CONCEPTS['default'].concepts;
  const streamInfo = '';

  const templates: Record<string, () => string> = {
    Explanation: () => `
📚 ${topic} — ${subject} (${grade})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 LEARNING OBJECTIVE
By the end of this lesson, students will understand the key concepts of "${topic}" and be able to apply them in ${subject}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 INTRODUCTION
"${topic}" is an important concept in ${subject} for ${grade} students. Understanding this topic builds a strong foundation for further learning.

${level === 'primary' ? 'We will explore this topic using simple examples and fun activities.' : level === 'middle' ? 'We will break this topic into clear steps and connect it to real-world situations.' : 'We will examine this topic in depth, exploring its principles, applications, and connections to other concepts.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 KEY CONCEPTS

1. Definition & Overview
   "${topic}" refers to a fundamental concept in ${subject}. It involves understanding the core principles and how they interact with each other.

2. Core Principles
   • The topic builds on prior knowledge of ${subject}.
   • Key terms and definitions form the foundation.
   • Understanding the "why" helps retain the "how".

3. How It Works
   Step 1: Identify the key elements of "${topic}".
   Step 2: Understand the relationships between these elements.
   Step 3: Apply the concept to solve problems or analyze situations.
   Step 4: Review and verify your understanding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 REAL-WORLD CONNECTION
"${topic}" appears in everyday life. For example, in ${subject}, this concept helps us understand and explain phenomena we observe around us. ${level === 'primary' ? 'Think about how you see this in your daily activities!' : 'Consider how professionals in this field apply these concepts in their work.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ SUMMARY
• "${topic}" is a key concept in ${subject} for ${grade}.
• It involves understanding core principles and their applications.
• Practice and real-world connections strengthen understanding.
• Always connect new learning to what you already know.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 CHECK YOUR UNDERSTANDING
1. What is "${topic}" in your own words?
2. Give one real-world example of "${topic}".
3. How does "${topic}" connect to other things you have learned in ${subject}?
`.trim(),

    Story: () => `
📖 The Story of "${topic}"
A Learning Story for ${grade} — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chapter 1: The Beginning

Once upon a time, in a school not very different from yours, a curious student named Aryan was puzzled by "${topic}" in ${subject} class. "Why do we need to learn this?" Aryan wondered.

His teacher, Ms. Priya, smiled and said, "Let me tell you a story that will make it all clear."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chapter 2: The Discovery

Ms. Priya began: "Imagine you are on an adventure. To complete your quest, you must understand '${topic}'. Without this knowledge, you cannot move forward."

She explained the first key idea: "${topic}" is the foundation of many things we see and use every day in ${subject}. It helps us make sense of the world around us.

Aryan listened carefully. He started to see connections — how "${topic}" appeared in everyday situations he had never noticed before.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chapter 3: The Challenge

But learning "${topic}" was not easy. Aryan faced challenges:
• The concepts seemed abstract at first.
• Some parts required careful thinking.
• Connecting ideas took practice.

Yet with each challenge, Aryan grew stronger. He learned that:
1. Breaking the topic into smaller parts makes it manageable.
2. Asking questions leads to deeper understanding.
3. Practice turns confusion into confidence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chapter 4: The Victory

Finally, Aryan understood "${topic}" completely. He could explain it to his friends, apply it in problems, and see it in the world around him.

"The secret," Ms. Priya revealed, "is that every concept in ${subject} tells a story. When you understand the story, the concept becomes part of you."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 MORAL OF THE STORY
Understanding "${topic}" in ${subject} opens new doors of knowledge. Every concept you learn is a tool that helps you understand the world better.

📝 REFLECT
• What part of "${topic}" did Aryan find most challenging?
• How did breaking the topic into parts help Aryan?
• What is your own "story" of learning "${topic}"?
`.trim(),

    Worksheet: () => `
📝 WORKSHEET: ${topic}
Subject: ${subject} | Grade: ${grade}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: _________________________ Date: _____________
Section: _______________________ Score: _____ / 20

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION A: Fill in the Blanks (1 mark each)

1. "${topic}" is a concept studied in _____________.
2. The main purpose of understanding "${topic}"is _____________. 3. One real-world application of"${topic}"is _____________. 4. A key term related to"${topic}"is _____________. 5."${topic}" connects to _____________ in ${subject}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION B: True or False (1 mark each)

6. "${topic}" is an important concept in ${subject}. ( T / F )
7. Understanding "${topic}" requires no prior knowledge. ( T / F )
8. "${topic}" has real-world applications. ( T / F )
9. Practice helps in mastering "${topic}". ( T / F )
10. "${topic}" is only relevant in academic settings. ( T / F )

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION C: Short Answer (2 marks each)

11. Define "${topic}" in your own words.
    _______________________________________________
    _______________________________________________

12. Give one example of "${topic}" from daily life.
    _______________________________________________
    _______________________________________________

13. Why is "${topic}" important in ${subject}?
    _______________________________________________
    _______________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION D: Long Answer (5 marks)

14. Explain "${topic}" in detail. Include:
    (a) Definition
    (b) Key principles
    (c) A real-world example
    (d) How it connects to other topics in ${subject}

    _______________________________________________
    _______________________________________________
    _______________________________________________
    _______________________________________________
    _______________________________________________
    _______________________________________________
`.trim(),

    Analogy: () => `
🔗 Understanding "${topic}" Through Analogies
${subject} | ${grade}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHY ANALOGIES WORK
Our brain learns new things by connecting them to what we already know. Analogies create bridges between familiar ideas and new concepts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏠 ANALOGY 1: The Building Blocks
"${topic}" is like building a house.
• Just as a house needs a strong foundation, "${topic}" requires understanding the basics first.
• Each floor of the house represents a deeper level of understanding.
• The roof — your complete understanding — can only be placed when all floors are ready.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌊 ANALOGY 2: The River
Think of "${topic}" as a river.
• The source is the basic definition and introduction.
• Tributaries are the related concepts that feed into the main idea.
• The river mouth is where your understanding flows into practical application.
• Just as a river shapes the land, "${topic}" shapes your understanding of ${subject}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧩 ANALOGY 3: The Puzzle
"${topic}" is like completing a jigsaw puzzle.
• Each piece of knowledge is a puzzle piece.
• Some pieces are easy to place; others require more thought.
• When all pieces fit together, the complete picture of "${topic}" becomes clear.
• Missing even one piece leaves the picture incomplete.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 CONNECTING THE ANALOGIES
All three analogies show us that:
1. "${topic}" has a structure that builds progressively.
2. Each part connects to the others.
3. The goal is a complete, unified understanding.
4. The process takes time and practice.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✏️ CREATE YOUR OWN ANALOGY
Now it's your turn! Think of something familiar to you and create an analogy for "${topic}":

My analogy: "${topic}" is like _____________ because _____________
`.trim(),

    'Q&A': () => `
❓ Q&A: "${topic}"
Subject: ${subject} | Grade: ${grade}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FREQUENTLY ASKED QUESTIONS

Q1: What exactly is "${topic}"?
A: "${topic}" is a fundamental concept in ${subject} that ${grade} students study. It involves understanding key principles and their relationships. At its core, it helps us explain and predict phenomena in ${subject}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q2: Why do we need to learn "${topic}"?
A: Learning "${topic}" is important because:
   • It builds a foundation for advanced topics in ${subject}.
   • It develops critical thinking and problem-solving skills.
   • It has practical applications in real life and future careers.
   • It connects to many other concepts you will study.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q3: How is "${topic}" used in real life?
A: "${topic}" appears in many real-world situations:
   • In everyday problem-solving and decision-making.
   • In professional fields related to ${subject}.
   • In understanding natural phenomena and human-made systems.
   • In technology, science, and social contexts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q4: What are the most important things to remember about "${topic}"?
A: The key points are:
   1. Understand the definition and core principles.
   2. Know the key terms and their meanings.
   3. Be able to apply the concept to solve problems.
   4. Connect "${topic}" to other concepts in ${subject}.
   5. Practice regularly to strengthen understanding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q5: What mistakes do students commonly make with "${topic}"?
A: Common mistakes include:
   • Memorising without understanding.
   • Skipping foundational concepts.
   • Not practising enough problems.
   • Failing to connect the concept to real-world examples.
   • Not asking questions when confused.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q6: How can I master "${topic}"?
A: To master "${topic}":
   ✓ Read and understand the definition carefully.
   ✓ Study worked examples step by step.
   ✓ Practice problems of increasing difficulty.
   ✓ Teach the concept to someone else.
   ✓ Review regularly and test yourself.
`.trim(),

    Summary: () => `
📋 QUICK SUMMARY: "${topic}"
${subject} | ${grade}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ ONE-LINE DEFINITION
"${topic}" is a key concept in ${subject} that involves understanding core principles and their applications in real-world contexts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 KEY POINTS (Remember These!)

✅ Point 1: "${topic}" has a clear definition and scope within ${subject}.
✅ Point 2: It involves specific principles that can be learned step by step.
✅ Point 3: Real-world applications make it relevant and useful.
✅ Point 4: It connects to other topics in ${subject} and beyond.
✅ Point 5: Regular practice leads to mastery.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 AT A GLANCE

| Aspect         | Details                          |
|----------------|----------------------------------|
| Topic          | ${topic}                         |
| Subject        | ${subject}                       |
| Grade Level    | ${grade}                         |
| Difficulty     | ${level === 'primary' ? 'Beginner' : level === 'middle' ? 'Intermediate' : 'Advanced'} |
| Key Skill      | Understanding & Application      |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ COMMON MISTAKES TO AVOID
• Do not skip the basics — build understanding step by step.
• Do not just memorise — understand the "why" behind each concept.
• Do not ignore practice — apply what you learn.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 EXAM TIPS
• Know the definition of "${topic}" by heart.
• Be ready to give examples.
• Understand how to apply the concept in problems.
• Connect it to related topics in ${subject}.
`.trim(),
  };

  const generator = templates[type] || templates['Explanation'];
  return generator();
}

// ─── Flashcard Generator ──────────────────────────────────────────────────

const FLASHCARD_BANKS: Record<string, FlashcardOutput[]> = {
  Mathematics: [
    { front: 'What is the quadratic formula?', back: 'x = (−b ± √(b²−4ac)) / 2a', example: 'Solve: x² + 5x + 6 = 0' },
    { front: 'What is the Pythagorean theorem?', back: 'a² + b² = c², where c is the hypotenuse of a right triangle', example: 'Find the hypotenuse if a=3, b=4' },
    { front: 'What is the area of a circle?', back: 'A = πr², where r is the radius', example: 'Find the area of a circle with radius 7 cm' },
    { front: 'What is the slope formula?', back: 'm = (y₂ − y₁) / (x₂ − x₁)', example: 'Find the slope between (2,3) and (5,9)' },
    { front: 'What is the sum of angles in a triangle?', back: '180 degrees', example: 'If two angles are 60° and 80°, find the third' },
    { front: 'What is the formula for simple interest?', back: 'SI = (P × R × T) / 100', example: 'Find SI for P=1000, R=5%, T=2 years' },
  ],
  Science: [
    { front: 'What is Newton\'s First Law?', back: 'An object at rest stays at rest; an object in motion stays in motion unless acted upon by an external force', example: 'Why does a ball keep rolling on a frictionless surface?' },
    { front: 'What is photosynthesis?', back: '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂', example: 'Why do plants need sunlight to survive?' },
    { front: 'What is the speed of light?', back: 'Approximately 3 × 10⁸ m/s in a vacuum', example: 'How long does light take to travel 300,000 km?' },
    { front: 'What is an atom?', back: 'The smallest unit of an element that retains its chemical properties', example: 'How many atoms are in a water molecule?' },
    { front: 'What is the law of conservation of energy?', back: 'Energy cannot be created or destroyed, only transformed from one form to another', example: 'What happens to kinetic energy when a ball hits the ground?' },
    { front: 'What is DNA?', back: 'Deoxyribonucleic acid — the molecule that carries genetic information in all living organisms', example: 'Why do children resemble their parents?' },
  ],
  Physics: [
    { front: 'What is Newton\'s Second Law?', back: 'F = ma (Force = mass × acceleration)', example: 'Find force if mass=5 kg and acceleration=3 m/s²' },
    { front: 'What is kinetic energy?', back: 'KE = ½mv² (half × mass × velocity squared)', example: 'Find KE of a 2 kg object moving at 4 m/s' },
    { front: 'What is Ohm\'s Law?', back: 'V = IR (Voltage = Current × Resistance)', example: 'Find current if V=12V and R=4Ω' },
    { front: 'What is the formula for gravitational potential energy?', back: 'PE = mgh (mass × gravity × height)', example: 'Find PE of a 3 kg object at height 10 m' },
    { front: 'What is the speed formula?', back: 'Speed = Distance / Time', example: 'Find speed if distance=100 m and time=20 s' },
    { front: 'What is the frequency of a wave?', back: 'f = 1/T, where T is the time period', example: 'Find frequency if time period = 0.5 s' },
  ],
  Chemistry: [
    { front: 'What is the atomic number?', back: 'The number of protons in the nucleus of an atom', example: 'What is the atomic number of Carbon?' },
    { front: 'What is a chemical bond?', back: 'A force of attraction that holds atoms together in a compound', example: 'What type of bond forms in NaCl?' },
    { front: 'What is pH?', back: 'A scale from 0-14 measuring acidity/alkalinity; 7 is neutral, <7 is acidic, >7 is basic', example: 'Is lemon juice acidic or basic?' },
    { front: 'What is the mole?', back: 'A unit representing 6.022 × 10²³ particles (Avogadro\'s number)', example: 'How many atoms are in 1 mole of Carbon?' },
    { front: 'What is an exothermic reaction?', back: 'A reaction that releases heat energy to the surroundings', example: 'Is burning wood exothermic or endothermic?' },
    { front: 'What is valency?', back: 'The combining capacity of an element, determined by the number of electrons in the outermost shell', example: 'What is the valency of Oxygen?' },
  ],
  Biology: [
    { front: 'What is osmosis?', back: 'The movement of water molecules from a region of high concentration to low concentration through a semi-permeable membrane', example: 'Why do cells shrink in salt water?' },
    { front: 'What is mitosis?', back: 'Cell division that produces two identical daughter cells with the same number of chromosomes as the parent cell', example: 'How does a wound heal?' },
    { front: 'What is the function of the mitochondria?', back: 'The powerhouse of the cell — produces ATP (energy) through cellular respiration', example: 'Why do muscle cells have more mitochondria?' },
    { front: 'What is natural selection?', back: 'The process by which organisms with favourable traits survive and reproduce more successfully', example: 'Why are polar bears white?' },
    { front: 'What is a food chain?', back: 'A sequence showing how energy is transferred from one organism to another through feeding', example: 'Grass → Grasshopper → Frog → Snake → Eagle' },
    { front: 'What is the function of chlorophyll?', back: 'The green pigment in plants that absorbs light energy for photosynthesis', example: 'Why are leaves green?' },
  ],
  English: [
    { front: 'What is a metaphor?', back: 'A figure of speech that directly compares two unlike things without using "like" or "as"', example: '"Life is a journey" — identify the metaphor' },
    { front: 'What is a simile?', back: 'A comparison using "like" or "as"', example: '"She is as brave as a lion" — identify the simile' },
    { front: 'What is an adjective?', back: 'A word that describes or modifies a noun', example: 'Identify the adjective: "The tall building"' },
    { front: 'What is a conjunction?', back: 'A word that connects words, phrases, or clauses (e.g., and, but, or, because)', example: 'Use "although" in a sentence' },
    { front: 'What is alliteration?', back: 'The repetition of the same consonant sound at the beginning of nearby words', example: '"Peter Piper picked a peck" — identify the alliteration' },
    { front: 'What is a protagonist?', back: 'The main character of a story, often the hero or central figure', example: 'Who is the protagonist in "Harry Potter"?' },
  ],
  History: [
    { front: 'What was the Industrial Revolution?', back: 'A period of major industrialisation (c.1760–1840) that transformed manufacturing and society, beginning in Britain', example: 'How did the Industrial Revolution change working conditions?' },
    { front: 'When did World War I begin?', back: '1914, triggered by the assassination of Archduke Franz Ferdinand', example: 'What were the main causes of WWI?' },
    { front: 'What was the Renaissance?', back: 'A cultural and intellectual movement in Europe (14th–17th century) that revived interest in classical art, science, and philosophy', example: 'Name two famous Renaissance artists' },
    { front: 'When did India gain independence?', back: '15 August 1947', example: 'Who led India\'s independence movement?' },
    { front: 'What was the Cold War?', back: 'A period of geopolitical tension (1947–1991) between the USA and USSR, characterised by proxy wars and an arms race', example: 'What was the Berlin Wall?' },
    { front: 'What was the French Revolution?', back: 'A period of radical political change in France (1789–1799) that overthrew the monarchy and established a republic', example: 'What were the three ideals of the French Revolution?' },
  ],
  Geography: [
    { front: 'What is latitude?', back: 'The angular distance north or south of the equator, measured in degrees', example: 'What is the latitude of the equator?' },
    { front: 'What is the largest ocean?', back: 'The Pacific Ocean, covering about 165 million km²', example: 'Which continents border the Pacific Ocean?' },
    { front: 'What is a delta?', back: 'A landform created by sediment deposited at the mouth of a river', example: 'Name a famous river delta in India' },
    { front: 'What is the greenhouse effect?', back: 'The trapping of heat in Earth\'s atmosphere by greenhouse gases, warming the planet', example: 'How does the greenhouse effect cause climate change?' },
    { front: 'What is a monsoon?', back: 'A seasonal wind pattern that brings heavy rainfall, especially in South and Southeast Asia', example: 'How does the monsoon affect Indian agriculture?' },
    { front: 'What is urbanisation?', back: 'The process by which more people move from rural areas to cities', example: 'What are the effects of rapid urbanisation?' },
  ],
};

export function generateFlashcards(subject: string, topic: string): FlashcardOutput[] {
  const bank = FLASHCARD_BANKS[subject] || FLASHCARD_BANKS['Mathematics'];
  // Return all 6 cards from the bank, customised with topic if needed
  return bank.map((card, i) => ({
    ...card,
    example: i === 0 ? `Related to "${topic}": ${card.example}` : card.example,
  }));
}

// ─── Challenge Generator ──────────────────────────────────────────────────

const CHALLENGE_BANKS: Record<string, Record<string, ChallengeOutput[]>> = {
  Mathematics: {
    Easy: [
      { question: 'What is 15% of 200?', options: ['25', '30', '35', '40'], answer: '30', explanation: '15% of 200 = (15/100) × 200 = 30' },
      { question: 'What is the area of a rectangle with length 8 cm and width 5 cm?', options: ['13 cm²', '26 cm²', '40 cm²', '45 cm²'], answer: '40 cm²', explanation: 'Area = length × width = 8 × 5 = 40 cm²' },
      { question: 'Solve: 3x = 18. What is x?', options: ['3', '6', '9', '15'], answer: '6', explanation: 'x = 18 ÷ 3 = 6' },
      { question: 'What is the perimeter of a square with side 7 cm?', options: ['14 cm', '21 cm', '28 cm', '49 cm'], answer: '28 cm', explanation: 'Perimeter = 4 × side = 4 × 7 = 28 cm' },
      { question: 'What is the LCM of 4 and 6?', options: ['8', '10', '12', '24'], answer: '12', explanation: 'Multiples of 4: 4,8,12… Multiples of 6: 6,12… LCM = 12' },
    ],
    Medium: [
      { question: 'If a train travels 360 km in 4 hours, what is its speed?', options: ['80 km/h', '90 km/h', '100 km/h', '120 km/h'], answer: '90 km/h', explanation: 'Speed = Distance/Time = 360/4 = 90 km/h' },
      { question: 'What is the value of x in: 2x + 7 = 19?', options: ['4', '5', '6', '7'], answer: '6', explanation: '2x = 19 - 7 = 12, so x = 6' },
      { question: 'A circle has radius 7 cm. What is its area? (π ≈ 22/7)', options: ['44 cm²', '88 cm²', '154 cm²', '176 cm²'], answer: '154 cm²', explanation: 'Area = πr² = (22/7) × 7² = 22 × 7 = 154 cm²' },
      { question: 'What is the HCF of 36 and 48?', options: ['6', '9', '12', '18'], answer: '12', explanation: 'Factors of 36: 1,2,3,4,6,9,12,18,36. Factors of 48: 1,2,3,4,6,8,12,16,24,48. HCF = 12' },
      { question: 'If the ratio of boys to girls is 3:2 and there are 30 boys, how many girls are there?', options: ['15', '18', '20', '25'], answer: '20', explanation: 'If 3 parts = 30, then 1 part = 10. Girls = 2 parts = 20' },
    ],
    Hard: [
      { question: 'Solve the quadratic equation: x² - 5x + 6 = 0', options: ['x = 2, 3', 'x = -2, -3', 'x = 1, 6', 'x = -1, -6'], answer: 'x = 2, 3', explanation: 'Factor: (x-2)(x-3) = 0, so x = 2 or x = 3' },
      { question: 'What is the sum of the first 10 terms of an AP: 2, 5, 8, 11…?', options: ['145', '155', '165', '175'], answer: '155', explanation: 'a=2, d=3, n=10. Sn = n/2[2a+(n-1)d] = 10/2[4+27] = 5×31 = 155' },
      { question: 'If sin θ = 3/5, what is cos θ?', options: ['3/4', '4/5', '5/3', '4/3'], answer: '4/5', explanation: 'Using Pythagoras: cos θ = √(1 - sin²θ) = √(1 - 9/25) = √(16/25) = 4/5' },
      { question: 'A shopkeeper marks an item 25% above cost and gives 10% discount. What is the profit %?', options: ['10%', '12.5%', '15%', '17.5%'], answer: '12.5%', explanation: 'Let CP=100. MP=125. SP=125×0.9=112.5. Profit%=12.5%' },
      { question: 'What is the probability of getting a sum of 7 when two dice are rolled?', options: ['1/6', '5/36', '6/36', '7/36'], answer: '6/36', explanation: 'Favourable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. Total = 36. P = 6/36 = 1/6' },
    ],
  },
  Science: {
    Easy: [
      { question: 'Which gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], answer: 'Carbon Dioxide', explanation: 'Plants absorb CO₂ and release O₂ during photosynthesis.' },
      { question: 'What is the unit of force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], answer: 'Newton', explanation: 'Force is measured in Newtons (N), named after Sir Isaac Newton.' },
      { question: 'How many bones are in the adult human body?', options: ['196', '206', '216', '226'], answer: '206', explanation: 'An adult human body has 206 bones.' },
      { question: 'What is the chemical formula for water?', options: ['H₂O₂', 'HO', 'H₂O', 'H₃O'], answer: 'H₂O', explanation: 'Water consists of 2 hydrogen atoms and 1 oxygen atom: H₂O.' },
      { question: 'Which planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mars', 'Mercury'], answer: 'Mercury', explanation: 'Mercury is the closest planet to the Sun in our solar system.' },
    ],
    Medium: [
      { question: 'What is the process by which a solid changes directly to a gas?', options: ['Evaporation', 'Condensation', 'Sublimation', 'Melting'], answer: 'Sublimation', explanation: 'Sublimation is the direct transition from solid to gas without passing through the liquid state.' },
      { question: 'Which part of the cell controls its activities?', options: ['Cell wall', 'Cytoplasm', 'Nucleus', 'Mitochondria'], answer: 'Nucleus', explanation: 'The nucleus is the control centre of the cell, containing DNA.' },
      { question: 'What is the SI unit of electric current?', options: ['Volt', 'Watt', 'Ohm', 'Ampere'], answer: 'Ampere', explanation: 'Electric current is measured in Amperes (A).' },
      { question: 'Which type of rock is formed from cooled magma?', options: ['Sedimentary', 'Metamorphic', 'Igneous', 'Limestone'], answer: 'Igneous', explanation: 'Igneous rocks form when magma or lava cools and solidifies.' },
      { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Chloroplast'], answer: 'Mitochondria', explanation: 'Mitochondria produce ATP (energy) through cellular respiration.' },
    ],
    Hard: [
      { question: 'What is the pH of a neutral solution at 25°C?', options: ['0', '5', '7', '14'], answer: '7', explanation: 'A neutral solution has pH = 7 at 25°C. Acids have pH < 7 and bases have pH > 7.' },
      { question: 'Which law states that the pressure of a gas is inversely proportional to its volume at constant temperature?', options: ['Charles\'s Law', 'Boyle\'s Law', 'Avogadro\'s Law', 'Gay-Lussac\'s Law'], answer: 'Boyle\'s Law', explanation: 'Boyle\'s Law: P ∝ 1/V at constant temperature, so PV = constant.' },
      { question: 'What is the process of cell division that produces gametes?', options: ['Mitosis', 'Meiosis', 'Binary Fission', 'Budding'], answer: 'Meiosis', explanation: 'Meiosis produces gametes (sex cells) with half the normal chromosome number.' },
      { question: 'Which electromagnetic radiation has the highest frequency?', options: ['Radio waves', 'Visible light', 'X-rays', 'Gamma rays'], answer: 'Gamma rays', explanation: 'Gamma rays have the highest frequency and energy in the electromagnetic spectrum.' },
      { question: 'What is the chemical formula for glucose?', options: ['C₆H₁₂O₆', 'C₁₂H₂₂O₁₁', 'CH₄', 'C₂H₅OH'], answer: 'C₆H₁₂O₆', explanation: 'Glucose has the molecular formula C₆H₁₂O₆.' },
    ],
  },
};

function getChallengeFallback(difficulty: string): ChallengeOutput[] {
  return [
    { question: `Which of the following best describes a key principle of the topic?`, options: ['It is always constant', 'It varies with context', 'It has no real-world application', 'It was discovered recently'], answer: 'It varies with context', explanation: 'Most concepts in education vary with context and application.' },
    { question: 'What is the best approach to understanding a new concept?', options: ['Memorise without understanding', 'Skip examples', 'Build on prior knowledge', 'Avoid practice'], answer: 'Build on prior knowledge', explanation: 'Learning is most effective when new concepts connect to existing knowledge.' },
    { question: 'Which skill is most important for academic success?', options: ['Memorisation only', 'Critical thinking', 'Avoiding questions', 'Copying notes'], answer: 'Critical thinking', explanation: 'Critical thinking allows students to analyse, evaluate, and apply knowledge effectively.' },
    { question: 'What does "primary source" mean in academic research?', options: ['A textbook summary', 'An original document or first-hand account', 'A teacher\'s notes', 'A Wikipedia article'], answer: 'An original document or first-hand account', explanation: 'Primary sources are original materials from the time period being studied.' },
    { question: 'Which of the following is an example of applying knowledge?', options: ['Reading a definition', 'Solving a problem using a formula', 'Highlighting text', 'Watching a video'], answer: 'Solving a problem using a formula', explanation: 'Application involves using knowledge to solve new problems or situations.' },
  ];
}

export function generateChallenges(subject: string, difficulty: string): ChallengeOutput[] {
  const subjectBank = CHALLENGE_BANKS[subject];
  if (!subjectBank) return getChallengeFallback(difficulty);
  return subjectBank[difficulty] || subjectBank['Medium'] || getChallengeFallback(difficulty);
}

// ─── Code Review Generator ────────────────────────────────────────────────

export function generateCodeReview(language: string, code: string): string {
  const lines = code.split('\n').length;
  const hasFunction = /function|def |=>|fun |void |public |private /.test(code);
  const hasLoop = /for|while|forEach|map|filter/.test(code);
  const hasCondition = /if|else|switch|case|ternary|\?/.test(code);
  const hasComment = /\/\/|#|\/\*|"""/.test(code);
  const hasVariable = /const|let|var|val|int|string|float|double/.test(code);

  const issues: string[] = [];
  const positives: string[] = [];
  const suggestions: string[] = [];

  if (hasFunction) positives.push('✅ Functions are used to organise code into reusable blocks — good practice.');
  if (hasLoop) positives.push('✅ Loops are used effectively to iterate over data.');
  if (hasCondition) positives.push('✅ Conditional logic is present to handle different cases.');
  if (hasComment) positives.push('✅ Code comments are present — this improves readability.');
  if (hasVariable) positives.push('✅ Variables are declared to store and manage data.');

  if (!hasComment) issues.push('⚠️ No comments found. Add comments to explain complex logic.');
  if (lines > 50) issues.push('⚠️ The code is quite long. Consider breaking it into smaller functions.');
  if (lines < 3) issues.push('⚠️ Very short code snippet. Make sure the logic is complete.');

  suggestions.push(`💡 For ${language}: Follow naming conventions (camelCase for variables in JS/TS, snake_case in Python).`);
  suggestions.push('💡 Consider adding error handling (try/catch or if-checks) for robustness.');
  suggestions.push('💡 Test your code with edge cases (empty input, null values, large numbers).');
  suggestions.push('💡 Keep functions small and focused — each function should do one thing well.');

  return `
🔍 CODE REVIEW — ${language}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 CODE ANALYSIS
• Language: ${language}
• Lines of code: ${lines}
• Has functions: ${hasFunction ? 'Yes' : 'No'}
• Has loops: ${hasLoop ? 'Yes' : 'No'}
• Has conditionals: ${hasCondition ? 'Yes' : 'No'}
• Has comments: ${hasComment ? 'Yes' : 'No'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👍 WHAT'S GOOD
${positives.length > 0 ? positives.join('\n') : '• Code structure is present. Continue building on this foundation.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ AREAS TO IMPROVE
${issues.length > 0 ? issues.join('\n') : '• No major issues detected in the code structure.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 SUGGESTIONS
${suggestions.join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 BEST PRACTICES FOR ${language.toUpperCase()}
${getBestPractices(language)}
`.trim();
}

function getBestPractices(language: string): string {
  const practices: Record<string, string> = {
    JavaScript: '• Use const/let instead of var\n• Use === instead of ==\n• Handle promises with async/await\n• Avoid global variables',
    TypeScript: '• Always define types for variables and function parameters\n• Use interfaces for object shapes\n• Enable strict mode in tsconfig\n• Avoid using "any" type',
    Python: '• Follow PEP 8 style guide\n• Use list comprehensions where appropriate\n• Handle exceptions with try/except\n• Use meaningful variable names',
    Java: '• Follow camelCase for methods and variables\n• Use PascalCase for class names\n• Always handle exceptions\n• Use access modifiers (public/private/protected)',
    'C++': '• Use references instead of pointers where possible\n• Always initialise variables\n• Use RAII for resource management\n• Prefer standard library algorithms',
    HTML: '• Use semantic HTML elements (header, nav, main, footer)\n• Always include alt text for images\n• Use proper heading hierarchy (h1 → h2 → h3)\n• Validate your HTML',
    CSS: '• Use CSS variables for colours and spacing\n• Prefer flexbox/grid over floats\n• Use meaningful class names (BEM methodology)\n• Minimise specificity conflicts',
    SQL: '• Use meaningful table and column names\n• Always use WHERE clauses to avoid full table scans\n• Use indexes on frequently queried columns\n• Avoid SELECT * in production code',
  };
  return practices[language] || '• Write clean, readable code\n• Follow language conventions\n• Add meaningful comments\n• Test your code thoroughly';
}

// ─── Content Generator (for content-generation-screen) ───────────────────

export function generateContent(
  type: string,
  grade: string,
  subject: string,
  topic: string,
  language: string
): ContentOutput {
  const title = `${capitalize(type)}: ${topic}`;
  const summary = `A ${type} on "${topic}" for ${grade} students in ${subject}.`;

  if (type === 'story') {
    return {
      title,
      summary,
      sections: [
        {
          heading: 'Introduction',
          body: `Once upon a time, a curious student named Aryan was learning about "${topic}" in ${subject} class. His teacher began with a fascinating story that made the concept come alive.\n\nThe story of "${topic}" begins with understanding its basic principles. In ${grade}, students explore this concept to build a strong foundation for future learning.`,
        },
        {
          heading: 'The Discovery',
          body: `As Aryan delved deeper into "${topic}", he discovered that it was connected to many things he already knew. The concept had real-world applications that he had never noticed before.\n\nHis teacher explained: "Every concept in ${subject} tells a story. When you understand the story, the concept becomes part of you."`,
        },
        {
          heading: 'The Challenge',
          body: `Learning "${topic}" was not without challenges. Aryan had to break the concept into smaller parts, understand each piece, and then put them together.\n\nHe learned that patience and practice were the keys to mastery. Step by step, the concept became clearer.`,
        },
        {
          heading: 'The Lesson',
          body: `By the end of his journey, Aryan understood "${topic}" completely. He could explain it to his friends, apply it in problems, and see it in the world around him.\n\nThe lesson was clear: understanding "${topic}" in ${subject} opens new doors of knowledge and helps us make sense of the world.`,
        },
        {
          heading: 'Conclusion',
          body: `"${topic}" is more than just a concept in ${subject} — it is a tool for understanding the world. For ${grade} students, mastering this topic builds confidence and prepares them for more advanced learning.\n\nRemember: every great journey begins with a single step. Your journey with "${topic}" starts here.`,
        },
      ],
    };
  }

  if (type === 'worksheet') {
    return {
      title,
      summary,
      sections: [
        {
          heading: 'Instructions',
          body: `This worksheet covers "${topic}" in ${subject} for ${grade} students. Answer all questions carefully. Show your working where required.`,
        },
        {
          heading: 'Key Concepts to Review',
          body: `Before attempting the questions, review the following:\n• Definition of "${topic}"\n• Key terms and their meanings\n• Important formulas or rules\n• Real-world examples`,
        },
      ],
      questions: [
        { id: 'q1', number: 1, question: `Define "${topic}" in your own words.`, type: 'short', answer: `"${topic}" is a fundamental concept in ${subject} that involves understanding core principles and their applications.`, hint: 'Think about what you learned in class.' },
        { id: 'q2', number: 2, question: `Which of the following best describes "${topic}"?`, type: 'mcq', options: [`A core concept in ${subject}`, 'An unrelated idea', 'A historical event', 'A mathematical formula only'], answer: `A core concept in ${subject}`, hint: 'Consider the definition.' },
        { id: 'q3', number: 3, question: `Give one real-world example of "${topic}".`, type: 'short', answer: `"${topic}" can be observed in everyday situations related to ${subject}.`, hint: 'Think about where you see this in daily life.' },
        { id: 'q4', number: 4, question: `True or False: "${topic}" has no practical applications.`, type: 'mcq', options: ['True', 'False', 'Sometimes true', 'Cannot be determined'], answer: 'False', hint: 'Think about real-world uses.' },
        { id: 'q5', number: 5, question: `How does "${topic}" connect to other concepts in ${subject}?`, type: 'short', answer: `"${topic}" builds on foundational knowledge and connects to advanced topics in ${subject}.`, hint: 'Think about what you learned before this topic.' },
        { id: 'q6', number: 6, question: `What is the most important principle of "${topic}"?`, type: 'mcq', options: ['Understanding the definition', 'Memorising without context', 'Ignoring examples', 'Avoiding practice'], answer: 'Understanding the definition', hint: 'The foundation of any concept is its definition.' },
        { id: 'q7', number: 7, question: `Explain "${topic}" as if you were teaching it to a younger student.`, type: 'long', answer: `A good explanation of "${topic}" would include a simple definition, a relatable example, and a clear explanation of why it matters.`, hint: 'Use simple language and a real-world example.' },
        { id: 'q8', number: 8, question: `What challenges might students face when learning "${topic}"?`, type: 'short', answer: 'Common challenges include understanding abstract concepts, connecting theory to practice, and remembering key terms.', hint: 'Think about what was difficult for you.' },
      ],
    };
  }

  if (type === 'problem') {
    return {
      title,
      summary,
      sections: [
        {
          heading: 'Problem Set Overview',
          body: `This problem set focuses on "${topic}" in ${subject} for ${grade} students. Work through each problem carefully, showing all steps.`,
        },
        {
          heading: 'Concept Review',
          body: `Key concepts for this problem set:\n• "${topic}" involves understanding core principles.\n• Apply definitions and formulas systematically.\n• Check your answers by substituting back.\n• Look for patterns and connections.`,
        },
      ],
      questions: [
        { id: 'p1', number: 1, question: `Identify the key components of "${topic}" and explain each one.`, type: 'short', answer: 'The key components include the definition, principles, and applications.', hint: 'Break the topic into its main parts.' },
        { id: 'p2', number: 2, question: `Apply the concept of "${topic}" to solve a real-world problem.`, type: 'long', answer: 'A real-world application would involve identifying the relevant principles and applying them systematically.', hint: 'Choose a familiar context.' },
        { id: 'p3', number: 3, question: `Which approach is most effective for understanding "${topic}"?`, type: 'mcq', options: ['Step-by-step analysis', 'Random guessing', 'Skipping examples', 'Memorising only'], answer: 'Step-by-step analysis', hint: 'Think about systematic problem-solving.' },
        { id: 'p4', number: 4, question: `Compare "${topic}" with a related concept in ${subject}.`, type: 'long', answer: 'A comparison would highlight similarities, differences, and how the concepts complement each other.', hint: 'Think about what you studied before this topic.' },
        { id: 'p5', number: 5, question: `What is the significance of "${topic}" in ${subject}?`, type: 'short', answer: `"${topic}" is significant because it forms the foundation for advanced concepts and has practical applications.`, hint: 'Think about why this topic is taught.' },
        { id: 'p6', number: 6, question: `Describe a scenario where "${topic}" would be applied.`, type: 'long', answer: 'A scenario would involve a real-world situation where the principles of the topic are used to solve a problem.', hint: 'Think of a practical situation.' },
        { id: 'p7', number: 7, question: `Which of the following is NOT related to "${topic}"?`, type: 'mcq', options: [`Core principles of ${subject}`, 'Unrelated historical events', 'Real-world applications', 'Key definitions'], answer: 'Unrelated historical events', hint: 'Focus on what is directly related to the topic.' },
        { id: 'p8', number: 8, question: `Summarise "${topic}" in three key points.`, type: 'short', answer: '1. Definition and scope. 2. Core principles. 3. Real-world applications.', hint: 'Focus on the most important aspects.' },
      ],
    };
  }

  // video
  return {
    title,
    summary,
    sections: [
      {
        heading: 'Video Overview',
        body: `This video lesson covers "${topic}" in ${subject} for ${grade} students. The lesson is divided into clear segments for easy understanding.`,
      },
      {
        heading: 'Learning Objectives',
        body: `After watching this video, students will be able to:\n• Define "${topic}" clearly\n• Explain the key principles\n• Apply the concept to real-world situations\n• Connect it to other topics in ${subject}`,
      },
    ],
    scenes: [
      { id: 's1', title: 'Introduction', description: `Opening scene introducing "${topic}"`, narration: `Welcome to today's lesson on "${topic}" in ${subject}. This is an important concept for ${grade} students that will help you understand the world around you.`, imagePrompt: `Educational classroom setting with a teacher introducing "${topic}" on a whiteboard` },
      { id: 's2', title: 'Definition & Background', description: 'Explaining what the topic is', narration: `Let's start with the definition. "${topic}" refers to a fundamental concept in ${subject}. Understanding this definition is the first step to mastery.`, imagePrompt: `Clear diagram showing the definition and key terms of "${topic}" with visual labels` },
      { id: 's3', title: 'Core Principles', description: 'Breaking down the main ideas', narration: `Now let's explore the core principles. Every concept has building blocks, and "${topic}" is no different. We'll break it down step by step.`, imagePrompt: `Step-by-step visual breakdown of the core principles of "${topic}" with numbered steps` },
      { id: 's4', title: 'Real-World Application', description: 'Connecting to everyday life', narration: `Here's where it gets exciting — "${topic}" appears in real life! Let's look at some examples that show how this concept works outside the classroom.`, imagePrompt: `Real-world scenario showing "${topic}" in action, with clear visual connections to the concept` },
      { id: 's5', title: 'Practice & Review', description: 'Reinforcing the learning', narration: `Let's review what we've learned. "${topic}" is a key concept in ${subject} that involves understanding core principles and applying them in real situations.`, imagePrompt: `Summary slide with key points about "${topic}" displayed clearly with icons and bullet points` },
    ],
  };
}

// ─── AI Tutor Response ────────────────────────────────────────────────────

export function generateTutorResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  // Check offline QA bank first
  const OFFLINE_QA = [
    { q: 'quadratic formula', a: 'The quadratic formula is: x = (−b ± √(b²−4ac)) / 2a. Use it to solve equations of the form ax² + bx + c = 0.' },
    { q: 'area of a circle', a: 'The area of a circle = πr², where r is the radius. For example, if r = 7 cm, area = π × 49 ≈ 154 cm².' },
    { q: 'pythagorean theorem', a: 'The Pythagorean theorem states: a² + b² = c², where c is the hypotenuse of a right triangle.' },
    { q: 'photosynthesis', a: 'Photosynthesis is the process by which plants use sunlight, water, and CO₂ to produce glucose and oxygen: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.' },
    { q: 'newton', a: 'Newton\'s Laws of Motion:\n1st: Objects stay at rest or in motion unless acted upon by a force.\n2nd: F = ma (Force = mass × acceleration).\n3rd: Every action has an equal and opposite reaction.' },
    { q: 'speed of light', a: 'The speed of light in a vacuum is approximately 3 × 10⁸ m/s (299,792,458 m/s).' },
    { q: 'metaphor', a: 'A metaphor is a figure of speech that directly compares two unlike things without using "like" or "as". Example: "Life is a journey."' },
    { q: 'simile', a: 'A simile compares two things using "like" or "as". Example: "She is as brave as a lion."' },
    { q: 'world war', a: 'World War I (1914–1918) was triggered by the assassination of Archduke Franz Ferdinand. World War II (1939–1945) ended with Allied victory in Europe (May 1945) and the Pacific (September 1945).' },
    { q: 'dna', a: 'DNA (Deoxyribonucleic acid) is the molecule that carries genetic information in all living organisms. It has a double helix structure and contains the instructions for building proteins.' },
    { q: 'osmosis', a: 'Osmosis is the movement of water molecules from a region of high water concentration to low water concentration through a semi-permeable membrane.' },
    { q: 'percentage', a: 'Percentage = (Part / Whole) × 100. Example: 25 out of 50 = (25/50) × 100 = 50%.' },
  ];

  for (const item of OFFLINE_QA) {
    if (lower.includes(item.q)) {
      return `📚 **${item.q.charAt(0).toUpperCase() + item.q.slice(1)}**\n\n${item.a}\n\n💡 *Tip: Practice this concept with examples to strengthen your understanding.*`;
    }
  }

  // Generic educational response
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon'];
  if (greetings.some(g => lower.includes(g))) {
    return "Hello! 👋 I'm your AI Tutor. I'm here to help you with any subject — Mathematics, Science, English, History, Geography, and more. What would you like to learn today?";
  }

  if (lower.includes('help') || lower.includes('explain') || lower.includes('what is') || lower.includes('how does') || lower.includes('why')) {
    return `Great question! Here's how I'd approach "${userMessage}":\n\n📖 **Understanding the Concept**\nEvery topic in education builds on prior knowledge. To understand this well:\n\n1. **Start with the definition** — What exactly is being asked?\n2. **Break it down** — Identify the key components.\n3. **Find examples** — Connect it to real-world situations.\n4. **Practice** — Apply the concept to problems.\n\n💡 **Study Tip**: Try explaining this concept in your own words. If you can teach it, you truly understand it!\n\n📝 For a more specific answer, try asking about a particular subject like "What is photosynthesis?" or "Explain the quadratic formula."`;
  }

  if (lower.includes('exam') || lower.includes('test') || lower.includes('study')) {
    return `📚 **Exam Preparation Tips**\n\n✅ **Before the Exam:**\n• Review your notes and textbook summaries.\n• Practice past papers and sample questions.\n• Focus on topics you find difficult.\n• Get enough sleep the night before.\n\n✅ **During the Exam:**\n• Read all questions carefully before starting.\n• Attempt easy questions first to build confidence.\n• Show all working in Mathematics and Science.\n• Manage your time — don't spend too long on one question.\n\n✅ **Key Study Strategies:**\n• Spaced repetition — review material over multiple days.\n• Active recall — test yourself instead of just re-reading.\n• Mind maps — visualise connections between concepts.\n• Teach someone else — the best way to learn is to teach.\n\n💪 You've got this! Consistent effort leads to success.`;
  }

  return `Thank you for your question! 🎓\n\nAs your AI Tutor, I'm here to help with:\n• **Mathematics** — Algebra, Geometry, Calculus, Statistics\n• **Science** — Physics, Chemistry, Biology\n• **English** — Grammar, Literature, Writing\n• **History & Geography** — Events, concepts, maps\n• **Study Skills** — Exam tips, note-taking, time management\n\nFor the best help, try asking a specific question like:\n• "What is the quadratic formula?"\n• "Explain photosynthesis"\n• "What is Newton's Second Law?"\n• "Give me exam tips for Mathematics"\n\nWhat subject would you like help with today? 📖`;
}
