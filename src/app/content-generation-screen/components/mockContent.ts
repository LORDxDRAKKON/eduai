import { GeneratedContent, ContentType } from './types';

export const MOCK_GENERATED_CONTENT: Record<ContentType, Omit<GeneratedContent, 'topic' | 'grade' | 'subject' | 'language' | 'type' | 'generatedAt'>> = {
  story: {
    title: 'The Secret Life of a Leaf: A Photosynthesis Story',
    summary: 'Follow Sona the sunflower leaf on a magical journey through the process of photosynthesis — from capturing sunlight to producing glucose that feeds the entire plant.',
    sections: [
      {
        heading: '🌅 Morning Awakening',
        body: 'As the first rays of sunlight touched the sunflower field in Rajasthan, Sona — a bright, wide leaf on the tallest plant — began to stir. Tiny pores called stomata on her underside opened like little mouths, breathing in carbon dioxide from the warm morning air. "Time to get to work!" she thought.',
      },
      {
        heading: '☀️ Capturing the Sun',
        body: 'Deep inside Sona\'s cells were hundreds of tiny green organelles called chloroplasts. Each chloroplast was packed with a green pigment called chlorophyll — and chlorophyll had one superpower: it could trap sunlight. As the sun climbed higher, Sona\'s chloroplasts hummed with energy, absorbing red and blue light while reflecting green (which is why leaves look green to us!).',
      },
      {
        heading: '💧 The Water Highway',
        body: 'Meanwhile, far below in the roots, water molecules were being pulled up through xylem vessels — thin tubes running like highways through the stem and into every leaf vein. The water reached Sona\'s chloroplasts just in time. In a process called the light-dependent reaction, water molecules were split apart, releasing oxygen as a by-product. This oxygen drifted out through the stomata and into the air — the very oxygen we breathe.',
      },
      {
        heading: '🍬 Making Sugar',
        body: 'Using the energy captured from sunlight and the carbon dioxide breathed in, Sona\'s chloroplasts now performed the light-independent reaction (Calvin Cycle). Carbon dioxide molecules were assembled, step by step, into glucose — a simple sugar. This glucose would travel through phloem vessels to every part of the sunflower plant, feeding the roots, the stem, the flowers, and the seeds.',
      },
      {
        heading: '🌙 The Equation That Changed the World',
        body: 'By sunset, Sona had done something remarkable. She had converted the energy of sunlight into chemical energy stored in glucose. Scientists write this as: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Every plant on Earth runs this same reaction — and without it, there would be no food, no oxygen, and no life as we know it.',
      },
    ],
  },
  worksheet: {
    title: 'Photosynthesis — Practice Worksheet',
    summary: 'Test your understanding of photosynthesis with these graded questions covering the light reaction, Calvin cycle, and real-world applications.',
    sections: [
      {
        heading: 'Section A — Multiple Choice (1 mark each)',
        body: 'Questions 1–5 test recall of key concepts and terminology.',
      },
      {
        heading: 'Section B — Short Answer (3 marks each)',
        body: 'Questions 6–9 require 2–4 sentence answers explaining processes.',
      },
      {
        heading: 'Section C — Long Answer (5 marks each)',
        body: 'Questions 10–11 require detailed diagrams and explanations.',
      },
    ],
    questions: [
      { id: 'q-001', number: 1, type: 'mcq', question: 'Which organelle is responsible for photosynthesis?', options: ['Mitochondria', 'Chloroplast', 'Ribosome', 'Nucleus'], answer: 'Chloroplast', hint: 'Think about which organelle contains chlorophyll.' },
      { id: 'q-002', number: 2, type: 'mcq', question: 'What gas is released as a by-product of photosynthesis?', options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'], answer: 'Oxygen', hint: 'Water is split during the light reaction.' },
      { id: 'q-003', number: 3, type: 'mcq', question: 'Which pigment absorbs light for photosynthesis?', options: ['Carotenoid', 'Chlorophyll', 'Melanin', 'Haemoglobin'], answer: 'Chlorophyll', hint: 'This pigment gives leaves their green colour.' },
      { id: 'q-004', number: 4, type: 'mcq', question: 'The Calvin Cycle is also known as:', options: ['Light reaction', 'Dark reaction', 'Krebs cycle', 'Glycolysis'], answer: 'Dark reaction', hint: 'This cycle does not directly require light.' },
      { id: 'q-005', number: 5, type: 'mcq', question: 'Where does the light-dependent reaction occur?', options: ['Stroma', 'Thylakoid membrane', 'Cell wall', 'Cytoplasm'], answer: 'Thylakoid membrane', hint: 'Think about the inner structure of the chloroplast.' },
      { id: 'q-006', number: 6, type: 'short', question: 'Explain why leaves appear green to the human eye.', hint: 'Consider which wavelengths of light chlorophyll absorbs and which it reflects.' },
      { id: 'q-007', number: 7, type: 'short', question: 'Write the balanced chemical equation for photosynthesis and label each component.', hint: 'Reactants are CO₂ and H₂O; products are glucose and O₂.' },
      { id: 'q-008', number: 8, type: 'short', question: 'What is the role of stomata in photosynthesis?', hint: 'Think about gas exchange and water vapour.' },
      { id: 'q-009', number: 9, type: 'short', question: 'Distinguish between the light reaction and the Calvin Cycle in terms of location and products.', hint: 'Use the terms thylakoid and stroma.' },
      { id: 'q-010', number: 10, type: 'long', question: 'With the help of a labelled diagram, describe the structure of a chloroplast and explain how its structure is related to its function in photosynthesis.' },
      { id: 'q-011', number: 11, type: 'long', question: 'A plant is kept in a dark room for 48 hours. Predict and explain the changes that would occur in its leaves, using your knowledge of photosynthesis and cellular respiration.' },
    ],
  },
  problem: {
    title: 'Projectile Motion — Worked Examples & Problem Set',
    summary: 'Master projectile motion through 4 fully worked examples and 8 practice problems, covering horizontal launches, angled launches, and real-world applications.',
    sections: [
      {
        heading: '📐 Key Formulas to Remember',
        body: 'Horizontal: x = u·cos(θ)·t\nVertical: y = u·sin(θ)·t − ½gt²\nTime of flight: T = 2u·sin(θ)/g\nRange: R = u²·sin(2θ)/g\nMax height: H = u²·sin²(θ)/2g\n\nWhere: u = initial velocity, θ = angle of projection, g = 9.8 m/s²',
      },
      {
        heading: '✅ Worked Example 1 — Horizontal Projection',
        body: 'A ball is thrown horizontally from a cliff of height 80 m with velocity 15 m/s. Find: (a) time to reach ground, (b) horizontal distance covered.\n\nSolution:\n(a) Using y = ½gt²:\n80 = ½ × 9.8 × t²\nt² = 80/4.9 = 16.32\nt = 4.04 seconds\n\n(b) x = u × t = 15 × 4.04 = 60.6 metres',
      },
      {
        heading: '✅ Worked Example 2 — Angled Projection',
        body: 'A cricket ball is hit at 30 m/s at 45° above horizontal. Find the maximum height and range.\n\nSolution:\nH = u²·sin²(θ)/2g = (30²×sin²45°)/(2×9.8)\n= (900×0.5)/19.6 = 22.96 m ≈ 23 m\n\nR = u²·sin(2θ)/g = (900×sin90°)/9.8\n= 900/9.8 = 91.8 m',
      },
      {
        heading: '📝 Practice Problems',
        body: '1. A stone is thrown horizontally from a 45 m tall building at 20 m/s. How far from the base does it land?\n2. A ball is projected at 25 m/s at 30°. Find: time of flight, max height, range.\n3. Two balls are thrown simultaneously — one horizontal at 10 m/s, one vertical. Which hits the ground first? Explain.\n4. A goalkeeper kicks a ball at 18 m/s at 40°. Can it clear a 2.4 m wall that is 20 m away?\n5. A rocket is fired at 60° with speed 200 m/s. Find its velocity at maximum height.',
      },
    ],
  },
  video: {
    title: 'Cell Division: Mitosis — Scene-by-Scene Visual Lesson',
    summary: 'A 5-scene visual lesson walking through the complete process of mitosis, from interphase to cytokinesis, with detailed narration and key vocabulary.',
    sections: [
      { heading: 'Scene Overview', body: '5 scenes covering: Interphase → Prophase → Metaphase → Anaphase → Telophase & Cytokinesis' },
    ],
    scenes: [
      { id: 'scene-001', title: 'Scene 1: Interphase — The Preparation Stage', description: 'A cell nucleus with duplicating chromosomes, DNA strands replicating, cell growing in size. Bright, educational illustration style.', narration: 'Before a cell can divide, it must prepare. During interphase, the cell grows, duplicates its DNA, and produces proteins needed for division. Each chromosome is copied, creating sister chromatids joined at the centromere. The cell is now ready to divide.', imagePrompt: 'Educational biology diagram of animal cell during interphase, large nucleus with condensing chromatin, nucleolus visible, smooth ER and ribosomes, bright blue and purple colour scheme, clean vector style' },
      { id: 'scene-002', title: 'Scene 2: Prophase — Chromosomes Appear', description: 'Chromosomes condensing and becoming visible, nuclear envelope dissolving, spindle fibres forming.', narration: 'In prophase, the duplicated chromosomes condense and become visible under a microscope. The nuclear envelope breaks down, and spindle fibres begin to form from the centrioles. This marks the official start of mitosis.', imagePrompt: 'Educational biology diagram of animal cell in prophase, condensed chromosomes visible as X shapes, nuclear envelope dissolving, spindle fibres beginning to form from centrioles, bright educational illustration, orange and purple colours' },
      { id: 'scene-003', title: 'Scene 3: Metaphase — Chromosomes Align', description: 'Chromosomes lined up at the cell equator, spindle fibres attached to centromeres.', narration: 'During metaphase, the spindle fibres attach to the centromere of each chromosome and pull them to the middle of the cell — called the metaphase plate or cell equator. This is the easiest stage to count chromosomes!', imagePrompt: 'Educational biology diagram of animal cell in metaphase, chromosomes aligned at cell equator, clear spindle fibres attached to centromeres, cell plate visible as dotted line, bright teal and white educational illustration style' },
      { id: 'scene-004', title: 'Scene 4: Anaphase — Chromosomes Separate', description: 'Sister chromatids being pulled apart to opposite poles of the cell.', narration: 'In anaphase, the spindle fibres shorten and pull the sister chromatids apart, moving them to opposite poles of the cell. The cell begins to elongate. By the end of anaphase, each pole has a complete set of chromosomes.', imagePrompt: 'Educational biology diagram of animal cell in anaphase, sister chromatids being pulled to opposite poles, spindle fibres shortening, cell elongating, V-shaped chromosome movement, dynamic motion lines, green and purple educational illustration' },
      { id: 'scene-005', title: 'Scene 5: Telophase & Cytokinesis — Two New Cells', description: 'Nuclear envelopes reforming around two sets of chromosomes, cell dividing into two daughter cells.', narration: 'In telophase, nuclear envelopes reform around each set of chromosomes, and the chromosomes begin to decondense. Finally, in cytokinesis, the cytoplasm divides, producing two genetically identical daughter cells — each with the same number of chromosomes as the original parent cell.', imagePrompt: 'Educational biology diagram of animal cell in telophase and cytokinesis, two daughter cells forming, cleavage furrow visible, two new nuclei forming, chromosomes decondensing, warm yellow and blue educational illustration style, cell division complete' },
    ],
  },
};