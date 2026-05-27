export interface AssignmentConfig {
  subject: string;
  topic: string;
  dueDate: string;
  questionTypes: string[];
  numberOfQuestions: number;
  marksPerQuestion: number;
  totalMarks: number;
  additionalInstructions: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface QuestionPaper {
  sections: Section[];
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
