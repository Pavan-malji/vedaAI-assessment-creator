import { Question, AnswerKeyItem } from './store';

// Helper to generate realistic questions and answers based on subject and question types
export function generateQuestionsForSubject(
  subject: string,
  classLevel: string,
  questionTypes: Array<{ type: string; count: number; marks: number }>,
  additionalInfo: string
): { questions: Question[]; answerKey: AnswerKeyItem[] } {
  
  const questions: Question[] = [];
  const answerKey: AnswerKeyItem[] = [];
  let qIndex = 1;

  const subLower = subject.toLowerCase();

  // Define database of mock questions for different subjects
  const scienceQuestions = {
    'Multiple Choice Questions': [
      { text: 'Which component is used to open or close an electric circuit?', answers: 'Switch (Allows or interrupts the flow of electric current).' },
      { text: 'What is the SI unit of electric potential difference?', answers: 'Volt (V).' },
      { text: 'Which of the following is an insulator?', answers: 'Rubber (Prevents flow of free electric charges).' },
      { text: 'What process describes the coating of a metal object with another metal layer using electricity?', answers: 'Electroplating.' },
      { text: 'Which gas is released at the anode during the electrolysis of water?', answers: 'Oxygen gas.' }
    ],
    'Short Questions': [
      { text: 'Explain the difference between a conductor and an insulator.', answers: 'Conductors allow electricity to flow easily (e.g. copper); insulators resist flow (e.g. plastic).' },
      { text: 'Describe what happens during electrolysis of brine solution.', answers: 'Electricity passes through brine (salt water), decomposing it into chlorine gas, hydrogen gas, and sodium hydroxide.' },
      { text: 'Why is copper widely preferred for electrical wiring?', answers: 'Copper has very low electrical resistance, is highly ductile, and is cost-effective.' },
      { text: 'Define electroplating and write its primary benefits.', answers: 'Electroplating uses electrical current to reduce metal cations to coat an object. Benefits: rust prevention, decoration, strength.' },
      { text: 'How does a fuse protect household electric appliances?', answers: 'A fuse contains a wire with a low melting point that breaks/melts if current exceeds safe limits, stopping the flow.' }
    ],
    'Diagram/Graph-Based Questions': [
      { text: 'Draw a schematic diagram of a closed electrical circuit including a battery, bulb, switch, and ammeter.', answers: 'The diagram should show the bulb lit, switch closed, ammeter in series, and arrow indicating conventional current from positive to negative terminal.' },
      { text: 'Analyze a graph plotting Current (I) vs Voltage (V) for an ohmic conductor and state the relationship.', answers: 'The graph is a straight line passing through the origin, demonstrating that current is directly proportional to voltage (Ohm\'s Law).' }
    ],
    'Numerical Problems': [
      { text: 'Calculate the resistance of a bulb that draws a current of 0.5 A when connected to a 12 V battery.', answers: 'Using Ohm\'s Law: R = V / I = 12 / 0.5 = 24 Ohms.' },
      { text: 'If 300 Coulombs of charge passes through a wire in 2 minutes, determine the electric current.', answers: 'Current I = Q / t. t = 2 * 60 = 120s. I = 300 / 120 = 2.5 Amperes.' }
    ]
  };

  const englishQuestions = {
    'Multiple Choice Questions': [
      { text: 'Identify the conjunction in the sentence: "We wanted to go, but it was raining."', answers: '"but" (Coordinating conjunction).' },
      { text: 'Which of the following is a synonym of "Benevolent"?', answers: 'Kind-hearted.' },
      { text: 'Choose the correct spelling of the word representing a written promise:', answers: 'Guarantee.' },
      { text: 'Identify the tense: "She had finished her work before he arrived."', answers: 'Past Perfect tense.' }
    ],
    'Short Questions': [
      { text: 'Rewrite the sentence in active voice: "The cake was baked by Sarah yesterday."', answers: 'Sarah baked the cake yesterday.' },
      { text: 'Explain the difference between a metaphor and a simile, giving one example of each.', answers: 'A simile compares two things using "like" or "as" ("brave as a lion"). A metaphor asserts one thing IS another ("he is a lion in battle").' },
      { text: 'What is the role of an adjective in a sentence? Provide three examples.', answers: 'An adjective describes or modifies a noun (e.g. blue sky, fast runner, tall building).' }
    ],
    'Diagram/Graph-Based Questions': [
      { text: 'Complete a story mountain diagram based on the rising action, climax, and resolution of Hamlet.', answers: 'The student diagram must correctly identify: Exposition (Ghost appears), Climax (Claudius reacts to play), Resolution (Fortinbras takes crown).' }
    ],
    'Numerical Problems': [
      { text: 'Count the adjectives and adverbs in the following paragraph and write their ratios.', answers: 'Adjectives: 6, Adverbs: 3. Ratio = 2:1.' }
    ]
  };

  // Select database based on subject
  const db = subLower.includes('english') || subLower.includes('gram') 
    ? englishQuestions 
    : scienceQuestions;

  // Loop through question configurations requested by the user
  let sectionIndex = 'Section A';
  questionTypes.forEach((config, idx) => {
    if (idx === 1) sectionIndex = 'Section B';
    if (idx === 2) sectionIndex = 'Section C';

    const typeKey = config.type as keyof typeof db;
    const available = db[typeKey] || db['Short Questions']; // Fallback to short questions

    for (let i = 0; i < config.count; i++) {
      const qTemplate = available[i % available.length];
      const qId = `gen-q-${qIndex}`;

      const difficulties: Array<'Easy' | 'Moderate' | 'Challenging'> = ['Easy', 'Moderate', 'Challenging'];
      const difficulty = difficulties[i % 3];

      questions.push({
        id: qId,
        section: sectionIndex,
        text: `${qTemplate.text} (${additionalInfo.substring(0, 15) ? 'Focus: ' + additionalInfo.substring(0, 30) + '...' : 'General Concept'})`,
        difficulty: difficulty,
        marks: config.marks
      });

      answerKey.push({
        id: qId,
        answer: qTemplate.answers
      });

      qIndex++;
    }
  });

  return { questions, answerKey };
}
