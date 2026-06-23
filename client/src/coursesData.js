export const initialCourses = [
  {
    id: 'cs101',
    code: 'CS-101',
    name: 'Introduction to Artificial Intelligence',
    department: 'Computer Science',
    instructor: 'Dr. Evelyn Carter',
    credits: 4,
    timing: 'Mon/Wed 10:00 AM - 11:30 AM',
    dayCodes: ['Mon', 'Wed'],
    startTime: '10:00',
    endTime: '11:30',
    seatsAvailable: 12,
    totalSeats: 35,
    description: 'Explore the fundamental concepts of AI, including machine learning algorithms, neural networks, heuristic search, and cognitive computing models.',
    syllabus: [
      'Week 1: Foundations of Artificial Intelligence',
      'Week 2: Search Algorithms & Decision Making',
      'Week 3: Machine Learning & Classification Models',
      'Week 4: Neural Networks & Deep Learning Intro'
    ],
    modules: [
      {
        id: 'cs101-m1',
        title: 'Module 1: The Turing Test & AI History',
        content: `
### Foundations of AI: The Turing Test & Early History

Artificial Intelligence (AI) began as a formal academic field in 1956. Alan Turing proposed the "Imitation Game" (now known as the Turing Test) in 1950 to answer the question: *"Can machines think?"*

#### Key Concepts:
1. **The Turing Test**: A test of a machine's ability to exhibit intelligent behavior equivalent to, or indistinguishable from, that of a human.
2. **Dartmouth Workshop (1956)**: Where the term "Artificial Intelligence" was coined by John McCarthy.
3. **Symbolic AI**: Early AI research focusing on rule-based logical systems.
4. **AI Winters**: Periods of reduced funding and interest due to overhyped expectations.
        `,
        quiz: {
          question: 'Who coined the term "Artificial Intelligence" and when?',
          options: [
            'Alan Turing in 1950',
            'John McCarthy in 1956',
            'Ada Lovelace in 1843',
            'Herbert Simon in 1965'
          ],
          correctIndex: 1
        }
      },
      {
        id: 'cs101-m2',
        title: 'Module 2: Heuristic Search & Pathfinding',
        content: `
### Search Algorithms in AI

Search techniques are essential for decision making and pathfinding in games, maps, and optimization problems.

#### Key Search Strategies:
- **Uninformed Search**: Breadth-First Search (BFS) and Depth-First Search (DFS) explore states without domain-specific knowledge.
- **Informed (Heuristic) Search**: Uses a heuristic function $h(n)$ to estimate the cost from node $n$ to the goal.
- **A* Search**: Evaluates nodes by combining the path cost $g(n)$ and the heuristic cost $h(n)$:
  $$f(n) = g(n) + h(n)$$
  *A* is guaranteed to be optimal if the heuristic is admissible (never overestimates the actual cost).
        `,
        quiz: {
          question: 'What formula does the A* Search algorithm use to evaluate node cost?',
          options: [
            'f(n) = g(n) * h(n)',
            'f(n) = g(n) - h(n)',
            'f(n) = g(n) + h(n)',
            'f(n) = h(n)'
          ],
          correctIndex: 2
        }
      }
    ]
  },
  {
    id: 'math204',
    code: 'MATH-204',
    name: 'Linear Algebra & High-Dimensional Spaces',
    department: 'Mathematics',
    instructor: 'Prof. Marcus Vance',
    credits: 3,
    timing: 'Tue/Thu 1:00 PM - 2:30 PM',
    dayCodes: ['Tue', 'Thu'],
    startTime: '13:00',
    endTime: '14:30',
    seatsAvailable: 5,
    totalSeats: 25,
    description: 'An advanced look at vector spaces, inner products, eigenvalues, eigenvectors, matrix decompositions, and their applications in data science.',
    syllabus: [
      'Week 1: Vector Spaces & Linear Independence',
      'Week 2: Linear Transformations & Matrices',
      'Week 3: Eigenvalues, Eigenvectors, & Diagonalization',
      'Week 4: Singular Value Decomposition (SVD)'
    ],
    modules: [
      {
        id: 'math204-m1',
        title: 'Module 1: Eigenvectors & Eigenvalues',
        content: `
### Eigenvectors and Eigenvalues

In linear algebra, a linear transformation can be represented by a matrix $A$. An **eigenvector** is a non-zero vector $v$ that changes only by a scalar factor when that linear transformation is applied.

#### Mathematical Definition:
$$A v = \\lambda v$$

Where:
- $A$ is an $n \\times n$ square matrix.
- $v$ is the eigenvector.
- $\\lambda$ is the eigenvalue (a scalar).

#### Physical Intuition:
Eigenvectors point in directions where the matrix transformation acts as a simple stretching or shrinking.
        `,
        quiz: {
          question: 'For a matrix A, eigenvector v, and eigenvalue λ, which equation is correct?',
          options: [
            'A v = λ + v',
            'A v = λ v',
            'A λ = v',
            'A v = v / λ'
          ],
          correctIndex: 1
        }
      }
    ]
  },
  {
    id: 'phys302',
    code: 'PHYS-302',
    name: 'Quantum Mechanics & Wave Theory',
    department: 'Physics',
    instructor: 'Dr. Neil Bohr',
    credits: 4,
    timing: 'Mon/Wed 2:00 PM - 3:30 PM',
    dayCodes: ['Mon', 'Wed'],
    startTime: '14:00',
    endTime: '15:30',
    seatsAvailable: 15,
    totalSeats: 30,
    description: 'Introductory course on quantum physics. Topics cover wave-particle duality, Schrödinger equation, wave functions, quantum states, and spin.',
    syllabus: [
      'Week 1: Blackbody Radiation & Photoelectric Effect',
      'Week 2: Wave Functions & Schrödinger Equation',
      'Week 3: Quantum Harmonic Oscillator',
      'Week 4: Quantum Entanglement & Bell\'s Theorem'
    ],
    modules: [
      {
        id: 'phys302-m1',
        title: 'Module 1: Wave-Particle Duality',
        content: `
### Wave-Particle Duality

Wave-particle duality is the concept that every particle or quantum entity may be described as either a particle or a wave. It addresses the inability of classical concepts like "particle" or "wave" to fully describe quantum-scale objects.

#### Double-Slit Experiment:
When coherent light or electrons pass through two closely spaced slits, they produce an interference pattern characteristic of waves. However, if detectors are placed at the slits to observe which slit the particle passes through, the interference pattern disappears, and they behave as classical particles.
        `,
        quiz: {
          question: 'What happens to the double-slit interference pattern if we observe which slit each particle passes through?',
          options: [
            'The pattern becomes brighter',
            'The pattern stays the same',
            'The pattern disappears, and particles behave classically',
            'The particles bounce backwards'
          ],
          correctIndex: 2
        }
      }
    ]
  },
  {
    id: 'lit150',
    code: 'LIT-150',
    name: 'Modernist Literature & Narrative Form',
    department: 'Literature',
    instructor: 'Prof. Sylvia Plath',
    credits: 3,
    timing: 'Tue/Thu 10:00 AM - 11:30 AM',
    dayCodes: ['Tue', 'Thu'],
    startTime: '10:00',
    endTime: '11:30',
    seatsAvailable: 2,
    totalSeats: 20,
    description: 'Analyze the experiments in stream of consciousness, fragmented narratives, and psychological realism characteristic of modernist literature.',
    syllabus: [
      'Week 1: Stream of Consciousness Techniques',
      'Week 2: Virginia Woolf\'s "To the Lighthouse"',
      'Week 3: James Joyce & Experimental Styles',
      'Week 4: Post-war disillusionment and poetry'
    ],
    modules: [
      {
        id: 'lit150-m1',
        title: 'Module 1: Stream of Consciousness',
        content: `
### Stream of Consciousness

Stream of consciousness is a narrative mode or method that attempts to depict the multitudinous thoughts and feelings which pass through the mind of a character.

#### Key Writers:
- **Virginia Woolf**: Used it to capture subjective experiences and temporal flow.
- **James Joyce**: Pushed the boundaries of syntax and interior monologue in *Ulysses*.
- **William Faulkner**: Leveraged multiple internal narratives to represent subjective memory.
        `,
        quiz: {
          question: 'Which author is widely celebrated for writing "To the Lighthouse" using interior monologue and subjective time?',
          options: [
            'F. Scott Fitzgerald',
            'Virginia Woolf',
            'Ernest Hemingway',
            'Leo Tolstoy'
          ],
          correctIndex: 1
        }
      }
    ]
  }
];
