import { create } from 'zustand';

export interface Question {
  id: string;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  section: string;
}

export interface AnswerKeyItem {
  id: string;
  answer: string;
}

export interface Assignment {
  id: string;
  title: string;
  assignedDate: string;
  dueDate: string;
  status: 'draft' | 'published';
  subject: string;
  class: string;
  schoolName: string;
  timeAllowed: string;
  maxMarks: number;
  additionalInfo: string;
  fileUploaded: { name: string; size: string } | null;
  questionTypes: Array<{ type: string; count: number; marks: number }>;
  questions: Question[];
  answerKey: AnswerKeyItem[];
}

interface VedaStore {
  assignments: Assignment[];
  searchQuery: string;
  selectedFilter: string;
  wsStatus: 'idle' | 'connecting' | 'processing' | 'completed' | 'failed';
  wsLogs: string[];
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: string) => void;
  addAssignment: (assignment: Assignment) => void;
  deleteAssignment: (id: string) => void;
  triggerGeneration: (assignmentId: string, callback?: () => void) => void;
  resetWs: () => void;
}

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1',
    title: 'Quiz on Electricity',
    assignedDate: '20-06-2025',
    dueDate: '21-06-2025',
    status: 'published',
    subject: 'English',
    class: '5th',
    schoolName: 'Delhi Public School, Sector-4, Bokaro',
    timeAllowed: '45 minutes',
    maxMarks: 20,
    additionalInfo: 'Generate short answer questions focused on electroplating, conductors, and basic chemical effects of electricity.',
    fileUploaded: { name: 'electricity_notes.pdf', size: '2.4 MB' },
    questionTypes: [
      { type: 'Short Questions', count: 10, marks: 2 }
    ],
    questions: [
      { id: 'q-1', section: 'Section A', text: 'Define electroplating. Explain its purpose.', difficulty: 'Easy', marks: 2 },
      { id: 'q-2', section: 'Section A', text: 'What is the role of a conductor in the process of electrolysis?', difficulty: 'Moderate', marks: 2 },
      { id: 'q-3', section: 'Section A', text: 'Why does a solution of copper sulfate conduct electricity?', difficulty: 'Easy', marks: 2 },
      { id: 'q-4', section: 'Section A', text: 'Describe one example of the chemical effect of electric current in daily life.', difficulty: 'Moderate', marks: 2 },
      { id: 'q-5', section: 'Section A', text: 'Explain why electric current is said to have chemical effects.', difficulty: 'Moderate', marks: 2 },
      { id: 'q-6', section: 'Section A', text: 'How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.', difficulty: 'Challenging', marks: 2 },
      { id: 'q-7', section: 'Section A', text: 'What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.', difficulty: 'Challenging', marks: 2 },
      { id: 'q-8', section: 'Section A', text: 'Mention the type of current used in electroplating and justify why it is used.', difficulty: 'Easy', marks: 2 },
      { id: 'q-9', section: 'Section A', text: 'What is the importance of electric current in the field of metallurgy?', difficulty: 'Moderate', marks: 2 },
      { id: 'q-10', section: 'Section A', text: 'Explain with a chemical equation how copper is deposited during the electroplating of an object.', difficulty: 'Challenging', marks: 2 }
    ],
    answerKey: [
      { id: 'q-1', answer: 'Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.' },
      { id: 'q-2', answer: 'A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes.' },
      { id: 'q-3', answer: 'Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity.' },
      { id: 'q-4', answer: 'An example is the electroplating of silver on jewelry to prevent tarnishing.' },
      { id: 'q-5', answer: 'Electric current causes the movement of ions leading to chemical changes at the electrodes, hence it shows chemical effects.' },
      { id: 'q-6', answer: 'Sodium hydroxide is formed at the cathode during brine electrolysis as water gains electrons: 2H2O + 2e- -> H2 + 2OH-, Na+ + OH- -> NaOH (in solution).' },
      { id: 'q-7', answer: 'At the cathode: water is reduced to hydrogen gas and hydroxide ions. At the anode: water is oxidized to oxygen gas and hydrogen ions.' },
      { id: 'q-8', answer: 'Direct current (DC) is used in electroplating to ensure a continuous and unidirectional flow of metal ions from the anode to the cathode.' },
      { id: 'q-9', answer: 'Electric current is vital in electrometallurgy for refining metals like copper and extracting metals like aluminum from their ores.' },
      { id: 'q-10', answer: 'Copper ions (Cu2+) in solution are reduced at the cathode: Cu2+ + 2e- -> Cu(s), coating the object with a solid copper layer.' }
    ]
  },
  {
    id: 'assign-2',
    title: 'Science Assessment: Light & Shadow',
    assignedDate: '15-06-2025',
    dueDate: '25-06-2025',
    status: 'published',
    subject: 'Science',
    class: '6th',
    schoolName: 'Delhi Public School, Sector-4, Bokaro',
    timeAllowed: '60 minutes',
    maxMarks: 30,
    additionalInfo: 'Cover luminous and non-luminous objects, pinhole cameras, and reflection.',
    fileUploaded: null,
    questionTypes: [
      { type: 'Multiple Choice Questions', count: 5, marks: 2 },
      { type: 'Short Questions', count: 5, marks: 4 }
    ],
    questions: [
      { id: 's-1', section: 'Section A', text: 'Which of the following is a non-luminous body?', difficulty: 'Easy', marks: 2 },
      { id: 's-2', section: 'Section A', text: 'What is the shape of the image formed in a pinhole camera?', difficulty: 'Moderate', marks: 2 },
      { id: 's-3', section: 'Section B', text: 'Explain the difference between transparent, translucent, and opaque objects.', difficulty: 'Easy', marks: 4 },
      { id: 's-4', section: 'Section B', text: 'How are shadows formed? What are the essential conditions for shadow formation?', difficulty: 'Moderate', marks: 4 }
    ],
    answerKey: [
      { id: 's-1', answer: 'The Moon (it only reflects light from the Sun).' },
      { id: 's-2', answer: 'Real, inverted, and generally smaller than the object.' },
      { id: 's-3', answer: 'Transparent objects allow all light to pass (glass). Translucent objects allow partial light (butter paper). Opaque objects block all light (wood).' },
      { id: 's-4', answer: 'Shadows are formed when an opaque object blocks the path of light. Essential conditions: a source of light, an opaque object, and a screen.' }
    ]
  }
];

export const useVedaStore = create<VedaStore>((set) => ({
  assignments: INITIAL_ASSIGNMENTS,
  searchQuery: '',
  selectedFilter: 'All',
  wsStatus: 'idle',
  wsLogs: [],

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedFilter: (filter) => set({ selectedFilter: filter }),

  addAssignment: (assignment) =>
    set((state) => ({
      assignments: [assignment, ...state.assignments],
    })),

  deleteAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
    })),

  resetWs: () => set({ wsStatus: 'idle', wsLogs: [] }),

  triggerGeneration: (assignmentId, callback) => {
    set({ wsStatus: 'connecting', wsLogs: ['[WebSocket] Connecting to backend queue...'] });

    setTimeout(() => {
      set((state) => ({
        wsLogs: [...state.wsLogs, '[WebSocket] Connected. Handshake successful.', '[Queue] Creating BullMQ job for assignment ID: ' + assignmentId],
        wsStatus: 'processing',
      }));

      setTimeout(() => {
        set((state) => ({
          wsLogs: [...state.wsLogs, '[Worker] Fetching job from Redis cache...', '[Worker] Analyzing attachment/instructions...', '[AI] Sending structured prompt to LLM (Claude-3.5-Sonnet)...'],
        }));

        setTimeout(() => {
          set((state) => ({
            wsLogs: [
              ...state.wsLogs,
              '[AI] Question patterns generated successfully.',
              '[Worker] Parsing questions into Section A and Answer Keys...',
              '[Worker] Compiling formatting templates for PDF output...',
            ],
          }));

          setTimeout(() => {
            set((state) => ({
              wsLogs: [...state.wsLogs, '[Database] Saving generated assessment...', '[WebSocket] Broadcaster sending update event...'],
              wsStatus: 'completed',
            }));
            if (callback) callback();
          }, 1200);
        }, 1500);
      }, 1200);
    }, 1000);
  },
}));
